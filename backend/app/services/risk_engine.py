from typing import List, Dict, Any
from app.utils.config import settings

class RiskEngine:
    """
    Independently calculates an explainable risk score (0-100) and risk level.
    
    CRITICAL SAFETY AUDIT RULE:
    Does NOT use any existing dataset 'risk_score' field as an input feature,
    preventing data leakage and ensuring mathematical independence.
    """

    SEVERITY_WEIGHTS: Dict[str, float] = {
        "critical": 1.0,
        "high": 0.75,
        "medium": 0.45,
        "low": 0.15,
    }

    HAZARD_BASE_WEIGHTS: Dict[str, float] = {
        "confined space": 0.95,
        "fire/explosion": 1.0,
        "process safety": 0.95,
        "pressure": 0.90,
        "energy isolation": 0.88,
        "chemical exposure": 0.85,
        "working at height": 0.82,
        "electrical": 0.80,
        "heavy equipment": 0.78,
        "lifting": 0.75,
        "ppe": 0.40,
        "housekeeping": 0.25,
    }

    def __init__(
        self,
        threshold_low: int = settings.THRESHOLD_LOW,
        threshold_medium: int = settings.THRESHOLD_MEDIUM,
        threshold_high: int = settings.THRESHOLD_HIGH,
        w_sif: float = settings.RISK_WEIGHT_SIF,
        w_severity: float = settings.RISK_WEIGHT_SEVERITY,
        w_hazard: float = settings.RISK_WEIGHT_HAZARD,
        w_factors: float = settings.RISK_WEIGHT_FACTORS,
    ):
        self.threshold_low = threshold_low
        self.threshold_medium = threshold_medium
        self.threshold_high = threshold_high
        self.w_sif = w_sif
        self.w_severity = w_severity
        self.w_hazard = w_hazard
        self.w_factors = w_factors

    def calculate_risk(
        self,
        sif_probability: float,
        hazard_category: str,
        severity: str,
        detected_factors: List[str],
    ) -> Dict[str, Any]:
        """
        Calculates risk score (0-100) and risk level (LOW, MEDIUM, HIGH, CRITICAL).
        """
        # 1. SIF contribution (0.0 to 1.0)
        sif_score = max(0.0, min(1.0, float(sif_probability)))

        # 2. Severity contribution
        sev_key = str(severity).strip().lower()
        sev_weight = self.SEVERITY_WEIGHTS.get(sev_key, 0.35)

        # 3. Hazard contribution
        haz_key = str(hazard_category).strip().lower()
        haz_weight = self.HAZARD_BASE_WEIGHTS.get(haz_key, 0.50)

        # 4. Detected factors contribution (capped at 1.0 for 3+ factors)
        factor_score = min(1.0, len(detected_factors) / 3.0)

        # Weighted calculation (0 - 100)
        raw_score = (
            (sif_score * self.w_sif) +
            (sev_weight * self.w_severity) +
            (haz_weight * self.w_hazard) +
            (factor_score * self.w_factors)
        ) * 100.0

        # Safety escalation boost:
        # If SIF probability is >= 0.80 and severity is High or Critical,
        # ensure risk score reflects immediate high-critical priority
        if sif_score >= 0.80 and sev_weight >= 0.75:
            raw_score = max(raw_score, 76.0)

        # Clamp between 0 and 100
        final_score = int(round(max(0.0, min(100.0, raw_score))))

        # Determine level based on thresholds
        if final_score < self.threshold_low:
            level = "LOW"
        elif final_score < self.threshold_medium:
            level = "MEDIUM"
        elif final_score < self.threshold_high:
            level = "HIGH"
        else:
            level = "CRITICAL"

        return {
            "risk_score": final_score,
            "risk_level": level,
            "breakdown": {
                "sif_contribution": round(sif_score * self.w_sif * 100, 2),
                "severity_contribution": round(sev_weight * self.w_severity * 100, 2),
                "hazard_contribution": round(haz_weight * self.w_hazard * 100, 2),
                "factors_contribution": round(factor_score * self.w_factors * 100, 2),
            }
        }

risk_engine = RiskEngine()
