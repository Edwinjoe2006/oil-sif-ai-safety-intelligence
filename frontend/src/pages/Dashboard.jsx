import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckSquare,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Eye,
  Sparkles,
  Info
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';

import { api } from '../services/api';
import KpiCard from '../components/KpiCard';
import RiskBadge from '../components/RiskBadge';
import AlertCard from '../components/AlertCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import WorkflowBar from '../components/WorkflowBar';
import InfoTooltip from '../components/InfoTooltip';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard({ onNavigateToAnalyze, onNavigateToReport, onOpenDemo, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [highRiskAlerts, setHighRiskAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendInterval, setTrendInterval] = useState('daily');
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, trendsData, priorityData, highRiskData] = await Promise.all([
        api.getStatistics(),
        api.getTrends(trendInterval),
        api.getRiskPriority(8),
        api.getHighRiskReports(3),
      ]);
      setStats(statsData);
      setTrends(trendsData);
      setPriorityQueue(priorityData);
      setHighRiskAlerts(highRiskData);
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [trendInterval]);

  if (loading && !stats) {
    return (
      <div className="page-wrapper">
        <LoadingSkeleton count={4} height="120px" />
      </div>
    );
  }

  const hasReports = stats && stats.total_reports > 0;

  // Chart 1: Risk Distribution (Doughnut)
  const riskDistData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
    datasets: [
      {
        data: stats
          ? [
              stats.risk_distribution?.LOW || 0,
              stats.risk_distribution?.MEDIUM || 0,
              stats.risk_distribution?.HIGH || 0,
              stats.risk_distribution?.CRITICAL || 0,
            ]
          : [0, 0, 0, 0],
        backgroundColor: ['#10B981', '#F59E0B', '#F97316', '#EF4444'],
        borderColor: '#0B132B',
        borderWidth: 3,
      },
    ],
  };

  // Chart 2: Safety Risk Trend (Line)
  const trendLabels = trends?.risk_trend?.map((t) => t.date) || [];
  const trendScores = trends?.risk_trend?.map((t) => t.average_risk_score) || [];
  const trendData = {
    labels: trendLabels.length > 0 ? trendLabels : ['Baseline Day 1', 'Day 2', 'Day 3'],
    datasets: [
      {
        label: 'Average Risk Score (0–100)',
        data: trendScores.length > 0 ? trendScores : [0, 0, 0],
        borderColor: '#38BDF8',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#38BDF8',
        pointBorderColor: '#FFFFFF',
      },
    ],
  };

  // Chart 3: Location Hotspots (Bar)
  const locationLabels = trends?.location_hotspots?.map((l) => l.location) || [];
  const locationHighRisk = trends?.location_hotspots?.map((l) => l.high_risk_count) || [];
  const locationTotal = trends?.location_hotspots?.map((l) => l.total_count) || [];

  const locationData = {
    labels: locationLabels.slice(0, 6),
    datasets: [
      {
        label: 'High/Critical Precursors',
        data: locationHighRisk.slice(0, 6),
        backgroundColor: '#EF4444',
        borderRadius: 6,
      },
      {
        label: 'Total Observations',
        data: locationTotal.slice(0, 6),
        backgroundColor: '#1E293B',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="page-wrapper">
      {/* 8-Step Project Story Workflow Bar */}
      <WorkflowBar activeStep="report" onStepClick={(target) => onNavigate && onNavigate(target)} />

      {/* Dashboard Hero Header */}
      <div
        className="glass-card"
        style={{
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(14, 24, 56, 0.9) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <Activity size={14} /> Live Safety Intelligence Overview
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Oil & Gas Safety Early Warning System
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginTop: '0.35rem', maxWidth: '640px', lineHeight: 1.5 }}>
            AI-powered precursor detection platform identifying potential Serious Injury & Fatality (SIF) hazards from stored field reports and sensor logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {onOpenDemo && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenDemo}
              style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38BDF8' }}
            >
              <Sparkles size={16} />
              SIH Demo Tour
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchDashboardData}
            title="Refresh live metrics from database"
          >
            <RefreshCw size={16} />
            Sync Data
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNavigateToAnalyze}
          >
            <ShieldAlert size={18} />
            Analyze Safety Report
          </button>
        </div>
      </div>

      {/* Top 6 KPI Cards - Structured: VALUE -> STATUS -> SHORT MEANING */}
      <div className="grid-6" style={{ marginBottom: '2rem' }}>
        <KpiCard
          title="Total Reports"
          value={stats?.total_reports}
          status={stats?.total_reports ? "STORED IN DB" : "NO REPORTS"}
          meaning="Total safety observations and near-misses recorded."
          icon={Activity}
          color="#38BDF8"
          tooltipText="Total count of verified safety observations loaded in the database."
        />
        <KpiCard
          title="SIF Precursors"
          value={stats?.sif_precursors_count}
          status={stats?.sif_precursors_count > 0 ? "ATTENTION REQUIRED" : "ZERO DETECTED"}
          meaning="Reports containing patterns associated with potential SIF events."
          trend={stats?.total_reports ? `${Math.round((stats.sif_precursors_count / stats.total_reports) * 100)}% Rate` : undefined}
          icon={ShieldAlert}
          color="#EF4444"
          tooltipTerm="sif"
        />
        <KpiCard
          title="High/Critical Reports"
          value={stats?.high_critical_count}
          status={stats?.high_critical_count > 0 ? "REQUIRING ATTENTION" : "NORMAL"}
          meaning="Reports with high model-based risk scores (>= 50)."
          icon={Flame}
          color="#F97316"
          tooltipText="Safety incidents flagged for priority investigation and control validation."
        />
        <KpiCard
          title="Average Risk Score"
          value={stats?.average_risk_score !== undefined && stats?.average_risk_score !== null ? `${stats.average_risk_score} / 100` : null}
          status={
            stats?.average_risk_score >= 75 ? "CRITICAL FLEET RISK" :
            stats?.average_risk_score >= 50 ? "ELEVATED FLEET RISK" :
            stats?.average_risk_score >= 25 ? "MODERATE" : "OPTIMAL"
          }
          meaning="Fleet-wide 0–100 index prioritizing inspection urgency."
          icon={AlertTriangle}
          color="#F59E0B"
          tooltipTerm="risk_score"
        />
        <KpiCard
          title="Open Actions"
          value={stats?.open_corrective_actions}
          status={stats?.open_corrective_actions > 0 ? "PENDING ACTION" : "ALL RESOLVED"}
          meaning="Field corrective actions currently pending human completion."
          icon={CheckSquare}
          color="#818CF8"
          tooltipTerm="capa"
        />
        <KpiCard
          title="Emerging Risks"
          value={stats?.emerging_risks_count}
          status={stats?.emerging_risks_count > 0 ? "ELEVATED" : "NORMAL"}
          meaning="Patterns showing increasing precursor activity over time."
          icon={TrendingUp}
          color="#34D399"
          tooltipTerm="emerging_risk"
        />
      </div>

      {/* If No Reports Yet in DB */}
      {!hasReports && (
        <div style={{ marginBottom: '2.5rem' }}>
          <EmptyState
            title="Safety Database Awaiting Stored Observations"
            description="All ML models and database tables are loaded and operational. Submit your first safety observation in Analyze Report to populate live telemetry."
            actionText="Analyze Safety Report"
            onAction={onNavigateToAnalyze}
          />
        </div>
      )}

      {/* Main Visual Sections */}
      {hasReports && (
        <>
          {/* Row: Risk Distribution & Risk Trends */}
          <div className="grid-2" style={{ marginBottom: '2rem' }}>
            {/* Risk Distribution Chart */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Safety Risk Overview
                    <InfoTooltip text="Distribution of stored reports across 4 risk tiers: Low (0-24), Medium (25-49), High (50-74), and Critical (75-100)." />
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Distribution across 4 severity tiers (from stored database records)
                  </span>
                </div>
              </div>
              <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Doughnut
                  data={riskDistData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { color: '#94A3B8', font: { size: 11 } } },
                    },
                    cutout: '72%',
                  }}
                />
              </div>
            </div>

            {/* Risk Trend Chart */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Safety Risk Trend
                    <InfoTooltip text="Historical average risk score progression computed directly from recorded timestamps." />
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Average model-based risk index over time
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', background: '#0B132B', padding: '3px', borderRadius: '8px' }}>
                  {['daily', 'weekly', 'monthly'].map((intv) => (
                    <button
                      key={intv}
                      type="button"
                      onClick={() => setTrendInterval(intv)}
                      style={{
                        background: trendInterval === intv ? '#0284C7' : 'transparent',
                        color: trendInterval === intv ? '#FFFFFF' : '#64748B',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.3rem 0.65rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                      }}
                    >
                      {intv}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ height: '240px' }}>
                <Line
                  data={trendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748B' } },
                      x: { grid: { display: false }, ticks: { color: '#64748B' } },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Row: Live Risk Priority Queue & Emerging Risks */}
          <div className="grid-2" style={{ marginBottom: '2rem' }}>
            {/* Live Risk Priority Queue */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Safety Risk Priority Queue
                    <InfoTooltip text="Live ranking of unresolved reports sorted by risk score descending for immediate safety officer triage." />
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Dynamic ranking by risk score descending (stored records)
                  </span>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="industrial-table">
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>Score</th>
                      <th>Hazard</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priorityQueue.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <RiskBadge level={item.risk_level} />
                        </td>
                        <td>
                          <strong style={{ color: '#F8FAFC' }}>{item.risk_score}</strong>
                        </td>
                        <td>
                          <span style={{ color: '#CBD5E1', fontWeight: '500' }}>{item.hazard_category}</span>
                        </td>
                        <td>
                          <span style={{ color: '#94A3B8' }}>{item.location}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.75rem', color: item.status === 'Open' ? '#EF4444' : '#10B981', fontWeight: '700' }}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => onNavigateToReport(item.id)}
                            style={{
                              background: 'rgba(56, 189, 248, 0.1)',
                              border: '1px solid rgba(56, 189, 248, 0.25)',
                              borderRadius: '6px',
                              padding: '0.3rem 0.6rem',
                              color: '#38BDF8',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                            }}
                          >
                            <Eye size={13} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Emerging Safety Risks */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Emerging Safety Risks
                    <InfoTooltip term="emerging_risk" />
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Calculated hazard frequency velocity from stored observations
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {trends?.emerging_risks?.length > 0 ? (
                  trends.emerging_risks.slice(0, 6).map((item, idx) => {
                    const isInc = item.trend_direction === 'increasing';
                    const isDec = item.trend_direction === 'decreasing';

                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.85rem 1.15rem',
                          background: '#0B132B',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#F1F5F9' }}>
                            {item.hazard}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {item.report_count} incident reports tracked
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.85rem',
                            fontWeight: '800',
                            color: isInc ? '#EF4444' : (isDec ? '#10B981' : '#94A3B8'),
                          }}
                        >
                          {isInc && <ArrowUpRight size={18} />}
                          {isDec && <ArrowDownRight size={18} />}
                          {!isInc && !isDec && <Minus size={18} />}
                          <span>{item.percent_change > 0 ? `+${item.percent_change}%` : `${item.percent_change}%`}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ color: '#64748B', fontSize: '0.85rem', padding: '1.5rem', textAlign: 'center' }}>
                    Insufficient historical data to compute rate of change.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row: Recent Critical Alerts & Location Hotspots */}
          <div className="grid-2" style={{ marginBottom: '2rem' }}>
            {/* Recent Critical Alerts */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Recent Critical Alerts
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Immediate safety attention required
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {highRiskAlerts.length > 0 ? (
                  highRiskAlerts.map((report) => (
                    <AlertCard
                      key={report.id}
                      report={report}
                      onViewDetails={onNavigateToReport}
                    />
                  ))
                ) : (
                  <div style={{ color: '#64748B', fontSize: '0.85rem', padding: '1.5rem', textAlign: 'center' }}>
                    Zero critical alerts active.
                  </div>
                )}
              </div>
            </div>

            {/* High-Risk Reports by Facility */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC' }}>
                    High-Risk Reports by Facility
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Operational geographic breakdown
                  </span>
                </div>
              </div>

              <div style={{ height: '260px' }}>
                <Bar
                  data={locationData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false }, ticks: { color: '#94A3B8' } },
                      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748B' } },
                    },
                    plugins: {
                      legend: { labels: { color: '#94A3B8' } },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Synthetic Data Disclaimer Footer */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem 1.5rem',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.78rem',
          color: '#64748B'
        }}
      >
        <Info size={16} color="#38BDF8" style={{ flexShrink: 0 }} />
        <span>
          <strong>Synthetic Data Notice:</strong> Platform operates on synthetic benchmark safety records for SIH evaluation. All model inferences, Bow-Tie mappings, risk scoring, and audit traces are generated live by the active backend ML & Risk engines.
        </span>
      </div>
    </div>
  );
}
