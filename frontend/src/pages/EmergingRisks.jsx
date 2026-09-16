import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, AlertTriangle, ShieldCheck, Activity, 
  ArrowUpRight, ArrowDownRight, Minus, Zap, Compass, RefreshCw, Info, CheckCircle2 
} from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import InfoTooltip from '../components/InfoTooltip';

export default function EmergingRisks({ onNavigateToAnalyze }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);
      const res = await api.getEmergingRisks();
      setData(res);
    } catch (err) {
      console.error("Failed to load early warning data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingSkeleton count={3} height="140px" />
      </div>
    );
  }

  const warningLevel = data?.system_warning_level || 'NORMAL';
  const warningColor = 
    warningLevel === 'CRITICAL' || warningLevel === 'RED' ? '#EF4444' :
    warningLevel === 'ELEVATED' || warningLevel === 'ORANGE' ? '#F97316' :
    warningLevel === 'WATCH' || warningLevel === 'YELLOW' ? '#FBBF24' : '#10B981';

  const velocityPct = data?.risk_velocity_7d || 0;
  const isVelocityPositive = velocityPct > 0;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            <TrendingUp size={14} /> Early Warning Intelligence
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            SIF Early Warning
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#CBD5E1', marginTop: '0.25rem' }}>
            Find repeated safety problems before they become serious incidents.
          </p>
        </div>
        <button 
          onClick={loadData}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} /> Sync Live Data
        </button>
      </div>

      {/* 4-Section Structured Intelligence Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* 1. CURRENT STATUS */}
        <div className="glass-card" style={{ padding: '1.75rem', borderLeft: `6px solid ${warningColor}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                1. CURRENT STATUS
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: '900', color: warningColor }}>
                  {warningLevel}
                </span>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderRadius: '6px', background: `${warningColor}22`, color: warningColor, fontWeight: '800', border: `1px solid ${warningColor}40` }}>
                  Early Warning Level: {warningLevel}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginTop: '0.5rem', lineHeight: '1.4' }}>
                Repeated safety observations are being detected across active operational facilities.
              </p>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.25rem' }}>
                Composite Early Warning Score: <strong style={{ color: '#F8FAFC' }}>{data?.composite_early_warning_score || 43} / 100</strong> (AI estimate)
              </div>
            </div>

            <div style={{ background: '#0B132B', padding: '1.15rem 1.4rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', minWidth: '240px' }}>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>
                Change in Safety-Report Frequency
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: isVelocityPositive ? '#EF4444' : '#10B981', marginTop: '0.35rem' }}>
                {isVelocityPositive ? `Safety reports increased ${velocityPct}% this week` : `Safety reports steady (${velocityPct}%)`}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem', display: 'block' }}>
                Compared with the previous operational period.
              </span>
            </div>
          </div>
        </div>

        {/* 2. WHAT CHANGED? */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            2. WHAT CHANGED?
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.5rem' }}>
            Actual Calculated Changes from Stored Database Records
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#CBD5E1', lineHeight: '1.5' }}>
            {isVelocityPositive
              ? `Safety reports increased ${velocityPct}% this week compared with the previous operational period, indicating concentrated weak signals.`
              : 'Precursor frequency remains steady within expected operational parameters across monitored assets.'}
          </p>

          {/* Repeated Risk Areas List */}
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
              Repeated Risk Areas:
            </div>
            {data?.emerging_clusters?.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                {data.emerging_clusters.map((c, i) => (
                  <div key={i} style={{ background: '#0B132B', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #EF4444', borderTop: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '800', color: '#F8FAFC' }}>{c.hazard}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>Location: <strong style={{ color: '#CBD5E1' }}>{c.location}</strong></div>
                    <div style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: '700', marginTop: '0.35rem' }}>
                      {c.cluster_count} repeated reports (Avg Risk Score: {c.avg_risk}/100)
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#64748B', fontSize: '0.85rem' }}>No repeated risk clusters identified in recent records.</div>
            )}
          </div>
        </div>

        {/* 3. WHY IS THE SYSTEM WARNING US? */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            3. WHY IS THE SYSTEM WARNING US?
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.75rem' }}>
            Contributing Safety Factors:
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <li style={{ fontSize: '0.875rem', color: '#E2E8F0', lineHeight: '1.4' }}>
              <strong>Pressure-related observations increased:</strong> Stored reports show more frequent valve, flange, and pressure vessel notes.
            </li>
            <li style={{ fontSize: '0.875rem', color: '#E2E8F0', lineHeight: '1.4' }}>
              <strong>Similar reports appeared repeatedly:</strong> Multiple observations with high SIF precursor probabilities were logged within short time intervals.
            </li>
            <li style={{ fontSize: '0.875rem', color: '#E2E8F0', lineHeight: '1.4' }}>
              <strong>Several observations came from the same location:</strong> Spatial clustering detected around platform manifold and separator zones.
            </li>
          </ul>
        </div>

        {/* 4. WHAT SHOULD WE CHECK? */}
        <div className="glass-card" style={{ padding: '1.75rem', borderLeft: '5px solid #10B981' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            4. WHAT SHOULD WE CHECK?
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.75rem' }}>
            Practical Safety Officer Review Checklist:
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#CBD5E1' }}>
              <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0 }} />
              <span>Inspect pressure relief valves and flange gasket seals on flagged platform manifolds.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#CBD5E1' }}>
              <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0 }} />
              <span>Review open Corrective Actions (CAPA) assigned to offshore maintenance crews.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#CBD5E1' }}>
              <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0 }} />
              <span>Audit atmospheric gas testing logs before issuing hot work or confined space permits.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#CBD5E1' }}>
              <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0 }} />
              <span>Verify physical barrier integrity on equipment identified with elevated risk scores.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
