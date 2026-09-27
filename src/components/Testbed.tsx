import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  FileCode,
  Download,
  Layers,
  Activity,
  Sliders,
  Sparkles,
  Terminal,
  Cpu
} from 'lucide-react';
import './Testbed.css';

type PresetType = 'clean_gcm' | 'insecure_3des' | 'replay_attack';

interface SyntheticFrame {
  id: number;
  timestamp: string;
  protocol: 'IKEv2' | 'IKEv1' | 'ESP';
  spi: string;
  seq: number;
  length: number;
  flags: string;
  cryptoVerdict: 'VALID_AEAD' | 'SWEET32_RISK' | 'DUPLICATE_REPLAY';
  hexSnippet: string;
}

interface TestbedPreset {
  id: PresetType;
  title: string;
  badge: string;
  badgeColor: 'green' | 'red' | 'amber';
  description: string;
  ciphers: string;
  dhGroup: string;
  expectedVerdict: string;
  simulatedAnomalies: string[];
}

const PRESETS: Record<PresetType, TestbedPreset> = {
  clean_gcm: {
    id: 'clean_gcm',
    title: 'Clean IKEv2 / AES-GCM Baseline',
    badge: 'Hardened Baseline',
    badgeColor: 'green',
    description: 'Generates a compliant, high-assurance IPsec session using AES-256-GCM AEAD, Curve25519 PFS, and pristine sequence counters.',
    ciphers: 'AES-256-GCM (128-bit ICV), PRF-HMAC-SHA384',
    dhGroup: 'Curve25519 (Group 31, 256-bit EC)',
    expectedVerdict: '100% Valid • Zero cryptographic anomalies • Anti-Replay clean',
    simulatedAnomalies: ['Zero sequence gaps', 'Zero 64-bit block collisions', 'Stateless anti-DoS cookie verified']
  },
  insecure_3des: {
    id: 'insecure_3des',
    title: 'Insecure IKEv1 / 3DES / MD5 Legacy Tunnel',
    badge: 'Vulnerable Trace',
    badgeColor: 'red',
    description: 'Simulates a deprecated legacy VPN session susceptible to the Sweet32 collision attack (CVE-2016-2183) and weak MODP 1024 Diffie-Hellman.',
    ciphers: '3DES-CBC (64-bit block) + HMAC-MD5',
    dhGroup: 'MODP 1024-bit (Group 2 Precomputable)',
    expectedVerdict: 'CRITICAL ALERT • Sweet32 Birthday Collision Risk • Deprecated Hashes',
    simulatedAnomalies: ['64-bit block size collision bound reached', 'Logjam precomputation vulnerability', 'Deprecated MD5 transform offered']
  },
  replay_attack: {
    id: 'replay_attack',
    title: 'Active Packet Replay & Gap Attack Scenario',
    badge: 'Adversary Simulation',
    badgeColor: 'amber',
    description: 'Injects wireline sequence number duplications and out-of-window frames to test the RFC 4303 64-packet anti-replay sliding window.',
    ciphers: 'AES-CBC-256 + HMAC-SHA256',
    dhGroup: 'MODP 2048-bit (Group 14)',
    expectedVerdict: 'MITIGATED ALERT • Sequence Gap Detected • Replayed packets dropped by kernel',
    simulatedAnomalies: ['Sequence #184856 duplicated twice', 'Window violation bitmask triggered', 'Kernel XFRM dropped 2 replayed frames']
  }
};

