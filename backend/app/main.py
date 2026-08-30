import logging
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from app.utils.config import settings
from app.database.init_db import init_db
from app.database.database import engine
from app.api import api_router
from app.services.prediction_service import prediction_service
from app.models.schemas import HealthOut

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("OIL-SIF-AI")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown routines."""
    logger.info("Initializing database schema...")
    try:
        init_db()
        logger.info("Database schema ready.")
    except Exception as e:
        logger.error(f"Failed to initialize database schema: {e}")

    logger.info("Checking for trained machine learning models...")
    models_ok = prediction_service.load_models()
    if models_ok:
        logger.info("ML Models loaded and ready for real-time inference.")
    else:
        logger.warning(
            "Running in STANDBY MODE: ML models not found in backend/models. "
            "Please add data/OIL_SIF_Synthetic_Dataset_5000.csv and execute: "
            "python training/train_models.py"
        )
    yield
    logger.info("OIL-SIF-AI backend shutting down gracefully.")

app = FastAPI(
    title=settings.PROJECT_TITLE,
    description=(
        "Industrial-grade AI/NLP Engine to Detect Serious Injury & Fatality (SIF) Precursors "
        "in Oil & Gas Unsafe-Act, Unsafe-Condition, and Near-Miss Reports. "
        "Built for Smart India Hackathon (SIH) prototype demonstration."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for frontend Vite development & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(api_router, prefix="/api")

@app.get("/api/health", response_model=HealthOut, tags=["Health"])
def health_check():
    """Returns real-time health status of database, models, and dataset availability."""
    db_connected = False
    try:
        with engine.connect() as conn:
            db_connected = True
    except Exception:
        db_connected = False

    dataset_present = settings.DATASET_PATH.exists()

    return HealthOut(
        status="healthy" if db_connected else "degraded",
        project_name=settings.PROJECT_NAME,
        database_connected=db_connected,
        models_loaded=prediction_service.is_loaded,
        dataset_present=dataset_present,
        timestamp=datetime.utcnow()
    )

@app.get("/", tags=["Root"])
def root():
    return {
        "project": settings.PROJECT_NAME,
        "title": settings.PROJECT_TITLE,
        "status": "operational",
        "docs_url": "/docs",
        "models_loaded": prediction_service.is_loaded,
        "dataset_present": settings.DATASET_PATH.exists(),
        "instruction": (
            "Ready for analysis once models are trained. "
            "Place dataset in data/OIL_SIF_Synthetic_Dataset_5000.csv "
            "and run 'python training/train_models.py'."
        )
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
