import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Flame,
  AlertTriangle,
  Clock,
  UserCheck,
  UserPlus,
  Eye,
  RefreshCw,
  MapPin,
  CheckCircle2,
  AlertOctagon,
  Search,
  X,
  Send,
  Zap
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import SeverityBadge from '../components/SeverityBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const ASSIGNMENTS_KEY = 'oil_sif_report_assignments';

function getStoredAssignments() {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredAssignments(data) {
  try {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(data));
  } catch {}
}

const OFFICER_ROLES = [
  'Rig Superintendent (Lead)',
  'Chief Process Safety Engineer',
  'Offshore HSE Inspector',
  'Mechanical Integrity Lead',
  'Electrical Isolation Authority',
  'Emergency Response Specialist',
  'Field Operations Supervisor',
];

export default function RiskPriorityQueue({ onNavigateToReport, onNavigateToAnalyze }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState(getStoredAssignments());
  const [filterTier, setFilterTier] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cards');

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningReport, setAssigningReport] = useState(null);
  const [selectedOfficer, setSelectedOfficer] = useState(OFFICER_ROLES[0]);
  const [targetSla, setTargetSla] = useState('< 2 Hours (Immediate)');
  const [assignNotes, setAssignNotes] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const fetchPriorityReports = async () => {
    try {
      setLoading(true);
      const data = await api.getRiskPriority(50);
      const list = Array.isArray(data) ? data : [];
      const sorted = [...list].sort((a, b) => {
        const scoreA = Number(a.risk_score || 0);
        const scoreB = Number(b.risk_score || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
      setReports(sorted);
    } catch (err) {
      console.error('Error fetching priority queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorityReports();
  }, []);

  const handleOpenAssign = (report, e) => {
    if (e) e.stopPropagation();
    setAssigningReport(report);
    const existing = assignments[report.id];
    if (existing) {
      setSelectedOfficer(existing.officer || OFFICER_ROLES[0]);
      setTargetSla(existing.sla || '< 2 Hours (Immediate)');
      setAssignNotes(existing.notes || '');
    } else {
      setSelectedOfficer(OFFICER_ROLES[0]);
      setTargetSla(
        report.risk_score >= 75
          ? '< 2 Hours (Immediate Stop-Work)'
          : report.risk_score >= 50
          ? '< 12 Hours (Urgent Remediation)'
          : '< 24 Hours (Standard Review)'
      );
      setAssignNotes('');
    }
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignment = (e) => {
    e.preventDefault();
    if (!assigningReport) return;

    const updated = {
      ...assignments,
      [assigningReport.id]: {
        officer: selectedOfficer,
        sla: targetSla,
        notes: assignNotes,
        assignedAt: new Date().toISOString(),
      },
    };

    setAssignments(updated);
    saveStoredAssignments(updated);
    setIsAssignModalOpen(false);

    setSuccessToast(`Report #${assigningReport.id} assigned to ${selectedOfficer}`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const getTimeToAct = (score, isSif) => {
    if (score >= 75 || isSif) {
      return {
        label: '< 2 Hours (Immediate Stop-Work)',
        badgeColor: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.15)',
        border: 'rgba(239, 68, 68, 0.4)',
        urgency: 'CRITICAL SLA',
      };
    }
    if (score >= 50) {
      return {
        label: '< 12 Hours (Urgent Review)',
        badgeColor: '#F97316',
        bg: 'rgba(249, 115, 22, 0.15)',
        border: 'rgba(249, 115, 22, 0.35)',
        urgency: 'HIGH SLA',
      };
    }
    if (score >= 25) {
      return {
        label: '< 24 Hours (Standard Action)',
        badgeColor: '#F59E0B',
        bg: 'rgba(245, 158, 11, 0.15)',
        border: 'rgba(245, 158, 11, 0.3)',
        urgency: 'MEDIUM SLA',
      };
    }
    return {
      label: '< 48 Hours (Routine Follow-up)',
      badgeColor: '#10B981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.3)',
      urgency: 'ROUTINE',
    };
  };

  const totalCount = reports.length;
  const criticalCount = reports.filter((r) => (r.risk_score || 0) >= 75 || r.risk_level === 'CRITICAL').length;
  const highCount = reports.filter((r) => (r.risk_score || 0) >= 50 && (r.risk_score || 0) < 75).length;
  const sifCount = reports.filter((r) => r.sif_prediction).length;
  const assignedCount = reports.filter((r) => assignments[r.id]).length;

  const filteredReports = reports.filter((r) => {
    const score = Number(r.risk_score || 0);
    if (filterTier === 'critical' && score < 75 && r.risk_level !== 'CRITICAL') return false;
    if (filterTier === 'high' && (score < 50 || score >= 75)) return false;
    if (filterTier === 'sif_only' && !r.sif_prediction) return false;
    if (filterTier === 'unassigned' && assignments[r.id]) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (r.report_text || '').toLowerCase().includes(q);
      const matchHaz = (r.hazard_category || '').toLowerCase().includes(q);
      const matchLoc = (r.location || '').toLowerCase().includes(q);
      const matchAction = Array.isArray(r.recommended_action)
        ? r.recommended_action.join(' ').toLowerCase().includes(q)
        : '';
      return matchText || matchHaz || matchLoc || matchAction;
    }

    return true;
  });

  const topCriticalItem = reports.length > 0 && (reports[0].risk_score >= 75 || reports[0].sif_prediction) ? reports[0] : null;

  return (
    <div className="page-wrapper">
      {/* Toast Notification */}
      {successToast && (
        <div
          style={{
            position: 'fixed',
            top: '85px',
            right: '25px',
            zIndex: 1000,
            background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
            color: '#FFFFFF',
            padding: '0.85rem 1.4rem',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
            border: '1px solid #10B981',
            fontSize: '0.85rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#EF4444', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            <Zap size={14} /> Priority Risk Triage & Dispatch
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Safety Risk Priority Queue
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem', maxWidth: '720px' }}>
            Dynamic operational triage automatically ordered from highest risk to lowest. Review critical precursors, inspect AI corrective actions, and assign field leads.
          </p>
        </div>

        {/* Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: '#0B132B', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              style={{
                background: viewMode === 'cards' ? '#0284C7' : 'transparent',
                color: viewMode === 'cards' ? '#FFFFFF' : '#94A3B8',
                border: 'none',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Priority Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('dense')}
              style={{
                background: viewMode === 'dense' ? '#0284C7' : 'transparent',
                color: viewMode === 'dense' ? '#FFFFFF' : '#94A3B8',
                border: 'none',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Command Table
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchPriorityReports}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Priority Summary KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div
          className="glass-card"
          style={{
            padding: '1.4rem',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, rgba(11, 19, 43, 0.95) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CRITICAL THREATS
            </span>
            <AlertOctagon size={20} color="#EF4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#FFFFFF' }}>
            {criticalCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#FCA5A5' }}>
            Requires immediate Stop-Work (&lt; 2h SLA)
          </span>
        </div>

        <div
          className="glass-card"
          style={{
            padding: '1.4rem',
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.14) 0%, rgba(11, 19, 43, 0.95) 100%)',
            border: '1px solid rgba(249, 115, 22, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#FB923C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              HIGH PRIORITY RISKS
            </span>
            <Flame size={20} color="#F97316" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#FFFFFF' }}>
            {highCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#FDBA74' }}>
            Score 50–74 (&lt; 12h urgent review)
          </span>
        </div>

        <div
          className="glass-card"
          style={{
            padding: '1.4rem',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(11, 19, 43, 0.95) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SIF PRECURSORS
            </span>
            <ShieldAlert size={20} color="#38BDF8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#FFFFFF' }}>
            {sifCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#93C5FD' }}>
            High-energy fatal precursors flagged
          </span>
        </div>

        <div
          className="glass-card"
          style={{
            padding: '1.4rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(11, 19, 43, 0.95) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              FIELD DISPATCHED
            </span>
            <UserCheck size={20} color="#10B981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#FFFFFF' }}>
            {assignedCount} / {totalCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#A7F3D0' }}>
            Reports assigned to safety officers
          </span>
        </div>
      </div>

      {/* Top #1 Spotlight Banner if Critical Item Exists */}
      {topCriticalItem && (
        <div
          className="glass-card"
          style={{
            marginBottom: '2rem',
            padding: '1.75rem 2rem',
            background: 'linear-gradient(140deg, #1C1124 0%, #0F172A 100%)',
            border: '2px solid rgba(239, 68, 68, 0.5)',
            boxShadow: '0 12px 35px rgba(239, 68, 68, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ padding: '0.25rem 0.65rem', borderRadius: '6px', background: '#EF4444', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.06em' }}>
                  RANK #01 TOP THREAT
                </span>
                <span style={{ padding: '0.25rem 0.65rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', color: '#F87171', fontSize: '0.72rem', fontWeight: '800' }}>
                  ⚡ SIF PRECURSOR DETECTED
                </span>
                <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={13} /> SLA: &lt; 2 Hours
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.5rem' }}>
                {topCriticalItem.hazard_category} Hazard at {topCriticalItem.location}
              </h3>

              <p style={{ fontSize: '0.875rem', color: '#CBD5E1', lineHeight: 1.5, marginBottom: '1rem' }}>
                "{topCriticalItem.report_text}"
              </p>

              {topCriticalItem.recommended_action && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #EF4444', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#F87171', textTransform: 'uppercase', display: 'block' }}>
                    PRIORITY ACTION DIRECTIVE:
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#F1F5F9', fontWeight: '600' }}>
                    {Array.isArray(topCriticalItem.recommended_action) ? topCriticalItem.recommended_action[0] : topCriticalItem.recommended_action}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {assignments[topCriticalItem.id] ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.35rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', color: '#34D399', fontWeight: '700' }}>
                    <UserCheck size={14} /> Assigned: {assignments[topCriticalItem.id].officer}
                  </div>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.35rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', color: '#F87171', fontWeight: '700' }}>
                    <AlertTriangle size={14} /> Unassigned — Field Lead Required
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.25rem' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Calculated Risk Index
                </span>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#EF4444', lineHeight: 1 }}>
                  {topCriticalItem.risk_score}
                  <span style={{ fontSize: '1rem', color: '#64748B' }}>/100</span>
                </div>
                <div style={{ marginTop: '0.25rem' }}>
                  <RiskBadge level={topCriticalItem.risk_level} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => handleOpenAssign(topCriticalItem, e)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.55rem 1rem' }}
                >
                  <UserPlus size={14} />
                  {assignments[topCriticalItem.id] ? 'Reassign Lead' : 'Assign Officer'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onNavigateToReport(topCriticalItem.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.55rem 1.25rem', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}
                >
                  <Eye size={14} />
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Ranked (${totalCount})` },
            { id: 'critical', label: `🔴 Critical (${criticalCount})` },
            { id: 'high', label: `🟠 High Risk (${highCount})` },
            { id: 'sif_only', label: `⚡ SIF Precursors (${sifCount})` },
            { id: 'unassigned', label: `⚠️ Unassigned (${totalCount - assignedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTier(tab.id)}
              style={{
                background: filterTier === tab.id ? '#0284C7' : 'rgba(255,255,255,0.05)',
                color: filterTier === tab.id ? '#FFFFFF' : '#94A3B8',
                border: filterTier === tab.id ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={15} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search hazard, location, action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.2rem', paddingRight: '1rem', height: '38px', fontSize: '0.8rem', background: '#0B132B' }}
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && <LoadingSkeleton count={4} height="130px" />}

      {/* Empty State */}
      {!loading && filteredReports.length === 0 && (
        <EmptyState
          title="No Priority Reports Matching Filter"
          description="There are currently no safety reports matching the selected priority filter criteria."
          actionText="Analyze New Report"
          onAction={onNavigateToAnalyze}
        />
      )}

      {/* View 1: Priority Command Cards Grid */}
      {!loading && viewMode === 'cards' && filteredReports.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredReports.map((report, index) => {
            const rank = index + 1;
            const score = Number(report.risk_score || 0);
            const isCritical = score >= 75 || report.risk_level === 'CRITICAL';
            const isHigh = score >= 50 && score < 75;
            const sla = getTimeToAct(score, report.sif_prediction);
            const assigned = assignments[report.id];

            const primaryAction = Array.isArray(report.recommended_action) && report.recommended_action.length > 0
              ? report.recommended_action[0]
              : (typeof report.recommended_action === 'string' ? report.recommended_action : 'Implement standard hazard barriers.');

            return (
              <div
                key={report.id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  border: isCritical
                    ? '1px solid rgba(239, 68, 68, 0.4)'
                    : isHigh
                    ? '1px solid rgba(249, 115, 22, 0.35)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isCritical
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, rgba(11, 19, 43, 0.95) 100%)'
                    : '#0B132B',
                  boxShadow: isCritical ? '0 8px 25px rgba(239, 68, 68, 0.1)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '900',
                          letterSpacing: '0.04em',
                          background: rank === 1 ? '#EF4444' : rank <= 3 ? '#F97316' : '#1E293B',
                          color: '#FFFFFF',
                        }}
                      >
                        RANK #{String(rank).padStart(2, '0')}
                      </span>

                      {report.sif_prediction ? (
                        <span
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#F87171',
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <Zap size={11} /> SIF PRECURSOR
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#34D399',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                          }}
                        >
                          NON-SIF
                        </span>
                      )}

                      <SeverityBadge severity={report.severity} />

                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          background: sla.bg,
                          border: `1px solid ${sla.border}`,
                          color: sla.badgeColor,
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <Clock size={11} /> Time to Act: {sla.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF' }}>
                        {report.hazard_category}
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={13} color="#38BDF8" /> {report.location}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        ID #{report.id} • {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                      "{report.report_text}"
                    </p>

                    <div
                      style={{
                        background: 'rgba(56, 189, 248, 0.06)',
                        borderLeft: '3px solid #38BDF8',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', display: 'block', letterSpacing: '0.04em' }}>
                        RECOMMENDED ACTION:
                      </span>
                      <span style={{ fontSize: '0.825rem', color: '#F1F5F9', fontWeight: '500' }}>
                        {primaryAction}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.78rem' }}>
                      {assigned ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#34D399', fontWeight: '700' }}>
                          <UserCheck size={14} />
                          <span>Assigned to: <strong>{assigned.officer}</strong></span>
                          <span style={{ color: '#64748B', fontSize: '0.72rem' }}>({assigned.sla})</span>
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: isCritical ? '#F87171' : '#F59E0B', fontWeight: '700' }}>
                          <AlertTriangle size={14} />
                          <span>Pending Assignment</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      minWidth: '180px',
                    }}
                  >
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        RISK INDEX
                      </span>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '0.2rem' }}>
                        <span
                          style={{
                            fontSize: '2.2rem',
                            fontWeight: '900',
                            lineHeight: 1,
                            color: score >= 75 ? '#EF4444' : score >= 50 ? '#F97316' : score >= 25 ? '#F59E0B' : '#10B981',
                          }}
                        >
                          {score}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '700' }}>/100</span>
                      </div>
                      <div style={{ marginTop: '0.25rem' }}>
                        <RiskBadge level={report.risk_level} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={(e) => handleOpenAssign(report, e)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.75rem',
                          padding: '0.45rem 0.75rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <UserPlus size={13} />
                        {assigned ? 'Reassign' : 'Assign'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => onNavigateToReport(report.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.75rem',
                          padding: '0.45rem 0.85rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Eye size={13} />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Dense Command Table */}
      {!loading && viewMode === 'dense' && filteredReports.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table className="industrial-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Score</th>
                <th>SIF Status</th>
                <th>Severity</th>
                <th>Hazard Domain</th>
                <th>Location</th>
                <th>Time to Act (SLA)</th>
                <th>Recommended Action</th>
                <th>Assigned Officer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report, idx) => {
                const rank = idx + 1;
                const score = Number(report.risk_score || 0);
                const sla = getTimeToAct(score, report.sif_prediction);
                const assigned = assignments[report.id];
                const primaryAction = Array.isArray(report.recommended_action) && report.recommended_action.length > 0
                  ? report.recommended_action[0]
                  : (typeof report.recommended_action === 'string' ? report.recommended_action : 'Standard mitigation');

                return (
                  <tr key={report.id}>
                    <td>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '900',
                          background: rank === 1 ? '#EF4444' : rank <= 3 ? '#F97316' : '#1E293B',
                          color: '#FFFFFF',
                        }}
                      >
                        #{String(rank).padStart(2, '0')}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1.1rem', color: score >= 75 ? '#EF4444' : score >= 50 ? '#F97316' : '#F59E0B' }}>
                        {score}
                      </strong>
                    </td>
                    <td>
                      {report.sif_prediction ? (
                        <span style={{ color: '#F87171', fontWeight: '800', fontSize: '0.75rem' }}>
                          ⚡ SIF Risk
                        </span>
                      ) : (
                        <span style={{ color: '#34D399', fontWeight: '600', fontSize: '0.75rem' }}>
                          ● Non-SIF
                        </span>
                      )}
                    </td>
                    <td>
                      <SeverityBadge severity={report.severity} />
                    </td>
                    <td>
                      <strong style={{ color: '#F1F5F9', fontSize: '0.825rem' }}>{report.hazard_category}</strong>
                    </td>
                    <td>
                      <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{report.location}</span>
                    </td>
                    <td>
                      <span style={{ color: sla.badgeColor, fontWeight: '700', fontSize: '0.75rem' }}>
                        {sla.label}
                      </span>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#CBD5E1', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {primaryAction}
                      </span>
                    </td>
                    <td>
                      {assigned ? (
                        <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: '700' }}>
                          👤 {assigned.officer}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: '700' }}>
                          ⚠️ Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={(e) => handleOpenAssign(report, e)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                        >
                          Assign
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => onNavigateToReport(report.id)}
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Assignment Modal */}
      {isAssignModalOpen && assigningReport && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(3, 7, 18, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
          onClick={() => setIsAssignModalOpen(false)}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              background: '#0B132B',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <UserPlus size={18} color="#38BDF8" /> Assign Field Safety Lead
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Dispatch remediation for Report #{assigningReport.id} ({assigningReport.hazard_category})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#94A3B8' }}>
                  Assignee Role / Officer
                </label>
                <select
                  className="form-select"
                  value={selectedOfficer}
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                  style={{ width: '100%', height: '42px', background: '#070D1E', color: '#F1F5F9' }}
                >
                  {OFFICER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#94A3B8' }}>
                  Target Resolution Window (SLA)
                </label>
                <select
                  className="form-select"
                  value={targetSla}
                  onChange={(e) => setTargetSla(e.target.value)}
                  style={{ width: '100%', height: '42px', background: '#070D1E', color: '#F1F5F9' }}
                >
                  <option value="< 2 Hours (Immediate Stop-Work)">&lt; 2 Hours (Immediate Stop-Work)</option>
                  <option value="< 12 Hours (Urgent Remediation)">&lt; 12 Hours (Urgent Remediation)</option>
                  <option value="< 24 Hours (Standard Review)">&lt; 24 Hours (Standard Review)</option>
                  <option value="< 48 Hours (Routine Follow-up)">&lt; 48 Hours (Routine Follow-up)</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#94A3B8' }}>
                  Operational Instructions / Dispatch Notes
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Isolate valve, verify PTW, inspect harness latch before resuming operation..."
                  style={{ width: '100%', background: '#070D1E', color: '#F1F5F9' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAssignModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Send size={14} /> Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
