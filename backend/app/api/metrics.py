import json
from pathlib import Path
from fastapi import APIRouter
from app.utils.config import settings
from app.models.schemas import ModelMetricsOut
from app.services.prediction_service import prediction_service

router = APIRouter(prefix="/model-metrics", tags=["Model Metrics"])

@router.get("", response_model=ModelMetricsOut)
def get_model_metrics():
    """
    Returns verified evaluation metrics for SIF, Hazard, and Severity classifiers
    saved during the training run in backend/models/training_metrics.json.
    """
    metrics_file = settings.MODEL_DIR / "training_metrics.json"

    if not metrics_file.exists():
        return ModelMetricsOut(
            models_loaded=prediction_service.is_loaded,
            status_message=(
                "ML models are not trained yet. Please place the synthetic dataset in "
                "data/OIL_SIF_Synthetic_Dataset_5000.csv and run: python training/train_models.py"
            ),
            metrics=None
        )

    try:
        with open(metrics_file, "r", encoding="utf-8") as f:
            metrics_data = json.load(f)

        return ModelMetricsOut(
            models_loaded=True,
            status_message="Trained models and verified metrics loaded successfully.",
            metrics=metrics_data
        )
    except Exception as e:
        return ModelMetricsOut(
            models_loaded=prediction_service.is_loaded,
            status_message=f"Error reading metrics artifact: {str(e)}",
            metrics=None
        )
