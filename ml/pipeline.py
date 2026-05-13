"""
PopulationMax — Data Pipeline
AWS S3 + Glue-compatible ETL using Pandas and NumPy.

Pipeline stages:
  1. Ingest   – load raw JSON from S3 (or local fallback)
  2. Transform – normalize, clean, compute derived metrics
  3. Enrich   – rolling growth rates, density estimates, regional aggregates
  4. Export   – write cleaned Parquet/CSV back to S3 (or local output)

Usage:
  python pipeline.py [--source s3|local] [--bucket my-bucket] [--output ./out]
"""

import argparse
import json
import os
import sys
from pathlib import Path

import numpy as np
import pandas as pd

# ──────────────────────────────────────────────
# 1. INGEST
# ──────────────────────────────────────────────

def load_from_s3(bucket: str, key: str = "data.json") -> dict:
    """Download raw JSON dataset from an S3 bucket."""
    try:
        import boto3
        s3 = boto3.client("s3")
        obj = s3.get_object(Bucket=bucket, Key=key)
        return json.loads(obj["Body"].read())
    except ImportError:
        raise RuntimeError("boto3 not installed – run: pip install boto3")


def load_local(path: str = "data.json") -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def ingest(source: str = "local", bucket: str = "", data_path: str = "data.json") -> dict:
    print(f"[INGEST] source={source}")
    if source == "s3":
        raw = load_from_s3(bucket)
    else:
        raw = load_local(data_path)
    print(f"[INGEST] loaded {len(raw['countries'])} countries, "
          f"{sum(len(v) for v in raw['records'].values())} records")
    return raw


# ──────────────────────────────────────────────
# 2. TRANSFORM
# ──────────────────────────────────────────────

