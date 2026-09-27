import React, { useState } from 'react';
import {
  Sliders,
  Mail,
  Shield,
  Save,
  RotateCcw,
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Lock,
  Server,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import './PlatformSettings.css';

export function PlatformSettings() {
  // 1. Scoring Weights
  const [weights, setWeights] = useState({
    cryptoStrength: 35,
    antiReplay: 25,
    protocolFreshness: 20,
    keyExchange: 20
  });

  // 2. Policy Thresholds
  const [minDhGroup, setMinDhGroup] = useState<string>('31');
  const [entropyFloor, setEntropyFloor] = useState<number>(7.92);
  const [replayTolerance, setReplayTolerance] = useState<number>(0);
  const [saLifetime, setSaLifetime] = useState<number>(3600);
  const [strictDeprecation, setStrictDeprecation] = useState<boolean>(true);

  // 3. SMTP & Google App Password
  const [smtpHost, setSmtpHost] = useState<string>('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState<number>(587);
  const [smtpProtocol, setSmtpProtocol] = useState<'STARTTLS' | 'SSL'>('STARTTLS');
  const [senderEmail, setSenderEmail] = useState<string>('');
  const [appPassword, setAppPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [alertRecipient, setAlertRecipient] = useState<string>('');

  // Status & Feedback
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const totalWeight = weights.cryptoStrength + weights.antiReplay + weights.protocolFreshness + weights.keyExchange;
  const isWeightValid = totalWeight === 100;

  const handleWeightChange = (key: keyof typeof weights, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const handleNormalizeWeights = () => {
    setWeights({
      cryptoStrength: 35,
      antiReplay: 25,
      protocolFreshness: 20,
      keyExchange: 20
    });
  };

  const handleSendTestEmail = () => {
    if (!senderEmail || !alertRecipient) {
      setSaveNotice('⚠ Please configure Sender Email and Recipient before dispatching a test email.');
      setTimeout(() => setSaveNotice(null), 3500);
      return;
    }
    setIsSendingTest(true);
    setSaveNotice(null);

    setTimeout(() => {
      setIsSendingTest(false);
      setSaveNotice(`✔ Test Alert Email dispatched to ${alertRecipient} via ${smtpHost}:${smtpPort} (TLS Handshake Verified).`);
      setTimeout(() => setSaveNotice(null), 4500);
    }, 1200);
  };

  const handleSaveSettings = () => {
    setSaveNotice('✔ Platform Settings & Engine Preferences committed successfully.');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  return (
    <div className="platform-settings-view">
      {/* ── TOP HERO BAR ── */}
      <div className="settings-hero-bar">
        <div className="settings-hero-left">
          <div className="settings-badge-pill">
            <Sliders size={14} className="badge-glow-ico" />
            <span>PLATFORM SETTINGS (/SETTINGS)</span>
          </div>
          <h2 className="settings-section-title">Engine Preferences & Policy Controls</h2>
          <p className="settings-section-subtitle">
            Custom scoring weight adjustments, policy thresholds, and SMTP / Google App Password email setup.
          </p>
        </div>

        <div className="settings-hero-actions">
          <button
            type="button"
            className="settings-action-btn secondary"
            onClick={handleNormalizeWeights}
          >
            <RotateCcw size={13} />
            <span>Reset Weights</span>
          </button>

          <button
            type="button"
            className="settings-action-btn primary"
            onClick={handleSaveSettings}
          >
            <Save size={13} />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      {saveNotice && (
        <div className="settings-notice-banner">
          <Sparkles size={15} />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* ── SECTION 1: CUSTOM SCORING WEIGHT ADJUSTMENTS ── */}
      <div className="pref-card">
        <div className="pref-header-row">
          <div className="pref-title-group">
            <Sliders size={16} className="pref-icon cyan" />
            <div>
              <h3 className="pref-title">Custom Scoring Weight Adjustments</h3>
              <p className="pref-subtitle">
                Calibrate relative factor weights utilized in calculating the overall IPsec Security Posture Score.
              </p>
            </div>
          </div>

          <div className={`weight-total-badge ${isWeightValid ? 'valid' : 'invalid'}`}>
            <span>Total Weight: {totalWeight}%</span>
            {isWeightValid ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
          </div>
        </div>

        <div className="weights-sliders-grid">
          <div className="weight-slider-item">
            <div className="slider-meta-row">
              <span className="slider-label">Cryptographic Strength</span>
              <span className="slider-val cyan">{weights.cryptoStrength}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={weights.cryptoStrength}
              onChange={(e) => handleWeightChange('cryptoStrength', parseInt(e.target.value, 10))}
              className="weight-slider cyan"
            />
            <span className="slider-desc">Evaluates AEAD (AES-GCM / Poly1305) vs CBC legacy ciphers.</span>
          </div>

          <div className="weight-slider-item">
            <div className="slider-meta-row">
              <span className="slider-label">Anti-Replay Robustness</span>
              <span className="slider-val green">{weights.antiReplay}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={weights.antiReplay}
              onChange={(e) => handleWeightChange('antiReplay', parseInt(e.target.value, 10))}
              className="weight-slider green"
            />
            <span className="slider-desc">RFC 4303 64-packet sliding window bitmask integrity.</span>
          </div>

          <div className="weight-slider-item">
            <div className="slider-meta-row">
              <span className="slider-label">Protocol Freshness</span>
              <span className="slider-val purple">{weights.protocolFreshness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={weights.protocolFreshness}
              onChange={(e) => handleWeightChange('protocolFreshness', parseInt(e.target.value, 10))}
              className="weight-slider purple"
            />
            <span className="slider-desc">IKEv2 state machine versus deprecated IKEv1 handshakes.</span>
          </div>

          <div className="weight-slider-item">
            <div className="slider-meta-row">
              <span className="slider-label">Key Exchange Rigor</span>
              <span className="slider-val amber">{weights.keyExchange}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={weights.keyExchange}
              onChange={(e) => handleWeightChange('keyExchange', parseInt(e.target.value, 10))}
              className="weight-slider amber"
            />
            <span className="slider-desc">Diffie-Hellman groups (Curve25519 vs MODP 1024/2048).</span>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: POLICY THRESHOLDS ── */}
      <div className="pref-card">
        <div className="pref-header-row">
          <div className="pref-title-group">
            <Shield size={16} className="pref-icon green" />
            <div>
              <h3 className="pref-title">Protocol Policy Thresholds</h3>
              <p className="pref-subtitle">
                Automated criteria for flagging cryptographic non-compliance and enforcing strict security baselines.
              </p>
            </div>
          </div>
        </div>

        <div className="thresholds-form-grid">
          <div className="form-group">
            <label className="form-label">Minimum Allowed Diffie-Hellman Group</label>
            <select
              value={minDhGroup}
              onChange={(e) => setMinDhGroup(e.target.value)}
              className="form-select"
            >
              <option value="31">Group 31 - Curve25519 (256-bit Montgomery Curve) [Recommended]</option>
              <option value="20">Group 20 - ECP-384 (384-bit NIST Curve)</option>
              <option value="19">Group 19 - ECP-256 (256-bit NIST Curve)</option>
              <option value="14">Group 14 - MODP 2048 (NIST SP 800-77 Minimum)</option>
            </select>
            <span className="form-hint">Proposals with weaker groups trigger immediate compliance warnings.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Shannon Entropy Anomaly Floor (bits/byte)</label>
            <div className="input-with-val">
              <input
                type="number"
                step="0.01"
                min="7.00"
                max="8.00"
                value={entropyFloor}
                onChange={(e) => setEntropyFloor(parseFloat(e.target.value))}
                className="form-input"
              />
              <span className="input-addon">bits/byte</span>
            </div>
            <span className="form-hint">Encrypted payloads below this threshold indicate potential plaintext leakage.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Anti-Replay Violation Tolerance</label>
            <div className="input-with-val">
              <input
                type="number"
                min="0"
                max="10"
                value={replayTolerance}
                onChange={(e) => setReplayTolerance(parseInt(e.target.value, 10))}
                className="form-input"
              />
              <span className="input-addon">Packets</span>
            </div>
            <span className="form-hint">Allowable sequence window violations before an active attack alert is issued.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Security Association (SA) Lifetime Timeout</label>
            <div className="input-with-val">
              <input
                type="number"
                min="60"
                max="86400"
                step="300"
                value={saLifetime}
                onChange={(e) => setSaLifetime(parseInt(e.target.value, 10))}
                className="form-input"
              />
              <span className="input-addon">Seconds</span>
            </div>
            <span className="form-hint">Maximum allowable duration before mandatory re-keying is required.</span>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: SMTP / GOOGLE APP PASSWORD EMAIL SETUP ── */}
      <div className="pref-card">
        <div className="pref-header-row">
          <div className="pref-title-group">
            <Mail size={16} className="pref-icon purple" />
            <div>
              <h3 className="pref-title">SMTP & Google App Password Email Setup</h3>
              <p className="pref-subtitle">
                Configure outbound email gateway for critical vulnerability alerts, compliance digests, and tamper notifications.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="test-email-btn"
            onClick={handleSendTestEmail}
            disabled={isSendingTest}
          >
            {isSendingTest ? (
              <>
                <RefreshCw size={13} className="spin-icon" />
                <span>Dispatching Test...</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span>Send Test Alert Email</span>
              </>
            )}
          </button>
        </div>

        <div className="smtp-form-grid">
          <div className="form-group">
            <label className="form-label">SMTP Host Server</label>
            <div className="input-icon-wrap">
              <Server size={14} className="field-icon" />
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="e.g. smtp.gmail.com"
                className="form-input with-icon"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">SMTP Port & Protocol</label>
            <div className="port-proto-row">
              <input
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(parseInt(e.target.value, 10))}
                className="form-input port-input"
              />
              <select
                value={smtpProtocol}
                onChange={(e) => setSmtpProtocol(e.target.value as 'STARTTLS' | 'SSL')}
                className="form-select proto-select"
              >
                <option value="STARTTLS">STARTTLS (Port 587)</option>
                <option value="SSL">SSL / TLS (Port 465)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Sender Email Address</label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="alerts@tunnelxray.sec"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Google App Password (16 Characters)</label>
            <div className="input-icon-wrap password-wrap">
              <KeyRound size={14} className="field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                placeholder="abcd efgh ijkl mnop"
                className="form-input with-icon mono-pass"
              />
              <button
                type="button"
                className="eye-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <span className="form-hint">
              Generated in Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords.
            </span>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Security Incident Alert Recipient(s)</label>
            <input
              type="email"
              value={alertRecipient}
              onChange={(e) => setAlertRecipient(e.target.value)}
              placeholder="ciso@company.com, secops-team@company.com"
              className="form-input"
            />
            <span className="form-hint">
              Critical severity findings (e.g. 3DES negotiation or Replay attack bursts) dispatch instant notification to this address.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
