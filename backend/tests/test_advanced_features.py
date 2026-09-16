import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.init_db import init_db
from app.database.database import get_db, SessionLocal
from app.database.models import SafetyReport, CorrectiveAction, SafetyAlert, AIDecisionAudit, Asset, Feedback

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()
    # Insert a test safety report if none exists
    db = SessionLocal()
    if db.query(SafetyReport).count() == 0:
        rep = SafetyReport(
            report_text="High pressure hydrocarbon leak detected near main separator valve manifold.",
            report_type="Unsafe Condition",
            location="Offshore Platform Alpha - Wellbay",
            asset="Flare Header 04",
            sif_prediction=True,
            sif_probability=0.88,
            hazard_category="Hydrocarbon Release / Flammable Vapor",
            hazard_probability=0.92,
            severity="Critical",
            severity_probability=0.89,
            risk_score=85,
            risk_level="CRITICAL",
            detected_factors=["Loss of Containment / Leak", "High Operating Pressure"],
            status="Open"
        )
        db.add(rep)
        db.commit()
    db.close()
    yield

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["database_connected"] is True

def test_feature1_emerging_risks():
    response = client.get("/api/emerging-risks")
    assert response.status_code == 200
    data = response.json()
    assert "system_warning_level" in data
    assert "composite_early_warning_score" in data
    assert "emerging_clusters" in data
    assert len(data["emerging_clusters"]) >= 1

def test_feature2_asset_intelligence():
    response = client.get("/api/assets")
    assert response.status_code == 200
    assets = response.json()
    assert len(assets) >= 1
    asset_id = assets[0]["id"]

    profile_res = client.get(f"/api/assets/{asset_id}/risk-profile")
    assert profile_res.status_code == 200
    profile = profile_res.json()
    assert "asset" in profile
    assert "vulnerability_factors" in profile
    assert "uptime_safety_index" in profile

def test_feature3_vision_inspection():
    import io, base64
    from PIL import Image, ImageDraw

    # Generate a real test image with corrosion iron-oxide rust
    img = Image.new("RGB", (200, 200), color=(90, 95, 100))
    draw = ImageDraw.Draw(img)
    draw.rectangle([40, 40, 160, 160], fill=(185, 75, 22))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    payload = {
        "image_base64": b64,
        "location": "Drilling Rig Alpha",
        "context_notes": "High pressure flange leak and corrosion inspection"
    }
    response = client.post("/api/vision/inspect", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "inspection_id" in data
    assert len(data["detected_hazards"]) >= 1
    assert data["sif_risk_rating"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    assert data["risk_score"] > 0

    # Also test upload endpoint
    res_upload = client.post(
        "/api/vision/upload",
        files={"file": ("test.png", buf.getvalue(), "image/png")},
        data={"context_notes": "Inspection on Rig 1"}
    )
    assert res_upload.status_code == 200
    assert res_upload.json()["inspection_id"].startswith("VIS-")


def test_pdf_report_analysis():
    import io
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    c.setFont("Helvetica", 12)
    c.drawString(50, 750, "OFFSHORE PLATFORM SAFETY AUDIT REPORT")
    c.drawString(50, 720, "Observation: Hydrocarbon gas leak detected near separator line at 1200 PSI.")
    c.drawString(50, 690, "PSV safety relief valve inspection overdue by 30 days.")
    c.showPage()
    c.save()

    response = client.post(
        "/api/analyze/pdf",
        files={"file": ("audit.pdf", buf.getvalue(), "application/pdf")},
        data={"location": "Offshore Platform Delta"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["total_pages"] == 1
    assert len(data["key_findings"]) >= 1
    assert data["key_findings"][0]["source_page"] == 1
    assert data["risk_score"] > 0


def test_feature4_whatif_simulator():
    payload = {
        "hazard_category": "Hydrocarbon Release / Flammable Vapor",
        "pressure_psi": 250.0,
        "wind_speed_knots": 30.0,
        "shift_type": "Night Shift",
        "crew_fatigue_level": "High",
        "safety_barrier_status": "Bypassed",
        "equipment_wear_pct": 75.0,
        "worker_experience_years": 1.5
    }
    response = client.post("/api/simulator/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "simulated_sif_probability" in data
    assert "simulated_risk_score" in data
    assert data["simulated_risk_score"] >= 50
    assert len(data["barrier_breakdown"]) >= 1

def test_feature5_bowtie_analysis():
    payload = {
        "hazard_category": "High Pressure Piping & Flange Leaks"
    }
    response = client.post("/api/bowtie/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "top_event" in data
    assert len(data["threats"]) >= 1
    assert len(data["prevention_barriers"]) >= 1
    assert len(data["mitigation_barriers"]) >= 1
    assert len(data["consequences"]) >= 1

def test_feature6_copilot():
    payload = {
        "query": "What are the OSHA and API RP 55 safety procedures for sour gas H2S leak?"
    }
    response = client.post("/api/copilot/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["cited_standards"]) >= 1
    assert len(data["immediate_mitigations"]) >= 1

def test_feature7_ai_quality_and_validation():
    metrics_res = client.get("/api/quality/metrics")
    assert metrics_res.status_code == 200
    m_data = metrics_res.json()
    assert "agreement_rate_pct" in m_data
    assert "sif_precision_pct" in m_data

    # Submit review
    review_payload = {
        "report_id": 1,
        "reviewer_name": "Chief Safety Inspector",
        "actual_sif": True,
        "actual_hazard": "Hydrocarbon Release / Flammable Vapor",
        "actual_severity": "High",
        "reviewer_reason": "Confirmed primary seal barrier blowout risk",
        "comment": "Accurate AI detection on gas release precursor."
    }
    submit_res = client.post("/api/quality/submit-review", json=review_payload)
    assert submit_res.status_code == 200
    r_data = submit_res.json()
    assert r_data["reviewer_name"] == "Chief Safety Inspector"

def test_feature8_decision_audit_trail():
    traces_res = client.get("/api/audit/traces?limit=10")
    assert traces_res.status_code == 200
    assert isinstance(traces_res.json(), list)

def test_feature9_alerts_and_corrective_actions():
    alerts_res = client.get("/api/alerts")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()

    if alerts:
        alert_id = alerts[0]["id"]
        ack_res = client.post(f"/api/alerts/{alert_id}/ack", json={"acknowledged_by": "Safety Officer John"})
        assert ack_res.status_code == 200
        assert ack_res.json()["is_acknowledged"] is True

    action_payload = {
        "report_id": 1,
        "action_text": "Verify torque and gasket integrity on manifold Header 04",
        "priority": "CRITICAL",
        "responsible_person": "Lead Piping Engineer",
        "department": "Maintenance"
    }
    create_act_res = client.post("/api/actions", json=action_payload)
    assert create_act_res.status_code == 200
    act_id = create_act_res.json()["id"]

    trans_res = client.patch(f"/api/actions/{act_id}/transition", json={
        "new_status": "IN PROGRESS",
        "assigned_to": "Field Tech A",
        "evidence": "Work order WO-9921 active"
    })
    assert trans_res.status_code == 200
    assert trans_res.json()["status"] == "IN PROGRESS"

def test_feature10_predictive_forecasting():
    response = client.get("/api/forecast?horizon_days=14")
    assert response.status_code == 200
    data = response.json()
    assert data["horizon_days"] == 14
    assert len(data["forecast_points"]) == 14
    assert len(data["hazard_forecasts"]) >= 1
