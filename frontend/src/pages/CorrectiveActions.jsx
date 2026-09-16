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

  const openCount = actions.filter(a => a.status === 'OPEN').length;
  const inProgressCount = actions.filter(a => a.status === 'ASSIGNED' || a.status === 'IN PROGRESS').length;
  const verificationCount = actions.filter(a => a.status === 'VERIFICATION').length;
  const closedCount = actions.filter(a => a.status === 'CLOSED').length;
  const criticalCount = actions.filter(a => a.priority === 'CRITICAL').length;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            <CheckSquare size={14} /> CAPA Safety Governance
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Alerts & Corrective Actions
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginTop: '0.25rem' }}>
            Track safety problems from initial alert to field completion and supervisor verification.
          </p>
        </div>
        <button onClick={loadActions} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Sync CAPA
        </button>
      </div>

      {/* 7-Step Visual Lifecycle Banner */}
      <div
        className="glass-card"
        style={{
          padding: '0.85rem 1.5rem',
          marginBottom: '1.75rem',
          background: '#091124',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#38BDF8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          CAPA Lifecycle:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            'PROBLEM',
            'WHO IS RESPONSIBLE?',
            'DUE DATE',
            'STATUS',
            'EVIDENCE',
            'VERIFICATION',
            'CLOSED'
          ].map((step, idx, arr) => (
            <React.Fragment key={idx}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: idx === arr.length - 1 ? '#10B981' : (idx === 0 ? '#EF4444' : '#F1F5F9'), background: 'rgba(255,255,255,0.03)', padding: '0.25rem 0.55rem', borderRadius: '4px' }}>
                {step}
              </span>
              {idx < arr.length - 1 && <span style={{ color: '#475569', fontSize: '0.75rem' }}>&rarr;</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #EF4444' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#EF4444', textTransform: 'uppercase' }}>🚨 Critical Priority Actions</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.3rem' }}>{criticalCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#FCA5A5' }}>Immediate Stop-Work or repair required</span>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#F59E0B', textTransform: 'uppercase' }}>Open Actions</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.3rem' }}>{openCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#FDBA74' }}>Awaiting initial triage and assignment</span>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #38BDF8' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase' }}>In Progress / Assigned</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.3rem' }}>{inProgressCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#93C5FD' }}>Work ongoing in the field</span>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#10B981', textTransform: 'uppercase' }}>Completed / Closed</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.3rem' }}>{closedCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#A7F3D0' }}>Verified and closed by Safety Lead</span>
        </div>
      </div>

      {/* 5-Stage Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'start' }}>
        {columns.map((col) => {
          const colActions = actions.filter(a => a.status === col);

          return (
            <div key={col} className="glass-card" style={{ padding: '1rem', minHeight: '350px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: col === 'CLOSED' ? '#10B981' : (col === 'OPEN' ? '#EF4444' : '#38BDF8'), letterSpacing: '0.05em' }}>
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
                      borderLeft: `3px solid ${action.priority === 'CRITICAL' ? '#EF4444' : '#F59E0B'}`
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

                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginBottom: '0.4rem' }}>
                      Responsible: <strong style={{ color: '#CBD5E1' }}>{action.assigned_to || 'Duty Safety Lead'}</strong>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: '#64748B', marginBottom: '0.75rem' }}>
                      Due Date: <strong style={{ color: '#94A3B8' }}>{action.due_date ? new Date(action.due_date).toLocaleDateString() : 'Within 7 Days'}</strong>
                    </div>

                    {/* Stage Transition Selector */}
                    <select
                      value={action.status}
                      onChange={(e) => handleStatusChange(action.id, e.target.value)}
                      style={{
                        width: '100%',
                        fontSize: '0.7rem',
                        padding: '0.35rem',
                        background: '#0F172A',
                        color: '#38BDF8',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '700'
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
