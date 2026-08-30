import React from 'react';
import { AlertTriangle, ChevronDown } from 'lucide-react';

export default function EscalationPath({ pathway = [] }) {
  if (!pathway || pathway.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', color: '#64748B' }}>
        No incident escalation pathway mapped for this observation.
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '1.75rem' }}>
      {/* Disclaimer Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          color: '#FBBF24',
          fontSize: '0.78rem',
          fontWeight: '700',
          letterSpacing: '0.04em',
          marginBottom: '1.5rem',
        }}
      >
        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
        <span>POTENTIAL RISK PATHWAY — NOT A GUARANTEED PREDICTION</span>
      </div>

      {/* Vertical Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
        {pathway.map((step, idx) => {
          const isLast = idx === pathway.length - 1;
          const isCritical = isLast || step.stage.includes('Major') || step.stage.includes('SIF');

          return (
            <div key={idx} style={{ display: 'flex', gap: '1.25rem', position: 'relative' }}>
              {/* Left timeline column with line and indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    backgroundColor: isCritical ? '#EF4444' : '#1E293B',
                    color: isCritical ? '#FFFFFF' : '#94A3B8',
                    border: isCritical ? '2px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: isCritical ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none',
                    zIndex: 2,
                  }}
                >
                  {step.step_number || idx + 1}
                </div>
                {!isLast && (
                  <div
                    style={{
                      width: '2px',
                      flex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      margin: '4px 0',
                    }}
                  />
                )}
              </div>

              {/* Right content column */}
              <div
                style={{
                  flex: 1,
                  paddingBottom: isLast ? '0' : '1.5rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: isCritical ? '#F87171' : '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {step.stage}
                </div>
                <div
                  style={{
                    fontSize: '0.825rem',
                    color: '#94A3B8',
                    marginTop: '0.25rem',
                    lineHeight: 1.5,
                  }}
                >
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
