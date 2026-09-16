import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.database.models import Asset, SafetyReport

logger = logging.getLogger("OIL-SIF-AI.asset_service")

class AssetService:
    def get_all_assets(self, db: Session) -> List[Asset]:
        return db.query(Asset).order_by(Asset.risk_score.desc()).all()

    def get_asset_by_id(self, db: Session, asset_id: int) -> Optional[Asset]:
        return db.query(Asset).filter(Asset.id == asset_id).first()

    def get_asset_risk_profile(self, db: Session, asset_id: int) -> Optional[Dict[str, Any]]:
        asset = self.get_asset_by_id(db, asset_id)
        if not asset:
            return None

        reports = db.query(SafetyReport).filter(
            (SafetyReport.asset == asset.name) | (SafetyReport.location.contains(asset.name))
        ).order_by(SafetyReport.created_at.desc()).limit(10).all()

        vulnerabilities = [
            f"Operating in high-demand environment ({asset.location})",
            f"Current degradation state classified as '{asset.degradation_level}'",
            f"{asset.precursor_count} historical precursor events flagged"
        ]
        if asset.risk_score >= 75:
            vulnerabilities.append("Critical SIF escalation potential under high pressure/thermal loads")

        recommendations = [
            f"Execute priority NDT wall thickness inspection on {asset.name}",
            "Calibrate automated pressure transmitter and relief valve interlocks",
            "Schedule specialized preventative overhaul during next shutdown window"
        ]

        uptime_safety = round(max(40.0, 100.0 - (asset.risk_score * 0.6) - (asset.failure_probability * 50.0)), 1)

        return {
            "asset": asset,
            "recent_precursors": reports,
            "vulnerability_factors": vulnerabilities,
            "maintenance_recommendations": recommendations,
            "uptime_safety_index": uptime_safety
        }

asset_service = AssetService()
