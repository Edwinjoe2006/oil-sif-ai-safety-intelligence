import React, { useState, useEffect } from 'react';
import { GitCommit, Shield, AlertTriangle, CheckCircle, XCircle, ArrowRight, Info } from 'lucide-react';
import { api } from '../services/api';
import InfoTooltip from '../components/InfoTooltip';

export default function CausalAnalysis() {
  const [hazard, setHazard] = useState('Hydrocarbon Release / Flammable Vapor');
  const [bowtie, setBowtie] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadBowTie() {
    try {
      setLoading(true);
      const res = await api.generateBowTie({ hazard_category: hazard });
      setBowtie(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBowTie();
  }, [hazard]);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <GitCommit size={14} /> Feature 5 • Causal Barrier Architecture
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Causal / Bow-Tie Safety Analysis
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
          5-Second Visual Bow-Tie Model: Clearly showing how hazards may escalate and where preventive vs mitigative barriers act.
        </p>
      </div>

      {/* Hazard Selector & Health summary */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#CBD5E1' }}>
            Select Process Hazard:
          </label>
          <select
            value={hazard}
            onChange={(e) => setHazard(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '320px' }}
          >
            <option value="Hydrocarbon Release / Flammable Vapor">Hydrocarbon Release / Flammable Vapor</option>
            <option value="High Pressure Piping & Flange Leaks">High Pressure Piping & Flange Leaks</option>
            <option value="Heavy Lifting & Rigging Failures">Heavy Lifting & Rigging Failures</option>
            <option value="Electrical Arcing & High-Voltage Shock">Electrical Arcing & High-Voltage Shock</option>
            <option value="Confined Space Toxic Atmosphere">Confined Space Toxic Atmosphere</option>
            <option value="Well Control / Blowout Anomaly">Well Control / Blowout Anomaly</option>
            <option value="Working at Height & Fall Hazard">Working at Height & Fall Hazard</option>
          </select>
        </div>

        {bowtie?.barrier_health_summary && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: '700' }}>
              ✓ {bowtie.barrier_health_summary.Intact} Intact Barriers
            </span>
            <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', fontWeight: '700' }}>
              ⚠ {bowtie.barrier_health_summary.Degraded} Degraded
            </span>
            <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', fontWeight: '700' }}>
              ✕ {bowtie.barrier_health_summary.Failed} Failed
            </span>
          </div>
        )}
      </div>

      {/* Prevention vs Mitigation Clear Labels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '1rem', marginBottom: '0.75rem', textAlign: 'center' }}>
        <div style={{ background: 'rgba(56, 189, 248, 0.12)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)', fontSize: '0.8rem', fontWeight: '800', color: '#38BDF8' }}>
          PREVENTION: "What can stop escalation?"
        </div>
        <div style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.25)', fontSize: '0.8rem', fontWeight: '800', color: '#EF4444' }}>
          TOP EVENT: Loss of Control
        </div>
        <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.8rem', fontWeight: '800', color: '#10B981' }}>
          MITIGATION: "What can reduce consequences?"
        </div>
      </div>

      {/* Bow-Tie 5-Column Visual Layout */}
      {bowtie && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 1fr 1fr', gap: '1rem', alignItems: 'stretch' }}>
          {/* Threats (Left) */}
          <div className="glass-card" style={{ padding: '1rem', borderLeft: '3px solid #EF4444' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#EF4444', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              1. Root Threats
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bowtie.threats.map((t) => (
                <div key={t.id} style={{ background: '#0B132B', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#EF4444', fontWeight: '800' }}>{t.id} • {t.category}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#F1F5F9', marginTop: '0.2rem' }}>{t.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Prevention Barriers */}
          <div className="glass-card" style={{ padding: '1rem', borderLeft: '3px solid #38BDF8' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              2. Prevention Barriers
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bowtie.prevention_barriers.map((b) => (
                <div key={b.id} style={{ background: '#0B132B', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: '800' }}>{b.type}</span>
                    <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '3px', background: b.status === 'Intact' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: b.status === 'Intact' ? '#10B981' : '#F59E0B', fontWeight: '700' }}>
                      {b.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#F1F5F9', marginTop: '0.25rem' }}>{b.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Top Event (Loss of Containment) */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, #0B132B 100%)', border: '2px solid #EF4444' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '0.75rem' }}>
              <AlertTriangle size={24} />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOP EVENT / LOSS OF CONTROL
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.35rem' }}>
              {bowtie.top_event?.label || 'Loss of Primary Containment (LOPC)'}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#CBD5E1', marginTop: '0.5rem', lineHeight: '1.4' }}>
              Point in time when operational hazard control is lost.
            </p>
          </div>

          {/* Mitigation Barriers */}
          <div className="glass-card" style={{ padding: '1rem', borderLeft: '3px solid #10B981' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#10B981', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              4. Mitigation Barriers
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bowtie.mitigation_barriers.map((b) => (
                <div key={b.id} style={{ background: '#0B132B', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '800' }}>{b.type}</span>
                    <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '3px', background: b.status === 'Intact' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: b.status === 'Intact' ? '#10B981' : '#EF4444', fontWeight: '700' }}>
                      {b.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#F1F5F9', marginTop: '0.25rem' }}>{b.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Consequences (Right) */}
          <div className="glass-card" style={{ padding: '1rem', borderLeft: '3px solid #F97316' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#F97316', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              5. Potential Consequences
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bowtie.consequences.map((c) => (
                <div key={c.id} style={{ background: '#0B132B', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#F97316', fontWeight: '800' }}>{c.id} • {c.category}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#F1F5F9', marginTop: '0.2rem' }}>{c.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
