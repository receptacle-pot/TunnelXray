import React, { useState } from 'react';
import {
  ShieldAlert,
  Target,
  Crosshair,
  GitPullRequest,
  CheckCircle,
  AlertTriangle,
  Flame,
  ArrowRight,
  ExternalLink,
  Lock,
  Layers,
  Zap,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import './SecurityAssessment.css';

interface AttackVector {
  id: string;
  name: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'MITIGATED' | 'MONITORED' | 'VULNERABLE' | 'BLOCKED';
  protocolLayer: string;
  mechanism: string;
  observedSignals: string;
  remediationSummary: string;
}

const ATTACK_VECTORS: AttackVector[] = [
  {
    id: 'AV-01',
    name: 'Cryptographic Downgrade Attack',
    category: 'Protocol Manipulation',
    severity: 'HIGH',
    status: 'MITIGATED',
    protocolLayer: 'IKEv2 SA_INIT Proposal',
    mechanism: 'Adversary strips modern AES-256-GCM proposals during initial exchange to force fallback to 3DES-CBC or MODP-1024.',
    observedSignals: 'Zero downgrade packets detected across 3,962 frames. All transform proposals enforce AES-256-GCM baseline.',
    remediationSummary: 'Strict proposal filtering enabled; legacy Diffie-Hellman Group 2 rejected at socket gateway.'
  },
  {
    id: 'AV-02',
    name: 'Adversary-in-the-Middle (MitM) Interception',
    category: 'Authentication Bypass',
    severity: 'CRITICAL',
    status: 'BLOCKED',
    protocolLayer: 'IKE_AUTH RSA-PSS Validation',
    mechanism: 'Rogue intermediary presents crafted X.509 cert or forged responder cookie to hijack Child SA key generation.',
    observedSignals: 'Valid X.509 cert chains verified; no rogue intermediary certificates detected.',
    remediationSummary: 'Peer ID strictly bound to Subject Alternative Name (SAN); OCSP stapling active.'
  },
  {
    id: 'AV-03',
    name: 'RFC 4303 Replay & Duplication Injection',
    category: 'Integrity Violation',
    severity: 'MEDIUM',
    status: 'MITIGATED',
    protocolLayer: 'ESP Sequence Header',
    mechanism: 'Attacker sniffs wireline ESP ciphertext and reinjects duplicates into active session to desync receiver state.',
    observedSignals: 'RFC 4303 anti-replay window evaluated: 0 duplicate sequence numbers in baseline stream.',
    remediationSummary: 'RFC 4303 anti-replay window enforced with 64-bit sequence counters (ESN support enabled).'
  },
  {
    id: 'AV-04',
    name: 'Passive Wireline Eavesdropping',
    category: 'Confidentiality Threat',
    severity: 'LOW',
    status: 'BLOCKED',
    protocolLayer: 'ESP Encapsulation',
    mechanism: 'Deep optical tap capturing wireline packets attempting offline decryption of recorded payload data.',
    observedSignals: 'AES-256-GCM AEAD encryption confirmed; zero plaintext leakage on inspected wireline frames.',
    remediationSummary: 'Ephemeral Curve25519 (Group 31) PFS active; rekey interval strictly 3600 seconds.'
  }
];

interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
  layer: string;
  detectionRule: string;
  coverage: 'FULL' | 'PARTIAL' | 'PLANNED';
  telemetrySource: string;
}

const MITRE_TECHNIQUES: MitreTechnique[] = [
  {
    id: 'T1572',
    name: 'Protocol Tunneling',
    tactic: 'Command & Control / Defense Evasion',
    layer: 'IPsec Encapsulation (ESP)',
    detectionRule: 'Detect non-standard inner protocols, abnormal payload entropy >7.99 bits/byte, or atypical MTU sizing.',
    coverage: 'FULL',
    telemetrySource: 'eBPF / XDP Wireline Parser'
  },
  {
    id: 'T1040',
    name: 'Network Sniffing',
    tactic: 'Credential Access / Discovery',
    layer: 'Wireline Interface tap',
    detectionRule: 'Monitor promiscuous mode flags, unusual ARP queries, and unsolicited responder probe beacons.',
    coverage: 'FULL',
    telemetrySource: 'Kernel Netlink Subsystem'
  },
  {
    id: 'T1557.001',
    name: 'Adversary-in-the-Middle: Relay & Poisoning',
    tactic: 'Credential Access / Collection',
    layer: 'IKE Handshake Negotiation',
    detectionRule: 'Flag IKE SPI pair collisions, duplicate cookies, or mismatched IDr/IDi certificate chains.',
    coverage: 'FULL',
    telemetrySource: 'IKE State Machine Engine'
  },
  {
    id: 'T1499.001',
    name: 'Endpoint DoS: OS Exhaustion Flood',
    tactic: 'Impact',
    layer: 'UDP 500 / 4500 (IKE Daemon)',
    detectionRule: 'Detect unauthenticated IKE_SA_INIT floods (>500 pkts/sec); trigger RFC 7296 stateless anti-DoS cookie.',
    coverage: 'FULL',
    telemetrySource: 'Stateless Cookie Engine'
  },
  {
    id: 'T1071.001',
    name: 'Web Protocols over Encrypted Tunnels',
    tactic: 'Command & Control',
    layer: 'Decoupled Flow Heuristics',
    detectionRule: 'Random Forest 18-feature inference identifying high-frequency heartbeat patterns inside encrypted ESP.',
    coverage: 'PARTIAL',
    telemetrySource: 'ML Behavioral Heuristics'
  }
];

