import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Activity,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Zap,
  Play,
  FileText,
  CheckCircle2,
  XCircle,
  Database,
  Wifi,
  Server,
  Cpu,
  Download,
  Sliders,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  X,
  Copy,
  Check,
  Fingerprint,
  FileCode,
  Terminal,
  Layers
} from 'lucide-react';
import './Overview.css';
import { pcapStore } from '../services/pcapStore';
import { ParsedPcapSummary } from '../utils/pcapParser';

export type ScenarioType = 'baseline' | 'sweet32' | 'replay';

interface TunnelData {
  id: string;
  name: string;
  srcEndpoint: string;
  dstEndpoint: string;
  proto: string;
  port: number;
  encCipher: string;
  integCipher: string;
  dhGroup: string;
  authMethod: string;
  replayWindowSize: number;
  replayHeadSeq: number;
  replayDroppedCount: number;
  replayBitmap: boolean[]; // 16 samples for mini-bitmap view
  status: 'optimal' | 'vulnerable' | 'attack';
  cveAlert?: string;
  latencyMs: number;
  throughputMbps: number;
}

export interface ForensicFinding {
  code: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cve?: string;
  deduction: number;
}

export interface ForensicAudit {
  id: string;
  name: string;
  timestamp: string;
  packetsAudited: string;
  sessionsCount: number;
  highRiskCount: number;
  criticalRiskCount: number;
  compositeScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'Verified' | 'Flagged' | 'Action Required';
  sha256: string;
  captureSize: string;
  wirelineDuration: string;
  linkLayer: string;
  ciphersDetected: string[];
  dhGroupsDetected: string[];
  findingsList: ForensicFinding[];
  rawHexDump: string;
}


const RADAR_DIMENSIONS = [
  { key: 'cipher', label: 'Cipher Strength', max: 100 },
  { key: 'dh', label: 'Key Exchange (DH)', max: 100 },
  { key: 'pfs', label: 'Forward Secrecy (PFS)', max: 100 },
  { key: 'auth', label: 'Auth Integrity', max: 100 },
  { key: 'replay', label: 'Anti-Replay Protection', max: 100 },
  { key: 'compliance', label: 'RFC Compliance', max: 100 },
] as const;

export interface OverviewProps {
  initialScenario?: ScenarioType;
}

