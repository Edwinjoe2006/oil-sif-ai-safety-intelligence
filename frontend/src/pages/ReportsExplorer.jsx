import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Eye, ArrowUpDown, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import SeverityBadge from '../components/SeverityBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

export default function ReportsExplorer({ onNavigateToReport, onNavigateToAnalyze }) {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [hazard, setHazard] = useState('');
  const [reportType, setReportType] = useState('');
  const [severity, setSeverity] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sifFilter, setSifFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        risk_level: riskLevel || undefined,
        hazard: hazard || undefined,
        report_type: reportType || undefined,
        severity: severity || undefined,
        status: statusFilter || undefined,
        sif: sifFilter === '' ? undefined : (sifFilter === 'true'),
        sort_by: sortBy,
        order: order,
      };

      const data = await api.getReports(params);
      setReports(data.reports || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, riskLevel, hazard, reportType, severity, statusFilter, sifFilter, sortBy, order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReports();
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const handleExportCSV = () => {
    if (!reports || reports.length === 0) return;
    const headers = ['ID', 'Risk Level', 'Risk Score', 'SIF Precursor', 'Hazard Category', 'Severity', 'Report Type', 'Location', 'Status', 'Date', 'Report Text'];
    const rows = reports.map(r => [
      r.id,
      r.risk_level,
      r.risk_score,
      r.sif_prediction ? 'Yes' : 'No',
      `"${(r.hazard_category || '').replace(/"/g, '""')}"`,
      r.severity || '',
      r.report_type || '',
      `"${(r.location || '').replace(/"/g, '""')}"`,
      r.status || '',
      `"${new Date(r.created_at).toISOString()}"`,
      `"${(r.report_text || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `oil_sif_safety_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Safety Reports Explorer
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            Search, filter, and audit {total} safety events recorded across operational assets.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCSV}
            disabled={reports.length === 0}
            title="Download records as enterprise CSV spreadsheet"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchReports}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search Row */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color="#64748B" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="Search report narrative, incident description, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
              Search
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {/* Risk Level */}
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '0.25rem' }}>
                RISK LEVEL
              </label>
              <select className="form-select" value={riskLevel} onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}>
                <option value="">All Risks</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* SIF */}
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '0.25rem' }}>
                SIF PRECURSOR
              </label>
              <select className="form-select" value={sifFilter} onChange={(e) => { setSifFilter(e.target.value); setPage(1); }}>
                <option value="">All Precursors</option>
                <option value="true">SIF Only</option>
                <option value="false">Non-SIF Only</option>
              </select>
            </div>

            {/* Hazard */}
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '0.25rem' }}>
                HAZARD DOMAIN
              </label>
              <select className="form-select" value={hazard} onChange={(e) => { setHazard(e.target.value); setPage(1); }}>
                <option value="">All Hazards</option>
                <option value="Pressure">Pressure</option>
                <option value="Confined Space">Confined Space</option>
                <option value="Working at Height">Working at Height</option>
                <option value="Fire/Explosion">Fire / Explosion</option>
                <option value="Energy Isolation">Energy Isolation</option>
                <option value="Chemical Exposure">Chemical</option>
                <option value="Housekeeping">Housekeeping</option>
              </select>
            </div>

            {/* Severity */}
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '0.25rem' }}>
                SEVERITY
              </label>
              <select className="form-select" value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1); }}>
                <option value="">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '0.25rem' }}>
                STATUS
              </label>
              <select className="form-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '0.25rem' }}>
                SORT BY
              </label>
              <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="created_at">Date Logged</option>
                <option value="risk_score">Risk Score</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Table Section */}
      {loading ? (
        <LoadingSkeleton count={5} height="65px" />
      ) : reports.length === 0 ? (
        <EmptyState
          title="No Matching Reports Found"
          description="No safety records match your current search and filter criteria. Try clearing filters or submit a new observation."
          actionText="Analyze New Report"
          onAction={onNavigateToAnalyze}
        />
      ) : (
        <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
          <table className="industrial-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Risk Level</th>
                <th>Score</th>
                <th>SIF</th>
                <th>Hazard Category</th>
                <th>Severity</th>
                <th>Location</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onNavigateToReport(r.id)}
                >
                  <td style={{ fontWeight: '700', color: '#94A3B8' }}>#{r.id}</td>
                  <td>
                    <RiskBadge level={r.risk_level} />
                  </td>
                  <td>
                    <strong style={{ color: '#F8FAFC', fontSize: '0.95rem' }}>{r.risk_score}</strong>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: r.sif_prediction ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.12)',
                        color: r.sif_prediction ? '#F87171' : '#34D399',
                        border: `1px solid ${r.sif_prediction ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                      }}
                    >
                      {r.sif_prediction ? 'SIF' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: '#F1F5F9', fontWeight: '600' }}>{r.hazard_category}</span>
                  </td>
                  <td>
                    <SeverityBadge severity={r.severity} />
                  </td>
                  <td>
                    <span style={{ color: '#94A3B8' }}>{r.location}</span>
                  </td>
                  <td>
                    <span style={{ color: '#64748B', fontSize: '0.78rem' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: r.status === 'Open' ? '#EF4444' : (r.status === 'In Progress' ? '#F59E0B' : '#10B981'),
                      }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToReport(r.id);
                      }}
                    >
                      <Eye size={13} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Showing Page {page} of {totalPages} ({total} total records)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{ padding: '0.4rem 0.8rem' }}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{ padding: '0.4rem 0.8rem' }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
