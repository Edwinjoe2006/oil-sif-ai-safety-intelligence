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
    
    # Audit & Status
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    status = Column(String(50), default="Open", index=True)  # Open, In Progress, Resolved

    # Relationships
    feedbacks = relationship("Feedback", back_populates="report", cascade="all, delete-orphan")
    actions = relationship("CorrectiveAction", back_populates="report", cascade="all, delete-orphan")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("safety_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    is_correct = Column(Boolean, nullable=False)
    actual_hazard = Column(String(100), nullable=True)
    actual_severity = Column(String(50), nullable=True)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    report = relationship("SafetyReport", back_populates="feedbacks")


class CorrectiveAction(Base):
    __tablename__ = "corrective_actions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("safety_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    action_text = Column(Text, nullable=False)
    is_completed = Column(Boolean, default=False, index=True)
    assigned_to = Column(String(100), nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    report = relationship("SafetyReport", back_populates="actions")


class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, nullable=True, index=True)
    action_type = Column(String(50), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(JSON, nullable=True)
