#!/usr/bin/env python3
"""
OIL-SIF-AI-NEW: Machine Learning Training Pipeline
Trains CPU-friendly TF-IDF + Logistic Regression classifiers for:
  1. SIF Precursor Detection (Binary, balanced, SIF-positive recall priority)
  2. Hazard Category Classification (Multi-class)
  3. Severity Classification (Multi-class)

CRITICAL RULES:
- Never uses 'risk_score' as an input feature (strictly prevents data leakage).
- Fits TF-IDF vectorizers only on the training partition.
- Drops duplicates strictly in memory without altering the CSV file.
- Saves authentic, non-fabricated metrics to backend/models/training_metrics.json.
"""

import sys
import json
from pathlib import Path
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# Resolve paths
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent
DEFAULT_DATASET_PATH = PROJECT_ROOT / "data" / "OIL_SIF_Synthetic_Dataset_5000.csv"
MODEL_DIR = BACKEND_DIR / "models"

from validate_dataset import validate_dataset

def train_pipeline(dataset_path: Path = DEFAULT_DATASET_PATH):
    print("=" * 75)
    print("  OIL-SIF-AI-NEW: MACHINE LEARNING TRAINING PIPELINE")
    print("=" * 75)

    # 1. Check Dataset Existence
    if not dataset_path.exists():
        print(f"\n[ERROR] Dataset file NOT FOUND at:\n  -> {dataset_path}")
        print("\nPlease place your CSV file at:")
        print("  data/OIL_SIF_Synthetic_Dataset_5000.csv")
        print("\nThen run this script again:")
        print("  python training/train_models.py")
        print("=" * 75)
        sys.exit(1)

    # 2. Validate Dataset
    print("\n--- Phase 1: Validating Dataset ---")
    is_valid = validate_dataset(dataset_path)
    if not is_valid:
        print("[ERROR] Dataset validation failed. Please rectify issues before training.")
        sys.exit(1)

    # 3. Load & In-Memory Preprocessing
    print("\n--- Phase 2: In-Memory Data Preparation ---")
    df = pd.read_csv(dataset_path)
    initial_len = len(df)
    
    # Normalize column names
    df.columns = [c.strip().lower() for c in df.columns]

    # In-memory duplicate removal (original CSV remains untouched)
    df = df.drop_duplicates().reset_index(drop=True)
    dedup_len = len(df)
    dropped_dups = initial_len - dedup_len
    if dropped_dups > 0:
        print(f"Dropped {dropped_dups} duplicate rows in-memory. Working with {dedup_len} unique rows.")

    # Drop rows missing target or text
    required_fields = ["report_text", "sif_precursor", "hazard_category", "severity"]
    df = df.dropna(subset=required_fields).reset_index(drop=True)
    
    # Clean text
    df["clean_text"] = df["report_text"].astype(str).str.strip()
    df = df[df["clean_text"].str.len() >= 5].reset_index(drop=True)

    # Normalize SIF precursor to boolean / int
    def parse_sif(val):
        s = str(val).strip().lower()
        return 1 if s in ["1", "true", "yes", "y", "sif"] else 0

    df["sif_target"] = df["sif_precursor"].apply(parse_sif)
    df["hazard_target"] = df["hazard_category"].astype(str).str.strip()
    df["severity_target"] = df["severity"].astype(str).str.strip()

    print(f"Final training records: {len(df)}")
    print(f"SIF Precursor Distribution: {df['sif_target'].value_counts().to_dict()}")

    # Ensure model output directory exists
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # Common metrics accumulator
    metrics_summary = {
        "timestamp": pd.Timestamp.now().isoformat(),
        "total_samples": len(df),
        "train_samples": 0,
        "test_samples": 0,
        "models": {}
    }

    # 4. Train SIF Precursor Model
    print("\n--- Phase 3: Training SIF Precursor Classifier ---")
    X = df["clean_text"]
    y_sif = df["sif_target"]

    # Stratified split to preserve class ratios
    X_train_sif, X_test_sif, y_train_sif, y_test_sif = train_test_split(
        X, y_sif, test_size=0.2, random_state=42, stratify=y_sif
    )
    metrics_summary["train_samples"] = len(X_train_sif)
    metrics_summary["test_samples"] = len(X_test_sif)

    # Fit TF-IDF only on training data (Strictly zero data leakage)
    sif_vec = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=5000,
        sublinear_tf=True,
        stop_words="english"
    )
    X_train_sif_vec = sif_vec.fit_transform(X_train_sif)
    X_test_sif_vec = sif_vec.transform(X_test_sif)

    # Logistic Regression with balanced class weights (Safety focus)
    sif_clf = LogisticRegression(
        class_weight="balanced",
        max_iter=1000,
        random_state=42,
        C=1.0
    )
    sif_clf.fit(X_train_sif_vec, y_train_sif)

    # Evaluate SIF
    y_pred_sif = sif_clf.predict(X_test_sif_vec)
    sif_acc = accuracy_score(y_test_sif, y_pred_sif)
    sif_prec = precision_score(y_test_sif, y_pred_sif, zero_division=0)
    sif_rec = recall_score(y_test_sif, y_pred_sif, zero_division=0) # SIF-positive recall!
    sif_f1 = f1_score(y_test_sif, y_pred_sif, zero_division=0)
    sif_wf1 = f1_score(y_test_sif, y_pred_sif, average="weighted", zero_division=0)
    sif_cm = confusion_matrix(y_test_sif, y_pred_sif).tolist()

    print(f"  Accuracy:            {sif_acc:.4f}")
    print(f"  Precision:           {sif_prec:.4f}")
    print(f"  SIF Positive Recall: {sif_rec:.4f}  <-- Critical Safety Metric")
    print(f"  F1 Score:            {sif_f1:.4f}")
    print(f"  Weighted F1:         {sif_wf1:.4f}")
    print(f"  Confusion Matrix:    {sif_cm}")

    metrics_summary["models"]["sif_classifier"] = {
        "target": "sif_precursor",
        "accuracy": round(sif_acc, 4),
        "precision": round(sif_prec, 4),
        "recall_sif_positive": round(sif_rec, 4),
        "f1_score": round(sif_f1, 4),
        "weighted_f1": round(sif_wf1, 4),
        "confusion_matrix": sif_cm,
        "classification_report": classification_report(y_test_sif, y_pred_sif, output_dict=True, zero_division=0)
    }

    # 5. Train Hazard Category Classifier
    print("\n--- Phase 4: Training Hazard Category Classifier ---")
    y_haz = df["hazard_target"]
    
    # Check if stratify is possible
    min_haz_count = y_haz.value_counts().min()
    stratify_haz = y_haz if min_haz_count >= 2 else None

    X_train_haz, X_test_haz, y_train_haz, y_test_haz = train_test_split(
        X, y_haz, test_size=0.2, random_state=42, stratify=stratify_haz
    )

    haz_vec = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=5000,
        sublinear_tf=True,
        stop_words="english"
    )
    X_train_haz_vec = haz_vec.fit_transform(X_train_haz)
    X_test_haz_vec = haz_vec.transform(X_test_haz)

    haz_clf = LogisticRegression(
        class_weight="balanced",
        max_iter=1000,
        random_state=42,
        C=1.0
    )
    haz_clf.fit(X_train_haz_vec, y_train_haz)

    y_pred_haz = haz_clf.predict(X_test_haz_vec)
    haz_acc = accuracy_score(y_test_haz, y_pred_haz)
    haz_wf1 = f1_score(y_test_haz, y_pred_haz, average="weighted", zero_division=0)
    haz_classes = list(haz_clf.classes_)

    print(f"  Accuracy:    {haz_acc:.4f}")
    print(f"  Weighted F1: {haz_wf1:.4f}")
    print(f"  Categories:  {len(haz_classes)} detected")

    metrics_summary["models"]["hazard_classifier"] = {
        "target": "hazard_category",
        "classes": haz_classes,
        "accuracy": round(haz_acc, 4),
        "weighted_f1": round(haz_wf1, 4),
        "confusion_matrix": confusion_matrix(y_test_haz, y_pred_haz, labels=haz_classes).tolist(),
        "classification_report": classification_report(y_test_haz, y_pred_haz, output_dict=True, zero_division=0)
    }

    # 6. Train Severity Classifier
    print("\n--- Phase 5: Training Severity Classifier ---")
    y_sev = df["severity_target"]
    min_sev_count = y_sev.value_counts().min()
    stratify_sev = y_sev if min_sev_count >= 2 else None

    X_train_sev, X_test_sev, y_train_sev, y_test_sev = train_test_split(
        X, y_sev, test_size=0.2, random_state=42, stratify=stratify_sev
    )

    sev_vec = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=5000,
        sublinear_tf=True,
        stop_words="english"
    )
    X_train_sev_vec = sev_vec.fit_transform(X_train_sev)
    X_test_sev_vec = sev_vec.transform(X_test_sev)

    sev_clf = LogisticRegression(
        class_weight="balanced",
        max_iter=1000,
        random_state=42,
        C=1.0
    )
    sev_clf.fit(X_train_sev_vec, y_train_sev)

    y_pred_sev = sev_clf.predict(X_test_sev_vec)
    sev_acc = accuracy_score(y_test_sev, y_pred_sev)
    sev_wf1 = f1_score(y_test_sev, y_pred_sev, average="weighted", zero_division=0)
    sev_classes = list(sev_clf.classes_)

    print(f"  Accuracy:    {sev_acc:.4f}")
    print(f"  Weighted F1: {sev_wf1:.4f}")
    print(f"  Classes:     {sev_classes}")

    metrics_summary["models"]["severity_classifier"] = {
        "target": "severity",
        "classes": sev_classes,
        "accuracy": round(sev_acc, 4),
        "weighted_f1": round(sev_wf1, 4),
        "confusion_matrix": confusion_matrix(y_test_sev, y_pred_sev, labels=sev_classes).tolist(),
        "classification_report": classification_report(y_test_sev, y_pred_sev, output_dict=True, zero_division=0)
    }

    # 7. Save Model Artifacts
    print("\n--- Phase 6: Saving Trained Model Artifacts ---")
    joblib.dump(sif_clf, MODEL_DIR / "sif_model.joblib")
    joblib.dump(sif_vec, MODEL_DIR / "sif_vectorizer.joblib")
    print("  -> Saved sif_model.joblib and sif_vectorizer.joblib")

    joblib.dump(haz_clf, MODEL_DIR / "hazard_model.joblib")
    joblib.dump(haz_vec, MODEL_DIR / "hazard_vectorizer.joblib")
    print("  -> Saved hazard_model.joblib and hazard_vectorizer.joblib")

    joblib.dump(sev_clf, MODEL_DIR / "severity_model.joblib")
    joblib.dump(sev_vec, MODEL_DIR / "severity_vectorizer.joblib")
    print("  -> Saved severity_model.joblib and severity_vectorizer.joblib")

    with open(MODEL_DIR / "training_metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics_summary, f, indent=2)
    print("  -> Saved training_metrics.json")

    print("\n" + "=" * 75)
    print("  TRAINING PIPELINE COMPLETED SUCCESSFULLY!")
    print(f"  Artifacts stored in: {MODEL_DIR}")
    print("=" * 75)

if __name__ == "__main__":
    target_csv = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_DATASET_PATH
    train_pipeline(target_csv)
