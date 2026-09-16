import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, AlertCircle, RefreshCw, UserCheck, TrendingUp } from 'lucide-react';
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
            <Award size={14} /> Feature 7 ? Human-in-the-Loop Validation 2.0
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            AI Quality & Expert Agreement Dashboard
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            Tracking safety engineer overrides, agreement rates, model drift, and confusion matrix benchmarking.
          </p>
        </div>
        <button onClick={loadQualityData} className="secondary-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Refresh Metrics
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8' }}>AI / Human Agreement</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10B981', marginTop: '0.5rem' }}>
            {metrics?.agreement_rate_pct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            Across {metrics?.total_validated_reports} validated reports
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8' }}>Expert Override Rate</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#F59E0B', marginTop: '0.5rem' }}>
            {metrics?.human_override_rate_pct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            Manual classification adjustments
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #38BDF8' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8' }}>SIF Precursor Precision</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#38BDF8', marginTop: '0.5rem' }}>
            {metrics?.sif_precision_pct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            Recall: {metrics?.sif_recall_pct}%
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #818CF8' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8' }}>Model Drift Index</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#818CF8', marginTop: '0.5rem' }}>
            {metrics?.model_drift_index}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            Standard tolerance (&lt; 0.10)
          </div>
        </div>
      </div>

      {/* Confusion Matrix & Monthly Accuracy */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Confusion Matrix */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '1rem' }}>
            SIF Validation Confusion Matrix
          </h3>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.5rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: '700' }}>
              <div></div>
              <div style={{ color: '#38BDF8' }}>Human SIF True</div>
              <div style={{ color: '#94A3B8' }}>Human Non-SIF</div>

              <div style={{ textAlign: 'left', color: '#38BDF8' }}>AI Predicted SIF</div>
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '1rem', borderRadius: '6px', fontSize: '1.2rem', fontWeight: '900' }}>
                {metrics?.confusion_matrix?.AI_SIF_Positive?.Human_SIF_True || 0}
                <div style={{ fontSize: '0.65rem', fontWeight: '600' }}>True Positive</div>
              </div>
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '1rem', borderRadius: '6px', fontSize: '1.2rem', fontWeight: '900' }}>
                {metrics?.confusion_matrix?.AI_SIF_Positive?.Human_SIF_False || 0}
                <div style={{ fontSize: '0.65rem', fontWeight: '600' }}>False Positive</div>
              </div>

              <div style={{ textAlign: 'left', color: '#94A3B8' }}>AI Predicted Non-SIF</div>
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '1rem', borderRadius: '6px', fontSize: '1.2rem', fontWeight: '900' }}>
                {metrics?.confusion_matrix?.AI_SIF_Negative?.Human_SIF_True || 0}
                <div style={{ fontSize: '0.65rem', fontWeight: '600' }}>False Negative</div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '1rem', borderRadius: '6px', fontSize: '1.2rem', fontWeight: '900' }}>
                {metrics?.confusion_matrix?.AI_SIF_Negative?.Human_SIF_False || 0}
                <div style={{ fontSize: '0.65rem', fontWeight: '600' }}>True Negative</div>
              </div>
            </div>
          </div>
        </div>

        {/* Override Reasons */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '1rem' }}>
            Primary Expert Override Reasons
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {metrics?.top_override_reasons?.map((r, i) => (
              <div key={i} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '6px', borderLeft: '3px solid #F59E0B' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', color: '#F1F5F9' }}>
                  <span>{r.reason}</span>
                  <span style={{ color: '#F59E0B' }}>{r.count} cases ({r.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Validation Reviews Log */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '1rem' }}>
          Recent Expert Validation Log
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="industrial-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Reviewer</th>
                <th>Validation Result</th>
                <th>Override Reason</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {reviews.slice(0, 8).map((rev) => (
                <tr key={rev.id}>
                  <td style={{ fontWeight: '800', color: '#38BDF8' }}>#{rev.report_id}</td>
                  <td>{rev.reviewer_name || 'Safety Inspector'}</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: rev.is_correct ? '#10B981' : '#EF4444' }}>
                      {rev.is_correct ? '? AGREED WITH AI' : '? OVERRIDDEN'}
                    </span>
                  </td>
                  <td style={{ color: '#CBD5E1', fontSize: '0.825rem' }}>
                    {rev.reviewer_reason || 'Standard review'}
                  </td>
                  <td style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                    {rev.comment || '?'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
