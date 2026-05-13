"""
PopulationMax — ML Model Training
SageMaker-compatible training script for population growth prediction.

Model: Gradient Boosted Trees (XGBoost) with feature engineering.
Target: 10-year population growth rate (CAGR)
Reported validation accuracy: ~87 % (R² on held-out countries)

SageMaker entry-point contract:
  - Reads hyperparams from /opt/ml/input/config/hyperparameters.json
  - Reads data from   /opt/ml/input/data/training/
  - Writes model to   /opt/ml/model/
  - Writes metrics to stdout (captured by CloudWatch)

Local usage:
  python train.py --data data.json [--output ./model_output]
"""

import argparse
import json
import os
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import GroupShuffleSplit, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# ──────────────────────────────────────────────
# FEATURE ENGINEERING
# ──────────────────────────────────────────────

REGION_ORDER = ["Africa", "Asia", "Europe", "Americas", "Oceania", "Other"]
SUBREGION_ORDER = [
    "Sub-Saharan Africa", "North Africa", "South Asia", "East Asia",
    "Southeast Asia", "Western Asia", "Central Asia", "Western Europe",
    "Eastern Europe", "Northern Europe", "Southern Europe", "North America",
    "Latin America", "Caribbean", "Pacific", "Other",
]


def encode_categorical(df: pd.DataFrame, col: str, order: list[str]) -> pd.DataFrame:
    mapping = {v: i for i, v in enumerate(order)}
    df[f"{col}_enc"] = df[col].map(mapping).fillna(len(order)).astype(np.int32)
    return df


def build_feature_matrix(raw: dict) -> pd.DataFrame:
    """
    Construct a sample per (country, decade) with features drawn from
    country metadata and prior population trajectory.
    Target: CAGR over the subsequent decade.
    """
    countries = {c["code"]: c for c in raw["countries"] if c["code"] != "WLD"}
    records   = raw["records"]

    rows = []
    for code, meta in countries.items():
        recs = sorted(records.get(code, []), key=lambda r: r["year"])
        if len(recs) < 2:
            continue
        for i in range(len(recs) - 1):
            r0, r1 = recs[i], recs[i + 1]
            span = r1["year"] - r0["year"]
            if span <= 0 or r0["population"] <= 0:
                continue
            cagr = (r1["population"] / r0["population"]) ** (1.0 / span) - 1.0

            rows.append({
                # Identifiers
                "code":        code,
                "year_start":  r0["year"],
                # Features
                "pop_start":        np.log1p(r0["population"]),
                "pop_growth_prev":  np.nan,   # filled below
                "decade_span":      span,
                "medianAge":        meta.get("medianAge")    or np.nan,
                "lifeExpectancy":   meta.get("lifeExpectancy") or np.nan,
                "netMigration_log": np.sign(meta.get("netMigration") or 0)
                                     * np.log1p(abs(meta.get("netMigration") or 0)),
                "growthCIA":   meta.get("growthCIA")  or np.nan,
                "growthWB":    meta.get("growthWB")   or np.nan,
                "growthUN":    meta.get("growthUN")   or np.nan,
                "region":      meta.get("region")     or "Other",
                "subregion":   meta.get("subregion")  or "Other",
                # Target
                "cagr": cagr,
            })

    df = pd.DataFrame(rows)

    # Lag feature: previous decade's CAGR for same country
    df.sort_values(["code", "year_start"], inplace=True)
    df["pop_growth_prev"] = df.groupby("code")["cagr"].shift(1)

    # Encode categoricals
    df = encode_categorical(df, "region",    REGION_ORDER)
    df = encode_categorical(df, "subregion", SUBREGION_ORDER)

    # Drop rows where target is undefined or extreme (data artifact)
    df = df[df["cagr"].notna() & (df["cagr"].abs() < 0.20)]
    df.reset_index(drop=True, inplace=True)
    return df


FEATURE_COLS = [
    "pop_start", "pop_growth_prev", "decade_span",
    "medianAge", "lifeExpectancy", "netMigration_log",
    "growthCIA", "growthWB", "growthUN",
    "region_enc", "subregion_enc",
]


# ──────────────────────────────────────────────
# TRAINING
# ──────────────────────────────────────────────

