import React, { useState, useEffect } from 'react';
import { Layers, ShieldAlert, Wrench, CheckCircle2, AlertTriangle, Activity, X } from 'lucide-react';
import { api } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

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
          <Layers size={14} /> Feature 2 ? Equipment Risk Index
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Asset-Level Risk & Degradation Intelligence
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
          Dynamic risk rankings, degradation levels, and precursor event tracking across critical oil & gas equipment.
        </p>
      </div>

      {/* Asset Grid */}
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
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: riskColor }}>
                    {asset.risk_score}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>RISK SCORE</div>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '1rem' }}>
                Location: <strong>{asset.location}</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Degradation</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: asset.degradation_level === 'Severe' ? '#EF4444' : '#F1F5F9' }}>
                    {asset.degradation_level}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Precursors Logged</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38BDF8' }}>
                    {asset.precursor_count} events
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Failure Probability</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#F59E0B' }}>
                    {Math.round(asset.failure_probability * 100)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Status</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: asset.maintenance_status === 'Operational' ? '#10B981' : '#EF4444' }}>
                    {asset.maintenance_status}
                  </div>
                </div>
              </div>

              <button
                onClick={() => openProfile(asset.id)}
                className="primary-btn"
                style={{ width: '100%', fontSize: '0.825rem', padding: '0.6rem' }}
              >
                Inspect Asset Risk Profile
              </button>
            </div>
          );
        })}
      </div>

      {/* Asset Profile Modal */}
      {selectedProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div className="glass-card" style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8' }}>ASSET PROFILE</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#F8FAFC' }}>
                  {selectedProfile.asset.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedProfile(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Uptime Index */}
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#38BDF8' }}>UPTIME SAFETY INDEX</div>
                <div style={{ fontSize: '0.825rem', color: '#94A3B8' }}>Calculated operational resilience margin</div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#38BDF8' }}>
                {selectedProfile.uptime_safety_index}%
              </div>
            </div>

            {/* Vulnerability factors */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.75rem' }}>
                Identified Vulnerability Factors
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#CBD5E1', lineHeight: '1.5' }}>
                {selectedProfile.vulnerability_factors.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>

            {/* Maintenance recommendations */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.75rem' }}>
                Targeted Maintenance Recommendations
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedProfile.maintenance_recommendations.map((rec, i) => (
                  <div key={i} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.825rem', color: '#E2E8F0', borderLeft: '3px solid #10B981' }}>
                    {rec}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedProfile(null)}
              className="secondary-btn"
              style={{ width: '100%' }}
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
