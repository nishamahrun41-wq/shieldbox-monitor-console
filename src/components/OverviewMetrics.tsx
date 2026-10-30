import React from 'react';
import { Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { TrafficPoint } from '../types';

interface OverviewMetricsProps {
  currentTraffic: TrafficPoint;
  totalDevices: number;
  anomalyActive: boolean;
  activeAnomalyCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRecalibrate: () => void;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  currentTraffic,
  totalDevices,
  anomalyActive,
  activeAnomalyCount,
  soundEnabled,
  onToggleSound,
  onRecalibrate,
}) => {
  const deltaPercent = currentTraffic.baselineRpm > 0 
    ? Math.round(((currentTraffic.liveRpm - currentTraffic.baselineRpm) / currentTraffic.baselineRpm) * 100)
    : 0;

  const isBreached = currentTraffic.liveRpm > currentTraffic.thresholdUpper;

  return (
    <section className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
        
        {/* Left: Key Metrics Grid */}
        <div className="flex flex-wrap items-center gap-8 text-xs text-slate-400">
          
          {/* Security Posture Status */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Cyber Posture
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${
                anomalyActive ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {anomalyActive ? 'ANOMALY DETECTED' : 'NOMINAL BASELINE'}
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-slate-400">
                {activeAnomalyCount === 0 ? '0 Threat Vectors' : `${activeAnomalyCount} Active Incident(s)`}
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          {/* Live Ingestion vs Baseline */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Live Ingestion Rate
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-base font-bold font-mono tabular-nums ${
                isBreached ? 'text-rose-400 font-extrabold' : 'text-slate-100'
              }`}>
                {currentTraffic.liveRpm.toLocaleString()}
              </span>
              <span className="text-[11px] font-mono text-slate-400">RPM</span>
              <span className="text-slate-600">·</span>
              <span className={`text-xs font-mono tabular-nums ${
                deltaPercent > 0 ? (isBreached ? 'text-rose-400' : 'text-amber-400') : 'text-emerald-400'
              }`}>
                {deltaPercent > 0 ? `+${deltaPercent}%` : `${deltaPercent}%`} vs Baseline
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          {/* Baseline Upper Threshold */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Threshold Envelope
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold font-mono tabular-nums text-slate-300">
                {currentTraffic.thresholdUpper.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400">RPM Max</span>
              <span className="text-slate-600">/</span>
              <span className="text-xs text-slate-400 font-mono">
                {currentTraffic.baselineRpm} Avg
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          {/* Purdue Topology Nodes */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Monitored OT Nodes
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-200 font-semibold font-mono tabular-nums">
                {totalDevices} Devices
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Purdue L1–L3</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Ports 502 / 4840</span>
            </div>
          </div>

        </div>

        {/* Right: Operational Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Security Alarm Audio' : 'Enable Security Alarm Audio'}
            className={`p-2 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80 hover:bg-cyan-900/60'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline font-mono">{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          <button
            onClick={onRecalibrate}
            title="Recalibrate dynamic statistical baseline from recent traffic"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Calibrate Baseline</span>
          </button>
        </div>

      </div>
    </section>
  );
};
