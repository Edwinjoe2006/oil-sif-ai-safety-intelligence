from fastapi import APIRouter, Depends
from app.services.vision_service import vision_service
from app.models.schemas import VisionInspectionRequest, VisionInspectionResponse

router = APIRouter(prefix="/vision", tags=["Vision AI Safety Inspection"])

@router.post("/inspect", response_model=VisionInspectionResponse)
def inspect_safety_image(payload: VisionInspectionRequest):
    return vision_service.inspect_image(payload.model_dump())
