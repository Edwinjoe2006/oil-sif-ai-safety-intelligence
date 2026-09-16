from fastapi import APIRouter, Depends, UploadFile, File, Form
from typing import Optional
from app.services.vision_service import vision_service
from app.models.schemas import VisionInspectionRequest, VisionInspectionResponse

router = APIRouter(prefix="/vision", tags=["Vision AI Safety Inspection"])

@router.post("/inspect", response_model=VisionInspectionResponse)
def inspect_safety_image(payload: VisionInspectionRequest):
    """Inspects safety image via JSON payload containing image_base64, image_url, and context."""
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
        "context_notes": context_notes
    }
    return vision_service.inspect_image(payload, raw_bytes=raw_bytes)

