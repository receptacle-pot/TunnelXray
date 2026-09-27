import React from 'react';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Cpu,
  Layers,
  FileCheck
} from 'lucide-react';
import './CryptoAnalysis.css';

const STANDARDS_RULES = [
  {
    primitive: 'AES-256-GCM',
    category: 'AEAD Cipher',
    rfc8221: 'MUST',
    rfc8247: 'MUST',
    nistSp80077: 'Compliant (Recommended)',
    status: 'Hardened AEAD',
    isProhibited: false,
    isDeprecated: false,
  },
  {
    primitive: 'ChaCha20-Poly1305',
    category: 'AEAD Cipher',
    rfc8221: 'SHOULD',
    rfc8247: 'SHOULD',
    nistSp80077: 'Compliant (Hardware/Mobile)',
    status: 'Hardened AEAD',
    isProhibited: false,
    isDeprecated: false,
  },
  {
    primitive: '3DES-CBC',
    category: 'Block Cipher',
    rfc8221: 'MUST NOT',
    rfc8247: 'MUST NOT',
    nistSp80077: 'Disallowed (Sweet32 Vulnerable)',
    status: 'Critical Deprecation',
    isProhibited: true,
    isDeprecated: true,
  },
  {
    primitive: 'DES / Blowfish',
    category: 'Block Cipher',
    rfc8221: 'MUST NOT',
    rfc8247: 'MUST NOT',
    nistSp80077: 'Prohibited',
    status: 'Strictly Prohibited',
    isProhibited: true,
    isDeprecated: true,
  },
  {
    primitive: 'Curve25519 (Group 31)',
    category: 'Key Exchange (DH)',
    rfc8221: 'N/A (ESP)',
    rfc8247: 'MUST',
    nistSp80077: 'Compliant (PFS Active)',
    status: 'Hardened DH',
    isProhibited: false,
    isDeprecated: false,
  },
  {
    primitive: 'MODP 1024-bit (Group 2)',
    category: 'Key Exchange (DH)',
    rfc8221: 'N/A (ESP)',
    rfc8247: 'MUST NOT',
    nistSp80077: 'Disallowed (Logjam Attack)',
    status: 'Weak DH Modulus',
    isProhibited: true,
    isDeprecated: true,
  },
  {
    primitive: 'HMAC-SHA1-96',
    category: 'Integrity (MAC)',
    rfc8221: 'MUST NOT',
    rfc8247: 'MUST NOT',
    nistSp80077: 'Prohibited',
    status: 'Deprecated Hash',
    isProhibited: true,
    isDeprecated: true,
  },
  {
    primitive: 'HMAC-MD5',
    category: 'Integrity (MAC)',
    rfc8221: 'MUST NOT',
    rfc8247: 'MUST NOT',
    nistSp80077: 'Prohibited',
    status: 'Cryptographically Broken',
    isProhibited: true,
    isDeprecated: true,
  },
];

