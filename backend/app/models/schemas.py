from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator

# --- Base / Analyze Schemas ---

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
    asset: Optional[str] = Field(
        default=None,
        max_length=150,
        description="Associated equipment or asset tag (e.g. Flare Header 04, Mud Pump #2)"
    )
    image_url: Optional[str] = Field(
        default=None,
        description="Optional image attachment URL or identifier"
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
    regulatory_reference: Optional[str] = None
    sop_reference: Optional[str] = None


class BowTieNode(BaseModel):
    id: str
    label: str
    type: str  # threat, barrier_prevent, top_event, barrier_mitigate, consequence
    health: Optional[str] = "Intact"  # Intact, Degraded, Failed
    details: Optional[str] = None


class BowTieDiagram(BaseModel):
    threats: List[Dict[str, Any]]
    prevention_barriers: List[Dict[str, Any]]
    top_event: str
    mitigation_barriers: List[Dict[str, Any]]
    consequences: List[Dict[str, Any]]


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
    bow_tie: Optional[BowTieDiagram] = None
    asset: Optional[str] = None
    created_at: Optional[datetime] = None


class ReportOut(BaseModel):
    id: int
    report_text: str
    report_type: str
    location: str
    asset: Optional[str] = None
    image_url: Optional[str] = None
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
    bow_tie: Optional[Dict[str, Any]] = None
    copilot: Optional[Dict[str, Any]] = None
    created_at: datetime
    status: str

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    total: int
    page: int
    limit: int
    reports: List[ReportOut]


# --- Feature 1: Emerging Risks & Early Warning ---

class EmergingRiskCluster(BaseModel):
    hazard: str
    location: str
    precursor_count: int
    velocity_percent: float
    early_warning_level: str  # ELEVATED, HIGH, CRITICAL
    key_drivers: List[str]
    recommended_preemption: str


class EarlyWarningResponse(BaseModel):
    system_warning_level: str  # GREEN, YELLOW, ORANGE, RED
    composite_early_warning_score: int
    risk_velocity_7d: float
    risk_acceleration: str
    emerging_clusters: List[EmergingRiskCluster]
    top_precursor_signals: List[Dict[str, Any]]
    timestamp: datetime


# --- Feature 2: Asset Risk Intelligence ---

class AssetOut(BaseModel):
    id: int
    name: str
    asset_type: str
    location: str
    criticality: str
    risk_score: int
    degradation_level: str
    failure_probability: float
    precursor_count: int
    last_inspection_date: Optional[datetime] = None
    maintenance_status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AssetRiskProfile(BaseModel):
    asset: AssetOut
    recent_precursors: List[ReportOut] = []
    vulnerability_factors: List[str]
    maintenance_recommendations: List[str]
    uptime_safety_index: float


# --- Feature 3: Vision AI / Image Inspection ---

class DetectedVisualHazard(BaseModel):
    hazard_label: str
    confidence: float
    severity_level: str  # CRITICAL, HIGH, MEDIUM, LOW, COMPLIANT, UNCERTAIN
    status: Optional[str] = "DETECTED"  # DETECTED, NOT DETECTED, UNCERTAIN
    category: Optional[str] = "Hazard"  # PPE, Physical Hazard, Structural Degradation, Environmental
    is_compliant: Optional[bool] = False
    bounding_box: Optional[Dict[str, float]] = None
    description: str


class VisualAuditItem(BaseModel):
    item_name: str
    category: str  # "PPE Compliance" or "Physical Hazard"
    status: str  # "DETECTED", "NOT DETECTED", "UNCERTAIN"
    confidence: float
    is_compliant: bool = False
    details: str
    bounding_box: Optional[Dict[str, float]] = None


class VisionInspectionRequest(BaseModel):
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    location: Optional[str] = "Offshore Facility"
    asset: Optional[str] = None
    context_notes: Optional[str] = None


class VisionInspectionResponse(BaseModel):
    inspection_id: str
    vision_model_engine: Optional[str] = "Real Computer Vision Multi-Target Feature Analyzer"
    ppe_findings: Optional[List[VisualAuditItem]] = []
    hazard_findings: Optional[List[VisualAuditItem]] = []
    detected_hazards: List[DetectedVisualHazard]
    safety_checklist: Optional[List[VisualAuditItem]] = []
    sif_risk_rating: str  # CRITICAL, HIGH, MEDIUM, LOW
    sif_probability: float
    overall_confidence: float
    hazard_domain: Optional[str] = "General Safety"
    risk_score: Optional[int] = 50
    barrier_integrity_status: str
    recommended_safety_action: List[str]
    human_verification_required: Optional[bool] = False
    inspected_at: datetime


# --- PDF Safety Report Analysis ---

class PdfAnalysisFinding(BaseModel):
    finding: str
    source_page: int
    evidence_sentence: str
    hazard: str
    severity: str


class PdfAnalysisResponse(BaseModel):
    id: Optional[int] = None
    filename: str
    total_pages: int
    sif_precursor: bool
    sif_probability: float
    hazard_category: str
    hazard_probability: float
    severity: str
    severity_probability: float
    risk_score: int
    risk_level: str
    key_findings: List[PdfAnalysisFinding]
    why_this_score: List[str]
    potential_consequences: List[str]
    recommended_action: List[str]
    escalation_path: List[Dict[str, Any]]
    copilot_narrative: Optional[str] = None
    created_at: datetime


# --- Feature 4: What-If Risk Simulator ---

class SimulatorInput(BaseModel):
    base_report_text: Optional[str] = None
    hazard_category: Optional[str] = "Hydrocarbon Release / Flammable Vapor"
    pressure_psi: Optional[float] = 120.0
    wind_speed_knots: Optional[float] = 18.0
    shift_type: Optional[str] = "Night Shift"  # Day Shift, Night Shift, Turnaround
    crew_fatigue_level: Optional[str] = "Moderate"  # Low, Moderate, High, Severe
    safety_barrier_status: Optional[str] = "Partially Degraded"  # Active & Intact, Partially Degraded, Bypassed
    equipment_wear_pct: Optional[float] = 45.0
    worker_experience_years: Optional[float] = 3.5


class BarrierImpact(BaseModel):
    barrier_name: str
    status: str
    risk_multiplier: float
    risk_delta_pct: float


class SimulatorResponse(BaseModel):
    baseline_sif_probability: float
    simulated_sif_probability: float
    probability_delta: float
    baseline_risk_score: int
    simulated_risk_score: int
    risk_level: str
    critical_vulnerabilities: List[str]
    barrier_breakdown: List[BarrierImpact]
    mitigation_levers: List[str]


# --- Feature 5: Bow-Tie Causal Analysis ---

class BowTieRequest(BaseModel):
    hazard_category: Optional[str] = None
    report_text: Optional[str] = None


class BowTieResponse(BaseModel):
    top_event: str
    hazard_category: str
    threats: List[Dict[str, Any]]
    prevention_barriers: List[Dict[str, Any]]
    mitigation_barriers: List[Dict[str, Any]]
    consequences: List[Dict[str, Any]]
    barrier_health_summary: Dict[str, int]


# --- Feature 6: Advanced AI Safety Copilot ---

class CopilotQuery(BaseModel):
    query: str
    context_report_id: Optional[int] = None
    context_hazard: Optional[str] = None
    context_location: Optional[str] = None


class CopilotAnswer(BaseModel):
    answer: str
    cited_standards: List[str]  # e.g., OSHA 1910.119, API RP 75, IOGP 459
    sop_checklists: List[str]
    immediate_mitigations: List[str]
    sif_warning: Optional[str] = None
    related_queries: List[str]


# --- Feature 7: Human-in-the-Loop Validation 2.0 & AI Quality ---

class ReviewSubmit(BaseModel):
    report_id: int
    reviewer_name: str = Field(..., min_length=2, max_length=100)
    actual_sif: bool
    actual_hazard: Optional[str] = None
    actual_severity: Optional[str] = None
    reviewer_reason: str = Field(..., min_length=3, max_length=255)
    comment: Optional[str] = None


class AIQualityMetrics(BaseModel):
    total_validated_reports: int
    agreement_rate_pct: float
    human_override_rate_pct: float
    sif_precision_pct: float
    sif_recall_pct: float
    model_drift_index: float
    confusion_matrix: Dict[str, Dict[str, int]]
    monthly_accuracy_trend: List[Dict[str, Any]]
    top_override_reasons: List[Dict[str, Any]]


# --- Feature 8: AI Decision Audit Trail & Trace ---

class DecisionTreeNode(BaseModel):
    id: str
    condition: str
    threshold: Optional[str] = None
    passed: bool
    sub_nodes: List[Dict[str, Any]] = []


class DecisionAuditOut(BaseModel):
    id: int
    report_id: Optional[int] = None
    model_version: str
    sif_precursor_decision: bool
    sif_confidence: float
    feature_importance: Dict[str, float]
    shap_values: Dict[str, float]
    decision_tree_path: List[Dict[str, Any]]
    rule_triggers: List[str]
    inference_latency_ms: float
    created_at: datetime

    class Config:
        from_attributes = True


# --- Feature 9: Safety Alerts & Corrective Actions ---

class SafetyAlertOut(BaseModel):
    id: int
    report_id: Optional[int] = None
    alert_title: str
    severity_level: str
    hazard_category: Optional[str] = None
    location: Optional[str] = None
    description: str
    is_acknowledged: bool
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AlertAckRequest(BaseModel):
    acknowledged_by: str = Field(..., min_length=2, max_length=100)


class CorrectiveActionCreate(BaseModel):
    report_id: int
    action_text: str = Field(..., min_length=5)
    priority: str = "HIGH"  # CRITICAL, HIGH, MEDIUM, LOW
    responsible_person: Optional[str] = None
    department: str = "HSE"
    due_date: Optional[datetime] = None


class CorrectiveActionOut(BaseModel):
    id: int
    report_id: int
    action_text: str
    priority: str
    responsible_person: Optional[str] = None
    department: str
    due_date: Optional[datetime] = None
    status: str
    is_completed: bool
    assigned_to: Optional[str] = None
    evidence: Optional[str] = None
    verification_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CorrectiveActionTransition(BaseModel):
    new_status: str  # OPEN, ASSIGNED, IN PROGRESS, VERIFICATION, CLOSED
    assigned_to: Optional[str] = None
    responsible_person: Optional[str] = None
    evidence: Optional[str] = None
    verification_notes: Optional[str] = None


# --- Feature 10: Predictive Safety Trend Forecasting ---

class ForecastPoint(BaseModel):
    date: str
    predicted_precursors: float
    lower_bound_95: float
    upper_bound_95: float
    high_risk_flag: bool


class HazardForecast(BaseModel):
    hazard: str
    trend_direction: str
    expected_incidents_next_30d: int
    peak_risk_period: str


class PredictiveForecastResponse(BaseModel):
    horizon_days: int
    forecast_points: List[ForecastPoint]
    hazard_forecasts: List[HazardForecast]
    high_risk_days_identified: int
    primary_contributing_factors: List[str]
    preemptive_recommendations: List[str]


# --- Feedback, Statistics, Trends & Health ---

class FeedbackCreate(BaseModel):
    report_id: int
    is_correct: bool
    actual_hazard: Optional[str] = None
    actual_severity: Optional[str] = None
    actual_sif: Optional[bool] = None
    reviewer_name: Optional[str] = None
    reviewer_reason: Optional[str] = None
    comment: Optional[str] = Field(default=None, max_length=1000)


class FeedbackOut(BaseModel):
    id: int
    report_id: int
    is_correct: bool
    actual_hazard: Optional[str] = None
    actual_severity: Optional[str] = None
    actual_sif: Optional[bool] = None
    reviewer_name: Optional[str] = None
    reviewer_reason: Optional[str] = None
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class StatisticsOut(BaseModel):
    total_reports: int
    sif_precursors_count: int
    high_critical_count: int
    average_risk_score: float
    open_corrective_actions: int
    emerging_risks_count: int
    active_alerts_count: int = 0
    total_assets_tracked: int = 0
    risk_distribution: Dict[str, int]
    hazard_distribution: Dict[str, int]
    severity_distribution: Dict[str, int]
    sif_distribution: Dict[str, int]


class EmergingRiskItem(BaseModel):
    hazard: str
    trend_direction: str
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

