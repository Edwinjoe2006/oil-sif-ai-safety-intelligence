from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query, status
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.vision_service import vision_service
from app.models.schemas import (
    VisionInspectionRequest, 
    VisionInspectionResponse,
    VisionSaveRequest,
    VisionSaveResponse,
    VisionHistoryItem
)

router = APIRouter(prefix="/vision", tags=["Vision AI Safety Inspection"])

@router.post("/inspect", response_model=VisionInspectionResponse)
def inspect_safety_image(payload: VisionInspectionRequest):
    """Inspects safety image via JSON payload containing image_base64 or image_url."""
    return vision_service.inspect_image(payload.model_dump())

@router.post("/analyze-url", response_model=VisionInspectionResponse)
def analyze_safety_image_url(payload: VisionInspectionRequest):
    """Fetches image from URL, performs computer vision inference, and returns detections & SIF risk."""
    if not payload.image_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="image_url field is required for URL analysis."
        )
    return vision_service.inspect_image(payload.model_dump())

@router.post("/upload", response_model=VisionInspectionResponse)
async def upload_and_inspect_image(
    file: UploadFile = File(...),
    location: Optional[str] = Form("Offshore Facility"),
    asset: Optional[str] = Form(None),
    context_notes: Optional[str] = Form(None)
):
    """Directly uploads and inspects an image file (JPG, PNG, WEBP)."""
    raw_bytes = await file.read()
    payload = {
        "location": location,
        "asset": asset,
        "context_notes": context_notes,
        "filename": file.filename
    }
    return vision_service.inspect_image(payload, raw_bytes=raw_bytes)

@router.post("/save", response_model=VisionSaveResponse)
@router.post("/verify", response_model=VisionSaveResponse)
def save_verified_inspection(
    payload: VisionSaveRequest,
    db: Session = Depends(get_db)
):
    """Persists a verified inspection with findings, bounding boxes, risk score, and image to database."""
    try:
        result = vision_service.save_inspection(payload.model_dump(), db=db)
        return VisionSaveResponse(
            success=result["success"],
            inspection_id=result["inspection_id"],
            record_id=result["record_id"],
            message=result["message"],
            saved_at=result["saved_at"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to save inspection to database: {str(e)}"
        )

@router.get("/history", response_model=List[VisionHistoryItem])
def get_inspection_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieves all saved vision inspections from the database."""
    return vision_service.get_history(db=db, limit=limit, offset=offset)

@router.get("/history/{inspection_id}", response_model=VisionHistoryItem)
def get_inspection_by_id(
    inspection_id: str,
    db: Session = Depends(get_db)
):
    """Retrieves full saved inspection record by inspection ID."""
    record = vision_service.get_by_inspection_id(inspection_id=inspection_id, db=db)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection record '{inspection_id}' not found."
        )
    return record