export function CryptoAnalysis() {
  return (
    <div className="crypto-analysis-container">
      {/* ── HEADER BANNER ── */}
      <section className="crypto-header-banner">
        <div>
          <div className="crypto-kicker-pill">
            <Lock size={14} /> Cryptographic Security & RFC Standards
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            RFC 8247 · RFC 8221 · NIST SP 800-77 Rev. 1 Compliance Matrix
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '720px' }}>
            Automated compliance evaluation of authenticated encryption (AEAD), Diffie-Hellman modulus sizes, Perfect Forward Secrecy (PFS) validation, and immediate deprecation flags.
          </p>
        </div>

        <div className="standards-compliance-pill">
          <ShieldCheck size={16} />
          <span>Core Profile: 100% NIST SP 800-77 Rev. 1 Compliant</span>
        </div>
      </section>

      {/* ── 3 COMPLIANCE SPEC CARDS ── */}
      <section className="compliance-cards-grid">
        <div className="compliance-spec-card">
          <div className="spec-head">
            <span className="spec-code">RFC 8247</span>
            <CheckCircle2 size={16} style={{ color: '#ffffff' }} />
          </div>
          <h4 className="spec-title">IKEv2 Cryptographic Algorithms</h4>
          <p className="spec-desc">
            Mandates AES-256-GCM AEAD, Curve25519 (Group 31), and explicitly forbids 3DES-CBC, MD5, and MODP 1024-bit.
          </p>
          <div className="spec-status-row">
            <span>Status:</span>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Conformant</span>
          </div>
        </div>

        <div className="compliance-spec-card">
          <div className="spec-head">
            <span className="spec-code">RFC 8221</span>
            <CheckCircle2 size={16} style={{ color: '#ffffff' }} />
          </div>
          <h4 className="spec-title">ESP & AH Cryptographic Primitives</h4>
          <p className="spec-desc">
            Governs wireline Encapsulating Security Payload algorithms. Mandates authenticated encryption with 128-bit ICV tags.
          </p>
          <div className="spec-status-row">
            <span>Status:</span>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Conformant</span>
          </div>
        </div>

        <div className="compliance-spec-card">
          <div className="spec-head">
            <span className="spec-code">NIST SP 800-77 Rev. 1</span>
            <CheckCircle2 size={16} style={{ color: '#ffffff' }} />
          </div>
          <h4 className="spec-title">Guide to IPsec VPNs</h4>
          <p className="spec-desc">
            Mandates minimum 128-bit security strength for all cryptographic keys, strict PFS key rotation every 3600s, and Zero-Trust isolation.
          </p>
          <div className="spec-status-row">
            <span>Status:</span>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Hardened Profile</span>
          </div>
        </div>
      </section>

      {/* ── AUTOMATIC DEPRECATION & VULNERABILITY WARNINGS ── */}
      <section className="deprecation-flags-section">
        <div className="vuln-banner-item">
          <ShieldAlert size={20} className="v-icon" />
          <div className="v-content">
            <h4>Sweet32 Vulnerability Guard (CVE-2016-2183) — 64-Bit Block Cipher Warning</h4>
            <p>
              Legacy 64-bit block ciphers like 3DES and Blowfish succumb to birthday attacks after capturing 2^32 blocks (~32 GB). TunnelXray flags any legacy 3DES SA and mandates immediate migration to AES-256-GCM.
            </p>
          </div>
        </div>

        <div className="vuln-banner-item warning">
          <AlertTriangle size={20} className="v-icon" />
          <div className="v-content">
            <h4>Diffie-Hellman Group Deprecation Guard — Logjam (Weak DH) Prevention</h4>
            <p>
              MODP 768-bit and 1024-bit (Group 2) Diffie-Hellman groups can be precomputed by nation-state actors. Enforced minimum is Curve25519 (Group 31, 256-bit EC) or MODP 2048-bit (Group 14).
            </p>
          </div>
        </div>

        <div className="vuln-banner-item hardened">
          <ShieldCheck size={20} className="v-icon" />
          <div className="v-content">
            <h4>Modern AEAD & Perfect Forward Secrecy (PFS) Active</h4>
            <p>
              100% of core production SAs utilize AES-256-GCM or ChaCha20-Poly1305 with automatic rekeying every 3600s (100 GB). Compromise of long-term credentials cannot decrypt historical traffic.
            </p>
          </div>
        </div>
      </section>

      {/* ── FULL COMPLIANCE MATRIX TABLE ── */}
      <section className="crypto-matrix-card">
        <div className="card-title-row">
          <h3 className="card-heading">Algorithmic Compliance & Deprecation Standards</h3>
          <span className="card-kicker-small">NIST & IETF Cryptographic Registry</span>
        </div>

        <div className="c-table-wrap">
          <table className="c-table">
            <thead>
              <tr>
                <th>Cryptographic Primitive</th>
                <th>Category</th>
                <th>RFC 8221 (ESP)</th>
                <th>RFC 8247 (IKEv2)</th>
                <th>NIST SP 800-77 Status</th>
                <th>Evaluation Verdict</th>
              </tr>
            </thead>
            <tbody>
              {STANDARDS_RULES.map((rule, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: rule.isProhibited ? '#ef4444' : '#ffffff' }}>
                    {rule.primitive}
                  </td>
                  <td>{rule.category}</td>
                  <td>
                    {rule.rfc8221 === 'MUST' && <span className="pill-must">MUST</span>}
                    {rule.rfc8221 === 'MUST NOT' && <span className="pill-must-not">MUST NOT</span>}
                    {rule.rfc8221 === 'SHOULD' && <span style={{ color: '#ffffff' }}>SHOULD</span>}
                    {rule.rfc8221.includes('N/A') && <span style={{ color: '#94a3b8' }}>N/A</span>}
                  </td>
                  <td>
                    {rule.rfc8247 === 'MUST' && <span className="pill-must">MUST</span>}
                    {rule.rfc8247 === 'MUST NOT' && <span className="pill-must-not">MUST NOT</span>}
                    {rule.rfc8247 === 'SHOULD' && <span style={{ color: '#ffffff' }}>SHOULD</span>}
                  </td>
                  <td style={{ fontSize: '0.75rem' }}>{rule.nistSp80077}</td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: rule.isProhibited ? '#ef4444' : '#ffffff',
                      }}
                    >
                      ● {rule.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
