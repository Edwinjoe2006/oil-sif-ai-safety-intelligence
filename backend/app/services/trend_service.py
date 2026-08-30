from typing import List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.database.models import SafetyReport

class TrendService:
    """
    Analyzes historical database records to calculate dynamic trends,
    emerging safety risks, location hotspots, and time-series metrics.
    All statistics are strictly calculated from real records.
    """

    def calculate_emerging_risks(self, db: Session) -> List[Dict[str, Any]]:
        """
        Calculates emerging hazard risks by comparing recent report frequency
        against an earlier baseline period.
        """
        total_reports = db.query(SafetyReport).count()
        if total_reports < 2:
            return []

        # Find median date or split reports by date/ID
        all_reports = db.query(SafetyReport).order_by(SafetyReport.created_at.asc()).all()
        midpoint = len(all_reports) // 2

        prior_slice = all_reports[:midpoint]
        recent_slice = all_reports[midpoint:]

        prior_counts: Dict[str, int] = {}
        for r in prior_slice:
            prior_counts[r.hazard_category] = prior_counts.get(r.hazard_category, 0) + 1

        recent_counts: Dict[str, int] = {}
        for r in recent_slice:
            recent_counts[r.hazard_category] = recent_counts.get(r.hazard_category, 0) + 1

        emerging = []
        all_hazards = set(prior_counts.keys()).union(set(recent_counts.keys()))

        for haz in all_hazards:
            prev = prior_counts.get(haz, 0)
            curr = recent_counts.get(haz, 0)
            
            if prev == 0 and curr > 0:
                pct_change = 100.0
                direction = "increasing"
            elif curr == 0 and prev > 0:
                pct_change = -100.0
                direction = "decreasing"
            elif prev > 0:
                pct_change = round(((curr - prev) / prev) * 100.0, 1)
                direction = "increasing" if pct_change > 0 else ("decreasing" if pct_change < 0 else "stable")
            else:
                pct_change = 0.0
                direction = "stable"

            emerging.append({
                "hazard": haz,
                "trend_direction": direction,
                "percent_change": pct_change,
                "report_count": curr + prev
            })

        # Sort by highest positive percentage change first
        emerging.sort(key=lambda x: x["percent_change"], reverse=True)
        return emerging

    def calculate_risk_trend(self, db: Session, interval: str = "daily") -> List[Dict[str, Any]]:
        """
        Calculates time-series risk trends aggregated by date.
        """
        reports = db.query(SafetyReport).order_by(SafetyReport.created_at.asc()).all()
        if not reports:
            return []

        # Group reports by date string (YYYY-MM-DD)
        buckets: Dict[str, List[int]] = {}
        for r in reports:
            date_str = r.created_at.strftime("%Y-%m-%d")
            buckets.setdefault(date_str, []).append(r.risk_score)

        trend_data = []
        for date_str, scores in sorted(buckets.items()):
            trend_data.append({
                "date": date_str,
                "average_risk_score": round(sum(scores) / len(scores), 1),
                "report_count": len(scores)
            })

        return trend_data

    def calculate_location_hotspots(self, db: Session) -> List[Dict[str, Any]]:
        """
        Calculates high-risk reports aggregated by operational facility / location.
        """
        results = db.query(
            SafetyReport.location,
            func.count(SafetyReport.id).label("total"),
            func.sum(
                case((SafetyReport.risk_level.in_(["HIGH", "CRITICAL"]), 1), else_=0)
            ).label("high_risk")
        ).group_by(SafetyReport.location).all()

        hotspots = []
        for loc, total, high_risk in results:
            hotspots.append({
                "location": loc or "Unspecified",
                "total_count": int(total or 0),
                "high_risk_count": int(high_risk or 0),
                "high_risk_pct": round((int(high_risk or 0) / int(total or 1)) * 100, 1)
            })

        hotspots.sort(key=lambda x: x["high_risk_count"], reverse=True)
        return hotspots

trend_service = TrendService()
