import React, { useState } from 'react';
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
  Zap
} from 'lucide-react';
import { api } from '../services/api';
import RiskScoreGauge from '../components/RiskScoreGauge';
import RiskBadge from '../components/RiskBadge';
import SeverityBadge from '../components/SeverityBadge';
import EscalationPath from '../components/EscalationPath';
import CopilotCard from '../components/CopilotCard';
import FeedbackModal from '../components/FeedbackModal';
import ErrorState from '../components/ErrorState';

const DEMO_SCENARIOS = [
  {
    id: 1,
    title: 'High-Pressure Oil Leak',
    type: 'Unsafe Condition',
    location: 'Offshore Platform Delta - Wellhead Manifold',
    text: 'High-pressure crude oil injection line developed a severe flange gasket leak at 1200 PSI while maintenance technicians were working without proper protection in the immediate spray zone.',
    tag: 'Critical SIF',
    color: '#EF4444',
  },
  {
    id: 2,
    title: 'Confined-Space Entry Hazard',
    type: 'Unsafe Act',
    location: 'Refinery Crude Distillation Unit Tank #4',
    text: 'Worker entered a confined space without atmospheric gas testing and without confirming required entry controls.',
    tag: 'Fatal Risk',
    color: '#EF4444',
  },
  {
    id: 3,
    title: 'Hot Work Near Flammables',
    type: 'Unsafe Act',
    location: 'Compressor Station 3 - Gas Processing Area',
    text: 'Workers performed hot work near flammable material without adequate gas monitoring and fire protection controls.',
    tag: 'Fire/Explosion',
    color: '#F97316',
  },
  {
    id: 4,
    title: 'Working-at-Height Hazard',
    type: 'Unsafe Act',
    location: 'Drilling Rig Substructure 2',
    text: 'Worker was performing maintenance at height without proper fall protection.',
    tag: 'Fall Risk',
    color: '#F59E0B',
  },
  {
    id: 5,
    title: 'Minor Housekeeping / Tripping',
    type: 'Unsafe Condition',
    location: 'Central Field Workshop Area',
    text: 'Loose materials were left across a workshop walkway creating a tripping hazard.',
    tag: 'Low Risk',
    color: '#10B981',
  },
];

