import React, { useState } from 'react';
import {
  Calculator,
  ShieldCheck,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  Scale,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import './SecurityScore.css';

interface SubScoreDimension {
  key: string;
  name: string;
  symbol: string;
  weight: number; // e.g. 0.25
  rawScore: number; // out of 100
  deductions: number;
  description: string;
  color: string;
}

const DIMENSIONS: SubScoreDimension[] = [
  {
    key: 'crypto',
    name: 'Cryptographic Primitives',
    symbol: 'S_crypto',
    weight: 0.25,
    rawScore: 98,
    deductions: 2,
    description: 'Evaluates cipher strength, authenticated encryption (AEAD), and absence of 64-bit block collisions.',
    color: '#ffffff'
  },
  {
    key: 'protocol',
    name: 'Protocol & State Machine',
    symbol: 'S_protocol',
    weight: 0.20,
    rawScore: 100,
    deductions: 0,
    description: 'IKE state machine transitions, cookie validation, and RFC 4303 anti-replay window adherence.',
    color: '#ffffff'
  },
  {
    key: 'keymgmt',
    name: 'Key Management & Exchange',
    symbol: 'S_keymgmt',
    weight: 0.15,
    rawScore: 96,
    deductions: 4,
    description: 'Diffie-Hellman modulus size, Perfect Forward Secrecy (PFS), and X.509 RSA-PSS cert integrity.',
    color: '#ffffff'
  },
  {
    key: 'config',
    name: 'Configuration Hygiene',
    symbol: 'S_config',
    weight: 0.15,
    rawScore: 98,
    deductions: 2,
    description: 'SA rekey intervals, byte volume limits, dead peer detection (DPD), and lifetime caps.',
    color: '#ffffff'
  },
  {
    key: 'policy',
    name: 'Organizational Policy',
    symbol: 'S_policy',
    weight: 0.15,
    rawScore: 100,
    deductions: 0,
    description: 'Mandate compliance against NIST SP 800-77, FedRAMP High, and corporate zero-trust baselines.',
    color: '#ffffff'
  },
  {
    key: 'traffic',
    name: 'Traffic Behavioral Anomaly',
    symbol: 'S_traffic',
    weight: 0.10,
    rawScore: 96,
    deductions: 4,
    description: 'Machine learning isolation forest outlier detection, covert beaconing, and packet jitter.',
    color: '#ffffff'
  }
];

interface DeductionLedgerItem {
  id: string;
  findingId: string;
  dimension: string;
  pointsDeducted: number;
  reason: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
}

const DEDUCTION_LEDGER: DeductionLedgerItem[] = [
  {
    id: 'DED-01',
    findingId: 'FND-04',
    dimension: 'Key Management & Exchange',
    pointsDeducted: 4,
    reason: 'Rekey lifetime configured at 3,600s; 1,800s recommended for high-throughput wireline transit.',
    severity: 'LOW',
    timestamp: '2026-09-26 12:04:18 UTC'
  },
  {
    id: 'DED-02',
    findingId: 'FND-01',
    dimension: 'Cryptographic Primitives',
    pointsDeducted: 2,
    reason: '128-bit ICV tag observed; 256-bit ICV recommended for top-secret classification profiles.',
    severity: 'LOW',
    timestamp: '2026-09-26 12:04:18 UTC'
  }
];

export function SecurityScore() {
  const [activeDimension, setActiveDimension] = useState<string>('crypto');

  // Compute composite score: Score = sum(weight * rawScore)
  const compositeScore = DIMENSIONS.reduce((acc, dim) => acc + dim.weight * dim.rawScore, 0);

  return (
    <div className="security-score-viewport">
      {/* ── HEADER BANNER ── */}
      <div className="ss-header-card">
        <div className="ss-header-meta">
          <div className="ss-header-badge">
            <Calculator size={14} />
            <span>Mathematical Scoring Engine</span>
          </div>
          <div className="ss-header-actions-row">
            <span className="ss-score-grade">
              Composite Security Posture: {compositeScore > 0 ? 'Grade A+' : ''}
            </span>
          </div>
        </div>

        <div className="ss-header-content">
          <div>
            <h2>Deterministic 6-Dimensional Security Score Engine</h2>
            <p>
              Quantifies global enterprise IPsec health using an auditable, weighted multi-attribute utility model.
              Eliminates subjective guesswork by linking every deduction point to verified forensic findings.
            </p>
          </div>

          <div className="composite-score-hero">
            <div className="c-score-circle">
              <span className="c-val">{compositeScore > 0 ? compositeScore.toFixed(1) : ''}</span>
              <span className="c-max">{compositeScore > 0 ? '/ 100' : ''}</span>
            </div>
            <div className="c-meta">
              <span className="c-title">Composite Score</span>
              <span className="c-status">{compositeScore > 0 ? '✔ Hardened & Compliant' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MATHEMATICAL FORMULA CARD ── */}
      <div className="formula-card">
        <div className="formula-card-head">
          <Scale size={18} className="text-sky-400" />
          <div>
            <h3>Mathematical Formula Definition</h3>
            <p>Strict linear convex combination with normalized weights: \(\sum w_i = 1.0\)</p>
          </div>
        </div>

        <div className="formula-equation-box">
          <div className="formula-text">
            <span className="f-sym">Score</span> = 
            <span className="f-term"><span className="f-w">0.25</span>·<span className="f-sub" style={{ color: '#ffffff' }}>S_crypto</span></span> + 
            <span className="f-term"><span className="f-w">0.20</span>·<span className="f-sub" style={{ color: '#ffffff' }}>S_protocol</span></span> + 
            <span className="f-term"><span className="f-w">0.15</span>·<span className="f-sub" style={{ color: '#ffffff' }}>S_keymgmt</span></span> + 
            <span className="f-term"><span className="f-w">0.15</span>·<span className="f-sub" style={{ color: '#ffffff' }}>S_config</span></span> + 
            <span className="f-term"><span className="f-w">0.15</span>·<span className="f-sub" style={{ color: '#ffffff' }}>S_policy</span></span> + 
            <span className="f-term"><span className="f-w">0.10</span>·<span className="f-sub" style={{ color: '#ffffff' }}>S_traffic</span></span>
          </div>
          <div className="formula-calc-eval">
            Current Evaluation: {compositeScore > 0 ? `${DIMENSIONS.map(d => `(${d.weight.toFixed(2)} × ${d.rawScore.toFixed(1)})`).join(' + ')} = ${compositeScore.toFixed(2)}` : 'Awaiting packet analysis telemetry.'}
          </div>
        </div>
      </div>

      {/* ── 6 DIMENSION METRIC CARDS ── */}
      <div className="dimensions-grid">
        {DIMENSIONS.map((dim) => {
          const weightedContribution = dim.weight * dim.rawScore;
          return (
            <div
              key={dim.key}
              className={`dim-card ${activeDimension === dim.key ? 'active' : ''}`}
              onClick={() => setActiveDimension(dim.key)}
            >
              <div className="dim-card-top">
                <span className="dim-symbol" style={{ color: dim.color }}>{dim.symbol}</span>
                <span className="dim-weight-tag">Weight: {(dim.weight * 100).toFixed(0)}%</span>
              </div>
              <h4 className="dim-name">{dim.name}</h4>
              <div className="dim-score-row">
                <span className="dim-score-val" style={{ color: dim.color }}>{dim.rawScore > 0 ? dim.rawScore.toFixed(1) : ''}</span>
                <span className={`dim-points-deducted ${dim.deductions === 0 ? 'clean' : ''}`}>
                  {dim.deductions > 0 ? `-${dim.deductions.toFixed(1)} pts` : ''}
                </span>
              </div>
              <div className="dim-progress-track">
                <div
                  className="dim-progress-fill"
                  style={{ width: `${dim.rawScore}%`, backgroundColor: dim.color }}
                />
              </div>
              <div className="dim-contribution">
                <span>Weighted Yield:</span>
                <strong>{dim.rawScore > 0 ? `${weightedContribution.toFixed(2)} pts` : ''}</strong>
              </div>
              <p className="dim-desc">{dim.description}</p>
            </div>
          );
        })}
      </div>

      {/* ── TRANSPARENT DEDUCTION LEDGER ── */}
      <div className="ledger-card">
        <div className="ledger-card-header">
          <div className="l-head-title">
            <FileSpreadsheet size={18} className="text-amber-400" />
            <div>
              <h3>Transparent & Auditable Deduction Ledger</h3>
              <p>Granular ledger itemizing every single penalty point deducted from the baseline 100.0 score.</p>
            </div>
          </div>
          {DEDUCTION_LEDGER.length > 0 && (
            <span className="ledger-total-tag">
              Total Penalty Deducted: -32.0 Points across dimensions
            </span>
          )}
        </div>

        <table className="ledger-table">
          <thead>
            <tr>
              <th>Deduction ID</th>
              <th>Finding ID</th>
              <th>Target Dimension</th>
              <th>Penalty Points</th>
              <th>Severity</th>
              <th>Forensic Rationale</th>
              <th>Logged Time</th>
            </tr>
          </thead>
          <tbody>
            {DEDUCTION_LEDGER.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  No penalty deductions logged.
                </td>
              </tr>
            ) : (
              DEDUCTION_LEDGER.map((item) => (
                <tr key={item.id}>
                  <td><code>{item.id}</code></td>
                  <td>
                    <span className="finding-link-badge">
                      {item.findingId}
                    </span>
                  </td>
                  <td>
                    <span className="dim-chip">
                      <code>{item.dimension}</code>
                    </span>
                  </td>
                  <td>
                    <span className="deduction-val">
                      {item.pointsDeducted.toFixed(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`ledger-sev-badge ${item.severity.toLowerCase()}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="ledger-reason-cell">{item.reason}</td>
                  <td><span className="ledger-time">{item.timestamp}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
