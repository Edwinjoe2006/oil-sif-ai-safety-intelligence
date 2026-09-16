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
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <Camera size={14} /> Feature 3 ? Vision AI Inference
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          AI Image Safety Inspection & Barrier Detection
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
          Real-time computer vision analysis detecting missing PPE, flange leaks, and corrosion degradation.
        </p>
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
                  className="secondary-btn"
                  style={{ textAlign: 'left', fontSize: '0.8rem', padding: '0.6rem 0.85rem' }}
                >
                  ? {p.title}
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
                className="industrial-input"
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
                className="industrial-input"
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
                  className="industrial-input"
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
                  className="industrial-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="primary-btn"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
            >
              {loading ? 'Running Vision Inference...' : 'Execute Vision Safety Scan'}
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
                    {result.inspection_id}
                  </span>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F8FAFC' }}>
                    SIF Rating: {result.sif_risk_rating}
                  </h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#38BDF8' }}>
                    {Math.round(result.overall_confidence * 100)}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>CONFIDENCE</div>
                </div>
              </div>

              {/* Detected Hazards */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.5rem' }}>
                  Detected Visual Anomalies:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {result.detected_hazards.map((h, i) => (
                    <div key={i} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '6px', borderLeft: `3px solid ${h.severity_level === 'CRITICAL' ? '#EF4444' : '#F59E0B'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', color: '#F8FAFC' }}>
                        <span>{h.hazard_label}</span>
                        <span style={{ color: '#38BDF8' }}>{Math.round(h.confidence * 100)}%</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0.35rem 0 0' }}>
                        {h.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mandatory actions */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#EF4444', marginBottom: '0.4rem' }}>
                  Mandated Immediate Safety Directives:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#CBD5E1', lineHeight: '1.5' }}>
                  {result.recommended_safety_action.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
