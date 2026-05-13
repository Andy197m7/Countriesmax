"""
PopulationMax — AWS Glue ETL Job
Runs as a Glue PySpark job triggered after S3 data uploads.

Job flow:
  1. Read raw data.json from S3 landing zone
  2. Flatten nested records into a partitioned Parquet dataset
  3. Compute country-level aggregate stats
  4. Write processed tables back to S3 (curated zone)
  5. Update Glue Data Catalog table metadata

AWS Glue entry point: main() is called by the Glue job runner.
Local testing: python glue_etl.py --local (uses local data.json)

IAM permissions required:
  s3:GetObject, s3:PutObject on the landing + curated buckets
  glue:UpdateTable, glue:GetTable on the catalog database
"""

import json
import sys
import os
from datetime import datetime, timezone

# ── Detect environment ───────────────────────────────────────────────────────
RUNNING_LOCAL = "--local" in sys.argv

if not RUNNING_LOCAL:
    from awsglue.transforms import *
    from awsglue.utils import getResolvedOptions
    from awsglue.context import GlueContext
    from awsglue.job import Job
    from pyspark.context import SparkContext
    import boto3

import pandas as pd
import numpy as np

# ── Job parameters ────────────────────────────────────────────────────────────

DEFAULTS = {
    "landing_bucket":  "populationmax-landing",
    "curated_bucket":  "populationmax-curated",
    "glue_database":   "populationmax_db",
    "data_key":        "raw/data.json",
    "local_data_path": "data.json",
}


def get_params() -> dict:
    if RUNNING_LOCAL:
        return DEFAULTS.copy()
    args = getResolvedOptions(sys.argv, [
        "JOB_NAME",
        "landing_bucket",
        "curated_bucket",
        "glue_database",
    ])
    return {**DEFAULTS, **args}


# ── S3 helpers ────────────────────────────────────────────────────────────────

def read_json_from_s3(bucket: str, key: str) -> dict:
    s3 = boto3.client("s3")
    obj = s3.get_object(Bucket=bucket, Key=key)
    return json.loads(obj["Body"].read().decode("utf-8"))


def write_parquet_to_s3(df: pd.DataFrame, bucket: str, key_prefix: str,
                         partition_col: str | None = None) -> None:
    import io, boto3
    s3 = boto3.client("s3")
    if partition_col:
        for val, grp in df.groupby(partition_col):
            buf = io.BytesIO()
            grp.drop(columns=[partition_col]).to_parquet(buf, index=False)
            buf.seek(0)
            key = f"{key_prefix}/{partition_col}={val}/data.parquet"
            s3.put_object(Bucket=bucket, Key=key, Body=buf.read())
            print(f"[S3] wrote s3://{bucket}/{key}  ({len(grp)} rows)")
    else:
        buf = io.BytesIO()
        df.to_parquet(buf, index=False)
        buf.seek(0)
        s3.put_object(Bucket=bucket, Key=f"{key_prefix}/data.parquet", Body=buf.read())
        print(f"[S3] wrote s3://{bucket}/{key_prefix}/data.parquet  ({len(df)} rows)")


# ── Transformation logic ──────────────────────────────────────────────────────

def flatten_countries(raw: dict) -> pd.DataFrame:
    df = pd.DataFrame(raw["countries"])
    numeric = ["medianAge", "growthCIA", "growthWB", "growthUN",
               "lifeExpectancy", "netMigration"]
    for col in numeric:
        df[col] = pd.to_numeric(df.get(col), errors="coerce")
    df["growthConsensus"] = df[["growthCIA", "growthWB", "growthUN"]].mean(axis=1)
    df["etl_timestamp"]   = datetime.now(timezone.utc).isoformat()
    return df


def flatten_records(raw: dict, countries_df: pd.DataFrame) -> pd.DataFrame:
    region_map = countries_df.set_index("code")[["region", "subregion"]].to_dict("index")
    rows = []
    for code, recs in raw["records"].items():
        meta = region_map.get(code, {})
        for r in recs:
            rows.append({
                "code":       code,
                "year":       int(r["year"]),
                "population": int(r["population"]),
                "region":     meta.get("region", "Unknown"),
                "subregion":  meta.get("subregion", "Unknown"),
            })
    df = pd.DataFrame(rows).sort_values(["code", "year"]).reset_index(drop=True)

    # Year-over-year absolute change and CAGR
    df["pop_prev"]  = df.groupby("code")["population"].shift(1)
    df["year_prev"] = df.groupby("code")["year"].shift(1)
    mask = df["pop_prev"].notna() & ((df["year"] - df["year_prev"]) > 0)
    df.loc[mask, "decade_cagr"] = df.loc[mask].apply(
        lambda r: (r.population / r.pop_prev) ** (1.0 / (r.year - r.year_prev)) - 1,
        axis=1,
    )
    df.drop(columns=["pop_prev", "year_prev"], inplace=True)
    df["etl_timestamp"] = datetime.now(timezone.utc).isoformat()
    return df


