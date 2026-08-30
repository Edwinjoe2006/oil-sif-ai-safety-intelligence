import React from 'react';
import RiskBadge from './RiskBadge';

export default function RiskScoreGauge({ score = 0, level = 'LOW', size = 180 }) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  
  // SVG calculation
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  let strokeColor = '#10B981';
  let glowColor = 'rgba(16, 185, 129, 0.3)';

  if (safeScore >= 75) {
    strokeColor = '#EF4444';
    glowColor = 'rgba(239, 68, 68, 0.45)';
  } else if (safeScore >= 50) {
    strokeColor = '#F97316';
    glowColor = 'rgba(249, 115, 22, 0.35)';
  } else if (safeScore >= 25) {
    strokeColor = '#F59E0B';
    glowColor = 'rgba(245, 158, 11, 0.35)';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
              filter: `drop-shadow(0 0 8px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center Content */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1, color: '#FFFFFF' }}>
            {safeScore}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600', marginTop: '4px' }}>
            OUT OF 100
          </span>
        </div>
      </div>

      <div style={{ marginTop: '0.75rem' }}>
        <RiskBadge level={level} size="large" />
      </div>
    </div>
  );
}
