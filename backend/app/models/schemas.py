from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator

class AnalyzeRequest(BaseModel):
    report_text: str = Field(
        ..., 
        min_length=5, 
        max_length=5000, 
        description="Detailed narrative of the safety observation or incident"
    )
    report_type: Optional[str] = Field(
        default="Unsafe Act", 
        max_length=100,
        description="Type of report: Unsafe Act, Unsafe Condition, or Near Miss"
    )
    location: Optional[str] = Field(
        default="Operational Site", 
        max_length=150,
        description="Field location or facility"
    )

    @field_validator("report_text")
    @classmethod
    def validate_non_empty_text(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned or len(cleaned) < 5:
            raise ValueError("Report text must contain at least 5 meaningful characters.")
        return cleaned


class EscalationStep(BaseModel):
    step_number: int
    stage: str
    description: str


class SimilarReportItem(BaseModel):
    id: int
    similarity_percentage: float
    hazard: str
    location: str
    date: Optional[str] = None
    risk_score: int


class CopilotExplanation(BaseModel):
    why_dangerous: str
    potential_consequence: str
    main_risk_factors: List[str]
    recommended_immediate_actions: List[str]
    priority: str


class AnalyzeResponse(BaseModel):
    id: Optional[int] = None
    sif_precursor: bool
    sif_probability: float
    hazard_category: str
    hazard_probability: float
    severity: str
    severity_probability: float
    risk_score: int
    risk_level: str
    detected_factors: List[str]
    potential_consequences: List[str]
    recommended_action: List[str]
    escalation_path: List[Dict[str, Any]]
    similar_reports: List[SimilarReportItem] = []
    copilot: Optional[CopilotExplanation] = None
    created_at: Optional[datetime] = None


class ReportOut(BaseModel):
    id: int
    report_text: str
    report_type: str
    location: str
    sif_prediction: bool
    sif_probability: float
    hazard_category: str
    hazard_probability: float
    severity: str
    severity_probability: float
    risk_score: int
    risk_level: str
    detected_factors: List[str] = []
    potential_consequences: List[str] = []
    recommended_action: List[str] = []
    escalation_path: List[Dict[str, Any]] = []
    created_at: datetime
    status: str

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    total: int
    page: int
    limit: int
    reports: List[ReportOut]


class FeedbackCreate(BaseModel):
    report_id: int
    is_correct: bool
    actual_hazard: Optional[str] = None
    actual_severity: Optional[str] = None
    comment: Optional[str] = Field(default=None, max_length=1000)


class FeedbackOut(BaseModel):
    id: int
    report_id: int
    is_correct: bool
    actual_hazard: Optional[str] = None
    actual_severity: Optional[str] = None
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CorrectiveActionUpdate(BaseModel):
    is_completed: bool
    assigned_to: Optional[str] = None


class StatisticsOut(BaseModel):
    total_reports: int
    sif_precursors_count: int
    high_critical_count: int
    average_risk_score: float
    open_corrective_actions: int
    emerging_risks_count: int
    risk_distribution: Dict[str, int]
    hazard_distribution: Dict[str, int]
    severity_distribution: Dict[str, int]
    sif_distribution: Dict[str, int]


class EmergingRiskItem(BaseModel):
    hazard: str
    trend_direction: str  # "increasing", "decreasing", "stable"
    percent_change: float
    report_count: int


class TrendsOut(BaseModel):
    risk_trend: List[Dict[str, Any]]
    emerging_risks: List[EmergingRiskItem]
    location_hotspots: List[Dict[str, Any]]


class HazardIntelligenceItem(BaseModel):
    hazard: str
    report_count: int
    risk_contribution_pct: float
    sif_rate: float
    trend: str


class ModelMetricsOut(BaseModel):
    models_loaded: bool
    status_message: str
    metrics: Optional[Dict[str, Any]] = None


class HealthOut(BaseModel):
    status: str
    project_name: str
    database_connected: bool
    models_loaded: bool
    dataset_present: bool
    timestamp: datetime
