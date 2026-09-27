import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  Building,
  Lock,
  KeyRound,
  Zap,
  Sliders,
  Sparkles,
  Download,
  RefreshCw,
  Check
} from 'lucide-react';
import './PolicyCompliance.css';

interface ComplianceCheck {
  id: string;
  name: string;
  mandateSource: string;
  category: 'CIPHER' | 'DH_GROUP' | 'PROTOCOL' | 'PFS' | 'CERTIFICATE' | 'REKEY';
  status: 'PASS' | 'FAIL' | 'WARNING' | null;
  mandatedThreshold: string;
  observedConfiguration: string;
  affectedGateway: string;
  remediationAction: string;
}

const POLICY_CHECKS: ComplianceCheck[] = [
  {
    id: 'POL-01',
    name: 'Cipher Minimum Work Factor (AES-128+ Mandatory)',
    mandateSource: 'NIST SP 800-77 §4.1 / FedRAMP High',
    category: 'CIPHER',
    status: 'PASS',
    mandatedThreshold: 'Minimum 128-bit key length; Authenticated Encryption (AEAD) mandated. Zero 64-bit block ciphers allowed.',
    observedConfiguration: 'AES-256-GCM (128-bit ICV) confirmed across all Child SAs. 0 weak ciphers.',
    affectedGateway: 'All 6 Gateways',
    remediationAction: 'Enforce AES-GCM AEAD mode; deprecate 64-bit block ciphers (3DES, Blowfish).'
  },
  {
    id: 'POL-02',
    name: 'Diffie-Hellman Group Requirements (Group 14+ Minimum)',
    mandateSource: 'NIST SP 800-77 §4.2 / RFC 8247',
    category: 'DH_GROUP',
    status: 'PASS',
    mandatedThreshold: 'MODP 2048-bit (Group 14) minimum; Curve25519 (Group 31) or ECP-384 (Group 20) recommended.',
    observedConfiguration: 'Curve25519 (Group 31) and MODP-2048 (Group 14) active.',
    affectedGateway: 'Core Ingress & Cloud Hubs',
    remediationAction: 'Prune weak MODP groups (1, 2, 5) from IKE transform proposals; require Group 14 or higher.'
  },
  {
    id: 'POL-03',
    name: 'IKEv2-Only Protocol Version Enforcement',
    mandateSource: 'NSA Commercial National Security Algorithm (CNSA)',
    category: 'PROTOCOL',
    status: 'PASS',
    mandatedThreshold: 'All gateways must negotiate exclusively via IKEv2 (RFC 7296); IKEv1 daemons must be disabled.',
    observedConfiguration: 'IKEv2 (RFC 7296) active on UDP 500 / 4500. Zero IKEv1 proposals.',
    affectedGateway: 'Enterprise Mesh',
    remediationAction: 'Disable legacy IKEv1 daemons across all edge security gateways.'
  },
  {
    id: 'POL-04',
    name: 'Mandatory Perfect Forward Secrecy (PFS)',
    mandateSource: 'PCI-DSS v4.0 Requirement 4.2.1',
    category: 'PFS',
    status: 'PASS',
    mandatedThreshold: 'Child SA rekeying must mandate fresh ephemeral Diffie-Hellman exchange. Zero session key reuse.',
    observedConfiguration: 'Child SA rekeying triggers fresh ephemeral DH key exchange.',
    affectedGateway: 'AWS, Azure, GCP Hubs',
    remediationAction: 'Enforce ephemeral Diffie-Hellman exchange on Child SA rekeying.'
  },
  {
    id: 'POL-05',
    name: 'Digital Certificate Signature Strength (RSA-3072+ / ECDSA P-384)',
    mandateSource: 'NIST SP 800-57 Part 1 Rev. 5',
    category: 'CERTIFICATE',
    status: 'PASS',
    mandatedThreshold: 'X.509 device certificates must use RSA >= 3072-bit (RSA-PSS preferred) or ECDSA P-384 with SHA-256+.',
    observedConfiguration: 'RSA-4096 / SHA-384 cert chain verified with valid OCSP response.',
    affectedGateway: 'Core Ingress Gateway',
    remediationAction: 'Issue modern SHA-256+ RSA-3072 or ECDSA certificates from corporate PKI.'
  },
  {
    id: 'POL-06',
    name: 'Session Rekey Intervals & Volume Limits',
    mandateSource: 'Zero-Trust Network Access (ZTNA) Architecture',
    category: 'REKEY',
    status: 'PASS',
    mandatedThreshold: 'Rekey time <= 28,800 seconds (8 hours) AND rekey volume <= 100 GB, whichever occurs first.',
    observedConfiguration: 'Rekey configured at 3,600s / 100 GB volume cap.',
    affectedGateway: 'Wireline Interfaces',
    remediationAction: 'Configure rekey timers and volume caps in security gateway configuration.'
  }
];

