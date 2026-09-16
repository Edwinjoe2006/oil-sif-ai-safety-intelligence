import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Upload, AlertCircle, CheckCircle2, Shield, Eye, RefreshCw, 
  FileImage, Info, X, Check, HelpCircle, ShieldCheck, AlertTriangle, 
  History, BookmarkCheck, ExternalLink, Flame, Wind, Droplets, Layers
} from 'lucide-react';
import { api } from '../services/api';

export default function ImageInspection() {
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' or 'history'
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
  const [savingInspection, setSavingInspection] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Inspector validation inputs
  const [reviewerName, setReviewerName] = useState('Senior HSE Inspector');
  const [reviewerNotes, setReviewerNotes] = useState('Verified visual CV findings; physical tag applied.');
  const [verificationStatus, setVerificationStatus] = useState('VERIFIED');

  // History State
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fileInputRef = useRef(null);

  // Load inspection history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoadingHistory(true);
      const data = await api.getVisionHistory(30, 0);
      setHistoryList(data || []);
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(png|jpeg|jpg|webp)/i)) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setResult(null);
    setSaveSuccessMessage(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.match(/image\/(png|jpeg|jpg|webp)/i)) {
      setErrorMessage(null);
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setResult(null);
      setSaveSuccessMessage(null);
    }
  };

  async function handleInspect(e) {
    e.preventDefault();
    setErrorMessage(null);
    setSaveSuccessMessage(null);

    if (uploadMode === 'url' && !imageUrl?.trim()) {
      setErrorMessage('Please enter a valid image URL before running inspection.');
      return;
    }

    try {
      setLoading(true);
      let res;
      if (uploadMode === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('context_notes', contextNotes);
        formData.append('asset', assetName);
        formData.append('location', location);
        res = await api.inspectSafetyImage(formData);
      } else {
        res = await api.inspectSafetyImage({
          image_url: imageUrl.trim(),
          context_notes: contextNotes,
          asset: assetName,
          location: location
        });
      }

      if (res?.hazard_domain === 'Image Ingestion Failure') {
        setErrorMessage(res.recommended_safety_action?.[0] || 'Unable to load image from URL. Please check the URL.');
        setResult(null);
      } else {
        setResult(res);
        if (res.image_data) {
          setPreviewUrl(res.image_data);
        }
      }
    } catch (err) {
      console.error('Inspection error:', err);
      setErrorMessage(err.message || 'Failed to execute computer vision scan.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyAndSave() {
    if (!result) return;
    try {
      setSavingInspection(true);
      setSaveSuccessMessage(null);
      setErrorMessage(null);

      const savePayload = {
        inspection_id: result.inspection_id,
        image_data: result.image_data || previewUrl,
        image_url: uploadMode === 'url' ? imageUrl : null,
        image_source_type: uploadMode,
        filename: selectedFile ? selectedFile.name : 'safety_inspection_feed.jpg',
        target_asset: assetName || result.target_asset || 'Operational Asset',
        facility_location: location || result.facility_location || 'Operational Site',
        inspector_notes: contextNotes,
        ppe_findings: result.ppe_findings || [],
        hazard_findings: result.hazard_findings || [],
        detected_hazards: result.detected_hazards || [],
        safety_checklist: result.safety_checklist || [],
        overall_confidence: result.overall_confidence || 0.90,
        risk_score: result.risk_score || 50,
        sif_risk_rating: result.sif_risk_rating || 'MEDIUM',
        sif_probability: result.sif_probability || 0.50,
        hazard_domain: result.hazard_domain || 'General Safety',
        barrier_integrity_status: result.barrier_integrity_status,
        recommended_safety_action: result.recommended_safety_action || [],
        vision_model_engine: result.vision_model_engine || 'Real Computer Vision Spatial Analyzer',
        human_verification_required: result.human_verification_required || false,
        verification_status: verificationStatus,
        reviewer_name: reviewerName,
        reviewer_notes: reviewerNotes,
        inspected_at: result.inspected_at || new Date().toISOString()
      };

      const response = await api.saveVisionInspection(savePayload);
      if (response && response.success) {
        setSaveSuccessMessage(`Inspection #${response.inspection_id} verified & saved successfully to database.`);
        setResult((prev) => ({
          ...prev,
          verification_status: verificationStatus,
          reviewer_name: reviewerName
        }));
        await loadHistory();
      } else {
        throw new Error(response?.message || 'Database rejected save request.');
      }
    } catch (err) {
      console.error('Save error:', err);
      setErrorMessage(err.message || 'Unable to save inspection to database. Please try again.');
    } finally {
      setSavingInspection(false);
    }
  }

  function handleLoadSavedInspection(item) {
    setResult({
      inspection_id: item.inspection_id,
      vision_model_engine: item.vision_model_engine,
      image_data: item.image_data,
      image_url: item.image_url,
      image_source_type: item.image_source_type,
      target_asset: item.target_asset,
      facility_location: item.facility_location,
      inspector_notes: item.inspector_notes,
      ppe_findings: item.ppe_findings || [],
      hazard_findings: item.hazard_findings || [],
      detected_hazards: item.detected_hazards || [],
      safety_checklist: item.safety_checklist || [],
      sif_risk_rating: item.sif_risk_rating,
      sif_probability: item.sif_probability,
      overall_confidence: item.overall_confidence,
      hazard_domain: item.hazard_domain,
      risk_score: item.risk_score,
      barrier_integrity_status: item.barrier_integrity_status,
      recommended_safety_action: item.recommended_safety_action || [],
      verification_status: item.verification_status,
      reviewer_name: item.reviewer_name,
      inspected_at: item.inspected_at
    });

    if (item.image_data) {
      setPreviewUrl(item.image_data);
    } else if (item.image_url) {
      setPreviewUrl(item.image_url);
    }

    setAssetName(item.target_asset || 'Operational Asset');
    setLocation(item.facility_location || 'Operational Site');
    setContextNotes(item.inspector_notes || '');
    setVerificationStatus(item.verification_status || 'VERIFIED');
    setReviewerName(item.reviewer_name || 'Senior HSE Inspector');
    setReviewerNotes(item.reviewer_notes || '');
    setActiveTab('scan');
    setSaveSuccessMessage(`Loaded saved inspection #${item.inspection_id} from database.`);
  }

  const samplePresets = [
    {
      title: 'Flange Hydrocarbon Leak',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
      notes: 'Active hydrocarbon leak and vapor plume at main piping flange',
      asset: 'Flare Header 04'
    },
    {
      title: 'Protected Worker with Hardhat & High-Vis',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      notes: 'Technician equipped with protective hard hat and high-visibility vest',
      asset: 'Offshore Crane 1'
    },
    {
      title: 'Corroded Process Piping',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      notes: 'Severe external rust degradation on high pressure gas separator line',
      asset: 'High Pressure Separator A'
    }
  ];

  // Derive separate PPE and Hazard findings
  const ppeFindingsList = result?.ppe_findings?.length
    ? result.ppe_findings
    : result?.safety_checklist?.filter((item) => item.category === 'PPE Compliance') || [];

  const hazardFindingsList = result?.hazard_findings?.length
    ? result.hazard_findings
    : result?.safety_checklist?.filter((item) => item.category !== 'PPE Compliance') || [];

  // Combine checklist bounding boxes and active hazards for overlay
  const allOverlayBoxes = [];
  if (result) {
    ppeFindingsList.forEach((item, idx) => {
      if (item.bounding_box) {
        allOverlayBoxes.push({
          id: `ppe-${idx}`,
          label: item.item_name,
          status: item.status,
          is_compliant: item.is_compliant,
          confidence: item.confidence,
          bounding_box: item.bounding_box,
          type: item.is_compliant ? 'compliant' : 'hazard',
        });
      }
    });

    hazardFindingsList.forEach((item, idx) => {
      if (item.bounding_box && item.status === 'DETECTED') {
        allOverlayBoxes.push({
          id: `haz-${idx}`,
          label: item.item_name,
          status: item.status,
          is_compliant: false,
          confidence: item.confidence,
          bounding_box: item.bounding_box,
          type: 'hazard',
          severity: item.severity_level || 'HIGH',
        });
      }
    });

    result.detected_hazards?.forEach((h, idx) => {
      if (h.bounding_box && !allOverlayBoxes.some((b) => b.label === h.hazard_label)) {
        allOverlayBoxes.push({
          id: `dhaz-${idx}`,
          label: h.hazard_label,
          status: h.status || 'DETECTED',
          is_compliant: false,
          confidence: h.confidence,
          bounding_box: h.bounding_box,
          type: 'hazard',
          severity: h.severity_level,
        });
      }
    });
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            <Camera size={14} /> Multi-Target Vision Safety Inspection
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            AI Image Safety Inspection
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginTop: '0.25rem' }}>
            Real pixel-level computer vision analysis distinguishing PPE compliance from physical hazards (fire, smoke, flange leaks, corrosion, liquid pooling) with spatial bounding boxes.
          </p>
        </div>

        {/* View Switcher: Scan vs History */}
        <div style={{ display: 'flex', gap: '4px', background: '#0B132B', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            style={{
              background: activeTab === 'scan' ? '#0284C7' : 'transparent',
              color: activeTab === 'scan' ? '#FFFFFF' : '#94A3B8',
              border: 'none',
              borderRadius: '6px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Camera size={14} /> New Inspection Scan
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              loadHistory();
            }}
            style={{
              background: activeTab === 'history' ? '#0284C7' : 'transparent',
              color: activeTab === 'history' ? '#FFFFFF' : '#94A3B8',
              border: 'none',
              borderRadius: '6px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <History size={14} /> Inspection History ({historyList.length})
          </button>
        </div>
      </div>

      {/* Error & Success Banners */}
      {errorMessage && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>
            <AlertCircle size={18} color="#EF4444" /> {errorMessage}
          </div>
          <button onClick={() => setErrorMessage(null)} style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {saveSuccessMessage && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#A7F3D0', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>
            <CheckCircle2 size={18} color="#10B981" /> {saveSuccessMessage}
          </div>
          <button onClick={() => setSaveSuccessMessage(null)} style={{ background: 'none', border: 'none', color: '#A7F3D0', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* TAB 1: NEW INSPECTION SCAN VIEW */}
      {activeTab === 'scan' && (
        <>
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
              Inspection Pipeline:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              {[
                { label: 'IMAGE INGESTION', desc: 'Real pixel byte decoding', color: '#94A3B8' },
                { label: 'PPE CLASSIFICATION', desc: 'Positive vs Missing PPE', color: '#10B981' },
                { label: 'HAZARD SCAN', desc: 'Fire, Leaks, Corrosion, Pools', color: '#EF4444' },
                { label: 'RISK ENGINE', desc: 'SIF risk score synthesis', color: '#38BDF8' },
                { label: 'DB PERSISTENCE', desc: 'Verify & Log record', color: '#A855F7' },
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

          <div className="responsive-two-col">
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
                      Drag & drop inspection photo here or click to browse
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
                          setSaveSuccessMessage(null);
                          setErrorMessage(null);
                        }}
                        className="btn btn-secondary"
                        style={{ textAlign: 'left', fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
                      >
                        📷 {p.title}
                      </button>
                    ))}
                  </div>

                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.35rem' }}>
                    Or Public Image URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setPreviewUrl(e.target.value);
                      setSelectedFile(null);
                      setSaveSuccessMessage(null);
                      setErrorMessage(null);
                    }}
                    className="form-input"
                    placeholder="https://..."
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginTop: '0.3rem' }}>
                    * Backend will securely fetch, validate bytes, and run real computer vision inference.
                  </span>
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
                    placeholder="Operational sector, equipment observation, or maintenance status..."
                  />
                </div>

                <div className="responsive-form-grid" style={{ marginBottom: '1.5rem' }}>
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
                  {loading ? 'Executing Real Computer Vision Scan...' : 'Execute Vision Safety Scan'}
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
                      {allOverlayBoxes.length} Spatial Regions Mapped
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
                  {allOverlayBoxes.map((b, idx) => {
                    if (!b.bounding_box) return null;
                    const { ymin, xmin, ymax, xmax } = b.bounding_box;
                    const top = `${ymin * 100}%`;
                    const left = `${xmin * 100}%`;
                    const height = `${(ymax - ymin) * 100}%`;
                    const width = `${(xmax - xmin) * 100}%`;
                    const isCompliant = b.is_compliant;
                    const isCritical = b.severity === 'CRITICAL';
                    const boxColor = isCompliant ? '#10B981' : isCritical ? '#EF4444' : '#F59E0B';
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
                          background: isHovered
                            ? (isCompliant ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)')
                            : (isCompliant ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)'),
                          boxShadow: isCompliant
                            ? '0 0 10px rgba(16, 185, 129, 0.4)'
                            : isCritical
                            ? '0 0 12px rgba(239, 68, 68, 0.5)'
                            : '0 0 8px rgba(245, 158, 11, 0.4)',
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
                          {isCompliant ? '✓ ' : '⚠ '}{b.label} ({Math.round(b.confidence * 100)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.4rem', textAlign: 'center' }}>
                  * Real computer vision bounding boxes derived from pixel color-space, luminance, and spatial gradient tensors.
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
                  {/* Top Banner with Real Model Indicator */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.7rem', color: '#38BDF8', fontWeight: '800', marginBottom: '0.35rem' }}>
                        <ShieldCheck size={12} /> Real image analysis completed (Model: {result.vision_model_engine || 'Local CV Multi-Target Engine'})
                      </div>
                      <h4 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#FFFFFF', margin: '0.2rem 0 0' }}>
                        RISK LEVEL: {result.sif_risk_rating}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                        Synthesized Risk Index: <strong style={{ color: '#FFFFFF' }}>{result.risk_score || 50}/100</strong> • ID: <span style={{ color: '#38BDF8' }}>{result.inspection_id}</span>
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#38BDF8', lineHeight: 1 }}>
                        {Math.round(result.overall_confidence * 100)}%
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700' }}>OVERALL CONFIDENCE</div>
                    </div>
                  </div>

                  {/* Distinction Notice */}
                  <div style={{ padding: '0.65rem 0.85rem', borderRadius: '6px', background: '#070D1E', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
                    <strong style={{ color: '#38BDF8' }}>System Distinction:</strong> Visual elements detected by Computer Vision; Risk score and SIF classification synthesized by the OIL-SIF-AI Risk Engine.
                  </div>

                  {/* 1. PPE COMPLIANCE FINDINGS */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Shield size={14} /> PPE COMPLIANCE FINDINGS ({ppeFindingsList.length}):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {ppeFindingsList.map((item, i) => {
                        const isDetected = item.status === 'DETECTED';
                        const isMissing = item.status === 'MISSING';
                        const isUncertain = item.status === 'UNCERTAIN';
                        const isCompliant = item.is_compliant;

                        let statusBadgeBg = 'rgba(255,255,255,0.05)';
                        let statusBadgeColor = '#94A3B8';
                        let statusText = 'NOT DETECTED';
                        let icon = <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#475569', display: 'inline-block' }} />;

                        if (isDetected && isCompliant) {
                          statusBadgeBg = 'rgba(16, 185, 129, 0.15)';
                          statusBadgeColor = '#10B981';
                          statusText = '✓ DETECTED (COMPLIANT)';
                          icon = <CheckCircle2 size={15} color="#10B981" />;
                        } else if (isMissing) {
                          statusBadgeBg = 'rgba(239, 68, 68, 0.15)';
                          statusBadgeColor = '#EF4444';
                          statusText = '✕ MISSING PPE (VIOLATION)';
                          icon = <AlertCircle size={15} color="#EF4444" />;
                        } else if (isUncertain) {
                          statusBadgeBg = 'rgba(245, 158, 11, 0.15)';
                          statusBadgeColor = '#F59E0B';
                          statusText = '❓ UNCERTAIN (REVIEW REQUIRED)';
                          icon = <HelpCircle size={15} color="#F59E0B" />;
                        }

                        return (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.6rem 0.8rem',
                              background: 'rgba(15, 23, 42, 0.6)',
                              borderRadius: '6px',
                              border: `1px solid ${isCompliant ? 'rgba(16, 185, 129, 0.2)' : isMissing ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                              gap: '0.5rem',
                              flexWrap: 'wrap'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {icon}
                              <div>
                                <span style={{ fontSize: '0.825rem', fontWeight: '800', color: '#F1F5F9' }}>
                                  {item.item_name}
                                </span>
                                <p style={{ fontSize: '0.74rem', color: '#CBD5E1', margin: '0.15rem 0 0', lineHeight: 1.35 }}>
                                  {item.details}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '4px', background: statusBadgeBg, color: statusBadgeColor }}>
                                {statusText}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: '700' }}>
                                {Math.round(item.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. PHYSICAL HAZARD FINDINGS */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertTriangle size={14} /> PHYSICAL HAZARDS & PRECURSORS ({hazardFindingsList.length}):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {hazardFindingsList.map((item, i) => {
                        const isDetected = item.status === 'DETECTED';
                        const isUncertain = item.status === 'UNCERTAIN';
                        const isCritical = item.severity_level === 'CRITICAL';

                        let statusBadgeBg = 'rgba(255,255,255,0.05)';
                        let statusBadgeColor = '#94A3B8';
                        let statusText = 'NOT DETECTED (SAFE)';
                        let icon = <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#475569', display: 'inline-block' }} />;

                        if (isDetected) {
                          statusBadgeBg = isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';
                          statusBadgeColor = isCritical ? '#EF4444' : '#F59E0B';
                          statusText = `⚠ DETECTED (${item.severity_level || 'HAZARD'})`;
                          icon = <AlertCircle size={15} color={isCritical ? '#EF4444' : '#F59E0B'} />;
                        } else if (isUncertain) {
                          statusBadgeBg = 'rgba(245, 158, 11, 0.15)';
                          statusBadgeColor = '#F59E0B';
                          statusText = '❓ UNCERTAIN (HUMAN VERIFICATION REQUIRED)';
                          icon = <HelpCircle size={15} color="#F59E0B" />;
                        }

                        return (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.6rem 0.8rem',
                              background: isDetected ? 'rgba(239, 68, 68, 0.04)' : 'rgba(15, 23, 42, 0.6)',
                              borderRadius: '6px',
                              border: `1px solid ${isDetected ? (isCritical ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)') : 'rgba(255,255,255,0.05)'}`,
                              gap: '0.5rem',
                              flexWrap: 'wrap'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {icon}
                              <div>
                                <span style={{ fontSize: '0.825rem', fontWeight: '800', color: isDetected ? (isCritical ? '#FCA5A5' : '#FDE68A') : '#F1F5F9' }}>
                                  {item.item_name}
                                </span>
                                <p style={{ fontSize: '0.74rem', color: '#CBD5E1', margin: '0.15rem 0 0', lineHeight: 1.35 }}>
                                  {item.details}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '4px', background: statusBadgeBg, color: statusBadgeColor }}>
                                {statusText}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: '700' }}>
                                {Math.round(item.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SIF & Barrier Summary */}
                  <div className="responsive-form-grid" style={{ gap: '0.75rem', background: '#0B132B', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>BARRIER INTEGRITY</span>
                      <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#F1F5F9', marginTop: '0.15rem' }}>
                        {result.barrier_integrity_status}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>SIF POTENTIAL</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: result.sif_risk_rating === 'LOW' ? '#10B981' : '#EF4444', marginTop: '0.15rem' }}>
                        {result.sif_risk_rating === 'LOW' ? 'No Precursor (Safe Condition)' : `Active Precursor (${Math.round(result.sif_probability * 100)}% Probability)`}
                      </div>
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
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

                  {/* Human-in-the-Loop Verification & Database Save Box */}
                  <div style={{ padding: '1.15rem', background: '#091124', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase' }}>
                          Human-in-the-Loop HSE Validation & Audit Trail
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                          Confirm visual computer vision findings and log record into the persistent database.
                        </div>
                      </div>
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '4px', background: result.verification_status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: result.verification_status === 'VERIFIED' ? '#10B981' : '#F59E0B', fontWeight: '800' }}>
                        STATUS: {result.verification_status || 'PENDING REVIEW'}
                      </span>
                    </div>

                    <div className="responsive-form-grid" style={{ marginBottom: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#94A3B8', marginBottom: '0.25rem' }}>
                          Reviewer Name / Title
                        </label>
                        <input
                          type="text"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          className="form-input"
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#94A3B8', marginBottom: '0.25rem' }}>
                          Verification Decision
                        </label>
                        <select
                          value={verificationStatus}
                          onChange={(e) => setVerificationStatus(e.target.value)}
                          className="form-input"
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                        >
                          <option value="VERIFIED">VERIFIED (Confirmed Findings)</option>
                          <option value="REQUIRES REVIEW">REQUIRES REVIEW (Secondary Inspection)</option>
                          <option value="REJECTED">REJECTED (False Positive)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '0.85rem' }}>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#94A3B8', marginBottom: '0.25rem' }}>
                        Reviewer Sign-off Notes
                      </label>
                      <input
                        type="text"
                        value={reviewerNotes}
                        onChange={(e) => setReviewerNotes(e.target.value)}
                        className="form-input"
                        placeholder="Add inspection notes or corrective work order reference..."
                        style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                      />
                    </div>

                    <button
                      type="button"
                      disabled={savingInspection}
                      onClick={handleVerifyAndSave}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      {savingInspection ? <RefreshCw size={15} className="animate-spin" /> : <BookmarkCheck size={16} />}
                      {savingInspection ? 'Saving Inspection to Database...' : 'Verify & Log Findings to Database'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* TAB 2: INSPECTION HISTORY & REFRESH AUDIT TRAIL */}
      {activeTab === 'history' && (
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF' }}>
                Saved Vision Inspections Database
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                All verified vision inspections persisted in the database. Inspections survive page reloads and include full image feeds, bounding boxes, risk scores, and HSE sign-offs.
              </p>
            </div>
            <button
              onClick={loadHistory}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RefreshCw size={13} /> Refresh List
            </button>
          </div>

          {loadingHistory ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
              <div>Loading inspection records from database...</div>
            </div>
          ) : historyList.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B', background: '#091124', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Camera size={36} color="#475569" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#CBD5E1' }}>No inspections saved yet</div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '400px', margin: '0.25rem auto 1rem' }}>
                Execute a vision safety scan and click "Verify & Log Findings" to persist records here.
              </p>
              <button onClick={() => setActiveTab('scan')} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
                Create New Inspection
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {historyList.map((item, idx) => {
                const isCrit = item.sif_risk_rating === 'CRITICAL';
                const isHigh = item.sif_risk_rating === 'HIGH';
                const badgeColor = isCrit ? '#EF4444' : isHigh ? '#F97316' : '#10B981';

                return (
                  <div
                    key={idx}
                    style={{
                      background: '#091124',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'border 0.2s ease',
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ height: '140px', width: '100%', background: '#050914', position: 'relative', overflow: 'hidden' }}>
                      {item.image_data || item.image_url ? (
                        <img
                          src={item.image_data || item.image_url}
                          alt="Inspection"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569' }}>
                          <Camera size={32} />
                        </div>
                      )}
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: badgeColor,
                          color: '#FFFFFF',
                          fontSize: '0.65rem',
                          fontWeight: '800',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}
                      >
                        {item.sif_risk_rating} ({item.risk_score}/100)
                      </span>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8' }}>
                            {item.inspection_id}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                            {item.inspected_at ? new Date(item.inspected_at).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#F1F5F9', margin: '0 0 0.25rem' }}>
                          {item.target_asset || 'Operational Asset'}
                        </h4>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.5rem' }}>
                          📍 {item.facility_location}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#CBD5E1', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: '4px', marginBottom: '0.75rem' }}>
                          <strong>Findings:</strong> {item.hazard_domain || 'General Observation'} ({item.detected_hazards_count || 0} hazards, {item.ppe_findings_count || 0} PPE checks)
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: '700' }}>
                          ✓ {item.verification_status || 'VERIFIED'} by {item.reviewer_name || 'Inspector'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleLoadSavedInspection(item)}
                          className="btn btn-primary"
                          style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem' }}
                        >
                          Load Details &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
