import React from 'react';
import { Search, Bell, ShieldCheck, User } from 'lucide-react';

export default function TopNavbar({ activePage, health }) {
  const pageTitles = {
    dashboard: 'Safety Intelligence Overview',
    analyze: 'Analyze Safety Report & Precursors',
    reports: 'Safety Reports Explorer',
    priority: 'Safety Risk Priority Queue',
    emerging: 'Emerging Safety Risks & Velocity',
    hazards: 'Hazard Intelligence & Frequency',
    performance: 'Model Performance & Evaluation Metrics',
    settings: 'System Configuration & Data Pipeline',
  };

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: '#091124',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        flexShrink: 0,
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          {pageTitles[activePage] || 'Safety Intelligence Platform'}
        </h1>
        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
          Smart India Hackathon Prototype • Synthetic Safety Intelligence
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Status Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.8rem',
            borderRadius: '9999px',
            backgroundColor: health?.models_loaded ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${health?.models_loaded ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            fontSize: '0.75rem',
            fontWeight: '700',
            color: health?.models_loaded ? '#10B981' : '#F59E0B',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: health?.models_loaded ? '#10B981' : '#F59E0B',
            }}
          />
          {health?.models_loaded ? 'ML Models Active' : 'ML Standby Mode'}
        </div>

        {/* Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#1E293B',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
            }}
          >
            <User size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: '700', color: '#F1F5F9' }}>
              Safety Officer
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
              SIH Evaluator
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