export default function AnalyzeReport({ onNavigateToReport }) {
  const [reportText, setReportText] = useState('');
  const [reportType, setReportType] = useState('Unsafe Condition');
  const [location, setLocation] = useState('Offshore Rig 4 - Deck Area');
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [completedActions, setCompletedActions] = useState({});

  const handleUseScenario = (sc) => {
    setReportText(sc.text);
    setReportType(sc.type);
    setLocation(sc.location);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Multi-step loading visualization
      setAnalysisStep(1); // NLP Parsing
      const stepTimer1 = setTimeout(() => setAnalysisStep(2), 250); // Hazard Detection
      const stepTimer2 = setTimeout(() => setAnalysisStep(3), 500); // SIF Assessment
      const stepTimer3 = setTimeout(() => setAnalysisStep(4), 750); // Risk Scoring

      const response = await api.analyzeReport({
        report_text: reportText,
        report_type: reportType,
        location: location,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      setResult(response);
      setCompletedActions({});
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.message || 'Failed to complete AI safety analysis');
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

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <Zap size={14} /> Neural Safety Classifier
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Analyze Safety Report
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
          Identify Serious Injury & Fatality (SIF) precursors, hazard domains, and potential risk pathways using AI.
        </p>
      </div>

      {/* Quick Demo Scenarios */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '0.75rem' }}>
          Quick Demo Scenarios (Click to Populate Form)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {DEMO_SCENARIOS.map((sc) => (
            <div
              key={sc.id}
              className="glass-card glass-card-interactive"
              onClick={() => handleUseScenario(sc)}
              style={{
                padding: '1.15rem',
                borderLeft: `4px solid ${sc.color}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: sc.color, textTransform: 'uppercase' }}>
                    {sc.tag}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#F8FAFC', marginBottom: '0.35rem' }}>
                  {sc.title}
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {sc.text}
                </p>
              </div>
              <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#38BDF8', fontWeight: '600' }}>
                <span>Use Scenario</span>
                <ArrowRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Panel */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', marginBottom: '0.4rem' }}>
                Report Classification Type
              </label>
              <select
                className="form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="Unsafe Condition">Unsafe Condition</option>
                <option value="Unsafe Act">Unsafe Act</option>
                <option value="Near Miss">Near Miss</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', marginBottom: '0.4rem' }}>
                Operational Facility / Location
              </label>
              <input
                type="text"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Offshore Platform 2, Wellhead #7..."
                required
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8' }}>
                Safety Observation / Incident Narrative
              </label>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                {reportText.length} characters
              </span>
            </div>
            <textarea
              className="form-textarea"
              rows={4}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Describe the unsafe act, unsafe condition, or near-miss observation in detail (include operating pressure, elevation, permits, gas testing, equipment involved)..."
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
              {loading ? (
                <span>Analyzing Pipeline...</span>
              ) : (
                <>
                  <ShieldAlert size={18} />
                  <span>Analyze Safety Report</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading Multi-Step Animation */}
        {loading && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#0B132B', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38BDF8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} /> Executing Safety Intelligence Pipeline:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {[
                'NLP Feature Extraction',
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
                      padding: '0.65rem 0.85rem',
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
          onRetry={() => handleAnalyze({ preventDefault: () => {} })}
        />
      )}

      {/* Comprehensive Analysis Result */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Top Result Banner: Gauge + Core Metrics */}
          <div
            className="glass-card"
            style={{
              padding: '2.5rem 2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '2rem',
              alignItems: 'center',
              background: 'linear-gradient(145deg, #101B3B 0%, #0B132B 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            {/* 1. Risk Score Gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', marginBottom: '0.75rem' }}>
                INDEPENDENT RISK INDEX
              </div>
              <RiskScoreGauge score={result.risk_score} level={result.risk_level} size={190} />
            </div>

            {/* 2. SIF Precursor Card */}
            <div
              style={{
                padding: '1.5rem',
                borderRadius: '12px',
                background: result.sif_precursor ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                border: `1px solid ${result.sif_precursor ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: result.sif_precursor ? '#F87171' : '#34D399' }}>
                  SIF PRECURSOR DETECTED
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', marginTop: '0.35rem' }}>
                  {result.sif_precursor ? 'YES — SIF RISK' : 'NO SIF PRECURSOR'}
                </div>
              </div>
              <div style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: '#CBD5E1' }}>
                SIF Model Confidence: <strong style={{ color: '#F8FAFC' }}>{(result.sif_probability * 100).toFixed(1)}%</strong>
              </div>
            </div>

            {/* 3. Hazard & Severity Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1.2rem', borderRadius: '10px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#38BDF8' }}>
                  HAZARD DOMAIN
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', marginTop: '0.2rem' }}>
                  {result.hazard_category}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Classification probability: {(result.hazard_probability * 100).toFixed(1)}%
                </span>
              </div>

              <div style={{ padding: '1.2rem', borderRadius: '10px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F59E0B' }}>
                  SEVERITY ASSESSMENT
                </span>
                <div style={{ marginTop: '0.35rem' }}>
                  <SeverityBadge severity={result.severity} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Safety Copilot */}
          {result.copilot && <CopilotCard copilot={result.copilot} />}

          {/* Explainable Dangerous Factors */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.5rem' }}>
              Explainable Risk Factors Detected From Report
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1rem' }}>
              Safety triggers extracted dynamically by NLP pattern analysis of the observation narrative:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {result.detected_factors?.length > 0 ? (
                result.detected_factors.map((factor, idx) => (
                  <span key={idx} className="chip">
                    <AlertOctagon size={13} color="#38BDF8" />
                    {factor}
                  </span>
                ))
              ) : (
                <span style={{ color: '#64748B', fontSize: '0.85rem' }}>
                  No high-risk mechanical or procedural keywords triggered.
                </span>
              )}
            </div>
          </div>

          {/* Potential Incident Escalation Path & Potential Consequences */}
          <div className="grid-2">
            {/* Escalation Path */}
            <EscalationPath pathway={result.escalation_path} />

            {/* Potential Consequences */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.5rem' }}>
                Potential Consequences
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
                Hazard-specific primary and cascade incident consequences:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.potential_consequences?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      padding: '0.85rem 1rem',
                      background: '#0B132B',
                      borderRadius: '8px',
                      borderLeft: '3px solid #F97316',
                      fontSize: '0.85rem',
                      color: '#E2E8F0',
                    }}
                  >
                    <Flame size={16} color="#F97316" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Corrective Actions (with checkable states) */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.5rem' }}>
              Recommended Corrective Actions
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
              Specific engineering and administrative controls for {result.hazard_category}:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.85rem' }}>
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

          {/* Similar Historical Reports */}
          {result.similar_reports && result.similar_reports.length > 0 && (
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Similar Historical Reports
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    Identified via TF-IDF cosine text similarity in historical database:
                  </span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {result.similar_reports.map((sim) => (
                  <div
                    key={sim.id}
                    className="glass-card glass-card-interactive"
                    onClick={() => onNavigateToReport(sim.id)}
                    style={{ padding: '1.25rem', background: '#0B132B' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>
                        Report #{sim.id}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8' }}>
                        {sim.similarity_percentage}% Match
                      </span>
                    </div>
                    {/* Visual similarity bar */}
                    <div style={{ width: '100%', height: '4px', background: '#1E293B', borderRadius: '2px', marginBottom: '0.75rem', overflow: 'hidden' }}>
                      <div style={{ width: `${sim.similarity_percentage}%`, height: '100%', background: '#38BDF8' }} />
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#F1F5F9' }}>
                      {sim.hazard}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                      {sim.location}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Human Safety Officer Feedback */}
          {result.id && <FeedbackModal reportId={result.id} />}
        </div>
      )}
    </div>
  );
}
