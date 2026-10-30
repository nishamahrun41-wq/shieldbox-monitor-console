import React, { useState } from 'react';
import { 
  Server, 
  Cpu, 
  Monitor, 
  Laptop, 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Device, NetworkLink } from '../types';

interface DeviceMapProps {
  devices: Device[];
  links: NetworkLink[];
  selectedDeviceId: string | null;
  onSelectDevice: (device: Device) => void;
  modbusWriteFloodActive: boolean;
  rogueDeviceActive: boolean;
}

export const DeviceMap: React.FC<DeviceMapProps> = ({
  devices,
  links,
  selectedDeviceId,
  onSelectDevice,
  modbusWriteFloodActive,
  rogueDeviceActive,
}) => {
  const [protocolFilter, setProtocolFilter] = useState<'all' | 'modbus' | 'opc' | 'anomalous'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Filter links based on selected filter
  const filteredLinks = links.filter(link => {
    if (protocolFilter === 'modbus') return link.protocol === 'Modbus';
    if (protocolFilter === 'opc') return link.protocol === 'OPC-UA';
    if (protocolFilter === 'anomalous') return link.status !== 'normal' || link.protocol === 'Malicious-Scan';
    return true;
  });

  // Filter devices based on search
  const filteredDevices = devices.filter(dev => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      dev.name.toLowerCase().includes(q) ||
      dev.ip.includes(q) ||
      dev.vendor.toLowerCase().includes(q) ||
      dev.type.toLowerCase().includes(q)
    );
  });

  const getDeviceIcon = (type: Device['type'], status: Device['status']) => {
    if (type === 'Rogue') return <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />;
    if (type === 'Historian') return <Server className="w-5 h-5 text-amber-400" />;
    if (type === 'HMI') return <Monitor className="w-5 h-5 text-sky-400" />;
    if (type === 'PLC') return <Cpu className={`w-5 h-5 ${status === 'alert' ? 'text-rose-400' : 'text-emerald-400'}`} />;
    return <Laptop className="w-5 h-5 text-indigo-400" />;
  };

  const getDeviceCoordinates = (id: string) => {
    const dev = devices.find(d => d.id === id);
    if (!dev) return { x: 450, y: 300 };
    return { x: dev.x, y: dev.y };
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 border-b border-slate-800 bg-slate-950/60">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>OT Network Topology & Purdue Model</span>
            <span className="text-slate-500 font-normal text-xs">· ISA-95 IACS Inspection</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Passive tap inspection across Level 1 (PLCs), Level 2 (HMIs), and Level 3 (Historians)
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Protocol Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setProtocolFilter('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                protocolFilter === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Protocols
            </button>
            <button
              onClick={() => setProtocolFilter('modbus')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                protocolFilter === 'modbus' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Modbus (Port 502)
            </button>
            <button
              onClick={() => setProtocolFilter('opc')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                protocolFilter === 'opc' ? 'bg-amber-950 text-amber-300 border border-amber-800/80 shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              OPC UA (Port 4840)
            </button>
            <button
              onClick={() => setProtocolFilter('anomalous')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                protocolFilter === 'anomalous' ? 'bg-rose-950 text-rose-300 border border-rose-800/80 shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Anomalies Only
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by IP, tag, vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44"
            />
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.1))}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-1">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive SVG Canvas */}
      <div className="relative bg-[#070b13] overflow-auto h-[480px] w-full select-none">
        
        {/* Layer Zone Markers (Purdue Model Bands) */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 opacity-40">
          <div className="border-b border-dashed border-amber-900/40 pb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500/70 font-semibold flex items-center gap-2">
              <Layers className="w-3 h-3" />
              Purdue Level 3 · Site Operations & Historian Network (Subnet 10.0.3.0/24)
            </span>
          </div>

          <div className="border-b border-dashed border-sky-900/40 pb-1 mt-20">
            <span className="text-[10px] font-mono uppercase tracking-widest text-sky-500/70 font-semibold flex items-center gap-2">
              <Layers className="w-3 h-3" />
              Purdue Level 2 · Supervisory Control & HMI Panels (Subnet 10.0.2.0/24)
            </span>
          </div>

          <div className="border-b border-dashed border-emerald-900/40 pb-1 mt-20">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/70 font-semibold flex items-center gap-2">
              <Layers className="w-3 h-3" />
              Purdue Level 1 · Field Automation & Safety PLCs (Subnet 10.0.1.0/24)
            </span>
          </div>

          {rogueDeviceActive && (
            <div className="border-t border-rose-900/50 pt-1 mt-6 bg-rose-950/10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold flex items-center gap-2 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                Untrusted Physical Drop · Unregistered MAC Address 00:1A:2B:3C:4D:EE
              </span>
            </div>
          )}
        </div>

        {/* SVG Topology Visualization */}
        <div 
          className="w-full h-full min-w-[900px] min-h-[480px] flex items-center justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <svg className="w-[900px] h-[480px] overflow-visible">
            <defs>
              {/* Animated gradient for Modbus */}
              <linearGradient id="modbusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>

              {/* Animated gradient for OPC */}
              <linearGradient id="opcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              {/* Flood gradient */}
              <linearGradient id="floodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>

            {/* Render Network Links */}
            {filteredLinks.map((link) => {
              const src = getDeviceCoordinates(link.sourceId);
              const tgt = getDeviceCoordinates(link.targetId);
              const isFlooded = (link.sourceId === 'HMI-MAIN' && link.targetId === 'PLC-01-STEAM' && modbusWriteFloodActive) || link.status === 'flooded';
              const isRogueLink = link.sourceId === 'ROGUE-99' || link.protocol === 'Malicious-Scan';
              
              // Compute curved bezier path
              const midY = (src.y + tgt.y) / 2;
              const pathD = `M ${src.x} ${src.y} C ${src.x} ${midY}, ${tgt.x} ${midY}, ${tgt.x} ${tgt.y}`;

              const strokeColor = isFlooded || isRogueLink 
                ? '#f43f5e' 
                : (link.protocol === 'Modbus' ? '#06b6d4' : '#f59e0b');

              return (
                <g key={link.id} className="cursor-pointer group">
                  {/* Subtle link shadow/halo */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isFlooded || isRogueLink ? 3.5 : 1.8}
                    strokeOpacity={isFlooded || isRogueLink ? 0.9 : 0.4}
                    strokeDasharray={isRogueLink ? '6 4' : undefined}
                    className={isFlooded ? 'animate-pulse' : ''}
                  />

                  {/* Flow Particles moving along path */}
                  <circle r={isFlooded ? 4.5 : 2.5} fill={strokeColor}>
                    <animateMotion
                      path={pathD}
                      dur={isFlooded ? '0.7s' : (isRogueLink ? '0.9s' : '2.8s')}
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Second staggered packet for dense flows */}
                  {(isFlooded || link.activeRpm > 300) && (
                    <circle r={isFlooded ? 4 : 2} fill={strokeColor} opacity={0.8}>
                      <animateMotion
                        path={pathD}
                        dur={isFlooded ? '0.7s' : '2.8s'}
                        begin="0.35s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Link Rate Tooltip on hover */}
                  <text
                    x={(src.x + tgt.x) / 2}
                    y={midY - 8}
                    textAnchor="middle"
                    fill={strokeColor}
                    className="text-[10px] font-mono font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none bg-slate-900"
                  >
                    {link.protocol} · {isFlooded ? `${link.activeRpm * 4} RPM (FLOOD)` : `${link.activeRpm} RPM`}
                  </text>
                </g>
              );
            })}

            {/* Render Devices (Nodes) */}
            {filteredDevices.map((device) => {
              const isSelected = selectedDeviceId === device.id;
              const isTargetOfFlood = device.id === 'PLC-01-STEAM' && modbusWriteFloodActive;
              const isRogue = device.type === 'Rogue';
              const isQuarantined = device.isIsolated;

              return (
                <g
                  key={device.id}
                  transform={`translate(${device.x}, ${device.y})`}
                  onClick={() => onSelectDevice(device)}
                  className="cursor-pointer group"
                >
                  {/* Outer selection ring or alert pulsing ring */}
                  {(isSelected || isTargetOfFlood || isRogue) && (
                    <circle
                      r="32"
                      fill="none"
                      stroke={
                        isRogue || isTargetOfFlood 
                          ? '#f43f5e' 
                          : '#38bdf8'
                      }
                      strokeWidth="2"
                      strokeDasharray={isRogue ? '4 3' : undefined}
                      className={isTargetOfFlood || isRogue ? 'animate-ping origin-center opacity-60' : ''}
                    />
                  )}

                  {/* Node Background Body */}
                  <circle
                    r="24"
                    fill={isQuarantined ? '#334155' : (isRogue ? '#4c0519' : (isTargetOfFlood ? '#4c0519' : '#0f172a'))}
                    stroke={
                      isQuarantined
                        ? '#64748b'
                        : isRogue || isTargetOfFlood
                        ? '#f43f5e'
                        : isSelected
                        ? '#38bdf8'
                        : '#1e293b'
                    }
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    className="transition-colors group-hover:stroke-slate-400 shadow-lg"
                  />

                  {/* Icon centered */}
                  <foreignObject x="-12" y="-12" width="24" height="24" className="pointer-events-none">
                    <div className="w-full h-full flex items-center justify-center">
                      {getDeviceIcon(device.type, isTargetOfFlood ? 'alert' : device.status)}
                    </div>
                  </foreignObject>

                  {/* Device Title & IP Labels below */}
                  <text
                    y="36"
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#e2e8f0'}
                    className="text-[11px] font-semibold tracking-tight select-none pointer-events-none group-hover:fill-cyan-300"
                  >
                    {device.name}
                  </text>

                  <text
                    y="49"
                    textAnchor="middle"
                    fill="#94a3b8"
                    className="text-[10px] font-mono select-none pointer-events-none"
                  >
                    {device.ip}
                  </text>

                  {/* Status Indicator Tag */}
                  <text
                    y="61"
                    textAnchor="middle"
                    fill={
                      isQuarantined
                        ? '#94a3b8'
                        : isTargetOfFlood || isRogue
                        ? '#f43f5e'
                        : '#34d399'
                    }
                    className="text-[9px] font-mono font-medium select-none pointer-events-none uppercase"
                  >
                    {isQuarantined 
                      ? 'ISOLATED' 
                      : (isTargetOfFlood ? 'WRITE OVERRIDE' : (isRogue ? 'ROGUE INTRUDER' : `${device.currentRpm} RPM`))}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend Overlay at Bottom Right */}
        <div className="absolute bottom-3 right-4 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300 flex flex-col gap-1.5 shadow-md pointer-events-auto">
          <div className="font-semibold text-slate-200 text-[10px] uppercase tracking-wider">
            Protocol Key
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block rounded" />
            <span className="text-slate-400">Modbus TCP (Port 502)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-amber-400 inline-block rounded" />
            <span className="text-slate-400">OPC UA (Port 4840)</span>
          </div>
          {(modbusWriteFloodActive || rogueDeviceActive) && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-rose-500 inline-block rounded animate-pulse" />
              <span className="text-rose-400 font-medium">Anomaly / Flood Flow</span>
            </div>
          )}
        </div>

        {/* Quick Click Hint at Bottom Left */}
        <div className="absolute bottom-3 left-4 text-[11px] text-slate-500 pointer-events-none">
          Click any controller or node to inspect registers, MAC address, and isolation controls.
        </div>
      </div>
    </div>
  );
};
