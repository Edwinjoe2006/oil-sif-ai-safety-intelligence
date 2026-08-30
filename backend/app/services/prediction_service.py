import logging
from pathlib import Path
from typing import Dict, Any, Optional
import joblib
from app.utils.config import settings

logger = logging.getLogger(__name__)

class ModelsNotTrainedException(Exception):
    """Raised when inference is requested but ML model artifacts are not present."""
    pass

class PredictionService:
    _instance: Optional["PredictionService"] = None

    def __init__(self, model_dir: Optional[Path] = None):
        self.model_dir = model_dir or settings.MODEL_DIR
        self.is_loaded = False
        
        # Models and vectorizers
        self.sif_model = None
        self.sif_vectorizer = None
        self.hazard_model = None
        self.hazard_vectorizer = None
        self.severity_model = None
        self.severity_vectorizer = None
        
        self.load_models()

    @classmethod
    def get_instance(cls) -> "PredictionService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_models(self) -> bool:
        """Attempts to load trained ML models from the model directory."""
        sif_model_path = self.model_dir / "sif_model.joblib"
        sif_vec_path = self.model_dir / "sif_vectorizer.joblib"
        hazard_model_path = self.model_dir / "hazard_model.joblib"
        hazard_vec_path = self.model_dir / "hazard_vectorizer.joblib"
        severity_model_path = self.model_dir / "severity_model.joblib"
        severity_vec_path = self.model_dir / "severity_vectorizer.joblib"

        required_files = [
            sif_model_path, sif_vec_path,
            hazard_model_path, hazard_vec_path,
            severity_model_path, severity_vec_path
        ]

        if not all(p.exists() for p in required_files):
            logger.warning(
                f"Trained ML models not found in {self.model_dir}. "
                "PredictionService initialized in standby mode. "
                "Train models using 'python training/train_models.py' once dataset is provided."
            )
            self.is_loaded = False
            return False

        try:
            self.sif_model = joblib.load(sif_model_path)
            self.sif_vectorizer = joblib.load(sif_vec_path)
            self.hazard_model = joblib.load(hazard_model_path)
            self.hazard_vectorizer = joblib.load(hazard_vec_path)
            self.severity_model = joblib.load(severity_model_path)
            self.severity_vectorizer = joblib.load(severity_vec_path)
            
            self.is_loaded = True
            logger.info("Successfully loaded all ML model artifacts.")
            return True
        except Exception as e:
            logger.error(f"Error loading trained models: {e}")
            self.is_loaded = False
            return False

    def predict(self, report_text: str) -> Dict[str, Any]:
        """Performs inference across SIF, Hazard, and Severity classifiers."""
        if not self.is_loaded:
            # Attempt a reload in case models were trained during runtime
            if not self.load_models():
                raise ModelsNotTrainedException(
                    "ML models are not trained yet. Please place the dataset in "
                    "data/OIL_SIF_Synthetic_Dataset_5000.csv and run the training command."
                )

        cleaned_text = report_text.strip()
        
        # 1. SIF Precursor Prediction
        sif_feat = self.sif_vectorizer.transform([cleaned_text])
        sif_pred_raw = self.sif_model.predict(sif_feat)[0]
        sif_proba_arr = self.sif_model.predict_proba(sif_feat)[0]
        
        # Determine SIF positive probability (class 1 or True or 'Yes')
        classes = list(self.sif_model.classes_)
        positive_idx = None
        for idx, cls_val in enumerate(classes):
            if str(cls_val).strip().lower() in ["1", "true", "yes", "sif", "sif_precursor"]:
                positive_idx = idx
                break
        
        if positive_idx is not None:
            sif_prob = float(sif_proba_arr[positive_idx])
            sif_precursor = bool(sif_pred_raw == classes[positive_idx] or sif_prob >= 0.5)
        else:
            # Fallback to binary index 1 if available
            sif_prob = float(sif_proba_arr[-1])
            sif_precursor = bool(sif_pred_raw == classes[-1] or sif_prob >= 0.5)

        # 2. Hazard Category Prediction
        hazard_feat = self.hazard_vectorizer.transform([cleaned_text])
        hazard_pred = str(self.hazard_model.predict(hazard_feat)[0])
        hazard_proba_arr = self.hazard_model.predict_proba(hazard_feat)[0]
        hazard_prob = float(max(hazard_proba_arr))

        # 3. Severity Prediction
        severity_feat = self.severity_vectorizer.transform([cleaned_text])
        severity_pred = str(self.severity_model.predict(severity_feat)[0])
        severity_proba_arr = self.severity_model.predict_proba(severity_feat)[0]
        severity_prob = float(max(severity_proba_arr))

        return {
            "sif_precursor": sif_precursor,
            "sif_probability": round(sif_prob, 4),
            "hazard_category": hazard_pred,
            "hazard_probability": round(hazard_prob, 4),
            "severity": severity_pred,
            "severity_probability": round(severity_prob, 4)
        }

prediction_service = PredictionService.get_instance()
