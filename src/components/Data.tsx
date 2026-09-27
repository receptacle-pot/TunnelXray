import React, { useState, useEffect } from 'react';
import {
  History,
  Database,
  Cpu,
  Layers,
  HardDrive,
  Sparkles,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { AnalysisHistory } from './AnalysisHistory';
import { DatasetManagement } from './DatasetManagement';
import { ModelRegistry } from './ModelRegistry';
import './Data.css';

export type DataSection = 'history' | 'dataset' | 'registry';

interface DataDockerItem {
  id: DataSection;
  label: string;
  icon: React.ElementType;
}

const DATA_DOCKER_SECTIONS: DataDockerItem[] = [
  {
    id: 'history',
    label: 'Capture History & Archive Log',
    icon: History,
  },
  {
    id: 'dataset',
    label: 'ML Dataset Provenance',
    icon: Database,
  },
  {
    id: 'registry',
    label: 'ML Model Governance',
    icon: Cpu,
  }
];

export interface DataProps {
  initialSection?: DataSection;
}

export function Data({ initialSection }: DataProps = {}) {
  const [activeSection, setActiveSection] = useState<DataSection>(initialSection || 'history');

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  return (
    <div className="data-layout-container">
      {/* ── LEFT SIDE DOCKER (3 MENUS) ── */}
      <aside className="data-left-docker">
        <div className="data-docker-meta">
          <div className="data-docker-title-row">
            <Layers size={15} />
            <span>Data Operations</span>
          </div>
        </div>

        <nav className="data-docker-nav-list">
          {DATA_DOCKER_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                className={`data-docker-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveSection(sec.id)}
              >
                <div className="data-nav-item-left">
                  <Icon className="data-docker-icon" />
                  <span>{sec.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Status Callout Footer in Docker */}
        <div className="data-docker-footer">
          <div className="data-footer-top">
            <div className="data-status-dot active" />
            <span className="data-footer-title">Lakehouse & ML Storage</span>
          </div>
          <div className="data-footer-desc">
            Apache Parquet Snappy + SQLite Evidence Store.
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <section className="data-main-content">
        {activeSection === 'history' && <AnalysisHistory />}
        {activeSection === 'dataset' && <DatasetManagement />}
        {activeSection === 'registry' && <ModelRegistry />}
      </section>
    </div>
  );
}
