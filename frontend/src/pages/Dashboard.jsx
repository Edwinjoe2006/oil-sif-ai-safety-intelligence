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
  Eye
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

export default function Dashboard({ onNavigateToAnalyze, onNavigateToReport }) {
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
    labels: trendLabels.length > 0 ? trendLabels : ['Day 1', 'Day 2', 'Day 3'],
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
        label: 'High/Critical Incidents',
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
            <Activity size={14} /> Live Safety Intelligence
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Oil & Gas Safety Early Warning System
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginTop: '0.35rem', maxWidth: '640px', lineHeight: 1.5 }}>
            AI-powered NLP pipeline detecting Serious Injury & Fatality (SIF) precursors in Unsafe-Act, Unsafe-Condition, and Near-Miss reports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchDashboardData}
            title="Refresh live metrics"
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

      {/* Top 6 KPI Cards */}
      <div className="grid-6" style={{ marginBottom: '2rem' }}>
        <KpiCard
          title="Total Reports"
          value={stats?.total_reports}
          icon={Activity}
          description="Analyzed safety events"
          trend="Total in DB"
          color="#38BDF8"
        />
        <KpiCard
          title="SIF Precursors"
          value={stats?.sif_precursors_count}
          icon={ShieldAlert}
          description="High potential fatal precursors"
          trend={stats?.total_reports ? `${Math.round((stats.sif_precursors_count / stats.total_reports) * 100)}% Rate` : '--'}
          color="#EF4444"
        />
        <KpiCard
          title="High/Critical Risks"
          value={stats?.high_critical_count}
          icon={Flame}
          description="Requiring urgent mitigation"
          trend="Escalated"
          color="#F97316"
        />
        <KpiCard
          title="Average Risk Score"
          value={stats?.average_risk_score}
          icon={AlertTriangle}
          description="Fleet-wide index (0–100)"
          trend="Score"
          color="#F59E0B"
        />
        <KpiCard
          title="Open Actions"
          value={stats?.open_corrective_actions}
          icon={CheckSquare}
          description="Field corrective actions pending"
          trend="Open"
          color="#818CF8"
        />
        <KpiCard
          title="Emerging Risks"
          value={stats?.emerging_risks_count}
          icon={TrendingUp}
          description="Hazards with increasing velocity"
          trend="Tracking"
          color="#34D399"
        />
      </div>

      {/* If No Reports Yet in DB */}
      {!hasReports && (
        <div style={{ marginBottom: '2.5rem' }}>
          <EmptyState
            title="Safety Database Awaiting First Report"
            description="The system architecture and AI pipelines are fully loaded and operational. Analyze your first safety observation to activate real-time dashboard analytics."
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
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Safety Risk Overview
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Distribution across 4 severity tiers
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
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Safety Risk Trend
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Average risk index over time
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
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Safety Risk Priority Queue
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Dynamic sorting by risk score descending
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
                          <span style={{ fontSize: '0.75rem', color: item.status === 'Open' ? '#EF4444' : '#10B981' }}>
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
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#F8FAFC' }}>
                    Emerging Safety Risks
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Calculated hazard frequency velocity
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
                    Immediate attention required
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

            {/* High-Risk Reports by Location */}
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
    </div>
  );
}
