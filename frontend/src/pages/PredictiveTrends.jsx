import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, AlertTriangle, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function PredictiveTrends() {
  const [horizon, setHorizon] = useState(30);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadForecast() {
    try {
      setLoading(true);
      const res = await api.getForecast(horizon);
      setForecast(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadForecast();
  }, [horizon]);

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
            <TrendingUp size={14} /> Feature 10 ? Monte Carlo Forecast
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Predictive Safety Trend Forecasting
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            7, 14, and 30-day statistical precursor frequency projections with 95% confidence intervals and peak risk periods.
          </p>
        </div>

        {/* Horizon Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.25rem', borderRadius: '8px' }}>
          {[7, 14, 30].map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={horizon === h ? 'primary-btn' : 'secondary-btn'}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            >
              {h} Days
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #EF4444' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8' }}>High-Risk Days Flagged</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#EF4444', marginTop: '0.5rem' }}>
            {forecast?.high_risk_days_identified} Days
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            Within the next {horizon} operational days
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #38BDF8' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8' }}>Primary Contributing Driver</div>
          <div style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC', marginTop: '0.5rem' }}>
            {forecast?.primary_contributing_factors?.[0] || 'Scheduled Turnaround'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            High energy SIMOPS activity
          </div>
        </div>
      </div>

      {/* Forecast Points Table / Projection Bar Chart */}
      <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '1rem' }}>
          {horizon}-Day Projected Precursor Frequency Timeline
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(horizon, 14)}, 1fr)`, gap: '0.5rem', alignItems: 'end', height: '180px', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {forecast?.forecast_points?.slice(0, 14).map((pt, i) => {
            const heightPct = Math.min(100, Math.round((pt.predicted_precursors / 3.5) * 100));
            const barColor = pt.high_risk_flag ? '#EF4444' : '#38BDF8';

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.65rem', color: barColor, fontWeight: '800', marginBottom: '0.25rem' }}>
                  {pt.predicted_precursors}
                </span>
                <div style={{ width: '100%', maxWidth: '24px', height: `${heightPct}%`, background: barColor, borderRadius: '4px 4px 0 0' }} />
                <span style={{ fontSize: '0.6rem', color: '#64748B', marginTop: '0.35rem', transform: 'rotate(-45deg)', transformOrigin: 'left' }}>
                  {pt.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Domain Hazard Forecasts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {forecast?.hazard_forecasts?.map((hf, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.5rem', borderTop: '3px solid #38BDF8' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#F59E0B', textTransform: 'uppercase' }}>
              {hf.trend_direction}
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#F8FAFC', marginTop: '0.35rem' }}>
              {hf.hazard}
            </h4>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0.5rem 0' }}>
              Expected Incidents: <strong style={{ color: '#F8FAFC' }}>{hf.expected_incidents_next_30d}</strong>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: '700' }}>
              Peak Risk: {hf.peak_risk_period}
            </div>
          </div>
        ))}
      </div>

      {/* Preemptive Actions */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#10B981', marginBottom: '0.75rem' }}>
          Preemptive Safety Directives Recommended
        </h3>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#CBD5E1', lineHeight: '1.6' }}>
          {forecast?.preemptive_recommendations?.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
