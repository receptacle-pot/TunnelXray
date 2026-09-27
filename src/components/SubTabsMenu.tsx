import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Radio,
  Activity,
  Lock,
  BarChart3,
  Database,
  Target,
  FileText,
  Calculator,
  BrainCircuit,
  Building,
  Globe,
  FlaskConical,
  GitCompare,
  History,
  Cpu,
  Award,
  FileCode,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { DockTab } from './HomePage';
import './SubTabsMenu.css';

export interface SubTabItem {
  id: string;
  name: string;
  badge?: string;
  badgeType?: 'default' | 'alert' | 'highlight' | 'live';
  description: string;
  icon: React.ElementType;
}

export interface TabDomain {
  id: DockTab;
  name: string;
  tagline: string;
  icon: React.ElementType;
  items: SubTabItem[];
}

export const NAVIGATION_DOMAINS: TabDomain[] = [
  {
    id: 'overview',
    name: 'Overview',
    tagline: 'IPsec Security Command Center & Executive SOC',
    icon: Activity,
    items: [
      {
        id: 'baseline',
        name: 'Executive SOC Command',
        badge: 'LIVE TELEMETRY',
        badgeType: 'live',
        description: 'Real-time telemetry, cryptographic radar dimensions, and traffic bandwidth.',
        icon: Activity,
      },
      {
        id: 'sweet32',
        name: 'Sweet32 Collision Scenario',
        badge: 'CVE-2016-2183',
        badgeType: 'alert',
        description: '3DES 64-bit block cipher collision attack simulation and warning vectors.',
        icon: ShieldAlert,
      },
      {
        id: 'replay',
        name: 'Anti-Replay Violation',
        badge: 'RFC 4303',
        badgeType: 'alert',
        description: 'Sequence injection, sliding replay window bitmap, and packet drop heuristics.',
        icon: ShieldX,
      },
      {
        id: 'audit-log',
        name: 'Forensic Audit Records',
        badge: 'SHA-256 SEAL',
        badgeType: 'highlight',
        description: 'Tamper-evident cryptographic audit logs, composite scores, and hex dumps.',
        icon: FileCheck,
      },
    ],
  },
  {
    id: 'analysis',
    name: 'Analysis',
    tagline: 'Deterministic Protocol Packet Dissection',
    icon: Radio,
    items: [
      {
        id: 'pcap',
        name: 'PCAP Analyzer',
        badge: 'BPF FILTER',
        badgeType: 'default',
        description: 'Deep packet inspection, protocol breakdown, and Wireshark filters.',
        icon: Radio,
      },
      {
        id: 'ipsec',
        name: 'IPsec Analysis',
        badge: 'SA / SPI',
        badgeType: 'default',
        description: 'Phase 1 & 2 Security Associations, SPI tracking, and key exchange audits.',
        icon: ShieldCheck,
      },
      {
        id: 'ike',
        name: 'IKE Sessions',
        badge: 'RFC 7296',
        badgeType: 'default',
        description: 'State machine transitions, initiator/responder cookies, and exchange logs.',
        icon: Activity,
      },
      {
        id: 'crypto',
        name: 'Crypto Analysis',
        badge: 'CIPHERS',
        badgeType: 'default',
        description: 'Authenticated ciphers (GCM/CBC), integrity hashes, and DH groups.',
        icon: Lock,
      },
      {
        id: 'traffic',
        name: 'Traffic Intelligence',
        badge: 'ENTROPY',
        badgeType: 'default',
        description: 'Bandwidth metrics, payload entropy distribution, and protocol statistics.',
        icon: BarChart3,
      },
      {
        id: 'evidence',
        name: 'Evidence Explorer',
        badge: 'HEX DUMPS',
        badgeType: 'highlight',
        description: 'Raw packet hex dumps, cryptographic proof artifacts, and JSON exports.',
        icon: Database,
      },
    ],
  },
  {
    id: 'security',
    name: 'Security',
    tagline: 'Cryptographic Assessment & Compliance Posture',
    icon: ShieldCheck,
    items: [
      {
        id: 'assessment',
        name: 'Threat Assessment',
        badge: 'POSTURE',
        badgeType: 'default',
        description: 'Heuristic threat evaluation, attack surface posture, and risk radar.',
        icon: Target,
      },
      {
        id: 'findings',
        name: 'Verified Findings',
        badge: 'CVE AUDIT',
        badgeType: 'alert',
        description: 'Weak cipher detection, downgrade vulnerabilities, and risk scoring.',
        icon: ShieldAlert,
      },
      {
        id: 'details',
        name: 'Finding Details',
        badge: 'CVSS v3.1',
        badgeType: 'default',
        description: 'In-depth vulnerability breakdowns, attack vectors, and remediation runbooks.',
        icon: FileText,
      },
      {
        id: 'score',
        name: 'Security Score',
        badge: 'CALCULATOR',
        badgeType: 'default',
        description: 'Composite cryptographic posture score, penalty deductions, and grading.',
        icon: Calculator,
      },
      {
        id: 'ai',
        name: 'AI Analytics',
        badge: 'ML HEURISTICS',
        badgeType: 'default',
        description: 'Machine learning anomaly detection and behavioral outlier analysis.',
        icon: BrainCircuit,
      },
      {
        id: 'policy',
        name: 'Policy Compliance',
        badge: 'STANDARDS',
        badgeType: 'highlight',
        description: 'Automated compliance auditing for PCI-DSS 4.0, HIPAA, and NIST SP 800-77.',
        icon: Building,
      },
    ],
  },
  {
    id: 'network',
    name: 'Network',
    tagline: 'Distributed Gateway Operations & Global Mesh',
    icon: Globe,
    items: [
      {
        id: 'topology',
        name: 'Interactive Topology',
        badge: 'GLOBAL MESH',
        badgeType: 'default',
        description: 'Multi-cloud IPsec mesh map across AWS, Azure, GCP, and Cloudflare edge.',
        icon: Globe,
      },
      {
        id: 'testbed',
        name: 'Synthetic Testbed',
        badge: 'CHAOS INJECTION',
        badgeType: 'alert',
        description: 'Handshake latency injection, packet drop emulation, and stress tests.',
        icon: FlaskConical,
      },
      {
        id: 'comparison',
        name: 'Differential Analysis',
        badge: 'DRIFT AUDIT',
        badgeType: 'default',
        description: 'Multi-gateway configuration drift and cipher suite divergence.',
        icon: GitCompare,
      },
    ],
  },
  {
    id: 'data',
    name: 'Data',
    tagline: 'PCAP Archives & ML Model Governance',
    icon: Database,
    items: [
      {
        id: 'history',
        name: 'Capture History & Archive',
        badge: 'IMMUTABLE PCAP',
        badgeType: 'default',
        description: 'Historical PCAP repository, SHA-256 integrity checksums, and catalog.',
        icon: History,
      },
      {
        id: 'dataset',
        name: 'ML Dataset Provenance',
        badge: '60/20/20 SPLIT',
        badgeType: 'default',
        description: 'Dataset partition lineage, feature normalization, and cleaning audits.',
        icon: Database,
      },
      {
        id: 'registry',
        name: 'ML Model Governance',
        badge: 'MODEL REGISTRY',
        badgeType: 'highlight',
        description: 'Threat classifier versions, inference telemetry, and model drift tracking.',
        icon: Cpu,
      },
    ],
  },
  {
    id: 'reports',
    name: 'Reports',
    tagline: 'Certified Security Reports & Audits',
    icon: Award,
    items: [
      {
        id: 'certified',
        name: 'Certified Reports',
        badge: 'EXPORT PDF',
        badgeType: 'highlight',
        description: 'Official executive and technical SOC audit reports with cryptographic seals.',
        icon: Award,
      },
      {
        id: 'compliance',
        name: 'Regulatory Standards Matrix',
        badge: 'NIST & FIPS',
        badgeType: 'default',
        description: 'Detailed compliance breakdown against NIST 800-77, FIPS 140-3, and PCI-DSS.',
        icon: ShieldCheck,
      },
      {
        id: 'forensic',
        name: 'Forensic Dossier & Evidence',
        badge: 'CHAIN OF CUSTODY',
        badgeType: 'default',
        description: 'Tamper-evident legal evidence exhibits and raw packet transcripts.',
        icon: FileCode,
      },
    ],
  },
  {
    id: 'system',
    name: 'System',
    tagline: 'Platform Administration & Diagnostics',
    icon: Sliders,
    items: [
      {
        id: 'audit',
        name: 'Audit Logs',
        badge: 'IMMUTABLE',
        badgeType: 'default',
        description: 'Platform administrator logs, authentication events, and audit trails.',
        icon: Lock,
      },
      {
        id: 'health',
        name: 'System Health',
        badge: 'MICROSERVICES',
        badgeType: 'live',
        description: 'Telemetry for FastAPI, Redis, Scapy engine, and eBPF/XDP kernel hooks.',
        icon: Activity,
      },
      {
        id: 'settings',
        name: 'Platform Settings',
        badge: 'ENGINE PREFS',
        badgeType: 'default',
        description: 'Engine preferences, alert thresholds, API keys, and notification routing.',
        icon: Sliders,
      },
    ],
  },
];

