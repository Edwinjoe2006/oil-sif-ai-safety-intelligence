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

// SIH Advanced Upgrade Pages
import AssetIntelligence from './pages/AssetIntelligence';
import ImageInspection from './pages/ImageInspection';
import RiskSimulator from './pages/RiskSimulator';
import CausalAnalysis from './pages/CausalAnalysis';
import AIQuality from './pages/AIQuality';
import AIDecisionTrace from './pages/AIDecisionTrace';
import AlertCenter from './pages/AlertCenter';
import CorrectiveActions from './pages/CorrectiveActions';
import PredictiveTrends from './pages/PredictiveTrends';

import { api } from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [health, setHealth] = useState(null);

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
    const interval = setInterval(loadHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const navigateToReport = (reportId) => {
    setSelectedReportId(reportId);
    setActivePage('report-details');
  };

  const navigateToAnalyze = () => {
    setActivePage('analyze');
  };

  return (
    <div className="app-container">
      {/* Collapsible Industrial Navigation Sidebar */}
      <Sidebar
        activePage={activePage === 'report-details' ? 'reports' : activePage}
        setActivePage={(page) => {
          setActivePage(page);
          if (page !== 'report-details') setSelectedReportId(null);
        }}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        health={health}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <TopNavbar activePage={activePage} health={health} />

        <main style={{ flex: 1, paddingBottom: '3rem' }}>
          {/* Core Operations */}
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

          {activePage === 'priority' && (
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

          {/* Risk Intelligence (Features 1, 2, 3, 4, 5, 10) */}
          {activePage === 'emerging' && (
            <EmergingRisks onNavigateToAnalyze={navigateToAnalyze} />
          )}

          {activePage === 'assets' && (
            <AssetIntelligence onNavigateToAnalyze={navigateToAnalyze} />
          )}

          {activePage === 'simulator' && (
            <RiskSimulator />
          )}

          {activePage === 'forecast' && (
            <PredictiveTrends />
          )}

          {activePage === 'vision' && (
            <ImageInspection />
          )}

          {activePage === 'causal' && (
            <CausalAnalysis />
          )}

          {activePage === 'hazards' && (
            <HazardIntelligence />
          )}

          {/* Governance & Quality (Features 7, 8, 9) */}
          {activePage === 'alerts' && (
            <AlertCenter />
          )}

          {activePage === 'actions' && (
            <CorrectiveActions />
          )}

          {activePage === 'quality' && (
            <AIQuality />
          )}

          {activePage === 'audit' && (
            <AIDecisionTrace />
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
