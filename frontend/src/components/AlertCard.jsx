import React from 'react';
import { AlertCircle, ArrowRight, MapPin, Calendar } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function AlertCard({ report, onViewDetails }) {
  if (!report) return null;

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.25rem',
        borderLeft: '4px solid #EF4444',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RiskBadge level={report.risk_level} />
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1' }}>
            Score: <strong style={{ color: '#F87171' }}>{report.risk_score}</strong>
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
          Report #{report.id}
        </span>
      </div>

      <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#F8FAFC', lineHeight: 1.4 }}>
        {report.hazard_category} Hazard
      </div>

      <p
        style={{
          fontSize: '0.8rem',
          color: '#94A3B8',
          lineHeight: 1.5,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {report.report_text}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: '#64748B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <MapPin size={13} color="#38BDF8" />
          <span>{report.location}</span>
        </div>
        <button
          type="button"
          onClick={() => onViewDetails(report.id)}
          style={{
            background: 'none',
            border: 'none',
            color: '#38BDF8',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '2px 4px',
          }}
        >
          Investigate
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
