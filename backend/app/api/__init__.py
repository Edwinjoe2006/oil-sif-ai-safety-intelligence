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

# Advanced SIH Upgrades
from app.api.emerging import router as emerging_router
from app.api.assets import router as assets_router
from app.api.vision import router as vision_router
from app.api.simulator import router as simulator_router
from app.api.bowtie import router as bowtie_router
from app.api.copilot import router as copilot_router
from app.api.quality import router as quality_router
from app.api.audit import router as audit_router
from app.api.alerts import router as alerts_router
from app.api.actions import router as actions_router
from app.api.forecast import router as forecast_router

api_router = APIRouter()

# Core Endpoints
api_router.include_router(analyze_router)
api_router.include_router(reports_router)
api_router.include_router(statistics_router)
api_router.include_router(trends_router)
api_router.include_router(feedback_router)
api_router.include_router(similar_router)
api_router.include_router(hazards_router)
api_router.include_router(priority_router)
api_router.include_router(metrics_router)

# 10 Advanced Feature Endpoints
api_router.include_router(emerging_router)
api_router.include_router(assets_router)
api_router.include_router(vision_router)
api_router.include_router(simulator_router)
api_router.include_router(bowtie_router)
api_router.include_router(copilot_router)
api_router.include_router(quality_router)
api_router.include_router(audit_router)
api_router.include_router(alerts_router)
api_router.include_router(actions_router)
api_router.include_router(forecast_router)

__all__ = ["api_router"]
