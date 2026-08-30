import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, AlertTriangle, Layers } from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function HazardIntelligence() {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getHazards();
        setHazards(data || []);
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
        <LoadingSkeleton count={4} height="80px" />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <Activity size={14} /> Hazard Profiling
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Hazard Intelligence & Frequency
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
          Asset-wide breakdown of key industrial hazards, cumulative risk weighting, and SIF precursor conversion rates.
        </p>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <table className="industrial-table">
          <thead>
            <tr>
              <th>Hazard Domain</th>
              <th>Report Volume</th>
              <th>Risk Contribution</th>
              <th>SIF Conversion Rate</th>
              <th>Operational Status</th>
            </tr>
          </thead>
          <tbody>
            {hazards.map((h, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: '700', color: '#F8FAFC', fontSize: '0.95rem' }}>
                  {h.hazard}
                </td>
                <td>
                  <span style={{ color: '#CBD5E1', fontWeight: '600' }}>
                    {h.report_count} reports
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: '100px', height: '6px', background: '#1E293B', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${h.risk_contribution_pct}%`, height: '100%', background: '#38BDF8' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{h.risk_contribution_pct}%</span>
                  </div>
                </td>
                <td>
                  <span
                    style={{
                      fontWeight: '700',
                      color: h.sif_rate > 50 ? '#EF4444' : (h.sif_rate > 20 ? '#F59E0B' : '#10B981'),
                    }}
                  >
                    {h.sif_rate}% SIF
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: h.report_count > 0 ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                      color: h.report_count > 0 ? '#38BDF8' : '#64748B',
                    }}
                  >
                    {h.report_count > 0 ? 'Active Monitoring' : 'No Observations'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
