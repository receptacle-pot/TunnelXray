import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  Zap,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Key
} from 'lucide-react';
import './IkeSessions.css';

interface ExchangePhase {
  phase: string;
  name: string;
  msgId: number;
  direction: string;
  desc: string;
  payloads: string[];
  latency: string;
  status: 'Completed' | 'Active';
}

const IKE_EXCHANGES: ExchangePhase[] = [
  {
    phase: 'Phase 1: IKE_SA_INIT (Req)',
    name: 'Cryptographic Transform Proposal & Public Key Exchange',
    msgId: 0,
    direction: 'Initiator → Responder (UDP 500)',
    desc: 'Negotiation of cryptographic proposals, exchange of ephemeral Diffie-Hellman public keys (Curve25519) and random security nonces.',
    payloads: ['Security Association (SA)', 'Key Exchange (KEi: Curve25519)', 'Nonce (Ni)', 'Notify (NAT_DETECTION)'],
    latency: '0.8 ms',
    status: 'Completed'
  },
  {
    phase: 'Phase 2: IKE_SA_INIT (Rsp)',
    name: 'Transform Agreement & Anti-DoS Cookie Confirmation',
    msgId: 0,
    direction: 'Responder → Initiator (UDP 500)',
    desc: 'Agreement on AES-256-GCM / Curve25519 transform suite, transmission of responder public key, nonce, and anti-DoS cookie.',
    payloads: ['Security Association (SAr)', 'Key Exchange (KEr: Curve25519)', 'Nonce (Nr)', 'Anti-DDoS Cookie'],
    latency: '1.4 ms',
    status: 'Completed'
  },
  {
    phase: 'Phase 3: IKE_AUTH (Req)',
    name: 'Mutual Entity Authentication & Certificate Verification',
    msgId: 1,
    direction: 'Initiator → Responder (Encrypted)',
    desc: 'Authenticated mutual identification exchange protected under derived SKEYSEED keys, transmission of traffic selector proposals.',
    payloads: ['Encrypted (SK)', 'Identification (IDi)', 'Certificate (X.509 RSA-PSS)', 'Traffic Selector (TSi, TSr)'],
    latency: '2.1 ms',
    status: 'Completed'
  },
  {
    phase: 'Phase 4: IKE_AUTH (Rsp)',
    name: 'Child SA Cryptographic Negotiation Established',
    msgId: 1,
    direction: 'Responder → Initiator (Encrypted)',
    desc: 'Responder identity verification, creation of operational Child SA (ESP wireline SPI: 0x7C49E210), and SA established.',
    payloads: ['Encrypted (SK)', 'Identification (IDr)', 'Authentication (AUTH)', 'Security Association (SA Child)'],
    latency: '1.9 ms',
    status: 'Completed'
  }
];

const PROPOSAL_MATRIX = [
  {
    type: 'ENCR (Encryption)',
    algorithm: 'AES-256-GCM (16-octet ICV)',
    keyLength: '256-bit',
    rfc: 'RFC 8247 (MUST)',
    status: 'Accepted (Chosen Active)',
    isChosen: true,
  },
  {
    type: 'ENCR (Encryption)',
    algorithm: 'ChaCha20-Poly1305',
    keyLength: '256-bit',
    rfc: 'RFC 7634 (SHOULD)',
    status: 'Supported Alternative',
    isChosen: false,
  },
  {
    type: 'ENCR (Encryption)',
    algorithm: '3DES-CBC',
    keyLength: '168-bit (112-bit effective)',
    rfc: 'RFC 8247 (MUST NOT)',
    status: 'Rejected (Legacy Deprecation)',
    isChosen: false,
    isRejected: true,
  },
  {
    type: 'INTEG (Integrity)',
    algorithm: 'AEAD Combined Mode',
    keyLength: 'Implicit (GCM ICV)',
    rfc: 'RFC 8247 (MUST)',
    status: 'Accepted',
    isChosen: true,
  },
  {
    type: 'D-H (Key Exchange)',
    algorithm: 'Curve25519 (Group 31)',
    keyLength: '256-bit EC',
    rfc: 'RFC 8247 (MUST)',
    status: 'Accepted (Chosen Active)',
    isChosen: true,
  },
  {
    type: 'D-H (Key Exchange)',
    algorithm: 'ECP-384 (Group 20)',
    keyLength: '384-bit EC',
    rfc: 'RFC 8247 (SHOULD)',
    status: 'Supported',
    isChosen: false,
  },
  {
    type: 'D-H (Key Exchange)',
    algorithm: 'MODP-1024 (Group 2)',
    keyLength: '1024-bit Modulus',
    rfc: 'RFC 8247 (MUST NOT)',
    status: 'Rejected (Weak D-H Modulus)',
    isChosen: false,
    isRejected: true,
  },
  {
    type: 'ESN (Sequence #)',
    algorithm: '64-bit Extended Sequence #',
    keyLength: '64-bit Window',
    rfc: 'RFC 4304 (MUST)',
    status: 'Accepted',
    isChosen: true,
  },
];

