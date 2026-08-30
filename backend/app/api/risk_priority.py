from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.database import get_db
from app.database.models import SafetyReport
from app.models.schemas import ReportOut

router = APIRouter(prefix="/risk-priority", tags=["Priority Queue"])

@router.get("", response_model=List[ReportOut])
def get_risk_priority_queue(
    limit: int = Query(15, ge=1, le=100, description="Max priority items"),
    db: Session = Depends(get_db)
):
    """
    Returns the real-time Safety Risk Priority Queue, sorted strictly
    by risk score descending, followed by most recent timestamp.
    """
    reports = (
        db.query(SafetyReport)
        .order_by(desc(SafetyReport.risk_score), desc(SafetyReport.created_at))
        .limit(limit)
        .all()
    )
    return [ReportOut.model_validate(r) for r in reports]
