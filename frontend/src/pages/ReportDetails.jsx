import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  AlertOctagon,
  Flame,
  CheckCircle2,
  Check,
  ShieldAlert,
  Printer
} from 'lucide-react';
import { api } from '../services/api';
import RiskScoreGauge from '../components/RiskScoreGauge';
import RiskBadge from '../components/RiskBadge';
import SeverityBadge from '../components/SeverityBadge';
import EscalationPath from '../components/EscalationPath';
import FeedbackModal from '../components/FeedbackModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function ReportDetails({ reportId, onBack }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await api.getReportById(reportId);
      setReport(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportId) fetchReport();
  }, [reportId]);

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusUpdating(true);
      const updated = await api.updateReportStatus(reportId, newStatus);
      setReport(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <button type="button" className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Reports
        </button>
        <LoadingSkeleton count={3} height="150px" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="page-wrapper">
        <button type="button" className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Reports
        </button>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          Report #{reportId} not found.
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Top Back & Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Reports
        </button>

        {/* Status Dropdown & Print */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.print()}
            title="Print Official Safety Incident Briefing Dossier"
          >
            <Printer size={16} />
            Print Brief
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Status:</span>
            <select
              className="form-select"
              style={{ width: '150px', padding: '0.45rem 0.75rem' }}
              value={report.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={statusUpdating}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hero Overview */}
      <div
        className="glass-card"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <RiskScoreGauge score={report.risk_score} level={report.risk_level} size={180} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>
              INCIDENT INVESTIGATION FILE #{report.id}
            </span>
            <RiskBadge level={report.risk_level} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            {report.hazard_category} Event
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Tag size={15} color="#38BDF8" />
              <span>{report.report_type}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={15} color="#38BDF8" />
              <span>{report.location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={15} color="#38BDF8" />
              <span>{new Date(report.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ background: '#0B132B', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>SIF Precursor</span>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: report.sif_prediction ? '#EF4444' : '#10B981', marginTop: '2px' }}>
                {report.sif_prediction ? 'Yes' : 'No'} ({(report.sif_probability * 100).toFixed(0)}%)
              </div>
            </div>

            <div style={{ background: '#0B132B', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Severity Tier</span>
              <div style={{ marginTop: '4px' }}>
                <SeverityBadge severity={report.severity} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Observation Narrative */}
      <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.75rem' }}>
          Original Observation Narrative
        </h3>
        <div
          style={{
            background: '#0B132B',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            padding: '1.25rem',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            color: '#E2E8F0',
          }}
        >
          {report.report_text}
        </div>
      </div>

      {/* Detected Factors */}
      <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '0.5rem' }}>
          Detected Dangerous Factors
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {report.detected_factors?.map((f, i) => (
            <span key={i} className="chip">
              <AlertOctagon size={14} color="#38BDF8" />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Escalation Path & Potential Consequences */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <EscalationPath pathway={report.escalation_path} />

        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '1rem' }}>
            Potential Consequences
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {report.potential_consequences?.map((item, idx) => (
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

      {/* Recommended Corrective Actions */}
      <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#F8FAFC', marginBottom: '1rem' }}>
          Recommended Corrective Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.85rem' }}>
          {report.recommended_action?.map((act, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '1rem',
                borderRadius: '10px',
                background: '#0B132B',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ color: '#38BDF8', marginTop: '2px' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>
                  ACTION {String(idx + 1).padStart(2, '0')}
                </span>
                <p style={{ fontSize: '0.85rem', color: '#F1F5F9', marginTop: '0.2rem' }}>
                  {act}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Section */}
      <FeedbackModal reportId={report.id} />
    </div>
  );
}
