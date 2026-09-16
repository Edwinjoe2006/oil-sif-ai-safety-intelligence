import logging
import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import SafetyReport, CorrectiveAction, Asset
from app.models.schemas import (
    AnalyzeRequest, AnalyzeResponse, CopilotExplanation, SimilarReportItem, BowTieDiagram
)
from app.services.prediction_service import prediction_service, ModelsNotTrainedException
from app.services.risk_engine import risk_engine
from app.services.explanation_service import explanation_service
from app.services.recommendation_service import recommendation_service
from app.services.similarity_service import similarity_service
from app.services.bowtie_service import bowtie_service
from app.services.copilot_service import copilot_service
from app.services.audit_service import audit_service
from app.services.alert_action_service import alert_action_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analyze", tags=["Analyze"])

@router.post("", response_model=AnalyzeResponse, status_code=status.HTTP_200_OK)
def analyze_report(payload: AnalyzeRequest, db: Session = Depends(get_db)):
    """
    Analyzes an Unsafe Act, Unsafe Condition, or Near Miss report through
    the multi-stage AI Safety Intelligence pipeline with Bow-Tie synthesis,
    Safety Copilot generation, audit trail logging, and alert triggers.
    """
    start_time = time.time()

    # 1. Model inference
    try:
        pred = prediction_service.predict(payload.report_text)
    except ModelsNotTrainedException as e:
        logger.warning(f"Inference rejected: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "ML models are not trained yet. Please place the dataset in "
                "data/OIL_SIF_Synthetic_Dataset_5000.csv and run the training command: "
                "python training/train_models.py"
            )
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )

    # 2. Extract dangerous factors from report text
    factors = explanation_service.detect_factors(payload.report_text)

    # 3. Calculate explainable risk score and level
    risk_result = risk_engine.calculate_risk(
        sif_probability=pred["sif_probability"],
        hazard_category=pred["hazard_category"],
        severity=pred["severity"],
        detected_factors=factors
    )

    # 4. Consequence & Escalation Path
    consequences = explanation_service.get_consequences(pred["hazard_category"])
    escalation_path = explanation_service.get_escalation_path(pred["hazard_category"])

    # 5. Hazard-specific Corrective Actions
    actions = recommendation_service.get_recommendations(pred["hazard_category"])

    # 6. Find similar historical reports in DB
    similar_items = similarity_service.find_similar_reports(db, payload.report_text, top_k=3)

    # 7. Safety Copilot Narrative
    copilot_data = explanation_service.generate_copilot_explanation(
        report_text=payload.report_text,
        hazard_category=pred["hazard_category"],
        severity=pred["severity"],
        sif_precursor=pred["sif_precursor"],
        sif_probability=pred["sif_probability"],
        risk_score=risk_result["risk_score"],
        factors=factors,
        actions=actions
    )

    # 8. Dynamic Bow-Tie Diagram synthesis
    bowtie_data = bowtie_service.generate_bowtie(
        hazard=pred["hazard_category"],
        report_text=payload.report_text
    )

    # 9. Persist report to database
    report_record = SafetyReport(
        report_text=payload.report_text,
        report_type=payload.report_type or "Unsafe Act",
        location=payload.location or "Operational Site",
        asset=payload.asset,
        image_url=payload.image_url,
        sif_prediction=pred["sif_precursor"],
        sif_probability=pred["sif_probability"],
        hazard_category=pred["hazard_category"],
        hazard_probability=pred["hazard_probability"],
        severity=pred["severity"],
        severity_probability=pred["severity_probability"],
        risk_score=risk_result["risk_score"],
        risk_level=risk_result["risk_level"],
        detected_factors=factors,
        potential_consequences=consequences,
        recommended_action=actions,
        escalation_path=escalation_path,
        bow_tie=bowtie_data,
        copilot=copilot_data,
        status="Open"
    )
    db.add(report_record)
    db.commit()
    db.refresh(report_record)

    # 10. Update Asset Precursor count if asset linked
    if payload.asset:
        asset_rec = db.query(Asset).filter(Asset.name == payload.asset).first()
        if asset_rec:
            asset_rec.precursor_count += 1
            if pred["sif_precursor"]:
                asset_rec.risk_score = min(100, asset_rec.risk_score + 3)
            db.commit()

    # 11. Save initial actionable tasks into 5-stage CAPA
    for idx, action_item in enumerate(actions[:3]):
        action_row = CorrectiveAction(
            report_id=report_record.id,
            action_text=action_item,
            priority="CRITICAL" if risk_result["risk_score"] >= 75 else ("HIGH" if idx == 0 else "MEDIUM"),
            responsible_person="Duty Safety Officer",
            department="HSE",
            status="OPEN",
            is_completed=False,
            assigned_to="Duty Safety Officer"
        )
        db.add(action_row)
    db.commit()

    # 12. Create Safety Alert if high risk or SIF precursor
    alert_action_service.create_alert_if_high_risk(db, report_record)

    # 13. Log immutable AI Decision Audit Trace
    latency_ms = round((time.time() - start_time) * 1000.0, 2)
    audit_service.log_inference_trace(
        db=db,
        report_id=report_record.id,
        sif_decision=pred["sif_precursor"],
        sif_confidence=pred["sif_probability"],
        latency_ms=latency_ms
    )

    return AnalyzeResponse(
        id=report_record.id,
        sif_precursor=report_record.sif_prediction,
        sif_probability=report_record.sif_probability,
        hazard_category=report_record.hazard_category,
        hazard_probability=report_record.hazard_probability,
        severity=report_record.severity,
        severity_probability=report_record.severity_probability,
        risk_score=report_record.risk_score,
        risk_level=report_record.risk_level,
        detected_factors=report_record.detected_factors,
        potential_consequences=report_record.potential_consequences,
        recommended_action=report_record.recommended_action,
        escalation_path=report_record.escalation_path,
        similar_reports=[SimilarReportItem(**item) for item in similar_items],
        copilot=CopilotExplanation(**copilot_data),
        bow_tie=BowTieDiagram(**bowtie_data),
        asset=report_record.asset,
        created_at=report_record.created_at
    )
