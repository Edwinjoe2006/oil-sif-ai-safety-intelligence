import io
import pytest
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient
from app.main import app
from app.services.vision_service import vision_service

client = TestClient(app)

# =========================================================================
# Scenario 1: Industrial Fire & Smoke Detection
# =========================================================================
def test_scenario1_fire_and_smoke():
    img = Image.new("RGB", (200, 200), color=(30, 35, 40))
    draw = ImageDraw.Draw(img)

    # Fire / Flames: High luminance, warm orange/red (R=255, G=140, B=20)
    draw.rectangle([50, 80, 150, 160], fill=(255, 140, 20))
    draw.polygon([(60, 80), (100, 30), (140, 80)], fill=(255, 200, 30))

    # Dense Smoke Plume: Diffuse gray across upper frame
    draw.rectangle([30, 10, 170, 70], fill=(90, 95, 100))

    buf = io.BytesIO()
    img.save(buf, format="PNG")

    response = client.post(
        "/api/vision/upload",
        files={"file": ("fire_smoke_scene.png", buf.getvalue(), "image/png")},
        data={"context_notes": "Emergency flare deck visual scan"}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["sif_risk_rating"] == "CRITICAL"
    assert data["risk_score"] >= 80

    labels = [h["hazard_label"].lower() for h in data["detected_hazards"]]
    assert any("fire" in l or "flame" in l for l in labels)
    assert any("smoke" in l for l in labels)

    # Ensure no false missing PPE
    assert not any("missing" in l and "ppe" in l for l in labels)

# =========================================================================
# Scenario 2: Pipeline Flange Hydrocarbon Leak
# =========================================================================
def test_scenario2_flange_leak():
    img = Image.new("RGB", (200, 200), color=(40, 45, 50))
    draw = ImageDraw.Draw(img)

    # Dark metallic piping across middle
    draw.rectangle([0, 80, 200, 130], fill=(45, 50, 55))
    draw.rectangle([80, 70, 120, 140], fill=(35, 40, 45))  # Flange

    # High specular aerosol plume / vapor leak at flange
    draw.ellipse([90, 85, 125, 125], fill=(245, 248, 252))

    buf = io.BytesIO()
    img.save(buf, format="PNG")

    response = client.post(
        "/api/vision/upload",
        files={"file": ("flange_leak.png", buf.getvalue(), "image/png")},
        data={"context_notes": "Wellhead manifold flange leak"}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["sif_risk_rating"] == "CRITICAL"
    labels = [h["hazard_label"].lower() for h in data["detected_hazards"]]
    assert any("leak" in l for l in labels)

# =========================================================================
# Scenario 3: Atmospheric Corrosion & Rust Oxidation
# =========================================================================
def test_scenario3_corrosion_rust():
    img = Image.new("RGB", (200, 200), color=(50, 55, 60))
    draw = ImageDraw.Draw(img)

    # Large rust oxidation patch on piping: Iron oxide (R=195, G=78, B=22)
    draw.rectangle([40, 50, 160, 150], fill=(195, 78, 22))

    buf = io.BytesIO()
    img.save(buf, format="PNG")

    response = client.post(
        "/api/vision/upload",
        files={"file": ("corrosion_pipe.png", buf.getvalue(), "image/png")},
        data={"context_notes": "Separator line wall inspection"}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["sif_risk_rating"] in ["HIGH", "CRITICAL"]
    labels = [h["hazard_label"].lower() for h in data["detected_hazards"]]
    assert any("corrosion" in l or "rust" in l for l in labels)

# =========================================================================
# Scenario 4: Worker with Compliant PPE (Hard Hat & High-Vis)
# =========================================================================
def test_scenario4_compliant_worker_ppe():
    img = Image.new("RGB", (200, 200), color=(50, 60, 70))
    draw = ImageDraw.Draw(img)

    # High-vis fluorescent vest (Neon yellow: R=230, G=245, B=25)
    draw.rectangle([70, 70, 130, 150], fill=(230, 245, 25))
    # Hard hat (Yellow ANSI helmet: R=245, G=215, B=20)
    draw.ellipse([80, 35, 120, 68], fill=(245, 215, 20))

    buf = io.BytesIO()
    img.save(buf, format="PNG")

    response = client.post(
        "/api/vision/upload",
        files={"file": ("safe_worker.png", buf.getvalue(), "image/png")},
        data={"context_notes": "Technician on platform walkway"}
    )
    assert response.status_code == 200
    data = response.json()

    checklist = {item["item_name"]: item for item in data["safety_checklist"]}
    assert checklist["High-Visibility Safety Apparel"]["status"] == "DETECTED"
    assert checklist["High-Visibility Safety Apparel"]["is_compliant"] is True
    assert checklist["Hard Hat Protective Headwear"]["status"] == "DETECTED"
    assert checklist["Hard Hat Protective Headwear"]["is_compliant"] is True

    # Zero missing PPE violations
    for h in data["detected_hazards"]:
        assert "missing" not in h["hazard_label"].lower()

# =========================================================================
# Scenario 5: Clean Normal Safe Industrial Scene
# =========================================================================
def test_scenario5_clean_safe_industrial_scene():
    img = Image.new("RGB", (200, 200), color=(120, 130, 140))
    buf = io.BytesIO()
    img.save(buf, format="PNG")

    response = client.post(
        "/api/vision/upload",
        files={"file": ("normal_deck.png", buf.getvalue(), "image/png")},
        data={"context_notes": "Normal deck walk"}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["sif_risk_rating"] == "LOW"
    assert len(data["detected_hazards"]) == 0
    assert data["risk_score"] <= 20
    assert data["sif_probability"] <= 0.10

# =========================================================================
# Negative Test: Invalid URL Handling
# =========================================================================
def test_negative_invalid_url():
    response = client.post(
        "/api/vision/inspect",
        json={"image_url": "https://nonexistent-safety-domain-404.com/fake_image.jpg"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["hazard_domain"] == "Image Ingestion Failure"
    assert data["risk_score"] == 10
    assert len(data["detected_hazards"]) == 0
    assert data["human_verification_required"] is True

# =========================================================================
# Verification & Database Persistence Test (Refresh Survival)
# =========================================================================
def test_verify_and_log_persistence():
    # 1. Inspect image
    img = Image.new("RGB", (200, 200), color=(50, 55, 60))
    draw = ImageDraw.Draw(img)
    draw.rectangle([40, 50, 160, 150], fill=(195, 78, 22))  # Corrosion
    buf = io.BytesIO()
    img.save(buf, format="PNG")

    inspect_res = client.post(
        "/api/vision/upload",
        files={"file": ("corrosion_test.png", buf.getvalue(), "image/png")},
        data={"location": "Offshore Platform Alpha", "asset": "Flare Header 04"}
    )
    assert inspect_res.status_code == 200
    insp_data = inspect_res.json()
    inspection_id = insp_data["inspection_id"]

    # 2. Verify & Save
    save_payload = {
        "inspection_id": inspection_id,
        "image_data": insp_data.get("image_data"),
        "image_url": insp_data.get("image_url"),
        "image_source_type": "upload",
        "target_asset": "Flare Header 04",
        "facility_location": "Offshore Platform Alpha",
        "risk_score": insp_data["risk_score"],
        "sif_risk_rating": insp_data["sif_risk_rating"],
        "sif_probability": insp_data["sif_probability"],
        "detected_hazards": insp_data["detected_hazards"],
        "safety_checklist": insp_data["safety_checklist"],
        "ppe_findings": insp_data["ppe_findings"],
        "hazard_findings": insp_data["hazard_findings"],
        "recommended_safety_action": insp_data["recommended_safety_action"],
        "verification_status": "VERIFIED",
        "reviewer_name": "Senior HSE Inspector John Doe",
        "reviewer_notes": "Confirmed structural corrosion on flare header."
    }

    save_res = client.post("/api/vision/save", json=save_payload)
    assert save_res.status_code == 200
    save_body = save_res.json()
    assert save_body["success"] is True
    assert save_body["inspection_id"] == inspection_id

    # 3. Fetch History and check persistence
    hist_res = client.get("/api/vision/history")
    assert hist_res.status_code == 200
    history_list = hist_res.json()
    saved_item = next((item for item in history_list if item["inspection_id"] == inspection_id), None)
    assert saved_item is not None
    assert saved_item["target_asset"] == "Flare Header 04"
    assert saved_item["verification_status"] == "VERIFIED"
    assert saved_item["reviewer_name"] == "Senior HSE Inspector John Doe"

    # 4. Fetch by ID
    detail_res = client.get(f"/api/vision/history/{inspection_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["inspection_id"] == inspection_id
    assert detail["image_data"] is not None
