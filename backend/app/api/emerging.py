from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.emerging_risk_service import emerging_risk_engine
from app.models.schemas import EarlyWarningResponse

router = APIRouter(tags=["Emerging Risks & Early Warning"])

@router.get("/emerging-risks", response_model=EarlyWarningResponse)
def get_emerging_risks(db: Session = Depends(get_db)):
    return emerging_risk_engine.calculate_early_warning(db)
