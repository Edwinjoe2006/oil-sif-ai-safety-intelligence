from fastapi import APIRouter
from app.services.copilot_service import copilot_service
from app.models.schemas import CopilotQuery, CopilotAnswer

router = APIRouter(prefix="/copilot", tags=["Advanced AI Safety Copilot"])

@router.post("/ask", response_model=CopilotAnswer)
def ask_copilot(payload: CopilotQuery):
    context = {
        "report_id": payload.context_report_id,
        "hazard": payload.context_hazard,
        "location": payload.context_location
    }
    return copilot_service.answer_query(payload.query, context)
