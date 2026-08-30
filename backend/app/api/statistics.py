from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.database import get_db
from app.database.models import SafetyReport, CorrectiveAction
from app.models.schemas import StatisticsOut
from app.services.trend_service import trend_service

router = APIRouter(prefix="/statistics", tags=["Statistics"])

@router.get("", response_model=StatisticsOut)
def get_dashboard_statistics(db: Session = Depends(get_db)):
    """
    Computes live dashboard KPIs and distributions strictly from the database.
    Does not fabricate or hard-code any values.
    """
    total = db.query(SafetyReport).count()

    if total == 0:
        return StatisticsOut(
            total_reports=0,
            sif_precursors_count=0,
            high_critical_count=0,
            average_risk_score=0.0,
            open_corrective_actions=0,
            emerging_risks_count=0,
            risk_distribution={"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0},
            hazard_distribution={},
            severity_distribution={"Low": 0, "Medium": 0, "High": 0, "Critical": 0},
            sif_distribution={"SIF Precursor": 0, "Non-SIF": 0}
        )

    # 1. SIF Precursors Count
    sif_count = db.query(SafetyReport).filter(SafetyReport.sif_prediction == True).count()

    # 2. High & Critical Reports Count
    high_critical_count = (
        db.query(SafetyReport)
        .filter(SafetyReport.risk_level.in_(["HIGH", "CRITICAL"]))
        .count()
    )

    # 3. Average Risk Score
    avg_score = db.query(func.avg(SafetyReport.risk_score)).scalar() or 0.0

    # 4. Open Corrective Actions
    open_actions = (
        db.query(CorrectiveAction)
        .filter(CorrectiveAction.is_completed == False)
        .count()
    )

    # 5. Risk Level Distribution
    risk_dist_rows = (
        db.query(SafetyReport.risk_level, func.count(SafetyReport.id))
        .group_by(SafetyReport.risk_level)
        .all()
    )
    risk_dist = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
    for level, count in risk_dist_rows:
        if level:
            risk_dist[level.upper()] = count

    # 6. Hazard Category Distribution
    hazard_dist_rows = (
        db.query(SafetyReport.hazard_category, func.count(SafetyReport.id))
        .group_by(SafetyReport.hazard_category)
        .all()
    )
    hazard_dist = {cat or "General": cnt for cat, cnt in hazard_dist_rows}

    # 7. Severity Distribution
    sev_dist_rows = (
        db.query(SafetyReport.severity, func.count(SafetyReport.id))
        .group_by(SafetyReport.severity)
        .all()
    )
    severity_dist = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
    for sev, cnt in sev_dist_rows:
        if sev:
            formatted_sev = sev.capitalize()
            severity_dist[formatted_sev] = cnt

    # 8. SIF vs Non-SIF Distribution
    sif_dist = {
        "SIF Precursor": sif_count,
        "Non-SIF": total - sif_count
    }

    # 9. Emerging Risks Count
    emerging_items = trend_service.calculate_emerging_risks(db)
    increasing_count = sum(1 for item in emerging_items if item["trend_direction"] == "increasing")

    return StatisticsOut(
        total_reports=total,
        sif_precursors_count=sif_count,
        high_critical_count=high_critical_count,
        average_risk_score=round(float(avg_score), 1),
        open_corrective_actions=open_actions,
        emerging_risks_count=increasing_count,
        risk_distribution=risk_dist,
        hazard_distribution=hazard_dist,
        severity_distribution=severity_dist,
        sif_distribution=sif_dist
    )
