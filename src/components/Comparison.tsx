import React, { useState } from 'react';
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Fingerprint,
  Layers,
  Sliders,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import './Comparison.css';

interface CaptureMetadata {
  id: string;
  name: string;
  capturedAt: string;
  fileSize: string;
  totalPackets: number;
  sha256: string;
  compositeScore: number;
  ikeVersion: string;
  espCipher: string;
  dhGroup: string;
  pfsStatus: 'ACTIVE' | 'DISABLED';
  replayWindow: string;
  vulnerabilityCount: number;
}

const AVAILABLE_CAPTURES: CaptureMetadata[] = [
  {
    id: 'CAP-01',
    name: 'pcap-1.pcap (Production Wireline)',
    capturedAt: '2026-09-26 12:04:18 UTC',
    fileSize: '1.08 MB',
    totalPackets: 3962,
    sha256: '5d63962574f2ebf33610a26b80ea2e28b8d5d9d06156aea4d8f123d730a7d648',
    compositeScore: 98,
    ikeVersion: 'IKEv2 (RFC 7296)',
    espCipher: 'AES-256-GCM',
    dhGroup: 'Group 31 (Curve25519)',
    pfsStatus: 'ACTIVE',
    replayWindow: '64-Packet (ESN)',
    vulnerabilityCount: 0
  },
  {
    id: 'CAP-02',
    name: 'Staging Legacy Ingress (Pre-Migration)',
    capturedAt: '2026-09-15 08:30:00 UTC',
    fileSize: '840 KB',
    totalPackets: 2850,
    sha256: '8b99112fc7703810a905bc7291a938c201827461938201948201928472910482',
    compositeScore: 68,
    ikeVersion: 'IKEv1 / IKEv2',
    espCipher: '3DES-CBC / AES-CBC',
    dhGroup: 'Group 2 (MODP 1024)',
    pfsStatus: 'DISABLED',
    replayWindow: '32-Packet (No ESN)',
    vulnerabilityCount: 2
  },
  {
    id: 'CAP-03',
    name: 'Multi-Cloud Mesh Baseline (AWS-Az-GCP)',
    capturedAt: '2026-09-25 18:30:00 UTC',
    fileSize: '2.45 MB',
    totalPackets: 8940,
    sha256: 'f249018ca1092837401928471920384710293847192038471920384719203847',
    compositeScore: 99,
    ikeVersion: 'IKEv2 (RFC 7296)',
    espCipher: 'AES-256-GCM / Poly1305',
    dhGroup: 'Group 31 (Curve25519)',
    pfsStatus: 'ACTIVE',
    replayWindow: '64-Packet (ESN)',
    vulnerabilityCount: 0
  }
];

const EMPTY_CAPTURE: CaptureMetadata = {
  id: '',
  name: '',
  capturedAt: '',
  fileSize: '',
  totalPackets: 0,
  sha256: '',
  compositeScore: 0,
  ikeVersion: '',
  espCipher: '',
  dhGroup: '',
  pfsStatus: 'ACTIVE',
  replayWindow: '',
  vulnerabilityCount: 0
};

