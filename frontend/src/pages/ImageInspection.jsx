import React, { useState } from 'react';
import { Camera, Upload, AlertCircle, CheckCircle2, Shield, Eye, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function ImageInspection() {
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80');
  const [contextNotes, setContextNotes] = useState('Flange manifold inspection, visible gas mist near valve deck');
  const [assetName, setAssetName] = useState('Flare Header 04');
  const [location, setLocation] = useState('Offshore Platform Alpha');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleInspect(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.inspectSafetyImage({
        image_url: imageUrl,
        context_notes: contextNotes,
        asset: assetName,
        location: location
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const samplePresets = [
    {
      title: 'Flange Hydrocarbon Leak',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
      notes: 'Active hydrocarbon leak and vapor plume at main piping flange',
      asset: 'Flare Header 04'
    },
    {
      title: 'Missing PPE in Red Zone',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      notes: 'Personnel working without required safety helmet and high-visibility vest',
      asset: 'Offshore Crane 1'
    },
    {
      title: 'Corroded Process Piping',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      notes: 'Severe external rust degradation on high pressure gas separator line',
      asset: 'High Pressure Separator A'
    }
  ];

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <Camera size={14} /> AI Vision Safety Inspection
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          AI Image Safety Inspection
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginTop: '0.25rem' }}>
          Inspect equipment photos for missing PPE, flange leaks, and open hazards using computer vision.
        </p>
      </div>

      {/* Visual Workflow Banner */}
      <div
        className="glass-card"
        style={{
          padding: '0.85rem 1.5rem',
          marginBottom: '1.75rem',
          background: '#091124',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#38BDF8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Inspection Workflow:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {[
            { label: 'UPLOAD IMAGE', desc: 'Select or paste photo', color: '#94A3B8' },
            { label: 'AI LOOKS FOR ISSUES', desc: 'Object & anomaly detection', color: '#38BDF8' },
            { label: 'DETECTED ISSUES', desc: 'Flange leak / PPE / rust', color: '#F59E0B' },
            { label: 'RISK ASSESSMENT', desc: 'SIF & severity rating', color: '#EF4444' },
          ].map((item, idx, arr) => (
            <React.Fragment key={idx}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color }} />
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#FFFFFF' }}>{item.label}</span>
                <span style={{ fontSize: '0.68rem', color: '#64748B' }}>({item.desc})</span>
              </div>
              {idx < arr.length - 1 && <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: '700' }}>&rarr;</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Input Form */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '1rem' }}>
            Inspection Parameters
          </h3>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.5rem' }}>
              Sample Inspection Presets
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {samplePresets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setImageUrl(p.url);
                    setContextNotes(p.notes);
                    setAssetName(p.asset);
                  }}
                  className="btn btn-secondary"
                  style={{ textAlign: 'left', fontSize: '0.8rem', padding: '0.6rem 0.85rem' }}
                >
                  📷 {p.title}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleInspect}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.35rem' }}>
                Image Source URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="form-input"
                placeholder="https://..."
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.35rem' }}>
                Context Notes / Inspector Observation
              </label>
              <textarea
                value={contextNotes}
                onChange={(e) => setContextNotes(e.target.value)}
                className="form-textarea"
                rows={3}
                placeholder="Describe visible equipment conditions..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.35rem' }}>
                  Target Asset
                </label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.35rem' }}>
                  Facility Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
            >
              {loading ? 'Running Vision AI Scan...' : 'Execute Vision Safety Scan'}
            </button>
          </form>
        </div>

        {/* Results / Visual Preview */}
        <div>
          {/* Image Preview */}
          <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', marginBottom: '0.5rem', textAlign: 'left' }}>
              IMAGE FEED PREVIEW
            </div>
            <img
              src={imageUrl}
              alt="Inspection site"
              style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          {/* AI Inspection Findings */}
          {result && (
            <div className="glass-card" style={{ padding: '1.75rem', borderTop: `4px solid ${result.sif_risk_rating === 'CRITICAL' ? '#EF4444' : '#F97316'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8' }}>
                    {result.inspection_id} (AI Observation)
                  </span>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F8FAFC' }}>
                    RISK LEVEL: {result.sif_risk_rating}
                  </h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#38BDF8' }}>
                    {Math.round(result.overall_confidence * 100)}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>AI CONFIDENCE</div>
                </div>
              </div>

              {/* Detected Issues */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.5rem' }}>
                  DETECTED ISSUES:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {result.detected_hazards.map((h, i) => (
                    <div key={i} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '6px', borderLeft: `3px solid ${h.severity_level === 'CRITICAL' ? '#EF4444' : '#F59E0B'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', color: '#F8FAFC' }}>
                        <span>• {h.hazard_label}</span>
                        <span style={{ color: '#38BDF8', fontSize: '0.75rem' }}>{Math.round(h.confidence * 100)}% AI confidence</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0.35rem 0 0' }}>
                        {h.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SIF & Hazard Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#0B132B', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase' }}>HAZARD DOMAIN</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#F1F5F9', marginTop: '0.15rem' }}>
                    Electrical / Hydrocarbon
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase' }}>SIF POTENTIAL</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#EF4444', marginTop: '0.15rem' }}>
                    Possible Precursor
                  </div>
                </div>
              </div>

              {/* Recommended Safety Check */}
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#10B981', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  RECOMMENDED CHECK:
                </div>
                <p style={{ fontSize: '0.825rem', color: '#E2E8F0', margin: 0, lineHeight: 1.4 }}>
                  Verify PPE compliance, inspect electrical isolation panels, and test for vapor leakage before work continues in this area.
                </p>
              </div>

              <div style={{ marginTop: '0.85rem', fontSize: '0.72rem', color: '#64748B', textAlign: 'center' }}>
                * All image detection findings are AI model-based observations and require human field verification.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
