import React, { useState } from 'react';
import {
  Network,
  Radio,
  Server,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Globe,
  Lock,
  Layers,
  Activity,
  ArrowRight,
  Filter,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Sliders
} from 'lucide-react';
import './NetworkVisualization.css';

interface GatewayNode {
  id: string;
  name: string;
  type: 'CORE_GATEWAY' | 'CLOUD_HUB' | 'BRANCH_EDGE' | 'REMOTE_PEER';
  ip: string;
  region: string;
  vendor: string;
  activeTunnels: number;
  health: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  x: number;
  y: number;
  labelPosition?: 'top' | 'bottom';
}

interface TunnelLink {
  id: string;
  source: string;
  target: string;
  name: string;
  cryptoHealth: 'AEAD' | 'CBC' | 'VULNERABLE'; // Green = AEAD, Amber = CBC, Red = Vulnerable
  cipherSuite: string;
  dhGroup: string;
  throughput: string;
  latency: string;
  inboundSpi: string;
  outboundSpi: string;
  rekeySeconds: number;
  status: 'ACTIVE' | 'REKEYING' | 'DEGRADED';
}

const GATEWAY_NODES: GatewayNode[] = [
  {
    id: 'GW-CORE',
    name: 'HQ Core Ingress Security Gateway',
    type: 'CORE_GATEWAY',
    ip: '192.168.1.104',
    region: 'US-East (Primary DC)',
    vendor: 'Cisco ASR 1000 / IOS-XE',
    activeTunnels: 5,
    health: 'HEALTHY',
    x: 480,
    y: 235,
    labelPosition: 'bottom'
  },
  {
    id: 'GW-CF',
    name: 'Cloudflare Magic WAN Interconnect',
    type: 'REMOTE_PEER',
    ip: '162.158.0.1',
    region: 'Global Anycast Edge',
    vendor: 'Cloudflare Network Edge',
    activeTunnels: 2,
    health: 'HEALTHY',
    x: 480,
    y: 70,
    labelPosition: 'top'
  },
  {
    id: 'GW-AWS',
    name: 'AWS Cloud Transit Gateway Hub',
    type: 'CLOUD_HUB',
    ip: '10.240.0.1',
    region: 'us-east-1 (N. Virginia)',
    vendor: 'AWS VGW / strongSwan',
    activeTunnels: 3,
    health: 'HEALTHY',
    x: 180,
    y: 110,
    labelPosition: 'bottom'
  },
  {
    id: 'GW-AZURE',
    name: 'Azure Virtual WAN Hub Frankfurt',
    type: 'CLOUD_HUB',
    ip: '172.16.4.20',
    region: 'westeurope (Frankfurt)',
    vendor: 'Azure VPN Gateway',
    activeTunnels: 2,
    health: 'HEALTHY',
    x: 780,
    y: 110,
    labelPosition: 'bottom'
  },
  {
    id: 'GW-GCP',
    name: 'Google Cloud HA-VPN Router',
    type: 'CLOUD_HUB',
    ip: '35.192.0.10',
    region: 'us-central1 (Iowa)',
    vendor: 'GCP Cloud Router',
    activeTunnels: 2,
    health: 'HEALTHY',
    x: 200,
    y: 360,
    labelPosition: 'bottom'
  },
  {
    id: 'GW-MUMBAI',
    name: 'Branch Office Mumbai Ingress Edge',
    type: 'BRANCH_EDGE',
    ip: '192.168.10.1',
    region: 'ap-south-1 (Mumbai)',
    vendor: 'Fortinet FortiGate 100F',
    activeTunnels: 1,
    health: 'HEALTHY',
    x: 760,
    y: 360,
    labelPosition: 'bottom'
  }
];

