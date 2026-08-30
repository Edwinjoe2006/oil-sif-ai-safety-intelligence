import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

# Resolve paths relative to backend root
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BACKEND_DIR.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "OIL-SIF-AI-NEW"
    PROJECT_TITLE: str = "AI/NLP Engine to Detect Serious Injury & Fatality (SIF) Precursors"
    API_V1_STR: str = "/api"
    
    # Database Settings (Default to SQLite file in backend/data)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{BACKEND_DIR / 'data' / 'oil_sif_safety.db'}"
    )
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    # Model Artifacts Directory
    MODEL_DIR: Path = BACKEND_DIR / "models"
    
    # Expected Synthetic Dataset Location
    DATASET_PATH: Path = PROJECT_ROOT / "data" / "OIL_SIF_Synthetic_Dataset_5000.csv"
    
    # Risk Engine Default Weights and Thresholds
    RISK_WEIGHT_SIF: float = 0.40
    RISK_WEIGHT_SEVERITY: float = 0.30
    RISK_WEIGHT_HAZARD: float = 0.20
    RISK_WEIGHT_FACTORS: float = 0.10
    
    # Risk Level Cutoffs (0-24 Low, 25-49 Medium, 50-74 High, 75-100 Critical)
    THRESHOLD_LOW: int = 25
    THRESHOLD_MEDIUM: int = 50
    THRESHOLD_HIGH: int = 75

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
