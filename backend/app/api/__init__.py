from fastapi import APIRouter
from app.api.analyze import router as analyze_router
from app.api.reports import router as reports_router
from app.api.statistics import router as statistics_router
from app.api.trends import router as trends_router
from app.api.feedback import router as feedback_router
from app.api.similar import router as similar_router
from app.api.hazards import router as hazards_router
from app.api.risk_priority import router as priority_router
from app.api.metrics import router as metrics_router

api_router = APIRouter()

api_router.include_router(analyze_router)
api_router.include_router(reports_router)
api_router.include_router(statistics_router)
api_router.include_router(trends_router)
api_router.include_router(feedback_router)
api_router.include_router(similar_router)
api_router.include_router(hazards_router)
api_router.include_router(priority_router)
api_router.include_router(metrics_router)

__all__ = ["api_router"]
