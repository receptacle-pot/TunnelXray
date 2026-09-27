import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import './Findings.css';

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type FindingStatus = 'OPEN' | 'RESOLVED' | 'FALSE_POSITIVE';

export interface SecurityFinding {
  id: string;
  title: string;
  category: string;
  severity: FindingSeverity;
  status: FindingStatus;
  affectedTarget: string;
  cveId?: string;
  cvss: number;
  detectedAt: string;
  description: string;
}

export const INITIAL_FINDINGS: SecurityFinding[] = [
  {
    id: 'FND-01',
    title: 'Cryptographic AEAD Enforcement (NIST SP 800-77 §4.1)',
    category: 'Cryptographic Primitives',
    severity: 'INFO',
    status: 'RESOLVED',
    affectedTarget: 'Core Ingress Gateway (192.168.1.104)',
    cvss: 0.0,
    detectedAt: '2026-09-26 12:04:18 UTC',
    description: 'Modern AES-256-GCM authenticated encryption (128-bit ICV) confirmed across all inspected ESP child SAs.'
  },
  {
    id: 'FND-02',
    title: 'Sweet32 64-Bit Block Cipher Deprecation Check',
    category: 'Vulnerability Management',
    severity: 'HIGH',
    status: 'RESOLVED',
    affectedTarget: 'Branch Office Mumbai Gateway',
    cveId: 'CVE-2016-2183',
    cvss: 7.5,
    detectedAt: '2026-09-26 12:04:18 UTC',
    description: 'Pruned legacy 3DES-CBC and Blowfish proposals from transform policy. No 64-bit block collision risks observed.'
  },
  {
    id: 'FND-03',
    title: 'RFC 4303 64-Packet Anti-Replay Sliding Window Adherence',
    category: 'Integrity Protection',
    severity: 'INFO',
    status: 'RESOLVED',
    affectedTarget: 'Wireline Capture Stream (pcap-1.pcap)',
    cvss: 0.0,
    detectedAt: '2026-09-26 12:04:18 UTC',
    description: 'Evaluated 3,962 frames: zero out-of-order anomalies or duplicate sequence number injections recorded.'
  },
  {
    id: 'FND-04',
    title: 'Ephemeral Key Exchange (PFS) Lifetime Verification',
    category: 'Key Management',
    severity: 'LOW',
    status: 'RESOLVED',
    affectedTarget: 'AWS US-East VPC Transit Hub',
    cvss: 2.1,
    detectedAt: '2026-09-26 12:04:18 UTC',
    description: 'Curve25519 (Group 31) ephemeral DH active. SA rekey intervals strictly enforced below 3,600 seconds.'
  },
  {
    id: 'FND-05',
    title: 'X.509 RSA-PSS Digital Signature & Hash Digest Policy',
    category: 'Authentication',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    affectedTarget: 'Azure EU-Central Gateway',
    cvss: 4.3,
    detectedAt: '2026-09-26 12:04:18 UTC',
    description: 'SHA-384 digest signatures validated; SHA-1 and MD5 legacy algorithms completely rejected at handshakes.'
  }
];

interface FindingsProps {
  onSelectFinding?: (findingId: string) => void;
}

