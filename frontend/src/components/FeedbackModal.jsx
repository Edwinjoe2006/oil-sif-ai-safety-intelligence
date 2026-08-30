import React, { useState } from 'react';
import { Check, X, Send, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { api } from '../services/api';

const HAZARD_OPTIONS = [
  'Pressure',
  'Confined Space',
  'Working at Height',
  'Hot Work',
  'Fire/Explosion',
  'Energy Isolation',
  'Chemical Exposure',
  'Electrical',
  'Heavy Equipment',
  'Lifting',
  'Process Safety',
  'PPE',
  'Housekeeping',
  'Other',
];

const SEVERITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

export default function FeedbackModal({ reportId, onFeedbackSubmitted }) {
  const [status, setStatus] = useState('idle'); // 'idle', 'incorrect_form', 'submitting', 'submitted'
  const [actualHazard, setActualHazard] = useState('Pressure');
  const [actualSeverity, setActualSeverity] = useState('High');
  const [comment, setComment] = useState('');
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCorrect = async () => {
    try {
      setStatus('submitting');
      setErrorMsg('');
      const res = await api.submitFeedback({
        report_id: reportId,
        is_correct: true,
        comment: 'Assessment validated by Safety Officer as accurate.',
      });
      setFeedbackResult(res);
      setStatus('submitted');
      if (onFeedbackSubmitted) onFeedbackSubmitted(res);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit feedback.');
      setStatus('idle');
    }
  };

  const handleIncorrectSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus('submitting');
      setErrorMsg('');
      const res = await api.submitFeedback({
        report_id: reportId,
        is_correct: false,
        actual_hazard: actualHazard,
        actual_severity: actualSeverity,
        comment: comment,
      });
      setFeedbackResult(res);
      setStatus('submitted');
      if (onFeedbackSubmitted) onFeedbackSubmitted(res);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit feedback.');
      setStatus('incorrect_form');
    }
  };

  if (status === 'submitted') {
    return (
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          background: 'rgba(16, 185, 129, 0.08)',
          color: '#34D399',
        }}
      >
        <Check size={20} />
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Feedback Recorded Successfully</div>
          <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            Thank you. Your domain input has been securely stored to refine future SIF NLP iterations.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#F1F5F9' }}>
            Human Safety Officer Feedback
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            Was this AI safety assessment and precursor classification correct?
          </p>
        </div>
      </div>

      {errorMsg && (
        <div style={{ color: '#EF4444', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
          {errorMsg}
        </div>
      )}

      {status === 'idle' && (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCorrect}
            style={{ flex: 1, borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34D399' }}
          >
            <Check size={18} />
            Correct Assessment
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setStatus('incorrect_form')}
            style={{ flex: 1, borderColor: 'rgba(239, 68, 68, 0.4)', color: '#F87171' }}
          >
            <X size={18} />
            Incorrect / Needs Revision
          </button>
        </div>
      )}

      {status === 'incorrect_form' && (
        <form onSubmit={handleIncorrectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', marginBottom: '0.35rem' }}>
                ACTUAL HAZARD DOMAIN
              </label>
              <select
                className="form-select"
                value={actualHazard}
                onChange={(e) => setActualHazard(e.target.value)}
              >
                {HAZARD_OPTIONS.map((h) => (
                  <option key={h} value={h} style={{ background: '#0B132B' }}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', marginBottom: '0.35rem' }}>
                ACTUAL SEVERITY
              </label>
              <select
                className="form-select"
                value={actualSeverity}
                onChange={(e) => setActualSeverity(e.target.value)}
              >
                {SEVERITY_OPTIONS.map((s) => (
                  <option key={s} value={s} style={{ background: '#0B132B' }}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', marginBottom: '0.35rem' }}>
              EXPERT SAFETY COMMENTS / EXPLANATION
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Detail discrepancies (e.g. 'This was high-pressure gas, not low-pressure hydraulic')..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStatus('idle')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Send size={16} />
              Submit Feedback
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