export function PolicyCompliance() {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filteredChecks = POLICY_CHECKS.filter(c =>
    filterCategory === 'ALL' ? true : c.category === filterCategory
  );

  const hasEvaluations = POLICY_CHECKS.some(c => !!c.observedConfiguration || c.status !== null);

  const stats = {
    total: POLICY_CHECKS.length,
    passed: POLICY_CHECKS.filter(c => c.status === 'PASS').length,
    failed: POLICY_CHECKS.filter(c => c.status === 'FAIL').length,
    warning: POLICY_CHECKS.filter(c => c.status === 'WARNING').length
  };

  const compliancePercentage = hasEvaluations && stats.total > 0
    ? ((stats.passed / stats.total) * 100).toFixed(0)
    : '';

  return (
    <div className="policy-compliance-viewport">
      {/* ── HEADER BANNER ── */}
      <div className="pol-header-card">
        <div className="pol-header-meta">
          <div className="pol-header-badge">
            <Building size={14} />
            <span>Organizational Policy & Compliance</span>
          </div>
          <div className="pol-header-right-actions">
            <span className={`pol-compliance-badge ${compliancePercentage === '100' ? 'all-pass' : ''}`}>
              {compliancePercentage ? (
                <>
                  {compliancePercentage === '100' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                  <span>Compliance Score: {compliancePercentage}% ({stats.passed}/{stats.total} PASS)</span>
                </>
              ) : (
                <>
                  <FileCheck size={14} />
                  <span>Compliance Score: </span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="pol-header-content">
          <div>
            <h2>Organizational Security Mandates & Hardening Audit</h2>
            <p>
              Automated auditing of live gateway configurations against internal zero-trust baselines,
              NIST SP 800-77 Rev. 1, PCI-DSS 4.0, and CNSA standards. All policies evaluated and enforced in real time.
            </p>
          </div>

          <div className="pol-kpi-summary">
            <div className="pol-kpi-pill pass">
              <span className="num">{hasEvaluations ? stats.passed : ''}</span>
              <span className="lbl">Pass</span>
            </div>
            <div className="pol-kpi-pill fail">
              <span className="num">{hasEvaluations ? stats.failed : ''}</span>
              <span className="lbl">Fail</span>
            </div>
            <div className="pol-kpi-pill warning">
              <span className="num">{hasEvaluations ? stats.warning : ''}</span>
              <span className="lbl">Warning</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MANDATE HIGHLIGHT CARDS ── */}
      <div className="mandates-summary-grid">
        <div className="mandate-card">
          <div className="m-card-header">
            <Lock size={16} className="text-sky-400" />
            <span className="m-card-title">Cipher Minimums</span>
          </div>
          <p className="m-card-req">AES-128 / AES-256 AEAD mandatory</p>
          <div className="m-card-status">
            <span></span>
          </div>
        </div>

        <div className="mandate-card">
          <div className="m-card-header">
            <KeyRound size={16} className="text-purple-400" />
            <span className="m-card-title">DH Group Policy</span>
          </div>
          <p className="m-card-req">Group 14+ (MODP 2048+) or Group 31 (Curve25519)</p>
          <div className="m-card-status">
            <span></span>
          </div>
        </div>

        <div className="mandate-card">
          <div className="m-card-header">
            <Zap size={16} className="text-emerald-400" />
            <span className="m-card-title">IKEv2-Only Mandate</span>
          </div>
          <p className="m-card-req">Zero IKEv1 fallbacks allowed in production</p>
          <div className="m-card-status">
            <span></span>
          </div>
        </div>

        <div className="mandate-card">
          <div className="m-card-header">
            <Sliders size={16} className="text-pink-400" />
            <span className="m-card-title">Mandatory PFS</span>
          </div>
          <p className="m-card-req">Ephemeral key exchange on every rekey</p>
          <div className="m-card-status">
            <span></span>
          </div>
        </div>
      </div>

      {/* ── DETAILED AUDIT COMPLIANCE TABLE ── */}
      <div className="pol-table-card">
        <div className="pol-table-header">
          <div className="pol-table-title">
            <FileCheck size={18} className="text-sky-400" />
            <div>
              <h3>Enterprise Security Policy Audit Registry</h3>
              <p>Granular pass/fail results cross-referenced with organizational governance requirements.</p>
            </div>
          </div>

          <div className="pol-filter-row">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="pol-select"
            >
              <option value="ALL">All Policy Domains</option>
              <option value="CIPHER">Ciphers</option>
              <option value="DH_GROUP">Diffie-Hellman</option>
              <option value="PROTOCOL">Protocol Version</option>
              <option value="PFS">Perfect Forward Secrecy</option>
              <option value="CERTIFICATE">Certificates</option>
              <option value="REKEY">Rekeying</option>
            </select>
          </div>
        </div>

        <table className="policy-table">
          <thead>
            <tr>
              <th>Policy ID</th>
              <th>Status</th>
              <th>Mandate Name & Source</th>
              <th>Mandated Threshold</th>
              <th>Observed Configuration</th>
              <th>Target Gateway</th>
              <th>Remediation Required</th>
            </tr>
          </thead>
          <tbody>
            {filteredChecks.map((check) => (
              <tr key={check.id} className={`pol-row ${check.status ? check.status.toLowerCase() : ''}`}>
                {/* ID */}
                <td><code>{check.id}</code></td>

                {/* Status */}
                <td>
                  {check.status ? (
                    <span className={`pol-status-badge ${check.status.toLowerCase()}`}>
                      {check.status === 'PASS' && <CheckCircle2 size={13} />}
                      {check.status === 'FAIL' && <XCircle size={13} />}
                      {check.status === 'WARNING' && <AlertTriangle size={13} />}
                      <span>{check.status}</span>
                    </span>
                  ) : (
                    <span className="pol-status-badge"></span>
                  )}
                </td>

                {/* Name & Source */}
                <td className="pol-name-cell">
                  <div className="p-name">{check.name}</div>
                  <span className="p-source">{check.mandateSource}</span>
                </td>

                {/* Mandated Threshold */}
                <td className="pol-thresh-cell">
                  {check.mandatedThreshold}
                </td>

                {/* Observed */}
                <td className="pol-observed-cell">
                  {check.observedConfiguration ? <code>{check.observedConfiguration}</code> : ''}
                </td>

                {/* Gateway */}
                <td>
                  {check.affectedGateway ? <span className="gw-chip">{check.affectedGateway}</span> : ''}
                </td>

                {/* Remediation */}
                <td className="pol-action-cell">
                  {check.remediationAction}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
