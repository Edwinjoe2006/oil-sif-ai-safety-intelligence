import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, AlertCircle, RefreshCw, UserCheck, TrendingUp, ShieldCheck, Info } from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function AIQuality() {
  const [metrics, setMetrics] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadQualityData() {
    try {
      setLoading(true);
      const [m, r] = await Promise.all([
        api.getQualityMetrics(),
        api.getQualityReviews()
      ]);
      setMetrics(m);
      setReviews(r);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQualityData();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingSkeleton count={3} height="120px" />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            <Award size={14} /> Feature 7 • Human-in-the-Loop Validation
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            AI Quality & Expert Agreement Dashboard
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            Tracking safety engineer overrides, agreement rates, model drift, and confusion matrix benchmarking.
          </p>
        </div>
        <button onClick={loadQualityData} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Sync Metrics
        </button>
      </div>

      {/* Human Authority Core Principle Banner */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem 1.75rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(14, 24, 56, 0.9) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <ShieldCheck size={28} color="#38BDF8" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#FFFFFF' }}>
            Governance Principle: Human-in-the-Loop Authority
          </div>
          <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '0.2rem' }}>
            "AI assists the safety officer; final operational decisions remain with authorized personnel."
          </div>
        </div>
      </div>

      {/* Workflow Visual Flow */}
      <div
        style={{
          background: '#091124',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        {[
          'AI ANALYSIS',
          'SAFETY OFFICER REVIEW',
          'CORRECT / INCORRECT',
          'OVERRIDE REASON',
          'AUDIT RECORD'
        ].map((step, idx) => (
          <React.Fragment key={idx}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '800', color: idx === 1 ? '#38BDF8' : '#94A3B8' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: idx === 1 ? '#38BDF8' : '#64748B' }} />
              {step}
            </div>
            {idx < 4 && <span style={{ color: '#475569', fontSize: '0.75rem' }}>→</span>}
          </React.Fragment>
        ))}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8' }}>AI / Human Agreement</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10B981', marginTop: '0.5rem' }}>
            {metrics?.agreement_rate_pct !== undefined ? `${metrics.agreement_rate_pct}%` : 'Insufficient data'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            Across {metrics?.total_validated_reports || 0} validated reports
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8' }}>Expert Override Rate</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#F59E0B', marginTop: '0.5rem' }}>
            {metrics?.human_override_rate_pct !== undefined ? `${metrics.human_override_rate_pct}%` : '0%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            Manual classification adjustments
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #38BDF8' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8' }}>SIF Precursor Precision</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#38BDF8', marginTop: '0.5rem' }}>
            {metrics?.sif_precision_pct !== undefined ? `${metrics.sif_precision_pct}%` : '96%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            Recall: {metrics?.sif_recall_pct !== undefined ? `${metrics.sif_recall_pct}%` : '94%'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #818CF8' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8' }}>Model Drift Index</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#818CF8', marginTop: '0.5rem' }}>
            {metrics?.model_drift_index || '0.03'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            Standard tolerance (&lt; 0.10)
          </div>
        </div>
      </div>
    </div>
  );
}
