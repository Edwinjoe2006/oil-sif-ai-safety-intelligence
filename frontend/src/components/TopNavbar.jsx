import React from 'react';
import { Search, Bell, ShieldCheck, User, Menu, Sparkles } from 'lucide-react';

export default function TopNavbar({ activePage, health, onToggleMobileMenu, onOpenDemo }) {
  const pageTitles = {
    dashboard: 'Safety Intelligence Overview',
    analyze: 'Analyze Safety Report & Precursors',
    reports: 'Safety Reports Explorer',
    priority: 'Safety Risk Priority Queue',
    emerging: 'Emerging Safety Risks & Velocity',
    hazards: 'Hazard Intelligence & Frequency',
    performance: 'Model Performance & Evaluation Metrics',
    settings: 'System Configuration & Data Pipeline',
    assets: 'Asset-Level Risk & Degradation Intelligence',
    simulator: 'What-If Operational Risk Simulator',
    forecast: 'Predictive Safety Trend Forecasting',
    vision: 'Vision AI Safety Inspection',
    causal: 'Causal / Bow-Tie Barrier Analysis',
    alerts: 'Safety Alert & Notification Center',
    actions: 'Corrective & Preventive Actions (CAPA)',
    quality: 'AI Quality & Expert Agreement Dashboard',
    audit: 'AI Decision Audit Trail & Explainability Trace',
  };

  return (
    <header
      className="top-navbar-container"
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleMobileMenu}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="top-navbar-title" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            {pageTitles[activePage] || 'Safety Intelligence Platform'}
          </h1>
          <span className="top-navbar-subtitle" style={{ fontSize: '0.75rem', color: '#64748B' }}>
            Smart India Hackathon Prototype • Synthetic Safety Intelligence
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* SIH Demo Guide Button */}
        {onOpenDemo && (
          <button
            type="button"
            onClick={onOpenDemo}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(37, 99, 235, 0.25) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38BDF8',
              borderRadius: '9999px',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={14} />
            <span>SIH Demo Tour</span>
          </button>
        )}

        {/* Status Indicator */}
        <div
          className="top-navbar-badge"
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
            whiteSpace: 'nowrap',
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
          <span className="top-navbar-badge-text">
            {health?.models_loaded ? 'ML Models Active' : 'ML Standby Mode'}
          </span>
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
              flexShrink: 0,
            }}
          >
            <User size={18} />
          </div>
          <div className="top-navbar-user-text" style={{ display: 'flex', flexDirection: 'column' }}>
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
