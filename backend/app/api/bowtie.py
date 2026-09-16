from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.bowtie_service import bowtie_service
from app.models.schemas import BowTieRequest, BowTieResponse

router = APIRouter(prefix="/bowtie", tags=["Causal / Bow-Tie Safety Analysis"])

@router.post("/generate", response_model=BowTieResponse)
def generate_bowtie(payload: BowTieRequest):
    return bowtie_service.generate_bowtie(payload.hazard_category, payload.report_text)

@router.get("/{report_id}", response_model=BowTieResponse)
def get_report_bowtie(report_id: int, db: Session = Depends(get_db)):
    bowtie = bowtie_service.get_bowtie_for_report(db, report_id)
    if not bowtie:
        raise HTTPException(status_code=404, detail="Report or Bow-Tie not found")
    return bowtie
