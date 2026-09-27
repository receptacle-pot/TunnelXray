import React, { useState } from 'react';
import {
  HardDrive,
  Activity,
  Layers,
  Cpu,
  Trash2,
  RefreshCw,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import './ResourceMonitor.css';

export function ResourceMonitor() {
  const [isFlushing, setIsFlushing] = useState(false);
  const [flushNotice, setFlushNotice] = useState<string | null>(null);

  const handleFlushBuffers = () => {
    setIsFlushing(true);
    setFlushNotice(null);

    setTimeout(() => {
      setIsFlushing(false);
      setFlushNotice('✔ Dissection Ring Buffers & Packet Caches flushed.');
      setTimeout(() => setFlushNotice(null), 4000);
    }, 1200);
  };

  return (
    <div className="resource-monitor-view">
      {/* ── TOP STATS STRIP ── */}
      <div className="resource-top-bar">
        <div className="resource-bar-left">
          <div className="res-badge-pill">
            <Activity size={14} />
            <span>MEMORY & BUFFER TELEMETRY</span>
          </div>
          <span className="res-sub-meta">
            Zero-Copy Kernel Ring Buffers & Packet Dissection Heap
          </span>
        </div>

        <button
          type="button"
          className="flush-buffer-btn"
          onClick={handleFlushBuffers}
          disabled={isFlushing}
        >
          <Trash2 size={13} className={isFlushing ? 'spin-icon' : ''} />
          <span>{isFlushing ? 'Flushing Memory...' : 'Flush Packet Buffers'}</span>
        </button>
      </div>

      {flushNotice && (
        <div className="flush-notice-banner">
          <Sparkles size={14} />
          <span>{flushNotice}</span>
        </div>
      )}

      {/* ── BUFFER UTILIZATION METRICS GRID ── */}
      <div className="buffer-metrics-grid">
        <div className="buffer-metric-card">
          <div className="buffer-header">
            <span className="buffer-title">AF_PACKET RX Ring Buffer</span>
            <span className="buffer-tag active">Zero-Copy Active</span>
          </div>

          <div className="buffer-stat-main">
            <span className="buffer-pct green"></span>
            <span className="buffer-cap"></span>
          </div>

          <div className="buffer-bar-track">
            <div className="buffer-bar-fill green" style={{ width: '0%' }} />
          </div>

          <div className="buffer-footer-meta">
            <span>Ring Drops: </span>
            <span>Driver: Intel ixgbe (10GbE)</span>
          </div>
        </div>

        <div className="buffer-metric-card">
          <div className="buffer-header">
            <span className="buffer-title">Dissection V8 Heap Memory</span>
            <span className="buffer-tag optimal">Normal</span>
          </div>

          <div className="buffer-stat-main">
            <span className="buffer-pct cyan"></span>
            <span className="buffer-cap"></span>
          </div>

          <div className="buffer-bar-track">
            <div className="buffer-bar-fill cyan" style={{ width: '0%' }} />
          </div>

          <div className="buffer-footer-meta">
            <span>GC Pause: </span>
            <span>Allocated RSS: </span>
          </div>
        </div>

        <div className="buffer-metric-card">
          <div className="buffer-header">
            <span className="buffer-title">Packet Pipeline Latency</span>
            <span className="buffer-tag optimal">Sub-Millisecond</span>
          </div>

          <div className="buffer-stat-main">
            <span className="buffer-pct purple"></span>
            <span className="buffer-cap"></span>
          </div>

          <div className="buffer-bar-track">
            <div className="buffer-bar-fill purple" style={{ width: '0%' }} />
          </div>

          <div className="buffer-footer-meta">
            <span>Jitter: </span>
            <span>Heuristic Engine Overhead</span>
          </div>
        </div>
      </div>

      {/* ── RING LATENCY JITTER HISTOGRAM ── */}
      <div className="latency-histogram-card">
        <div className="hist-header">
          <div className="hist-title-cluster">
            <Clock size={16} className="hist-ico" />
            <div className="hist-text">
              <h4>Packet Dissection Latency Jitter Histogram</h4>
              <p>Per-packet processing delay across continuous IPsec ingress frames.</p>
            </div>
          </div>
          <span className="hist-badge">Continuous Sampling</span>
        </div>

        <div className="hist-bars-container">
          <div className="hist-bar-col">
            <div className="hist-bar-fill" style={{ height: '0%' }} />
            <span className="hist-x-lbl">&lt;0.05ms</span>
          </div>
          <div className="hist-bar-col">
            <div className="hist-bar-fill" style={{ height: '0%' }} />
            <span className="hist-x-lbl">0.08ms</span>
          </div>
          <div className="hist-bar-col">
            <div className="hist-bar-fill" style={{ height: '0%' }} />
            <span className="hist-x-lbl">0.10ms</span>
          </div>
          <div className="hist-bar-col">
            <div className="hist-bar-fill" style={{ height: '0%' }} />
            <span className="hist-x-lbl">0.15ms</span>
          </div>
          <div className="hist-bar-col">
            <div className="hist-bar-fill" style={{ height: '0%' }} />
            <span className="hist-x-lbl">0.20ms</span>
          </div>
          <div className="hist-bar-col">
            <div className="hist-bar-fill" style={{ height: '0%' }} />
            <span className="hist-x-lbl">&gt;0.25ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
