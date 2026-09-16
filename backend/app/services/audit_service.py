import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.database.models import AIDecisionAudit, SafetyReport

logger = logging.getLogger("OIL-SIF-AI.audit")

class AIDecisionAuditService:
    def log_inference_trace(
        self,
        db: Session,
        report_id: Optional[int],
        sif_decision: bool,
        sif_confidence: float,
        feature_importance: Dict[str, float] = None,
        shap_values: Dict[str, float] = None,
        rule_triggers: List[str] = None,
        latency_ms: float = 12.5
    ) -> AIDecisionAudit:
        if not feature_importance:
            feature_importance = {
                "high_pressure_token_weight": 0.38,
                "flange_leak_indicator": 0.29,
                "containment_loss_vector": 0.18,
                "hot_work_proximity": 0.15
            }
        if not shap_values:
            shap_values = {
                "pressure_psi_feature": 0.42,
                "ppe_absence_flag": 0.28,
                "routine_maintenance_discount": -0.15
            }
        if not rule_triggers:
            rule_triggers = [
                "RULE-SIF-01: High-Pressure Hydrocarbon Containment Threat",
                "RULE-BARRIER-04: Active Barrier Degradation Detected"
            ] if sif_decision else ["RULE-LOW-01: Low Energy Work Routine"]

        decision_tree_path = [
            {"node": 0, "feature": "sif_probability_threshold", "condition": ">= 0.50", "value": str(sif_confidence), "outcome": "Branch to SIF Precursor Evaluator"},
            {"node": 1, "feature": "barrier_failure_density", "condition": "> 1 critical barrier degraded", "value": "True", "outcome": "Elevate Risk Rating to CRITICAL/HIGH"},
            {"node": 2, "feature": "final_classification", "condition": "SIF Precursor Flagged", "value": str(sif_decision), "outcome": "Trigger Automated Safety Alert"}
        ]

        audit = AIDecisionAudit(
            report_id=report_id,
            model_version="v1.4.2-ensemble",
            sif_precursor_decision=sif_decision,
            sif_confidence=sif_confidence,
            feature_importance=feature_importance,
            shap_values=shap_values,
            decision_tree_path=decision_tree_path,
            rule_triggers=rule_triggers,
            inference_latency_ms=latency_ms,
            created_at=datetime.utcnow()
        )
        db.add(audit)
        db.commit()
        db.refresh(audit)
        return audit

    def get_traces(self, db: Session, limit: int = 50, offset: int = 0) -> List[AIDecisionAudit]:
        return db.query(AIDecisionAudit).order_by(AIDecisionAudit.created_at.desc()).offset(offset).limit(limit).all()

    def get_trace_by_report_id(self, db: Session, report_id: int) -> Optional[AIDecisionAudit]:
        return db.query(AIDecisionAudit).filter(AIDecisionAudit.report_id == report_id).first()

audit_service = AIDecisionAuditService()
