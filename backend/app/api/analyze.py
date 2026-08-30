import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import SafetyReport, CorrectiveAction
from app.models.schemas import AnalyzeRequest, AnalyzeResponse, CopilotExplanation, SimilarReportItem
from app.services.prediction_service import prediction_service, ModelsNotTrainedException
from app.services.risk_engine import risk_engine
from app.services.explanation_service import explanation_service
from app.services.recommendation_service import recommendation_service
from app.services.similarity_service import similarity_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analyze", tags=["Analyze"])

@router.post("", response_model=AnalyzeResponse, status_code=status.HTTP_200_OK)
def analyze_report(payload: AnalyzeRequest, db: Session = Depends(get_db)):
    """
    Analyzes an Unsafe Act, Unsafe Condition, or Near Miss report through
    the multi-stage AI Safety Intelligence pipeline:
    1. NLP inference (SIF, Hazard category, Severity classification)
    2. Contextual dangerous factor extraction
    3. Mathematical, explainable risk score calculation (0-100)
    4. Hazard-specific consequence mapping & escalation pathway synthesis
    5. Actionable corrective recommendation generation
    6. Historical TF-IDF similarity matching
    7. Database persistence and return of comprehensive intelligence
    """
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

    # 8. Persist report to database
    report_record = SafetyReport(
        report_text=payload.report_text,
        report_type=payload.report_type or "Unsafe Act",
        location=payload.location or "Operational Site",
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
        status="Open"
    )
    db.add(report_record)
    db.commit()
    db.refresh(report_record)

    # Save initial actionable tasks
    for action_item in actions[:3]:
        action_row = CorrectiveAction(
            report_id=report_record.id,
            action_text=action_item,
            is_completed=False,
            assigned_to="Duty Safety Officer"
        )
        db.add(action_row)
    db.commit()

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
        created_at=report_record.created_at
    )
