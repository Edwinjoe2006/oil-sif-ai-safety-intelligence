import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Terminal, Database, Cpu, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function Settings() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      try {
        setLoading(true);
        const res = await api.getHealth();
        setHealth(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    checkHealth();
  }, []);

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <SettingsIcon size={14} /> System Architecture
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Configuration & Health Diagnostics
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
          Real-time environment checks, database connectivity, and CLI operational commands.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* System Health Diagnostics */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '1.25rem' }}>
            Live Infrastructure Status
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#0B132B', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>FASTAPI BACKEND</span>
                <span style={{ color: '#10B981', fontWeight: '700', fontSize: '0.8rem' }}>ONLINE</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF' }}>Port 8000</div>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>REST & Swagger Enabled</span>
            </div>

            <div style={{ background: '#0B132B', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>DATABASE ENGINE</span>
                <span style={{ color: health?.database_connected ? '#10B981' : '#EF4444', fontWeight: '700', fontSize: '0.8rem' }}>
                  {health?.database_connected ? 'CONNECTED' : 'OFFLINE'}
                </span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF' }}>SQLite Fallback</div>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>backend/data/oil_sif_safety.db</span>
            </div>

            <div style={{ background: '#0B132B', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>ML MODEL STATUS</span>
                <span style={{ color: health?.models_loaded ? '#10B981' : '#F59E0B', fontWeight: '700', fontSize: '0.8rem' }}>
                  {health?.models_loaded ? 'LOADED' : 'STANDBY'}
                </span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF' }}>
                {health?.models_loaded ? 'Inference Active' : 'Not Trained Yet'}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>backend/models/*.joblib</span>
            </div>

            <div style={{ background: '#0B132B', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' }}>DATASET FILE</span>
                <span style={{ color: health?.dataset_present ? '#10B981' : '#F59E0B', fontWeight: '700', fontSize: '0.8rem' }}>
                  {health?.dataset_present ? 'PRESENT' : 'AWAITING FILE'}
                </span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF' }}>
                OIL_SIF_Synthetic...
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>data/ directory</span>
            </div>
          </div>
        </div>

        {/* Windows PowerShell Quick Command Guide */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={18} color="#38BDF8" /> Windows PowerShell Command Reference
          </h3>

          <div
            style={{
              background: '#070D1E',
              borderRadius: '8px',
              padding: '1.25rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.8rem',
              lineHeight: 1.8,
              color: '#CBD5E1',
              overflowX: 'auto',
            }}
          >
            <div style={{ color: '#64748B' }}># 1. Activate Python virtual environment & backend</div>
            <div>cd backend</div>
            <div>python -m venv .venv</div>
            <div>.venv\Scripts\Activate.ps1</div>
            <div>pip install -r requirements.txt</div>
            <br />
            <div style={{ color: '#64748B' }}># 2. Validate dataset (once placed in data/)</div>
            <div style={{ color: '#38BDF8' }}>python training\validate_dataset.py</div>
            <br />
            <div style={{ color: '#64748B' }}># 3. Train SIF, Hazard, and Severity ML models</div>
            <div style={{ color: '#38BDF8' }}>python training\train_models.py</div>
            <br />
            <div style={{ color: '#64748B' }}># 4. Start FastAPI server</div>
            <div>python -m uvicorn app.main:app --reload --port 8000</div>
            <br />
            <div style={{ color: '#64748B' }}># 5. Start React Vite frontend (in separate terminal)</div>
            <div>cd frontend</div>
            <div>npm install</div>
            <div>npm run dev</div>
          </div>
        </div>
      </div>
    </div>
  );
}
