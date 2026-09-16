from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.quality_service import quality_service
from app.models.schemas import ReviewSubmit, FeedbackOut, AIQualityMetrics
from app.database.models import Feedback

router = APIRouter(prefix="/quality", tags=["AI Quality & Validation 2.0"])

@router.get("/metrics", response_model=AIQualityMetrics)
def get_quality_metrics(db: Session = Depends(get_db)):
    return quality_service.get_quality_metrics(db)

@router.get("/reviews", response_model=List[FeedbackOut])
def get_all_reviews(db: Session = Depends(get_db)):
    return db.query(Feedback).order_by(Feedback.created_at.desc()).all()

@router.post("/submit-review", response_model=FeedbackOut)
def submit_review(payload: ReviewSubmit, db: Session = Depends(get_db)):
    return quality_service.submit_review(db, payload.model_dump())
