import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  Sparkles,
  Flame,
  AlertOctagon,
  ArrowRight,
  Layers,
  CheckCircle2,
  Clock,
  MapPin,
  Bot,
  Zap,
  GitCommit,
  Camera,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  AlertTriangle,
  Info,
  CheckSquare,
  FileText,
  Upload,
  BookOpen,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';
import RiskScoreGauge from '../components/RiskScoreGauge';
import RiskBadge from '../components/RiskBadge';
import SeverityBadge from '../components/SeverityBadge';
import EscalationPath from '../components/EscalationPath';
import CopilotCard from '../components/CopilotCard';
import FeedbackModal from '../components/FeedbackModal';
import ErrorState from '../components/ErrorState';
import InfoTooltip from '../components/InfoTooltip';

const DEMO_SCENARIOS = [
  {
    id: 1,
    title: 'High-Pressure Oil Leak',
    type: 'Unsafe Condition',
    location: 'Offshore Platform Delta - Wellhead Manifold',
    asset: 'Flare Header 04',
    text: 'High-pressure crude oil injection line developed a severe flange gasket leak at 1200 PSI while maintenance technicians were working without proper protection in the immediate spray zone.',
    tag: 'Critical SIF',
    color: '#EF4444',
  },
  {
    id: 2,
    title: 'Confined-Space Entry Hazard',
    type: 'Unsafe Act',
    location: 'Refinery Crude Distillation Unit Tank #4',
    asset: 'High Pressure Separator A',
    text: 'Worker entered a confined space without atmospheric gas testing and without confirming required entry controls.',
    tag: 'Fatal Risk',
    color: '#EF4444',
  },
  {
    id: 3,
    title: 'Hot Work Near Flammables',
    type: 'Unsafe Act',
    location: 'Compressor Station 3 - Gas Processing Area',
    asset: 'Gas Compressor 01',
    text: 'Workers performed hot work near flammable material without adequate gas monitoring and fire protection controls.',
    tag: 'Fire/Explosion',
    color: '#F97316',
  },
  {
    id: 4,
    title: 'Working-at-Height Hazard',
    type: 'Unsafe Act',
    location: 'Drilling Rig Substructure 2',
    asset: 'Offshore Crane 1',
    text: 'Worker was performing maintenance at height without proper fall protection.',
    tag: 'Fall Risk',
    color: '#F59E0B',
  },
  {
    id: 5,
    title: 'Minor Housekeeping / Tripping',
    type: 'Unsafe Condition',
    location: 'Central Field Workshop Area',
    asset: 'Mud Pump #2',
    text: 'Loose materials were left across a workshop walkway creating a tripping hazard.',
    tag: 'Low Risk',
    color: '#10B981',
  },
];

const ASSET_OPTIONS = [
  { label: 'None / General Facility Zone', value: '' },
  { label: 'Flare Header 04 (Flare & Relief)', value: 'Flare Header 04' },
  { label: 'Mud Pump #2 (High Pressure Drilling)', value: 'Mud Pump #2' },
  { label: 'High Pressure Separator A (Pressure Vessel)', value: 'High Pressure Separator A' },
  { label: 'Offshore Crane 1 (Lifting Equipment)', value: 'Offshore Crane 1' },
  { label: 'Wellhead B-12 (Subsea / Surface Wellhead)', value: 'Wellhead B-12' },
  { label: 'Gas Compressor 01 (Rotating Equipment)', value: 'Gas Compressor 01' },
];

