import React, { useState, useEffect } from 'react';
import {
  Radio,
  ShieldCheck,
  Activity,
  Lock,
  BarChart3,
  Database,
  Layers,
  ChevronRight,
  Zap,
  Terminal,
  FileText,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Clock,
  Download
} from 'lucide-react';
import { PcapAnalyzer } from './PcapAnalyzer';
import { IpsecAnalysis } from './IpsecAnalysis';
import { IkeSessions } from './IkeSessions';
import { CryptoAnalysis } from './CryptoAnalysis';
import { TrafficIntelligence } from './TrafficIntelligence';
import { EvidenceExplorer } from './EvidenceExplorer';
import './Analysis.css';

export type AnalysisSection =
  | 'pcap'
  | 'ipsec'
  | 'ike'
  | 'crypto'
  | 'traffic'
  | 'evidence';

interface DockerItem {
  id: AnalysisSection;
  label: string;
  icon: React.ElementType;
}

const DOCKER_SECTIONS: DockerItem[] = [
  {
    id: 'pcap',
    label: 'PCAP Analyzer',
    icon: Radio,
  },
  {
    id: 'ipsec',
    label: 'IPsec Analysis',
    icon: ShieldCheck,
  },
  {
    id: 'ike',
    label: 'IKE Sessions',
    icon: Activity,
  },
  {
    id: 'crypto',
    label: 'Crypto Analysis',
    icon: Lock,
  },
  {
    id: 'traffic',
    label: 'Traffic Intelligence',
    icon: BarChart3,
  },
  {
    id: 'evidence',
    label: 'Evidence Explorer',
    icon: Database,
  },
];

export interface AnalysisProps {
  initialSection?: AnalysisSection;
}

export function Analysis({ initialSection }: AnalysisProps = {}) {
  const [activeSection, setActiveSection] = useState<AnalysisSection>(initialSection || 'pcap');

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  return (
    <div className="analysis-layout-container">
      {/* ── LEFT SIDE DOCKER (6 SECTIONS) ── */}
      <aside className="analysis-left-docker">
        <div className="docker-header-meta">
          <div className="docker-title-row">
            <Layers size={15} />
            <span>Analysis Modules</span>
          </div>
        </div>

        <nav className="docker-nav-list">
          {DOCKER_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                className={`docker-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveSection(sec.id)}
              >
                <div className="nav-item-left">
                  <Icon className="docker-nav-icon" />
                  <span>{sec.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="docker-footer-widget">
          <div className="df-row">
            <span className="df-lbl">Kernel Hook:</span>
            <span className="df-val active-green">XDP/eBPF Active</span>
          </div>
          <div className="df-row">
            <span className="df-lbl">Dissection Mode:</span>
            <span className="df-val">Deterministic 10-Stage</span>
          </div>
          <div className="df-row">
            <span className="df-lbl">Active Isolation:</span>
            <span className="df-val">cgroups v2 Sandbox</span>
          </div>
        </div>
      </aside>

      {/* ── RIGHT MAIN VIEWPORT ── */}
      <div className="analysis-main-viewport">
        {activeSection === 'pcap' && <PcapAnalyzer />}
        {activeSection === 'ipsec' && <IpsecAnalysis />}
        {activeSection === 'ike' && <IkeSessions />}
        {activeSection === 'crypto' && <CryptoAnalysis />}
        {activeSection === 'traffic' && <TrafficIntelligence />}
        {activeSection === 'evidence' && <EvidenceExplorer />}
      </div>
    </div>
  );
}
