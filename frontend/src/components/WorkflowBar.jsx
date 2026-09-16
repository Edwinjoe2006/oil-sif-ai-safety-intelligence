import React from 'react';
import { 
  FileText, 
  Search, 
  Gauge, 
  HelpCircle, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  BookOpen 
} from 'lucide-react';

export const WORKFLOW_STEPS = [
  { id: 'report', number: '01', title: 'REPORT', desc: 'Observation / near-miss logged', icon: FileText, route: 'analyze' },
  { id: 'detect', number: '02', title: 'DETECT', desc: 'AI identifies SIF & hazards', icon: Search, route: 'analyze' },
  { id: 'score', number: '03', title: 'SCORE', desc: '0-100 risk quantification', icon: Gauge, route: 'priority' },
  { id: 'explain', number: '04', title: 'EXPLAIN', desc: 'Root causes & Bow-Tie barriers', icon: HelpCircle, route: 'causal' },
  { id: 'predict', number: '05', title: 'PREDICT', desc: 'Emerging risk & trend forecast', icon: TrendingUp, route: 'emerging' },
  { id: 'act', number: '06', title: 'ACT', desc: 'Alerts & CAPA mitigations', icon: ShieldAlert, route: 'actions' },
  { id: 'verify', number: '07', title: 'VERIFY', desc: 'Human safety officer approval', icon: CheckCircle2, route: 'quality' },
  { id: 'learn', number: '08', title: 'LEARN', desc: 'Audit trail & model governance', icon: BookOpen, route: 'audit' }
];

export default function WorkflowBar({ activeStep, onStepClick, compact = false }) {
  return (
    <div
      style={{
        background: '#091124',
        border: '1px solid rgba(56, 189, 248, 0.15)',
        borderRadius: '12px',
        padding: compact ? '0.6rem 1rem' : '0.85rem 1.25rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.75rem' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#38BDF8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Safety Workflow:
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          flex: 1,
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {WORKFLOW_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;

          return (
            <React.Fragment key={step.id}>
              <div
                onClick={() => onStepClick && onStepClick(step.route || step.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: isActive ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: onStepClick ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
                title={`${step.number}. ${step.title}: ${step.desc}`}
              >
                <Icon size={13} color={isActive ? '#38BDF8' : '#94A3B8'} />
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: isActive ? '800' : '600',
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    letterSpacing: '0.02em'
                  }}
                >
                  {step.title}
                </span>
              </div>
              {idx < WORKFLOW_STEPS.length - 1 && (
                <span style={{ color: '#475569', fontSize: '0.7rem', fontWeight: '700' }}>?</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