def build_countries_df(raw: dict) -> pd.DataFrame:
    df = pd.DataFrame(raw["countries"])
    # Cast numeric columns safely
    numeric_cols = ["medianAge", "growthCIA", "growthWB", "growthUN",
                    "lifeExpectancy", "netMigration"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Consensus growth rate: mean of the three sources, ignoring NaN
    df["growthConsensus"] = df[["growthCIA", "growthWB", "growthUN"]].mean(axis=1)

    # Net migration as fraction of population (requires joining records later)
    df["netMigration"] = df["netMigration"].fillna(0).astype(np.int64)

    df.set_index("code", inplace=True)
    return df


def build_records_df(raw: dict) -> pd.DataFrame:
    rows = []
    for code, records in raw["records"].items():
        for r in records:
            rows.append({"code": code, "year": int(r["year"]),
                         "population": int(r["population"])})
    df = pd.DataFrame(rows)
    df.sort_values(["code", "year"], inplace=True)
    df.reset_index(drop=True, inplace=True)
    return df


# ──────────────────────────────────────────────
# 3. ENRICH
# ──────────────────────────────────────────────

def compute_cagr(pop_start: float, pop_end: float, years: int) -> float:
    """Compound annual growth rate."""
    if pop_start <= 0 or years <= 0:
        return np.nan
    return (pop_end / pop_start) ** (1.0 / years) - 1.0


def enrich_records(records_df: pd.DataFrame) -> pd.DataFrame:
    """Add decade-over-decade CAGR and absolute change columns."""
    df = records_df.copy()

    df["pop_prev"] = df.groupby("code")["population"].shift(1)
    df["year_prev"] = df.groupby("code")["year"].shift(1)
    df["decade_span"] = df["year"] - df["year_prev"]

    mask = df["pop_prev"].notna() & (df["decade_span"] > 0)
    df.loc[mask, "cagr"] = df.loc[mask].apply(
        lambda row: compute_cagr(row["pop_prev"], row["population"],
                                 int(row["decade_span"])),
        axis=1,
    )
    df["abs_change"] = df["population"] - df["pop_prev"]
    df.drop(columns=["pop_prev", "year_prev"], inplace=True)
    return df


def compute_regional_aggregates(
    records_df: pd.DataFrame,
    countries_df: pd.DataFrame,
) -> pd.DataFrame:
    """Sum population by region × year (historical records only, ≤2024)."""
    hist = records_df[records_df["year"] <= 2024].copy()
    hist = hist.join(countries_df[["region"]], on="code")
    regional = (
        hist.groupby(["region", "year"])["population"]
        .sum()
        .reset_index()
        .rename(columns={"population": "total_population"})
    )
    return regional


def flag_outliers(records_df: pd.DataFrame, z_threshold: float = 3.0) -> pd.DataFrame:
    """Flag year-over-year population changes that are statistical outliers."""
    df = records_df.copy()
    changes = df["abs_change"].dropna()
    mean, std = changes.mean(), changes.std()
    df["outlier"] = np.abs(df["abs_change"] - mean) > z_threshold * std
    return df


# ──────────────────────────────────────────────
# 4. EXPORT
# ──────────────────────────────────────────────

def export_local(df_map: dict[str, pd.DataFrame], output_dir: str) -> None:
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    for name, df in df_map.items():
        path_csv = out / f"{name}.csv"
        path_parquet = out / f"{name}.parquet"
        df.to_csv(path_csv, index=True)
        try:
            df.to_parquet(path_parquet, index=True)
            print(f"[EXPORT] {name} → {path_csv} + {path_parquet}")
        except ImportError:
            print(f"[EXPORT] {name} → {path_csv} (pyarrow not available, skipped parquet)")


def export_s3(df_map: dict[str, pd.DataFrame], bucket: str, prefix: str = "processed/") -> None:
    import boto3, io
    s3 = boto3.client("s3")
    for name, df in df_map.items():
        buf = io.BytesIO()
        df.to_parquet(buf, index=True)
        buf.seek(0)
        key = f"{prefix}{name}.parquet"
        s3.put_object(Bucket=bucket, Key=key, Body=buf.read())
        print(f"[EXPORT-S3] s3://{bucket}/{key}")


# ──────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────

def run(source: str = "local", bucket: str = "", data_path: str = "data.json",
        output_dir: str = "./pipeline_output") -> None:

    # 1 – Ingest
    raw = ingest(source, bucket, data_path)

    # 2 – Transform
    print("[TRANSFORM] building DataFrames …")
    countries_df = build_countries_df(raw)
    records_df   = build_records_df(raw)

    # 3 – Enrich
    print("[ENRICH] computing growth metrics …")
    records_df   = enrich_records(records_df)
    records_df   = flag_outliers(records_df)
    regional_df  = compute_regional_aggregates(records_df, countries_df)

    # Summary stats
    hist = records_df[records_df["year"] <= 2024]
    print("\n── Country summary (sample) ──────────────────────")
    print(countries_df[["name", "region", "growthConsensus", "lifeExpectancy"]].head(10).to_string())
    print("\n── Regional population 2024 ──────────────────────")
    print(regional_df[regional_df["year"] == 2024].sort_values("total_population", ascending=False).to_string(index=False))
    print("\n── CAGR stats (historical) ───────────────────────")
    print(hist["cagr"].describe().round(4))
    print(f"\n── Outlier records detected: {records_df['outlier'].sum()} ──")

    # 4 – Export
    df_map = {
        "countries":  countries_df,
        "records":    records_df,
        "regional":   regional_df,
    }
    if source == "s3":
        export_s3(df_map, bucket)
    else:
        export_local(df_map, output_dir)

    print("\n[DONE] pipeline complete.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PopulationMax ETL pipeline")
    parser.add_argument("--source",  choices=["local", "s3"], default="local")
    parser.add_argument("--bucket",  default="", help="S3 bucket name (required if --source s3)")
    parser.add_argument("--data",    default="data.json",  help="Local data.json path")
    parser.add_argument("--output",  default="./pipeline_output")
    args = parser.parse_args()

    if args.source == "s3" and not args.bucket:
        print("ERROR: --bucket is required when --source s3", file=sys.stderr)
        sys.exit(1)

    run(source=args.source, bucket=args.bucket, data_path=args.data, output_dir=args.output)
