import React, { useState, useEffect } from 'react';
import {
  Lock,
  Activity,
  Sliders,
  Layers,
  Sparkles,
  Server
} from 'lucide-react';
import { AuditLogs } from './AuditLogs';
import { SystemHealth } from './SystemHealth';
import { PlatformSettings } from './PlatformSettings';
import './System.css';

export type SystemSection = 'audit' | 'health' | 'settings';

interface SystemDockerItem {
  id: SystemSection;
  label: string;
  icon: React.ElementType;
}

const SYSTEM_DOCKER_SECTIONS: SystemDockerItem[] = [
  {
    id: 'audit',
    label: 'Audit Logs',
    icon: Lock,
  },
  {
    id: 'health',
    label: 'System Health',
    icon: Activity,
  },
  {
    id: 'settings',
    label: 'Platform Settings',
    icon: Sliders,
  }
];

export interface SystemProps {
  initialSection?: SystemSection;
}

export function System({ initialSection }: SystemProps = {}) {
  const [activeSection, setActiveSection] = useState<SystemSection>(() => {
    if (initialSection) return initialSection;
    try {
      const sec = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('sec') : null;
      if (sec && ['audit', 'health', 'settings'].includes(sec)) {
        return sec as SystemSection;
      }
    } catch {
      // ignore
    }
    return 'audit';
  });

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  return (
    <div className="system-layout-container">
      {/* ── LEFT SIDE DOCKER (3 MENUS) ── */}
      <aside className="system-left-docker">
        <div className="system-docker-meta">
          <div className="system-docker-title-row">
            <Layers size={15} />
            <span>Governance & Engine</span>
          </div>
        </div>

        <nav className="system-docker-nav-list">
          {SYSTEM_DOCKER_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                className={`system-docker-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveSection(sec.id)}
              >
                <div className="system-nav-item-left">
                  <Icon className="system-docker-icon" />
                  <span>{sec.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Status Callout Footer in Docker */}
        <div className="system-docker-footer">
          <div className="system-footer-top">
            <div className="system-status-dot active" />
            <span className="system-footer-title">Platform Runtime</span>
          </div>
          <div className="system-footer-desc">
            FastAPI, PostgreSQL, Scapy & Celery operating with zero degraded workers.
          </div>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <section className="system-main-workspace">
        {activeSection === 'audit' && <AuditLogs />}
        {activeSection === 'health' && <SystemHealth />}
        {activeSection === 'settings' && <PlatformSettings />}
      </section>
    </div>
  );
}
