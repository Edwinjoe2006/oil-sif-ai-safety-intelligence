from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.alert_action_service import alert_action_service
from app.models.schemas import CorrectiveActionOut, CorrectiveActionCreate, CorrectiveActionTransition

router = APIRouter(prefix="/actions", tags=["Corrective Actions (CAPA)"])

@router.get("", response_model=List[CorrectiveActionOut])
def list_corrective_actions(db: Session = Depends(get_db)):
    return alert_action_service.get_actions(db)

@router.post("", response_model=CorrectiveActionOut)
def create_corrective_action(payload: CorrectiveActionCreate, db: Session = Depends(get_db)):
    return alert_action_service.create_action(db, payload.model_dump())

@router.patch("/{action_id}/transition", response_model=CorrectiveActionOut)
def transition_corrective_action(
    action_id: int,
    payload: CorrectiveActionTransition,
    db: Session = Depends(get_db)
):
    action = alert_action_service.transition_action(db, action_id, payload.model_dump())
    if not action:
        raise HTTPException(status_code=404, detail="Corrective action not found")
    return action