interface MitigationRoadmap {
  phase: string;
  horizon: string;
  title: string;
  priority: 'P0' | 'P1' | 'P2';
  effort: 'Low' | 'Medium' | 'High';
  status: 'Completed' | 'In Progress' | 'Scheduled';
  description: string;
  deliverables: string[];
}

const ROADMAP_ITEMS: MitigationRoadmap[] = [
  {
    phase: 'Phase 1',
    horizon: 'Immediate (0 - 30 Days)',
    title: 'Legacy Cryptographic Deprecation',
    priority: 'P0',
    effort: 'Low',
    status: 'Completed',
    description: 'Completely eliminate vulnerable 64-bit block ciphers (Sweet32) and precomputable Diffie-Hellman groups from all gateway configurations.',
    deliverables: [
      'Revoke 3DES-CBC and Blowfish proposals in strongSwan / Cisco peers',
      'Disable DH Group 1, Group 2, and Group 5 from transform catalogs',
      'Audit X.509 trust roots and decommission SHA-1 signatures'
    ]
  },
  {
    phase: 'Phase 2',
    horizon: 'Near-Term (30 - 90 Days)',
    title: 'Strict AEAD & Extended Sequence Numbers (ESN)',
    priority: 'P1',
    effort: 'Medium',
    status: 'In Progress',
    description: 'Enforce Authenticated Encryption with Associated Data (AEAD) across all production ESP sessions, combined with 64-bit sequence counters to prevent wrapping.',
    deliverables: [
      'Default to AES-256-GCM / ChaCha20-Poly1305 on 100% of Child SAs',
      'Activate RFC 4304 Extended Sequence Numbers for >10 Gbps links',
      'Automate SA rekey intervals at 3600 seconds or 100 GB volume limits'
    ]
  },
  {
    phase: 'Phase 3',
    horizon: 'Strategic (90 - 180 Days)',
    title: 'Post-Quantum Cryptography (PQC) Hybrid Key Exchange',
    priority: 'P2',
    effort: 'High',
    status: 'Scheduled',
    description: 'Prepare infrastructure against harvest-now-decrypt-later adversaries by deploying hybrid post-quantum key encapsulation mechanisms.',
    deliverables: [
      'Implement RFC 9370 Multiple Key Exchanges in IKEv2',
      'Test Kyber-768 / ML-KEM + Curve25519 hybrid exchange in staging labs',
      'Verify fragmentation handling for oversized PQC handshake frames'
    ]
  }
];

