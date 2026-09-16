import React, { useState, useEffect } from 'react';
import { GitBranch, ShieldCheck, Cpu, Code2, RefreshCw, Eye, X } from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function AIDecisionTrace() {
  const [traces, setTraces] = useState([]);
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [loading, setLoading] = useState(true);

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
            <Cpu size={14} /> Feature 8 ? Transparent Explainable AI
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            AI Decision Audit Trail & Explainability Trace
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            Immutable inference records, SHAP token weights, rule engine triggers, and decision tree execution paths.
          </p>
        </div>
        <button onClick={loadTraces} className="secondary-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Refresh Audit Trail
        </button>
      </div>

      {/* Traces Table */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '1.25rem' }}>
          Logged AI Decision Inferences ({traces.length} traces)
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
                <th>Latency</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {traces.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: '800', color: '#38BDF8' }}>AUD-{t.id}</td>
                  <td style={{ fontWeight: '700', color: '#F1F5F9' }}>#{t.report_id || 'N/A'}</td>
                  <td><code style={{ color: '#818CF8' }}>{t.model_version}</code></td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: t.sif_precursor_decision ? '#EF4444' : '#10B981' }}>
                      {t.sif_precursor_decision ? 'SIF PRECURSOR' : 'NON-SIF'}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700', color: '#F8FAFC' }}>
                    {Math.round(t.sif_confidence * 100)}%
                  </td>
                  <td style={{ color: '#64748B', fontSize: '0.8rem' }}>
                    {t.inference_latency_ms} ms
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedTrace(t)}
                      className="secondary-btn"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      View Full Trace
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Trace Modal */}
      {selectedTrace && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div className="glass-card" style={{ maxWidth: '720px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8' }}>DECISION AUDIT TRACE</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#F8FAFC' }}>
                  Audit #{selectedTrace.id} (Report #{selectedTrace.report_id})
                </h3>
              </div>
              <button onClick={() => setSelectedTrace(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {/* Feature Importance Weights */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#38BDF8', marginBottom: '0.75rem' }}>
                Feature Importance Vectors
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.entries(selectedTrace.feature_importance || {}).map(([feat, val]) => (
                  <div key={feat} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.6rem 0.8rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#E2E8F0' }}>{feat}</span>
                    <strong style={{ color: '#38BDF8' }}>+{val}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Tree Path */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#10B981', marginBottom: '0.75rem' }}>
                Decision Tree Node Traversals
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {selectedTrace.decision_tree_path?.map((node, i) => (
                  <div key={i} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid #10B981', fontSize: '0.8rem' }}>
                    <div style={{ color: '#38BDF8', fontWeight: '700' }}>Node {node.node}: {node.feature} ({node.condition})</div>
                    <div style={{ color: '#CBD5E1', marginTop: '0.2rem' }}>Outcome: <strong>{node.outcome}</strong></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rule Triggers */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#F59E0B', marginBottom: '0.75rem' }}>
                Activated Safety Rule Engines
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {selectedTrace.rule_triggers?.map((r, i) => (
                  <div key={i} style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem 0.75rem', borderRadius: '4px', color: '#F59E0B', fontSize: '0.8rem', fontWeight: '600' }}>
                    ? {r}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setSelectedTrace(null)} className="secondary-btn" style={{ width: '100%' }}>
              Close Audit Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
