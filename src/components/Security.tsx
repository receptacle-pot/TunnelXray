import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  FileText,
  Calculator,
  BrainCircuit,
  Building,
  Layers,
  Sparkles,
  ExternalLink,
  Target,
  FileCheck
} from 'lucide-react';
import { SecurityAssessment } from './SecurityAssessment';
import { Findings } from './Findings';
import { FindingDetails } from './FindingDetails';
import { SecurityScore } from './SecurityScore';
import { AiAnalytics } from './AiAnalytics';
import { PolicyCompliance } from './PolicyCompliance';
import './Security.css';

export type SecuritySection =
  | 'assessment'
  | 'findings'
  | 'details'
  | 'score'
  | 'ai'
  | 'policy';

interface SecurityDockerItem {
  id: SecuritySection;
  label: string;
  icon: React.ElementType;
}

const SECURITY_DOCKER_SECTIONS: SecurityDockerItem[] = [
  {
    id: 'assessment',
    label: 'Threat Assessment',
    icon: Target,
  },
  {
    id: 'findings',
    label: 'Verified Findings',
    icon: ShieldAlert,
  },
  {
    id: 'details',
    label: 'Finding Details',
    icon: FileText,
  },
  {
    id: 'score',
    label: 'Security Score',
    icon: Calculator,
  },
  {
    id: 'ai',
    label: 'AI Analytics',
    icon: BrainCircuit,
  },
  {
    id: 'policy',
    label: 'Policy Compliance',
    icon: Building,
  }
];

export interface SecurityProps {
  initialSection?: SecuritySection;
}

export function Security({ initialSection }: SecurityProps = {}) {
  const [activeSection, setActiveSection] = useState<SecuritySection>(initialSection || 'assessment');

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  const handleSelectFinding = (findingId: string) => {
    setActiveSection('details');
  };

  return (
    <div className="security-layout-container">
      {/* ── LEFT SIDE DOCKER (6 SECTIONS) ── */}
      <aside className="security-left-docker">
        <div className="security-docker-meta">
          <div className="security-docker-title-row">
            <Layers size={15} />
            <span>Security Modules</span>
          </div>
        </div>

        <nav className="security-docker-nav-list">
          {SECURITY_DOCKER_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                className={`security-docker-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveSection(sec.id)}
              >
                <div className="security-nav-item-left">
                  <Icon className="security-docker-icon" />
                  <span>{sec.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Status Callout Footer in Docker */}
        <div className="security-docker-footer">
          <div className="sec-footer-top">
            <div className="sec-status-dot active" />
            <span className="sec-footer-title">Threat Intel Engine</span>
          </div>
          <div className="sec-footer-desc">
            MITRE ATT&CK v14.1 & CVSS v3.1 active telemetry.
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT VIEWPORT ── */}
      <main className="security-main-viewport">
        {activeSection === 'assessment' && <SecurityAssessment />}
        {activeSection === 'findings' && <Findings onSelectFinding={handleSelectFinding} />}
        {activeSection === 'details' && <FindingDetails />}
        {activeSection === 'score' && <SecurityScore />}
        {activeSection === 'ai' && <AiAnalytics />}
        {activeSection === 'policy' && <PolicyCompliance />}
      </main>
    </div>
  );
}