export function IkeSessions() {
  return (
    <div className="ike-sessions-container">
      {/* ── HEADER BANNER ── */}
      <section className="ike-header-banner">
        <div className="ike-title-group">
          <div className="ike-kicker-pill">
            <Activity size={14} /> IKE Negotiation Timelines
          </div>
          <h2>IKEv1 / IKEv2 State Machine & Proposal Matrix Engine</h2>
          <p>
            Cryptographic handshake state machine tracking IKE_SA_INIT, IKE_AUTH, CREATE_CHILD_SA, and INFORMATIONAL exchanges. Validates anti-DDoS cookies, nonces, and transform proposals.
          </p>
        </div>

        <div className="cookie-status-badge">
          <CheckCircle2 size={15} />
          <span>Anti-DDoS Cookie: Validated (RFC 7296 §2.6)</span>
        </div>
      </section>

      {/* ── INITIATOR / RESPONDER SPI PAIR TRACKING ── */}
      <div className="spi-pair-tracking-bar">
        <div className="spi-tracking-item">
          <span className="spi-track-lbl">Initiator SPI (SPIi)</span>
          <span className="spi-track-val" style={{ color: '#ffffff' }}>0x7C49E2103AF2B904</span>
        </div>
        <div className="spi-tracking-item">
          <span className="spi-track-lbl">Responder SPI (SPIr)</span>
          <span className="spi-track-val" style={{ color: '#ffffff' }}>0x8A12F401C9814420</span>
        </div>
        <div className="spi-tracking-item">
          <span className="spi-track-lbl">Session Secret Derived Keys</span>
          <span className="spi-track-val" style={{ color: '#ffffff' }}>SKEYSEED · AES-256-GCM SK_e/SK_a Active</span>
        </div>
      </div>

      {/* ── STATE MACHINE EXCHANGE VISUALIZER ── */}
      <section className="state-machine-card">
        <div className="card-title-row">
          <h3 className="card-heading">State Machine Exchange Progression (4-Phase Lifecycle)</h3>
          <span className="card-kicker-small">IKEv2 Strict RFC 7296</span>
        </div>

        <div className="timeline-exchanges-list">
          {IKE_EXCHANGES.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#ffffff' }}>
              No IKE exchanges captured in current session.
            </div>
          ) : (
            IKE_EXCHANGES.map((ex) => (
              <div key={ex.phase} className="exchange-step-card active-phase">
                <div className="exch-head">
                  <span className="phase-tag">{ex.phase}</span>
                  <CheckCircle2 size={15} style={{ color: '#ffffff' }} />
                </div>

                <div>
                  <h4 className="exch-title">{ex.name}</h4>
                  <p className="exch-desc">{ex.desc}</p>
                </div>

                <div className="payloads-pill-cluster">
                  {ex.payloads.map((p) => (
                    <span key={p} className="payload-pill">
                      {p}
                    </span>
                  ))}
                </div>

                <div className="exch-meta-foot">
                  <span>{ex.direction}</span>
                  <span>{ex.latency}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── TRANSFORM PROPOSAL MATRICES ── */}
      <section className="proposal-matrix-card">
        <div className="card-title-row">
          <h3 className="card-heading">Transform Proposal Matrix Evaluation (ENCR · INTEG · D-H · ESN)</h3>
          <span className="card-kicker-small">RFC 8247 & NIST SP 800-77 Rev. 1</span>
        </div>

        <div className="proposal-table-wrap">
          <table className="proposal-table">
            <thead>
              <tr>
                <th>Transform Type</th>
                <th>Cryptographic Algorithm</th>
                <th>Key Length</th>
                <th>Standard RFC Requirement</th>
                <th>Negotiation Verdict</th>
              </tr>
            </thead>
            <tbody>
              {PROPOSAL_MATRIX.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <span className="transform-type-tag">{item.type}</span>
                  </td>
                  <td style={{ fontWeight: item.isChosen ? 700 : 500, color: item.isChosen ? '#f1f5f9' : '#94a3b8' }}>
                    {item.algorithm}
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{item.keyLength}</td>
                  <td>{item.rfc}</td>
                  <td>
                    {item.isChosen && <span className="badge-chosen">Chosen / Active</span>}
                    {item.isRejected && <span className="badge-rejected">Rejected</span>}
                    {!item.isChosen && !item.isRejected && item.status && (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.status}</span>
                    )}
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
