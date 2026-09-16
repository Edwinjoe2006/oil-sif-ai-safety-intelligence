import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.database.models import SafetyReport

logger = logging.getLogger("OIL-SIF-AI.bowtie")

class BowTieService:
    def generate_bowtie(self, hazard: str = None, report_text: str = None) -> Dict[str, Any]:
        hazard = hazard or "Hydrocarbon Release / Flammable Vapor"
        
        top_events_map = {
            "Hydrocarbon Release / Flammable Vapor": "Loss of Primary Containment (LOPC) - Volatile Gas Release",
            "High Pressure Piping & Flange Leaks": "Piping Rupture / Catastrophic Flange Blowout",
            "Heavy Lifting & Rigging Failures": "Dropped Suspended Heavy Load (>5 Tons)",
            "Electrical Arcing & High-Voltage Shock": "High-Voltage Arc Flash & Energized Enclosure Blast",
            "Confined Space Toxic Atmosphere": "Toxic H2S / Asphyxiant Atmosphere Ingress in Confined Space",
            "Well Control / Blowout Anomaly": "Uncontrolled Kick / Surface Blowout Incident",
            "Working at Height & Fall Hazard": "Personnel Fall from Height (>10m) Over Water/Deck",
        }
        
        top_event = top_events_map.get(hazard, f"Major Safety Incident Event - {hazard}")

        threats = [
            {"id": "T1", "label": "Flange Gasket Degradation & Thermal Fatigue", "category": "Mechanical Integrity"},
            {"id": "T2", "label": "Overpressurization from Blocked Discharge Line", "category": "Process Control"},
            {"id": "T3", "label": "Corrosion / Erosion Wall Thinning under Insulation (CUI)", "category": "Asset Integrity"},
            {"id": "T4", "label": "Inadequate Isolation during Live Line Maintenance", "category": "Human / Procedure"}
        ]

        prevention_barriers = [
            {"id": "PB1", "label": "Pressure Safety Valves (PSV) & High-High Trips", "health": "Intact", "type": "Engineered"},
            {"id": "PB2", "label": "Automated Emergency Depressurization (EDP) Loop", "health": "Intact", "type": "Automated"},
            {"id": "PB3", "label": "Non-Destructive Wall Thickness Testing Schedule", "health": "Degraded", "type": "Administrative"},
            {"id": "PB4", "label": "Strict Lockout/Tagout (LOTO) & Double Block and Bleed", "health": "Intact", "type": "Procedural"}
        ]

        mitigation_barriers = [
            {"id": "MB1", "label": "Fixed Optical Flame & Point Gas Detection Array", "health": "Intact", "type": "Detection"},
            {"id": "MB2", "label": "Automated Deluge Water Spray & Foam Fire Suppression", "health": "Intact", "type": "Mitigation"},
            {"id": "MB3", "label": "Blast-Resistant Control Room & Physical Firewalls", "health": "Intact", "type": "Passive"},
            {"id": "MB4", "label": "Emergency Muster Drills & Lifeboat Evacuation Protocols", "health": "Degraded", "type": "Emergency Response"}
        ]

        consequences = [
            {"id": "C1", "label": "Vapor Cloud Explosion (VCE) & Catastrophic Facility Asset Loss", "severity": "FATAL / CATASTROPHIC"},
            {"id": "C2", "label": "Multiple Serious Personnel Burn Injuries / Fatalities", "severity": "SIF LEVEL 1"},
            {"id": "C3", "label": "Major Environmental Marine Hydrocarbon Pollution", "severity": "TIER 1 SPILL"},
            {"id": "C4", "label": "Extended Operational Shutdown & Regulatory Enforcement", "severity": "MAJOR DOWNTIME"}
        ]

        barrier_health_summary = {
            "Intact": sum(1 for b in prevention_barriers + mitigation_barriers if b["health"] == "Intact"),
            "Degraded": sum(1 for b in prevention_barriers + mitigation_barriers if b["health"] == "Degraded"),
            "Failed": sum(1 for b in prevention_barriers + mitigation_barriers if b["health"] == "Failed")
        }

        return {
            "top_event": top_event,
            "hazard_category": hazard,
            "threats": threats,
            "prevention_barriers": prevention_barriers,
            "mitigation_barriers": mitigation_barriers,
            "consequences": consequences,
            "barrier_health_summary": barrier_health_summary
        }

    def get_bowtie_for_report(self, db: Session, report_id: int) -> Optional[Dict[str, Any]]:
        report = db.query(SafetyReport).filter(SafetyReport.id == report_id).first()
        if not report:
            return None
        if report.bow_tie:
            return report.bow_tie
        return self.generate_bowtie(report.hazard_category, report.report_text)

bowtie_service = BowTieService()
