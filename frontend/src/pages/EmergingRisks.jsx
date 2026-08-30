import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function EmergingRisks({ onNavigateToAnalyze }) {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getTrends('weekly');
        setTrends(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingSkeleton count={3} height="120px" />
      </div>
    );
  }

  const emerging = trends?.emerging_risks || [];
  const hotspots = trends?.location_hotspots || [];

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <TrendingUp size={14} /> Predictive Early Warning
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Emerging Safety Risks & Velocity
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
          Automated trend detection analyzing rate-of-change across hazard domains and operational facilities.
        </p>
      </div>

      {emerging.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
          <ShieldCheck size={40} color="#10B981" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.5rem' }}>
            No Emerging Hazards Detected
          </h3>
          <p style={{ maxWidth: '480px', margin: '0 auto', fontSize: '0.875rem' }}>
            As more reports are processed by the AI engine, hazard shifts and frequency velocity will automatically calculate here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {emerging.map((item, idx) => {
            const isInc = item.trend_direction === 'increasing';
            const isDec = item.trend_direction === 'decreasing';
            const color = isInc ? '#EF4444' : (isDec ? '#10B981' : '#94A3B8');

            return (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  borderTop: `4px solid ${color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC' }}>
                    {item.hazard}
                  </h4>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.9rem',
                      fontWeight: '800',
                      color: color,
                    }}
                  >
                    {isInc && <ArrowUpRight size={20} />}
                    {isDec && <ArrowDownRight size={20} />}
                    {!isInc && !isDec && <Minus size={20} />}
                    <span>{item.percent_change > 0 ? `+${item.percent_change}%` : `${item.percent_change}%`}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.825rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {isInc
                    ? `Elevated report velocity. Frequency increased by ${item.percent_change}% relative to baseline.`
                    : isDec
                    ? `Decelerating risk profile. Report frequency lowered by ${Math.abs(item.percent_change)}%.`
                    : 'Stable reporting frequency across monitoring periods.'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', fontSize: '0.75rem', color: '#64748B' }}>
                  <span>Total observations:</span>
                  <strong style={{ color: '#F1F5F9' }}>{item.report_count} events</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Facility Hotspots */}
      {hotspots.length > 0 && (
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '1.25rem' }}>
            Facility Risk Velocity & Geographic Hotspots
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="industrial-table">
              <thead>
                <tr>
                  <th>Operational Facility</th>
                  <th>Total Reports</th>
                  <th>High / Critical Incidents</th>
                  <th>High-Risk Concentration</th>
                </tr>
              </thead>
              <tbody>
                {hotspots.map((h, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '700', color: '#F1F5F9' }}>{h.location}</td>
                    <td>{h.total_count}</td>
                    <td style={{ color: h.high_risk_count > 0 ? '#EF4444' : '#94A3B8', fontWeight: '700' }}>
                      {h.high_risk_count}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '120px', height: '6px', background: '#1E293B', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${h.high_risk_pct}%`, height: '100%', background: h.high_risk_pct > 30 ? '#EF4444' : '#38BDF8' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#CBD5E1' }}>
                          {h.high_risk_pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
