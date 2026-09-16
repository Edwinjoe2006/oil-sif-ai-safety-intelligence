import React from 'react';
import InfoTooltip from './InfoTooltip';

export default function KpiCard({
  title,
  value,
  status,
  meaning,
  icon: Icon,
  description,
  trend,
  color = '#38BDF8',
  tooltipTerm,
  tooltipText
}) {
  const displayValue = value !== undefined && value !== null ? value : 'Insufficient data';
  const isInsufficient = displayValue === 'Insufficient data' || displayValue === '--';

  return (
    <div className="glass-card kpi-card" style={{ padding: '1.25rem', borderLeft: `4px solid ${color}` }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8' }}>
            {title}
          </span>
          {(tooltipTerm || tooltipText) && (
            <InfoTooltip term={tooltipTerm} text={tooltipText} size={13} />
          )}
        </div>
        {Icon && (
          <div
            style={{
              padding: '0.45rem',
              borderRadius: '8px',
              backgroundColor: `${color}15`,
              border: `1px solid ${color}30`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      {/* 1. VALUE */}
      <div style={{ fontSize: isInsufficient ? '1.15rem' : '2.1rem', fontWeight: '800', color: '#FFFFFF', lineHeight: 1.1 }}>
        {displayValue}
      </div>

      {/* 2. STATUS */}
      {status && (
        <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: `${color}20`,
              color: color,
              border: `1px solid ${color}35`
            }}
          >
            {status}
          </span>
          {trend && (
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>
              {trend}
            </span>
          )}
        </div>
      )}

      {/* 3. SHORT MEANING */}
      <div style={{ marginTop: '0.65rem', fontSize: '0.75rem', color: '#94A3B8', lineHeight: '1.35', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.5rem' }}>
        {meaning || description || 'Calculated from stored safety reports'}
      </div>
    </div>
  );
}
