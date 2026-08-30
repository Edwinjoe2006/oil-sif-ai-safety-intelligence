import React from 'react';
import {
  Shield,
  LayoutDashboard,
  FileSearch,
  Layers,
  ListOrdered,
  TrendingUp,
  Activity,
  Cpu,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Database,
  Radio
} from 'lucide-react';

export default function Sidebar({
  activePage,
  setActivePage,
  collapsed,
  setCollapsed,
  health
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyze', label: 'Analyze Report', icon: FileSearch, highlight: true },
    { id: 'reports', label: 'Safety Reports', icon: Layers },
    { id: 'priority', label: 'Risk Priority Queue', icon: ListOrdered },
    { id: 'emerging', label: 'Emerging Risks', icon: TrendingUp },
    { id: 'hazards', label: 'Hazard Intelligence', icon: Activity },
    { id: 'performance', label: 'Model Performance', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside
      style={{
        width: collapsed ? '80px' : '260px',
        backgroundColor: '#091124',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      {/* Top Header */}
      <div>
        <div
          style={{
            padding: '1.5rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
                color: 'white',
              }}
            >
              <Shield size={22} />
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontSize: '1rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#F8FAFC' }}>
                  OIL SIF AI
                </div>
                <div style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: '600', letterSpacing: '0.04em' }}>
                  SAFETY INTELLIGENCE
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              display: collapsed ? 'none' : 'flex',
            }}
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePage(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  width: '100%',
                  padding: collapsed ? '0.75rem' : '0.75rem 1rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(2, 132, 199, 0.25) 0%, rgba(2, 132, 199, 0.08) 100%)'
                    : 'transparent',
                  color: isActive ? '#38BDF8' : '#94A3B8',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  borderLeft: isActive ? '3px solid #38BDF8' : '3px solid transparent',
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={19} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom System Status */}
      {!collapsed && (
        <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ background: '#050A17', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Radio size={12} /> AI Engine
              </span>
              <span style={{ color: health?.models_loaded ? '#10B981' : '#F59E0B', fontWeight: '700' }}>
                ● {health?.models_loaded ? 'Ready' : 'Standby'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Database size={12} /> Database
              </span>
              <span style={{ color: health?.database_connected ? '#10B981' : '#EF4444', fontWeight: '700' }}>
                ● {health?.database_connected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
