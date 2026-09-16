import React, { useState } from 'react';
import { Bot, ShieldAlert, Sparkles, CheckCircle2, Send, BookOpen, AlertCircle, Info } from 'lucide-react';
import { api } from '../services/api';

export default function CopilotCard({ copilot }) {
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const isUrgent = copilot?.priority && (
    copilot.priority.includes('STOP-WORK') || copilot.priority.includes('CRITICAL')
  );

  async function handleAsk(queryText) {
    const q = queryText || chatQuery;
    if (!q || !q.trim()) return;
    try {
      setLoading(true);
      const res = await api.askCopilot({ query: q });
      setChatResponse(res);
      setChatQuery('');
    } catch (err) {
      console.error(err);
      setChatResponse({
        answer: "Insufficient evidence in the available data.",
        cited_standards: []
      });
    } finally {
      setLoading(false);
    }
  }

  const quickPrompts = [
    "Why is this dangerous?",
    "Why was this classified as SIF?",
    "What are the main risk factors?",
    "What should the safety officer verify?",
    "Are similar reports present?",
    "What changed recently?",
    "What corrective actions are still open?"
  ];

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.75rem',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        background: 'linear-gradient(145deg, #111E44 0%, #0E1838 100%)',
        boxShadow: '0 12px 30px rgba(2, 132, 199, 0.15)',
        marginBottom: '1.5rem'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.6rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38BDF8',
              display: 'flex',
            }}
          >
            <Bot size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              AI Safety Copilot Assistant
              <Sparkles size={16} color="#38BDF8" />
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Interactive SIF Reasoning, OSHA 1910, API RP 75 & Regulatory Guidance</span>
          </div>
        </div>

        {copilot?.priority && (
          <div
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '800',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.18)' : 'rgba(56, 189, 248, 0.15)',
              color: isUrgent ? '#F87171' : '#38BDF8',
              border: isUrgent ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            {copilot.priority}
          </div>
        )}
      </div>

      {/* Narrative Sections */}
      {copilot && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#38BDF8', marginBottom: '0.35rem' }}>
              Why is this dangerous?
            </div>
            <p style={{ fontSize: '0.875rem', color: '#E2E8F0', lineHeight: 1.6 }}>
              {copilot.why_dangerous}
            </p>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F97316', marginBottom: '0.35rem' }}>
              Potential Consequence
            </div>
            <p style={{ fontSize: '0.875rem', color: '#FDBA74', lineHeight: 1.5, fontWeight: '500' }}>
              {copilot.potential_consequence}
            </p>
          </div>

          {copilot.recommended_immediate_actions && copilot.recommended_immediate_actions.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10B981', marginBottom: '0.5rem' }}>
                Recommended Field Actions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {copilot.recommended_immediate_actions.map((act, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.825rem', color: '#CBD5E1' }}>
                    <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Copilot Query Bar */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#38BDF8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Bot size={16} /> Suggested Safety Inquiries:
        </div>

        {/* Quick prompt chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAsk(p)}
              className="btn btn-secondary"
              style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem' }}
            >
              💬 {p}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <input
            type="text"
            value={chatQuery}
            onChange={(e) => setChatQuery(e.target.value)}
            placeholder="Ask anything about OSHA 1910, API RP 75, or barrier verification..."
            className="form-input"
            style={{ flex: 1, fontSize: '0.85rem' }}
          />
          <button
            type="submit"
            disabled={loading || !chatQuery.trim()}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem' }}
          >
            <Send size={14} /> {loading ? 'Analyzing...' : 'Ask'}
          </button>
        </form>

        {/* Copilot Chat Response */}
        {chatResponse && (
          <div style={{ marginTop: '1rem', background: '#070D1E', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#F1F5F9', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              {chatResponse.answer || "Insufficient evidence in the available data."}
            </div>

            {chatResponse.sif_warning && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', borderLeft: '3px solid #EF4444', padding: '0.6rem 0.8rem', borderRadius: '4px', color: '#FCA5A5', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                {chatResponse.sif_warning}
              </div>
            )}

            {chatResponse.cited_standards?.length > 0 && (
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase' }}>Cited Standards & Regulations:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {chatResponse.cited_standards.map((st, i) => (
                    <span key={i} style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      📋 {st}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
