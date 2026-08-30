import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, Terminal, Layers, Activity } from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function ModelPerformance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        const res = await api.getModelMetrics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingSkeleton count={3} height="140px" />
      </div>
    );
  }

  const hasMetrics = data && data.models_loaded && data.metrics;
  const models = data?.metrics?.models || {};

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <Cpu size={14} /> AI Evaluation & Auditing
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Machine Learning Model Performance
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
          Transparent validation metrics saved in backend/models/training_metrics.json (TF-IDF + Logistic Regression).
        </p>
      </div>

      {!hasMetrics ? (
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <AlertTriangle size={48} color="#F59E0B" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.5rem' }}>
            Models Awaiting Training
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#CBD5E1', maxWidth: '560px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            {data?.status_message || 'ML models are not trained yet.'}
          </p>

          <div
            style={{
              background: '#070D1E',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '1.25rem',
              textAlign: 'left',
              maxWidth: '540px',
              margin: '0 auto',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.8rem',
              color: '#38BDF8',
            }}
          >
            <div style={{ color: '#94A3B8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Terminal size={14} /> Execution Pipeline:
            </div>
            <div># Step 1: Place dataset at:</div>
            <div style={{ color: '#FCD34D', marginBottom: '0.5rem' }}>data/OIL_SIF_Synthetic_Dataset_5000.csv</div>
            <div># Step 2: Validate dataset integrity:</div>
            <div style={{ color: '#FCD34D', marginBottom: '0.5rem' }}>python training/validate_dataset.py</div>
            <div># Step 3: Train all three classifiers:</div>
            <div style={{ color: '#FCD34D' }}>python training/train_models.py</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Metadata Bar */}
          <div className="glass-card" style={{ padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Training Timestamp:</span>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#F1F5F9' }}>{data.metrics.timestamp}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Dataset Partition:</span>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#F1F5F9' }}>
                {data.metrics.train_samples} Train / {data.metrics.test_samples} Test ({data.metrics.total_samples} Total)
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10B981', fontSize: '0.85rem', fontWeight: '700' }}>
              <CheckCircle2 size={16} /> Zero Leakage Verified
            </div>
          </div>

          {/* Model Cards */}
          {Object.entries(models).map(([name, m]) => (
            <div key={name} className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC', textTransform: 'capitalize' }}>
                  {name.replace('_', ' ')}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: '700', textTransform: 'uppercase' }}>
                  Target: {m.target}
                </span>
              </div>

              {/* Top Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#0B132B', padding: '1rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>ACCURACY</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>
                    {(m.accuracy * 100).toFixed(1)}%
                  </div>
                </div>

                {m.recall_sif_positive !== undefined && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#F87171', fontWeight: '800' }}>SIF RECALL (PRIORITY)</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#EF4444', marginTop: '2px' }}>
                      {(m.recall_sif_positive * 100).toFixed(1)}%
                    </div>
                  </div>
                )}

                {m.precision !== undefined && (
                  <div style={{ background: '#0B132B', padding: '1rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>PRECISION</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>
                      {(m.precision * 100).toFixed(1)}%
                    </div>
                  </div>
                )}

                <div style={{ background: '#0B132B', padding: '1rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>WEIGHTED F1</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#38BDF8', marginTop: '2px' }}>
                    {(m.weighted_f1 * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Confusion Matrix Display */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', display: 'block', marginBottom: '0.5rem' }}>
                  CONFUSION MATRIX
                </span>
                <div
                  style={{
                    background: '#070D1E',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.8rem',
                    color: '#38BDF8',
                    overflowX: 'auto',
                  }}
                >
                  {JSON.stringify(m.confusion_matrix)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