const TUNNEL_LINKS: TunnelLink[] = [
  {
    id: 'T-01',
    source: 'GW-CORE',
    target: 'GW-AWS',
    name: 'Core ↔ AWS us-east-1 Hub',
    cryptoHealth: 'AEAD',
    cipherSuite: 'AES-256-GCM + SHA-384',
    dhGroup: 'Curve25519 (Group 31)',
    throughput: '350.0 Mbps',
    latency: '14.8 ms',
    inboundSpi: '0x7C49E210',
    outboundSpi: '0x8A12F401',
    rekeySeconds: 2840,
    status: 'ACTIVE'
  },
  {
    id: 'T-02',
    source: 'GW-CORE',
    target: 'GW-AZURE',
    name: 'Core ↔ Azure Frankfurt Hub',
    cryptoHealth: 'AEAD',
    cipherSuite: 'AES-256-GCM + ECP-384',
    dhGroup: 'ECP-384 (Group 20)',
    throughput: '210.0 Mbps',
    latency: '22.4 ms',
    inboundSpi: '0x5D10A2B4',
    outboundSpi: '0x3E9177F2',
    rekeySeconds: 3120,
    status: 'ACTIVE'
  },
  {
    id: 'T-03',
    source: 'GW-CORE',
    target: 'GW-GCP',
    name: 'Core ↔ GCP us-central1 Router',
    cryptoHealth: 'AEAD',
    cipherSuite: 'AES-128-GCM + ECP-256',
    dhGroup: 'ECP-256 (Group 19)',
    throughput: '180.0 Mbps',
    latency: '18.1 ms',
    inboundSpi: '0x9924B105',
    outboundSpi: '0x44B12C09',
    rekeySeconds: 1980,
    status: 'ACTIVE'
  },
  {
    id: 'T-04',
    source: 'GW-CORE',
    target: 'GW-MUMBAI',
    name: 'Core ↔ Mumbai Edge Gateway',
    cryptoHealth: 'AEAD',
    cipherSuite: 'AES-256-GCM + MODP-2048',
    dhGroup: 'MODP-2048 (Group 14)',
    throughput: '45.0 Mbps',
    latency: '42.0 ms',
    inboundSpi: '0x1A2B3C4D',
    outboundSpi: '0x4D3C2B1A',
    rekeySeconds: 3450,
    status: 'ACTIVE'
  },
  {
    id: 'T-05',
    source: 'GW-CORE',
    target: 'GW-CF',
    name: 'Core ↔ Cloudflare Magic WAN Edge',
    cryptoHealth: 'AEAD',
    cipherSuite: 'AES-256-GCM + Curve25519',
    dhGroup: 'Curve25519 (Group 31)',
    throughput: '500.0 Mbps',
    latency: '8.5 ms',
    inboundSpi: '0x77E120A0',
    outboundSpi: '0x88A310F1',
    rekeySeconds: 2600,
    status: 'ACTIVE'
  }
];

