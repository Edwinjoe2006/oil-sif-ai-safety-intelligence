import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function EmptyState({
  title = "No safety reports available yet",
  description = "Get started by submitting your first Unsafe Act, Unsafe Condition, or Near Miss observation for AI precursor analysis.",
  actionText = "Analyze Your First Report",
  onAction
}) {
  return (
    <div
      className="glass-card"
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '540px',
        margin: '2rem auto',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          color: '#38BDF8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <ShieldCheck size={32} />
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      
      <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '1.75rem' }}>
        {description}
      </p>

      {onAction && (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          <span>{actionText}</span>
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}
