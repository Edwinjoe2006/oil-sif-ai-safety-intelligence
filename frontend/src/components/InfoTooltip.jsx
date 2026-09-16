import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

export const SAFETY_TERMS = {
  sif: 'Serious Injury & Fatality precursor ? high-risk unsafe condition or act that could lead to life-threatening harm without proper barriers.',
  risk_velocity: 'Rate at which risk-related observations and precursor frequencies are accelerating over time.',
  risk_score: 'Model-based 0?100 index synthesized from SIF likelihood, severity, hazard level, and barrier integrity to prioritize safety review.',
  emerging_risk: 'A detected change, cluster, or repeated pattern in stored safety observations signaling growing vulnerability.',
  bowtie: 'A visual representation of how a hazard may escalate to a top event and where preventive or mitigative barriers act.',
  human_validation: 'Safety officer review and confirmation of an AI-generated classification. AI assists; final authority rests with humans.',
  model_estimate: 'Model-based estimate generated from machine learning and risk algorithms based on historical safety records.',
  capa: 'Corrective and Preventive Actions ? a 5-stage workflow (Open -> Assigned -> In Progress -> Verification -> Closed) to resolve safety hazards.',
  uptime_index: 'Estimated operational readiness index based on recent safety barrier integrity and unresolved precursor logs.'
};

export default function InfoTooltip({ term, text, title, size = 14, iconType = 'help' }) {
  const [isOpen, setIsOpen] = useState(false);
  const content = text || (term && SAFETY_TERMS[term.toLowerCase()]) || '';

  if (!content) return null;

  const IconComponent = iconType === 'info' ? Info : HelpCircle;

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer',
        verticalAlign: 'middle',
        marginLeft: '4px'
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
      title={title || 'What does this mean?'}
    >
      <IconComponent
        size={size}
        style={{
          color: isOpen ? '#38BDF8' : '#64748B',
          transition: 'color 0.15s ease'
        }}
      />

      {isOpen && (
        <span
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#0F172A',
            color: '#E2E8F0',
            padding: '0.55rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: '400',
            lineHeight: '1.4',
            width: '230px',
            zIndex: 9999,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(56, 189, 248, 0.25)',
            pointerEvents: 'none',
            textAlign: 'left',
            whiteSpace: 'normal'
          }}
        >
          {title && (
            <span style={{ display: 'block', fontWeight: '700', color: '#38BDF8', marginBottom: '2px', fontSize: '0.72rem' }}>
              {title}
            </span>
          )}
          {content}
        </span>
      )}
    </span>
  );
}
