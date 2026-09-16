import React, { useState, useEffect } from 'react';
import { Sliders, AlertTriangle, ShieldCheck, Zap, RotateCcw, ArrowRight, Info } from 'lucide-react';
import { api } from '../services/api';
import InfoTooltip from '../components/InfoTooltip';

export default function RiskSimulator() {
  const [pressure, setPressure] = useState(160);
  const [wind, setWind] = useState(22);
  const [shift, setShift] = useState('Night Shift');
  const [fatigue, setFatigue] = useState('High');
  const [barrier, setBarrier] = useState('Partially Degraded');
  const [wear, setWear] = useState(55);
  const [experience, setExperience] = useState(2.5);
  const [hazard, setHazard] = useState('Hydrocarbon Release / Flammable Vapor');

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Baseline standard risk reference
  const baselineRisk = 45;

  async function runSimulation() {
    try {
      setLoading(true);
      const res = await api.simulateRisk({
        hazard_category: hazard,
        pressure_psi: pressure,
        wind_speed_knots: wind,
        shift_type: shift,
        crew_fatigue_level: fatigue,
        safety_barrier_status: barrier,
        equipment_wear_pct: wear,
        worker_experience_years: experience
      });
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSimulation();
  }, [pressure, wind, shift, fatigue, barrier, wear, experience, hazard]);

  const simulatedRisk = simResult?.simulated_risk_score || baselineRisk;
  const riskDelta = simulatedRisk - baselineRisk;

  return (
    <div className="page-wrapper">
      {/* Header with Explicit Purpose */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <Sliders size={14} /> Feature 4 • Interactive Risk Simulator
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          What-If Operational Risk Simulator
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginTop: '0.35rem', maxWidth: '720px', lineHeight: '1.5' }}>
          <strong>Purpose:</strong> Explore how changing selected operational or safety-control conditions affects the model's risk score.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Interactive Controls */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '1.25rem' }}>
            Operational Variable Controls
          </h3>

          {/* Hazard Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.35rem' }}>
              Hazard Category Domain
            </label>
            <select
              value={hazard}
              onChange={(e) => setHazard(e.target.value)}
              className="form-select"
            >
              <option value="Hydrocarbon Release / Flammable Vapor">Hydrocarbon Release / Flammable Vapor</option>
              <option value="High Pressure Piping & Flange Leaks">High Pressure Piping & Flange Leaks</option>
              <option value="Heavy Lifting & Rigging Failures">Heavy Lifting & Rigging Failures</option>
              <option value="Electrical Arcing & High-Voltage Shock">Electrical Arcing & High-Voltage Shock</option>
              <option value="Well Control / Blowout Anomaly">Well Control / Blowout Anomaly</option>
            </select>
          </div>

          {/* Pressure Slider */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.35rem' }}>
              <span>Operating System Pressure:</span>
              <strong style={{ color: pressure > 200 ? '#EF4444' : '#38BDF8' }}>{pressure} PSI</strong>
            </div>
            <input
              type="range"
              min="50"
              max="400"
              value={pressure}
              onChange={(e) => setPressure(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38BDF8' }}
            />
          </div>

          {/* Wind Speed Slider */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.35rem' }}>
              <span>Offshore Wind Speed:</span>
              <strong style={{ color: wind > 30 ? '#EF4444' : '#38BDF8' }}>{wind} Knots</strong>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={wind}
              onChange={(e) => setWind(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38BDF8' }}
            />
          </div>

          {/* Safety Barrier Status */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.35rem' }}>
              Safety Barrier Status (Engineering Controls)
            </label>
            <select
              value={barrier}
              onChange={(e) => setBarrier(e.target.value)}
              className="form-select"
            >
              <option value="Intact">Intact (All Controls Functioning)</option>
              <option value="Partially Degraded">Partially Degraded</option>
              <option value="Bypassed / Inactive">Bypassed / Inactive (Emergency Risk)</option>
            </select>
          </div>

          {/* Fatigue Level */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.35rem' }}>
              Crew Fatigue / Shift Timing
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              {['Low', 'Moderate', 'High'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFatigue(lvl)}
                  className="btn btn-secondary"
                  style={{
                    background: fatigue === lvl ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    borderColor: fatigue === lvl ? '#38BDF8' : 'rgba(255,255,255,0.1)',
                    color: fatigue === lvl ? '#38BDF8' : '#94A3B8',
                    fontSize: '0.8rem'
                  }}
                >
                  {lvl} Fatigue
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Simulation Output Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem', borderLeft: `6px solid ${simulatedRisk >= 75 ? '#EF4444' : simulatedRisk >= 50 ? '#F97316' : '#10B981'}` }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              SIMULATED RISK ASSESSMENT
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#070D1E', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700' }}>CURRENT BASELINE RISK</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#94A3B8' }}>{baselineRisk} / 100</div>
              </div>
              <div style={{ background: '#070D1E', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: '700' }}>SIMULATED RISK</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '900', color: simulatedRisk >= 75 ? '#EF4444' : simulatedRisk >= 50 ? '#F97316' : '#10B981' }}>
                  {simulatedRisk} / 100
                </div>
              </div>
            </div>

            {/* Delta points */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.825rem', color: '#CBD5E1', fontWeight: '600' }}>Risk Score Delta:</span>
              <strong style={{ fontSize: '1rem', color: riskDelta > 0 ? '#EF4444' : '#10B981' }}>
                {riskDelta > 0 ? `+${riskDelta}` : `${riskDelta}`} points
              </strong>
            </div>

            {/* Explanatory notes */}
            <div style={{ fontSize: '0.825rem', color: '#CBD5E1', lineHeight: '1.4', marginBottom: '1rem' }}>
              <strong>Selected Change:</strong> {barrier} barrier with {fatigue.toLowerCase()} crew fatigue at {pressure} PSI.
            </div>

            {/* Explicit Disclaimer */}
            <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '0.75rem', color: '#38BDF8', lineHeight: '1.4' }}>
              <Info size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              <strong>Model-based simulation only.</strong> This does not guarantee actual field risk reduction and is designed for engineering what-if scenarios and safety training.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
