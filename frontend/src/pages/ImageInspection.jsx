import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertCircle, CheckCircle2, Shield, Eye, RefreshCw, FileImage, Info, X } from 'lucide-react';
import { api } from '../services/api';

export default function ImageInspection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [contextNotes, setContextNotes] = useState('Flange manifold inspection, visible gas mist near valve deck');
  const [assetName, setAssetName] = useState('Flare Header 04');
  const [location, setLocation] = useState('Offshore Platform Alpha');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeBoxIndex, setActiveBoxIndex] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(png|jpeg|jpg|webp)/i)) {
      alert('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.match(/image\/(png|jpeg|jpg|webp)/i)) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setResult(null);
    }
  };

  async function handleInspect(e) {
    e.preventDefault();
    try {
      setLoading(true);
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('context_notes', contextNotes);
        formData.append('asset', assetName);
        formData.append('location', location);
        res = await api.inspectSafetyImage(formData);
      } else {
        res = await api.inspectSafetyImage({
          image_url: imageUrl,
          context_notes: contextNotes,
          asset: assetName,
          location: location
        });
      }
      setResult(res);
    } catch (err) {
      console.error('Inspection error:', err);
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
          <Camera size={14} /> Real AI Vision Safety Inspection
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          AI Image Safety Inspection
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginTop: '0.25rem' }}>
          Real computer vision analysis for missing PPE, flange leaks, and visible corrosion with interactive bounding box overlays.
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
            { label: 'UPLOAD IMAGE', desc: 'Real photo upload (JPG/PNG)', color: '#94A3B8' },
            { label: 'AI PIXEL ANALYSIS', desc: 'Real Computer Vision decoding', color: '#38BDF8' },
            { label: 'BOUNDING BOXES', desc: 'Interactive visual detection', color: '#F59E0B' },
            { label: 'RISK ENGINE', desc: 'SIF & severity scoring', color: '#EF4444' },
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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(340px, 1.1fr)', gap: '2rem', alignItems: 'start' }}>
        {/* Input & Upload Panel */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#F8FAFC' }}>
              Image Input
            </h3>
            <div style={{ display: 'flex', gap: '4px', background: '#0B132B', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                style={{
                  background: uploadMode === 'file' ? '#0284C7' : 'transparent',
                  color: uploadMode === 'file' ? '#FFFFFF' : '#94A3B8',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                style={{
                  background: uploadMode === 'url' ? '#0284C7' : 'transparent',
                  color: uploadMode === 'url' ? '#FFFFFF' : '#94A3B8',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                URL / Presets
              </button>
            </div>
          </div>

          {/* Mode 1: Real File Upload */}
          {uploadMode === 'file' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed rgba(56, 189, 248, 0.4)',
                  borderRadius: '12px',
                  padding: '1.75rem 1.25rem',
                  textAlign: 'center',
                  background: 'rgba(56, 189, 248, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Upload size={32} color="#38BDF8" style={{ margin: '0 auto 0.6rem' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.25rem' }}>
                  {selectedFile ? selectedFile.name : 'Upload Safety Image'}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '0 0 0.75rem' }}>
                  Drag & drop image here or click to browse
                </p>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: '#CBD5E1' }}>
                  Supports: JPG, JPEG, PNG, WEBP (Max 10MB)
                </span>
              </div>
            </div>
          )}

          {/* Mode 2: Presets & Image URL */}
          {uploadMode === 'url' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.5rem' }}>
                Sample Safety Presets
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                {samplePresets.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setImageUrl(p.url);
                      setPreviewUrl(p.url);
                      setContextNotes(p.notes);
                      setAssetName(p.asset);
                      setResult(null);
                    }}
                    className="btn btn-secondary"
                    style={{ textAlign: 'left', fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
                  >
                    📷 {p.title}
                  </button>
                ))}
              </div>

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.35rem' }}>
                Or Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                  setSelectedFile(null);
                }}
                className="form-input"
                placeholder="https://..."
              />
            </div>
          )}

          <form onSubmit={handleInspect}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.35rem' }}>
                Optional Inspector Context Notes
              </label>
              <textarea
                value={contextNotes}
                onChange={(e) => setContextNotes(e.target.value)}
                className="form-textarea"
                rows={2}
                placeholder="Operational sector or equipment observation..."
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
              {loading ? 'Running Computer Vision Analysis...' : 'Execute Vision Safety Scan'}
            </button>
          </form>
        </div>

        {/* Results & Visual Overlay View */}
        <div>
          {/* Image Preview & Bounding Box Overlay Canvas */}
          <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                IMAGE FEED & VISUAL DETECTION OVERLAY
              </span>
              {result && (
                <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: '700' }}>
                  {result.detected_hazards?.length || 0} Visual Boxes
                </span>
              )}
            </div>

            {/* Container for Image & Bounding Boxes */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxHeight: '340px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#070D1E',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={previewUrl}
                alt="Inspection Site"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '340px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />

              {/* Dynamic Bounding Box Overlays */}
              {result?.detected_hazards?.map((h, idx) => {
                if (!h.bounding_box) return null;
                const { ymin, xmin, ymax, xmax } = h.bounding_box;
                const top = `${ymin * 100}%`;
                const left = `${xmin * 100}%`;
                const height = `${(ymax - ymin) * 100}%`;
                const width = `${(xmax - xmin) * 100}%`;
                const isCritical = h.severity_level === 'CRITICAL';
                const boxColor = isCritical ? '#EF4444' : '#F59E0B';
                const isHovered = activeBoxIndex === idx;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setActiveBoxIndex(idx)}
                    onMouseLeave={() => setActiveBoxIndex(null)}
                    style={{
                      position: 'absolute',
                      top,
                      left,
                      height,
                      width,
                      border: `2px solid ${boxColor}`,
                      background: isHovered ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.08)',
                      boxShadow: isCritical ? '0 0 12px rgba(239, 68, 68, 0.5)' : '0 0 8px rgba(245, 158, 11, 0.4)',
                      borderRadius: '4px',
                      pointerEvents: 'auto',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      zIndex: 10,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '-22px',
                        left: '0',
                        background: boxColor,
                        color: '#FFFFFF',
                        fontSize: '0.65rem',
                        fontWeight: '900',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                      }}
                    >
                      {h.hazard_label} ({Math.round(h.confidence * 100)}%)
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.4rem', textAlign: 'center' }}>
              * Real computer vision bounding boxes identify detected spatial hazard regions.
            </div>
          </div>

          {/* AI Inspection Findings & Risk Engine Output */}
          {result && (
            <div
              className="glass-card"
              style={{
                padding: '1.75rem',
                borderTop: `4px solid ${result.sif_risk_rating === 'CRITICAL' ? '#EF4444' : result.sif_risk_rating === 'HIGH' ? '#F97316' : '#10B981'}`,
              }}
            >
              {/* Top Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#38BDF8', letterSpacing: '0.05em' }}>
                    {result.inspection_id} • REAL VISION SCAN
                  </span>
                  <h4 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#FFFFFF', margin: '0.2rem 0 0' }}>
                    RISK LEVEL: {result.sif_risk_rating}
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    Calculated Risk Index: <strong style={{ color: '#FFFFFF' }}>{result.risk_score || (result.sif_risk_rating === 'CRITICAL' ? 86 : result.sif_risk_rating === 'HIGH' ? 68 : 12)}/100</strong>
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#38BDF8', lineHeight: 1 }}>
                    {Math.round(result.overall_confidence * 100)}%
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700' }}>AI CONFIDENCE</div>
                </div>
              </div>

              {/* Distinction Notice */}
              <div style={{ padding: '0.65rem 0.85rem', borderRadius: '6px', background: '#070D1E', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
                <strong style={{ color: '#38BDF8' }}>System Designation:</strong> Visual observation detected by Computer Vision; Risk score and SIF tier synthesized by the OIL-SIF-AI Risk Engine.
              </div>

              {/* Detected Visual Issues */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#CBD5E1', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  DETECTED VISUAL ISSUES ({result.detected_hazards?.length || 0}):
                </div>

                {result.detected_hazards?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {result.detected_hazards.map((h, i) => (
                      <div
                        key={i}
                        onMouseEnter={() => setActiveBoxIndex(i)}
                        onMouseLeave={() => setActiveBoxIndex(null)}
                        style={{
                          background: activeBoxIndex === i ? 'rgba(56, 189, 248, 0.08)' : 'rgba(15, 23, 42, 0.6)',
                          padding: '0.85rem',
                          borderRadius: '8px',
                          borderLeft: `4px solid ${h.severity_level === 'CRITICAL' ? '#EF4444' : '#F59E0B'}`,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', color: '#F8FAFC' }}>
                          <span>• {h.hazard_label}</span>
                          <span style={{ color: '#38BDF8', fontSize: '0.75rem' }}>{Math.round(h.confidence * 100)}% Confidence</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#CBD5E1', margin: '0.35rem 0 0', lineHeight: 1.4 }}>
                          {h.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34D399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <CheckCircle2 size={18} />
                    <span><strong>Clean Visual Inspection:</strong> No significant visual safety hazards or SIF precursors detected in this image.</span>
                  </div>
                )}
              </div>

              {/* SIF & Hazard Domain Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#0B132B', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>HAZARD DOMAIN</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#F1F5F9', marginTop: '0.15rem' }}>
                    {result.hazard_domain || (result.detected_hazards?.[0]?.hazard_label || 'General Safety')}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>SIF POTENTIAL</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: result.sif_risk_rating === 'LOW' ? '#10B981' : '#EF4444', marginTop: '0.15rem' }}>
                    {result.sif_risk_rating === 'LOW' ? 'No Precursor (Safe)' : 'Active SIF Precursor'}
                  </div>
                </div>
              </div>

              {/* Barrier & Recommended Actions */}
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.85rem 1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10B981', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  RECOMMENDED CORRECTIVE ACTION:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {result.recommended_safety_action?.map((act, i) => (
                    <li key={i} style={{ fontSize: '0.825rem', color: '#E2E8F0', lineHeight: 1.4 }}>
                      {act}
                    </li>
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

