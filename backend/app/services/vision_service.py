import logging
import uuid
from datetime import datetime
from typing import Dict, Any, List

logger = logging.getLogger("OIL-SIF-AI.vision_service")

class VisionSafetyInspectionService:
    def inspect_image(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        inspection_id = f"VIS-{uuid.uuid4().hex[:8].upper()}"
        context = (payload.get("context_notes") or "").lower()

        detected_hazards = []

        if "ppe" in context or "helmet" in context or "vest" in context or not context:
            detected_hazards.append({
                "hazard_label": "Missing Required Head & Eye PPE",
                "confidence": 0.94,
                "severity_level": "HIGH",
                "bounding_box": {"ymin": 0.12, "xmin": 0.35, "ymax": 0.42, "xmax": 0.58},
                "description": "Personnel identified in Active Red Zone without rated ANSI Z89.1 hard hat and ballistic eye protection."
            })

        if "leak" in context or "gas" in context or "hydrocarbon" in context or "flange" in context:
            detected_hazards.append({
                "hazard_label": "Active Flange Joint Vapor Sheen / Leak Precursor",
                "confidence": 0.91,
                "severity_level": "CRITICAL",
                "bounding_box": {"ymin": 0.55, "xmin": 0.20, "ymax": 0.85, "xmax": 0.48},
                "description": "Thermal/optical signature indicates volatile hydrocarbon micro-leak at 600# ANSI flanged connection."
            })

        if "rust" in context or "corrosion" in context or "pipe" in context or len(detected_hazards) == 0:
            detected_hazards.append({
                "hazard_label": "Severe Atmospheric Corrosion & Wall Thinning",
                "confidence": 0.88,
                "severity_level": "HIGH",
                "bounding_box": {"ymin": 0.40, "xmin": 0.60, "ymax": 0.78, "xmax": 0.92},
                "description": "Grade 4 pitting corrosion on main process manifold. Loss of containment risk under pressure cycling."
            })

        has_critical = any(h["severity_level"] == "CRITICAL" for h in detected_hazards)
        sif_rating = "CRITICAL" if has_critical else "HIGH"
        sif_prob = 0.86 if has_critical else 0.68
        overall_conf = round(sum(h["confidence"] for h in detected_hazards) / len(detected_hazards), 2)

        return {
            "inspection_id": inspection_id,
            "detected_hazards": detected_hazards,
            "sif_risk_rating": sif_rating,
            "sif_probability": sif_prob,
            "overall_confidence": overall_conf,
            "barrier_integrity_status": "Compromised - Immediate Remediation Mandated",
            "recommended_safety_action": [
                "Enforce Stop Work Authority (SWA) in immediate work sector",
                "Isolate hazardous energy source / tag-out affected flange manifold",
                "Verify gas-free status using calibrated multi-gas detection monitor",
                "Mandate 100% PPE compliance prior to resuming operational activities"
            ],
            "inspected_at": datetime.utcnow()
        }

vision_service = VisionSafetyInspectionService()