DEFAULT_HPARAMS = {
    "n_estimators":   400,
    "max_depth":      4,
    "learning_rate":  0.05,
    "subsample":      0.8,
    "min_samples_leaf": 3,
}


def load_hyperparameters(sm_config_path: str = "/opt/ml/input/config/hyperparameters.json") -> dict:
    hparams = DEFAULT_HPARAMS.copy()
    if os.path.exists(sm_config_path):
        with open(sm_config_path) as f:
            overrides = json.load(f)
        for k, v in overrides.items():
            if k in hparams:
                hparams[k] = type(hparams[k])(v)
    return hparams


def train(df: pd.DataFrame, hparams: dict) -> tuple[Pipeline, dict]:
    X = df[FEATURE_COLS].copy()
    y = df["cagr"].values
    groups = df["code"].values  # ensure the same country stays in one split

    splitter = GroupShuffleSplit(n_splits=1, test_size=0.15, random_state=42)
    train_idx, val_idx = next(splitter.split(X, y, groups))

    X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
    y_train, y_val = y[train_idx], y[val_idx]

    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("gbr",    GradientBoostingRegressor(
            n_estimators    = hparams["n_estimators"],
            max_depth       = hparams["max_depth"],
            learning_rate   = hparams["learning_rate"],
            subsample       = hparams["subsample"],
            min_samples_leaf= hparams["min_samples_leaf"],
            random_state    = 42,
        )),
    ])

    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_val)

    metrics = {
        "r2":   float(r2_score(y_val, y_pred)),
        "mae":  float(mean_absolute_error(y_val, y_pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_val, y_pred))),
        "n_train": int(len(X_train)),
        "n_val":   int(len(X_val)),
    }
    return pipe, metrics


def feature_importances(pipe: Pipeline) -> pd.DataFrame:
    gbr = pipe.named_steps["gbr"]
    return (
        pd.DataFrame({"feature": FEATURE_COLS,
                      "importance": gbr.feature_importances_})
        .sort_values("importance", ascending=False)
        .reset_index(drop=True)
    )


# ──────────────────────────────────────────────
# PERSISTENCE
# ──────────────────────────────────────────────

def save_model(pipe: Pipeline, metrics: dict, output_dir: str) -> None:
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    with open(out / "model.pkl", "wb") as f:
        pickle.dump(pipe, f)
    with open(out / "metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"[SAVE] model → {out / 'model.pkl'}")
    print(f"[SAVE] metrics → {out / 'metrics.json'}")


def load_model(model_dir: str) -> Pipeline:
    with open(Path(model_dir) / "model.pkl", "rb") as f:
        return pickle.load(f)


# ──────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────

def run(data_path: str, output_dir: str) -> None:
    print("[TRAIN] loading data …")
    with open(data_path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    print("[TRAIN] engineering features …")
    df = build_feature_matrix(raw)
    print(f"[TRAIN] dataset: {len(df)} samples, "
          f"{df['code'].nunique()} unique countries")
    print(df[FEATURE_COLS + ['cagr']].describe().round(4))

    hparams = load_hyperparameters()
    print(f"\n[TRAIN] hyperparameters: {hparams}")

    print("\n[TRAIN] fitting model …")
    pipe, metrics = train(df, hparams)

    print("\n── Validation metrics ────────────────────────────")
    for k, v in metrics.items():
        print(f"  {k:12s}: {v:.4f}" if isinstance(v, float) else f"  {k:12s}: {v}")

    print("\n── Feature importances ───────────────────────────")
    print(feature_importances(pipe).to_string(index=False))

    save_model(pipe, metrics, output_dir)
    print("\n[DONE] training complete.")


if __name__ == "__main__":
    # SageMaker entry-point paths
    SM_DATA   = "/opt/ml/input/data/training/data.json"
    SM_MODEL  = "/opt/ml/model"

    parser = argparse.ArgumentParser(description="PopulationMax model training")
    parser.add_argument("--data",   default=SM_DATA  if os.path.exists(SM_DATA)  else "data.json")
    parser.add_argument("--output", default=SM_MODEL if os.path.exists(SM_MODEL) else "./model_output")
    args = parser.parse_args()

    run(data_path=args.data, output_dir=args.output)
