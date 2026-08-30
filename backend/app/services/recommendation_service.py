from typing import List

class RecommendationService:
    """
    Generates hazard-specific, actionable safety controls and corrective actions
    based on the detected hazard domain and report context.
    """

    RECOMMENDATIONS_MAP = {
        "pressure": [
            "Immediately isolate the affected pressurized line or equipment at upstream/downstream manifolds.",
            "Depressurize and vent trapped inventory according to approved standard operating procedures (SOP).",
            "Establish an exclusion zone around the spray/spray-zone perimeter and restrict all unauthorized access.",
            "Inspect failed flange, gasket, or valve for mechanical fatigue, thermal degradation, or torque mismatch.",
            "Verify zero energy status and perform positive mechanical blinding before commencing repair work."
        ],
        "confined space": [
            "Issue immediate Stop-Work Order and prevent any personnel from entering the enclosed vessel.",
            "Perform calibrated 4-gas atmospheric testing (Oxygen, LEL, H2S, Carbon Monoxide) at multiple vertical strata.",
            "Verify active Confined Space Entry (CSE) permit, continuous mechanical forced ventilation, and certified standby watcher.",
            "Confirm mechanical, hydraulic, and electrical double-block-and-bleed (DBB) isolation on all incoming lines.",
            "Establish rapid emergency rescue retrieval equipment (tripod, harness winch, SCBA sets) outside entry portal."
        ],
        "working at height": [
            "Halt elevated operations until certified fall arrest systems (100% tie-off) are physically inspected.",
            "Verify that safety harnesses, self-retracting lifelines (SRLs), and approved anchor points meet load ratings.",
            "Inspect scaffolding, MEWPs, or ladder setups for valid green inspection tags and toe-board integrity.",
            "Erect red drop-zone barricades and warning signage on the deck directly below the elevated workspace.",
            "Mandate tool lanyards and tethering to prevent dropped object hazards to personnel underneath."
        ],
        "hot work": [
            "Immediately suspend hot work (welding, cutting, grinding) if combustible controls or gas testing are absent.",
            "Conduct continuous multi-point explosive gas (LEL) monitoring within a 35-foot perimeter.",
            "Remove, isolate, or shield all flammable crude oil, condensates, or combustible materials from spark trajectory.",
            "Confirm valid Hot Work Permit signed by authorized facility safety supervisor.",
            "Station a dedicated, trained fire watch equipped with pressurized fire extinguishers during and 30 minutes post-work."
        ],
        "energy isolation": [
            "Implement full Lockout / Tagout (LOTO) procedures on all primary and secondary energy sources.",
            "Verify zero energy state using bleed valves, pressure gauges, and electrical voltage testers.",
            "Apply individual personal padlocks and danger tags with authorized technician credentials.",
            "Install spectacle blinds or spade flanges where single-valve isolation is insufficient.",
            "Re-verify isolation integrity prior to breaking containment or loosening equipment bolts."
        ],
        "chemical exposure": [
            "Evacuate non-essential personnel upwind of the chemical release zone.",
            "Mandate full chemical-resistant personal protective equipment (PPE), including face shield and organic vapor respirators.",
            "Deploy neutralizing absorbent materials, containment booms, or drip pans to prevent sewer ingress.",
            "Review Safety Data Sheet (SDS) for specific neutralization and first aid emergency measures.",
            "Verify emergency eyewash and safety shower stations are fully operational within 10 seconds of travel."
        ],
        "electrical": [
            "De-energize electrical panels or circuits before beginning maintenance or inspection.",
            "Perform testing with calibrated voltage detectors to confirm absolute zero electrical potential.",
            "Maintain NFPA 70E Arc Flash boundary distances and wear appropriate arc-rated PPE.",
            "Inspect all portable power tools and cords for insulation fraying or ground fault circuit interrupter (GFCI) integrity.",
            "Ensure only certified high-voltage electricians perform repairs or terminations."
        ],
        "lifting": [
            "Suspend crane lifting operation until lift plan, rigging weight calculation, and slings are re-certified.",
            "Clear all personnel from the load swing radius and beneath the suspended load envelope.",
            "Inspect wire ropes, shackles, and hook latches for deformation, wear, or missing safety pins.",
            "Verify certified rigger and banksman are utilizing standardized hand signals or dedicated two-way radios.",
            "Check environmental wind velocity against crane manufacturer maximum operating limits."
        ],
        "heavy equipment": [
            "Establish physical exclusion zones separating pedestrian personnel from heavy machinery movement paths.",
            "Verify that all equipment backup alarms, flashing beacons, and 360-degree cameras are operational.",
            "Conduct pre-shift mechanical inspection on brakes, steering, hydraulics, and rollover protective structures (ROPS).",
            "Mandate high-visibility reflective safety vests for all field ground personnel.",
            "Ensure operators maintain positive eye contact before any worker approaches within 10 meters."
        ],
        "ppe": [
            "Provide appropriate certified PPE immediately matching the specific operational exposure.",
            "Conduct briefing on mandatory site PPE standards and proper fit-testing protocols.",
            "Replace defective, degraded, or expired safety gear before work resumes.",
            "Reinforce personal safety barrier accountability through tool-box talk safety audits."
        ],
        "housekeeping": [
            "Immediately remove loose tools, cables, debris, and hoses from transit walkways and stairs.",
            "Install high-visibility safety tape and temporary caution cones around any temporary uneven footing.",
            "Re-route temporary utility lines overhead or secure them with heavy-duty rubber cable ramps.",
            "Conduct walk-through housekeeping audit to verify unobstructed emergency exit routes.",
            "Reinforce 5S workplace tidiness standards during morning operations standup."
        ],
        "process safety": [
            "Activate emergency containment barriers and initiate unit verification procedures.",
            "Cross-check DCS (Distributed Control System) telemetry for pressure, temperature, and flow anomalies.",
            "Verify that safety instrumented systems (SIS) and high-level trip interlocks are online and un-bypassed.",
            "Conduct Management of Change (MOC) review prior to implementing temporary process deviations.",
            "Notify process safety engineering team for root cause integrity assessment."
        ],
    }

    DEFAULT_RECOMMENDATIONS = [
        "Issue immediate task pause or Stop-Work Authority until safety controls are re-verified.",
        "Perform joint site walkthrough with Area Safety Officer and Work Crew Supervisor.",
        "Update the Task Hazard Assessment (THA) to incorporate specific unaddressed site conditions.",
        "Ensure all personnel on-site participate in a mandatory pre-job safety briefing.",
        "Document and log the corrective action in the facility incident tracking register."
    ]

    def get_recommendations(self, hazard_category: str) -> List[str]:
        """Returns prioritized recommendations mapped to the detected hazard."""
        key = hazard_category.strip().lower()
        for k, v in self.RECOMMENDATIONS_MAP.items():
            if k in key or key in k:
                return v
        return self.DEFAULT_RECOMMENDATIONS

recommendation_service = RecommendationService()
