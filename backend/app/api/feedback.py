from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Feedback, SafetyReport
from app.models.schemas import FeedbackCreate, FeedbackOut

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
def submit_feedback(payload: FeedbackCreate, db: Session = Depends(get_db)):
    """
    Submits expert human safety officer feedback on an AI safety assessment.
    Stored for future model auditing and retraining.
    """
    report = db.query(SafetyReport).filter(SafetyReport.id == payload.report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Safety report #{payload.report_id} not found."
        )

    feedback_row = Feedback(
        report_id=payload.report_id,
        is_correct=payload.is_correct,
        actual_hazard=payload.actual_hazard if not payload.is_correct else None,
        actual_severity=payload.actual_severity if not payload.is_correct else None,
        comment=payload.comment
    )
    db.add(feedback_row)
    db.commit()
    db.refresh(feedback_row)

    return FeedbackOut.model_validate(feedback_row)

@router.get("/report/{report_id}", response_model=List[FeedbackOut])
def get_report_feedback(report_id: int, db: Session = Depends(get_db)):
    """Retrieves all feedback entries logged for a given report."""
    feedbacks = db.query(Feedback).filter(Feedback.report_id == report_id).all()
    return [FeedbackOut.model_validate(f) for f in feedbacks]