export function Overview({ initialScenario }: OverviewProps = {}) {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>(initialScenario || 'baseline');

  useEffect(() => {
    if (initialScenario) {
      setActiveScenario(initialScenario);
    }
  }, [initialScenario]);
  const [selectedTunnelId, setSelectedTunnelId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'optimal' | 'vulnerable' | 'attack'>('all');
  const [isAuditing, setIsAuditing] = useState(false);
  const [summary, setSummary] = useState<ParsedPcapSummary | null>(() => pcapStore.getSummary());

  const [selectedAudit, setSelectedAudit] = useState<ForensicAudit | null>(null);
  const [copiedSha, setCopiedSha] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsub = pcapStore.subscribe(setSummary);
    if (!pcapStore.getSummary()) {
      pcapStore.loadDefaultPcap().then((s) => {
        if (s) setSummary(s);
      });
    }
    return () => unsub();
  }, []);

  const totalPkts = summary?.packetCount || '3,962';
  const totalPktsNum = summary?.packetCountNum || 3962;
  const activeFileName = summary?.fileName || 'pcap-1.pcap';
  const activeSha = summary?.sha256 || '5d63962574f2ebf33610a26b80ea2e28b8d5d9d06156aea4d8f123d730a7d648';

  const handleCopySha = (sha: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(sha);
    }
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const handleDownloadArtifact = (audit: ForensicAudit) => {
    const artifactData = {
      auditId: audit.id,
      name: audit.name,
      timestamp: audit.timestamp,
      sha256Seal: audit.sha256,
      captureMetrics: {
        packetsAudited: audit.packetsAudited,
        fileSize: audit.captureSize,
        duration: audit.wirelineDuration,
        linkLayer: audit.linkLayer,
        activeSessions: audit.sessionsCount
      },
      evaluation: {
        compositeScore: audit.compositeScore,
        grade: audit.grade,
        status: audit.status,
        criticalFindings: audit.criticalRiskCount,
        highRiskFindings: audit.highRiskCount
      },
      cryptographicProfile: {
        ciphers: audit.ciphersDetected,
        dhGroups: audit.dhGroupsDetected,
        antiReplayWindow: 'RFC 4303 64-Packet Sliding Window'
      },
      findingsLedger: audit.findingsList,
      rawPacketEvidence: audit.rawHexDump
    };

    const blob = new Blob([JSON.stringify(artifactData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${audit.id}-forensic-artifact.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(`Artifact ${audit.id} downloaded successfully.`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handleExportAllAudits = () => {
    const allData = {
      archiveTitle: 'IPsec FlowGuard Historical Forensic Audits Archive',
      exportedAt: new Date().toISOString(),
      activeSha256: activeSha,
      runs: audits
    };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-archive-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess('Consolidated audit archive exported.');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };


  // Scenario-based dynamic configurations
  const scenarioConfig = {
    baseline: {
      overallScore: '98',
      grade: 'A+' as const,
      statusLabel: 'Cryptographic Posture Monitoring',
      statusColor: '#ffffff',
      totalPackets: totalPkts,
      activeTunnelsCount: '6',
      criticalFindings: '0',
      highRiskCount: '0',
      capturesAudited: '1',
      averageScore: '98.4',
      ipsecSessions: '2',
      compositeScore: '98',
      radarScores: {
        cipher: 96,
        dh: 94,
        pfs: 98,
        auth: 95,
        replay: 100,
        compliance: 98,
      },
      alertBanner: null as { type: string; title: string; message: string } | null,
    },
    sweet32: {
      overallScore: '64',
      grade: 'C' as const,
      statusLabel: 'Legacy 64-bit Block Cipher Detection Mode',
      statusColor: '#ef4444',
      totalPackets: totalPkts,
      activeTunnelsCount: '6',
      criticalFindings: '1',
      highRiskCount: '2',
      capturesAudited: '1',
      averageScore: '74.2',
      ipsecSessions: '2',
      compositeScore: '64',
      radarScores: {
        cipher: 35,
        dh: 75,
        pfs: 60,
        auth: 80,
        replay: 95,
        compliance: 50,
      },
      alertBanner: {
        type: 'critical',
        title: 'SWEET32 VULNERABILITY DETECTED (CVE-2016-2183)',
        message: 'Tunnel TUN-05 is utilizing legacy 64-bit block cipher 3DES-CBC. Birthday bound collision attack feasible.'
      },
    },
    replay: {
      overallScore: '72',
      grade: 'B' as const,
      statusLabel: 'Sequence Anti-Replay Detection Mode',
      statusColor: '#ef4444',
      totalPackets: totalPkts,
      activeTunnelsCount: '6',
      criticalFindings: '2',
      highRiskCount: '1',
      capturesAudited: '1',
      averageScore: '81.0',
      ipsecSessions: '2',
      compositeScore: '72',
      radarScores: {
        cipher: 95,
        dh: 90,
        pfs: 95,
        auth: 85,
        replay: 30,
        compliance: 65,
      },
      alertBanner: {
        type: 'critical',
        title: 'RFC 4303 ANTI-REPLAY SEQUENCE VIOLATION',
        message: 'Duplicate sequence numbers injected on Core Ingress tunnel. 2 frames dropped by anti-replay sliding window.'
      },
    },
  }[activeScenario];

  // Active tunnels dataset
  const tunnels: TunnelData[] = [
    {
      id: 'TUN-01',
      name: 'Core Ingress Gateway Interconnect',
      srcEndpoint: summary?.dissectedPackets?.[0]?.srcIp || '192.168.1.104',
      dstEndpoint: summary?.dissectedPackets?.[0]?.dstIp || '192.168.1.1',
      proto: 'ESP (0x32)',
      port: 4500,
      encCipher: 'AES-256-GCM',
      integCipher: 'AEAD (128-bit ICV)',
      dhGroup: 'Group 31 (Curve25519)',
      authMethod: 'RSA-PSS / X.509',
      replayWindowSize: 64,
      replayHeadSeq: totalPktsNum,
      replayDroppedCount: activeScenario === 'replay' ? 2 : 0,
      replayBitmap: Array.from({ length: 16 }, (_, i) => (activeScenario === 'replay' && i === 3 ? false : true)),
      status: activeScenario === 'replay' ? 'attack' : 'optimal',
      cveAlert: activeScenario === 'replay' ? 'RFC 4303 Replay Violation' : undefined,
      latencyMs: 1.2,
      throughputMbps: 104.5
    },
    {
      id: 'TUN-02',
      name: 'AWS US-East VPC Transit Hub',
      srcEndpoint: '10.240.0.1',
      dstEndpoint: '54.210.14.8',
      proto: 'ESP (0x32)',
      port: 4500,
      encCipher: 'ChaCha20-Poly1305',
      integCipher: 'AEAD Poly1305',
      dhGroup: 'Group 14 (MODP 2048)',
      authMethod: 'Pre-Shared Key (AES-CMAC)',
      replayWindowSize: 64,
      replayHeadSeq: Math.floor(totalPktsNum * 0.65),
      replayDroppedCount: 0,
      replayBitmap: Array.from({ length: 16 }, () => true),
      status: 'optimal',
      latencyMs: 14.8,
      throughputMbps: 350.0
    },
    {
      id: 'TUN-03',
      name: 'Azure EU-Central Frankfurt Hub',
      srcEndpoint: '172.16.4.20',
      dstEndpoint: '20.52.18.91',
      proto: 'ESP (0x32)',
      port: 500,
      encCipher: 'AES-256-GCM',
      integCipher: 'AEAD (128-bit ICV)',
      dhGroup: 'Group 20 (ECP-384)',
      authMethod: 'ECDSA-SHA384',
      replayWindowSize: 64,
      replayHeadSeq: Math.floor(totalPktsNum * 0.42),
      replayDroppedCount: 0,
      replayBitmap: Array.from({ length: 16 }, () => true),
      status: 'optimal',
      latencyMs: 22.4,
      throughputMbps: 210.0
    },
    {
      id: 'TUN-04',
      name: 'Google Cloud CloudVPN (us-central1)',
      srcEndpoint: '35.192.0.10',
      dstEndpoint: '10.128.0.5',
      proto: 'ESP (0x32)',
      port: 4500,
      encCipher: 'AES-128-GCM',
      integCipher: 'AEAD (128-bit ICV)',
      dhGroup: 'Group 19 (ECP-256)',
      authMethod: 'RSA-PSS / X.509',
      replayWindowSize: 64,
      replayHeadSeq: Math.floor(totalPktsNum * 0.28),
      replayDroppedCount: 0,
      replayBitmap: Array.from({ length: 16 }, () => true),
      status: 'optimal',
      latencyMs: 18.1,
      throughputMbps: 180.0
    },
    {
      id: 'TUN-05',
      name: 'Branch Office Mumbai Ingress Edge',
      srcEndpoint: '192.168.10.1',
      dstEndpoint: '103.21.244.2',
      proto: 'ESP (0x32)',
      port: 500,
      encCipher: activeScenario === 'sweet32' ? '3DES-CBC' : 'AES-256-CBC',
      integCipher: activeScenario === 'sweet32' ? 'HMAC-SHA1' : 'HMAC-SHA256-128',
      dhGroup: activeScenario === 'sweet32' ? 'Group 2 (MODP 1024)' : 'Group 14 (MODP 2048)',
      authMethod: 'PSK',
      replayWindowSize: 64,
      replayHeadSeq: Math.floor(totalPktsNum * 0.15),
      replayDroppedCount: 0,
      replayBitmap: Array.from({ length: 16 }, () => true),
      status: activeScenario === 'sweet32' ? 'vulnerable' : 'optimal',
      cveAlert: activeScenario === 'sweet32' ? 'CVE-2016-2183 (Sweet32 64-bit Block)' : undefined,
      latencyMs: 42.0,
      throughputMbps: 45.0
    },
    {
      id: 'TUN-06',
      name: 'Cloudflare Magic WAN Interconnect',
      srcEndpoint: '162.158.0.1',
      dstEndpoint: '10.0.0.1',
      proto: 'ESP (0x32)',
      port: 4500,
      encCipher: 'AES-256-GCM',
      integCipher: 'AEAD (128-bit ICV)',
      dhGroup: 'Group 31 (Curve25519)',
      authMethod: 'Pre-Shared Key',
      replayWindowSize: 64,
      replayHeadSeq: Math.floor(totalPktsNum * 0.85),
      replayDroppedCount: 0,
      replayBitmap: Array.from({ length: 16 }, () => true),
      status: 'optimal',
      latencyMs: 8.5,
      throughputMbps: 500.0
    }
  ];

  // Forensic Audits History dataset
  const audits: ForensicAudit[] = [
    {
      id: `AUD-2026-${activeSha.slice(0, 6).toUpperCase()}`,
      name: `Wireline Ingestion (${activeFileName})`,
      timestamp: '2026-09-26 12:04:18 UTC',
      packetsAudited: `${totalPkts} pkts`,
      sessionsCount: 2,
      highRiskCount: activeScenario === 'sweet32' ? 2 : 0,
      criticalRiskCount: activeScenario === 'sweet32' || activeScenario === 'replay' ? 1 : 0,
      compositeScore: Number(scenarioConfig.overallScore) || 98,
      grade: scenarioConfig.grade || 'A+',
      status: activeScenario === 'baseline' ? 'Verified' : 'Flagged',
      sha256: activeSha,
      captureSize: summary?.fileSize || '1.08 MB',
      wirelineDuration: '14.28s (3,962 frames)',
      linkLayer: 'IEEE 802.3 Ethernet / IP Protocol 50 (ESP)',
      ciphersDetected: activeScenario === 'sweet32' ? ['3DES-CBC (64-bit Block)', 'AES-256-CBC'] : ['AES-256-GCM', 'ChaCha20-Poly1305'],
      dhGroupsDetected: activeScenario === 'sweet32' ? ['MODP Group 2 (1024-bit)', 'MODP Group 14 (2048-bit)'] : ['Group 31 (Curve25519)', 'Group 20 (ECP-384)'],
      findingsList: activeScenario === 'sweet32' ? [
        { code: 'FND-01', title: 'Sweet32 64-bit Block Cipher Collision Vulnerability', severity: 'CRITICAL', cve: 'CVE-2016-2183', deduction: -25 },
        { code: 'FND-02', title: 'Deprecated MODP 1024-bit Diffie-Hellman Group 2', severity: 'HIGH', cve: 'RFC 8247 §2.4', deduction: -15 },
        { code: 'FND-03', title: 'Broken SHA-1 HMAC Authentication in IPsec Proposal', severity: 'HIGH', cve: 'NIST SP 800-131A', deduction: -15 }
      ] : activeScenario === 'replay' ? [
        { code: 'FND-04', title: 'RFC 4303 Anti-Replay Sliding Window Sequence Breach', severity: 'CRITICAL', cve: 'RFC 4303 §3.4.3', deduction: -25 },
        { code: 'FND-05', title: 'Out-of-Order Frame Window Rejection (2 Packets Dropped)', severity: 'HIGH', cve: 'CWE-294', deduction: -15 }
      ] : [
        { code: 'VER-01', title: 'All cryptographic proposals conform to RFC 8247 / RFC 8221 strict guidelines', severity: 'LOW', deduction: 0 }
      ],
      rawHexDump: `0000   00 1a 4b a2 3c 11 00 25 90 e4 f1 a2 08 00 45 00  ..K.<..%......E.
0010   01 28 4f a1 40 00 40 11 b2 19 c0 a8 01 68 c0 a8  .(O.@.@....h..
0020   01 01 11 94 11 94 01 14 3f c8 00 00 00 00 7c 49  ........?.....|I
0030   e2 10 8a 12 f4 01 2e 20 22 20 00 00 00 00 00 00  ....... " ......
0040   01 08 22 00 00 30 00 00 00 2c 01 01 00 04 03 00  .."..0...,......
0050   00 0c 01 00 00 14 80 0e 01 00 03 00 00 08 03 00  ................`
    },
    {
      id: 'AUD-2026-PRI-01',
      name: 'Multi-Cloud Mesh Periodic Sweep',
      timestamp: '2026-09-25 18:30:00 UTC',
      packetsAudited: '8,940 pkts',
      sessionsCount: 6,
      highRiskCount: 0,
      criticalRiskCount: 0,
      compositeScore: 99,
      grade: 'A+',
      status: 'Verified',
      sha256: '9b3f18e97a23c4d5e891230f89a1c238b7e21a89c92e54109842a129d81e35a1',
      captureSize: '2.45 MB',
      wirelineDuration: '32.10s (8,940 frames)',
      linkLayer: 'IEEE 802.3 Ethernet / Multi-Cloud Mesh Transit',
      ciphersDetected: ['AES-256-GCM', 'ChaCha20-Poly1305'],
      dhGroupsDetected: ['Group 31 (Curve25519)', 'Group 14 (MODP 2048)'],
      findingsList: [
        { code: 'VER-02', title: 'Full mesh AEAD isolation verified across AWS, Azure, and GCP VPC transits', severity: 'LOW', deduction: 0 }
      ],
      rawHexDump: `0000   52 54 00 12 35 02 08 00 27 6c e2 d5 08 00 45 00  RT..5...'l....E.
0010   00 f8 91 2b 40 00 40 11 70 b3 0a f0 00 01 36 d2  ...+@.@.p.....6.
0020   0e 08 11 94 11 94 00 e4 a1 12 00 00 00 00 4a 12  ..............J.
0030   8c 90 91 a4 f5 12 2e 20 23 20 00 00 00 01 00 00  ....... # ......`
    },
    {
      id: 'AUD-2026-PRI-02',
      name: 'Perimeter Gateway Ingress Baseline',
      timestamp: '2026-09-24 09:15:22 UTC',
      packetsAudited: '4,120 pkts',
      sessionsCount: 3,
      highRiskCount: 0,
      criticalRiskCount: 0,
      compositeScore: 97,
      grade: 'A+',
      status: 'Verified',
      sha256: '4e8a10b991c2847d01829e120f81a74e5b29c019d45a90184b29c1e0819a7124',
      captureSize: '1.15 MB',
      wirelineDuration: '18.45s (4,120 frames)',
      linkLayer: 'IEEE 802.3 Ethernet / Edge Router Ingress',
      ciphersDetected: ['AES-256-GCM', 'AES-128-GCM'],
      dhGroupsDetected: ['Group 20 (ECP-384)', 'Group 19 (ECP-256)'],
      findingsList: [
        { code: 'VER-03', title: 'Perimeter border gateway proposals conform to NIST SP 800-77 Rev. 1', severity: 'LOW', deduction: 0 }
      ],
      rawHexDump: `0000   00 50 56 c0 00 08 00 0c 29 3b 1a 44 08 00 45 00  .PV.....);.D..E.
0010   01 10 a2 14 40 00 40 11 61 a0 ac 10 04 14 14 34  ....@.@.a......4
0020   12 5b 01 f4 01 f4 00 fc 9c 81 5d a2 41 09 88 e1  .[........].A...
0030   30 08 21 20 22 20 00 00 00 00 00 00 00 ec 22 00  0.! " ........".`
    }
  ];


  const handleScenarioChange = (scenario: ScenarioType) => {
    setIsAuditing(true);
    setActiveScenario(scenario);
    setTimeout(() => {
      setIsAuditing(false);
    }, 600);
  };

  const filteredTunnels = tunnels.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesQuery = !filterQuery ||
      t.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.encCipher.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.srcEndpoint.includes(filterQuery) ||
      t.dstEndpoint.includes(filterQuery);
    return matchesStatus && matchesQuery;
  });

  // Helper for generating SVG Radar Chart Points
  const getRadarCoordinates = (scores: typeof scenarioConfig.radarScores, size = 340) => {
    const center = size / 2;
    const radius = center - 52;
    const angleStep = (Math.PI * 2) / RADAR_DIMENSIONS.length;

    const points = RADAR_DIMENSIONS.map((dim, index) => {
      const score = scores[dim.key as keyof typeof scores];
      const normalized = Math.max(10, Math.min(100, score)) / 100;
      const angle = index * angleStep - Math.PI / 2;
      const x = center + radius * normalized * Math.cos(angle);
      const y = center + radius * normalized * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return points.join(' ');
  };

  const getAxisPoints = (index: number, size = 340) => {
    const center = size / 2;
    const radius = center - 52;
    const angleStep = (Math.PI * 2) / RADAR_DIMENSIONS.length;
    const angle = index * angleStep - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { center, x, y };
  };

  return (
    <div className={`overview-container ${isAuditing ? 'auditing-pulse' : ''}`}>
      {/* ── FAST SCENARIO TRIGGER CONTROLS ── */}
      <section className="scenario-toolbar">
        <div className="scenario-title-group">
          <div className="scenario-label-pill">
            <Zap size={14} className="accent-icon" />
            <span>Fast Threat Scenario Simulation</span>
          </div>
          <span className="scenario-hint">Click below to simulate real-world attack vectors on IPsec infrastructure:</span>
        </div>

        <div className="scenario-btn-group">
          <button
            type="button"
            className={`scenario-btn ${activeScenario === 'baseline' ? 'active-baseline' : ''}`}
            onClick={() => handleScenarioChange('baseline')}
            title="Clean standard baseline with strict crypto and zero drops"
          >
            <CheckCircle2 size={16} />
            <span className="btn-label-bold">Clean Baseline</span>
            <span className="btn-subtext">AES-GCM · PFS Active</span>
          </button>

          <button
            type="button"
            className={`scenario-btn ${activeScenario === 'sweet32' ? 'active-sweet32' : ''}`}
            onClick={() => handleScenarioChange('sweet32')}
            title="Simulate 3DES-CBC weak 64-bit cipher (CVE-2016-2183)"
          >
            <AlertTriangle size={16} />
            <span className="btn-label-bold">Sweet32 Vulnerable</span>
            <span className="btn-subtext">3DES-CBC · CVE-2016-2183</span>
          </button>

          <button
            type="button"
            className={`scenario-btn ${activeScenario === 'replay' ? 'active-replay' : ''}`}
            onClick={() => handleScenarioChange('replay')}
            title="Simulate injection of duplicate sequence numbers and anti-replay window breaches"
          >
            <ShieldAlert size={16} />
            <span className="btn-label-bold">Replay Attack</span>
            <span className="btn-subtext">Seq # Window Breach</span>
          </button>
        </div>
      </section>

      {/* ── SCENARIO ALERT BANNER (If Active) ── */}
      {scenarioConfig.alertBanner && (
        <aside className={`scenario-alert-banner ${scenarioConfig.alertBanner.type}`}>
          <div className="alert-banner-icon">
            {scenarioConfig.alertBanner.type === 'danger' ? <ShieldX size={22} /> : <AlertTriangle size={22} />}
          </div>
          <div className="alert-banner-text">
            <h4 className="alert-banner-title">{scenarioConfig.alertBanner.title}</h4>
            <p className="alert-banner-msg">{scenarioConfig.alertBanner.message}</p>
          </div>
          <button
            type="button"
            className="alert-resolve-btn"
            onClick={() => handleScenarioChange('baseline')}
          >
            Apply Hardened Fix
          </button>
        </aside>
      )}

      {/* ── EXECUTIVE SOC POSTURE SUMMARY CARDS ── */}
      <section className="soc-summary-cards-grid">
        {/* Overall Posture Score Card */}
        <div className="soc-card score-highlight-card">
          <div className="soc-card-header">
            <span className="card-kicker">Overall Posture Score</span>
            <span className="grade-badge" style={{ borderColor: scenarioConfig.statusColor, color: scenarioConfig.statusColor }}>
              {scenarioConfig.grade}
            </span>
          </div>
          <div className="score-main-display">
            <div className="score-meter-wrap">
              <svg viewBox="0 0 36 36" className="score-meter-svg">
                <path
                  className="meter-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="meter-stroke"
                  strokeDasharray="0, 100"
                  stroke={scenarioConfig.statusColor}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="meter-value">
                <span className="score-num">{scenarioConfig.overallScore}</span>
                <span className="score-denom"></span>
              </div>
            </div>
            <div className="score-details">
              <span className="score-status-text" style={{ color: scenarioConfig.statusColor }}>
                {scenarioConfig.statusLabel}
              </span>
              <div className="score-trend-row">
              </div>
            </div>
          </div>
          <div className="soc-card-footer">
            <span>Composite Score: <strong>{scenarioConfig.compositeScore}</strong></span>
            <span className="footer-subtext">Weighted NIST SP 800-77</span>
          </div>
        </div>

        {/* Total Packets Evaluated */}
        <div className="soc-card">
          <div className="soc-card-header">
            <span className="card-kicker">Total Packets Evaluated</span>
            <div className="kicker-icon bg-cyan">
              <Activity size={16} />
            </div>
          </div>
          <div className="card-metric-large">{scenarioConfig.totalPackets}</div>
          <div className="card-sub-info">
            <span className="metric-pill cyan">Wireline Inspection</span>
            <span className="sub-stat"></span>
          </div>
          <div className="soc-card-footer">
            <span>IPsec Sessions: <strong>{scenarioConfig.ipsecSessions}</strong></span>
            <span className="footer-subtext">IKE_SA + ESP</span>
          </div>
        </div>

        {/* Active Tunnels Card */}
        <div className="soc-card">
          <div className="soc-card-header">
            <span className="card-kicker">Active IPsec Tunnels</span>
            <div className="kicker-icon bg-green">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="card-metric-large">{scenarioConfig.activeTunnelsCount}</div>
          <div className="card-sub-info">
            <span className="metric-pill green">Multi-Cloud Mesh</span>
            <span className="sub-stat"></span>
          </div>
          <div className="soc-card-footer">
            <span>Average Score: <strong>{scenarioConfig.averageScore}</strong></span>
            <span className="footer-subtext">Across all tunnels</span>
          </div>
        </div>

        {/* Critical & High Findings */}
        <div className="soc-card">
          <div className="soc-card-header">
            <span className="card-kicker">Risk & Critical Findings</span>
            <div className="kicker-icon bg-green">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="card-metric-large">
            {scenarioConfig.criticalFindings}
          </div>
          <div className="card-sub-info">
            <span className="metric-pill green">
              Continuous Auditing
            </span>
            <span className="sub-stat"></span>
          </div>
          <div className="soc-card-footer">
            <span>Captures Audited: <strong>{scenarioConfig.capturesAudited}</strong></span>
            <span className="footer-subtext">Live PCAP / Traces</span>
          </div>
        </div>
      </section>

      {/* ── 6-DIMENSIONAL HEALTH VISUALIZER (RADAR CHART & DIMENSIONS) ── */}
      <section className="health-visualizer-section">
        <div className="section-head-row">
          <div>
            <h3 className="section-title">6-Dimensional Cryptographic & Protocol Health Matrix</h3>
            <p className="section-desc">
              Holistic multidimensional vector analyzing cryptographic primitives, Diffie-Hellman hardness, key lifecycle, authentication proofs, anti-replay state, and RFC protocol standards.
            </p>
          </div>
          <div className="audit-tag-pill">
            <Cpu size={14} />
            <span>AI Automated Assessment Engine</span>
          </div>
        </div>

        <div className="visualizer-grid">
          {/* Radar Chart Display */}
          <div className="radar-chart-card">
            <div className="radar-chart-title-bar">
              <span className="chart-legend-dot" style={{ backgroundColor: scenarioConfig.statusColor }} />
              <span className="chart-legend-label">Current Posture Topology</span>
            </div>

            <div className="radar-svg-container">
              <svg viewBox="0 0 340 340" className="radar-svg">
                {/* Concentric rings */}
                {[0.25, 0.5, 0.75, 1.0].map((level, i) => (
                  <circle
                    key={i}
                    cx="170"
                    cy="170"
                    r={(170 - 52) * level}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeDasharray={level === 1.0 ? 'none' : '3 3'}
                    strokeWidth="1"
                  />
                ))}

                {/* Radial axes */}
                {RADAR_DIMENSIONS.map((_, i) => {
                  const { center, x, y } = getAxisPoints(i, 340);
                  return (
                    <line
                      key={i}
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.12)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Radar Polygon */}
                {Object.values(scenarioConfig.radarScores).some(s => s > 0) && (
                  <polygon
                    points={getRadarCoordinates(scenarioConfig.radarScores, 340)}
                    fill={`${scenarioConfig.statusColor}22`}
                    stroke={scenarioConfig.statusColor}
                    strokeWidth="2.5"
                    className="radar-polygon-active"
                  />
                )}

                {/* Radar Vertex Points */}
                {Object.values(scenarioConfig.radarScores).some(s => s > 0) && RADAR_DIMENSIONS.map((dim, i) => {
                  const score = scenarioConfig.radarScores[dim.key as keyof typeof scenarioConfig.radarScores];
                  const normalized = Math.max(10, Math.min(100, score)) / 100;
                  const angle = (i * (Math.PI * 2)) / RADAR_DIMENSIONS.length - Math.PI / 2;
                  const x = 170 + (170 - 52) * normalized * Math.cos(angle);
                  const y = 170 + (170 - 52) * normalized * Math.sin(angle);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="4.5"
                      fill="#ffffff"
                      stroke={scenarioConfig.statusColor}
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Axis Labels */}
                {RADAR_DIMENSIONS.map((dim, i) => {
                  const angle = (i * (Math.PI * 2)) / RADAR_DIMENSIONS.length - Math.PI / 2;
                  const labelRadius = 170 - 18;
                  const lx = 170 + labelRadius * Math.cos(angle);
                  const ly = 170 + labelRadius * Math.sin(angle) + 4;
                  return (
                    <text
                      key={i}
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      className="radar-axis-text"
                    >
                      {dim.label}
                    </text>
                  );
                })}
              </svg>
            </div>
            <div className="radar-card-footnote">
              <span>Center = 0% · Outer Ring = 100% (Hardened)</span>
            </div>

            <div className="radar-quick-posture-tags">
              <div className="posture-tag-item">
                <span className="p-tag-label">NIST SP 800-77</span>
                <span className="p-tag-val val-green">Compliant</span>
              </div>
              <div className="posture-tag-item">
                <span className="p-tag-label">PFS Key Rotation</span>
                <span className="p-tag-val val-green">3600s Auto</span>
              </div>
              <div className="posture-tag-item">
                <span className="p-tag-label">Replay Bitmask</span>
                <span className={`p-tag-val ${activeScenario === 'replay' ? 'val-red' : 'val-green'}`}>
                  {activeScenario === 'replay' ? 'Violation Flagged' : '128-bit RFC 4303'}
                </span>
              </div>
            </div>
          </div>

          {/* Dimension Breakdown Bars */}
          <div className="dimension-bars-card">
            <h4 className="dimension-bars-title">Dimension Breakdown & Primitive Verification</h4>
            <div className="dimension-bars-list">
              {RADAR_DIMENSIONS.map((dim) => {
                const score = scenarioConfig.radarScores[dim.key as keyof typeof scenarioConfig.radarScores];
                return (
                  <div key={dim.key} className="dimension-row">
                    <div className="dim-row-header">
                      <span className="dim-name">{dim.label}</span>
                      <span className="dim-score">{score > 0 ? `${score} / 100` : ''}</span>
                    </div>
                    <div className="dim-bar-track">
                      <div
                        className="dim-bar-fill"
                        style={{
                          width: `${score}%`,
                          backgroundColor: '#ffffff',
                        }}
                      />
                    </div>
                    <div className="dim-sub-caption">
                      {dim.key === 'cipher' && 'AES-256-GCM / ChaCha20-Poly1305 (Authenticated AEAD)'}
                      {dim.key === 'dh' && 'Curve25519 (Group 31) / ECP-384 (Group 20) Active'}
                      {dim.key === 'pfs' && 'PFS Key Re-generation every 3600s / 100GB'}
                      {dim.key === 'auth' && 'RSA-PSS 4096-bit & Ed25519 Cryptographic Signatures'}
                      {dim.key === 'replay' && 'RFC 4303 128-bit Sliding Anti-Replay Bitmap Active'}
                      {dim.key === 'compliance' && 'Strict NIST SP 800-77 Rev. 1 & FIPS 140-3 Compliant'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── ACTIVE TUNNELS TABLE WITH REPLAY WINDOW STATE ── */}
      <section className="active-tunnels-section">
        <div className="section-head-row">
          <div>
            <h3 className="section-title">Active IPsec Tunnels & Anti-Replay Sliding Window State</h3>
            <p className="section-desc">
              Real-time monitoring of Security Associations (SAs), cryptographic parameters, and live 128-bit replay window bitmasks.
            </p>
          </div>
          <div className="table-controls-group">
            <div className="tunnel-filter-pills">
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All ({tunnels.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'optimal' ? 'active' : ''}`}
                onClick={() => setStatusFilter('optimal')}
              >
                Secure ({tunnels.filter(t => t.status === 'optimal').length})
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'vulnerable' ? 'active' : ''}`}
                onClick={() => setStatusFilter('vulnerable')}
              >
                Vulnerable ({tunnels.filter(t => t.status === 'vulnerable').length})
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'attack' ? 'active' : ''}`}
                onClick={() => setStatusFilter('attack')}
              >
                Attack ({tunnels.filter(t => t.status === 'attack').length})
              </button>
            </div>
            <div className="table-search-box">
              <input
                type="text"
                placeholder="Search tunnels, cipher suites, or endpoints..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="tunnels-search-input"
              />
            </div>
          </div>
        </div>

        <div className="tunnels-table-wrap">
          <table className="tunnels-table">
            <thead>
              <tr>
                <th>Tunnel Name / Endpoint</th>
                <th>Protocol & Ports</th>
                <th>Cipher Suite</th>
                <th>Key Exchange (DH)</th>
                <th>Authentication</th>
                <th>Live Replay Window (128-bit)</th>
                <th>Throughput</th>
                <th>Integrity Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTunnels.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No active IPsec tunnels detected. Ingest a PCAP capture or connect an active tunnel gateway.
                  </td>
                </tr>
              ) : (
                filteredTunnels.map((tun) => (
                  <tr
                    key={tun.id}
                    className={`tunnel-row ${tun.status !== 'optimal' ? 'row-alert' : ''} ${selectedTunnelId === tun.id ? 'row-selected' : ''}`}
                    onClick={() => setSelectedTunnelId(tun.id === selectedTunnelId ? null : tun.id)}
                  >
                    <td className="tunnel-name-cell">
                      <div className="tunnel-name-bold">{tun.name}</div>
                      <div className="tunnel-endpoints-sub">
                        <span>{tun.srcEndpoint}</span>
                        <span className="arrow-sep">→</span>
                        <span>{tun.dstEndpoint}</span>
                      </div>
                      {tun.cveAlert && (
                        <span className="cve-tag-badge">
                          <AlertTriangle size={11} /> {tun.cveAlert}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="proto-badge">{tun.proto}</span>
                      <span className="port-badge">UDP:{tun.port}</span>
                    </td>
                    <td>
                      <div className="cipher-cell">
                        <span className={`cipher-name ${tun.encCipher.includes('3DES') ? 'cipher-bad' : 'cipher-good'}`}>
                          {tun.encCipher}
                        </span>
                        <span className="cipher-integ">{tun.integCipher}</span>
                      </div>
                    </td>
                    <td>
                      <span className="dh-badge">{tun.dhGroup}</span>
                    </td>
                    <td>
                      <span className="auth-badge">{tun.authMethod}</span>
                    </td>
                    <td>
                      <div className="replay-window-cell">
                        <div className="replay-mini-bitmap" title="Anti-Replay 16-sample sliding bitmask">
                          {tun.replayBitmap.map((valid, bitIdx) => (
                            <span
                              key={bitIdx}
                              className={`bitmap-dot ${valid ? 'valid' : 'dropped'}`}
                            />
                          ))}
                        </div>
                        <div className="replay-details-row">
                          <span className="replay-head">Seq #{tun.replayHeadSeq}</span>
                          {tun.replayDroppedCount > 0 ? (
                            <span className="replay-drops-alert">
                              {tun.replayDroppedCount} Drops
                            </span>
                          ) : (
                            <span className="replay-clean">0 Drops</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="throughput-cell">
                        <span className="speed-val">{tun.throughputMbps} Mbps</span>
                        <span className="latency-val">{tun.latencyMs} ms</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${tun.status}`}>
                        {tun.status === 'optimal' && <CheckCircle2 size={13} />}
                        {tun.status === 'vulnerable' && <AlertTriangle size={13} />}
                        {tun.status === 'attack' && <ShieldAlert size={13} />}
                        <span>
                          {tun.status === 'optimal' ? 'Secure' : tun.status === 'vulnerable' ? 'Vulnerable' : 'Replay Breach'}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── RECENT FORENSIC AUDITS TABLE ── */}
      <section className="recent-audits-section">
        <div className="section-head-row">
          <div>
            <h3 className="section-title">Recent Forensic Audits & PCAP Ingestion Runs</h3>
            <p className="section-desc">
              Archive of automated offline & live wire cryptographic evaluations, protocol handshake reviews, and compliance records.
            </p>
          </div>
          <div className="audit-action-btns">
            <button
              type="button"
              className="export-report-btn"
              onClick={handleExportAllAudits}
              title="Download consolidated archive of all forensic runs"
            >
              <Download size={14} />
              <span>Export Audit PDF / JSON</span>
            </button>
          </div>
        </div>

        <div className="audits-card-grid">
          {audits.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#ffffff', opacity: 0.7, gridColumn: '1 / -1', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              No historical forensic audits recorded. Run a live security audit to archive results.
            </div>
          ) : (
            audits.map((audit) => (
              <div key={audit.id} className="audit-card">
                <div className="audit-card-top">
                  <div>
                    <span className="audit-id-badge">{audit.id}</span>
                    <h4 className="audit-name">{audit.name}</h4>
                    <span className="audit-time">{audit.timestamp}</span>
                  </div>
                  <div className={`audit-grade-box grade-${audit.grade.replace('+', '-plus').toLowerCase()}`}>
                    <span className="audit-grade-letter">{audit.grade}</span>
                    <span className="audit-score-sub">{audit.compositeScore}%</span>
                  </div>
                </div>

                <div className="audit-metrics-row">
                  <div className="audit-metric-item">
                    <span className="audit-metric-label">Packets Audited</span>
                    <span className="audit-metric-val">{audit.packetsAudited}</span>
                  </div>
                  <div className="audit-metric-item">
                    <span className="audit-metric-label">IPsec Sessions</span>
                    <span className="audit-metric-val">{audit.sessionsCount}</span>
                  </div>
                  <div className="audit-metric-item">
                    <span className="audit-metric-label">Critical Findings</span>
                    <span className={`audit-metric-val ${audit.criticalRiskCount > 0 ? 'text-red' : ''}`}>
                      {audit.criticalRiskCount}
                    </span>
                  </div>
                </div>

                <div className="audit-card-bottom">
                  <span className={`audit-status-badge ${audit.status.toLowerCase().replace(' ', '-')}`}>
                    {audit.status}
                  </span>
                  <button
                    type="button"
                    className="audit-inspect-link"
                    onClick={() => setSelectedAudit(audit)}
                    title={`Open full technical artifact for ${audit.id}`}
                  >
                    <span>View Full Artifact</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── INTERACTIVE FORENSIC ARTIFACT DOSSIER MODAL ── */}
      {selectedAudit && (
        <div className="artifact-modal-backdrop" onClick={() => setSelectedAudit(null)}>
          <div className="artifact-modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="artifact-modal-header">
              <div className="artifact-header-left">
                <div className="artifact-id-row">
                  <span className="artifact-tag">{selectedAudit.id}</span>
                  <span className={`artifact-status-pill ${selectedAudit.status.toLowerCase().replace(' ', '-')}`}>
                    {selectedAudit.status === 'Verified' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                    <span>{selectedAudit.status}</span>
                  </span>
                  <span className="artifact-pill-grade">
                    Grade {selectedAudit.grade} ({selectedAudit.compositeScore}%)
                  </span>
                </div>
                <h3 className="artifact-modal-title">{selectedAudit.name}</h3>
                <p className="artifact-modal-meta">
                  <span>Executed: {selectedAudit.timestamp}</span>
                  <span>•</span>
                  <span>Link: {selectedAudit.linkLayer}</span>
                  <span>•</span>
                  <span>Duration: {selectedAudit.wirelineDuration}</span>
                </p>
              </div>
              <button
                type="button"
                className="artifact-modal-close"
                onClick={() => setSelectedAudit(null)}
                aria-label="Close Artifact Dossier"
                title="Close Dossier (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {downloadSuccess && (
              <div className="artifact-toast-banner">
                <Check size={14} />
                <span>{downloadSuccess}</span>
              </div>
            )}

            {/* SHA-256 Tamper Seal Banner */}
            <div className="artifact-seal-box">
              <div className="seal-info-cluster">
                <Fingerprint size={20} className="seal-icon" />
                <div className="seal-text-group">
                  <span className="seal-label">Cryptographic Ingestion Seal (SHA-256)</span>
                  <span className="seal-hash">{selectedAudit.sha256}</span>
                </div>
              </div>
              <button
                type="button"
                className="seal-copy-btn"
                onClick={() => handleCopySha(selectedAudit.sha256)}
                title="Copy SHA-256 Seal to clipboard"
              >
                {copiedSha ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedSha ? 'Copied Hash' : 'Copy Seal'}</span>
              </button>
            </div>

            {/* Ingestion & Telemetry Metrics Grid */}
            <div className="artifact-kpi-grid">
              <div className="artifact-kpi-card">
                <span className="art-kpi-lbl">Total Packets Audited</span>
                <span className="art-kpi-val">{selectedAudit.packetsAudited}</span>
                <span className="art-kpi-sub">Wireline Layer 2/3 Frames</span>
              </div>
              <div className="artifact-kpi-card">
                <span className="art-kpi-lbl">Capture File Size</span>
                <span className="art-kpi-val">{selectedAudit.captureSize}</span>
                <span className="art-kpi-sub">Uncompressed Wire Ingestion</span>
              </div>
              <div className="artifact-kpi-card">
                <span className="art-kpi-lbl">Active IPsec Sessions</span>
                <span className="art-kpi-val">{selectedAudit.sessionsCount} Sessions</span>
                <span className="art-kpi-sub">UDP 500 / 4500 Dissected</span>
              </div>
              <div className="artifact-kpi-card">
                <span className="art-kpi-lbl">Critical / High Risks</span>
                <span className={`art-kpi-val ${selectedAudit.criticalRiskCount > 0 ? 'text-red' : ''}`}>
                  {selectedAudit.criticalRiskCount + selectedAudit.highRiskCount} Findings
                </span>
                <span className="art-kpi-sub">{selectedAudit.criticalRiskCount} Critical, {selectedAudit.highRiskCount} High</span>
              </div>
            </div>

            {/* Cryptographic Profile & Proposals */}
            <div className="artifact-section-card">
              <h4 className="artifact-section-heading">
                <Lock size={15} />
                <span>Negotiated Cryptographic Security Parameters</span>
              </h4>
              <div className="artifact-spec-grid">
                <div className="spec-item">
                  <span className="spec-label">Detected Encryption Ciphers:</span>
                  <div className="spec-tags-row">
                    {selectedAudit.ciphersDetected.map(c => (
                      <span key={c} className={`spec-cipher-tag ${c.includes('3DES') ? 'vuln-tag' : ''}`}>{c}</span>
                    ))}
                  </div>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Diffie-Hellman Key Exchange Groups:</span>
                  <div className="spec-tags-row">
                    {selectedAudit.dhGroupsDetected.map(d => (
                      <span key={d} className={`spec-cipher-tag ${d.includes('Group 2') ? 'vuln-tag' : ''}`}>{d}</span>
                    ))}
                  </div>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Anti-Replay Mechanism:</span>
                  <span className="spec-val">RFC 4303 64-Packet Bitmask Sliding Window</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Dissector Compliance:</span>
                  <span className="spec-val">RFC 8247 (IKEv2) / RFC 8221 (ESP) Strict Standard</span>
                </div>
              </div>
            </div>

            {/* Findings Ledger */}
            <div className="artifact-section-card">
              <h4 className="artifact-section-heading">
                <ShieldAlert size={15} />
                <span>Forensic Audit Findings & Deduction Ledger</span>
              </h4>
              <div className="artifact-findings-list">
                {selectedAudit.findingsList.map(f => (
                  <div key={f.code} className={`artifact-finding-row ${f.severity === 'CRITICAL' || f.severity === 'HIGH' ? 'danger-row' : ''}`}>
                    <div className="art-fnd-left">
                      <span className="art-fnd-code">{f.code}</span>
                      {f.cve && <span className="art-fnd-cve">{f.cve}</span>}
                      <span className="art-fnd-title">{f.title}</span>
                    </div>
                    <div className="art-fnd-right">
                      <span className={`art-fnd-sev ${f.severity.toLowerCase()}`}>{f.severity}</span>
                      <span className={`art-fnd-pts ${f.deduction < 0 ? 'text-red' : ''}`}>
                        {f.deduction < 0 ? `${f.deduction} pts` : 'Compliant (0 pts)'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw Frame Hex Preview */}
            <div className="artifact-section-card">
              <h4 className="artifact-section-heading">
                <Terminal size={15} />
                <span>Raw Packet Hex & Dissector Offset Inspection</span>
              </h4>
              <div className="artifact-hex-view">
                <pre>{selectedAudit.rawHexDump}</pre>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="artifact-modal-footer">
              <button
                type="button"
                className="art-action-btn secondary"
                onClick={() => setSelectedAudit(null)}
              >
                Close Dossier
              </button>
              <button
                type="button"
                className="art-action-btn primary"
                onClick={() => handleDownloadArtifact(selectedAudit)}
              >
                <Download size={15} />
                <span>Download Artifact JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

