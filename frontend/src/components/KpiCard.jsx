import React from 'react';

export default function KpiCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = '#38BDF8'
}) {
  return (
    <div className="glass-card kpi-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8' }}>
            {title}
          </span>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#FFFFFF', marginTop: '0.35rem', lineHeight: 1.1 }}>
            {value !== undefined && value !== null ? value : '--'}
          </div>
        </div>
        {Icon && (
          <div
            style={{
              padding: '0.65rem',
              borderRadius: '10px',
              backgroundColor: `${color}15`,
              border: `1px solid ${color}30`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
        <span style={{ color: '#64748B' }}>{description}</span>
        {trend && (
          <span style={{ color: color, fontWeight: '600' }}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
