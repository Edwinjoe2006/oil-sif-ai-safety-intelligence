import React from 'react';
import { Bot, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CopilotCard({ copilot }) {
  if (!copilot) return null;

  const isUrgent = copilot.priority && (
    copilot.priority.includes('STOP-WORK') || copilot.priority.includes('CRITICAL')
  );

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.75rem',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        background: 'linear-gradient(145deg, #111E44 0%, #0E1838 100%)',
        boxShadow: '0 12px 30px rgba(2, 132, 199, 0.15)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.6rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38BDF8',
              display: 'flex',
            }}
          >
            <Bot size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              AI Safety Copilot
              <Sparkles size={16} color="#38BDF8" />
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Automated SIF Reasoning & Barrier Advisory</span>
          </div>
        </div>

        {/* Priority Banner */}
        <div
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '800',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.18)' : 'rgba(56, 189, 248, 0.15)',
            color: isUrgent ? '#F87171' : '#38BDF8',
            border: isUrgent ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(56, 189, 248, 0.3)',
          }}
        >
          {copilot.priority || 'ROUTINE'}
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Why is this dangerous */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#38BDF8', marginBottom: '0.35rem' }}>
            Why is this dangerous?
          </div>
          <p style={{ fontSize: '0.875rem', color: '#E2E8F0', lineHeight: 1.6 }}>
            {copilot.why_dangerous}
          </p>
        </div>

        {/* Potential Consequence */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F97316', marginBottom: '0.35rem' }}>
            Potential Consequence
          </div>
          <p style={{ fontSize: '0.875rem', color: '#FDBA74', lineHeight: 1.5, fontWeight: '500' }}>
            {copilot.potential_consequence}
          </p>
        </div>

        {/* Immediate Actions */}
        {copilot.recommended_immediate_actions && copilot.recommended_immediate_actions.length > 0 && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10B981', marginBottom: '0.5rem' }}>
              Immediate Field Actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {copilot.recommended_immediate_actions.map((act, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.825rem', color: '#CBD5E1' }}>
                  <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
