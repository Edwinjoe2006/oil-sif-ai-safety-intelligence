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

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            <TrendingUp size={14} /> Feature 1 • Predictive Risk Intelligence
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            SIF Early Warning & Emerging Risk Engine
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            Answers: What is the system status? What changed in precursor frequency? Why did it change? And what should be reviewed?
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
        
        {/* 1. SYSTEM STATUS */}
        <div className="glass-card" style={{ padding: '1.75rem', borderLeft: `6px solid ${warningColor}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                1. SYSTEM STATUS
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: '900', color: warningColor }}>
                  {warningLevel}
                </span>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderRadius: '6px', background: `${warningColor}22`, color: warningColor, fontWeight: '800', border: `1px solid ${warningColor}40` }}>
                  {data?.risk_acceleration || 'STEADY RATE'}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#CBD5E1', marginTop: '0.5rem' }}>
                Composite Early Warning Index: <strong style={{ color: '#F8FAFC' }}>{data?.composite_early_warning_score || 0} / 100</strong>
              </p>
            </div>

            <div style={{ background: '#0B132B', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>7-Day Precursor Velocity</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: (data?.risk_velocity_7d || 0) > 0 ? '#EF4444' : '#10B981', marginTop: '0.25rem' }}>
                {(data?.risk_velocity_7d || 0) > 0 ? `+${data?.risk_velocity_7d}%` : `${data?.risk_velocity_7d}%`}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Rolling weekly frequency change</span>
            </div>
          </div>
        </div>

        {/* 2. WHAT CHANGED? */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            2. WHAT CHANGED?
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.5rem' }}>
            Observed Changes in Stored Precursor Observations
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#CBD5E1', lineHeight: '1.5' }}>
            {data?.risk_velocity_7d > 0
              ? `Precursor reports increased by ${data.risk_velocity_7d}% compared with the previous operational period, indicating concentrated weak signals.`
              : 'Precursor frequency remains within baseline operational variance across monitored platforms.'}
          </p>

          {/* Cluster List */}
          {data?.emerging_clusters?.length > 0 && (
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
              {data.emerging_clusters.map((c, i) => (
                <div key={i} style={{ background: '#0B132B', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #EF4444' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#F8FAFC' }}>{c.hazard}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.2rem' }}>Location: {c.location}</div>
                  <div style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: '700', marginTop: '0.35rem' }}>
                    {c.cluster_count} repeated reports (Avg Risk: {c.avg_risk}/100)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. WHY? */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            3. WHY? (Contributing Drivers)
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li style={{ fontSize: '0.875rem', color: '#E2E8F0', lineHeight: '1.4' }}>
              More precursor-related observations logged in pressurized process systems and piping.
            </li>
            <li style={{ fontSize: '0.875rem', color: '#E2E8F0', lineHeight: '1.4' }}>
              Elevated concentration of SIF precursor flags requiring secondary containment checks.
            </li>
            <li style={{ fontSize: '0.875rem', color: '#E2E8F0', lineHeight: '1.4' }}>
              Spatial clustering around offshore manifolds and wellheads with overdue inspection routines.
            </li>
          </ul>
        </div>

        {/* 4. WHAT SHOULD BE REVIEWED? */}
        <div className="glass-card" style={{ padding: '1.75rem', borderLeft: '5px solid #10B981' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            4. WHAT SHOULD BE REVIEWED?
          </div>
          <p style={{ fontSize: '0.9rem', color: '#F1F5F9', fontWeight: '600', marginBottom: '0.75rem' }}>
            Recommended Safety Officer Review Checklist:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#CBD5E1' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>Inspect pressure relief valves and flange gasket seals on flagged platform manifolds.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#CBD5E1' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>Review open Corrective Actions (CAPA) assigned to offshore maintenance crews.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#CBD5E1' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>Audit atmospheric gas testing logs before issuing hot work or confined space permits.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
