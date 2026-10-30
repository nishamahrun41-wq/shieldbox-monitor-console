import React from 'react';
import { 
  Play, 
  Pause, 
  Zap, 
  Radio, 
  ShieldAlert, 
  RotateCcw, 
  Flame, 
  Crosshair, 
  Lock, 
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { SimulatorState } from '../types';

interface SimulatorControlsProps {
  simulatorState: SimulatorState;
  onToggleModbusFlood: () => void;
  onToggleRogueDevice: () => void;
  onToggleOpcCertAnomaly: () => void;
  onTogglePlayPause: () => void;
  onChangeSpeed: (speed: number) => void;
  onResetAll: () => void;
  onSimulateBoth: () => void;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  simulatorState,
  onToggleModbusFlood,
  onToggleRogueDevice,
  onToggleOpcCertAnomaly,
  onTogglePlayPause,
  onChangeSpeed,
  onResetAll,
  onSimulateBoth,
}) => {
  const isAnyAnomalyActive = 
    simulatorState.modbusWriteFloodActive || 
    simulatorState.rogueDeviceActive || 
    simulatorState.opcCertAnomalyActive;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 border-b border-slate-800 bg-slate-950/60">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">
              Interactive Simulator Controls
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Inject synthetic industrial cyber attacks to test baseline detection and automated defense rules
          </p>
        </div>

        {/* Global Play/Pause & Speed */}
        <div className="flex items-center gap-3">
          {/* Speed Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <span className="text-[10px] text-slate-500 font-mono px-1.5 uppercase">Speed:</span>
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => onChangeSpeed(speed)}
                className={`px-2 py-0.5 rounded font-mono font-medium transition-colors ${
                  simulatorState.speedMultiplier === speed
                    ? 'bg-slate-800 text-cyan-300 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Pause / Resume Button */}
          <button
            onClick={onTogglePlayPause}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              simulatorState.isRunning
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                : 'bg-amber-950/80 border-amber-800 text-amber-300 hover:bg-amber-900'
            }`}
          >
            {simulatorState.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{simulatorState.isRunning ? 'Pause Engine' : 'Resume Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid of Anomaly Injectors */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Anomaly 1: Modbus Write Flood */}
        <div className={`p-4 rounded-xl border transition-all ${
          simulatorState.modbusWriteFloodActive
            ? 'bg-rose-950/30 border-rose-600/80 ring-1 ring-rose-500/30'
            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
        }`}>
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${
                simulatorState.modbusWriteFloodActive ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-900 text-slate-400'
              }`}>
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100">
                  Inject Modbus Write Flood
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  Target: PLC-01 (10.0.1.12:502)
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={onToggleModbusFlood}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                simulatorState.modbusWriteFloodActive ? 'bg-rose-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  simulatorState.modbusWriteFloodActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Simulates an adversary sending high-frequency FC16 (Write Multiple Registers) requests (4,800+ RPM) attempting to override steam boiler valve limits.
          </p>

          <div className="flex items-center justify-between text-[11px] font-mono border-t border-slate-800/80 pt-2 text-slate-400">
            <span>MITRE ATT&CK:</span>
            <span className="text-rose-400 font-semibold">T0855 Unauthorized Command</span>
          </div>
        </div>

        {/* Anomaly 2: Add Rogue Device 10.0.0.99 */}
        <div className={`p-4 rounded-xl border transition-all ${
          simulatorState.rogueDeviceActive
            ? 'bg-rose-950/30 border-rose-600/80 ring-1 ring-rose-500/30'
            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
        }`}>
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${
                simulatorState.rogueDeviceActive ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-900 text-slate-400'
              }`}>
                <Crosshair className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100">
                  Add Rogue Device 10.0.0.99
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  MAC: 00:1A:2B:3C:4D:EE
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={onToggleRogueDevice}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                simulatorState.rogueDeviceActive ? 'bg-rose-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  simulatorState.rogueDeviceActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Spawns an unauthorized hardware tap on unmanaged switch SW-02 broadcasting ARP spoofing and actively probing Modbus port 502 across Level 1.
          </p>

          <div className="flex items-center justify-between text-[11px] font-mono border-t border-slate-800/80 pt-2 text-slate-400">
            <span>MITRE ATT&CK:</span>
            <span className="text-rose-400 font-semibold">T0846 Rogue Master</span>
          </div>
        </div>

        {/* Anomaly 3: OPC UA Certificate Bypass */}
        <div className={`p-4 rounded-xl border transition-all ${
          simulatorState.opcCertAnomalyActive
            ? 'bg-amber-950/30 border-amber-600/80 ring-1 ring-amber-500/30'
            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
        }`}>
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${
                simulatorState.opcCertAnomalyActive ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-900 text-slate-400'
              }`}>
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100">
                  OPC UA Cert Bypass Attempt
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  Target: Historian-01:4840
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={onToggleOpcCertAnomaly}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                simulatorState.opcCertAnomalyActive ? 'bg-amber-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  simulatorState.opcCertAnomalyActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Simulates a rogue workstation initiating an OPC UA SecureChannel with SecurityPolicy#None, attempting to bypass X.509 industrial mutual authentication.
          </p>

          <div className="flex items-center justify-between text-[11px] font-mono border-t border-slate-800/80 pt-2 text-slate-400">
            <span>MITRE ATT&CK:</span>
            <span className="text-amber-400 font-semibold">T0888 Spoofing / Cert Bypass</span>
          </div>
        </div>

      </div>

      {/* Simulator Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-semibold text-slate-300">Preset Scenarios:</span>
          <span>Run multi-vector coordinated attacks or return all controllers to nominal baseline.</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSimulateBoth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 font-semibold text-xs transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Coordinated Attack Scenario</span>
          </button>

          <button
            onClick={onResetAll}
            disabled={!isAnyAnomalyActive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              isAnyAnomalyActive
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                : 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Nominal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
