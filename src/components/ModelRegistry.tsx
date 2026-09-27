import React, { useState } from 'react';
import {
  Cpu,
  GitBranch,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Sliders,
  Clock,
  Layers,
  Shield,
  Activity,
  ArrowRight,
  TrendingUp,
  Award,
  Terminal,
  Zap
} from 'lucide-react';
import './ModelRegistry.css';

export interface ModelVersion {
  id: string;
  version: string;
  algorithm: string;
  hyperparameters: {
    n_estimators: number;
    max_depth: number;
    min_samples_split?: number;
    learning_rate?: number;
    criterion?: string;
  };
  deploymentTimestamp: string;
  deployedBy: string;
  datasetSplit: string;
  accuracy: number;
  f1Score: number;
  inferenceLatencyMs: number;
  status: 'ACTIVE_PRODUCTION' | 'CANARY_STAGING' | 'ARCHIVED';
  driftScore: number;
}

const INITIAL_MODELS: ModelVersion[] = [
  {
    id: 'MOD-01',
    version: 'v2.4.0',
    algorithm: 'Random Forest Flow Classifier (RFC 8221)',
    hyperparameters: {
      n_estimators: 120,
      max_depth: 14,
      min_samples_split: 2,
      criterion: 'gini'
    },
    deploymentTimestamp: '2026-09-26 12:04:18 UTC',
    deployedBy: 'SecOps AI Engine',
    datasetSplit: '60/20/20 Stratified',
    accuracy: 98.7,
    f1Score: 0.985,
    inferenceLatencyMs: 0.42,
    status: 'ACTIVE_PRODUCTION',
    driftScore: 0.012
  },
  {
    id: 'MOD-02',
    version: 'v2.3.5',
    algorithm: 'Isolation Forest Anomaly Detector',
    hyperparameters: {
      n_estimators: 100,
      max_depth: 10
    },
    deploymentTimestamp: '2026-09-18 09:12:00 UTC',
    deployedBy: 'Automated CI/CD Pipeline',
    datasetSplit: '70/15/15 Stratified',
    accuracy: 97.4,
    f1Score: 0.971,
    inferenceLatencyMs: 0.28,
    status: 'CANARY_STAGING',
    driftScore: 0.024
  },
  {
    id: 'MOD-03',
    version: 'v1.8.0',
    algorithm: 'Gradient Boosted Decision Tree (XGBoost)',
    hyperparameters: {
      n_estimators: 80,
      max_depth: 8,
      learning_rate: 0.05
    },
    deploymentTimestamp: '2026-08-10 14:00:00 UTC',
    deployedBy: 'SecOps Lead',
    datasetSplit: '80/10/10 Stratified',
    accuracy: 96.1,
    f1Score: 0.958,
    inferenceLatencyMs: 0.65,
    status: 'ARCHIVED',
    driftScore: 0.058
  }
];

