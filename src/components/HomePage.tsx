import React, { useState } from 'react';
import { AnimatedTopDock } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';
import { DotPattern } from '@/components/ui/dot-pattern';
import { Overview, ScenarioType } from './Overview';
import { Analysis, AnalysisSection } from './Analysis';
import { Security, SecuritySection } from './Security';
import { Network, NetworkSection } from './Network';
import { Data, DataSection } from './Data';
import { Reports, ReportsSection } from './Reports';
import { System, SystemSection } from './System';
import { SubTabsMenu } from './SubTabsMenu';
import { TunnelXrayLogo } from './TunnelXrayLogo';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Cpu,
  Lock,
  Radio,
  RefreshCw,
  LogOut,
  Sliders,
  Terminal,
  FileText,
  ChevronRight,
  Database,
  Wifi,
  Sparkles
} from 'lucide-react';
import './HomePage.css';
import './TransparentTheme.css';
import { pcapStore } from '../services/pcapStore';

interface UserProfile {
  name: string;
  email: string;
  provider?: string;
  role?: string;
  avatar?: string;
}

interface HomePageProps {
  user: UserProfile;
  onLogout: () => void;
}

export type DockTab = 'overview' | 'analysis' | 'security' | 'network' | 'data' | 'reports' | 'system';

export const TAB_DESCRIPTIONS: Record<DockTab, { badge: string; title: string; subtitle: string }> = {
  overview: {
    badge: '',
    title: 'IPsec Security Command Center',
    subtitle: 'Live automated inspection of IKEv1/IKEv2 handshakes, ESP payload validation, and cryptographic vulnerability detection.',
  },
  analysis: {
    badge: 'PROTOCOL PACKET DISSECTION',
    title: 'IKE & ESP Deep Packet Inspection',
    subtitle: 'Heuristic state machine evaluation, replay attack protection, and automated fragmentation audits.',
  },
  security: {
    badge: 'PFS & CIPHER INTEGRITY AUDIT',
    title: 'Cryptographic Security Assessment',
    subtitle: 'Verification of Post-Quantum & Classical Diffie-Hellman groups, authenticated encryption (GCM), and digital cert chains.',
  },
  network: {
    badge: 'GLOBAL IPSEC TOPOLOGY & MESH',
    title: 'Distributed Gateway Operations',
    subtitle: 'Multi-cloud transit monitoring across AWS, Azure, Google Cloud, and Cloudflare Edge interconnects.',
  },
  data: {
    badge: 'PCAP ARCHIVES & ML PROVENANCE',
    title: 'Data Operations & Model Governance',
    subtitle: 'Immutable PCAP archive catalog, 60/20/20 ML dataset partition provenance, and enterprise model registry.',
  },
  reports: {
    badge: 'CERTIFIED REPORTS (/REPORTS)',
    title: 'Certified Security Reports',
    subtitle: 'Forensic PDF export of official executive and technical audit reports with tamper-evident SHA-256 seals.',
  },
  system: {
    badge: 'SYSTEM ENGINE & GOVERNANCE',
    title: 'Platform Administration & Diagnostics',
    subtitle: 'Immutable audit logs, live microservice telemetry (FastAPI, database, Scapy, Celery), and enterprise engine preferences.',
  },
};

// Canonical Scene component as configured in the specification
export function Scene({
  activeTab = "overview",
  onTabChange,
  onOpenSubTabs,
  isMenuOpen = false,
}: {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onOpenSubTabs?: () => void;
  isMenuOpen?: boolean;
} = {}) {
  return (
    <div className="shader-frame">
      <AnimatedTopDock
        variant="sable"
        proximity={55}
        spring={0.25}
        damping={0.80}
        widthGrowth={8}
        heightGrowth={4}
        drop={1.5}
        activeId={activeTab}
        onItemChange={onTabChange}
        onLogoClick={onOpenSubTabs}
        isLogoActive={isMenuOpen}
      />
    </div>
  );
}

