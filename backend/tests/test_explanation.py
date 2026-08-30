import pytest
from app.services.explanation_service import ExplanationService

def test_factor_detection():
    service = ExplanationService()
    
    text = "High-pressure crude oil injection line developed a severe flange gasket leak at 1200 PSI while technician was in spray zone."
    factors = service.detect_factors(text)
    
    assert "High Pressure" in factors
    assert "Loss of Containment / Leak" in factors
    assert "Worker Exposure" in factors

def test_escalation_pathway_disclaimer_and_steps():
    service = ExplanationService()
    pathway = service.get_escalation_path("Pressure")
    
    assert len(pathway) >= 3
    assert any("Unsafe" in step["stage"] for step in pathway)
    assert any("Major Incident" in step["stage"] or "SIF" in step["stage"] for step in pathway)

def test_copilot_explanation_structure():
    service = ExplanationService()
    copilot = service.generate_copilot_explanation(
        report_text="Worker entered vessel without gas test",
        hazard_category="Confined Space",
        severity="Critical",
        sif_precursor=True,
        sif_probability=0.92,
        risk_score=91,
        factors=["Confined Space Activity"],
        actions=["Stop work", "Gas test"]
    )
    
    assert "why_dangerous" in copilot
    assert "priority" in copilot
    assert "IMMEDIATE STOP-WORK REQUIRED" in copilot["priority"]
