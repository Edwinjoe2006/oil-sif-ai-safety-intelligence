import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import SIHDemoModal from './components/SIHDemoModal';

// Pages
import Dashboard from './pages/Dashboard';
import AnalyzeReport from './pages/AnalyzeReport';
import ReportsExplorer from './pages/ReportsExplorer';
import ReportDetails from './pages/ReportDetails';
import RiskPriorityQueue from './pages/RiskPriorityQueue';
import EmergingRisks from './pages/EmergingRisks';
import HazardIntelligence from './pages/HazardIntelligence';
import ModelPerformance from './pages/ModelPerformance';
import Settings from './pages/Settings';

// 10 Advanced Feature Pages
import AssetIntelligence from './pages/AssetIntelligence';
import RiskSimulator from './pages/RiskSimulator';
import ImageInspection from './pages/ImageInspection';
import CausalAnalysis from './pages/CausalAnalysis';
import AlertCenter from './pages/AlertCenter';
import CorrectiveActions from './pages/CorrectiveActions';
import AIQuality from './pages/AIQuality';
import AIDecisionTrace from './pages/AIDecisionTrace';
import PredictiveTrends from './pages/PredictiveTrends';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [health, setHealth] = useState(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await api.getHealth();
        setHealth(res);
      } catch (err) {
        console.error("Health check error:", err);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigateToReport = (reportId) => {
    setSelectedReportId(reportId);
    setActivePage('report-details');
  };

  const handleNavigateToAnalyze = () => {
    setActivePage('analyze');
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={(p) => {
          setActivePage(p);
          setMobileMenuOpen(false);
        }}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        health={health}
      />

      <div className="app-main-content">
        <TopNavbar
          activePage={activePage}
          health={health}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenDemo={() => setIsDemoModalOpen(true)}
        />

        <main className="app-content-body">
          {activePage === 'dashboard' && (
            <Dashboard
              onNavigateToAnalyze={handleNavigateToAnalyze}
              onNavigateToReport={handleNavigateToReport}
              onOpenDemo={() => setIsDemoModalOpen(true)}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'analyze' && (
            <AnalyzeReport
              onNavigateToReport={handleNavigateToReport}
            />
          )}

          {activePage === 'priority' && (
            <RiskPriorityQueue
              onNavigateToReport={handleNavigateToReport}
            />
          )}

          {activePage === 'reports' && (
            <ReportsExplorer
              onNavigateToReport={handleNavigateToReport}
            />
          )}

          {activePage === 'report-details' && (
            <ReportDetails
              reportId={selectedReportId}
              onBack={() => setActivePage('reports')}
            />
          )}

          {/* 10 Advanced Feature Pages */}
          {activePage === 'emerging' && (
            <EmergingRisks onNavigateToAnalyze={handleNavigateToAnalyze} />
          )}

          {activePage === 'assets' && (
            <AssetIntelligence onNavigateToAnalyze={handleNavigateToAnalyze} />
          )}

          {activePage === 'simulator' && (
            <RiskSimulator />
          )}

          {activePage === 'forecast' && (
            <PredictiveTrends />
          )}

          {activePage === 'vision' && (
            <ImageInspection onNavigateToReport={handleNavigateToReport} />
          )}

          {activePage === 'causal' && (
            <CausalAnalysis />
          )}

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

      {/* SIH Demonstration Walkthrough Modal */}
      <SIHDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onNavigate={(page) => {
          setActivePage(page);
          setIsDemoModalOpen(false);
        }}
      />
    </div>
  );
}