export function HomePage({ user, onLogout }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<DockTab>(() => {
    try {
      const param = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;
      if (param && ['overview', 'analysis', 'security', 'network', 'data', 'reports', 'system'].includes(param)) {
        return param as DockTab;
      }
    } catch {
      // ignore
    }
    return 'overview';
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const [isSubTabsMenuOpen, setIsSubTabsMenuOpen] = useState(false);
  const [analysisSection, setAnalysisSection] = useState<AnalysisSection>('pcap');
  const [securitySection, setSecuritySection] = useState<SecuritySection>('assessment');
  const [networkSection, setNetworkSection] = useState<NetworkSection>('topology');
  const [dataSection, setDataSection] = useState<DataSection>('history');
  const [reportsSection, setReportsSection] = useState<ReportsSection>('certified');
  const [systemSection, setSystemSection] = useState<SystemSection>('audit');
  const [overviewScenario, setOverviewScenario] = useState<ScenarioType>('baseline');

  const handleNavigateFromMenu = (tab: DockTab, subSectionId?: string) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      if (subSectionId === 'sweet32' || subSectionId === 'replay' || subSectionId === 'baseline') {
        setOverviewScenario(subSectionId as ScenarioType);
      }
      if (subSectionId === 'audit-log') {
        setTimeout(() => {
          const el = document.getElementById('audit-section') || document.querySelector('.audit-records-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (tab === 'analysis' && subSectionId) {
      setAnalysisSection(subSectionId as AnalysisSection);
    } else if (tab === 'security' && subSectionId) {
      setSecuritySection(subSectionId as SecuritySection);
    } else if (tab === 'network' && subSectionId) {
      setNetworkSection(subSectionId as NetworkSection);
    } else if (tab === 'data' && subSectionId) {
      setDataSection(subSectionId as DataSection);
    } else if (tab === 'reports' && subSectionId) {
      setReportsSection(subSectionId as ReportsSection);
    } else if (tab === 'system' && subSectionId) {
      setSystemSection(subSectionId as SystemSection);
    }
    setIsSubTabsMenuOpen(false);
  };

  const currentSubSection =
    activeTab === 'overview'
      ? overviewScenario
      : activeTab === 'analysis'
      ? analysisSection
      : activeTab === 'security'
      ? securitySection
      : activeTab === 'network'
      ? networkSection
      : activeTab === 'data'
      ? dataSection
      : activeTab === 'reports'
      ? reportsSection
      : activeTab === 'system'
      ? systemSection
      : undefined;

  const handleRunScan = async () => {
    setIsScanning(true);
    setScanProgress(25);

    setTimeout(() => {
      setScanProgress(65);
    }, 400);

    try {
      await pcapStore.reanalyzeActiveCapture();
    } catch {
      // ignore
    }

    setScanProgress(100);
    setTimeout(() => {
      setIsScanning(false);
    }, 400);
  };

  return (
    <div className="home-page-container">
      {/* Full dot pattern across the entire background of the home page */}
      <DotPattern
        width={32}
        height={32}
        cx={1.5}
        cy={1.5}
        cr={1.2}
        className="pointer-events-none absolute inset-0 h-full w-full fill-white/[0.14]"
      />

      {/* ThreeUI Configured Top Dock Hero Area */}
      <section className="top-dock-hero-section">
        {/* Floating Brand Bar (Top Left Overlay) */}
        <div className="top-brand-bar">
          <div className="top-brand-pill">
            <TunnelXrayLogo size={16} className="brand-icon-glow" />
            <span className="brand-name">TunnelXray</span>
          </div>
        </div>

        {/* The Exact <Scene /> configured usage */}
        <Scene
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as DockTab)}
          onOpenSubTabs={() => setIsSubTabsMenuOpen((prev) => !prev)}
          isMenuOpen={isSubTabsMenuOpen}
        />

        {/* Floating Quick User Controls (Top Right Overlay) */}
        <div className="top-user-bar">
          <div className="top-user-pill">
            <span className="live-pulse-dot" />
            <span className="top-user-name">{user.name}</span>
            <span className="top-user-tag">{user.role || 'SecOps Lead'}</span>
          </div>

          <button
            type="button"
            className="top-signout-btn"
            onClick={onLogout}
            title="Sign out to Login Page"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      {/* Main Home Page Workspace Content */}
      <main className="home-main-content">
        {/* Status Header Banner */}
        <header className="workspace-header">
          <div className="header-left">
            {TAB_DESCRIPTIONS[activeTab]?.badge ? (
              <div className="header-badge">
                <ShieldCheck size={16} />
                <span>{TAB_DESCRIPTIONS[activeTab].badge}</span>
              </div>
            ) : null}
            <h1 className="workspace-title">{TAB_DESCRIPTIONS[activeTab]?.title || 'IPsec Security Command Center'}</h1>
            <p className="workspace-subtitle">
              {TAB_DESCRIPTIONS[activeTab]?.subtitle || 'Live automated inspection of IKEv1/IKEv2 handshakes, ESP payload validation, and cryptographic vulnerability detection.'}
            </p>
          </div>

          <div className="header-right">
            <div className="header-telemetry-cluster">
              <div className="telemetry-chip">
                <span className="telemetry-dot green" />
                <span className="telemetry-label">Threat Engine:</span>
                <span className="telemetry-val">Online</span>
              </div>
              <div className="telemetry-chip">
                <span className="telemetry-dot cyan" />
                <span className="telemetry-label">Standard:</span>
                <span className="telemetry-val">NIST SP 800-77</span>
              </div>
              <div className="telemetry-chip">
                <span className="telemetry-dot purple" />
                <span className="telemetry-label">Interface:</span>
                <span className="telemetry-val">Wireline 10G</span>
              </div>
            </div>

            <button
              type="button"
              className={`run-audit-btn ${isScanning ? 'scanning' : ''}`}
              onClick={handleRunScan}
              disabled={isScanning}
            >
              <RefreshCw size={16} className={isScanning ? 'spin-icon' : ''} />
              <span>{isScanning ? `Scanning (${scanProgress}%)` : 'Run Live Security Audit'}</span>
            </button>
          </div>
        </header>

        {/* Render Overview, Analysis, Security, Network or Sub-System Modules */}
        {activeTab === 'overview' ? (
          <Overview initialScenario={overviewScenario} />
        ) : activeTab === 'analysis' ? (
          <Analysis initialSection={analysisSection} />
        ) : activeTab === 'security' ? (
          <Security initialSection={securitySection} />
        ) : activeTab === 'network' ? (
          <Network initialSection={networkSection} />
        ) : activeTab === 'data' ? (
          <Data initialSection={dataSection} />
        ) : activeTab === 'reports' ? (
          <Reports initialSection={reportsSection} />
        ) : activeTab === 'system' ? (
          <System initialSection={systemSection} />
        ) : (
          <div className="tab-placeholder-card">
            <div className="tab-placeholder-inner">
              <div className="placeholder-icon-wrap">
                <ShieldCheck size={36} />
              </div>
              <span className="placeholder-badge">{TAB_DESCRIPTIONS[activeTab as DockTab]?.badge}</span>
              <h3>{TAB_DESCRIPTIONS[activeTab as DockTab]?.title}</h3>
              <p>{TAB_DESCRIPTIONS[activeTab as DockTab]?.subtitle}</p>
              
              <div className="placeholder-stats-row">
                <div className="p-stat">
                  <span className="p-stat-val"></span>
                  <span className="p-stat-lbl">Active Tunnels</span>
                </div>
                <div className="p-stat">
                  <span className="p-stat-val"></span>
                  <span className="p-stat-lbl">RFC Conformant</span>
                </div>
                <div className="p-stat">
                  <span className="p-stat-val"></span>
                  <span className="p-stat-lbl">Mesh Latency</span>
                </div>
              </div>

              <button
                type="button"
                className="back-to-overview-btn"
                onClick={() => setActiveTab('overview')}
              >
                Return to Executive SOC Overview
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Direct All Sub-Tabs Navigation Modal / Drawer */}
      <SubTabsMenu
        isOpen={isSubTabsMenuOpen}
        onClose={() => setIsSubTabsMenuOpen(false)}
        activeTab={activeTab}
        currentSubSection={currentSubSection}
        onNavigate={handleNavigateFromMenu}
      />
    </div>
  );
}
