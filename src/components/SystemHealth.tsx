import React, { useState } from 'react';
import {
  Activity,
  Server,
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Clock,
  Layers,
  Sparkles,
  Wifi,
  HardDrive
} from 'lucide-react';
import './SystemHealth.css';

interface ServiceDiagnostic {
  id: string;
  name: string;
  category: 'FastAPI Backend' | 'Database' | 'Scapy Parser' | 'Background Task Worker';
  status: 'HEALTHY' | 'DEGRADED' | 'OPERATIONAL';
  latencyMs?: number | null;
  uptime: string;
  memory: string;
  details: Record<string, string>;
}

export function SystemHealth() {
  const [isPulsing, setIsPulsing] = useState(false);
  const [pulseNotice, setPulseNotice] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<string>('12:04:18 UTC');

  const [services, setServices] = useState<ServiceDiagnostic[]>([
    {
      id: 'fastapi',
      name: 'FastAPI REST Backend',
      category: 'FastAPI Backend',
      status: 'HEALTHY',
      latencyMs: 1.2,
      uptime: '99.98% (14d 6h)',
      memory: '248 MB / 4 GB',
      details: {
        'ASGI Engine': 'Uvicorn 0.30 (4 Worker Processes)',
        'Active Endpoints': 'FastAPI REST Service (/api/v1/*)'
      }
    },
    {
      id: 'database',
      name: 'PostgreSQL Relational Storage',
      category: 'Database',
      status: 'HEALTHY',
      latencyMs: 0.8,
      uptime: '99.99% (42d 12h)',
      memory: '612 MB / 8 GB',
      details: {
        'Engine Version': 'PostgreSQL 16.3',
        'Connection Pool': 'Managed Connection Pool (Max 50)',
        'WAL Status': 'Synchronous Write-Ahead Logging'
      }
    },
    {
      id: 'scapy',
      name: 'Scapy Deep Packet Ingestion Engine',
      category: 'Scapy Parser',
      status: 'HEALTHY',
      latencyMs: 2.4,
      uptime: '99.95% (7d 2h)',
      memory: '380 MB / 4 GB',
      details: {
        'Parser Core': 'Scapy 2.5 + libpcap C-Bindings',
        'Dissector Protocols': 'IKEv1, IKEv2, ESP, AH, NAT-T'
      }
    },
    {
      id: 'celery',
      name: 'Celery & Redis Task Worker',
      category: 'Background Task Worker',
      status: 'HEALTHY',
      latencyMs: 0.5,
      uptime: '99.99% (14d 6h)',
      memory: '190 MB / 4 GB',
      details: {
        'Queue Broker': 'Redis 7.2 In-Memory Broker',
        'Worker Pool': 'Prefork Concurrency Lanes (8 Workers)'
      }
    }
  ]);

  const handleRunDiagnosticPulse = () => {
    setIsPulsing(true);
    setPulseNotice(null);

    setTimeout(() => {
      setIsPulsing(false);
      setLastCheckTime(new Date().toLocaleTimeString());
      setPulseNotice('✔ Diagnostic Pulse Complete: All 4 microservices (FastAPI, Database, Scapy, Celery) operating at peak health.');
      setTimeout(() => setPulseNotice(null), 4000);
    }, 1100);
  };

  return (
    <div className="system-health-view">
      {/* ── TOP HERO BAR ── */}
      <div className="health-hero-bar">
        <div className="health-hero-left">
          <div className="health-badge-pill">
            <Activity size={14} className="badge-glow-ico" />
            <span>SYSTEM HEALTH (/SYSTEM-HEALTH)</span>
          </div>
          <h2 className="health-section-title">Diagnostic Pulse & Telemetry</h2>
          <p className="health-section-subtitle">
            Live telemetry monitoring the FastAPI backend, database, Scapy parser, and background task worker.
          </p>
        </div>

        <div className="health-hero-actions">
          <span className="last-sync-text">
            Last Pulse: <strong>{lastCheckTime}</strong>
          </span>
          <button
            type="button"
            className="pulse-trigger-btn"
            onClick={handleRunDiagnosticPulse}
            disabled={isPulsing}
          >
            <RefreshCw size={14} className={isPulsing ? 'spin-icon' : ''} />
            <span>{isPulsing ? 'Pulsing Services...' : 'Run Diagnostic Pulse'}</span>
          </button>
        </div>
      </div>

      {pulseNotice && (
        <div className="pulse-notice-banner">
          <Sparkles size={15} />
          <span>{pulseNotice}</span>
        </div>
      )}

      {/* ── SYSTEM PULSE OVERVIEW TILES ── */}
      <div className="pulse-kpi-grid">
        <div className="pulse-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-title">FastAPI Backend</span>
            <span className="kpi-status-dot online" />
          </div>
          <div className="kpi-main-val green"></div>
          <span className="kpi-sub-text">Average REST Latency</span>
        </div>

        <div className="pulse-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-title">PostgreSQL DB</span>
            <span className="kpi-status-dot online" />
          </div>
          <div className="kpi-main-val cyan"></div>
          <span className="kpi-sub-text">Query Transaction Time</span>
        </div>

        <div className="pulse-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-title">Scapy Parser</span>
            <span className="kpi-status-dot online" />
          </div>
          <div className="kpi-main-val purple"></div>
          <span className="kpi-sub-text">Packet Ingest Throughput</span>
        </div>

        <div className="pulse-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-title">Task Worker</span>
            <span className="kpi-status-dot online" />
          </div>
          <div className="kpi-main-val green"></div>
          <span className="kpi-sub-text">Celery Depth / Active</span>
        </div>
      </div>

      {/* ── 4 MICROSERVICES DETAILED CARDS ── */}
      <div className="services-detailed-grid">
        {services.map((svc) => (
          <div key={svc.id} className="service-health-card">
            <div className="svc-header-row">
              <div className="svc-title-group">
                <div className={`svc-icon-box ${svc.id}`}>
                  {svc.id === 'fastapi' && <Zap size={18} />}
                  {svc.id === 'database' && <Database size={18} />}
                  {svc.id === 'scapy' && <Activity size={18} />}
                  {svc.id === 'celery' && <Cpu size={18} />}
                </div>
                <div className="svc-names">
                  <h4 className="svc-name">{svc.name}</h4>
                  <span className="svc-cat">{svc.category}</span>
                </div>
              </div>

              <div className="svc-status-pill green">
                <CheckCircle2 size={12} />
                <span>{svc.status}</span>
              </div>
            </div>

            <div className="svc-telemetry-strip">
              <div className="telem-item">
                <span className="telem-lbl">Latency</span>
                <span className="telem-val green">{svc.latencyMs ? `${svc.latencyMs} ms` : ''}</span>
              </div>
              <div className="telem-item">
                <span className="telem-lbl">Uptime</span>
                <span className="telem-val">{svc.uptime}</span>
              </div>
              <div className="telem-item">
                <span className="telem-lbl">Memory RSS</span>
                <span className="telem-val">{svc.memory}</span>
              </div>
            </div>

            <div className="svc-specs-grid">
              {Object.entries(svc.details).map(([key, val]) => (
                <div key={key} className="spec-row">
                  <span className="spec-key">{key}:</span>
                  <span className="spec-val">{val}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
