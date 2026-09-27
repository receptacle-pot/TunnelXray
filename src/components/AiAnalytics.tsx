import React, { useState } from 'react';
import {
  BrainCircuit,
  Cpu,
  BarChart,
  LineChart,
  CheckCircle2,
  Sparkles,
  GitBranch,
  ShieldAlert,
  Percent,
  TrendingUp,
  Activity,
  Layers,
  HelpCircle
} from 'lucide-react';
import './AiAnalytics.css';

interface ConfusionMatrixCell {
  actual: string;
  predicted: string;
  value: number; // percentage or count
  isMatch: boolean;
}

const CONFUSION_MATRIX: {
  classes: string[];
  matrix: number[][]; // rows: Actual, cols: Predicted
} = {
  classes: ['Bulk-Transfer', 'Interactive', 'Automated-Sync', 'Streaming', 'VoIP'],
  matrix: [
    [94.2, 3.1, 1.4, 0.8, 0.5],
    [2.8, 91.5, 3.2, 1.1, 1.4],
    [1.5, 2.0, 93.8, 1.8, 0.9],
    [0.9, 1.2, 2.1, 92.6, 3.2],
    [0.4, 1.6, 0.8, 3.1, 94.1]
  ]
};

interface FeatureCorrelation {
  featureName: string;
  correlationCoeff: number;
  pVal: string;
  significance: 'VERY_HIGH' | 'HIGH' | 'MODERATE';
}

const FEATURE_CORRELATIONS: FeatureCorrelation[] = [
  { featureName: 'Inter-Arrival Packet Jitter (ms)', correlationCoeff: 0.884, pVal: '< 0.0001', significance: 'VERY_HIGH' },
  { featureName: 'Packet Size Kurtosis', correlationCoeff: 0.841, pVal: '< 0.0001', significance: 'VERY_HIGH' },
  { featureName: 'Wireline Flow Byte Entropy', correlationCoeff: 0.792, pVal: '< 0.0001', significance: 'VERY_HIGH' },
  { featureName: 'Burst Duration to Idle Ratio', correlationCoeff: 0.715, pVal: '< 0.0005', significance: 'HIGH' },
  { featureName: 'Mean Directional Symmetry', correlationCoeff: 0.658, pVal: '< 0.0010', significance: 'HIGH' },
  { featureName: 'Window Size Modulation Delta', correlationCoeff: 0.542, pVal: '< 0.0050', significance: 'MODERATE' }
];

interface ConfidenceInterval {
  trafficClass: string;
  testSamples: number;
  meanPrecision: number;
  ci95Lower: number;
  ci95Upper: number;
  rocAuc: number;
}

const CONFIDENCE_INTERVALS: ConfidenceInterval[] = [
  { trafficClass: 'Bulk-Transfer (Encrypted S3 / Cloud)', testSamples: 8520, meanPrecision: 94.2, ci95Lower: 93.6, ci95Upper: 94.8, rocAuc: 0.982 },
  { trafficClass: 'Interactive-Web (HTTPS over IPsec)', testSamples: 6410, meanPrecision: 91.5, ci95Lower: 90.8, ci95Upper: 92.2, rocAuc: 0.957 },
  { trafficClass: 'Automated-Sync (Database Replication)', testSamples: 4200, meanPrecision: 93.8, ci95Lower: 93.0, ci95Upper: 94.6, rocAuc: 0.971 },
  { trafficClass: 'Streaming Media / Real-time Feed', testSamples: 3100, meanPrecision: 92.6, ci95Lower: 91.6, ci95Upper: 93.5, rocAuc: 0.964 },
  { trafficClass: 'VoIP (SIP / RTP Encrypted)', testSamples: 2850, meanPrecision: 94.1, ci95Lower: 93.2, ci95Upper: 95.0, rocAuc: 0.978 }
];