interface SubTabsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: DockTab;
  currentSubSection?: string;
  onNavigate: (tab: DockTab, subSectionId?: string) => void;
}

export function SubTabsMenu({
  isOpen,
  onClose,
  activeTab,
  currentSubSection,
  onNavigate,
}: SubTabsMenuProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      setSearchQuery('');
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredDomains = NAVIGATION_DOMAINS.map((domain) => {
    const domainMatches =
      domain.name.toLowerCase().includes(normalizedQuery) ||
      domain.tagline.toLowerCase().includes(normalizedQuery);

    const matchingItems = domain.items.filter((item) => {
      if (domainMatches && !normalizedQuery) return true;
      return (
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery) ||
        (item.badge && item.badge.toLowerCase().includes(normalizedQuery)) ||
        domain.name.toLowerCase().includes(normalizedQuery)
      );
    });

    return {
      ...domain,
      items: matchingItems,
    };
  }).filter((domain) => domain.items.length > 0);

  const totalMatches = filteredDomains.reduce((acc, d) => acc + d.items.length, 0);

  return (
    <div className="subtabs-menu-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Sub-tabs direct navigation menu">
      <div
        className="subtabs-menu-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── TOP HEADER ── */}
        <div className="subtabs-menu-header">
          <div className="smh-left">
            <div className="smh-badge-row">
              <span className="smh-badge">DIRECT SUB-TAB LAUNCHER</span>
              <span className="smh-count">{totalMatches} Sub-Tabs Available</span>
            </div>
            <h2 className="smh-title">Platform Sub-Tabs & Modules</h2>
            <p className="smh-subtitle">
              Click any sub-tab section below to navigate directly to it across all 7 platform domains.
            </p>
          </div>

          <button
            type="button"
            className="subtabs-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
            <span className="smh-kbd">ESC</span>
          </button>
        </div>

        {/* ── SEARCH & FILTER BAR ── */}
        <div className="subtabs-search-bar">
          <Search size={16} className="subtabs-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="subtabs-search-input"
            placeholder="Type to filter sub-tabs (e.g. PCAP, Sweet32, Topology, Audit, Compliance, AI)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="subtabs-clear-search"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          )}
        </div>

        {/* ── SUB-TABS DOMAINS GRID ── */}
        <div className="subtabs-content-scroll">
          {filteredDomains.length === 0 ? (
            <div className="subtabs-empty-state">
              <Search size={32} />
              <p>No sub-tab matches found for &quot;{searchQuery}&quot;</p>
              <button
                type="button"
                className="subtabs-empty-reset"
                onClick={() => setSearchQuery('')}
              >
                Reset Search Filter
              </button>
            </div>
          ) : (
            <div className="subtabs-domains-grid">
              {filteredDomains.map((domain) => {
                const DomainIcon = domain.icon;
                const isCurrentTab = activeTab === domain.id;

                return (
                  <div key={domain.id} className={`subtabs-domain-card ${isCurrentTab ? 'is-current-tab' : ''}`}>
                    <div className="domain-card-header">
                      <div className="dch-left">
                        <div className="domain-icon-wrap">
                          <DomainIcon size={16} />
                        </div>
                        <div>
                          <div className="domain-title-row">
                            <span className="domain-name">{domain.name}</span>
                            {isCurrentTab && <span className="domain-current-pill">CURRENT TAB</span>}
                          </div>
                          <span className="domain-tagline">{domain.tagline}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="domain-jump-btn"
                        onClick={() => {
                          onNavigate(domain.id);
                          onClose();
                        }}
                      >
                        <span>Open Tab</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>

                    <div className="domain-subtabs-list">
                      {domain.items.map((subTab) => {
                        const SubIcon = subTab.icon;
                        const isCurrentActive =
                          isCurrentTab && currentSubSection === subTab.id;

                        return (
                          <button
                            key={subTab.id}
                            type="button"
                            className={`subtab-launch-item ${isCurrentActive ? 'is-active-subtab' : ''}`}
                            onClick={() => {
                              onNavigate(domain.id, subTab.id);
                              onClose();
                            }}
                          >
                            <div className="sli-icon-box">
                              <SubIcon size={16} />
                            </div>

                            <div className="sli-meta">
                              <div className="sli-title-row">
                                <span className="sli-name">{subTab.name}</span>
                                {subTab.badge && (
                                  <span className={`sli-badge badge-${subTab.badgeType || 'default'}`}>
                                    {subTab.badge}
                                  </span>
                                )}
                                {isCurrentActive && (
                                  <span className="sli-active-pill">ACTIVE</span>
                                )}
                              </div>
                              <p className="sli-desc">{subTab.description}</p>
                            </div>

                            <ChevronRight size={14} className="sli-arrow" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── FOOTER HINT ── */}
        <div className="subtabs-menu-footer">
          <div className="smf-info">
            <Layers size={14} />
            <span>Click any sub-tab item above to instantly switch tabs and focus that module.</span>
          </div>
          <div className="smf-hints">
            <span>Press <kbd>Esc</kbd> to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
