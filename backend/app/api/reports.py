from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from app.database.database import get_db
from app.database.models import SafetyReport
from app.models.schemas import ReportOut, ReportListResponse

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("", response_model=ReportListResponse)
def get_reports(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query for report text or location"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level (LOW, MEDIUM, HIGH, CRITICAL)"),
    hazard: Optional[str] = Query(None, description="Filter by hazard category"),
    report_type: Optional[str] = Query(None, description="Filter by report type"),
    location: Optional[str] = Query(None, description="Filter by location"),
    sif: Optional[bool] = Query(None, description="Filter by SIF precursor flag"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    status: Optional[str] = Query(None, description="Filter by status"),
    sort_by: str = Query("created_at", description="Field to sort by: created_at or risk_score"),
    order: str = Query("desc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db)
):
    """Retrieves paginated and filtered historical safety reports."""
    query = db.query(SafetyReport)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (SafetyReport.report_text.ilike(search_pattern)) |
            (SafetyReport.location.ilike(search_pattern))
        )

    if risk_level:
        query = query.filter(SafetyReport.risk_level == risk_level.upper())

    if hazard:
        query = query.filter(SafetyReport.hazard_category.ilike(f"%{hazard}%"))

    if report_type:
        query = query.filter(SafetyReport.report_type.ilike(f"%{report_type}%"))

    if location:
        query = query.filter(SafetyReport.location.ilike(f"%{location}%"))

    if sif is not None:
        query = query.filter(SafetyReport.sif_prediction == sif)

    if severity:
        query = query.filter(SafetyReport.severity.ilike(f"%{severity}%"))

    if status:
        query = query.filter(SafetyReport.status == status)

    # Sorting
    sort_col = SafetyReport.risk_score if sort_by == "risk_score" else SafetyReport.created_at
    if order.lower() == "asc":
        query = query.order_by(asc(sort_col))
    else:
        query = query.order_by(desc(sort_col))

    total = query.count()
    offset = (page - 1) * limit
    reports = query.offset(offset).limit(limit).all()

    return ReportListResponse(
        total=total,
        page=page,
        limit=limit,
        reports=[ReportOut.model_validate(r) for r in reports]
    )

@router.get("/high-risk", response_model=List[ReportOut])
def get_high_risk_reports(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    """Retrieves reports classified as HIGH or CRITICAL risk."""
    reports = (
        db.query(SafetyReport)
        .filter(SafetyReport.risk_level.in_(["HIGH", "CRITICAL"]))
        .order_by(desc(SafetyReport.risk_score), desc(SafetyReport.created_at))
        .limit(limit)
        .all()
    )
    return [ReportOut.model_validate(r) for r in reports]

@router.get("/{report_id}", response_model=ReportOut)
def get_report_by_id(report_id: int, db: Session = Depends(get_db)):
    """Retrieves details of a specific safety report."""
    report = db.query(SafetyReport).filter(SafetyReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Safety report with ID {report_id} not found."
        )
    return ReportOut.model_validate(report)

@router.patch("/{report_id}/status", response_model=ReportOut)
def update_report_status(report_id: int, new_status: str = Query(..., pattern="^(Open|In Progress|Resolved)$"), db: Session = Depends(get_db)):
    """Updates the lifecycle status of a safety report."""
    report = db.query(SafetyReport).filter(SafetyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    report.status = new_status
    db.commit()
    db.refresh(report)
    return ReportOut.model_validate(report)
