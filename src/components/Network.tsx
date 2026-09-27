import React, { useState, useEffect } from 'react';
import {
  Network as NetworkIcon,
  FlaskConical,
  GitCompare,
  Layers,
  Radio,
  Globe,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { NetworkVisualization } from './NetworkVisualization';
import { Testbed } from './Testbed';
import { Comparison } from './Comparison';
import './Network.css';

export type NetworkSection = 'topology' | 'testbed' | 'comparison';

interface NetworkDockerItem {
  id: NetworkSection;
  label: string;
  icon: React.ElementType;
}

const NETWORK_DOCKER_SECTIONS: NetworkDockerItem[] = [
  {
    id: 'topology',
    label: 'Interactive Topology',
    icon: Globe,
  },
  {
    id: 'testbed',
    label: 'Synthetic Testbed',
    icon: FlaskConical,
  },
  {
    id: 'comparison',
    label: 'Differential Analysis',
    icon: GitCompare,
  }
];

export interface NetworkProps {
  initialSection?: NetworkSection;
}

export function Network({ initialSection }: NetworkProps = {}) {
  const [activeSection, setActiveSection] = useState<NetworkSection>(initialSection || 'topology');

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  return (
    <div className="network-layout-container">
      {/* ── LEFT SIDE DOCKER (3 MENUS) ── */}
      <aside className="network-left-docker">
        <div className="net-docker-meta">
          <div className="net-docker-title-row">
            <Layers size={15} />
            <span>Network Modules</span>
          </div>
        </div>

        <nav className="net-docker-nav-list">
          {NETWORK_DOCKER_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                className={`net-docker-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveSection(sec.id)}
              >
                <div className="net-nav-item-left">
                  <Icon className="net-docker-icon" />
                  <span>{sec.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Status Callout Footer in Docker */}
        <div className="net-docker-footer">
          <div className="net-footer-top">
            <div className="net-status-dot active" />
            <span className="net-footer-title">Wireline Mesh Mesh Engine</span>
          </div>
          <div className="net-footer-desc">
            Multi-Cloud Transit: AWS, GCP & EU-Frankfurt Hubs.
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT VIEWPORT ── */}
      <main className="network-main-viewport">
        {activeSection === 'topology' && <NetworkVisualization />}
        {activeSection === 'testbed' && <Testbed />}
        {activeSection === 'comparison' && <Comparison />}
      </main>
    </div>
  );
}