export default function AnalyzeReport({ onNavigateToReport }) {
  const [inputMode, setInputMode] = useState('pdf'); // 'pdf' or 'text'
  const [pdfFile, setPdfFile] = useState(null);
  const [reportText, setReportText] = useState('');
  const [reportType, setReportType] = useState('Unsafe Condition');
  const [location, setLocation] = useState('Offshore Platform Delta - Wellhead Manifold');
  const [asset, setAsset] = useState('Flare Header 04');
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [completedActions, setCompletedActions] = useState({});
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const pdfInputRef = useRef(null);

  const handlePdfFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Please select a valid PDF document.');
      return;
    }

    setPdfFile(file);
    setResult(null);
    setError(null);
  };

  const handlePdfDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf')) {
      setPdfFile(file);
      setResult(null);
      setError(null);
    }
  };

  const handleUseScenario = (sc) => {
    setInputMode('text');
    setReportText(sc.text);
    setReportType(sc.type);
    setLocation(sc.location);
    setAsset(sc.asset || '');
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();

    if (inputMode === 'pdf' && !pdfFile) {
      alert('Please upload a PDF safety report first.');
      return;
    }
    if (inputMode === 'text' && !reportText.trim()) {
      alert('Please enter a safety report observation.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      setAnalysisStep(1);
      const stepTimer1 = setTimeout(() => setAnalysisStep(2), 250);
      const stepTimer2 = setTimeout(() => setAnalysisStep(3), 500);
      const stepTimer3 = setTimeout(() => setAnalysisStep(4), 750);

      let response;
      if (inputMode === 'pdf') {
        const formData = new FormData();
        formData.append('file', pdfFile);
        formData.append('location', location);
        if (asset) formData.append('asset', asset);
        response = await api.analyzePdfReport(formData);
      } else {
        response = await api.analyzeReport({
          report_text: reportText,
          report_type: reportType,
          location: location,
          asset: asset || undefined,
        });
      }

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      setResult(response);
      setCompletedActions({});
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.message || 'Failed to complete AI safety analysis. Please check file format.');
    } finally {
      setLoading(false);
      setAnalysisStep(0);
    }
  };

  const toggleAction = (idx) => {
    setCompletedActions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const getRiskScoreMeaning = (score) => {
    if (score >= 75) return { tier: 'CRITICAL', label: 'Immediate safety attention required', desc: 'Active high-potential precursor with compromised barriers.' };
    if (score >= 50) return { tier: 'HIGH', label: 'Priority investigation recommended', desc: 'Significant hazard severity with potential for escalation.' };
    if (score >= 25) return { tier: 'MEDIUM', label: 'Safety review recommended', desc: 'Moderate operational risk requiring standard mitigation.' };
    return { tier: 'LOW', label: 'Routine monitoring', desc: 'Low severity event within normal operational limits.' };
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <Zap size={14} /> AI Safety Report Analysis
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Analyze Safety Report
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
          Upload PDF inspection reports or enter safety observations to extract traceable findings, calculate risk, and identify SIF precursors.
        </p>
      </div>

      {/* Input Mode Switcher & Panel */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#FFFFFF' }}>Input Method:</span>
            <div style={{ display: 'flex', background: '#0B132B', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                type="button"
                onClick={() => { setInputMode('pdf'); setResult(null); setError(null); }}
                style={{
                  background: inputMode === 'pdf' ? '#0284C7' : 'transparent',
                  color: inputMode === 'pdf' ? '#FFFFFF' : '#94A3B8',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <FileText size={14} /> PDF Report Upload
              </button>
              <button
                type="button"
                onClick={() => { setInputMode('text'); setResult(null); setError(null); }}
                style={{
                  background: inputMode === 'text' ? '#0284C7' : 'transparent',
                  color: inputMode === 'text' ? '#FFFFFF' : '#94A3B8',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <FileCheck size={14} /> Text / Scenarios
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '180px' }}>
              <select
                className="form-select"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', height: '36px' }}
              >
                {ASSET_OPTIONS.map((opt, i) => (
                  <option key={i} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div style={{ minWidth: '180px' }}>
              <input
                type="text"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Operational Site..."
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', height: '36px' }}
              />
            </div>
          </div>
        </div>

        {/* WORKFLOW 1: PDF UPLOAD */}
        {inputMode === 'pdf' && (
          <div>
            <input
              type="file"
              ref={pdfInputRef}
              accept="application/pdf,.pdf"
              onChange={handlePdfFileSelect}
              style={{ display: 'none' }}
            />
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handlePdfDrop}
              onClick={() => pdfInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(56, 189, 248, 0.45)',
                borderRadius: '12px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                background: 'rgba(56, 189, 248, 0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '1.5rem',
              }}
            >
              <FileText size={42} color="#38BDF8" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.35rem' }}>
                📄 Upload Safety Report PDF
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '0 0 1rem' }}>
                Drag & drop safety/inspection PDF here or <strong style={{ color: '#38BDF8' }}>click to browse</strong>
              </p>
              <span style={{ fontSize: '0.72rem', padding: '0.3rem 0.8rem', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#CBD5E1' }}>
                Supported: Standard & Multi-Page PDF Safety Audits
              </span>
            </div>

            {/* Selected PDF Summary Card */}
            {pdfFile && (
              <div style={{ padding: '1rem 1.25rem', borderRadius: '8px', background: '#070D1E', border: '1px solid rgba(56, 189, 248, 0.3)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#FFFFFF' }}>
                      Filename: {pdfFile.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      Size: {Math.round(pdfFile.size / 1024)} KB • Status: <strong style={{ color: '#10B981' }}>✓ Report Ready for Analysis</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
                >
                  {loading ? 'Extracting & Analyzing PDF...' : 'Analyze Safety Report PDF'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* WORKFLOW 2: MANUAL TEXT & DEMO SCENARIOS */}
        {inputMode === 'text' && (
          <div>
            {/* Quick Demo Scenarios */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '0.65rem' }}>
                Quick Demo Scenarios (Click to Auto-Fill)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {DEMO_SCENARIOS.map((sc) => (
                  <div
                    key={sc.id}
                    className="glass-card glass-card-interactive"
                    onClick={() => handleUseScenario(sc)}
                    style={{
                      padding: '0.85rem',
                      borderLeft: `4px solid ${sc.color}`,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '0.68rem', fontWeight: '800', color: sc.color, textTransform: 'uppercase' }}>
                      {sc.tag}
                    </span>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#F8FAFC', margin: '0.2rem 0' }}>
                      {sc.title}
                    </h5>
                    <p style={{ fontSize: '0.72rem', color: '#94A3B8', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
                      {sc.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8' }}>
                    Safety Observation / Incident Narrative
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    {reportText.length} characters
                  </span>
                </div>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Describe the unsafe condition, near-miss, pressure level, gas testing, or failed barrier in detail..."
                  required
                  minLength={5}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || reportText.trim().length < 5}
                  style={{ minWidth: '220px', padding: '0.85rem 1.5rem' }}
                >
                  {loading ? 'Executing AI Pipeline...' : 'Analyze Safety Report'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading Multi-Step Animation */}
        {loading && (
          <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#0B132B', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <div style={{ fontSize: '0.825rem', fontWeight: '700', color: '#38BDF8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={15} /> Executing Safety Intelligence Pipeline:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
              {[
                inputMode === 'pdf' ? 'Extracting PDF Pages' : 'NLP Feature Extraction',
                'Hazard Domain Classifier',
                'SIF Precursor Assessment',
                'Risk Engine Calculation',
              ].map((step, i) => {
                const isCurrent = analysisStep === i + 1;
                const isDone = analysisStep > i + 1;

                return (
                  <div
                    key={i}
                    style={{
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      background: isDone ? 'rgba(16, 185, 129, 0.12)' : (isCurrent ? 'rgba(56, 189, 248, 0.15)' : '#070D1E'),
                      border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : (isCurrent ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.05)'),
                      color: isDone ? '#34D399' : (isCurrent ? '#38BDF8' : '#64748B'),
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isDone ? '#10B981' : (isCurrent ? '#38BDF8' : '#334155') }} />
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Error Presentation */}
      {error && (
        <ErrorState
          title="Analysis Unsuccessful"
          message={error}
          onRetry={() => handleAnalyze()}
        />
      )}

      {/* Analysis Result Dashboard */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* SECTION 1: Top Result Summary */}
          <div
            className="glass-card"
            style={{
              padding: '2rem',
              background: 'linear-gradient(145deg, #101B3B 0%, #0B132B 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={18} color="#38BDF8" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                  AI Safety Report Analysis Result
                </h3>
              </div>
              {result.total_pages && (
                <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: '700', background: 'rgba(56, 189, 248, 0.1)', padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                  📄 {result.filename} ({result.total_pages} Pages)
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {/* SIF Detection */}
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '12px',
                  background: result.sif_precursor ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  border: `1px solid ${result.sif_precursor ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: result.sif_precursor ? '#F87171' : '#34D399' }}>
                  SIF PRECURSOR
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#FFFFFF', marginTop: '0.35rem' }}>
                  {result.sif_precursor ? '⚠️ DETECTED' : 'NOT DETECTED'}
                </div>
                <div style={{ fontSize: '0.825rem', color: '#CBD5E1', marginTop: '0.4rem' }}>
                  SIF Probability: <strong style={{ color: '#F8FAFC' }}>{Math.round(result.sif_probability * 100)}%</strong> (AI estimate)
                </div>
              </div>

              {/* Risk Score */}
              <div style={{ padding: '1.5rem', borderRadius: '12px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#38BDF8' }}>
                  RISK SCORE
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: result.risk_score >= 75 ? '#EF4444' : result.risk_score >= 50 ? '#F97316' : '#10B981', marginTop: '0.1rem' }}>
                  {result.risk_score} <span style={{ fontSize: '1rem', color: '#64748B' }}>/ 100</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                  Risk Level: <strong style={{ color: '#FFFFFF' }}>{result.risk_level}</strong>
                </div>
              </div>

              {/* Primary Hazard */}
              <div style={{ padding: '1.5rem', borderRadius: '12px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#F59E0B' }}>
                  PRIMARY HAZARD
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FFFFFF', marginTop: '0.35rem' }}>
                  {result.hazard_category}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.4rem' }}>
                  Severity: <strong style={{ color: '#F1F5F9' }}>{result.severity}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Key Findings & Page Traceability */}
          {result.key_findings && result.key_findings.length > 0 && (
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <BookOpen size={18} color="#38BDF8" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
                  Key Findings (Extracted from Report)
                </h3>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
                Every critical safety observation extracted with exact source page traceability:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {result.key_findings.map((finding, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '8px',
                      background: '#0B132B',
                      borderLeft: `4px solid ${finding.severity === 'CRITICAL' ? '#EF4444' : finding.severity === 'HIGH' ? '#F97316' : '#38BDF8'}`,
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      borderRight: '1px solid rgba(255,255,255,0.05)',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#FFFFFF' }}>
                        ⚠️ {finding.finding}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                        Source: Page {finding.source_page}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: '#CBD5E1', margin: '0 0 0.4rem', lineHeight: '1.4' }}>
                      "{finding.evidence_sentence}"
                    </p>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700' }}>
                      Related Hazard Domain: <strong style={{ color: '#94A3B8' }}>{finding.hazard}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: Why This Score? */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={18} color="#F97316" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
                  Why This Score? (Contributing Findings)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                style={{
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  color: '#38BDF8',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {showTechnicalDetails ? 'Hide Calculation Details' : 'View Calculation Details'}
                {showTechnicalDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.85rem' }}>
              Risk score evaluated at <strong>{result.risk_score}/100</strong> because the safety report contains:
            </p>

            <div style={{ background: '#0B132B', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #38BDF8', marginBottom: '1rem' }}>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {result.why_this_score?.map((reason, idx) => (
                  <li key={idx} style={{ fontSize: '0.85rem', color: '#E2E8F0', lineHeight: 1.4 }}>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Expandable Technical Calculation Details */}
            {showTechnicalDetails && (
              <div style={{ padding: '1rem', background: '#070D1E', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Risk Engine Weighting & Formulation
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 0.5rem' }}>
                  <code>Risk_Score = min(100, round((0.40 × SIF_Prob + 0.35 × Severity_Weight + 0.25 × Hazard_Weight) × Factor_Multiplier × 100))</code>
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.75rem', color: '#CBD5E1' }}>
                  <div>SIF Probability: <code>{result.sif_probability?.toFixed(4)}</code></div>
                  <div>Hazard Probability: <code>{result.hazard_probability?.toFixed(4)}</code></div>
                  <div>Severity Tier: <code>{result.severity}</code></div>
                  <div>Database ID: <code>#{result.id || 'Stored'}</code></div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: Recommended Actions */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <CheckSquare size={18} color="#10B981" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
                Recommended Actions
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
              Practical corrective actions synthesized for {result.hazard_category}:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.85rem' }}>
              {result.recommended_action?.map((action, idx) => {
                const isChecked = !!completedActions[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleAction(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '1rem',
                      borderRadius: '10px',
                      background: isChecked ? 'rgba(16, 185, 129, 0.08)' : '#0B132B',
                      border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        border: isChecked ? '1px solid #10B981' : '1px solid #475569',
                        background: isChecked ? '#10B981' : 'transparent',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      {isChecked && <CheckCircle2 size={16} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isChecked ? '#34D399' : '#64748B' }}>
                        ACTION {String(idx + 1).padStart(2, '0')}
                      </span>
                      <p style={{ fontSize: '0.85rem', color: isChecked ? '#CBD5E1' : '#F1F5F9', marginTop: '0.2rem', textDecoration: isChecked ? 'line-through' : 'none' }}>
                        {action}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Safety Copilot Card */}
          {result.copilot && <CopilotCard copilot={result.copilot} />}

          {/* Human Safety Officer Feedback (Feature 7) */}
          {result.id && <FeedbackModal reportId={result.id} />}
        </div>
      )}
    </div>
  );
}
