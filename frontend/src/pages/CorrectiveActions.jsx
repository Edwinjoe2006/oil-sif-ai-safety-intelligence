import React, { useState, useEffect } from 'react';
import { CheckSquare, AlertTriangle, ShieldCheck, Clock, CheckCircle2, User, RefreshCw, Plus, Info } from 'lucide-react';
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

  async function handleStatusChange(actionId, newStatus) {
    try {
      await api.updateActionStatus(actionId, newStatus, 'Verified by Duty Safety Lead');
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

  const columns = ['OPEN', 'ASSIGNED', 'IN PROGRESS', 'VERIFICATION', 'CLOSED'];

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            <CheckSquare size={14} /> Feature 9 • CAPA Safety Governance
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Corrective & Preventive Actions (CAPA)
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            5-Stage CAPA lifecycle. Clearly distinguishing AI recommendations from recorded human completions.
          </p>
        </div>
        <button onClick={loadActions} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Sync CAPA
        </button>
      </div>

      {/* 5-Stage Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'start' }}>
        {columns.map((col) => {
          const colActions = actions.filter(a => a.status === col);

          return (
            <div key={col} className="glass-card" style={{ padding: '1rem', minHeight: '350px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8', letterSpacing: '0.05em' }}>
                  {col}
                </span>
                <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', color: '#CBD5E1', fontWeight: '700' }}>
                  {colActions.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {colActions.map((action) => (
                  <div
                    key={action.id}
                    style={{
                      background: '#070D1E',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '8px',
                      padding: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '800', color: action.priority === 'CRITICAL' ? '#EF4444' : '#F59E0B', textTransform: 'uppercase' }}>
                        {action.priority}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: '#64748B' }}>CAPA-{action.id}</span>
                    </div>

                    <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#F8FAFC', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                      {action.action_title}
                    </p>

                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginBottom: '0.75rem' }}>
                      Assigned: <strong style={{ color: '#CBD5E1' }}>{action.assigned_to}</strong>
                    </div>

                    {/* Stage Transition Selector */}
                    <select
                      value={action.status}
                      onChange={(e) => handleStatusChange(action.id, e.target.value)}
                      style={{
                        width: '100%',
                        fontSize: '0.7rem',
                        padding: '0.3rem',
                        background: '#0F172A',
                        color: '#38BDF8',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {columns.map(c => <option key={c} value={c}>Move to {c}</option>)}
                    </select>
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
