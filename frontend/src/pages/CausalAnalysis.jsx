import React, { useState, useEffect } from 'react';
import { GitCommit, Shield, AlertTriangle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

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
          <GitCommit size={14} /> Feature 5 ? Causal Risk Architecture
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Causal / Bow-Tie Safety Analysis
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
          Dynamic barrier modeling showing root threats, prevention barriers, top event, mitigation barriers, and consequences.
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
            className="industrial-input"
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
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: '700' }}>
              ? {bowtie.barrier_health_summary.Intact} Intact Barriers
            </span>
            <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', fontWeight: '700' }}>
              ? {bowtie.barrier_health_summary.Degraded} Degraded
            </span>
            <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', fontWeight: '700' }}>
              ? {bowtie.barrier_health_summary.Failed} Failed
            </span>
          </div>
        )}
      </div>

      {/* Bow-Tie Visual Layout */}
      {bowtie && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 1fr 1fr', gap: '1rem', alignItems: 'stretch' }}>
          {/* Threats (Left) */}
          <div className="glass-card" style={{ padding: '1rem', borderLeft: '3px solid #EF4444' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#EF4444', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              1. Root Threats
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bowtie.threats.map((t) => (
                <div key={t.id} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#EF4444', fontWeight: '800' }}>{t.id} ? {t.category}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#F1F5F9', marginTop: '0.2rem' }}>{t.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Prevention Barriers */}
          <div className="glass-card" style={{ padding: '1rem', borderLeft: '3px solid #38BDF8' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              2. Prevention Barriers
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bowtie.prevention_barriers.map((b) => (
                <div key={b.id} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.75rem', borderRadius: '6px', borderLeft: `3px solid ${b.health === 'Intact' ? '#10B981' : '#F59E0B'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: '800' }}>
                    <span style={{ color: '#38BDF8' }}>{b.type}</span>
                    <span style={{ color: b.health === 'Intact' ? '#10B981' : '#F59E0B' }}>{b.health}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#F1F5F9', marginTop: '0.2rem' }}>{b.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Event (Center) */}
          <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(239, 68, 68, 0.1)', border: '2px solid #EF4444', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#EF4444', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              CRITICAL TOP EVENT (LOPC)
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#FFFFFF', lineHeight: 1.3 }}>
              {bowtie.top_event}
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#CBD5E1', marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(0,0,0,0.4)', borderRadius: '6px' }}>
              Loss of Containment Envelope
            </div>
          </div>

          {/* Mitigation Barriers */}
          <div className="glass-card" style={{ padding: '1rem', borderLeft: '3px solid #10B981' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10B981', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              3. Mitigation Barriers
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bowtie.mitigation_barriers.map((b) => (
                <div key={b.id} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.75rem', borderRadius: '6px', borderLeft: `3px solid ${b.health === 'Intact' ? '#10B981' : '#F59E0B'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: '800' }}>
                    <span style={{ color: '#10B981' }}>{b.type}</span>
                    <span style={{ color: b.health === 'Intact' ? '#10B981' : '#F59E0B' }}>{b.health}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#F1F5F9', marginTop: '0.2rem' }}>{b.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Consequences (Right) */}
          <div className="glass-card" style={{ padding: '1rem', borderLeft: '3px solid #F97316' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#F97316', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              4. Worst-Case Impact
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bowtie.consequences.map((c) => (
                <div key={c.id} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#F97316', fontWeight: '800' }}>{c.id} ? {c.severity}</div>
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
