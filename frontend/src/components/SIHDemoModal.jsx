import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const SIH_DEMO_STEPS = [
  {
    step: 1,
    title: '1. Safety Observation Reporting',
    targetPage: 'analyze',
    summary: 'A safety officer or worker enters an unsafe condition, near-miss, or attaches an inspection photo.',
    talkingPoints: [
      'Real-world offshore incidents begin with weak signals and unaddressed field observations.',
      'Input safety reports or use pre-loaded offshore scenarios with asset association.',
      'Supports multi-modal image inspection (PPE, flange leaks, corrosion wall thinning).'
    ]
  },
  {
    step: 2,
    title: '2. Multi-Task AI Detection',
    targetPage: 'analyze',
    summary: 'NLP and Vision classifiers simultaneously identify SIF Precursor presence, Hazard domain, and Severity tier.',
    talkingPoints: [
      'Pretrained and fine-tuned on oil & gas incident taxonomies (OSHA 1910, API RP 75).',
      'Calculates SIF precursor probability with explicit plain-language definitions.',
      'Identifies primary hazard category (Pressure, Flammable Gas, Working at Heights, etc.).'
    ]
  },
  {
    step: 3,
    title: '3. Dynamic Risk Scoring (0–100)',
    targetPage: 'priority',
    summary: 'The Risk Engine synthesizes severity, SIF likelihood, and hazard level into an actionable numerical index.',
    talkingPoints: [
      'Tiered categorization: Low (0-24), Medium (25-49), High (50-74), Critical (75-100).',
      'Automatically ranks reports in descending risk order for immediate field triage.',
      'Provides clear \'Why this score?\' breakdown for safety professionals.'
    ]
  },
  {
    step: 4,
    title: '4. Explainable AI & Factor Attribution',
    targetPage: 'causal',
    summary: 'Explains precisely which words, operating conditions, and safety factors triggered the risk score.',
    talkingPoints: [
      'SHAP token attributions highlight high-risk phrases (e.g., \'high pressure\', \'loss of containment\').',
      'Ensures zero black-box mystery for evaluators and safety engineers.',
      'Identifies specific failed preventive barriers.'
    ]
  },
  {
    step: 5,
    title: '5. SIF Early Warning & Risk Velocity',
    targetPage: 'emerging',
    summary: 'Detects precursor acceleration before major loss-of-containment events occur.',
    talkingPoints: [
      'Tracks precursor velocity and composite system threat levels (NORMAL, WATCH, ELEVATED, CRITICAL).',
      'Detects spatial-temporal clusters across platforms and rigs.',
      'Answers: What changed, why it changed, and what equipment needs urgent inspection.'
    ]
  },
  {
    step: 6,
    title: '6. Asset-Level Risk Intelligence',
    targetPage: 'assets',
    summary: 'Maps cumulative safety observations to critical physical equipment assets.',
    talkingPoints: [
      'Tracks specific assets (e.g., Flare Header 04, Mud Pump #2, Wellhead B-12).',
      'Model-based risk profile synthesis and Non-Destructive Testing (NDT) recommendations.',
      'Provides operational uptime readiness index.'
    ]
  },
  {
    step: 7,
    title: '7. Causal Bow-Tie Barrier Analysis',
    targetPage: 'causal',
    summary: 'Visualizes the complete escalation pathway: Threats -> Prevention -> Top Event -> Mitigation -> Consequences.',
    talkingPoints: [
      'Enables 5-second structural understanding of critical barrier integrity.',
      'Clear distinction: Prevention (\'What can stop escalation?\') vs Mitigation (\'What can reduce consequences?\').',
      'Maps to API RP 75 and IOGP life-saving barrier rules.'
    ]
  },
  {
    step: 8,
    title: '8. What-If Operational Risk Simulation',
    targetPage: 'simulator',
    summary: 'Safety engineers can adjust operational parameters (Pressure, Wind, Fatigue, Bypass) to simulate risk delta.',
    talkingPoints: [
      'Interactive sliders with real-time recalculation of risk scores.',
      'Demonstrates sensitivity of safety systems to compound human/environmental factors.',
      'Clearly designated as model-based simulation for planning and training.'
    ]
  },
  {
    step: 9,
    title: '9. Safety Alert Center & CAPA Resolution',
    targetPage: 'actions',
    summary: 'Auto-dispatches alerts and manages Corrective and Preventive Actions across a 5-stage lifecycle.',
    talkingPoints: [
      'Real-time notifications for High/Critical SIF precursors.',
      '5-stage CAPA board: Open -> Assigned -> In Progress -> Verification -> Closed.',
      'Strictly distinguishes AI recommendations from recorded completed human actions.'
    ]
  },
  {
    step: 10,
    title: '10. Human-in-the-Loop Validation & Audit Trace',
    targetPage: 'quality',
    summary: 'Safety officers review and validate AI decisions, creating immutable audit logs for governance.',
    talkingPoints: [
      '\'AI assists the safety officer; final operational decisions remain with authorized personnel.\'',
      'Logs officer overrides, tracks precision/recall drift, and computes agreement rate.',
      'Comprehensive AI Decision Trace ensures complete transparency and regulatory compliance.'
    ]
  }
];

export default function SIHDemoModal({ isOpen, onClose, onNavigate }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  const currentStep = SIH_DEMO_STEPS[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < SIH_DEMO_STEPS.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  const handleJumpToScreen = () => {
    if (onNavigate && currentStep.targetPage) {
      onNavigate(currentStep.targetPage);
      onClose();
    }
  };

  return (
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
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#0B132B',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          padding: '2rem',
          borderRadius: '16px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284C7, #2563EB)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF' }}>
                SIH Demonstration Walkthrough
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: '700' }}>
                10-Step Safety Intelligence Flow
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem' }}>
          {SIH_DEMO_STEPS.map((s, idx) => (
            <div
              key={s.step}
              onClick={() => setCurrentStepIdx(idx)}
              style={{
                flex: 1,
                height: '6px',
                borderRadius: '3px',
                backgroundColor: idx === currentStepIdx ? '#38BDF8' : idx < currentStepIdx ? '#10B981' : 'rgba(255,255,255,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title={`Step ${s.step}: ${s.title}`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div style={{ minHeight: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              STEP {currentStep.step} OF 10
            </span>
            <button
              type="button"
              onClick={handleJumpToScreen}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#38BDF8',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '6px',
                padding: '0.3rem 0.65rem',
                cursor: 'pointer'
              }}
            >
              Jump to Screen <ExternalLink size={13} />
            </button>
          </div>

          <h4 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.6rem' }}>
            {currentStep.title}
          </h4>

          <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: '1.5', marginBottom: '1.25rem' }}>
            {currentStep.summary}
          </p>

          <div
            style={{
              background: '#070D1E',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1rem'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Key Talking Points for Evaluators:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {currentStep.talkingPoints.map((pt, pIdx) => (
                <li key={pIdx} style={{ fontSize: '0.825rem', color: '#E2E8F0', lineHeight: '1.4' }}>
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            style={{ opacity: currentStepIdx === 0 ? 0.4 : 1, cursor: currentStepIdx === 0 ? 'not-allowed' : 'pointer' }}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>
            {currentStepIdx + 1} / {SIH_DEMO_STEPS.length}
          </div>

          {currentStepIdx < SIH_DEMO_STEPS.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
            >
              Next Step <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleJumpToScreen}
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
            >
              Open Live System <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
