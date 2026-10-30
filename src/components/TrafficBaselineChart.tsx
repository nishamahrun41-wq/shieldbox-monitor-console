import React, { useState } from 'react';
import { Activity, AlertTriangle, TrendingUp, ShieldAlert, BarChart3 } from 'lucide-react';
import { TrafficPoint } from '../types';

interface TrafficBaselineChartProps {
  history: TrafficPoint[];
  modbusThreshold: number;
  tolerancePct: number;
  modbusWriteFloodActive: boolean;
  rogueDeviceActive: boolean;
}

export const TrafficBaselineChart: React.FC<TrafficBaselineChartProps> = ({
  history,
  modbusWriteFloodActive,
  rogueDeviceActive
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TrafficPoint | null>(null);
  const [viewWindow, setViewWindow] = useState<'15m' | '30m'>('30m');

  const displayPoints = viewWindow === '15m' ? history.slice(-15) : history;
  
  if (displayPoints.length === 0) {
    return <div className="p-8 text-center text-slate-500">Awaiting traffic ingestion...</div>;
  }

  // Calculate chart boundaries
  const maxLive = Math.max(...displayPoints.map(p => Math.max(p.liveRpm, p.thresholdUpper)));
  const maxY = Math.ceil((maxLive * 1.15) / 500) * 500; // round up to nearest 500
  const minY = 0;

  // Chart dimensions
  const width = 850;
  const height = 240;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    return paddingLeft + (index / (displayPoints.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    return paddingTop + chartH - ((clamped - minY) / (maxY - minY)) * chartH;
  };

  // Generate SVG path for Baseline
  const baselinePath = displayPoints.reduce((acc, point, idx) => {
    const x = getX(idx);
    const y = getY(point.baselineRpm);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Generate SVG path for Upper Threshold Envelope
  const thresholdPath = displayPoints.reduce((acc, point, idx) => {
    const x = getX(idx);
    const y = getY(point.thresholdUpper);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Generate SVG path for Live Traffic
  const livePath = displayPoints.reduce((acc, point, idx) => {
    const x = getX(idx);
    const y = getY(point.liveRpm);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Generate area fill path for live traffic
  const liveAreaPath = `${livePath} L ${getX(displayPoints.length - 1)} ${paddingTop + chartH} L ${getX(0)} ${paddingTop + chartH} Z`;

  // Latest point
  const currentPoint = displayPoints[displayPoints.length - 1];
  const isCurrentlyBreached = currentPoint.liveRpm > currentPoint.thresholdUpper;

  // Horizontal Grid Lines
  const gridTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY].map(v => Math.round(v));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 border-b border-slate-800 bg-slate-950/60">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">
              Traffic Baselining: Live vs Learned Baseline
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical requests per minute (RPM) compared against dynamic tolerance bounds
          </p>
        </div>

        {/* View Controls & Current Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setViewWindow('15m')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                viewWindow === '15m' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Last 15m
            </button>
            <button
              onClick={() => setViewWindow('30m')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                viewWindow === '30m' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Last 30m
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <span className={`font-mono font-semibold ${
              isCurrentlyBreached ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {isCurrentlyBreached ? 'THRESHOLD BREACH' : 'ENVELOPE NOMINAL'}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative p-4 bg-[#070b13]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            {/* Live Gradient */}
            <linearGradient id="liveAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>

            {/* Breach Gradient */}
            <linearGradient id="breachAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y Axis Labels */}
          {gridTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={val} className="text-slate-600">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="2 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  className="text-[10px] font-mono tabular-nums"
                >
                  {val.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* X Axis Time Labels */}
          {displayPoints.map((point, idx) => {
            if (idx % Math.ceil(displayPoints.length / 6) !== 0 && idx !== displayPoints.length - 1) return null;
            const x = getX(idx);
            return (
              <text
                key={point.timestamp + idx}
                x={x}
                y={height - 10}
                textAnchor="middle"
                fill="#64748b"
                className="text-[10px] font-mono"
              >
                {point.timestamp}
              </text>
            );
          })}

          {/* Live Area Fill */}
          <path
            d={liveAreaPath}
            fill={isCurrentlyBreached ? 'url(#breachAreaGrad)' : 'url(#liveAreaGrad)'}
          />

          {/* Learned Baseline Curve (Muted Dashed Slate) */}
          <path
            d={baselinePath}
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Upper Threshold Envelope (Safety Barrier) */}
          <path
            d={thresholdPath}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="1.6"
            strokeDasharray="6 3"
            opacity={0.8}
          />

          {/* Live Traffic Path */}
          <path
            d={livePath}
            fill="none"
            stroke={isCurrentlyBreached ? '#f43f5e' : '#06b6d4'}
            strokeWidth="2.5"
          />

          {/* Interactive Scrubbing Points */}
          {displayPoints.map((point, idx) => {
            const x = getX(idx);
            const y = getY(point.liveRpm);
            const isPointBreached = point.liveRpm > point.thresholdUpper;

            return (
              <g 
                key={idx}
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer group"
              >
                {/* Invisible hover capture target */}
                <rect
                  x={x - 10}
                  y={paddingTop}
                  width="20"
                  height={chartH}
                  fill="transparent"
                />

                {/* Point circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isPointBreached ? 4 : 2.5}
                  fill={isPointBreached ? '#f43f5e' : '#06b6d4'}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  className="transition-transform group-hover:scale-150"
                />
              </g>
            );
          })}

          {/* Hover Scrubber Line & Tooltip */}
          {hoveredPoint && (
            (() => {
              const idx = displayPoints.findIndex(p => p.timeSeconds === hoveredPoint.timeSeconds);
              if (idx === -1) return null;
              const x = getX(idx);
              const y = getY(hoveredPoint.liveRpm);
              const isBreached = hoveredPoint.liveRpm > hoveredPoint.thresholdUpper;

              return (
                <g className="pointer-events-none">
                  {/* Vertical Guide line */}
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + chartH}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity={0.6}
                  />

                  {/* Highlighted point */}
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill={isBreached ? '#f43f5e' : '#38bdf8'}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
              );
            })()
          )}
        </svg>

        {/* Hover Tooltip floating box */}
        {hoveredPoint && (
          <div 
            className="absolute top-6 left-16 bg-slate-950/95 border border-slate-700/80 rounded-lg p-3 text-xs shadow-2xl backdrop-blur-md pointer-events-none z-20 min-w-[240px]"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <span className="font-mono text-slate-400">{hoveredPoint.timestamp}</span>
              <span className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded ${
                hoveredPoint.liveRpm > hoveredPoint.thresholdUpper
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {hoveredPoint.liveRpm > hoveredPoint.thresholdUpper ? 'ANOMALY EXCEEDED' : 'NOMINAL ENVELOPE'}
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Live Traffic:</span>
                <span className="font-bold text-slate-100 tabular-nums">
                  {hoveredPoint.liveRpm.toLocaleString()} RPM
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Baseline Target:</span>
                <span className="text-slate-300 tabular-nums">
                  {hoveredPoint.baselineRpm.toLocaleString()} RPM
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Upper Threshold:</span>
                <span className="text-rose-400 tabular-nums">
                  {hoveredPoint.thresholdUpper.toLocaleString()} RPM
                </span>
              </div>
              <div className="border-t border-slate-800/80 pt-1 mt-1 flex justify-between text-[10px] text-slate-400">
                <span>Modbus: {hoveredPoint.modbusRpm} RPM</span>
                <span>OPC UA: {hoveredPoint.opcRpm} RPM</span>
                {hoveredPoint.rogueRpm > 0 && (
                  <span className="text-rose-400">Rogue: {hoveredPoint.rogueRpm} RPM</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer with Key & Breakdown */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 border-t border-slate-800 bg-slate-950/70 text-xs">
        {/* Visual Line Legend */}
        <div className="flex flex-wrap items-center gap-5 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-cyan-400 rounded-full inline-block" />
            <span className="font-medium text-slate-200">Live Traffic (RPM)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-b border-dashed border-slate-400 inline-block" />
            <span className="text-slate-400">Learned Baseline Mean</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-b border-dashed border-rose-500 inline-block" />
            <span className="text-rose-400">Threshold Envelope Limit (+35%)</span>
          </div>
        </div>

        {/* Real-time Rate breakdown summary */}
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span>Modbus TCP: <strong className="text-cyan-300">{currentPoint.modbusRpm} RPM</strong></span>
          <span className="text-slate-600">·</span>
          <span>OPC UA: <strong className="text-amber-300">{currentPoint.opcRpm} RPM</strong></span>
          {currentPoint.rogueRpm > 0 && (
            <>
              <span className="text-slate-600">·</span>
              <span>Rogue: <strong className="text-rose-400 animate-pulse">{currentPoint.rogueRpm} RPM</strong></span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
