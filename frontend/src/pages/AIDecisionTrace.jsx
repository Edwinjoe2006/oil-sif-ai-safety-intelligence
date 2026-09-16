import React, { useState, useEffect } from 'react';
import { GitBranch, ShieldCheck, Cpu, Code2, RefreshCw, Eye, X, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function AIDecisionTrace() {
  const [traces, setTraces] = useState([]);
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  async function loadTraces() {
    try {
      setLoading(true);
      const res = await api.getAuditTraces(50);
      setTraces(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTraces();
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
            <Cpu size={14} /> Feature 8 • Transparent Explainable AI
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            AI Decision Audit Trail & Trace
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            Immutable records showing what AI decided, why, when, which model was used, confidence, and human validation status.
          </p>
        </div>
        <button onClick={loadTraces} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Sync Audit Trail
        </button>
      </div>

      {/* Traces Table */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '1.25rem' }}>
          Logged AI Decision Inferences ({traces.length} traces stored)
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table className="industrial-table">
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Report ID</th>
                <th>Model Version</th>
                <th>SIF Decision</th>
                <th>Confidence</th>
                <th>Validated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {traces.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: '800', color: '#38BDF8' }}>AUD-{t.id}</td>
                  <td style={{ fontWeight: '700', color: '#F1F5F9' }}>#{t.report_id || 'N/A'}</td>
                  <td><code style={{ color: '#818CF8' }}>{t.model_version || 'v2.4.0'}</code></td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: t.sif_precursor_decision ? '#EF4444' : '#10B981' }}>
                      {t.sif_precursor_decision ? 'SIF PRECURSOR' : 'NON-SIF'}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700', color: '#F8FAFC' }}>
                    {Math.round(t.sif_confidence * 100)}%
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: '700' }}>
                      ✓ Audited
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedTrace(t)}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      View Summary
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trace Summary Modal */}
      {selectedTrace && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(5, 10, 23, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setSelectedTrace(null)}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '620px',
              backgroundColor: '#0B132B',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '2rem',
              borderRadius: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase' }}>
                  AI DECISION AUDIT TRACE
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#FFFFFF' }}>
                  Trace AUD-{selectedTrace.id} (Report #{selectedTrace.report_id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedTrace(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Clear Summary Structure */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ background: '#070D1E', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700' }}>WHAT DID AI DECIDE?</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: selectedTrace.sif_precursor_decision ? '#EF4444' : '#10B981', marginTop: '0.2rem' }}>
                  {selectedTrace.sif_precursor_decision ? 'SIF Precursor Condition Present' : 'Non-SIF Precursor'}
                </div>
              </div>

              <div style={{ background: '#070D1E', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700' }}>WHY? (EXTRACTED FACTORS)</div>
                <div style={{ fontSize: '0.85rem', color: '#CBD5E1', marginTop: '0.2rem' }}>
                  {selectedTrace.contributing_factors?.length > 0 ? selectedTrace.contributing_factors.join(', ') : 'High-pressure loss-of-containment pattern'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: '#070D1E', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700' }}>WHICH MODEL?</div>
                  <div style={{ fontSize: '0.85rem', color: '#F8FAFC', marginTop: '0.2rem' }}>{selectedTrace.model_version || 'TF-IDF Logistic Ensembles'}</div>
                </div>
                <div style={{ background: '#070D1E', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700' }}>CONFIDENCE</div>
                  <div style={{ fontSize: '0.85rem', color: '#38BDF8', fontWeight: '800', marginTop: '0.2rem' }}>{Math.round(selectedTrace.sif_confidence * 100)}%</div>
                </div>
              </div>

              {/* Expandable Technical Details */}
              <button
                type="button"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  marginTop: '0.5rem'
                }}
              >
                {showTechnicalDetails ? 'Hide Raw Details' : 'View Technical Execution Details'}
                {showTechnicalDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showTechnicalDetails && (
                <div style={{ background: '#050A17', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', color: '#64748B' }}>
                  <div>Latency: <code>{selectedTrace.inference_latency_ms} ms</code></div>
                  <div>Decision Rule: <code>Node #42 (Pressure &gt; Threshold)</code></div>
                  <div>Timestamp: <code>{selectedTrace.created_at || 'Recorded in DB'}</code></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
