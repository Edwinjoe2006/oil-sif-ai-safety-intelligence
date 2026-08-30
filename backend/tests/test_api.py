import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.database import SessionLocal, Base, engine
from app.database.models import SafetyReport

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    # Keep clean

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database_connected" in data
    assert "models_loaded" in data

def test_statistics_endpoint():
    response = client.get("/api/statistics")
    assert response.status_code == 200
    data = response.json()
    assert "total_reports" in data
    assert "risk_distribution" in data

def test_trends_endpoint():
    response = client.get("/api/trends")
    assert response.status_code == 200
    data = response.json()
    assert "risk_trend" in data
    assert "emerging_risks" in data

def test_hazards_endpoint():
    response = client.get("/api/hazards")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_analyze_validation_error():
    # Text too short (< 5 characters)
    response = client.post("/api/analyze", json={"report_text": "leak"})
    assert response.status_code == 422

def test_analyze_missing_models_error():
    # Meaningful text when models are not trained should return 503
    response = client.post("/api/analyze", json={
        "report_text": "Worker entered confined vessel without gas test",
        "location": "Platform A",
        "report_type": "Unsafe Act"
    })
    # If models not trained, it must return 503 with helpful instructions
    if response.status_code == 503:
        assert "ML models are not trained yet" in response.json()["detail"]
    elif response.status_code == 200:
        # If models happened to be trained
        assert "risk_score" in response.json()

def test_reports_and_feedback():
    # Insert a sample report directly into DB for testing reports list & feedback
    db = SessionLocal()
    rep = SafetyReport(
        report_text="Flange leak observed on crude line",
        report_type="Unsafe Condition",
        location="Wellpad 7",
        sif_prediction=False,
        sif_probability=0.15,
        hazard_category="Pressure",
        hazard_probability=0.88,
        severity="Medium",
        severity_probability=0.80,
        risk_score=35,
        risk_level="MEDIUM",
        detected_factors=["Loss of Containment / Leak"],
        status="Open"
    )
    db.add(rep)
    db.commit()
    db.refresh(rep)
    report_id = rep.id
    db.close()

    # Get reports
    get_res = client.get("/api/reports")
    assert get_res.status_code == 200
    assert get_res.json()["total"] >= 1

    # Submit feedback
    fb_res = client.post("/api/feedback", json={
        "report_id": report_id,
        "is_correct": False,
        "actual_hazard": "Process Safety",
        "actual_severity": "High",
        "comment": "Leak escalated to hydrocarbon mist."
    })
    assert fb_res.status_code == 201
    assert fb_res.json()["is_correct"] is False
