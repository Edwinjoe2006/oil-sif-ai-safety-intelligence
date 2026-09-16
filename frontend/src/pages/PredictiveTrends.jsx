import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, AlertTriangle, ShieldCheck, RefreshCw, Sparkles, Info } from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import InfoTooltip from '../components/InfoTooltip';

export default function PredictiveTrends() {
  const [horizon, setHorizon] = useState(14);
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
            <TrendingUp size={14} /> Feature 10 • Statistical Trend Forecasting
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Predictive Safety Trend Forecasting
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            7, 14, and 30-day statistical precursor frequency projections based on historical observation patterns.
          </p>
        </div>

        {/* Horizon Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', background: '#0B132B', padding: '0.25rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {[7, 14, 30].map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className="btn btn-secondary"
              style={{
                background: horizon === h ? '#0284C7' : 'transparent',
                color: horizon === h ? '#FFFFFF' : '#94A3B8',
                border: 'none',
                padding: '0.35rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: '700'
              }}
            >
              {h} Days
            </button>
          ))}
        </div>
      </div>

      {/* Structured Flow Banner */}
      <div
        style={{
          background: '#091124',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        {[
          'HISTORICAL PATTERNS',
          'STATISTICAL MODELING',
          'FORECASTED TREND PROJECTION'
        ].map((step, idx) => (
          <React.Fragment key={idx}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '800', color: idx === 2 ? '#38BDF8' : '#94A3B8' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: idx === 2 ? '#38BDF8' : '#64748B' }} />
              {step}
            </div>
            {idx < 2 && <span style={{ color: '#475569', fontSize: '0.75rem' }}>→</span>}
          </React.Fragment>
        ))}
      </div>

      {/* KPI Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #EF4444' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8' }}>Elevated Risk Days Flagged</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#EF4444', marginTop: '0.5rem' }}>
            {forecast?.high_risk_days_identified || 0} Days
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            Forecasted trend within the next {horizon} operational days
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #38BDF8' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8' }}>Primary Contributing Driver</div>
          <div style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC', marginTop: '0.5rem' }}>
            {forecast?.primary_contributing_factors?.[0] || 'Scheduled SIMOPS & Pressure Operations'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            Potential increase based on historical pattern
          </div>
        </div>
      </div>

      {/* Forecast Timeline Chart */}
      <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '1rem' }}>
          {horizon}-Day Projected Precursor Frequency Timeline
        </h3>
        
        {forecast?.forecast_points?.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(horizon, 14)}, 1fr)`, gap: '0.5rem', alignItems: 'end', height: '180px', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            {forecast.forecast_points.slice(0, 14).map((pt, i) => {
              const heightPct = Math.min(100, Math.round((pt.predicted_precursors / 3.5) * 100));
              const barColor = pt.high_risk_flag ? '#EF4444' : '#38BDF8';

              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '28px',
                      height: `${Math.max(15, heightPct)}%`,
                      backgroundColor: barColor,
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease'
                    }}
                    title={`Day ${pt.day_offset}: ${pt.predicted_precursors.toFixed(1)} projected precursors`}
                  />
                  <span style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '0.5rem' }}>
                    D+{pt.day_offset}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ color: '#64748B', fontSize: '0.85rem', padding: '2rem', textAlign: 'center' }}>
            Insufficient historical data for reliable forecasting.
          </div>
        )}
      </div>

      {/* Explicit Disclaimer */}
      <div style={{ padding: '1rem 1.5rem', borderRadius: '8px', background: '#070D1E', border: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.78rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Info size={16} color="#38BDF8" style={{ flexShrink: 0 }} />
        <span>
          <strong>Forecast Notice:</strong> All values represent a forecasted trend / potential increase based on historical patterns. Model-based statistical projection only; does not predict definitive incident occurrences.
        </span>
      </div>
    </div>
  );
}
