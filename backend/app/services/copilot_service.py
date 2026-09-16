import logging
from typing import Dict, Any, List

logger = logging.getLogger("OIL-SIF-AI.copilot")

class AdvancedAICopilotService:
    def answer_query(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        q = query.lower()

        standards = []
        sops = []
        actions = []
        warning = None

        if "h2s" in q or "hydrogen sulfide" in q or "sour gas" in q:
            standards = ["OSHA 1910.1000 Table Z-2 (H2S Limits)", "API RP 55 (Oil & Gas Operations Involving H2S)", "IOGP Life Saving Rule: Confined Space"]
            sops = ["SOP-H2S-004: Breathing Apparatus Pre-Entry Verification", "SOP-MON-012: Multi-Gas Detector Bump Testing"]
            actions = [
                "Evacuate upwind/crosswind immediately if ambient H2S > 10 PPM",
                "Don positive-pressure self-contained breathing apparatus (SCBA)",
                "Activate audible site alarm and verify windsock direction"
            ]
            warning = "CRITICAL SIF PRECURSOR: H2S causes olfactory paralysis within seconds at >100 PPM leading to rapid asphyxiation."
            answer = (
                "Hydrogen Sulfide (H2S) is a lethal neurotoxin encountered in sour oil/gas processing. "
                "Strict compliance with API RP 55 and OSHA standards requires continuous electronic monitoring, "
                "positive pressure air systems, buddy systems, and pre-established escape pathways."
            )

        elif "lift" in q or "crane" in q or "rigging" in q or "dropped" in q:
            standards = ["API RP 2D (Operation and Maintenance of Offshore Cranes)", "OSHA 1926.1400 (Cranes and Derricks)", "IOGP Life Saving Rule: Safe Mechanical Lifting"]
            sops = ["SOP-LIFT-001: Critical Lift Plan Level 3 Execution", "SOP-RIG-005: Color Coded Rigging Inspection & Tagging"]
            actions = [
                "Barricade 100% of the drop cone footprint under the load radius",
                "Verify Crane Operator and Rigger valid 3rd-party certifications",
                "Perform pre-lift safety huddle and inspect sling thimbles/shackles for distortion"
            ]
            warning = "SIF RISK: Uncontrolled drop of suspended loads >500kg represents high-probability fatal consequence."
            answer = (
                "Mechanical lifting operations offshore must comply with API RP 2D standards. "
                "A critical lift plan is mandatory whenever lifting over energized hydrocarbon process equipment, "
                "exceeding 85% rated crane capacity, or operating in sea states > 2.5m significant wave height."
            )

        elif "hot work" in q or "welding" in q or "flange" in q or "leak" in q or "fire" in q:
            standards = ["OSHA 1910.119 (Process Safety Management)", "API RP 75 (SEMS)", "API 2201 (Safe Hot Tapping in Petroleum Pipelines)"]
            sops = ["SOP-PTW-008: Hot Work Permit & Continuous Gas Monitoring", "SOP-ISOL-002: Positive Isolation & Double Block and Bleed"]
            actions = [
                "Obtain approved Hot Work Permit with Level 2 HSE sign-off",
                "Station dedicated fire watch with charged 30lb Purple-K extinguisher for minimum 60 mins post-work",
                "Verify LEL < 0.0% within 15 meters radius continuously"
            ]
            warning = "HIGH SIF HAZARD: Hot work in hydrocarbon processing zones requires mandatory LEL verification."
            answer = (
                "Hot work activities in oil & gas facilities require rigorous process safety management under OSHA 1910.119. "
                "All combustible materials must be shielded or removed within 35 feet, continuous LEL atmospheric monitoring maintained, "
                "and emergency shutdown valves (ESDV) tested before commencing ignition tasks."
            )

        else:
            standards = ["OSHA 1910 (General Industry Safety)", "API RP 75 (SEMS Offshore Operations)", "IOGP 459 Life-Saving Rules"]
            sops = ["SOP-SWA-001: Stop Work Authority Execution Protocol", "SOP-HSE-003: Near-Miss & Precursor Incident Investigation"]
            actions = [
                "Engage Stop Work Authority immediately if conditions deviate from approved plan",
                "Notify Area Safety Supervisor and record in OIL-SIF-AI platform",
                "Perform thorough root cause analysis before re-authorizing work permit"
            ]
            answer = (
                f"Based on Oil & Gas safety guidelines (API RP 75 / OSHA), addressing '{query}' requires verified "
                f"containment barriers, updated Job Safety Analyses (JSA), and active supervisor oversight to prevent SIF precursors."
            )

        related = [
            "How to verify secondary barrier integrity on high-pressure flanges?",
            "What are the mandatory permit requirements for SIMOPS?",
            "What are the IOGP Life-Saving Rules for Confined Space Entry?"
        ]

        return {
            "answer": answer,
            "cited_standards": standards,
            "sop_checklists": sops,
            "immediate_mitigations": actions,
            "sif_warning": warning,
            "related_queries": related
        }

copilot_service = AdvancedAICopilotService()
