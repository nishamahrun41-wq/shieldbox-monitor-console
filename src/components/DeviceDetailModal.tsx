import React from 'react';
import { X, ShieldAlert, Cpu, Server, Monitor, AlertTriangle, ShieldBan, CheckCircle2, HardDrive } from 'lucide-react';
import { Device } from '../types';

interface DeviceDetailModalProps {
  device: Device | null;
  onClose: () => void;
  onToggleQuarantine: (deviceId: string) => void;
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({
  device,
  onClose,
  onToggleQuarantine,
}) => {
  if (!device) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              device.type === 'Rogue'
                ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                : 'bg-slate-800/80 text-cyan-300 border-slate-700'
            }`}>
              {device.type === 'Rogue' ? <AlertTriangle className="w-5 h-5 text-rose-400" /> : <Cpu className="w-5 h-5 text-cyan-400" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {device.name}
              </h2>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                <span>{device.ip}</span>
                <span className="text-slate-600">·</span>
                <span>MAC: {device.mac}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Purdue & Architecture Classification */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">
                Purdue Level
              </span>
              <span className="font-bold text-slate-200">
                {device.purdueLevel === 'Untrusted' ? 'Untrusted Drop' : `Level ${device.purdueLevel}`}
              </span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">
                Device Class
              </span>
              <span className="font-bold text-slate-200">{device.type}</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">
                Current Request Rate
              </span>
              <span className="font-mono font-bold text-cyan-300 tabular-nums">
                {device.currentRpm} RPM
              </span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">
                Security State
              </span>
              <span className={`font-mono font-bold uppercase ${
                device.isIsolated
                  ? 'text-slate-400'
                  : device.status === 'alert'
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`}>
                {device.isIsolated ? 'QUARANTINED' : device.status}
              </span>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Hardware & Firmware Fingerprint
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-slate-500 block">Vendor & Brand:</span>
                <span className="font-semibold text-slate-300">{device.vendor}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Hardware Model:</span>
                <span className="font-mono text-slate-300">{device.model}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Firmware Version:</span>
                <span className="font-mono text-slate-300">{device.firmware}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Monitored Service Ports:</span>
                <span className="font-mono text-cyan-300">{device.ports.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Process Function & IO Description */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Physical Process Function
            </h3>
            <p className="text-slate-300 leading-relaxed">
              {device.processFunction}
            </p>
          </div>

          {/* Controller Register Mapping Sample */}
          {device.type === 'PLC' && (
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  Sample Holding Register Map (Modbus 40000 series)
                </h3>
                <span className="font-mono text-[10px] text-slate-500">
                  {device.registersMonitored} registers polled
                </span>
              </div>

              <div className="font-mono text-[11px] space-y-1.5 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>HR-40001: Steam Drum Pressure (Bar)</span>
                  <span className="text-cyan-300 font-bold">142.4 PSI</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>HR-40002: Superheater Temp (°C)</span>
                  <span className="text-cyan-300 font-bold">540.2 °C</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>HR-40003: Feed Pump Flow Rate (m³/h)</span>
                  <span className="text-cyan-300 font-bold">89.6 m³/h</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>HR-40004: Emergency Solenoid Trip Valve</span>
                  <span className="text-emerald-400 font-bold">ARMED (0x0001)</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={() => onToggleQuarantine(device.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              device.isIsolated
                ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-800'
                : 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800'
            }`}
          >
            <ShieldBan className="w-4 h-4" />
            <span>{device.isIsolated ? 'Restore Switch Port Link' : 'Quarantine Switch Port (Isolate Node)'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
