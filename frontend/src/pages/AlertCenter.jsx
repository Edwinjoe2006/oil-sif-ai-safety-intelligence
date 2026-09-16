import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle2, ShieldAlert, RefreshCw, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function AlertCenter() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acknowledgingId, setAcknowledgingId] = useState(null);

  async function loadAlerts() {
    try {
      setLoading(true);
      const res = await api.getAlerts();
      setAlerts(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAck(alertId) {
    try {
      setAcknowledgingId(alertId);
      await api.acknowledgeAlert(alertId, 'Duty Safety Superintendent');
      await loadAlerts();
    } catch (err) {
      console.error(err);
    } finally {
      setAcknowledgingId(null);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingSkeleton count={3} height="100px" />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#EF4444', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            <Bell size={14} /> Feature 9 • Rapid Incident Response
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Safety Alert & Notification Center
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            Real-time critical SIF precursor alerts generated automatically by the AI risk classifier.
          </p>
        </div>
        <button onClick={loadAlerts} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Sync Alerts
        </button>
      </div>

      {/* Alert Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {alerts.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
            <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC' }}>
              All Clear — No Active Safety Alerts
            </h3>
            <p style={{ fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto' }}>
              Critical SIF precursors and high-risk safety reports will trigger live alert notifications here.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.severity_level === 'CRITICAL';
            const color = isCritical ? '#EF4444' : '#F97316';

            return (
              <div
                key={alert.id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  borderLeft: `5px solid ${color}`,
                  background: alert.is_acknowledged ? 'rgba(15, 23, 42, 0.4)' : 'rgba(239, 68, 68, 0.05)',
                  opacity: alert.is_acknowledged ? 0.75 : 1
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '4px', background: `${color}22`, color: color, textTransform: 'uppercase' }}>
                        {alert.severity_level} ALERT
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Alert #{alert.id} • Report #{alert.report_id}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.5rem' }}>
                      {alert.alert_title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      {alert.alert_message}
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: '#94A3B8' }}>
                      <div>Location: <strong style={{ color: '#F1F5F9' }}>{alert.location}</strong></div>
                      <div>Hazard: <strong style={{ color: '#F1F5F9' }}>{alert.hazard_category}</strong></div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {alert.is_acknowledged ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10B981', fontSize: '0.8rem', fontWeight: '700' }}>
                        <CheckCircle2 size={16} /> Acknowledged by {alert.acknowledged_by || 'Officer'}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAck(alert.id)}
                        disabled={acknowledgingId === alert.id}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                      >
                        {acknowledgingId === alert.id ? 'Acknowledging...' : 'Acknowledge Alert'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
