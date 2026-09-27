import React, { useState, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  FileCode,
  Layers,
  Sparkles,
  DownloadCloud
} from 'lucide-react';
import { CertifiedReports } from './CertifiedReports';
import { ComplianceReport } from './ComplianceReport';
import { ForensicDossier } from './ForensicDossier';
import './Reports.css';

export type ReportsSection = 'certified' | 'compliance' | 'forensic';

interface ReportsDockerItem {
  id: ReportsSection;
  label: string;
  icon: React.ElementType;
}

const REPORTS_DOCKER_SECTIONS: ReportsDockerItem[] = [
  {
    id: 'certified',
    label: 'Certified Reports',
    icon: Award,
  },
  {
    id: 'compliance',
    label: 'Regulatory Standards Matrix',
    icon: ShieldCheck,
  },
  {
    id: 'forensic',
    label: 'Forensic Dossier & Evidence',
    icon: FileCode,
  }
];

export interface ReportsProps {
  initialSection?: ReportsSection;
}

export function Reports({ initialSection }: ReportsProps = {}) {
  const [activeSection, setActiveSection] = useState<ReportsSection>(initialSection || 'certified');

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  return (
    <div className="reports-layout-container">
      {/* ── LEFT SIDE DOCKER (3 MENUS) ── */}
      <aside className="reports-left-docker">
        <div className="reports-docker-meta">
          <div className="reports-docker-title-row">
            <Layers size={15} />
            <span>Compliance & Audit</span>
          </div>
        </div>

        <nav className="reports-docker-nav-list">
          {REPORTS_DOCKER_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                className={`reports-docker-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveSection(sec.id)}
              >
                <div className="reports-nav-item-left">
                  <Icon className="reports-docker-icon" />
                  <span>{sec.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Status Callout Footer in Docker */}
        <div className="reports-docker-footer">
          <div className="reports-footer-top">
            <div className="reports-status-dot active" />
            <span className="reports-footer-title">Audit Authority Engine</span>
          </div>
          <div className="reports-footer-desc">
            RFC 8221, RFC 8247 & NIST SP 800-77 Rev. 1 Certified Exports.
          </div>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <section className="reports-main-workspace">
        {activeSection === 'certified' && <CertifiedReports />}
        {activeSection === 'compliance' && <ComplianceReport />}
        {activeSection === 'forensic' && <ForensicDossier />}
      </section>
    </div>
  );
}