export function Comparison() {
  const [captureAId, setCaptureAId] = useState<string>('CAP-01');
  const [captureBId, setCaptureBId] = useState<string>('CAP-02');

  const captureA = AVAILABLE_CAPTURES.find(c => c.id === captureAId) || EMPTY_CAPTURE;
  const captureB = AVAILABLE_CAPTURES.find(c => c.id === captureBId) || EMPTY_CAPTURE;

  const hasBothCaptures = Boolean(captureA.id && captureB.id);
  const scoreDelta = hasBothCaptures ? (captureB.compositeScore - captureA.compositeScore).toFixed(1) : '';
  const scoreDeltaNum = scoreDelta ? Number(scoreDelta) : 0;
  const vulnDelta = hasBothCaptures ? captureB.vulnerabilityCount - captureA.vulnerabilityCount : 0;

  return (
    <div className="comparison-viewport">
      {/* ── HEADER BANNER ── */}
      <div className="comp-header-card">
        <div className="comp-header-meta">
          <div className="comp-header-badge">
            <GitCompare size={14} />
            <span>Differential Analysis & Drift Verification</span>
          </div>
          <span className="comp-delta-badge">
            Score Delta: {scoreDelta ? (scoreDeltaNum >= 0 ? `+${scoreDelta} Points` : `${scoreDelta} Points`) : ''}
          </span>
        </div>

        <div className="comp-header-content">
          <div>
            <h2>Side-by-Side PCAP Differential Analysis Engine</h2>
            <p>
              Compare two cryptographic network captures to detect configuration drift, cipher regressions,
              weak key exchange fallbacks, and anti-replay window state changes.
            </p>
          </div>
        </div>
      </div>

      {/* ── SELECTOR DUAL CARD ── */}
      <div className="captures-picker-grid">
        {/* Capture A */}
        <div className="cap-picker-card">
          <div className="cap-head">
            <span className="cap-tag a">Capture A (Baseline Reference)</span>
            <select
              value={captureAId}
              onChange={e => setCaptureAId(e.target.value)}
              className="cap-select"
            >
              {AVAILABLE_CAPTURES.length === 0 ? (
                <option value="">No captures loaded</option>
              ) : (
                AVAILABLE_CAPTURES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))
              )}
            </select>
          </div>

          <div className="cap-body">
            <h4 className="cap-name">{captureA.name}</h4>
            <div className="cap-meta-list">
              <div className="c-row">
                <span>Timestamp:</span>
                <strong>{captureA.capturedAt}</strong>
              </div>
              <div className="c-row">
                <span>Packets / Size:</span>
                <strong>{captureA.totalPackets ? `${captureA.totalPackets.toLocaleString()} pkts (${captureA.fileSize})` : ''}</strong>
              </div>
              <div className="c-row">
                <span>Composite Score:</span>
                <strong className="text-emerald-400 font-mono text-base">{captureA.compositeScore ? `${captureA.compositeScore.toFixed(1)} / 100` : ''}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* VS Indicator */}
        <div className="vs-divider">
          <div className="vs-circle">
            <ArrowRight size={18} />
          </div>
        </div>

        {/* Capture B */}
        <div className="cap-picker-card">
          <div className="cap-head">
            <span className="cap-tag b">Capture B (Audit Target)</span>
            <select
              value={captureBId}
              onChange={e => setCaptureBId(e.target.value)}
              className="cap-select"
            >
              {AVAILABLE_CAPTURES.length === 0 ? (
                <option value="">No captures loaded</option>
              ) : (
                AVAILABLE_CAPTURES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))
              )}
            </select>
          </div>

          <div className="cap-body">
            <h4 className="cap-name">{captureB.name}</h4>
            <div className="cap-meta-list">
              <div className="c-row">
                <span>Timestamp:</span>
                <strong>{captureB.capturedAt}</strong>
              </div>
              <div className="c-row">
                <span>Packets / Size:</span>
                <strong>{captureB.totalPackets ? `${captureB.totalPackets.toLocaleString()} pkts (${captureB.fileSize})` : ''}</strong>
              </div>
              <div className="c-row">
                <span>Composite Score:</span>
                <strong className={`font-mono text-base ${captureB.compositeScore >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {captureB.compositeScore ? `${captureB.compositeScore.toFixed(1)} / 100` : ''}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KEY DELTA METRIC SUMMARY CARDS ── */}
      <div className="deltas-summary-grid">
        <div className="delta-card">
          <span className="d-card-label">Security Score Delta</span>
          <div className="d-card-val-row">
            <span className={`d-card-num ${scoreDeltaNum >= 0 ? 'positive' : 'negative'}`}>
              {scoreDelta ? (scoreDeltaNum >= 0 ? `+${scoreDelta}` : scoreDelta) : ''}
            </span>
            {hasBothCaptures && (scoreDeltaNum >= 0 ? <TrendingUp size={18} className="text-emerald-400" /> : <TrendingDown size={18} className="text-red-400" />)}
          </div>
          <span className="d-card-sub">
            {hasBothCaptures ? (scoreDeltaNum === 0 ? 'Equal security posture' : scoreDeltaNum > 0 ? 'Security improvement' : 'Severe cryptographic regression') : ''}
          </span>
        </div>

        <div className="delta-card">
          <span className="d-card-label">Vulnerability Delta</span>
          <div className="d-card-val-row">
            <span className={`d-card-num ${vulnDelta <= 0 ? 'positive' : 'negative'}`}>
              {hasBothCaptures ? (vulnDelta > 0 ? `+${vulnDelta} New` : `${vulnDelta} Flaws`) : ''}
            </span>
            {hasBothCaptures && (vulnDelta <= 0 ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertTriangle size={18} className="text-red-400" />)}
          </div>
          <span className="d-card-sub">
            {hasBothCaptures ? (vulnDelta <= 0 ? 'Zero new vulnerabilities detected' : `${vulnDelta} new security findings introduced`) : ''}
          </span>
        </div>

        <div className="delta-card">
          <span className="d-card-label">Cipher Suite Drift</span>
          <div className="d-card-val-row">
            <span className="d-card-num text-sky-400">
              {hasBothCaptures ? (captureA.espCipher === captureB.espCipher ? 'Identical' : 'Regressed') : ''}
            </span>
          </div>
          <span className="d-card-sub font-mono">
            {hasBothCaptures ? (captureA.espCipher === captureB.espCipher ? 'Both enforce AES-256-GCM' : 'Fallback to 3DES / CBC detected') : ''}
          </span>
        </div>

        <div className="delta-card">
          <span className="d-card-label">Diffie-Hellman PFS Delta</span>
          <div className="d-card-val-row">
            <span className={`d-card-num ${captureB.pfsStatus === 'ACTIVE' ? 'positive' : 'negative'}`}>
              {hasBothCaptures ? (captureB.pfsStatus === 'ACTIVE' ? 'PFS Active' : 'PFS Disabled') : ''}
            </span>
          </div>
          <span className="d-card-sub">
            {hasBothCaptures ? (captureB.pfsStatus === 'ACTIVE' ? 'Perfect forward secrecy preserved' : 'Vulnerable to harvest-now-decrypt-later') : ''}
          </span>
        </div>
      </div>

      {/* ── GRANULAR SIDE-BY-SIDE PARAMETER TABLE ── */}
      <div className="diff-table-card">
        <div className="diff-table-head">
          <div className="dt-title">
            <Layers size={18} className="text-sky-400" />
            <div>
              <h3>Parameter-by-Parameter Differential Matrix</h3>
              <p>Auditable breakdown of protocol versions, transforms, and anti-replay mechanics.</p>
            </div>
          </div>
        </div>

        <table className="diff-table">
          <thead>
            <tr>
              <th>Security Attribute</th>
              <th>Capture A (Baseline)</th>
              <th>Capture B (Audit Target)</th>
              <th>Differential Verdict</th>
            </tr>
          </thead>
          <tbody>
            {!hasBothCaptures ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  No historical PCAP captures available for differential analysis.
                </td>
              </tr>
            ) : (
              <>
                <tr>
              <td><strong>IKE Protocol Version</strong></td>
              <td><code>{captureA.ikeVersion}</code></td>
              <td><code>{captureB.ikeVersion}</code></td>
              <td>
                {captureA.ikeVersion === captureB.ikeVersion ? (
                  <span className="verdict-tag match">Identical Protocol</span>
                ) : (
                  <span className="verdict-tag drift">Protocol Drift (IKEv1 Fallback)</span>
                )}
              </td>
            </tr>

            <tr>
              <td><strong>ESP Cipher Primitives</strong></td>
              <td><span className="font-mono text-emerald-400">{captureA.espCipher}</span></td>
              <td><span className={`font-mono ${captureB.espCipher.includes('3DES') ? 'text-red-400' : 'text-emerald-400'}`}>{captureB.espCipher}</span></td>
              <td>
                {captureA.espCipher === captureB.espCipher ? (
                  <span className="verdict-tag match">AEAD Maintained</span>
                ) : (
                  <span className="verdict-tag regression">Cipher Regression (Sweet32)</span>
                )}
              </td>
            </tr>

            <tr>
              <td><strong>Key Exchange (D-H Group)</strong></td>
              <td><span className="font-mono text-purple-400">{captureA.dhGroup}</span></td>
              <td><span className={`font-mono ${captureB.dhGroup.includes('Weak') ? 'text-red-400' : 'text-purple-400'}`}>{captureB.dhGroup}</span></td>
              <td>
                {captureA.dhGroup === captureB.dhGroup ? (
                  <span className="verdict-tag match">Elliptic Curve Match</span>
                ) : captureB.dhGroup.includes('Weak') ? (
                  <span className="verdict-tag regression">Logjam Weak DH Group</span>
                ) : (
                  <span className="verdict-tag match">Compatible EC Curve</span>
                )}
              </td>
            </tr>

            <tr>
              <td><strong>Perfect Forward Secrecy (PFS)</strong></td>
              <td>
                <span className="pfs-tag active">{captureA.pfsStatus}</span>
              </td>
              <td>
                <span className={`pfs-tag ${captureB.pfsStatus.toLowerCase()}`}>{captureB.pfsStatus}</span>
              </td>
              <td>
                {captureA.pfsStatus === captureB.pfsStatus ? (
                  <span className="verdict-tag match">PFS Verified</span>
                ) : (
                  <span className="verdict-tag regression">PFS Disabled (High Risk)</span>
                )}
              </td>
            </tr>

            <tr>
              <td><strong>Anti-Replay Protection</strong></td>
              <td><code>{captureA.replayWindow}</code></td>
              <td><code>{captureB.replayWindow}</code></td>
              <td>
                {captureA.replayWindow === captureB.replayWindow ? (
                  <span className="verdict-tag match">RFC 4303 Conformance</span>
                ) : (
                  <span className="verdict-tag drift">No Extended Sequence Numbers</span>
                )}
              </td>
            </tr>

                <tr>
                  <td><strong>SHA-256 Fingerprint</strong></td>
                  <td><code className="text-xs text-slate-400">{captureA.sha256.slice(0, 24)}...</code></td>
                  <td><code className="text-xs text-slate-400">{captureB.sha256.slice(0, 24)}...</code></td>
                  <td>
                    <span className="verdict-tag info">Unique Capture Fingerprint</span>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
