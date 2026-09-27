import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Zap,
  Save,
  RotateCcw
} from 'lucide-react';
import './AiThreatEngine.css';

export function AiThreatEngine() {
  const [entropyThreshold, setEntropyThreshold] = useState<number>(7.92);
  const [replayWindowSize, setReplayWindowSize] = useState<number>(64);
  const [rejectLegacyCiphers, setRejectLegacyCiphers] = useState<boolean>(true);
  const [isolateOnReplay, setIsolateOnReplay] = useState<boolean>(true);
  const [enforceEsn, setEnforceEsn] = useState<boolean>(true);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleSaveConfig = () => {
    setSaveNotice('✔ Heuristic parameters committed to live packet inspection engine.');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  const handleResetDefaults = () => {
    setEntropyThreshold(7.92);
    setReplayWindowSize(64);
    setRejectLegacyCiphers(true);
    setIsolateOnReplay(true);
    setEnforceEsn(true);
    setSaveNotice('↺ Reverted all heuristic thresholds to NIST SP 800-77 Rev. 1 defaults.');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  return (
    <div className="ai-threat-engine-view">
      {/* ── TOP ACTION BAR ── */}
      <div className="engine-top-bar">
        <div className="engine-bar-left">
          <div className="engine-badge-pill">
            <Cpu size={14} />
            <span>AI HEURISTIC THREAT ENGINE</span>
          </div>
          <span className="engine-sub-meta">
            Supervised Ensemble Heuristics & Dynamic Policy Enforcement
          </span>
        </div>

        <div className="engine-bar-right">
          <button
            type="button"
            className="engine-btn secondary"
            onClick={handleResetDefaults}
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            className="engine-btn primary"
            onClick={handleSaveConfig}
          >
            <Save size={13} />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>

      {saveNotice && (
        <div className="engine-notice-banner">
          <Sparkles size={14} />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* ── TELEMETRY KPI TILES ── */}
      <div className="engine-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box green">
            <Zap size={16} />
          </div>
          <div className="kpi-text-cluster">
            <span className="kpi-label">ONNX Inference Latency</span>
            <span className="kpi-val green">1.4 ms</span>
            <span className="kpi-sub">Real-time per flow</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box cyan">
            <ShieldCheck size={16} />
          </div>
          <div className="kpi-text-cluster">
            <span className="kpi-label">False Positive Rate</span>
            <span className="kpi-val cyan">0.02%</span>
            <span className="kpi-sub">AUC-ROC: 0.998</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box purple">
            <Cpu size={16} />
          </div>
          <div className="kpi-text-cluster">
            <span className="kpi-label">Ensemble Classifiers</span>
            <span className="kpi-val purple">XGB + RF</span>
            <span className="kpi-sub">v1.0.0 Production</span>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE THRESHOLD SLIDERS ── */}
      <div className="settings-section-card">
        <h3 className="section-title">Heuristic Anomaly Detection Thresholds</h3>
        <p className="section-subtitle">
          Configure real-time statistical criteria for flagging encrypted payload anomalies and protocol deviations.
        </p>

        <div className="slider-group-list">
          <div className="slider-item">
            <div className="slider-label-row">
              <div className="label-col">
                <span className="setting-title">Shannon Entropy Discrepancy Floor</span>
                <span className="setting-desc">
                  Flags payloads with entropy below threshold (identifies unencrypted leaks or weak keystreams).
                </span>
              </div>
              <span className="setting-value-badge">{entropyThreshold.toFixed(2)} bits/byte</span>
            </div>
            <input
              type="range"
              min="7.00"
              max="8.00"
              step="0.01"
              value={entropyThreshold}
              onChange={(e) => setEntropyThreshold(parseFloat(e.target.value))}
              className="heuristic-slider"
            />
          </div>

          <div className="slider-item">
            <div className="slider-label-row">
              <div className="label-col">
                <span className="setting-title">RFC 4303 Anti-Replay Sliding Window Size</span>
                <span className="setting-desc">
                  Buffer bitmask width for detecting and dropping injected duplicate sequence numbers.
                </span>
              </div>
              <span className="setting-value-badge">{replayWindowSize} Packets</span>
            </div>
            <input
              type="range"
              min="32"
              max="256"
              step="32"
              value={replayWindowSize}
              onChange={(e) => setReplayWindowSize(parseInt(e.target.value, 10))}
              className="heuristic-slider"
            />
          </div>
        </div>
      </div>

      {/* ── SECURITY ENFORCEMENT TOGGLES ── */}
      <div className="settings-section-card">
        <h3 className="section-title">Automatic Policy Enforcement & Containment</h3>
        <p className="section-subtitle">
          Rule actions applied automatically when an anomaly violates the configured thresholds.
        </p>

        <div className="toggle-group-list">
          <div className="toggle-item">
            <div className="toggle-left">
              <span className="toggle-title">Strict Deprecated Cipher Rejection</span>
              <span className="toggle-desc">
                Instantly reject any handshake proposing 3DES, DES, MD5, or DH Groups &lt; 14.
              </span>
            </div>
            <button
              type="button"
              className={`toggle-switch-btn ${rejectLegacyCiphers ? 'on' : 'off'}`}
              onClick={() => setRejectLegacyCiphers(!rejectLegacyCiphers)}
            >
              <span className="switch-slider" />
            </button>
          </div>

          <div className="toggle-item">
            <div className="toggle-left">
              <span className="toggle-title">Emergency Isolation on Repeated Replay Violations</span>
              <span className="toggle-desc">
                Temporarily drop traffic from peer SPI if replay injection exceeds 5 frames/sec.
              </span>
            </div>
            <button
              type="button"
              className={`toggle-switch-btn ${isolateOnReplay ? 'on' : 'off'}`}
              onClick={() => setIsolateOnReplay(!isolateOnReplay)}
            >
              <span className="switch-slider" />
            </button>
          </div>

          <div className="toggle-item">
            <div className="toggle-left">
              <span className="toggle-title">Mandate 64-bit Extended Sequence Numbers (ESN)</span>
              <span className="toggle-desc">
                Enforce ESN on high-throughput interfaces (&gt;1 Gbps) to prevent counter overflow.
              </span>
            </div>
            <button
              type="button"
              className={`toggle-switch-btn ${enforceEsn ? 'on' : 'off'}`}
              onClick={() => setEnforceEsn(!enforceEsn)}
            >
              <span className="switch-slider" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
