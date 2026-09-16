from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.alert_action_service import alert_action_service
from app.models.schemas import SafetyAlertOut, AlertAckRequest

router = APIRouter(prefix="/alerts", tags=["Safety Alert Center"])

@router.get("", response_model=List[SafetyAlertOut])
def get_active_alerts(db: Session = Depends(get_db)):
    return alert_action_service.get_active_alerts(db)

@router.post("/{alert_id}/ack", response_model=SafetyAlertOut)
def acknowledge_alert(alert_id: int, payload: AlertAckRequest, db: Session = Depends(get_db)):
    alert = alert_action_service.acknowledge_alert(db, alert_id, payload.acknowledged_by)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
