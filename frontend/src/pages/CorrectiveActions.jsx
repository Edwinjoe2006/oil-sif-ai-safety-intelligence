import React, { useState, useEffect } from 'react';
import { CheckSquare, ArrowRight, ShieldCheck, RefreshCw, Plus, UserCheck, Clock } from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function CorrectiveActions() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadActions() {
    try {
      setLoading(true);
      const res = await api.getActions();
      setActions(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTransition(actionId, nextStatus) {
    try {
      await api.transitionAction(actionId, {
        new_status: nextStatus,
        evidence: `Verified step transition to ${nextStatus}`
      });
      await loadActions();
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadActions();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingSkeleton count={3} height="120px" />
      </div>
    );
  }

  const STAGES = ['OPEN', 'ASSIGNED', 'IN PROGRESS', 'VERIFICATION', 'CLOSED'];

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10B981', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            <CheckSquare size={14} /> Feature 9 ? 5-Stage CAPA Lifecycle
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Corrective & Preventive Action (CAPA) Center
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            5-Stage structured remediation: Open ? Assigned ? In Progress ? Verification ? Closed.
          </p>
        </div>
        <button onClick={loadActions} className="secondary-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Refresh CAPA
        </button>
      </div>

      {/* 5-Stage Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', overflowX: 'auto', minWidth: '1000px', marginBottom: '2rem' }}>
        {STAGES.map((stage) => {
          const stageActions = actions.filter(a => (a.status || 'OPEN').toUpperCase() === stage);
          const stageColor = 
            stage === 'OPEN' ? '#EF4444' :
            stage === 'ASSIGNED' ? '#F97316' :
            stage === 'IN PROGRESS' ? '#38BDF8' :
            stage === 'VERIFICATION' ? '#818CF8' : '#10B981';

          return (
            <div key={stage} style={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid rgba(255,255,255,0.06)`, borderTop: `4px solid ${stageColor}`, borderRadius: '8px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: stageColor }}>{stage}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#F1F5F9' }}>
                  {stageActions.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stageActions.map((act) => (
                  <div key={act.id} className="glass-card" style={{ padding: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748B', marginBottom: '0.35rem' }}>
                      <span>#{act.id} (Rep #{act.report_id})</span>
                      <span style={{ color: act.priority === 'CRITICAL' ? '#EF4444' : '#F59E0B', fontWeight: '700' }}>{act.priority}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#F8FAFC', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                      {act.action_text}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginBottom: '0.75rem' }}>
                      Dept: <strong>{act.department}</strong>
                    </div>

                    {/* Transition Next Button */}
                    {stage !== 'CLOSED' && (
                      <button
                        onClick={() => {
                          const nextIdx = STAGES.indexOf(stage) + 1;
                          if (nextIdx < STAGES.length) {
                            handleTransition(act.id, STAGES[nextIdx]);
                          }
                        }}
                        className="secondary-btn"
                        style={{ width: '100%', fontSize: '0.7rem', padding: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                      >
                        Move to {STAGES[STAGES.indexOf(stage) + 1]} <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
