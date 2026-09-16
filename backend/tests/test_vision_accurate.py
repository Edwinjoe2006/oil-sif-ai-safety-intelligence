import io
import pytest
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient
from app.main import app
from app.services.vision_service import vision_service

client = TestClient(app)

def test_accurate_vision_ppe_and_flange_leak():
    """
    Tests an image where:
    - Worker is visibly wearing a hard hat and high-visibility clothing.
    - Flange has an active hydrocarbon leak and severe corrosion.
    - Deck floor has liquid accumulation.
    Verifies that:
    - PPE is verified as Compliant (Hard Hat: DETECTED, High-Vis: DETECTED).
    - NO false positive "Missing PPE" alert is generated.
    - Real physical hazards (Leak, Corrosion, Pooling) are detected with bounding boxes.
    - Connected to Risk Engine with CRITICAL SIF rating.
    """
    img = Image.new("RGB", (300, 300), color=(40, 45, 50))
    draw = ImageDraw.Draw(img)

    # 1. Dark metallic piping (horizontal pipe across middle)
    draw.rectangle([0, 100, 300, 150], fill=(50, 55, 60))
    draw.rectangle([120, 85, 180, 165], fill=(35, 40, 45))  # Flange joint

    # 2. Severe Rust / Corrosion around the flange (Iron oxide: R=190, G=75, B=20)
    draw.rectangle([125, 90, 175, 160], fill=(195, 78, 22))
    draw.rectangle([80, 105, 125, 145], fill=(180, 70, 20))

    # 3. Flange Leak (High specular aerosol plume mist escaping from flange joint)
    draw.rectangle([140, 120, 170, 155], fill=(245, 248, 252))
    draw.ellipse([135, 115, 175, 160], fill=(240, 245, 255))

    # 4. Liquid Accumulation on floor/deck (y > 200, dark pooling + specular reflection)
    draw.rectangle([80, 220, 220, 270], fill=(15, 20, 25))
    draw.rectangle([110, 230, 190, 255], fill=(235, 240, 245))  # Wet reflection

    # 5. Worker on right side:
    # High-vis fluorescent vest (Neon Yellow: R=230, G=245, B=25)
    draw.rectangle([210, 110, 270, 190], fill=(230, 245, 25))
    # Hard hat on worker's head (Yellow Hardhat: R=240, G=210, B=20)
    draw.ellipse([220, 70, 260, 105], fill=(245, 215, 20))

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    img_bytes = buf.getvalue()

    # Test multipart upload
    response = client.post(
        "/api/vision/upload",
        files={"file": ("flange_inspection.png", img_bytes, "image/png")},
        data={"context_notes": "Wellbay flange inspection with active technician"}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["inspection_id"].startswith("VIS-")
    assert "vision_model_engine" in data
    assert len(data["safety_checklist"]) >= 5

    checklist_map = {item["item_name"]: item for item in data["safety_checklist"]}
    assert checklist_map["High-Visibility Safety Apparel"]["status"] == "DETECTED"
    assert checklist_map["High-Visibility Safety Apparel"]["is_compliant"] is True
    assert checklist_map["Hard Hat Protective Headwear"]["status"] == "DETECTED"
    assert checklist_map["Hard Hat Protective Headwear"]["is_compliant"] is True
    assert checklist_map["Flange / Pipeline Leak Precursor"]["status"] == "DETECTED"
    assert checklist_map["Atmospheric Corrosion / Rust"]["status"] == "DETECTED"
    assert checklist_map["Liquid Accumulation / Pooling"]["status"] == "DETECTED"

    # Verify no false positive missing PPE
    for h in data["detected_hazards"]:
        assert "missing" not in h["hazard_label"].lower()

    assert data["sif_risk_rating"] == "CRITICAL"
    assert data["risk_score"] >= 80

def test_clean_safe_image_inspection():
    """Tests a clean safe image with no hazards."""
    img = Image.new("RGB", (200, 200), color=(120, 130, 140))
    buf = io.BytesIO()
    img.save(buf, format="PNG")

    response = client.post(
        "/api/vision/upload",
        files={"file": ("clean_deck.png", buf.getvalue(), "image/png")},
        data={"context_notes": "Clean deck inspection"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["sif_risk_rating"] == "LOW"
    assert len(data["detected_hazards"]) == 0
    assert data["risk_score"] < 25
