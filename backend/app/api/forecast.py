from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.forecasting_service import forecasting_service
from app.models.schemas import PredictiveForecastResponse

router = APIRouter(prefix="/forecast", tags=["Predictive Safety Trend Forecasting"])

@router.get("", response_model=PredictiveForecastResponse)
def get_predictive_forecast(
    horizon_days: int = Query(default=30, ge=7, le=90),
    db: Session = Depends(get_db)
):
    return forecasting_service.generate_forecast(db, horizon_days)
