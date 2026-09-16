from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.asset_service import asset_service
from app.models.schemas import AssetOut, AssetRiskProfile

router = APIRouter(prefix="/assets", tags=["Asset Risk Intelligence"])

@router.get("", response_model=List[AssetOut])
def list_assets(db: Session = Depends(get_db)):
    return asset_service.get_all_assets(db)

@router.get("/{asset_id}", response_model=AssetOut)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = asset_service.get_asset_by_id(db, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.get("/{asset_id}/risk-profile", response_model=AssetRiskProfile)
def get_asset_risk_profile(asset_id: int, db: Session = Depends(get_db)):
    profile = asset_service.get_asset_risk_profile(db, asset_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Asset not found")
    return profile