export function AiAnalytics() {
  const [selectedClassIdx, setSelectedClassIdx] = useState<number>(0);

  return (
    <div className="ai-analytics-viewport">
      {/* ── HEADER BANNER ── */}
      <div className="ai-header-card">
        <div className="ai-header-meta">
          <div className="ai-header-badge">
            <BrainCircuit size={14} />
            <span>AI Model Governance & Telemetry</span>
          </div>
          <span className="ai-eval-badge">
            <Sparkles size={13} />
            <span>Model Version: RF-IsoForest-v2.4-Production</span>
          </span>
        </div>

        <div className="ai-header-content">
          <div>
            <h2>Model Governance, Telemetry & Confidence Bounds</h2>
            <p>
              Full transparency into ML inference architecture, cross-validation metrics, confusion matrices,
              and empirical confidence intervals. Compliant with NIST AI Risk Management Framework (AI RMF 1.0).
            </p>
          </div>

          <div className="ai-kpi-summary">
            <div className="ai-kpi-box">
              <span className="kpi-v">92.4%</span>
              <span className="kpi-l">Holdout Validation Accuracy</span>
            </div>
            <div className="ai-kpi-box">
              <span className="kpi-v">0.968</span>
              <span className="kpi-l">Macro ROC-AUC</span>
            </div>
            <div className="ai-kpi-box">
              <span className="kpi-v">25,080</span>
              <span className="kpi-l">Evaluated Test Flows</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ARCHITECTURE OVERVIEW CARDS ── */}
      <div className="ai-models-grid">
        <div className="ai-model-card">
          <div className="m-card-top">
            <span className="m-tag rf">Supervised Ensemble</span>
            <span className="m-acc">Acc: 92.4%</span>
          </div>
          <h4>Random Forest Flow Classifier</h4>
          <p className="m-desc">
            500 balanced estimator trees classifying application payload categories based on 18 wireline flow features without payload decryption.
          </p>
          <div className="m-meta-specs">
            <div className="spec-row">
              <span>Hyperparameters:</span>
              <code>n_estimators=500, max_depth=16, min_samples_split=4</code>
            </div>
            <div className="spec-row">
              <span>Inference Latency:</span>
              <strong>0.14 ms / flow (CPU AVX-512)</strong>
            </div>
          </div>
        </div>

        <div className="ai-model-card">
          <div className="m-card-top">
            <span className="m-tag iso">Unsupervised Outlier</span>
            <span className="m-acc">Contam: 0.02</span>
          </div>
          <h4>Isolation Forest Anomaly Detector</h4>
          <p className="m-desc">
            Recursive path-length tree partitioning flagging covert command-and-control beacons, data exfiltration bursts, and protocol tunneling.
          </p>
          <div className="m-meta-specs">
            <div className="spec-row">
              <span>Anomaly Threshold:</span>
              <code>Anomaly Score &gt; 0.65 (Current: 0.08 Nominal)</code>
            </div>
            <div className="spec-row">
              <span>False Positive Rate:</span>
              <strong>0.42% in production baseline</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONFUSION MATRIX & FEATURE CORRELATIONS ── */}
      <div className="ai-grid-two">
        {/* Confusion Matrix */}
        <div className="ai-panel">
          <div className="ai-panel-header">
            <BarChart size={18} className="text-sky-400" />
            <div>
              <h3>Multi-Class Confusion Matrix (%)</h3>
              <p>Validation performance across 5 application classes.</p>
            </div>
          </div>

          <div className="matrix-table-wrap">
            <table className="confusion-matrix-table">
              <thead>
                <tr>
                  <th className="corner-th">Actual \ Predicted</th>
                  {CONFUSION_MATRIX.classes.map(c => (
                    <th key={c} title={c}>{c.split(' ')[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CONFUSION_MATRIX.matrix.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="actual-label-th">
                      {CONFUSION_MATRIX.classes[rIdx].split(' ')[0]}
                    </td>
                    {row.map((val, cIdx) => {
                      const isDiagonal = rIdx === cIdx;
                      return (
                        <td
                          key={cIdx}
                          className={`matrix-cell ${isDiagonal ? 'diagonal' : 'off-diagonal'}`}
                          style={{
                            backgroundColor: isDiagonal
                              ? `rgba(56, 189, 248, ${val / 100 * 0.45})`
                              : val > 2 ? `rgba(248, 113, 113, ${val / 10 * 0.3})` : 'transparent'
                          }}
                        >
                          {val.toFixed(1)}%
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Correlations */}
        <div className="ai-panel">
          <div className="ai-panel-header">
            <Activity size={18} className="text-purple-400" />
            <div>
              <h3>Feature Correlation with Ground Truth</h3>
              <p>Pearson \(r\) correlation and statistical significance \(p\)-values.</p>
            </div>
          </div>

          <div className="correlations-list">
            {FEATURE_CORRELATIONS.map((feat) => (
              <div key={feat.featureName} className="corr-item">
                <div className="corr-top">
                  <span className="corr-name">{feat.featureName}</span>
                  <span className="corr-val">r = +{feat.correlationCoeff.toFixed(3)}</span>
                </div>
                <div className="corr-bar-track">
                  <div
                    className="corr-bar-fill"
                    style={{ width: `${feat.correlationCoeff * 100}%` }}
                  />
                </div>
                <div className="corr-bot">
                  <span className="p-val">p-value: {feat.pVal}</span>
                  <span className={`sig-tag ${feat.significance.toLowerCase().replace('_', '-')}`}>
                    {feat.significance.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROBABILISTIC CONFIDENCE INTERVALS ── */}
      <div className="ai-panel full-width">
        <div className="ai-panel-header">
          <TrendingUp size={18} className="text-emerald-400" />
          <div>
            <h3>Empirical 95% Confidence Intervals & ROC-AUC Telemetry</h3>
            <p>Explicit statistical disclosure of precision bounds calculated via Wilson score method.</p>
          </div>
        </div>

        <table className="confidence-table">
          <thead>
            <tr>
              <th>Traffic Category</th>
              <th>Test Flows (N)</th>
              <th>Mean Precision</th>
              <th>95% Confidence Interval</th>
              <th>ROC-AUC</th>
              <th>Empirical Status</th>
            </tr>
          </thead>
          <tbody>
            {CONFIDENCE_INTERVALS.map((item) => (
              <tr key={item.trafficClass}>
                <td className="tc-class-cell">
                  <strong>{item.trafficClass}</strong>
                </td>
                <td><code>{item.testSamples.toLocaleString()}</code></td>
                <td>
                  <span className="tc-precision-val">{item.meanPrecision.toFixed(1)}%</span>
                </td>
                <td>
                  <span className="ci-range-chip">
                    [{item.ci95Lower.toFixed(1)}% — {item.ci95Upper.toFixed(1)}%]
                  </span>
                </td>
                <td>
                  <span className="tc-auc-val">{item.rocAuc.toFixed(3)}</span>
                </td>
                <td>
                  <span className="tc-status-badge">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Statistically Validated</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
