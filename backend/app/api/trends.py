from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.schemas import TrendsOut, EmergingRiskItem
from app.services.trend_service import trend_service

router = APIRouter(prefix="/trends", tags=["Trends"])

@router.get("", response_model=TrendsOut)
def get_trends(
    interval: str = Query("daily", pattern="^(daily|weekly|monthly)$"),
    db: Session = Depends(get_db)
):
    """
    Returns time-series risk trends, calculated emerging hazards,
    and location risk hotspots based on actual database reports.
    """
    risk_trend = trend_service.calculate_risk_trend(db, interval=interval)
    emerging_raw = trend_service.calculate_emerging_risks(db)
    hotspots = trend_service.calculate_location_hotspots(db)

    emerging_items = [
        EmergingRiskItem(
            hazard=item["hazard"],
            trend_direction=item["trend_direction"],
            percent_change=item["percent_change"],
            report_count=item["report_count"]
        )
        for item in emerging_raw
    ]

    return TrendsOut(
        risk_trend=risk_trend,
        emerging_risks=emerging_items,
        location_hotspots=hotspots
    )
