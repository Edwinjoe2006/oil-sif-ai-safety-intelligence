#!/usr/bin/env python3
"""
OIL-SIF-AI-NEW: Model Evaluation Script
Inspects and prints verified evaluation metrics stored in backend/models/training_metrics.json.
"""

import sys
import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
METRICS_PATH = BACKEND_DIR / "models" / "training_metrics.json"

def display_metrics(metrics_path: Path = METRICS_PATH):
    print("=" * 70)
    print("  OIL-SIF-AI-NEW: MODEL EVALUATION METRICS REPORT")
    print("=" * 70)

    if not metrics_path.exists():
        print(f"\n[ALERT] No training metrics found at:\n  -> {metrics_path}")
        print("\nModels have not been trained yet.")
        print("To train models, place the dataset at:")
        print("  data/OIL_SIF_Synthetic_Dataset_5000.csv")
        print("Then run:")
        print("  python training/train_models.py")
        print("=" * 70)
        return False

    try:
        with open(metrics_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        print(f"Timestamp:     {data.get('timestamp')}")
        print(f"Total Samples: {data.get('total_samples')}")
        print(f"Train Samples: {data.get('train_samples')}")
        print(f"Test Samples:  {data.get('test_samples')}\n")

        models = data.get("models", {})
        for name, m in models.items():
            print(f"--- {name.upper().replace('_', ' ')} ---")
            print(f"  Target:       {m.get('target')}")
            print(f"  Accuracy:     {m.get('accuracy')}")
            if "precision" in m:
                print(f"  Precision:    {m.get('precision')}")
            if "recall_sif_positive" in m:
                print(f"  SIF Recall:   {m.get('recall_sif_positive')} (High Safety Priority)")
            if "f1_score" in m:
                print(f"  F1 Score:     {m.get('f1_score')}")
            if "weighted_f1" in m:
                print(f"  Weighted F1:  {m.get('weighted_f1')}")
            if "classes" in m:
                print(f"  Classes:      {m.get('classes')}")
            print(f"  Confusion Matrix: {m.get('confusion_matrix')}\n")

        print("=" * 70)
        return True
    except Exception as e:
        print(f"[ERROR] Failed to parse metrics file: {e}")
        return False

if __name__ == "__main__":
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else METRICS_PATH
    display_metrics(path)
