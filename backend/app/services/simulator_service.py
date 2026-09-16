import logging
from typing import Dict, Any

logger = logging.getLogger("OIL-SIF-AI.simulator")

class RiskSimulatorService:
    def simulate_risk(self, params: Dict[str, Any]) -> Dict[str, Any]:
        hazard = params.get("hazard_category", "Hydrocarbon Release / Flammable Vapor")
        pressure = float(params.get("pressure_psi", 120.0))
        wind = float(params.get("wind_speed_knots", 18.0))
        shift = params.get("shift_type", "Night Shift")
        fatigue = params.get("crew_fatigue_level", "Moderate")
        barrier = params.get("safety_barrier_status", "Partially Degraded")
        wear = float(params.get("equipment_wear_pct", 45.0))
        exp = float(params.get("worker_experience_years", 3.5))

        base_prob = 0.35
        base_score = 48

        pressure_mult = 1.0 + max(0.0, (pressure - 100.0) / 300.0)
        wind_mult = 1.25 if wind > 25.0 else (1.10 if wind > 15.0 else 1.0)
        shift_mult = 1.25 if shift == "Night Shift" else (1.35 if shift == "Turnaround" else 1.0)
        fatigue_map = {"Low": 1.0, "Moderate": 1.15, "High": 1.35, "Severe": 1.55}
        fatigue_mult = fatigue_map.get(fatigue, 1.15)
        barrier_map = {"Active & Intact": 0.65, "Partially Degraded": 1.30, "Bypassed": 2.20}
        barrier_mult = barrier_map.get(barrier, 1.30)
        wear_mult = 1.0 + (wear / 100.0) * 0.45
        exp_mult = 0.85 if exp >= 7.0 else (1.0 if exp >= 3.0 else 1.30)

        composite_multiplier = (
            pressure_mult * 0.25 +
            wind_mult * 0.10 +
            shift_mult * 0.15 +
            fatigue_mult * 0.20 +
            barrier_mult * 0.30
        ) * wear_mult * exp_mult

        sim_prob = min(0.98, max(0.05, base_prob * composite_multiplier))
        sim_score = min(100, max(5, int(base_score * composite_multiplier)))
        delta_pct = round(((sim_prob - base_prob) / base_prob) * 100.0, 1)

        risk_level = "CRITICAL" if sim_score >= 75 else ("HIGH" if sim_score >= 50 else ("MEDIUM" if sim_score >= 25 else "LOW"))

        barrier_breakdown = [
            {
                "barrier_name": "Primary Containment & Pressure Relief",
                "status": "Degraded" if pressure > 200 or wear > 50 else "Intact",
                "risk_multiplier": round(pressure_mult * wear_mult, 2),
                "risk_delta_pct": round((pressure_mult * wear_mult - 1.0) * 100, 1)
            },
            {
                "barrier_name": "Administrative Controls & Shift Handover",
                "status": "Impaired" if shift in ["Night Shift", "Turnaround"] or fatigue in ["High", "Severe"] else "Intact",
                "risk_multiplier": round(shift_mult * fatigue_mult, 2),
                "risk_delta_pct": round((shift_mult * fatigue_mult - 1.0) * 100, 1)
            },
            {
                "barrier_name": "Engineered Interlocks & Safety Instrumented Systems (SIS)",
                "status": barrier,
                "risk_multiplier": round(barrier_mult, 2),
                "risk_delta_pct": round((barrier_mult - 1.0) * 100, 1)
            }
        ]

        vulnerabilities = []
        if pressure > 200:
            vulnerabilities.append(f"Extreme pressure load ({pressure} PSI) exceeds safe operating envelope margin")
        if fatigue in ["High", "Severe"]:
            vulnerabilities.append(f"Crew cognitive fatigue ({fatigue}) sharply increases human error probability")
        if barrier == "Bypassed":
            vulnerabilities.append("Critical safety interlocks currently bypassed without secondary compensatory controls")
        if not vulnerabilities:
            vulnerabilities.append("Operational parameters within tolerable thresholds with standard barrier vigilance")

        mitigations = [
            "De-rate operating system pressure to < 100 PSI until verification complete",
            "Implement mandatory dual-verifier permit validation for all critical line breaks",
            "Enforce 15-minute cognitive rest break and fatigue management protocol",
            "Restore bypassed SIS barrier immediately or halt non-essential hydrocarbons"
        ]

        return {
            "baseline_sif_probability": round(base_prob, 2),
            "simulated_sif_probability": round(sim_prob, 2),
            "probability_delta": delta_pct,
            "baseline_risk_score": base_score,
            "simulated_risk_score": sim_score,
            "risk_level": risk_level,
            "critical_vulnerabilities": vulnerabilities,
            "barrier_breakdown": barrier_breakdown,
            "mitigation_levers": mitigations
        }

simulator_service = RiskSimulatorService()