export function ModelRegistry() {
  const [models, setModels] = useState<ModelVersion[]>(INITIAL_MODELS);
  const [activeVersion, setActiveVersion] = useState<string>('v2.4.0');

  // Retraining state
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainProgress, setRetrainProgress] = useState(0);
  const [retrainStage, setRetrainStage] = useState('');
  const [selectedAlgo, setSelectedAlgo] = useState('Random Forest (RFC 8221)');
  const [paramNEstimators, setParamNEstimators] = useState(120);
  const [paramMaxDepth, setParamMaxDepth] = useState(14);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePromoteOrRollback = (targetVersion: string, actionType: 'promote' | 'rollback') => {
    setModels((prev) =>
      prev.map((m) => {
        if (m.version === targetVersion) {
          return { ...m, status: 'ACTIVE_PRODUCTION' };
        }
        if (m.version === activeVersion) {
          return { ...m, status: 'ARCHIVED' };
        }
        return m;
      })
    );
    setActiveVersion(targetVersion);

    if (actionType === 'promote') {
      showToast(`Model ${targetVersion} successfully promoted to Active Production.`);
    } else {
      showToast(`Safety rollback executed: Active Production restored to ${targetVersion}.`);
    }
  };

  const handleStartRetraining = () => {
    setIsRetraining(true);
    setRetrainProgress(5);
    setRetrainStage('Ingesting 60% Training Partition (1,470,000 flows)...');

    const interval = setInterval(() => {
      setRetrainProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            const newVersionTag = `v1.2.0-build${Math.floor(Math.random() * 80 + 10)}`;
            const newModel: ModelVersion = {
              id: `MOD-${Math.floor(Math.random() * 800 + 9000)}`,
              version: newVersionTag,
              algorithm: selectedAlgo,
              hyperparameters: {
                n_estimators: paramNEstimators,
                max_depth: paramMaxDepth,
                min_samples_split: 4,
                criterion: 'gini'
              },
              deploymentTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
              deployedBy: 'Interactive-Retrain-Pipeline',
              datasetSplit: 'Corpus-v2.4 (60/20/20 Stratified)',
              accuracy: 99.85,
              f1Score: 0.998,
              inferenceLatencyMs: 0.15,
              status: 'CANARY_STAGING',
              driftScore: 0.009
            };

            setModels((curr) => [newModel, ...curr]);
            setIsRetraining(false);
            setRetrainProgress(100);
            showToast(`Retraining complete! Registered new candidate model ${newVersionTag}.`);
          }, 800);
          return 95;
        }

        if (prev === 25) {
          setRetrainStage(`Building ${paramNEstimators} decision trees (max_depth=${paramMaxDepth})...`);
        } else if (prev === 55) {
          setRetrainStage('Evaluating holdout validation split (490,000 samples)...');
        } else if (prev === 80) {
          setRetrainStage('Calculating Gini importance & F1-score convergence...');
        }

        return prev + 15;
      });
    }, 400);
  };

  const currentActiveModel = models.find((m) => m.version === activeVersion) || models[0];

  return (
    <div className="model-registry-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="registry-toast">
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="registry-header-card">
        <div className="registry-header-left">
          <div className="registry-badge">
            <Cpu size={13} />
            <span>MODEL GOVERNANCE & LIFECYCLE</span>
          </div>
          <h2>Enterprise ML Model Registry</h2>
          <p>
            Cryptographic traffic classification models for automated attack vector detection. Track
            hyperparameters, deployment provenance, trigger retraining jobs, and execute atomic rollbacks.
          </p>
        </div>

        <div className="registry-stats-cluster">
          <div className="registry-stat-box">
            <span className="stat-label">ACTIVE PRODUCTION MODEL</span>
            <span className="stat-val highlight">{currentActiveModel?.version || ''}</span>
            <span className="stat-sub">{currentActiveModel?.algorithm ? currentActiveModel.algorithm.split(' ')[0] : ''}</span>
          </div>
          <div className="registry-stat-box">
            <span className="stat-label">INFERENCE LATENCY</span>
            <span className="stat-val green">{currentActiveModel?.inferenceLatencyMs ? `${currentActiveModel.inferenceLatencyMs} ms` : ''}</span>
            <span className="stat-sub">{currentActiveModel ? 'SIMD Vectorized' : ''}</span>
          </div>
          <div className="registry-stat-box">
            <span className="stat-label">F1-SCORE POSTURE</span>
            <span className="stat-val highlight">{currentActiveModel?.f1Score ? String(currentActiveModel.f1Score) : ''}</span>
            <span className="stat-sub">{currentActiveModel ? 'Precision' : ''}</span>
          </div>
        </div>
      </div>

      {/* Models Version Registry Table */}
      <div className="registry-table-card">
        <div className="table-card-top">
          <div className="card-title-group">
            <Layers size={18} className="cyan-icon" />
            <div>
              <h3>Registered Model Versions</h3>
              <p>Auditable lineage of all active, staging, and archived model checkpoints.</p>
            </div>
          </div>
          <div className="table-top-meta">
            <span className="count-pill">{models.length > 0 ? `${models.length} Versions Cataloged` : ''}</span>
          </div>
        </div>

        <div className="models-table-wrap">
          <div className="models-table-header">
            <span className="col-ver">MODEL VERSION & ALGORITHM</span>
            <span className="col-params">HYPERPARAMETERS</span>
            <span className="col-date">DEPLOYMENT LOG</span>
            <span className="col-metrics">ACCURACY / F1</span>
            <span className="col-state">STATUS</span>
            <span className="col-action">GOVERNANCE</span>
          </div>

          <div className="models-table-body">
            {models.length === 0 ? (
              <div className="empty-state-pcap" style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                No registered model checkpoints in governance catalog.
              </div>
            ) : (
              models.map((mod) => {
              const isActive = mod.status === 'ACTIVE_PRODUCTION';
              const isCanary = mod.status === 'CANARY_STAGING';
              const isArchived = mod.status === 'ARCHIVED';

              return (
                <div
                  key={mod.id}
                  className={`model-row-item ${isActive ? 'active-row' : ''}`}
                >
                  {/* Version & Algorithm */}
                  <div className="col-ver">
                    <div className="ver-icon-wrap">
                      <Cpu size={16} />
                    </div>
                    <div className="ver-text">
                      <div className="ver-title-line">
                        <span className="version-tag">{mod.version}</span>
                        <span className="mod-id-pill">{mod.id}</span>
                      </div>
                      <span className="algo-name">{mod.algorithm}</span>
                    </div>
                  </div>

                  {/* Hyperparameters */}
                  <div className="col-params">
                    <div className="param-chips-grid">
                      <span className="param-chip">
                        n_est: <strong>{mod.hyperparameters.n_estimators}</strong>
                      </span>
                      <span className="param-chip">
                        depth: <strong>{mod.hyperparameters.max_depth}</strong>
                      </span>
                      {mod.hyperparameters.learning_rate && (
                        <span className="param-chip">
                          lr: <strong>{mod.hyperparameters.learning_rate}</strong>
                        </span>
                      )}
                      {mod.hyperparameters.criterion && (
                        <span className="param-chip">
                          crit: <strong>{mod.hyperparameters.criterion}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date & Author */}
                  <div className="col-date">
                    <div className="date-line">
                      <Clock size={12} />
                      <span>{mod.deploymentTimestamp}</span>
                    </div>
                    <span className="deployer-text">{mod.deployedBy}</span>
                  </div>

                  {/* Metrics */}
                  <div className="col-metrics">
                    <div className="metric-score-row">
                      <span className="acc-val">{mod.accuracy}%</span>
                      <span className="f1-val">F1: {mod.f1Score}</span>
                    </div>
                    <div className="drift-row">
                      <span className="drift-label">Drift:</span>
                      <span className={`drift-val ${mod.driftScore < 0.05 ? 'green' : 'amber'}`}>
                        {mod.driftScore}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-state">
                    <span
                      className={`status-pill ${
                        isActive ? 'green' : isCanary ? 'purple' : 'slate'
                      }`}
                    >
                      {isActive
                        ? 'PRODUCTION ACTIVE'
                        : isCanary
                        ? 'CANARY STAGING'
                        : 'ARCHIVED'}
                    </span>
                  </div>

                  {/* Governance Action */}
                  <div className="col-action">
                    {isActive ? (
                      <span className="current-active-tag">
                        <CheckCircle2 size={13} />
                        <span>Serving Live</span>
                      </span>
                    ) : isCanary ? (
                      <button
                        type="button"
                        className="promote-btn"
                        onClick={() => handlePromoteOrRollback(mod.version, 'promote')}
                        title="Promote Canary to Active Production"
                      >
                        <Zap size={13} />
                        <span>Promote to Prod</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="rollback-btn"
                        onClick={() => handlePromoteOrRollback(mod.version, 'rollback')}
                        title="Instant rollback production to this checkpoint"
                      >
                        <RotateCcw size={13} />
                        <span>Rollback</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      </div>

      {/* Retraining Controls & Live Drift Telemetry */}
      <div className="retrain-split-grid">
        {/* Retraining Trigger Console */}
        <div className="retrain-card">
          <div className="retrain-header">
            <div className="card-title-group">
              <Sliders size={18} className="purple-icon" />
              <div>
                <h4>Interactive Model Retraining Console</h4>
                <p>Launch distributed hyperparameter optimization on latest traffic partitions.</p>
              </div>
            </div>
          </div>

          <div className="retrain-form">
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Classifier Architecture:</label>
                <select
                  value={selectedAlgo}
                  onChange={(e) => setSelectedAlgo(e.target.value)}
                  disabled={isRetraining}
                >
                  <option value="Random Forest (RFC 8221)">Random Forest (RFC 8221 / AEAD Heuristics)</option>
                  <option value="XGBoost Gradient Boosted Trees">XGBoost (Extreme Gradient Boosting)</option>
                  <option value="LightGBM Hist-Gradient">LightGBM (Low-Latency SIMD Ensemble)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Dataset Corpus:</label>
                <input type="text" value="IPSec-Traffic-Corpus-v2.4 (60/20/20)" disabled />
              </div>
            </div>

            <div className="form-row sliders-row">
              <div className="form-slider-group">
                <div className="slider-label-line">
                  <span>Number of Estimators (n_estimators):</span>
                  <strong className="slider-val">{paramNEstimators}</strong>
                </div>
                <input
                  type="range"
                  min="50"
                  max="250"
                  step="10"
                  value={paramNEstimators}
                  onChange={(e) => setParamNEstimators(Number(e.target.value))}
                  disabled={isRetraining}
                />
              </div>

              <div className="form-slider-group">
                <div className="slider-label-line">
                  <span>Maximum Tree Depth (max_depth):</span>
                  <strong className="slider-val">{paramMaxDepth}</strong>
                </div>
                <input
                  type="range"
                  min="6"
                  max="22"
                  step="2"
                  value={paramMaxDepth}
                  onChange={(e) => setParamMaxDepth(Number(e.target.value))}
                  disabled={isRetraining}
                />
              </div>
            </div>

            {/* Retraining execution state */}
            {isRetraining ? (
              <div className="retraining-in-progress">
                <div className="progress-info-row">
                  <span className="stage-text">{retrainStage}</span>
                  <span className="pct-text">{retrainProgress}%</span>
                </div>
                <div className="retrain-bar-track">
                  <div
                    className="retrain-bar-fill"
                    style={{ width: `${retrainProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="trigger-retrain-btn"
                onClick={handleStartRetraining}
              >
                <Play size={15} />
                <span>Trigger Retraining Job</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Drift & Performance Telemetry */}
        <div className="telemetry-card">
          <div className="retrain-header">
            <div className="card-title-group">
              <Activity size={18} className="cyan-icon" />
              <div>
                <h4>Model Drift & Confusion Matrix</h4>
                <p>Kolmogorov-Smirnov feature drift and classification truth table.</p>
              </div>
            </div>
          </div>

          {/* 2x2 Confusion Matrix */}
          <div className="confusion-matrix-box">
            <span className="cm-title">CONFUSION MATRIX (HOLD-OUT BENCHMARK)</span>
            <div className="cm-grid">
              <div className="cm-cell tp">
                <span className="cm-val"></span>
                <span className="cm-sub">True Positive (Benign ESP)</span>
              </div>
              <div className="cm-cell fp">
                <span className="cm-val"></span>
                <span className="cm-sub">False Positive (Type I)</span>
              </div>
              <div className="cm-cell fn">
                <span className="cm-val"></span>
                <span className="cm-sub">False Negative (Type II)</span>
              </div>
              <div className="cm-cell tn">
                <span className="cm-val"></span>
                <span className="cm-sub">True Negative (Attacks)</span>
              </div>
            </div>
          </div>

          <div className="drift-monitor-box">
            <div className="drift-top-row">
              <span className="drift-lbl">K-S Population Drift Score:</span>
              <span className="drift-score"></span>
            </div>
            <div className="drift-bar-track">
              <div className="drift-bar-fill" style={{ width: '0%' }} />
            </div>
            <span className="drift-sub-note">
              Alert threshold: 0.10. Retraining recommended only when drift exceeds 0.15.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
