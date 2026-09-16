from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.audit_service import audit_service
from app.models.schemas import DecisionAuditOut

router = APIRouter(prefix="/audit", tags=["AI Decision Audit Trail"])

@router.get("/traces", response_model=List[DecisionAuditOut])
def list_audit_traces(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    return audit_service.get_traces(db, limit, offset)

@router.get("/traces/{report_id}", response_model=DecisionAuditOut)
def get_trace_by_report(report_id: int, db: Session = Depends(get_db)):
    trace = audit_service.get_trace_by_report_id(db, report_id)
    if not trace:
        raise HTTPException(status_code=404, detail="Audit trace for report not found")
    return trace
