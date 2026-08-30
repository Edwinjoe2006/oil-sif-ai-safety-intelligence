import pytest
from app.services.risk_engine import RiskEngine

def test_risk_engine_bounds_and_types():
    engine = RiskEngine()
    
    # Critical inputs
    res_crit = engine.calculate_risk(
        sif_probability=0.95,
        hazard_category="Confined Space",
        severity="Critical",
        detected_factors=["Confined Space Activity", "Missing Gas Testing", "Worker Exposure"]
    )
    assert 0 <= res_crit["risk_score"] <= 100
    assert res_crit["risk_level"] == "CRITICAL"
    assert res_crit["risk_score"] >= 75

    # Low inputs
    res_low = engine.calculate_risk(
        sif_probability=0.05,
        hazard_category="Housekeeping",
        severity="Low",
        detected_factors=["Poor Housekeeping / Tripping"]
    )
    assert 0 <= res_low["risk_score"] <= 100
    assert res_low["risk_level"] == "LOW"
    assert res_low["risk_score"] < 25

def test_risk_engine_threshold_categorization():
    engine = RiskEngine(threshold_low=25, threshold_medium=50, threshold_high=75)
    
    # Moderate inputs
    res_med = engine.calculate_risk(
        sif_probability=0.30,
        hazard_category="PPE",
        severity="Medium",
        detected_factors=["Missing PPE"]
    )
    assert res_med["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
