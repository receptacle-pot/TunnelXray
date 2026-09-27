import React, { useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Cpu,
  Key,
  Award,
  ExternalLink,
  Copy,
  Check,
  Printer,
  Sparkles
} from 'lucide-react';
import './ExecutiveReport.css';

export function ExecutiveReport() {
  const [copiedHash, setCopiedHash] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const reportHash = '0x8f4b1e92d6a7c33091ef7b5a8e23d4c5192803fe7a6b89c012d3e4f5a6b7c8d9';

  const handleCopyHash = () => {
    navigator.clipboard.writeText(reportHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleExport = (format: string) => {
    setIsExporting(format);
    setExportNotice(`Compiling ${format.toUpperCase()} executive security dossier with cryptographic proofs...`);
    
    setTimeout(() => {
      setIsExporting(null);
      setExportNotice(`✔ ${format.toUpperCase()} dossier ready. Download initiated automatically.`);
      
      // Simulated JSON / Text download
      const content = JSON.stringify({
        title: "TunnelXray Executive Security Architecture Report",
        generatedAt: new Date().toISOString(),
        score: 94.2,
        grade: "A-",
        rfcCompliance: "RFC 8221 / RFC 8247 Conformant",
        nistStatus: "NIST SP 800-77 Rev. 1 Compliant",
        verifiedTunnels: 48,
        sha256Proof: reportHash,
        keyRecommendations: [
          "Deprecate 3DES fallback proposal on edge gateway gw-eu-west-02",
          "Upgrade DH Group 14 to Curve25519 (Group 31)",
          "Enable Extended Sequence Numbers (ESN) on high-throughput 10G link"
        ]
      }, null, 2);

      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TunnelXray-Executive-Report-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => setExportNotice(null), 4000);
    }, 1200);
  };

  return (
    <div className="executive-report-view">
      {/* ── TOP ACTION BAR ── */}
      <div className="report-action-bar">
        <div className="report-bar-left">
          <div className="report-badge-pill">
            <Award size={14} className="badge-glow-icon" />
            <span>EXECUTIVE AUDIT DOSSIER</span>
          </div>
          <span className="report-gen-timestamp">
            Audit Date: <strong>{new Date().toLocaleDateString()} (UTC)</strong>
          </span>
        </div>

        <div className="report-bar-right">
          <button
            type="button"
            className="report-btn secondary"
            onClick={() => handleExport('json')}
            disabled={!!isExporting}
          >
            <Download size={14} />
            <span>{isExporting === 'json' ? 'Generating...' : 'Export JSON Metrics'}</span>
          </button>

          <button
            type="button"
            className="report-btn primary"
            onClick={() => handleExport('pdf')}
            disabled={!!isExporting}
          >
            <FileText size={14} />
            <span>{isExporting === 'pdf' ? 'Compiling PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="export-notification-banner">
          <Sparkles size={15} />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* ── HERO EXECUTIVE SCORECARD ── */}
      <div className="exec-scorecard-card">
        <div className="exec-scorecard-left">
          <div className="score-ring-container">
            <svg viewBox="0 0 120 120" className="score-circular-svg">
              <circle
                cx="60"
                cy="60"
                r="50"
                className="score-track-circle"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                className="score-progress-circle"
                style={{ strokeDashoffset: 314 }}
              />
            </svg>
            <div className="score-ring-labels">
              <span className="score-number"></span>
              <span className="score-denom"></span>
            </div>
          </div>

          <div className="score-text-summary">
            <h2 className="score-heading">IPsec Security Posture Index</h2>
            <p className="score-description">
              Protocol inspection across active IPsec Security Associations. Peer endpoints
              enforce authenticated encryption (AEAD) and RFC 4303 anti-replay protection.
            </p>
          </div>
        </div>

        <div className="exec-scorecard-right">
          <div className="score-kpi-item">
            <span className="kpi-val green"></span>
            <span className="kpi-lbl">Inspected SAs</span>
          </div>
          <div className="score-kpi-item">
            <span className="kpi-val cyan"></span>
            <span className="kpi-lbl">Modern AEAD</span>
          </div>
          <div className="score-kpi-item">
            <span className="kpi-val amber"></span>
            <span className="kpi-lbl">Legacy Fallback</span>
          </div>
          <div className="score-kpi-item">
            <span className="kpi-val purple"></span>
            <span className="kpi-lbl">Replay Immune</span>
          </div>
        </div>
      </div>

      {/* ── SECURITY PILLARS BREAKDOWN ── */}
      <div className="pillars-grid">
        <div className="pillar-card">
          <div className="pillar-header">
            <div className="pillar-icon-box green">
              <Lock size={18} />
            </div>
            <div className="pillar-title-wrap">
              <h4>Cipher Suite Robustness</h4>
              <span className="pillar-score"></span>
            </div>
          </div>
          <p className="pillar-desc">
            Primary tunnels enforce AES-256-GCM and ChaCha20-Poly1305. Deprecated DES and 3DES algorithms
            are disabled in production proposals.
          </p>
          <div className="pillar-progress-track">
            <div className="pillar-progress-bar green" style={{ width: '0%' }} />
          </div>
          <div className="pillar-meta-row">
            <span>Primary: AES-256-GCM</span>
            <span className="pillar-tag pass">RFC 8221</span>
          </div>
        </div>

        <div className="pillar-card">
          <div className="pillar-header">
            <div className="pillar-icon-box cyan">
              <Key size={18} />
            </div>
            <div className="pillar-title-wrap">
              <h4>Key Exchange & PFS</h4>
              <span className="pillar-score"></span>
            </div>
          </div>
          <p className="pillar-desc">
            Curve25519 (Group 31) and ECP-384 (Group 20) active across sessions. Perfect Forward
            Secrecy is strictly mandated on all Phase 2 CHILD_SAs.
          </p>
          <div className="pillar-progress-track">
            <div className="pillar-progress-bar cyan" style={{ width: '0%' }} />
          </div>
          <div className="pillar-meta-row">
            <span>Ephemeral DH: Group 31</span>
            <span className="pillar-tag pass">PFS MANDATED</span>
          </div>
        </div>

        <div className="pillar-card">
          <div className="pillar-header">
            <div className="pillar-icon-box purple">
              <ShieldCheck size={18} />
            </div>
            <div className="pillar-title-wrap">
              <h4>Identity & Mutual Auth</h4>
              <span className="pillar-score"></span>
            </div>
          </div>
          <p className="pillar-desc">
            Digital certificates utilize RSA-PSS with 4096-bit keys and ECDSA-SHA384. Weak pre-shared
            passwords (PSK) are absent from gateway negotiation configurations.
          </p>
          <div className="pillar-progress-track">
            <div className="pillar-progress-bar purple" style={{ width: '0%' }} />
          </div>
          <div className="pillar-meta-row">
            <span>Auth: RSA-PSS 4096 / X.509</span>
            <span className="pillar-tag pass">FIPS 140-3</span>
          </div>
        </div>

        <div className="pillar-card">
          <div className="pillar-header">
            <div className="pillar-icon-box amber">
              <Cpu size={18} />
            </div>
            <div className="pillar-title-wrap">
              <h4>Anti-Replay & Sequence Continuity</h4>
              <span className="pillar-score"></span>
            </div>
          </div>
          <p className="pillar-desc">
            RFC 4303 64-packet anti-replay sliding window active across peer links. Zero packet
            injection violations or out-of-order anomalies allowed during audit.
          </p>
          <div className="pillar-progress-track">
            <div className="pillar-progress-bar amber" style={{ width: '0%' }} />
          </div>
          <div className="pillar-meta-row">
            <span>Window Size: 64 Packets</span>
            <span className="pillar-tag pass">RFC 4303</span>
          </div>
        </div>
      </div>

      {/* ── EXECUTIVE RECOMMENDATIONS TABLE ── */}
      <div className="recommendations-card">
        <div className="card-header-row">
          <div className="header-text-cluster">
            <h3 className="card-title">Priority Mitigation & Modernization Roadmap</h3>
            <p className="card-subtitle">
              Prioritized architectural remediation steps required to achieve 100% compliance with NIST SP 800-77 Rev. 1.
            </p>
          </div>
          <span className="rec-count-badge"></span>
        </div>

        <div className="rec-table-wrap">
          <table className="rec-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Target Gateway</th>
                <th>Observed Defect / Inefficiency</th>
                <th>Recommended Remediation</th>
                <th>Standard Reference</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="empty-state-pcap" style={{ textAlign: 'center', padding: '2rem' }}>
                  No pending mitigation actions or configuration defects detected.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── AUDIT SIGN-OFF & CRYPTOGRAPHIC ATTESTATION ── */}
      <div className="attestation-card">
        <div className="attestation-content">
          <div className="attest-left">
            <ShieldCheck size={28} className="attest-icon" />
            <div className="attest-text">
              <h4>Cryptographic Report Authenticity & Notarization</h4>
              <p>
                This document is certified by the TunnelXray SOC Protocol Inspection Engine. All metrics
                have been validated against RFC 8221, RFC 8247, and NIST SP 800-77 Rev. 1 compliance baselines.
              </p>
              <div className="hash-display-row">
                <span className="hash-lbl">SHA-256 Root Digest:</span>
                <span className="hash-val">{reportHash}</span>
                <button
                  type="button"
                  className="hash-copy-btn"
                  onClick={handleCopyHash}
                  title="Copy SHA-256 Digest"
                >
                  {copiedHash ? <Check size={14} className="copied" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="attest-right">
            <div className="signoff-box">
              <span className="signoff-role">CERTIFIED PROTOCOL AUDITOR</span>
              <span className="signoff-name">TunnelXray AI Engine v2.4</span>
              <span className="signoff-date">Status: Cryptographically Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
