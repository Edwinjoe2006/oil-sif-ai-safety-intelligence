import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.database.models import SafetyAlert, CorrectiveAction, SafetyReport

logger = logging.getLogger("OIL-SIF-AI.alert_action")

class AlertActionService:
    def create_alert_if_high_risk(self, db: Session, report: SafetyReport) -> Optional[SafetyAlert]:
        if report.risk_score >= 75 or report.sif_prediction:
            alert = SafetyAlert(
                report_id=report.id,
                alert_title=f"CRITICAL SIF PRECURSOR: {report.hazard_category}",
                severity_level="CRITICAL" if report.risk_score >= 75 else "HIGH",
                hazard_category=report.hazard_category,
                location=report.location,
                description=f"High-risk safety precursor identified at {report.location}. Immediate barrier verification required.",
                is_acknowledged=False,
                created_at=datetime.utcnow()
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)
            return alert
        return None

    def get_active_alerts(self, db: Session) -> List[SafetyAlert]:
        return db.query(SafetyAlert).order_by(SafetyAlert.created_at.desc()).all()

    def acknowledge_alert(self, db: Session, alert_id: int, user: str) -> Optional[SafetyAlert]:
        alert = db.query(SafetyAlert).filter(SafetyAlert.id == alert_id).first()
        if alert:
            alert.is_acknowledged = True
            alert.acknowledged_by = user
            alert.acknowledged_at = datetime.utcnow()
            db.commit()
            db.refresh(alert)
        return alert

    def get_actions(self, db: Session) -> List[CorrectiveAction]:
        return db.query(CorrectiveAction).order_by(CorrectiveAction.created_at.desc()).all()

    def create_action(self, db: Session, payload: Dict[str, Any]) -> CorrectiveAction:
        action = CorrectiveAction(
            report_id=payload["report_id"],
            action_text=payload["action_text"],
            priority=payload.get("priority", "HIGH"),
            responsible_person=payload.get("responsible_person"),
            department=payload.get("department", "HSE"),
            due_date=payload.get("due_date") or (datetime.utcnow() + timedelta(days=7)),
            status="OPEN",
            is_completed=False,
            created_at=datetime.utcnow()
        )
        db.add(action)
        db.commit()
        db.refresh(action)
        return action

    def transition_action(self, db: Session, action_id: int, transition_data: Dict[str, Any]) -> Optional[CorrectiveAction]:
        action = db.query(CorrectiveAction).filter(CorrectiveAction.id == action_id).first()
        if not action:
            return None

        new_status = transition_data.get("new_status", action.status).upper()
        action.status = new_status

        if transition_data.get("assigned_to"):
            action.assigned_to = transition_data["assigned_to"]
        if transition_data.get("responsible_person"):
            action.responsible_person = transition_data["responsible_person"]
        if transition_data.get("evidence"):
            action.evidence = transition_data["evidence"]
        if transition_data.get("verification_notes"):
            action.verification_notes = transition_data["verification_notes"]

        if new_status == "CLOSED":
            action.is_completed = True
            action.completed_at = datetime.utcnow()

        db.commit()
        db.refresh(action)
        return action

alert_action_service = AlertActionService()
