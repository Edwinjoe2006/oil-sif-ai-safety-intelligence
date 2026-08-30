import re
from typing import List, Dict, Any

class ExplanationService:
    """
    NLP service to extract dangerous factors from report text, generate contextual
    explanations ('Why is this dangerous?'), potential consequences, and potential
    incident escalation pathways.
    """

    # Domain keyword / regex patterns for relevant dangerous factor detection
    FACTOR_PATTERNS = {
        "High Pressure": [
            r"\b(high[ -]?pressure|psi|bar|overpressure|relief valve|pressurized)\b"
        ],
        "Loss of Containment / Leak": [
            r"\b(leak|leaking|seepage|flange gasket|rupture|spray|pinhole|spill|containment)\b"
        ],
        "Worker Exposure": [
            r"\b(technician|worker|operator|personnel|crew|spray zone|exposure|unprotected)\b"
        ],
        "Confined Space Activity": [
            r"\b(confined space|vessel|tank|manhole|chamber|entry without|vault)\b"
        ],
        "Missing Gas Testing / Atmospheric Hazard": [
            r"\b(gas test|atmospheric|toxic gas|h2s|combustible|oxygen deficient|lel|methane|hydrocarbon)\b"
        ],
        "Working at Height / Fall Exposure": [
            r"\b(height|scaffold|ladder|fall protection|harness|elevated|grating|handrail|fall risk)\b"
        ],
        "Missing PPE": [
            r"\b(missing ppe|without proper protection|no respirator|unshielded|no helmet|no safety glasses)\b"
        ],
        "Hot Work": [
            r"\b(hot work|welding|grinding|cutting|torch|sparks|slag)\b"
        ],
        "Flammable Material": [
            r"\b(flammable|crude oil|fuel|diesel|condensate|volatile|combustible)\b"
        ],
        "Fire / Explosion Hazard": [
            r"\b(fire|explosion|blast|flash|ignition source|combustion)\b"
        ],
        "Energy Isolation Failure": [
            r"\b(isolation|loto|lockout|tagout|energized|bypassed valve|live line)\b"
        ],
        "Bypassed Safety Control": [
            r"\b(bypassed|override|disabled interlock|jumped|tampered|ignored alarm)\b"
        ],
        "Electrical Exposure": [
            r"\b(electrical|high voltage|exposed cable|short circuit|shock|arc flash|transformer)\b"
        ],
        "Heavy Equipment / Struck-By": [
            r"\b(crane|forklift|heavy equipment|excavator|truck|struck by|collision|rig floor)\b"
        ],
        "Lifting / Dropped Object": [
            r"\b(rigging|hoist|sling|dropped object|suspended load|overhead load)\b"
        ],
        "Chemical Exposure": [
            r"\b(chemical|acid|caustic|toxic|solvent|corrosive|inhalation)\b"
        ],
        "Unsafe Access / Egress": [
            r"\b(access|egress|blocked exit|escape route|cluttered passageway)\b"
        ],
        "Poor Housekeeping / Tripping": [
            r"\b(housekeeping|tripping|slip|loose material|clutter|untidy|debris|walkway obstruction)\b"
        ],
    }

    CONSEQUENCES_BY_HAZARD = {
        "pressure": [
            "Catastrophic line rupture and uncontrolled high-pressure fluid ejection.",
            "Severe blunt force or penetrating trauma to personnel in the line of fire.",
            "Formation of flammable oil mist or toxic aerosol cloud."
        ],
        "confined space": [
            "Acute asphyxiation from oxygen depletion or toxic gas inhalation (H2S/CO).",
            "Rapid loss of worker consciousness with inability to perform self-rescue.",
            "Secondary fatality risk for unprepared rescue responders."
        ],
        "fire/explosion": [
            "Immediate vapor cloud ignition or boiling liquid expanding vapor explosion (BLEVE).",
            "Severe thermal radiation burns and structural collapse of nearby process modules.",
            "Multi-unit cascade fire requiring emergency shutdown (ESD) activation."
        ],
        "working at height": [
            "Free-fall from elevation leading to polytrauma or fatality.",
            "Suspension trauma if arrested without rapid retrieval plan.",
            "Impact with structural steel, piping, or machinery below."
        ],
        "energy isolation": [
            "Unexpected mechanical actuation or sudden re-pressurization during maintenance.",
            "Electrocution, severe crushing, or hydraulic injection injuries.",
            "Unplanned process fluid release into the active work environment."
        ],
        "chemical exposure": [
            "Chemical burns, pulmonary edema, or irreversible eye damage.",
            "Systemic toxic poisoning via dermal absorption or inhalation.",
            "Environmental contamination beyond secondary containment."
        ],
        "electrical": [
            "Severe electrical burn, cardiac arrest, or secondary fall injuries.",
            "Arc flash thermal blast causing severe third-degree burns and blast overpressure.",
            "Ignition of surrounding flammable atmospheric mixtures."
        ],
        "lifting": [
            "Dropped object impact with severe crush injuries or fatality to ground workers.",
            "Structural damage to critical process piping or pressurized vessels underneath.",
            "Crane or rigging failure causing load swing and personnel trapment."
        ],
        "heavy equipment": [
            "Worker pinned, run over, or struck by moving heavy machinery.",
            "Equipment rollover on uneven field or wellpad terrain.",
            "Impact with live hydrocarbon pipelines or wellhead manifolds."
        ],
        "ppe": [
            "Direct physical, ocular, or respiratory contact with hazardous agents.",
            "Lack of primary barrier during sudden minor process upsets."
        ],
        "housekeeping": [
            "Slip, trip, or fall on same level resulting in fractures, sprains, or contusions.",
            "Impeded emergency egress routes during facility fire alarms."
        ],
        "process safety": [
            "Major loss of primary containment (LOPC) of flammable hydrocarbons.",
            "Process parameter runaways (overpressure, high temperature) leading to vessel failure.",
            "Activation of safety relief valves with potential atmospheric dispersion."
        ],
    }

    ESCALATION_PATHWAYS = {
        "pressure": [
            {"step_number": 1, "stage": "Unsafe Condition", "description": "Compromised seal or mechanical integrity under high operating pressure."},
            {"step_number": 2, "stage": "Hazard Presence", "description": "High-velocity jet or mist leakage into active work envelope."},
            {"step_number": 3, "stage": "Worker Exposure", "description": "Technicians working directly in line-of-fire without standoff distance."},
            {"step_number": 4, "stage": "Loss of Control", "description": "Sudden catastrophic gasket blowout or piping failure."},
            {"step_number": 5, "stage": "Major Incident (SIF)", "description": "High-pressure fluid injection or flammable vapor ignition causing serious injury/fatality."}
        ],
        "confined space": [
            {"step_number": 1, "stage": "Unsafe Act", "description": "Unauthorized worker entry without atmospheric clearance or permit."},
            {"step_number": 2, "stage": "Hazard Presence", "description": "Oxygen deficient or toxic/flammable atmosphere inside enclosure."},
            {"step_number": 3, "stage": "Worker Exposure", "description": "Worker inhalation of toxic gases or rapid lack of breathable oxygen."},
            {"step_number": 4, "stage": "Loss of Control", "description": "Rapid worker incapacitation; lack of active standby rescue team."},
            {"step_number": 5, "stage": "Major Incident (SIF)", "description": "Fatal asphyxiation and compounded risk to emergency responders."}
        ],
        "working at height": [
            {"step_number": 1, "stage": "Unsafe Condition", "description": "Elevated task executed without verified 100% tie-off or edge protection."},
            {"step_number": 2, "stage": "Hazard Presence", "description": "Unprotected edge, slippery surface, or sudden loss of balance."},
            {"step_number": 3, "stage": "Worker Exposure", "description": "Gravitational free-fall from elevation without secondary arrest."},
            {"step_number": 4, "stage": "Loss of Control", "description": "High-impact deceleration with structural steel or deck below."},
            {"step_number": 5, "stage": "Major Incident (SIF)", "description": "Severe blunt force polytrauma or fatal fall."}
        ],
        "fire/explosion": [
            {"step_number": 1, "stage": "Unsafe Act", "description": "Hot work or ignition source introduced near flammable vapors."},
            {"step_number": 2, "stage": "Hazard Presence", "description": "Hydrocarbon vapor concentration reaches lower explosive limit (LEL)."},
            {"step_number": 3, "stage": "Worker Exposure", "description": "Ignition of vapor cloud without immediate suppression barrier."},
            {"step_number": 4, "stage": "Loss of Control", "description": "Rapid thermal flash fire propagating to nearby process lines."},
            {"step_number": 5, "stage": "Major Incident (SIF)", "description": "Critical burn injuries, blast wave overpressure, and facility emergency."}
        ],
        "housekeeping": [
            {"step_number": 1, "stage": "Unsafe Condition", "description": "Debris, hoses, or equipment left obstructing transit walkways."},
            {"step_number": 2, "stage": "Hazard Presence", "description": "Reduced path clearance and concealed footing hazards."},
            {"step_number": 3, "stage": "Worker Exposure", "description": "Personnel walking through path while carrying tools or in low light."},
            {"step_number": 4, "stage": "Loss of Control", "description": "Trip or slip event causing worker fall onto floor or machinery edge."},
            {"step_number": 5, "stage": "Minor / Moderate Injury", "description": "Musculoskeletal sprain, laceration, or bone fracture."}
        ],
    }

    def detect_factors(self, report_text: str) -> List[str]:
        """Scans report text for specific dangerous safety factors using pattern matching."""
        detected = []
        text_lower = report_text.lower()
        for factor_name, patterns in self.FACTOR_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text_lower, re.IGNORECASE):
                    detected.append(factor_name)
                    break
        return detected

    def generate_why_dangerous(
        self, 
        report_text: str, 
        hazard_category: str, 
        severity: str, 
        factors: List[str]
    ) -> str:
        """Generates dynamic explanation grounded in the actual submitted report."""
        haz = hazard_category.strip()
        sev = severity.strip().upper()
        
        factor_str = ", ".join(factors[:3]) if factors else f"potential {haz} conditions"
        
        explanation = (
            f"This scenario presents an elevated {sev} severity risk involving {haz}. "
            f"Key contributing factors identified from the report include: {factor_str}. "
        )
        
        if "High Pressure" in factors or "Loss of Containment / Leak" in factors:
            explanation += "Under pressurized containment, fluid releases can cause violent mechanical kinetic impact or rapid flammable cloud dispersion before isolation barriers can be actuated."
        elif "Confined Space Activity" in factors:
            explanation += "Confined spaces prevent natural atmospheric exchange. In the absence of confirmed gas clearances, toxic gas accumulation (such as H2S) or oxygen displacement can incapacitate personnel within seconds."
        elif "Working at Height / Fall Exposure" in factors:
            explanation += "Working aloft without continuous fall arrest leaves zero margin for human error or mechanical slips, where gravity-driven kinetic energy almost universally results in critical blunt trauma."
        elif "Hot Work" in factors:
            explanation += "Introducing active ignition sources into hydrocarbon operating environments bypasses primary fire safety envelopes and can trigger rapid vapor ignition."
        elif "Poor Housekeeping / Tripping" in factors:
            explanation += "While immediate fatality potential is lower, obstructed walkways compromise rapid emergency egress routes during plant emergencies and cause disabling musculoskeletal injuries."
        else:
            explanation += f"The operational combination of {haz} hazards creates an active risk pathway towards barrier failure if immediate corrective controls are not enforced."

        return explanation

    def get_consequences(self, hazard_category: str) -> List[str]:
        """Returns hazard-specific consequences."""
        key = hazard_category.strip().lower()
        for k, v in self.CONSEQUENCES_BY_HAZARD.items():
            if k in key or key in k:
                return v
        # Default fallback
        return [
            f"Uncontrolled escalation of {hazard_category} hazard.",
            "Potential personnel injury or equipment compromise.",
            "Operational interruption and regulatory non-compliance."
        ]

    def get_escalation_path(self, hazard_category: str) -> List[Dict[str, Any]]:
        """Returns the potential incident escalation path for the detected hazard."""
        key = hazard_category.strip().lower()
        for k, v in self.ESCALATION_PATHWAYS.items():
            if k in key or key in k:
                return v
        
        # Generic fallback pathway
        return [
            {"step_number": 1, "stage": "Unsafe Act / Condition", "description": f"Initial deviation involving {hazard_category} controls."},
            {"step_number": 2, "stage": "Hazard Presence", "description": "Uncontrolled energy or toxic exposure in active workspace."},
            {"step_number": 3, "stage": "Worker Exposure", "description": "Personnel operating in direct proximity to uncontained hazard."},
            {"step_number": 4, "stage": "Loss of Control", "description": "Failure of secondary administrative or engineering barrier."},
            {"step_number": 5, "stage": "Major Incident (SIF)", "description": "Severe injury or fatality potential due to energy transfer."}
        ]

    def generate_copilot_explanation(
        self,
        report_text: str,
        hazard_category: str,
        severity: str,
        sif_precursor: bool,
        sif_probability: float,
        risk_score: int,
        factors: List[str],
        actions: List[str]
    ) -> Dict[str, Any]:
        """Constructs AI Safety Copilot overview."""
        why_dangerous = self.generate_why_dangerous(report_text, hazard_category, severity, factors)
        consequences = self.get_consequences(hazard_category)
        
        priority = "IMMEDIATE STOP-WORK REQUIRED" if (sif_precursor or risk_score >= 75) else (
            "HIGH PRIORITY REMEDIATION" if risk_score >= 50 else (
                "SCHEDULED SAFETY MITIGATION" if risk_score >= 25 else "ROUTINE SAFETY ACTION"
            )
        )

        return {
            "why_dangerous": why_dangerous,
            "potential_consequence": consequences[0] if consequences else "Potential personnel harm.",
            "main_risk_factors": factors if factors else [hazard_category],
            "recommended_immediate_actions": actions[:3],
            "priority": priority
        }

explanation_service = ExplanationService()
