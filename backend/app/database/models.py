from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database.database import Base

class SafetyReport(Base):
    __tablename__ = "safety_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_text = Column(Text, nullable=False)
    report_type = Column(String(50), default="Unsafe Act", index=True)
    location = Column(String(100), default="Operational Site", index=True)
    asset = Column(String(150), nullable=True, index=True)
    image_url = Column(String(500), nullable=True)
    
    # SIF Predictions
    sif_prediction = Column(Boolean, default=False, index=True)
    sif_probability = Column(Float, default=0.0)
    
    # Hazard Predictions
    hazard_category = Column(String(100), default="General Safety", index=True)
    hazard_probability = Column(Float, default=0.0)
    
    # Severity Predictions
    severity = Column(String(50), default="Low", index=True)
    severity_probability = Column(Float, default=0.0)
    
    # Calculated Risk Metrics
    risk_score = Column(Integer, default=0, index=True)
    risk_level = Column(String(50), default="LOW", index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    
    # Explainable Factors & Consequences (JSON format)
    detected_factors = Column(JSON, default=list)
    potential_consequences = Column(JSON, default=list)
    recommended_action = Column(JSON, default=list)
    escalation_path = Column(JSON, default=list)
    bow_tie = Column(JSON, nullable=True)
    copilot = Column(JSON, nullable=True)
    
    # Audit & Status
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    status = Column(String(50), default="Open", index=True)  # Open, In Progress, Resolved

    # Relationships
    feedbacks = relationship("Feedback", back_populates="report", cascade="all, delete-orphan")
    actions = relationship("CorrectiveAction", back_populates="report", cascade="all, delete-orphan")
    alerts = relationship("SafetyAlert", back_populates="report", cascade="all, delete-orphan")
    audits = relationship("AIDecisionAudit", back_populates="report", cascade="all, delete-orphan")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("safety_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    is_correct = Column(Boolean, nullable=False)
    actual_hazard = Column(String(100), nullable=True)
    actual_severity = Column(String(50), nullable=True)
    actual_sif = Column(Boolean, nullable=True)
    reviewer_name = Column(String(100), nullable=True)
    reviewer_reason = Column(String(255), nullable=True)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    report = relationship("SafetyReport", back_populates="feedbacks")


class CorrectiveAction(Base):
    __tablename__ = "corrective_actions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("safety_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    action_text = Column(Text, nullable=False)
    priority = Column(String(50), default="HIGH", index=True)  # CRITICAL, HIGH, MEDIUM, LOW
    responsible_person = Column(String(100), nullable=True)
    department = Column(String(100), default="HSE", index=True)  # Drilling, Production, Electrical, HSE, Maintenance
    due_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="OPEN", index=True)  # OPEN, ASSIGNED, IN PROGRESS, VERIFICATION, CLOSED
    is_completed = Column(Boolean, default=False, index=True)
    assigned_to = Column(String(100), nullable=True)
    evidence = Column(Text, nullable=True)
    verification_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    report = relationship("SafetyReport", back_populates="actions")


class SafetyAlert(Base):
    __tablename__ = "safety_alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("safety_reports.id", ondelete="CASCADE"), nullable=True, index=True)
    alert_title = Column(String(255), nullable=False)
    severity_level = Column(String(50), default="HIGH", index=True)  # CRITICAL, HIGH, WARNING
    hazard_category = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    is_acknowledged = Column(Boolean, default=False, index=True)
    acknowledged_by = Column(String(100), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    report = relationship("SafetyReport", back_populates="alerts")


class AIDecisionAudit(Base):
    __tablename__ = "ai_decision_audits"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("safety_reports.id", ondelete="CASCADE"), nullable=True, index=True)
    model_version = Column(String(50), default="v1.4.2", index=True)
    sif_precursor_decision = Column(Boolean, nullable=False)
    sif_confidence = Column(Float, default=0.0)
    feature_importance = Column(JSON, nullable=True)
    shap_values = Column(JSON, nullable=True)
    decision_tree_path = Column(JSON, nullable=True)
    rule_triggers = Column(JSON, nullable=True)
    inference_latency_ms = Column(Float, default=12.5)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    report = relationship("SafetyReport", back_populates="audits")


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False, unique=True, index=True)
    asset_type = Column(String(100), nullable=False, index=True)
    location = Column(String(100), nullable=False, index=True)
    criticality = Column(String(50), default="HIGH", index=True)
    risk_score = Column(Integer, default=50, index=True)
    degradation_level = Column(String(50), default="Moderate", index=True)
    failure_probability = Column(Float, default=0.15)
    precursor_count = Column(Integer, default=0)
    last_inspection_date = Column(DateTime, nullable=True)
    maintenance_status = Column(String(50), default="Operational", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, nullable=True, index=True)
    action_type = Column(String(50), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(JSON, nullable=True)


class VisionInspectionRecord(Base):
    __tablename__ = "vision_inspections"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inspection_id = Column(String(100), unique=True, index=True, nullable=False)
    image_source_type = Column(String(50), default="upload")  # "upload" | "url" | "preset"
    image_url = Column(String(1000), nullable=True)
    image_data = Column(Text, nullable=True)  # Base64 data URI or persistent storage path
    filename = Column(String(255), nullable=True)
    target_asset = Column(String(150), nullable=True)
    facility_location = Column(String(150), default="Operational Site")
    inspector_notes = Column(Text, nullable=True)
    ppe_findings = Column(JSON, default=list)
    hazard_findings = Column(JSON, default=list)
    detected_hazards = Column(JSON, default=list)
    safety_checklist = Column(JSON, default=list)
    overall_confidence = Column(Float, default=0.90)
    risk_score = Column(Integer, default=50)
    sif_risk_rating = Column(String(50), default="MEDIUM")
    sif_probability = Column(Float, default=0.50)
    hazard_domain = Column(String(150), default="General Safety")
    barrier_integrity_status = Column(String(255), nullable=True)
    recommended_safety_action = Column(JSON, default=list)
    vision_model_engine = Column(String(150), default="Real Computer Vision Multi-Target Spatial Analyzer")
    human_verification_required = Column(Boolean, default=False)
    verification_status = Column(String(50), default="VERIFIED")  # "VERIFIED" | "PENDING REVIEW" | "REJECTED" | "REQUIRES REVIEW"
    reviewer_name = Column(String(100), default="HSE Safety Inspector")
    reviewer_notes = Column(Text, nullable=True)
    inspected_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