export function Findings({ onSelectFinding }: FindingsProps) {
  const [findings, setFindings] = useState<SecurityFinding[]>(INITIAL_FINDINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Toggle Status
  const handleToggleStatus = (id: string, newStatus: FindingStatus) => {
    setFindings(prev =>
      prev.map(f => (f.id === id ? { ...f, status: newStatus } : f))
    );
  };

  // Filtered List
  const filteredFindings = useMemo(() => {
    return findings.filter(f => {
      const matchesSearch =
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.affectedTarget.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.cveId && f.cveId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSeverity = severityFilter === 'ALL' || f.severity === severityFilter;
      const matchesCategory = categoryFilter === 'ALL' || f.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesCategory && matchesStatus;
    });
  }, [findings, searchTerm, severityFilter, categoryFilter, statusFilter]);

  // Counts
  const counts = useMemo(() => {
    return {
      total: findings.length,
      critical: findings.filter(f => f.severity === 'CRITICAL').length,
      high: findings.filter(f => f.severity === 'HIGH').length,
      medium: findings.filter(f => f.severity === 'MEDIUM').length,
      low: findings.filter(f => f.severity === 'LOW').length,
      open: findings.filter(f => f.status === 'OPEN').length,
      resolved: findings.filter(f => f.status === 'RESOLVED').length
    };
  }, [findings]);

  const categories = useMemo(() => {
    return Array.from(new Set(findings.map(f => f.category)));
  }, [findings]);

  return (
    <div className="findings-viewport">
      {/* ── HEADER BANNER ── */}
      <div className="findings-header-card">
        <div className="f-header-meta">
          <div className="f-header-badge">
            <ShieldAlert size={14} />
            <span>Vulnerability Management & Triage</span>
          </div>
          <div className="f-header-actions-row">
            <span className={`f-live-counter ${counts.open === 0 ? 'clean' : ''}`}>
              {counts.open > 0 ? `${counts.open} Open Action Items` : ''}
            </span>
          </div>
        </div>
        <div className="f-header-content">
          <div>
            <h2>Verified Security Findings Triage Table</h2>
            <p>
              Centralized triage and lifecycle tracking of verified cryptographic flaws, CVE mappings,
              weak transform proposals, and packet-level integrity alerts.
            </p>
          </div>

          <div className="f-stats-strip">
            <div className="f-stat-cell critical">
              <span className="f-num">{counts.critical > 0 ? counts.critical : ''}</span>
              <span className="f-lbl">Critical</span>
            </div>
            <div className="f-stat-cell high">
              <span className="f-num">{counts.high > 0 ? counts.high : ''}</span>
              <span className="f-lbl">High</span>
            </div>
            <div className="f-stat-cell medium">
              <span className="f-num">{counts.medium > 0 ? counts.medium : ''}</span>
              <span className="f-lbl">Medium</span>
            </div>
            <div className="f-stat-cell resolved">
              <span className="f-num">{counts.resolved > 0 ? counts.resolved : ''}</span>
              <span className="f-lbl">Resolved</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="findings-controls-bar">
        <div className="f-search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by ID, CVE, title, or SPI target..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="f-filters-group">
          {/* Severity Filter */}
          <div className="f-filter-item">
            <Filter size={14} />
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INFO">Info</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="f-filter-item">
            <SlidersHorizontal size={14} />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="f-filter-item">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open Only</option>
              <option value="RESOLVED">Resolved Only</option>
              <option value="FALSE_POSITIVE">False Positive</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── TRIAGE TABLE ── */}
      <div className="findings-table-card">
        <table className="findings-table">
          <thead>
            <tr>
              <th>Finding ID</th>
              <th>Severity</th>
              <th>CVSS</th>
              <th>Vulnerability Title & Affected Target</th>
              <th>Category</th>
              <th>CVE / CWE</th>
              <th>Status Action</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredFindings.map((finding) => (
              <tr key={finding.id} className={`finding-row ${finding.status.toLowerCase()}`}>
                {/* ID */}
                <td className="f-id-cell">
                  <code>{finding.id}</code>
                </td>

                {/* Severity */}
                <td>
                  <span className={`f-sev-badge ${finding.severity.toLowerCase()}`}>
                    {finding.severity}
                  </span>
                </td>

                {/* CVSS */}
                <td>
                  <span className={`f-cvss-score ${finding.cvss >= 7 ? 'danger' : finding.cvss >= 4 ? 'warning' : 'ok'}`}>
                    {finding.cvss > 0 ? finding.cvss.toFixed(1) : '—'}
                  </span>
                </td>

                {/* Title & Target */}
                <td className="f-main-cell">
                  <div className="f-title">{finding.title}</div>
                  <div className="f-target">
                    <span>Target:</span> <code>{finding.affectedTarget}</code>
                  </div>
                </td>

                {/* Category */}
                <td>
                  <span className="f-cat-badge">{finding.category}</span>
                </td>

                {/* CVE */}
                <td>
                  {finding.cveId ? (
                    <span className="f-cve-pill">
                      {finding.cveId}
                    </span>
                  ) : (
                    <span className="f-na">N/A</span>
                  )}
                </td>

                {/* Status Toggle */}
                <td>
                  <select
                    className={`status-select ${finding.status.toLowerCase()}`}
                    value={finding.status}
                    onChange={(e) => handleToggleStatus(finding.id, e.target.value as FindingStatus)}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="FALSE_POSITIVE">FALSE_POS</option>
                  </select>
                </td>

                {/* View Detail Action */}
                <td>
                  <button
                    type="button"
                    className="f-detail-btn"
                    title="View Forensic Drilldown"
                    onClick={() => onSelectFinding?.(finding.id)}
                  >
                    <Eye size={14} />
                    <span>Drilldown</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredFindings.length === 0 && (
          <div className="no-findings-box">
            <CheckCircle2 size={32} className="text-emerald-400" />
            <p>No vulnerabilities match your current search and filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
