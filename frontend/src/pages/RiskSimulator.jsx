import React, { useState, useEffect } from 'react';
import { Sliders, AlertTriangle, ShieldCheck, Zap, RotateCcw, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

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

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <Sliders size={14} /> Feature 4 ? Interactive Risk Engine
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          What-If Operational Risk Simulator
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
          Simulate operational stress parameters (pressure, fatigue, weather, barrier bypass) to observe real-time SIF escalation.
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
              className="industrial-input"
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
              <span>Wind Speed:</span>
              <strong style={{ color: wind > 25 ? '#EF4444' : '#38BDF8' }}>{wind} Knots</strong>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={wind}
              onChange={(e) => setWind(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38BDF8' }}
            />
          </div>

          {/* Equipment Wear */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.35rem' }}>
              <span>Equipment Wear / Degradation:</span>
              <strong style={{ color: wear > 60 ? '#EF4444' : '#38BDF8' }}>{wear}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={wear}
              onChange={(e) => setWear(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38BDF8' }}
            />
          </div>

          {/* Dropdowns Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.35rem' }}>
                Shift Type
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="industrial-input"
              >
                <option value="Day Shift">Day Shift</option>
                <option value="Night Shift">Night Shift</option>
                <option value="Turnaround">Turnaround (SIMOPS)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.35rem' }}>
                Crew Fatigue Level
              </label>
              <select
                value={fatigue}
                onChange={(e) => setFatigue(e.target.value)}
                className="industrial-input"
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
          </div>

          {/* Safety Barrier Status */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.35rem' }}>
              Safety Barrier Status
            </label>
            <select
              value={barrier}
              onChange={(e) => setBarrier(e.target.value)}
              className="industrial-input"
            >
              <option value="Active & Intact">Active & Intact</option>
              <option value="Partially Degraded">Partially Degraded</option>
              <option value="Bypassed">Bypassed (Critical Override)</option>
            </select>
          </div>
        </div>

        {/* Dynamic Simulation Output */}
        {simResult && (
          <div>
            {/* Risk Comparison Card */}
            <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', borderTop: `4px solid ${simResult.risk_level === 'CRITICAL' ? '#EF4444' : (simResult.risk_level === 'HIGH' ? '#F97316' : '#10B981')}` }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase' }}>
                SIMULATED RISK ASSESSMENT
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#F8FAFC' }}>
                    {simResult.simulated_risk_score} / 100
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: simResult.risk_level === 'CRITICAL' ? '#EF4444' : '#F97316' }}>
                    {simResult.risk_level} RISK
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: simResult.probability_delta > 0 ? '#EF4444' : '#10B981' }}>
                    {simResult.probability_delta > 0 ? `+${simResult.probability_delta}%` : `${simResult.probability_delta}%`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>DELTA FROM BASELINE</div>
                </div>
              </div>

              {/* SIF Probability Bar */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.35rem' }}>
                  <span>Simulated SIF Probability</span>
                  <strong style={{ color: '#F8FAFC' }}>{Math.round(simResult.simulated_sif_probability * 100)}%</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#0F172A', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${simResult.simulated_sif_probability * 100}%`, height: '100%', background: simResult.simulated_sif_probability > 0.6 ? '#EF4444' : '#38BDF8' }} />
                </div>
              </div>

              {/* Barrier Breakdown */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.5rem' }}>
                  Barrier Impact Multipliers:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {simResult.barrier_breakdown.map((b, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.5)', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                      <span style={{ color: '#E2E8F0' }}>{b.barrier_name}</span>
                      <strong style={{ color: b.status === 'Intact' ? '#10B981' : '#EF4444' }}>
                        {b.status} ({b.risk_multiplier}x)
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mitigation levers */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#10B981', marginBottom: '0.35rem' }}>
                  Actionable Risk De-escalation Levers:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.775rem', color: '#94A3B8', lineHeight: '1.4' }}>
                  {simResult.mitigation_levers.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
