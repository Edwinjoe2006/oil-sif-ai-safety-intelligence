import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import Dashboard from './pages/Dashboard';
import AnalyzeReport from './pages/AnalyzeReport';
import ReportsExplorer from './pages/ReportsExplorer';
import ReportDetails from './pages/ReportDetails';
import EmergingRisks from './pages/EmergingRisks';
import HazardIntelligence from './pages/HazardIntelligence';
import ModelPerformance from './pages/ModelPerformance';
import Settings from './pages/Settings';
import { api } from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState(() => {
    try {
      return localStorage.getItem('oil_sif_active_page') || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  const [selectedReportId, setSelectedReportId] = useState(() => {
    try {
      const id = localStorage.getItem('oil_sif_selected_report_id');
      return id ? Number(id) : null;
    } catch {
      return null;
    }
  });

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('oil_sif_active_page', activePage);
    } catch (err) {
      console.warn('Failed to save active page:', err);
    }
  }, [activePage]);

  useEffect(() => {
    try {
      if (selectedReportId) {
        localStorage.setItem('oil_sif_selected_report_id', String(selectedReportId));
      } else {
        localStorage.removeItem('oil_sif_selected_report_id');
      }
    } catch (err) {
      console.warn('Failed to save selected report id:', err);
    }
  }, [selectedReportId]);

  useEffect(() => {
    async function loadHealth() {
      try {
        const data = await api.getHealth();
        setHealth(data);
      } catch (err) {
        console.warn('Backend connection standby:', err.message);
      }
    }
    loadHealth();
    const interval = setInterval(loadHealth, 30000); // 30s heartbeat
    return () => clearInterval(interval);
  }, []);

  const navigateToReport = (reportId) => {
    setSelectedReportId(reportId);
    setActivePage('report-details');
    setMobileOpen(false);
  };

  const navigateToAnalyze = () => {
    setActivePage('analyze');
    setMobileOpen(false);
  };

  return (
    <div className="app-container">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Collapsible Industrial Sidebar */}
      <Sidebar
        activePage={activePage === 'report-details' ? 'reports' : activePage}
        setActivePage={(page) => {
          setActivePage(page);
          if (page !== 'report-details') setSelectedReportId(null);
          setMobileOpen(false);
        }}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        health={health}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <TopNavbar
          activePage={activePage}
          health={health}
          mobileOpen={mobileOpen}
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
        />

        <main style={{ flex: 1 }}>
          {activePage === 'dashboard' && (
            <Dashboard
              onNavigateToAnalyze={navigateToAnalyze}
              onNavigateToReport={navigateToReport}
            />
          )}

          {activePage === 'analyze' && (
            <AnalyzeReport onNavigateToReport={navigateToReport} />
          )}

          {activePage === 'reports' && (
            <ReportsExplorer
              onNavigateToReport={navigateToReport}
              onNavigateToAnalyze={navigateToAnalyze}
            />
          )}

          {activePage === 'report-details' && (
            <ReportDetails
              reportId={selectedReportId}
              onBack={() => setActivePage('reports')}
            />
          )}

          {activePage === 'priority' && (
            <ReportsExplorer
              onNavigateToReport={navigateToReport}
              onNavigateToAnalyze={navigateToAnalyze}
            />
          )}

          {activePage === 'emerging' && (
            <EmergingRisks onNavigateToAnalyze={navigateToAnalyze} />
          )}

          {activePage === 'hazards' && (
            <HazardIntelligence />
          )}

          {activePage === 'performance' && (
            <ModelPerformance />
          )}

          {activePage === 'settings' && (
            <Settings />
          )}
        </main>
      </div>
    </div>
  );
}
