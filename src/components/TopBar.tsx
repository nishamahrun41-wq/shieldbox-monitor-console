import React from 'react';
import { ShieldAlert, Download, Sliders, Activity, Network, Bell, Cpu } from 'lucide-react';

interface TopBarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onExportReport: () => void;
  alertCount: number;
  anomalyActive: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeSection,
  onNavigate,
  onExportReport,
  alertCount,
  anomalyActive
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
          anomalyActive 
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 ring-2 ring-rose-500/20' 
            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
        }`}>
          <ShieldAlert className="w-4 h-4" />
        </div>
        <a 
          href="#dashboard" 
          onClick={(e) => { e.preventDefault(); onNavigate('map'); }}
          className="text-base font-bold tracking-tight text-white whitespace-nowrap hover:text-cyan-400 transition-colors"
        >
          ShieldBox <span className="text-slate-400 font-normal">Monitor Console</span>
        </a>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <button
          onClick={() => onNavigate('map')}
          className={`flex items-center gap-2 hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeSection === 'map' ? 'border-cyan-400 text-cyan-300' : 'border-transparent'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Device Map</span>
        </button>

        <button
          onClick={() => onNavigate('traffic')}
          className={`flex items-center gap-2 hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeSection === 'traffic' ? 'border-cyan-400 text-cyan-300' : 'border-transparent'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Traffic Baselining</span>
        </button>

        <button
          onClick={() => onNavigate('simulator')}
          className={`flex items-center gap-2 hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeSection === 'simulator' ? 'border-cyan-400 text-cyan-300' : 'border-transparent'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Simulator Controls</span>
        </button>

        <button
          onClick={() => onNavigate('alerts')}
          className={`flex items-center gap-2 hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeSection === 'alerts' ? 'border-cyan-400 text-cyan-300' : 'border-transparent'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Real-time Alerts</span>
          {alertCount > 0 && (
            <span className="font-mono text-[10px] text-rose-300 font-bold bg-rose-500/20 px-1.5 py-0.2 rounded border border-rose-500/30">
              {alertCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onNavigate('profiles')}
          className={`flex items-center gap-2 hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeSection === 'profiles' ? 'border-cyan-400 text-cyan-300' : 'border-transparent'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Protocol Profiles</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onExportReport}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Audit Report</span>
        </button>
      </div>
    </header>
  );
};
