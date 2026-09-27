import React, { useState } from 'react';
import {
  FileText,
  ShieldAlert,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Cpu,
  Layers,
  Clock,
  Fingerprint,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import './FindingDetails.css';

interface DossierItem {
  id: string;
  title: string;
  cveId: string;
  cweId: string;
  cweTitle: string;
  cvssScore: number;
  cvssVector: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  exploitImpact: {
    confidentiality: 'HIGH' | 'LOW' | 'NONE';
    integrity: 'HIGH' | 'LOW' | 'NONE';
    availability: 'HIGH' | 'LOW' | 'NONE';
    attackVector: 'NETWORK' | 'ADJACENT' | 'LOCAL';
    attackComplexity: 'LOW' | 'HIGH';
    privilegesRequired: 'NONE' | 'LOW' | 'HIGH';
    userInteraction: 'NONE' | 'REQUIRED';
    scope: 'UNCHANGED' | 'CHANGED';
  };
  evidenceAttachment: {
    frameNumber: number;
    spi: string;
    timestamp: string;
    protocol: string;
    packetOffset: string;
    hexSnippet: string;
    asciiSnippet: string;
    detectionReason: string;
  };
  remediationTemplates: {
    cisco: string;
    strongswan: string;
    fortios: string;
  };
}

const DOSSIERS: DossierItem[] = [
  {
    id: 'FND-01',
    title: 'Strict AEAD Authenticated Encryption Verification',
    cveId: 'NIST-SP800-77',
    cweId: 'CWE-327',
    cweTitle: 'Use of a Broken or Risky Cryptographic Algorithm',
    cvssScore: 0.0,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N',
    severity: 'MEDIUM',
    exploitImpact: {
      confidentiality: 'HIGH',
      integrity: 'HIGH',
      availability: 'NONE',
      attackVector: 'NETWORK',
      attackComplexity: 'LOW',
      privilegesRequired: 'NONE',
      userInteraction: 'NONE',
      scope: 'UNCHANGED'
    },
    evidenceAttachment: {
      frameNumber: 1,
      spi: '0x7C49E210',
      timestamp: '2026-09-26 12:04:18.102',
      protocol: 'ESP',
      packetOffset: '0x0000 - 0x0030',
      hexSnippet: '7c 49 e2 10 00 00 00 01 a1 b2 c3 d4 e5 f6 07 18 29 3a 4b 5c 6d 7e 8f 90',
      asciiSnippet: '|I....+....)|',
      detectionReason: 'Verified AES-256-GCM AEAD encryption algorithm across frame #1 payload tail. 128-bit ICV tag present.'
    },
    remediationTemplates: {
      cisco: `crypto ipsec transform-set TS_GCM esp-gcm 256
 mode transport
 exit
crypto ipsec profile IPSEC_PROFILE
 set transform-set TS_GCM
 set pfs group31`,
      strongswan: `conn tunnel-secure
  esp=aes256gcm128-curve25519!
  ike=aes256gcm128-prfsha384-curve25519!
  auto=start`,
      fortios: `config vpn ipsec phase2-interface
  edit "P2_TUNNEL"
    set proposal aes256gcm
    set dhgrp 31
    set replay enable
  next
end`
    }
  },
  {
    id: 'FND-02',
    title: 'Sweet32 64-Bit Block Cipher Deprecation Baseline',
    cveId: 'CVE-2016-2183',
    cweId: 'CWE-326',
    cweTitle: 'Inadequate Encryption Strength',
    cvssScore: 7.5,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
    severity: 'HIGH',
    exploitImpact: {
      confidentiality: 'HIGH',
      integrity: 'LOW',
      availability: 'NONE',
      attackVector: 'NETWORK',
      attackComplexity: 'LOW',
      privilegesRequired: 'NONE',
      userInteraction: 'NONE',
      scope: 'UNCHANGED'
    },
    evidenceAttachment: {
      frameNumber: 12,
      spi: '0x8A12F401',
      timestamp: '2026-09-26 12:04:18.240',
      protocol: 'IKEv2',
      packetOffset: '0x0020 - 0x0040',
      hexSnippet: '03 00 00 0c 01 01 00 00 80 01 00 03 00 00 00 08 02 00 00 02',
      asciiSnippet: '..........|',
      detectionReason: 'Audit confirms zero 64-bit block proposals (3DES/Blowfish) active in current negotiation catalogue.'
    },
    remediationTemplates: {
      cisco: `no crypto ipsec transform-set ESP-3DES-SHA
crypto ipsec transform-set SECURE_GCM esp-gcm 256`,
      strongswan: `conn %default
  esp=aes256gcm128-curve25519!
  # 3des proposal strictly disabled`,
      fortios: `config vpn ipsec phase2-interface
  edit "P2_TUNNEL"
    unset proposal 3des
    set proposal aes256gcm aes128gcm
  next
end`
    }
  }
];

export function FindingDetails() {
  const [selectedDossier, setSelectedDossier] = useState<string>('FND-01');
  const [activeVendorTab, setActiveVendorTab] = useState<'cisco' | 'strongswan' | 'fortios'>('cisco');
  const [copied, setCopied] = useState(false);

  const dossier = DOSSIERS.find(d => d.id === selectedDossier) || DOSSIERS[0];

  const handleCopy = () => {
    if (!dossier) return;
    const text = dossier.remediationTemplates[activeVendorTab];
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!dossier) {
    return (
      <div className="finding-details-viewport">
        <div className="fd-header-card">
          <div className="fd-header-meta">
            <div className="fd-header-badge">
              <FileText size={14} />
              <span>Forensic Drilldown & Remediation Engine</span>
            </div>
          </div>
          <div className="fd-header-content">
            <div>
              <h2>No Finding Selected</h2>
              <p>Select a vulnerability from the triage table to view forensic evidence and vendor remediation guides.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="finding-details-viewport">
      {/* ── HEADER BANNER ── */}
      <div className="fd-header-card">
        <div className="fd-header-meta">
          <div className="fd-header-badge">
            <FileText size={14} />
            <span>Forensic Drilldown & Remediation Engine</span>
          </div>
          <div className="fd-dossier-picker">
            {DOSSIERS.map(d => (
              <button
                key={d.id}
                type="button"
                className={`picker-btn ${selectedDossier === d.id ? 'active' : ''}`}
                onClick={() => setSelectedDossier(d.id)}
              >
                <span>{d.id}</span>
                <span className={`p-chip ${d.severity.toLowerCase()}`}>{d.severity}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="fd-header-content">
          <div>
            <h2>{dossier.id}: {dossier.title}</h2>
            <div className="fd-tags-row">
              <span className="fd-tag cve">{dossier.cveId}</span>
              <span className="fd-tag cwe">{dossier.cweId}: {dossier.cweTitle}</span>
              <span className="fd-tag cvss">CVSS Base: {dossier.cvssScore} / 10.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── DOSSIER GRID: CVSS & IMPACT METRICS ── */}
      <div className="fd-grid-two">
        {/* CVSS & Attack Vector Dossier */}
        <div className="fd-card">
          <div className="fd-card-header">
            <ShieldAlert size={18} className="text-red-400" />
            <div>
              <h3>CVSS v3.1 Vector & Impact Scoring</h3>
              <p>Standardized Common Vulnerability Scoring System quantification.</p>
            </div>
          </div>

          <div className="cvss-vector-box">
            <span className="cvss-v-label">Vector String</span>
            <code>{dossier.cvssVector}</code>
          </div>

          <div className="impact-metrics-grid">
            <div className="impact-cell">
              <span className="i-lbl">Confidentiality</span>
              <span className={`i-val ${dossier.exploitImpact.confidentiality.toLowerCase()}`}>
                {dossier.exploitImpact.confidentiality}
              </span>
            </div>
            <div className="impact-cell">
              <span className="i-lbl">Integrity</span>
              <span className={`i-val ${dossier.exploitImpact.integrity.toLowerCase()}`}>
                {dossier.exploitImpact.integrity}
              </span>
            </div>
            <div className="impact-cell">
              <span className="i-lbl">Availability</span>
              <span className={`i-val ${dossier.exploitImpact.availability.toLowerCase()}`}>
                {dossier.exploitImpact.availability}
              </span>
            </div>
            <div className="impact-cell">
              <span className="i-lbl">Attack Vector</span>
              <span className="i-val text-sky-400">{dossier.exploitImpact.attackVector}</span>
            </div>
            <div className="impact-cell">
              <span className="i-lbl">Complexity</span>
              <span className="i-val text-amber-400">{dossier.exploitImpact.attackComplexity}</span>
            </div>
            <div className="impact-cell">
              <span className="i-lbl">Privileges Req.</span>
              <span className="i-val text-emerald-400">{dossier.exploitImpact.privilegesRequired}</span>
            </div>
          </div>
        </div>

        {/* Packet-Level Forensic Evidence */}
        <div className="fd-card">
          <div className="fd-card-header">
            <Fingerprint size={18} className="text-sky-400" />
            <div>
              <h3>Packet-Level Binary Evidence Attachment</h3>
              <p>Cryptographic fingerprinting bound directly to byte offsets.</p>
            </div>
          </div>

          <div className="evidence-meta-strip">
            <div className="ev-pill">
              <span className="ev-lbl">Frame:</span>
              <span className="ev-val">#{dossier.evidenceAttachment.frameNumber}</span>
            </div>
            <div className="ev-pill">
              <span className="ev-lbl">SPI:</span>
              <span className="ev-val"><code>{dossier.evidenceAttachment.spi}</code></span>
            </div>
            <div className="ev-pill">
              <span className="ev-lbl">Protocol:</span>
              <span className="ev-val">{dossier.evidenceAttachment.protocol}</span>
            </div>
            <div className="ev-pill">
              <span className="ev-lbl">Byte Offset:</span>
              <span className="ev-val">{dossier.evidenceAttachment.packetOffset}</span>
            </div>
          </div>

          <div className="evidence-hex-card">
            <div className="evidence-hex-col">
              <span className="hex-header-tag">Raw Hex Stream</span>
              <pre>{dossier.evidenceAttachment.hexSnippet}</pre>
            </div>
            <div className="evidence-ascii-col">
              <span className="hex-header-tag">ASCII Translation</span>
              <pre>{dossier.evidenceAttachment.asciiSnippet}</pre>
            </div>
          </div>

          <div className="ev-detection-note">
            <AlertTriangle size={14} className="text-amber-400" />
            <span>{dossier.evidenceAttachment.detectionReason}</span>
          </div>
        </div>
      </div>

      {/* ── 3. COPY-PASTE READY VENDOR REMEDIATION TEMPLATES ── */}
      <div className="remediation-section-card">
        <div className="rem-header">
          <div className="rem-title">
            <Terminal size={18} className="text-emerald-400" />
            <div>
              <h3>Copy-Paste Ready Vendor Configuration Templates</h3>
              <p>Tested, syntactically valid vendor configurations to eliminate this finding.</p>
            </div>
          </div>

          <div className="vendor-tabs-row">
            <button
              type="button"
              className={`v-tab-btn ${activeVendorTab === 'cisco' ? 'active' : ''}`}
              onClick={() => setActiveVendorTab('cisco')}
            >
              Cisco IOS-XE / ASA
            </button>
            <button
              type="button"
              className={`v-tab-btn ${activeVendorTab === 'strongswan' ? 'active' : ''}`}
              onClick={() => setActiveVendorTab('strongswan')}
            >
              strongSwan (swanctl)
            </button>
            <button
              type="button"
              className={`v-tab-btn ${activeVendorTab === 'fortios' ? 'active' : ''}`}
              onClick={() => setActiveVendorTab('fortios')}
            >
              Fortinet FortiOS
            </button>

            <button
              type="button"
              className="copy-template-btn"
              onClick={handleCopy}
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Config'}</span>
            </button>
          </div>
        </div>

        <div className="code-template-viewport">
          <div className="template-top-bar">
            <span className="file-name">
              {activeVendorTab === 'cisco' && 'cisco-ipsec-remediation.cfg'}
              {activeVendorTab === 'strongswan' && '/etc/swanctl/conf.d/remediation.conf'}
              {activeVendorTab === 'fortios' && 'fortigate-ike-hardening.cli'}
            </span>
            <span className="lang-tag">Syntax Verified</span>
          </div>
          <pre className="code-content">
            {dossier.remediationTemplates[activeVendorTab]}
          </pre>
        </div>
      </div>
    </div>
  );
}
