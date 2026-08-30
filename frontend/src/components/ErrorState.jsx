import React from 'react';
import { AlertOctagon, RefreshCw, Terminal } from 'lucide-react';

export default function ErrorState({
  title = "AI Service Notice",
  message = "An error occurred while communicating with the safety intelligence engine.",
  onRetry,
}) {
  const isModelMissing = message && message.toLowerCase().includes("not trained");

  return (
    <div
      className="glass-card"
      style={{
        padding: '2.5rem 2rem',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        background: 'rgba(239, 68, 68, 0.05)',
        borderRadius: '14px',
        maxWidth: '680px',
        margin: '1.5rem auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          color: '#EF4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <AlertOctagon size={28} />
      </div>

      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.5rem' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.875rem', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '540px' }}>
        {message}
      </p>

      {isModelMissing && (
        <div
          style={{
            background: '#070D1E',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'left',
            width: '100%',
            maxWidth: '520px',
            marginBottom: '1.5rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.78rem',
            color: '#38BDF8',
          }}
        >
          <div style={{ color: '#94A3B8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Terminal size={14} /> Setup Instructions:
          </div>
          <div>1. Place CSV in: <span style={{ color: '#FCD34D' }}>data/OIL_SIF_Synthetic_Dataset_5000.csv</span></div>
          <div>2. Run: <span style={{ color: '#FCD34D' }}>python training/validate_dataset.py</span></div>
          <div>3. Run: <span style={{ color: '#FCD34D' }}>python training/train_models.py</span></div>
        </div>
      )}

      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          <RefreshCw size={16} />
          Retry Connection
        </button>
      )}
    </div>
  );
}