def compute_aggregates(records_df: pd.DataFrame) -> pd.DataFrame:
    hist = records_df[records_df["year"] <= 2024]
    agg = (
        hist.groupby(["region", "year"])
        .agg(
            total_population=("population", "sum"),
            country_count   =("code",       "nunique"),
            mean_cagr       =("decade_cagr","mean"),
        )
        .reset_index()
    )
    agg["etl_timestamp"] = datetime.now(timezone.utc).isoformat()
    return agg


# ── Glue Catalog update ───────────────────────────────────────────────────────

def update_glue_catalog(database: str, table: str, s3_location: str,
                        columns: list[dict]) -> None:
    if RUNNING_LOCAL:
        print(f"[CATALOG] (local) would update {database}.{table} → {s3_location}")
        return
    glue = boto3.client("glue")
    try:
        glue.update_table(
            DatabaseName=database,
            TableInput={
                "Name": table,
                "StorageDescriptor": {
                    "Columns": columns,
                    "Location": s3_location,
                    "InputFormat":  "org.apache.hadoop.mapred.TextInputFormat",
                    "OutputFormat": "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat",
                    "SerdeInfo": {"SerializationLibrary": "org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe"},
                },
            },
        )
        print(f"[CATALOG] updated {database}.{table}")
    except glue.exceptions.EntityNotFoundException:
        print(f"[CATALOG] table {database}.{table} not found – skipping update")


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    params = get_params()
    print("[JOB] PopulationMax Glue ETL  –  params:", params)

    # 1 – Ingest
    if RUNNING_LOCAL:
        with open(params["local_data_path"]) as f:
            raw = json.load(f)
    else:
        raw = read_json_from_s3(params["landing_bucket"], params["data_key"])

    print(f"[INGEST] {len(raw['countries'])} countries, "
          f"{sum(len(v) for v in raw['records'].values())} records")

    # 2 – Transform
    countries_df  = flatten_countries(raw)
    records_df    = flatten_records(raw, countries_df)
    aggregates_df = compute_aggregates(records_df)

    print("[TRANSFORM] shapes — countries:", countries_df.shape,
          " records:", records_df.shape, " aggregates:", aggregates_df.shape)

    # 3 – Export
    if RUNNING_LOCAL:
        os.makedirs("glue_output", exist_ok=True)
        countries_df.to_parquet("glue_output/countries.parquet", index=False)
        records_df.to_parquet("glue_output/records.parquet", index=False)
        aggregates_df.to_parquet("glue_output/aggregates.parquet", index=False)
        print("[EXPORT] wrote glue_output/  (local mode)")
    else:
        cb = params["curated_bucket"]
        write_parquet_to_s3(countries_df,  cb, "countries")
        write_parquet_to_s3(records_df,    cb, "records",    partition_col="region")
        write_parquet_to_s3(aggregates_df, cb, "aggregates")

        # 4 – Catalog update
        db = params["glue_database"]
        update_glue_catalog(db, "countries",  f"s3://{cb}/countries/",
            [{"Name": c, "Type": "string"} for c in countries_df.columns])
        update_glue_catalog(db, "records",    f"s3://{cb}/records/",
            [{"Name": c, "Type": "string"} for c in records_df.columns])
        update_glue_catalog(db, "aggregates", f"s3://{cb}/aggregates/",
            [{"Name": c, "Type": "string"} for c in aggregates_df.columns])

    # Sample output for CloudWatch logs
    print("\n── Regional population 2024 ──────────────────────────────")
    pop2024 = aggregates_df[aggregates_df["year"] == 2024].sort_values(
        "total_population", ascending=False)
    print(pop2024[["region", "total_population", "country_count"]].to_string(index=False))

    print("\n[JOB] complete.")


if __name__ == "__main__":
    main()
