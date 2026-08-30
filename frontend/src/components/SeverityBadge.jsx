import React from 'react';

export default function SeverityBadge({ severity = 'Low' }) {
  const sev = (severity || 'Low').toLowerCase();
  
  let color = '#94A3B8';
  let bg = 'rgba(148, 163, 184, 0.12)';
  let border = 'rgba(148, 163, 184, 0.25)';

  if (sev === 'critical') {
    color = '#F87171';
    bg = 'rgba(239, 68, 68, 0.15)';
    border = 'rgba(239, 68, 68, 0.35)';
  } else if (sev === 'high') {
    color = '#FB923C';
    bg = 'rgba(249, 115, 22, 0.15)';
    border = 'rgba(249, 115, 22, 0.35)';
  } else if (sev === 'medium') {
    color = '#FBBF24';
    bg = 'rgba(245, 158, 11, 0.15)';
    border = 'rgba(245, 158, 11, 0.35)';
  } else if (sev === 'low') {
    color = '#34D399';
    bg = 'rgba(16, 185, 129, 0.12)';
    border = 'rgba(16, 185, 129, 0.25)';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.6rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'capitalize',
        color: color,
        backgroundColor: bg,
        border: `1px solid ${border}`,
      }}
    >
      {severity}
    </span>
  );
}
