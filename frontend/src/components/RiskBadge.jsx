import React from 'react';

export default function RiskBadge({ level = 'LOW', size = 'normal' }) {
  const normLevel = (level || 'LOW').toUpperCase();
  
  let badgeClass = 'badge-low';
  let dotColor = '#10B981';

  if (normLevel === 'MEDIUM') {
    badgeClass = 'badge-medium';
    dotColor = '#F59E0B';
  } else if (normLevel === 'HIGH') {
    badgeClass = 'badge-high';
    dotColor = '#F97316';
  } else if (normLevel === 'CRITICAL') {
    badgeClass = 'badge-critical';
    dotColor = '#EF4444';
  }

  const paddingStyle = size === 'large' ? { padding: '0.45rem 1rem', fontSize: '0.85rem' } : {};

  return (
    <span className={`badge ${badgeClass}`} style={paddingStyle}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          display: 'inline-block',
        }}
      />
      {normLevel}
    </span>
  );
}
