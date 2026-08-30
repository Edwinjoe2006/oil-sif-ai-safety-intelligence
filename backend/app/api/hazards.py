from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.database.database import get_db
from app.database.models import SafetyReport
from app.models.schemas import HazardIntelligenceItem

router = APIRouter(prefix="/hazards", tags=["Hazards"])

MAJOR_HAZARDS = [
    "Pressure",
    "Process Safety",
    "Working at Height",
    "Confined Space",
    "Electrical",
    "Fire/Explosion",
    "Energy Isolation",
    "Chemical Exposure",
    "Heavy Equipment",
    "Lifting",
    "PPE",
    "Housekeeping",
]

@router.get("", response_model=List[HazardIntelligenceItem])
def get_hazard_intelligence(db: Session = Depends(get_db)):
    """
    Returns hazard intelligence breakdown derived directly from stored reports.
    Computes report count, risk contribution %, and SIF positive rate per hazard.
    """
    total_reports = db.query(SafetyReport).count()
    if total_reports == 0:
        return [
            HazardIntelligenceItem(
                hazard=h,
                report_count=0,
                risk_contribution_pct=0.0,
                sif_rate=0.0,
                trend="Stable"
            )
            for h in MAJOR_HAZARDS
        ]

    # Aggregate counts by hazard
    hazard_data = (
        db.query(
            SafetyReport.hazard_category,
            func.count(SafetyReport.id).label("count"),
            func.sum(SafetyReport.risk_score).label("total_risk"),
            func.sum(case((SafetyReport.sif_prediction == True, 1), else_=0)).label("sif_count")
        )
        .group_by(SafetyReport.hazard_category)
        .all()
    )

    total_risk_sum = db.query(func.sum(SafetyReport.risk_score)).scalar() or 1.0

    items = []
    seen = set()

    for haz, count, risk_sum, sif_c in hazard_data:
        haz_name = haz or "General Safety"
        seen.add(haz_name)
        cnt = int(count or 0)
        r_sum = float(risk_sum or 0)
        s_cnt = int(sif_c or 0)

        risk_contribution = round((r_sum / total_risk_sum) * 100.0, 1)
        sif_rate = round((s_cnt / cnt) * 100.0, 1) if cnt > 0 else 0.0

        items.append(HazardIntelligenceItem(
            hazard=haz_name,
            report_count=cnt,
            risk_contribution_pct=risk_contribution,
            sif_rate=sif_rate,
            trend="Active"
        ))

    # Add missing standard categories with 0 counts for comprehensive visibility
    for h in MAJOR_HAZARDS:
        if not any(h.lower() in s.lower() for s in seen):
            items.append(HazardIntelligenceItem(
                hazard=h,
                report_count=0,
                risk_contribution_pct=0.0,
                sif_rate=0.0,
                trend="None"
            ))

    items.sort(key=lambda x: x.report_count, reverse=True)
    return items