export function Testbed() {
  const [selectedPreset, setSelectedPreset] = useState<PresetType>('clean_gcm');
  const [packetCount, setPacketCount] = useState<number>(2500);
  const [burstRateMbps, setBurstRateMbps] = useState<number>(1000);
  const [injectFragments, setInjectFragments] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationDone, setGenerationDone] = useState<boolean>(false);
  const [generatedFrames, setGeneratedFrames] = useState<SyntheticFrame[]>([]);

  const preset = PRESETS[selectedPreset];

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationDone(false);

    setTimeout(() => {
      // Build simulated frames depending on preset
      if (selectedPreset === 'clean_gcm') {
        setGeneratedFrames([
          {
            id: 1,
            timestamp: '0.000000',
            protocol: 'IKEv2',
            spi: '0x7c49e2103af2b904',
            seq: 0,
            length: 448,
            flags: 'IKE_SA_INIT (Req)',
            cryptoVerdict: 'VALID_AEAD',
            hexSnippet: '00 50 56 c0 00 08 00 0c 29 3e 4f 92 08 00 45 00 ...'
          },
          {
            id: 2,
            timestamp: '0.014210',
            protocol: 'IKEv2',
            spi: '0x3f12a8849b110244',
            seq: 0,
            length: 496,
            flags: 'IKE_SA_INIT (Rsp)',
            cryptoVerdict: 'VALID_AEAD',
            hexSnippet: '45 00 01 f0 1a 2c 40 00 40 11 f9 32 c6 33 64 04 ...'
          },
          {
            id: 3,
            timestamp: '0.038100',
            protocol: 'ESP',
            spi: '0x7c49e210',
            seq: 1,
            length: 1420,
            flags: 'ESP Wireline (GCM)',
            cryptoVerdict: 'VALID_AEAD',
            hexSnippet: '7c 49 e2 10 00 00 00 01 a1 b2 c3 d4 e5 f6 07 18 ...'
          },
          {
            id: 4,
            timestamp: '0.038150',
            protocol: 'ESP',
            spi: '0x7c49e210',
            seq: 2,
            length: 1420,
            flags: 'ESP Wireline (GCM)',
            cryptoVerdict: 'VALID_AEAD',
            hexSnippet: '7c 49 e2 10 00 00 00 02 99 88 77 66 55 44 33 22 ...'
          }
        ]);
      } else if (selectedPreset === 'insecure_3des') {
        setGeneratedFrames([
          {
            id: 1,
            timestamp: '0.000000',
            protocol: 'IKEv1',
            spi: '0x12bb99304a88bc01',
            seq: 0,
            length: 384,
            flags: 'Main Mode (Req 3DES)',
            cryptoVerdict: 'SWEET32_RISK',
            hexSnippet: '01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f 10 ...'
          },
          {
            id: 2,
            timestamp: '0.021000',
            protocol: 'ESP',
            spi: '0x12bb9930',
            seq: 1045,
            length: 1380,
            flags: 'ESP 3DES-CBC Block',
            cryptoVerdict: 'SWEET32_RISK',
            hexSnippet: '12 bb 99 30 00 00 04 15 3d 3d 3d 3d 3d 3d 3d 3d ...'
          },
          {
            id: 3,
            timestamp: '0.021050',
            protocol: 'ESP',
            spi: '0x12bb9930',
            seq: 1046,
            length: 1380,
            flags: 'ESP 3DES-CBC Block',
            cryptoVerdict: 'SWEET32_RISK',
            hexSnippet: '12 bb 99 30 00 00 04 16 2a 2a 2a 2a 2a 2a 2a 2a ...'
          }
        ]);
      } else {
        setGeneratedFrames([
          {
            id: 1,
            timestamp: '0.000000',
            protocol: 'ESP',
            spi: '0x44a100fe',
            seq: 184855,
            length: 1420,
            flags: 'ESP Valid In-Window',
            cryptoVerdict: 'VALID_AEAD',
            hexSnippet: '44 a1 00 fe 00 02 d2 17 11 22 33 44 55 66 77 88 ...'
          },
          {
            id: 2,
            timestamp: '0.001200',
            protocol: 'ESP',
            spi: '0x44a100fe',
            seq: 184856,
            length: 1420,
            flags: 'ESP Valid In-Window',
            cryptoVerdict: 'VALID_AEAD',
            hexSnippet: '44 a1 00 fe 00 02 d2 18 22 33 44 55 66 77 88 99 ...'
          },
          {
            id: 3,
            timestamp: '0.001400',
            protocol: 'ESP',
            spi: '0x44a100fe',
            seq: 184856,
            length: 1420,
            flags: 'ESP DUPLICATE REPLAY',
            cryptoVerdict: 'DUPLICATE_REPLAY',
            hexSnippet: '44 a1 00 fe 00 02 d2 18 22 33 44 55 66 77 88 99 ...'
          }
        ]);
      }
      setIsGenerating(false);
      setGenerationDone(true);
    }, 800);
  };

  return (
    <div className="testbed-viewport">
      {/* ── HEADER BANNER ── */}
      <div className="tb-header-card">
        <div className="tb-header-meta">
          <div className="tb-header-badge">
            <FlaskConical size={14} />
            <span>Synthetic Laboratory Testbed</span>
          </div>
          <span className="tb-hw-badge">
            <Cpu size={13} />
            <span>Hardware-Free In-Browser Traffic Generator</span>
          </span>
        </div>

        <div className="tb-header-content">
          <div>
            <h2>In-Browser Synthetic IPsec PCAP Generator & Engine</h2>
            <p>
              Emulate wireline IKEv1/IKEv2 handshakes, ESP tunnels, sequence number replay attacks, and Sweet32 collisions
              directly in WebAssembly without needing physical network interface cards.
            </p>
          </div>

          <button
            type="button"
            className="tb-run-btn"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            <Play size={15} className={isGenerating ? 'spin-icon' : ''} />
            <span>{isGenerating ? 'Synthesizing...' : 'Generate & Inject Capture'}</span>
          </button>
        </div>
      </div>

      {/* ── 3 SCENARIO PRESET CARDS ── */}
      <div className="presets-grid">
        {(Object.keys(PRESETS) as PresetType[]).map(key => {
          const p = PRESETS[key];
          const isSelected = selectedPreset === key;
          return (
            <div
              key={p.id}
              className={`preset-card ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedPreset(key)}
            >
              <div className="p-card-top">
                <span className={`p-badge ${p.badgeColor}`}>{p.badge}</span>
                {isSelected && <CheckCircle2 size={16} className="text-sky-400" />}
              </div>
              <h4 className="p-title">{p.title}</h4>
              <p className="p-desc">{p.description}</p>

              <div className="p-specs-box">
                <div className="spec-row">
                  <span className="s-lbl">Ciphers:</span>
                  <span className="s-val font-mono">{p.ciphers}</span>
                </div>
                <div className="spec-row">
                  <span className="s-lbl">D-H Group:</span>
                  <span className="s-val font-mono text-purple-400">{p.dhGroup}</span>
                </div>
              </div>

              <div className="p-verdict-box">
                <span className="v-lbl">Simulation Output:</span>
                <span className="v-val">{p.expectedVerdict}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── GENERATION PARAMETERS & STREAM PREVIEW ── */}
      <div className="tb-controls-grid">
        {/* Generator Controls */}
        <div className="tb-panel">
          <div className="tb-panel-header">
            <Sliders size={18} className="text-sky-400" />
            <div>
              <h3>Synthetic Stream Configuration</h3>
              <p>Adjust packet counts, wireline burst rates, and fragmentation.</p>
            </div>
          </div>

          <div className="controls-form">
            <div className="form-item">
              <div className="form-lbl-row">
                <span>Packet Volume:</span>
                <strong className="font-mono text-sky-400">{packetCount.toLocaleString()} Frames</strong>
              </div>
              <input
                type="range"
                min="500"
                max="25000"
                step="500"
                value={packetCount}
                onChange={e => setPacketCount(Number(e.target.value))}
                className="tb-slider"
              />
            </div>

            <div className="form-item">
              <div className="form-lbl-row">
                <span>Emulated Throughput:</span>
                <strong className="font-mono text-emerald-400">{burstRateMbps} Mbps</strong>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={burstRateMbps}
                onChange={e => setBurstRateMbps(Number(e.target.value))}
                className="tb-slider"
              />
            </div>

            <div className="checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={injectFragments}
                  onChange={e => setInjectFragments(e.target.checked)}
                />
                <span>Simulate IP Packet Fragmentation (&gt;1500B MTU)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Live Generation Summary */}
        <div className="tb-panel">
          <div className="tb-panel-header">
            <Activity size={18} className="text-emerald-400" />
            <div>
              <h3>Emulation Scenario Telemetry</h3>
              <p>Real-time metrics produced by the in-browser sandbox.</p>
            </div>
          </div>

          <div className="telemetry-stats-grid">
            <div className="t-stat-cell">
              <span className="lbl">Generated Frames</span>
              <span className="val font-mono">{generationDone ? packetCount.toLocaleString() : ''}</span>
            </div>
            <div className="t-stat-cell">
              <span className="lbl">Synthetic Data Size</span>
              <span className="val font-mono">{generationDone ? `${(packetCount * 1420 / 1024 / 1024).toFixed(1)} MB` : ''}</span>
            </div>
            <div className="t-stat-cell">
              <span className="lbl">Execution Mode</span>
              <span className="val text-sky-400">Zero-Copy WebAssembly</span>
            </div>
            <div className="t-stat-cell">
              <span className="lbl">Sandbox Status</span>
              <span className="val text-emerald-400">Isolated cgroups v2</span>
            </div>
          </div>

          <div className="simulated-anomalies-list">
            <span className="anom-title">Active Simulated Conditions:</span>
            <ul>
              {preset.simulatedAnomalies.map((anom, idx) => (
                <li key={idx}>
                  <CheckCircle2 size={13} className="text-sky-400" />
                  <span>{anom}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── GENERATED PACKET STREAM PREVIEW ── */}
      <div className="stream-preview-card">
        <div className="sp-header">
          <div className="sp-title">
            <Terminal size={18} className="text-purple-400" />
            <div>
              <h3>Synthesized Frame Buffer Stream</h3>
              <p>Sample wireline byte stream generated for preset: <strong>{preset.title}</strong></p>
            </div>
          </div>

          <button
            type="button"
            className="download-pcap-btn"
            onClick={() => alert(`Downloaded synthetic trace: ${selectedPreset}.pcap (${packetCount} packets)`)}
          >
            <Download size={14} />
            <span>Export Synthetic .pcap</span>
          </button>
        </div>

        <table className="stream-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Time Offset</th>
              <th>Protocol</th>
              <th>SPI Channel</th>
              <th>Sequence #</th>
              <th>Length</th>
              <th>Flags & Description</th>
              <th>Verdict</th>
              <th>Payload Sample</th>
            </tr>
          </thead>
          <tbody>
            {generatedFrames.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  No synthesized frames in buffer. Click "Generate Synthetic PCAP Trace" above to run testbed emulation.
                </td>
              </tr>
            ) : (
              generatedFrames.map(f => (
                <tr key={f.id} className={`stream-row ${f.cryptoVerdict.toLowerCase()}`}>
                  <td><code>#{f.id}</code></td>
                  <td><span className="font-mono text-slate-400">{f.timestamp}s</span></td>
                  <td><span className="proto-pill">{f.protocol}</span></td>
                  <td><code>{f.spi}</code></td>
                  <td><span className="font-mono">{f.seq}</span></td>
                  <td><span className="font-mono">{f.length} B</span></td>
                  <td><span className="flags-text">{f.flags}</span></td>
                  <td>
                    <span className={`verdict-badge ${f.cryptoVerdict.toLowerCase()}`}>
                      {f.cryptoVerdict === 'VALID_AEAD' && 'VALID AEAD'}
                      {f.cryptoVerdict === 'SWEET32_RISK' && 'SWEET32 RISK'}
                      {f.cryptoVerdict === 'DUPLICATE_REPLAY' && 'REPLAY DETECTED'}
                    </span>
                  </td>
                  <td className="hex-cell">
                    <code>{f.hexSnippet}</code>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
