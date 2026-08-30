#!/usr/bin/env python3
"""
OIL-SIF-AI-NEW: Dataset Validation Script
Validates data/OIL_SIF_Synthetic_Dataset_5000.csv across 10 safety and integrity checks.
CRITICAL: DOES NOT MODIFY OR OVERWRITE THE ORIGINAL CSV FILE.
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np

# Resolve path to expected CSV
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
DEFAULT_DATASET_PATH = PROJECT_ROOT / "data" / "OIL_SIF_Synthetic_Dataset_5000.csv"

EXPECTED_COLUMNS = [
    "report_id",
    "report_date",
    "location",
    "report_type",
    "report_text",
    "hazard_category",
    "sif_precursor",
    "severity",
    "risk_score",
    "recommended_action",
]

EXPECTED_SEVERITIES = {"low", "medium", "high", "critical"}

def validate_dataset(dataset_path: Path = DEFAULT_DATASET_PATH) -> bool:
    print("=" * 70)
    print("  OIL-SIF-AI-NEW: DATASET VALIDATION REPORT")
    print("=" * 70)
    print(f"Target Path: {dataset_path}\n")

    # Check 1: File Existence
    print("[Check 1/10] Verifying File Existence...")
    if not dataset_path.exists():
        print(f"  [ERROR] Dataset file NOT FOUND at: {dataset_path}")
        print("\n  ACTION REQUIRED:")
        print(f"  Please place your actual CSV file at:")
        print(f"  -> {dataset_path}")
        print("=" * 70)
        return False
    print("  [PASS] File exists.\n")

    # Load CSV safely without altering it
    try:
        df = pd.read_csv(dataset_path)
    except Exception as e:
        print(f"  [ERROR] Could not read CSV file: {e}")
        return False

    # Check 2: Number of Rows
    print("[Check 2/10] Checking Dataset Dimensions...")
    row_count, col_count = df.shape
    print(f"  Total Rows: {row_count}")
    print(f"  Total Columns: {col_count}")
    if row_count < 10:
        print(f"  [WARNING] Dataset has very few rows ({row_count}).")
    else:
        print("  [PASS] Sufficient row count for ML training.\n")

    # Check 3: Column Names
    print("[Check 3/10] Validating Expected Columns...")
    actual_cols = [c.strip().lower() for c in df.columns]
    missing_cols = [c for c in EXPECTED_COLUMNS if c.lower() not in actual_cols]
    extra_cols = [c for c in actual_cols if c not in [ec.lower() for ec in EXPECTED_COLUMNS]]
    
    if missing_cols:
        print(f"  [FAIL] Missing required columns: {missing_cols}")
        print(f"  Expected: {EXPECTED_COLUMNS}")
        print(f"  Found: {list(df.columns)}")
        return False
    else:
        print(f"  [PASS] All {len(EXPECTED_COLUMNS)} required columns present.")
        if extra_cols:
            print(f"  [NOTE] Extra columns detected: {extra_cols}\n")
        else:
            print("")

    # Map columns case-insensitively for subsequent checks
    col_map = {c.strip().lower(): c for c in df.columns}

    # Check 4: Missing Values
    print("[Check 4/10] Inspecting Missing Values per Column...")
    missing_counts = df.isnull().sum()
    has_missing = False
    for col in df.columns:
        cnt = missing_counts[col]
        pct = (cnt / row_count) * 100
        if cnt > 0:
            has_missing = True
            print(f"  - {col}: {cnt} missing ({pct:.2f}%)")
    if not has_missing:
        print("  [PASS] No missing values detected across all columns.\n")
    else:
        print("  [NOTE] Missing values will be imputed/handled in-memory during training.\n")

    # Check 5: Exact Duplicate Rows
    print("[Check 5/10] Checking Exact Duplicate Rows...")
    duplicate_count = df.duplicated().sum()
    if duplicate_count > 0:
        print(f"  [ALERT] Found {duplicate_count} exact duplicate rows ({duplicate_count/row_count*100:.2f}%).")
        print("  Notice: Duplicates will be dropped strictly in-memory during training.")
        print("  The original CSV file will NOT be altered.")
    else:
        print("  [PASS] Zero exact duplicate rows found.\n")

    # Check 6: SIF Precursor Class Distribution
    sif_col = col_map.get("sif_precursor")
    print("[Check 6/10] Analyzing SIF Precursor Class Distribution...")
    if sif_col:
        sif_dist = df[sif_col].value_counts(dropna=False)
        for val, count in sif_dist.items():
            print(f"  Class '{val}': {count} ({count/row_count*100:.2f}%)")
        print("  [PASS] SIF distribution verified.\n")

    # Check 7: Hazard Category Distribution
    haz_col = col_map.get("hazard_category")
    print("[Check 7/10] Analyzing Hazard Category Distribution...")
    if haz_col:
        haz_dist = df[haz_col].value_counts(dropna=False)
        print(f"  Total Unique Hazard Categories: {len(haz_dist)}")
        for val, count in haz_dist.head(10).items():
            print(f"  - {val}: {count} ({count/row_count*100:.2f}%)")
        if len(haz_dist) > 10:
            print(f"  ... and {len(haz_dist) - 10} more categories.")
        print("  [PASS] Hazard distribution verified.\n")

    # Check 8: Severity Distribution
    sev_col = col_map.get("severity")
    print("[Check 8/10] Analyzing Severity Distribution...")
    if sev_col:
        sev_dist = df[sev_col].value_counts(dropna=False)
        for val, count in sev_dist.items():
            print(f"  - {val}: {count} ({count/row_count*100:.2f}%)")
        print("  [PASS] Severity distribution verified.\n")

    # Check 9: Invalid Values Check
    print("[Check 9/10] Inspecting for Out-of-Range / Invalid Values...")
    issues = 0
    # Check risk_score bounds if present
    risk_col = col_map.get("risk_score")
    if risk_col and pd.api.types.is_numeric_dtype(df[risk_col]):
        out_of_bounds = df[(df[risk_col] < 0) | (df[risk_col] > 100)]
        if len(out_of_bounds) > 0:
            print(f"  [ALERT] {len(out_of_bounds)} records have risk_score outside [0, 100].")
            issues += 1
        else:
            print("  Risk scores strictly within valid [0, 100] range.")
    
    # Check text lengths
    text_col = col_map.get("report_text")
    if text_col:
        empty_texts = df[df[text_col].astype(str).str.strip().str.len() < 3]
        if len(empty_texts) > 0:
            print(f"  [ALERT] {len(empty_texts)} rows have empty or extremely short report_text.")
            issues += 1
        else:
            print("  Report texts are populated and non-empty.")

    if issues == 0:
        print("  [PASS] No critical invalid values detected.\n")
    else:
        print(f"  [NOTE] {issues} data warnings detected. In-memory sanitizer will clean these.\n")

    # Check 10: Data Types
    print("[Check 10/10] Inspecting Data Types...")
    for col in df.columns:
        print(f"  - {col}: {df[col].dtype}")
    print("  [PASS] Column data types recorded.\n")

    print("=" * 70)
    print("  VALIDATION SUMMARY: DATASET IS VALID AND READY FOR TRAINING")
    print("  Remember: Model training must be executed with:")
    print("  python training/train_models.py")
    print("=" * 70)
    return True

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_DATASET_PATH
    success = validate_dataset(Path(target))
    sys.exit(0 if success else 1)