export function SecurityAssessment() {
  const [selectedVector, setSelectedVector] = useState<string>(ATTACK_VECTORS[0].id);
  const [activeRoadmap, setActiveRoadmap] = useState<number>(0);

  const currentVector = ATTACK_VECTORS.find(v => v.id === selectedVector) || ATTACK_VECTORS[0];

  return (
    <div className="security-assessment-viewport">
      {/* ── HEADER BANNER ── */}
      <div className="sa-header-card">
        <div className="sa-header-meta">
          <div className="sa-header-badge">
            <ShieldAlert size={14} />
            <span>Threat Model & Attack Vector Assessment</span>
          </div>
          <span className="sa-threat-posture-badge">
            <Crosshair size={13} />
            <span>SOC Defense Stance: Hardened</span>
          </span>
        </div>
        <div className="sa-header-content">
          <div>
            <h2>Continuous Adversary Threat Modeling & MITRE Mapping</h2>
            <p>
              Proactive reconnaissance evaluating active IPsec attack surfaces, cryptographic downgrade risks,
              replay vulnerabilities, and alignment with the MITRE ATT&CK Enterprise Matrix.
            </p>
          </div>
          <div className="sa-header-actions">
            <div className="sa-kpi-pill">
              <span className="kpi-num">4 Vectors</span>
              <span className="kpi-label">Active Vectors Evaluated</span>
            </div>
            <div className="sa-kpi-pill">
              <span className="kpi-num">100%</span>
              <span className="kpi-label">Mitigation Coverage</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 1. ACTIVE ATTACK VECTORS BREAKDOWN ── */}
      <div className="sa-section-container">
        <div className="sa-section-header">
          <div className="sa-section-title">
            <Target size={18} className="text-sky-400" />
            <div>
              <h3>Active Attack Vectors & Threat Modeling</h3>
              <p>Granular evaluation of wireline eavesdropping, protocol downgrade, MitM, and replay attempts.</p>
            </div>
          </div>
          <span className="sa-pill-info">Zero-Trust Perimeter</span>
        </div>

        <div className="sa-vectors-grid">
          {/* List of Vectors */}
          <div className="sa-vectors-sidebar">
            {ATTACK_VECTORS.map((vec) => (
              <button
                key={vec.id}
                type="button"
                className={`sa-vector-card-btn ${selectedVector === vec.id ? 'active' : ''}`}
                onClick={() => setSelectedVector(vec.id)}
              >
                <div className="sa-v-top">
                  <span className="sa-v-id">{vec.id}</span>
                  <span className={`sa-severity-chip ${vec.severity.toLowerCase()}`}>
                    {vec.severity}
                  </span>
                </div>
                <div className="sa-v-name">{vec.name}</div>
                <div className="sa-v-meta">
                  <span className="sa-v-layer">{vec.protocolLayer}</span>
                  <span className={`sa-status-badge ${vec.status.toLowerCase()}`}>
                    {vec.status}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Deep Vector Detail Panel */}
          <div className="sa-vector-details-panel">
            <div className="vector-detail-head">
              <div className="v-head-info">
                <span className="v-category-badge">{currentVector.category}</span>
                <h4>{currentVector.name}</h4>
                <span className="v-layer-indicator">Target: <code>{currentVector.protocolLayer}</code></span>
              </div>
              <div className="v-status-callout">
                <span className="v-stat-label">Defense Verdict</span>
                <span className={`v-stat-value ${currentVector.status.toLowerCase()}`}>
                  {currentVector.status === 'BLOCKED' ? <CheckCircle size={15} /> : <Zap size={15} />}
                  {currentVector.status}
                </span>
              </div>
            </div>

            <div className="vector-detail-body">
              <div className="vector-box">
                <span className="v-box-title">Adversary Attack Mechanism</span>
                <p>{currentVector.mechanism}</p>
              </div>

              <div className="vector-box highlight">
                <span className="v-box-title">Observed Security Telemetry</span>
                <p>{currentVector.observedSignals}</p>
              </div>

              <div className="vector-box success">
                <span className="v-box-title">Active Defense & Remediation State</span>
                <p>{currentVector.remediationSummary}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. MITRE ATT&CK ENTERPRISE MAPPING ── */}
      <div className="sa-section-container">
        <div className="sa-section-header">
          <div className="sa-section-title">
            <Crosshair size={18} className="text-purple-400" />
            <div>
              <h3>MITRE ATT&CK® Enterprise Matrix Mapping</h3>
              <p>Adversary network tunneling techniques, detection rules, and telemetry coverage.</p>
            </div>
          </div>
          <span className="sa-pill-info purple">Framework v14.1</span>
        </div>

        <div className="mitre-table-card">
          <table className="mitre-matrix-table">
            <thead>
              <tr>
                <th>Technique ID</th>
                <th>Technique Name</th>
                <th>Tactic</th>
                <th>Target Layer</th>
                <th>Detection Rule Signature</th>
                <th>Telemetry Source</th>
                <th>Coverage</th>
              </tr>
            </thead>
            <tbody>
              {MITRE_TECHNIQUES.map((tech) => (
                <tr key={tech.id}>
                  <td>
                    <span className="mitre-id-badge">
                      {tech.id}
                      <ExternalLink size={10} />
                    </span>
                  </td>
                  <td className="tech-name-cell">{tech.name}</td>
                  <td><span className="tactic-chip">{tech.tactic}</span></td>
                  <td><code>{tech.layer}</code></td>
                  <td className="detection-cell">{tech.detectionRule}</td>
                  <td><span className="telemetry-badge">{tech.telemetrySource}</span></td>
                  <td>
                    <span className={`coverage-badge ${tech.coverage.toLowerCase()}`}>
                      {tech.coverage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. HIGH-PRIORITY MITIGATION ROADMAP ── */}
      <div className="sa-section-container">
        <div className="sa-section-header">
          <div className="sa-section-title">
            <TrendingUp size={18} className="text-emerald-400" />
            <div>
              <h3>High-Priority Security Mitigation Roadmaps</h3>
              <p>Step-by-step phased execution plan to harden enterprise cryptographic tunnels.</p>
            </div>
          </div>
          <span className="sa-pill-info emerald">ISO 27001 / SOC 2 Ready</span>
        </div>

        <div className="roadmap-grid">
          {ROADMAP_ITEMS.map((item, idx) => (
            <div
              key={item.phase}
              className={`roadmap-card ${activeRoadmap === idx ? 'selected' : ''}`}
              onClick={() => setActiveRoadmap(idx)}
            >
              <div className="rm-card-top">
                <span className="rm-phase-tag">{item.phase}</span>
                <span className={`rm-priority-chip ${item.priority.toLowerCase()}`}>
                  {item.priority}
                </span>
                <span className={`rm-status-chip ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {item.status}
                </span>
              </div>
              <h4 className="rm-title">{item.title}</h4>
              <span className="rm-horizon">{item.horizon} • Effort: {item.effort}</span>
              <p className="rm-desc">{item.description}</p>

              <div className="rm-deliverables-list">
                <span className="deliv-head">Key Architectural Deliverables:</span>
                <ul>
                  {item.deliverables.map((deliv, dIdx) => (
                    <li key={dIdx}>
                      <CheckCircle size={13} className="text-emerald-400" />
                      <span>{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