export function NetworkVisualization() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('GW-CORE');
  const [selectedLinkId, setSelectedLinkId] = useState<string>('T-01');
  const [healthFilter, setHealthFilter] = useState<string>('ALL');

  const selectedNode = GATEWAY_NODES.find(n => n.id === selectedNodeId);
  const selectedLink = TUNNEL_LINKS.find(l => l.id === selectedLinkId);

  const filteredLinks = TUNNEL_LINKS.filter(link => {
    if (healthFilter === 'ALL') return true;
    if (healthFilter === 'AEAD') return link.cryptoHealth === 'AEAD';
    if (healthFilter === 'CBC') return link.cryptoHealth === 'CBC';
    if (healthFilter === 'VULNERABLE') return link.cryptoHealth === 'VULNERABLE';
    return true;
  });

  const getLinkColor = (health: 'AEAD' | 'CBC' | 'VULNERABLE') => {
    switch (health) {
      case 'AEAD':
        return '#ffffff';
      case 'CBC':
        return '#ffffff';
      case 'VULNERABLE':
        return '#ef4444'; // Red for critical / vulnerable
      default:
        return '#ffffff';
    }
  };

  return (
    <div className="network-vis-viewport">
      {/* ── HEADER BANNER ── */}
      <div className="net-header-card">
        <div className="net-header-meta">
          <div className="net-header-badge">
            <Network size={14} />
            <span>Interactive Mesh Topology</span>
          </div>
          <div className="net-legend-row">
            <span className="legend-chip aead">
              <span className="dot" />
              <span>Modern AEAD (GCM / Poly1305)</span>
            </span>
            <span className="legend-chip cbc">
              <span className="dot" />
              <span>CBC Legacy (SHA-256)</span>
            </span>
            <span className="legend-chip vulnerable">
              <span className="dot" />
              <span>Deprecated (Sweet32 / 3DES)</span>
            </span>
          </div>
        </div>

        <div className="net-header-content">
          <div>
            <h2>Distributed Gateway Operations & IPsec Tunnel Mesh</h2>
            <p>
              Interactive topology rendering interconnected security gateways, cloud interconnects, and wireline
              ESP tunnels. Color-coded by authenticated cryptographic strength and rekey health.
            </p>
          </div>

          <div className="net-filter-wrap">
            <Filter size={14} className="text-slate-400" />
            <select
              value={healthFilter}
              onChange={e => setHealthFilter(e.target.value)}
              className="net-select"
            >
              <option value="ALL">All Tunnel Types</option>
              <option value="AEAD">Modern AEAD Only</option>
              <option value="CBC">Legacy CBC Only</option>
              <option value="VULNERABLE">Deprecated / Sweet32</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE TOPOLOGY GRAPH ── */}
      <div className="topology-canvas-card">
        <div className="canvas-header-bar">
          <div className="ch-left">
            <Globe size={16} className="text-sky-400" />
            <span>Live Mesh Canvas: {GATEWAY_NODES.length} Nodes • {TUNNEL_LINKS.length} Encrypted Channels</span>
          </div>
          <span className="ch-right">Click any Node or Link to inspect telemetry</span>
        </div>

        <div className="svg-wrapper">
          <svg viewBox="0 0 960 480" className="topology-svg">
            <defs>
              {/* Linear Gradients for links */}
              <linearGradient id="grad-aead" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="grad-cbc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="grad-vulnerable" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f87171" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#dc2626" stopOpacity="0.3" />
              </linearGradient>

              {/* Node glow filters */}
              <filter id="glow-node" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* TUNNEL LINKS */}
            {filteredLinks.map(link => {
              const srcNode = GATEWAY_NODES.find(n => n.id === link.source);
              const tgtNode = GATEWAY_NODES.find(n => n.id === link.target);
              if (!srcNode || !tgtNode) return null;

              const isSelected = selectedLinkId === link.id;
              const linkColor = getLinkColor(link.cryptoHealth);

              // Calculate midpoint for badge
              const midX = (srcNode.x + tgtNode.x) / 2;
              const midY = (srcNode.y + tgtNode.y) / 2;

              return (
                <g
                  key={link.id}
                  className={`tunnel-link-group ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLinkId(link.id);
                  }}
                >
                  {/* Background wider hit target */}
                  <line
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke="transparent"
                    strokeWidth={20}
                    className="link-hitbox"
                  />

                  {/* Main Link Line */}
                  <line
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke={linkColor}
                    strokeWidth={isSelected ? 3.5 : 2}
                    strokeDasharray={link.cryptoHealth === 'VULNERABLE' ? '6,4' : 'none'}
                    className={`link-path ${link.cryptoHealth.toLowerCase()} ${isSelected ? 'selected' : ''}`}
                  />

                  {/* Animated Particle Packet */}
                  <circle r="3.5" fill="#ffffff" className="animated-flow-dot">
                    <animateMotion
                      path={`M${srcNode.x},${srcNode.y} L${tgtNode.x},${tgtNode.y}`}
                      dur={link.cryptoHealth === 'VULNERABLE' ? '4s' : '1.8s'}
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Link Midpoint Badge (Solid Black) */}
                  <rect
                    x={midX - 38}
                    y={midY - 11}
                    width="76"
                    height="22"
                    rx="11"
                    fill="#000000"
                    stroke={linkColor}
                    strokeWidth={isSelected ? 1.8 : 0.8}
                    className="link-mid-rect"
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    fill={linkColor}
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {link.throughput}
                  </text>
                </g>
              );
            })}

            {/* GATEWAY NODES */}
            {GATEWAY_NODES.map(node => {
              const isSelected = selectedNodeId === node.id;
              const isCore = node.type === 'CORE_GATEWAY';
              const isTop = node.labelPosition === 'top';

              return (
                <g
                  key={node.id}
                  className={`node-group ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(node.id);
                  }}
                  transform={`translate(${node.x}, ${node.y})`}
                >
                  {/* Outer aura (fixed in place - no transform animation) */}
                  <circle
                    r={isCore ? 38 : 28}
                    fill="none"
                    stroke={isSelected ? '#ffffff' : isCore ? 'rgba(255, 255, 255, 0.45)' : 'rgba(148, 163, 184, 0.25)'}
                    strokeWidth={isSelected ? 1.5 : 1}
                    className={`node-aura ${isSelected ? 'pulsing-aura' : ''}`}
                  />

                  {/* Node Body (Solid Black) */}
                  <circle
                    r={isCore ? 28 : 20}
                    fill="#000000"
                    stroke={isSelected ? '#ffffff' : isCore ? '#e2e8f0' : '#475569'}
                    strokeWidth={isSelected ? 2.8 : 1.5}
                    className="node-circle"
                  />

                  {/* Inner Node Icon Indicator */}
                  <circle
                    r={isCore ? 10 : 7}
                    fill={node.health === 'HEALTHY' ? '#ffffff' : '#ef4444'}
                    className="node-status-core"
                  />

                  {/* Node Label Text */}
                  <text
                    y={isTop ? -32 : isCore ? 46 : 38}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle"
                    className="node-name-text"
                  >
                    {node.name}
                  </text>
                  <text
                    y={isTop ? -18 : isCore ? 60 : 50}
                    fill="#94a3b8"
                    fontSize="9.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {node.ip}
                  </text>
                </g>
              );
            })}
            {GATEWAY_NODES.length === 0 && (
              <text x="480" y="240" fill="#64748b" textAnchor="middle" fontSize="13">
                No network gateway nodes or active tunnels loaded.
              </text>
            )}
          </svg>
        </div>
      </div>

      {/* ── TELEMETRY DOSSIER PANELS (SELECTED NODE & LINK) ── */}
      <div className="net-dossier-grid">
        {/* Selected Gateway Node Telemetry */}
        <div className="net-dossier-card">
          <div className="dossier-header">
            <Server size={18} className="text-sky-400" />
            <div>
              <h3>Security Gateway Node Telemetry</h3>
              <p>Physical/Virtual gateway parameters and crypto offload status.</p>
            </div>
          </div>

          {selectedNode ? (
            <>
              <div className="dossier-meta-row">
                <span className="d-title">{selectedNode.name}</span>
                <span className={`d-health-chip ${selectedNode.health.toLowerCase()}`}>
                  {selectedNode.health === 'HEALTHY' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                  {selectedNode.health}
                </span>
              </div>

              <div className="dossier-specs-grid">
                <div className="d-spec-cell">
                  <span className="lbl">IP Address:</span>
                  <code>{selectedNode.ip}</code>
                </div>
                <div className="d-spec-cell">
                  <span className="lbl">Region / Zone:</span>
                  <span className="val">{selectedNode.region}</span>
                </div>
                <div className="d-spec-cell">
                  <span className="lbl">Vendor & Engine:</span>
                  <span className="val">{selectedNode.vendor}</span>
                </div>
                <div className="d-spec-cell">
                  <span className="lbl">Active Child SAs:</span>
                  <span className="val font-mono">{selectedNode.activeTunnels} Tunnels</span>
                </div>
                <div className="d-spec-cell">
                  <span className="lbl">Hardware Offload:</span>
                  <span className="val text-emerald-400">AES-NI / Intel QAT Active</span>
                </div>
                <div className="d-spec-cell">
                  <span className="lbl">Tunnel Role:</span>
                  <span className="val text-sky-400">{selectedNode.type.replace('_', ' ')}</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
              No gateway node selected.
            </div>
          )}
        </div>

        {/* Selected IPsec Tunnel Link Telemetry */}
        <div className="net-dossier-card">
          <div className="dossier-header">
            <Lock size={18} className="text-emerald-400" />
            <div>
              <h3>IPsec Wireline Tunnel Security Dossier</h3>
              <p>Cryptographic parameters, SPI identifiers, and rekey timer.</p>
            </div>
          </div>

          {selectedLink ? (
            <>
              <div className="dossier-meta-row">
                <span className="d-title">{selectedLink.name}</span>
                <span className={`d-crypto-chip ${selectedLink.cryptoHealth.toLowerCase()}`}>
                  {selectedLink.cryptoHealth === 'AEAD' && <ShieldCheck size={13} />}
                  {selectedLink.cryptoHealth === 'CBC' && <AlertTriangle size={13} />}
                  {selectedLink.cryptoHealth === 'VULNERABLE' && <ShieldAlert size={13} />}
                  <span>{selectedLink.cryptoHealth === 'AEAD' ? 'Hardened AEAD' : selectedLink.cryptoHealth === 'CBC' ? 'Legacy CBC' : 'Sweet32 Vulnerable'}</span>
                </span>
              </div>

              <div className="dossier-specs-grid">
                <div className="d-spec-cell">
                  <span className="lbl">Cipher Suite:</span>
                  <span className="val font-mono text-emerald-400">{selectedLink.cipherSuite}</span>
                </div>
                <div className="d-spec-cell">
                  <span className="lbl">Key Exchange (D-H):</span>
                  <span className="val font-mono text-purple-400">{selectedLink.dhGroup}</span>
                </div>
                <div className="d-spec-cell">
                  <span className="lbl">Wireline SPI (In / Out):</span>
                  <code>{selectedLink.inboundSpi} / {selectedLink.outboundSpi}</code>
                </div>
                <div className="d-spec-cell">
                  <span className="lbl">Wireline Throughput:</span>
                  <span className="val text-sky-400 font-bold">{selectedLink.throughput}</span>
                </div>
                <div className="d-spec-cell">
                  <span className="lbl">Round-Trip Latency:</span>
                  <span className="val">{selectedLink.latency}</span>
                </div>
                <div className="d-spec-cell">
                  <span className="lbl">SA Rekey Countdown:</span>
                  <span className="val text-amber-400 font-mono font-bold">{selectedLink.rekeySeconds}s remaining</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
              No tunnel channel selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
