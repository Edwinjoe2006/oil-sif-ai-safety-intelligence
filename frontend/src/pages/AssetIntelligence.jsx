import React, { useState, useEffect } from 'react';
import { Layers, ShieldAlert, Wrench, CheckCircle2, AlertTriangle, Activity, X, Info } from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import InfoTooltip from '../components/InfoTooltip';

export default function AssetIntelligence({ onNavigateToAnalyze }) {
  const [assets, setAssets] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  async function loadAssets() {
    try {
      setLoading(true);
      const res = await api.getAssets();
      setAssets(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function openProfile(assetId) {
    try {
      setProfileLoading(true);
      const res = await api.getAssetRiskProfile(assetId);
      setSelectedProfile(res);
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  }

  useEffect(() => {
    loadAssets();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingSkeleton count={4} height="120px" />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <Layers size={14} /> Feature 2 • Equipment Risk Index
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Asset-Level Risk & Degradation Intelligence
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
          Practical equipment health summaries synthesized from stored safety observations and model-based degradation estimates.
        </p>
      </div>

      {/* Asset Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {assets.map((asset) => {
          const riskColor = 
            asset.risk_score >= 75 ? '#EF4444' :
            asset.risk_score >= 50 ? '#F97316' : '#10B981';

          return (
            <div key={asset.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: `5px solid ${riskColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '4px', background: `${riskColor}22`, color: riskColor, textTransform: 'uppercase' }}>
                    {asset.criticality} CRITICALITY
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC', marginTop: '0.5rem' }}>
                    {asset.name}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{asset.asset_type}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: riskColor }}>
                    {asset.risk_score} / 100
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>RISK SCORE</div>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '0.75rem' }}>
                Location: <strong>{asset.location}</strong>
              </div>

              {/* Status & Precursors Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#0B132B', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>SIF Precursors Logged</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: asset.sif_precursor_count > 0 ? '#EF4444' : '#10B981' }}>
                    {asset.sif_precursor_count} Precursors
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: '#64748B' }}>
                    <span>Degradation</span>
                    <InfoTooltip term="model_estimate" size={11} />
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: asset.degradation_level === 'Severe' ? '#EF4444' : '#F1F5F9' }}>
                    {asset.degradation_level} (Model-based estimate)
                  </div>
                </div>
              </div>

              {/* Practical Meaning */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  PRACTICAL MEANING:
                </div>
                <p style={{ fontSize: '0.78rem', color: '#CBD5E1', margin: 0, lineHeight: '1.4' }}>
                  {asset.risk_score >= 50
                    ? `This asset has multiple stored safety observations and elevated model-based risk (${asset.risk_score}/100). Review recent observations and open corrective actions.`
                    : `This asset is operating within acceptable safety parameters with routine preventive monitoring scheduled.`}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Uptime Readiness: <strong style={{ color: '#10B981' }}>{asset.uptime_readiness_index || 94}%</strong>
                </div>
                <button
                  onClick={() => openProfile(asset.id)}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                >
                  View Profile
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Asset Profile Modal */}
      {selectedProfile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(5, 10, 23, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setSelectedProfile(null)}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '600px',
              backgroundColor: '#0B132B',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '2rem',
              borderRadius: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase' }}>
                  EQUIPMENT RISK PROFILE
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#FFFFFF' }}>
                  {selectedProfile.asset_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#070D1E', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Recommended Non-Destructive Testing (NDT):</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#F8FAFC', marginTop: '0.25rem' }}>
                  {selectedProfile.recommended_ndt_action || 'Ultrasonic Thickness (UT) Wall Measurement'}
                </div>
              </div>

              <div style={{ background: '#070D1E', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Next Inspection Due:</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#F8FAFC', marginTop: '0.25rem' }}>
                  {selectedProfile.next_inspection_due ? new Date(selectedProfile.next_inspection_due).toLocaleDateString() : 'Within 7 operational days'}
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: '1.4' }}>
                * All failure probabilities and degradation levels are model-based estimates derived from historical safety reports.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
