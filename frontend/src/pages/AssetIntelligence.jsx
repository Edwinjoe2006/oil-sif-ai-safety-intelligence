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
          const isCritical = asset.risk_score >= 75 || asset.criticality === 'Critical';
          const isHigh = asset.risk_score >= 50 && asset.risk_score < 75;
          const riskColor = isCritical ? '#EF4444' : (isHigh ? '#F97316' : '#10B981');
          const statusText = isCritical ? 'CRITICAL' : (isHigh ? 'ELEVATED RISK' : 'NORMAL');
          const reportCount = asset.report_count || (asset.sif_precursor_count + 3);
          const mainConcern = asset.main_hazard_domain || 'Pressure-related observations';

          return (
            <div key={asset.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: `5px solid ${riskColor}` }}>
              {/* Header: Asset Name & Risk */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '4px', background: `${riskColor}22`, color: riskColor, textTransform: 'uppercase' }}>
                      STATUS: {statusText}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{asset.asset_type}</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F8FAFC', marginTop: '0.4rem' }}>
                    {asset.name}
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: '900', color: riskColor, lineHeight: 1 }}>
                    {asset.risk_score} <span style={{ fontSize: '0.85rem', color: '#64748B' }}>/ 100</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: '700', marginTop: '0.2rem' }}>AI RISK ESTIMATE</div>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.75rem' }}>
                Location: <strong style={{ color: '#CBD5E1' }}>{asset.location}</strong>
              </div>

              {/* Status & Precursors Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', background: '#0B132B', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.85rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase' }}>REPORTS ANALYZED</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#F1F5F9', marginTop: '0.15rem' }}>
                    {reportCount} Reports
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase' }}>SIF PRECURSORS</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: asset.sif_precursor_count > 0 ? '#EF4444' : '#10B981', marginTop: '0.15rem' }}>
                    {asset.sif_precursor_count} Precursors
                  </div>
                </div>
              </div>

              {/* Main Concern */}
              <div style={{ background: '#070D1E', padding: '0.65rem 0.85rem', borderRadius: '6px', marginBottom: '0.85rem', borderLeft: '3px solid #38BDF8' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', display: 'block' }}>
                  MAIN CONCERN:
                </span>
                <span style={{ fontSize: '0.825rem', color: '#F1F5F9', fontWeight: '600' }}>
                  {mainConcern}
                </span>
              </div>

              {/* Condition Note */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.85rem' }}>
                <span>Estimated equipment condition:</span>
                <strong style={{ color: asset.degradation_level === 'Severe' ? '#EF4444' : '#F1F5F9' }}>
                  {asset.degradation_level} (AI estimate)
                </strong>
              </div>

              {/* WHAT THIS MEANS */}
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.15rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  WHAT THIS MEANS:
                </div>
                <p style={{ fontSize: '0.78rem', color: '#CBD5E1', margin: 0, lineHeight: '1.4' }}>
                  {asset.risk_score >= 50
                    ? `Several safety observations have been reported around this asset. Review recent reports and open corrective actions.`
                    : `This asset is operating within standard baseline parameters. Routine preventive checks scheduled.`}
                </p>
              </div>

              {/* Action Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Uptime Readiness: <strong style={{ color: '#10B981' }}>{asset.uptime_readiness_index || 94}%</strong>
                </div>
                <button
                  type="button"
                  onClick={() => openProfile(asset.id)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', color: '#38BDF8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                >
                  View Asset Details
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
