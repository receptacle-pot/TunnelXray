// ── pcapStore.ts ──
// Global reactive store for parsed PCAP data across all tabs and reports

import { ParsedPcapSummary, parsePcap } from '../utils/pcapParser';

type Listener = (summary: ParsedPcapSummary | null) => void;

class PcapStore {
  private currentSummary: ParsedPcapSummary | null = null;
  private listeners: Set<Listener> = new Set();
  private isAutoLoading = false;

  constructor() {
    // Attempt to load cached session from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('tx_active_pcap_session');
        if (cached) {
          this.currentSummary = JSON.parse(cached);
        }
      } catch {
        // Ignore cache parse error
      }
    }
  }

  getSummary(): ParsedPcapSummary | null {
    return this.currentSummary;
  }

  setSummary(summary: ParsedPcapSummary | null) {
    this.currentSummary = summary;
    if (typeof window !== 'undefined' && summary) {
      try {
        // Cache summary (limit dissected packets in storage to avoid quota exceed)
        const storageSafe = {
          ...summary,
          dissectedPackets: summary.dissectedPackets.slice(0, 80),
        };
        localStorage.setItem('tx_active_pcap_session', JSON.stringify(storageSafe));
      } catch {
        // Ignore quota error
      }
    }
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.currentSummary);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.currentSummary);
    }
  }

  // Force re-analysis of the active capture or reload default
  async reanalyzeActiveCapture(): Promise<ParsedPcapSummary | null> {
    this.isAutoLoading = false;
    try {
      const response = await fetch('/pcap-1.pcap?t=' + Date.now());
      if (!response.ok) {
        throw new Error(`Failed to fetch /pcap-1.pcap: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      const parsed = await parsePcap(buffer, 'pcap-1.pcap');
      this.setSummary(parsed);
      return parsed;
    } catch (err) {
      console.warn('Re-analysis notice:', err);
      return null;
    }
  }

  // Load PCAP file directly from URL or /pcap-1.pcap
  async loadDefaultPcap(): Promise<ParsedPcapSummary | null> {
    if (this.currentSummary && this.currentSummary.fileName === 'pcap-1.pcap') {
      return this.currentSummary;
    }

    if (this.isAutoLoading) return null;
    this.isAutoLoading = true;

    try {
      const response = await fetch('/pcap-1.pcap');
      if (!response.ok) {
        throw new Error(`Failed to fetch default /pcap-1.pcap: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      const parsed = await parsePcap(buffer, 'pcap-1.pcap');
      this.setSummary(parsed);
      this.isAutoLoading = false;
      return parsed;
    } catch (err) {
      console.warn('Auto-loading default /pcap-1.pcap notice:', err);
      this.isAutoLoading = false;
      return null;
    }
  }
}

export const pcapStore = new PcapStore();
