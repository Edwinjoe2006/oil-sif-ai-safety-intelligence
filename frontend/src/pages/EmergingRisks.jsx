import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, AlertTriangle, ShieldCheck, Activity, 
  ArrowUpRight, ArrowDownRight, Minus, Zap, Compass, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

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

  const warningColor = 
    data?.system_warning_level === 'RED' ? '#EF4444' :
    data?.system_warning_level === 'ORANGE' ? '#F97316' :
    data?.system_warning_level === 'YELLOW' ? '#FBBF24' : '#10B981';

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            <TrendingUp size={14} /> Feature 1 ? Predictive Risk Intelligence
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            SIF Early Warning & Emerging Risk Engine
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            Real-time precursor velocity tracking, localized cluster detection, and early weak signal alerts.
          </p>
        </div>
        <button 
          onClick={loadData}
          className="secondary-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} /> Refresh Engine
        </button>
      </div>

      {/* Hero KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Early Warning Level */}
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: `5px solid ${warningColor}` }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' }}>
            System Threat Level
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: '900', color: warningColor }}>
              {data?.system_warning_level || 'GREEN'}
            </span>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: `${warningColor}22`, color: warningColor, fontWeight: '700' }}>
              {data?.risk_acceleration}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.5rem' }}>
            Composite Early Warning Score: <strong style={{ color: '#F8FAFC' }}>{data?.composite_early_warning_score}/100</strong>
          </div>
        </div>

        {/* Risk Velocity */}
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '5px solid #38BDF8' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' }}>
            7-Day Precursor Velocity
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: '900', color: (data?.risk_velocity_7d || 0) > 0 ? '#EF4444' : '#10B981' }}>
              {(data?.risk_velocity_7d || 0) > 0 ? `+${data?.risk_velocity_7d}%` : `${data?.risk_velocity_7d}%`}
            </span>
            {(data?.risk_velocity_7d || 0) > 0 ? <ArrowUpRight size={24} color="#EF4444" /> : <ArrowDownRight size={24} color="#10B981" />}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.5rem' }}>
            Rolling weekly incident frequency delta
          </div>
        </div>

        {/* Detected Clusters */}
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '5px solid #F59E0B' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' }}>
            Active Precursor Clusters
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#F59E0B', marginTop: '0.5rem' }}>
            {data?.emerging_clusters?.length || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.5rem' }}>
            High density hazard + location pairings
          </div>
        </div>
      </div>

      {/* Emerging Precursor Clusters */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} color="#38BDF8" /> Precursor Density & Velocity Clusters
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {data?.emerging_clusters?.map((cluster, idx) => {
            const levelColor = 
              cluster.early_warning_level === 'CRITICAL' ? '#EF4444' :
              cluster.early_warning_level === 'HIGH' ? '#F97316' : '#38BDF8';

            return (
              <div key={idx} className="glass-card" style={{ padding: '1.5rem', borderTop: `4px solid ${levelColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '4px', background: `${levelColor}22`, color: levelColor, textTransform: 'uppercase' }}>
                      {cluster.early_warning_level}
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#F8FAFC', marginTop: '0.5rem' }}>
                      {cluster.hazard}
                    </h4>
                    <p style={{ fontSize: '0.825rem', color: '#94A3B8' }}>{cluster.location}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F8FAFC' }}>
                      {cluster.precursor_count}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>precursors</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#38BDF8', marginBottom: '0.35rem' }}>
                    Key Trigger Drivers:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#CBD5E1', lineHeight: '1.4' }}>
                    {cluster.key_drivers?.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#F59E0B', marginBottom: '0.2rem' }}>
                    Recommended Preemptive Action:
                  </div>
                  <p style={{ fontSize: '0.825rem', color: '#E2E8F0', margin: 0 }}>
                    {cluster.recommended_preemption}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weak Signal Sensors */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={18} color="#10B981" /> Subtle Operational Weak Signals
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {data?.top_precursor_signals?.map((sig, i) => (
            <div key={i} style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.06)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#F8FAFC' }}>{sig.signal}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8' }}>{Math.round(sig.confidence * 100)}% Conf</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Zone: <strong>{sig.zone}</strong></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
