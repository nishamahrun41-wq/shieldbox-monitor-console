import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Check, 
  RotateCcw, 
  BookOpen, 
  Info, 
  Zap, 
  Lock, 
  Server
} from 'lucide-react';
import { ModbusProfile, OpcProfile, TrafficPoint } from '../types';

interface ProtocolProfilesProps {
  modbusProfile: ModbusProfile;
  opcProfile: OpcProfile;
  currentTraffic: TrafficPoint;
  onUpdateModbusProfile: (profile: ModbusProfile) => void;
  onUpdateOpcProfile: (profile: OpcProfile) => void;
}

export const ProtocolProfiles: React.FC<ProtocolProfilesProps> = ({
  modbusProfile,
  opcProfile,
  currentTraffic,
  onUpdateModbusProfile,
  onUpdateOpcProfile,
}) => {
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Apply Industry Standard Preset
  const applyPreset = (preset: 'nist' | 'iec' | 'legacy') => {
    if (preset === 'nist') {
      onUpdateModbusProfile({
        ...modbusProfile,
        maxWriteFreqRpm: 1000,
        baselineDeviationTolerancePct: 20,
        maxExceptionRate: 5,
        enforceMasterWhitelist: true,
      });
      onUpdateOpcProfile({
        ...opcProfile,
        maxMonitoredItems: 350,
        publishIntervalLimitMs: 500,
        maxConcurrentSessions: 3,
        securityPolicy: 'Basic256Sha256',
        rejectUntrustedCerts: true,
      });
    } else if (preset === 'iec') {
      onUpdateModbusProfile({
        ...modbusProfile,
        maxWriteFreqRpm: 1500,
        baselineDeviationTolerancePct: 35,
        maxExceptionRate: 10,
        enforceMasterWhitelist: true,
      });
      onUpdateOpcProfile({
        ...opcProfile,
        maxMonitoredItems: 500,
        publishIntervalLimitMs: 250,
        maxConcurrentSessions: 5,
        securityPolicy: 'Basic256Sha256',
        rejectUntrustedCerts: true,
      });
    } else {
      // Legacy SCADA / Permissive
      onUpdateModbusProfile({
        ...modbusProfile,
        maxWriteFreqRpm: 4000,
        baselineDeviationTolerancePct: 75,
        maxExceptionRate: 30,
        enforceMasterWhitelist: false,
      });
      onUpdateOpcProfile({
        ...opcProfile,
        maxMonitoredItems: 1500,
        publishIntervalLimitMs: 100,
        maxConcurrentSessions: 12,
        securityPolicy: 'None',
        rejectUntrustedCerts: false,
      });
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  const toggleFunctionCode = (code: string) => {
    const updated = modbusProfile.allowedFunctionCodes.map(fc => 
      fc.code === code ? { ...fc, allowed: !fc.allowed } : fc
    );
    onUpdateModbusProfile({
      ...modbusProfile,
      allowedFunctionCodes: updated
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 border-b border-slate-800 bg-slate-950/60">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">
              Protocol Profiles & Configurable Thresholds
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrate strict behavioral bounds for Modbus TCP (Port 502) and OPC Unified Architecture (Port 4840)
          </p>
        </div>

        {/* Industry Standard Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-mono text-[11px] uppercase mr-1">Presets:</span>
          <button
            onClick={() => applyPreset('nist')}
            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded font-medium transition-colors"
          >
            NIST SP 800-82 (Strict)
          </button>
          <button
            onClick={() => applyPreset('iec')}
            className="px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 text-cyan-200 rounded font-medium transition-colors"
          >
            IEC-62443 (Balanced)
          </button>
          <button
            onClick={() => applyPreset('legacy')}
            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded font-medium transition-colors"
          >
            Legacy SCADA (Permissive)
          </button>
        </div>
      </div>

      {/* Main Content Grid: Modbus on Left, OPC UA on Right */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Profile 1: Modbus TCP */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">Modbus TCP Inspection Profile</h3>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-semibold bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded">
              Port 502 / IEC-60870
            </span>
          </div>

          {/* Slider 1: Max Write Frequency */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="modbus-max-write-freq" className="font-medium text-slate-300">
                Max Write Frequency Limit (FC06/FC16):
              </label>
              <span className="font-mono font-bold text-cyan-300 tabular-nums">
                {modbusProfile.maxWriteFreqRpm.toLocaleString()} RPM
              </span>
            </div>
            <input
              id="modbus-max-write-freq"
              type="range"
              min="500"
              max="6000"
              step="100"
              value={modbusProfile.maxWriteFreqRpm}
              onChange={(e) => onUpdateModbusProfile({
                ...modbusProfile,
                maxWriteFreqRpm: Number(e.target.value)
              })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>500 RPM (Strict Safety)</span>
              <span>Default: 1,500</span>
              <span>6,000 RPM (High Cadence)</span>
            </div>
          </div>

          {/* Slider 2: Baseline Statistical Deviation Tolerance */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="modbus-baseline-tolerance" className="font-medium text-slate-300">
                Baseline Dynamic Tolerance Band:
              </label>
              <span className="font-mono font-bold text-cyan-300 tabular-nums">
                +{modbusProfile.baselineDeviationTolerancePct}% Deviation
              </span>
            </div>
            <input
              id="modbus-baseline-tolerance"
              type="range"
              min="10"
              max="100"
              step="5"
              value={modbusProfile.baselineDeviationTolerancePct}
              onChange={(e) => onUpdateModbusProfile({
                ...modbusProfile,
                baselineDeviationTolerancePct: Number(e.target.value)
              })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>+10% (Tight Anomaly Trigger)</span>
              <span>Default: +35%</span>
              <span>+100% (Permissive)</span>
            </div>
          </div>

          {/* Slider 3: Max Exception Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="modbus-max-exception-rate" className="font-medium text-slate-300">
                Max Exception Responses Floor:
              </label>
              <span className="font-mono font-bold text-cyan-300 tabular-nums">
                {modbusProfile.maxExceptionRate} err/min
              </span>
            </div>
            <input
              id="modbus-max-exception-rate"
              type="range"
              min="2"
              max="50"
              step="1"
              value={modbusProfile.maxExceptionRate}
              onChange={(e) => onUpdateModbusProfile({
                ...modbusProfile,
                maxExceptionRate: Number(e.target.value)
              })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <p className="text-[11px] text-slate-400">
              Triggers warning when illegal address (0x02) or illegal value (0x03) exceptions exceed this rate.
            </p>
          </div>

          {/* Allowed Function Codes Matrix */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-slate-300 block">
              Allowed Modbus Function Codes (PDU Enforcement):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {modbusProfile.allowedFunctionCodes.map((fc) => (
                <label
                  key={fc.code}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    fc.allowed 
                      ? 'bg-slate-950/80 border-slate-800 text-slate-200' 
                      : 'bg-rose-950/20 border-rose-900/60 text-rose-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={fc.allowed}
                    onChange={() => toggleFunctionCode(fc.code)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <span className="font-mono text-[11px] truncate">{fc.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Master Whitelist Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Enforce Master IP Whitelist
              </span>
              <span className="text-[11px] text-slate-400">
                Reject writes from unapproved IPs (allowed: 10.0.2.14, 10.0.2.18, 10.0.3.25)
              </span>
            </div>
            <button
              onClick={() => onUpdateModbusProfile({
                ...modbusProfile,
                enforceMasterWhitelist: !modbusProfile.enforceMasterWhitelist
              })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                modbusProfile.enforceMasterWhitelist ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  modbusProfile.enforceMasterWhitelist ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Profile 2: OPC UA */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">OPC Unified Architecture (UA)</h3>
            </div>
            <span className="text-xs font-mono text-amber-400 font-semibold bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded">
              Port 4840 / IEC-62541
            </span>
          </div>

          {/* Slider 1: Max Monitored Items */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="opc-max-monitored-items" className="font-medium text-slate-300">
                Max Monitored Items per Client Session:
              </label>
              <span className="font-mono font-bold text-amber-300 tabular-nums">
                {opcProfile.maxMonitoredItems} Items
              </span>
            </div>
            <input
              id="opc-max-monitored-items"
              type="range"
              min="50"
              max="2500"
              step="50"
              value={opcProfile.maxMonitoredItems}
              onChange={(e) => onUpdateOpcProfile({
                ...opcProfile,
                maxMonitoredItems: Number(e.target.value)
              })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>50 Items (Strict Isolation)</span>
              <span>Default: 500</span>
              <span>2,500 Items (Bulk Archival)</span>
            </div>
          </div>

          {/* Slider 2: Publishing Interval Limit */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="opc-publish-interval-limit" className="font-medium text-slate-300">
                Publishing Interval Floor (Subscription Rate):
              </label>
              <span className="font-mono font-bold text-amber-300 tabular-nums">
                {opcProfile.publishIntervalLimitMs} ms
              </span>
            </div>
            <input
              id="opc-publish-interval-limit"
              type="range"
              min="50"
              max="2000"
              step="50"
              value={opcProfile.publishIntervalLimitMs}
              onChange={(e) => onUpdateOpcProfile({
                ...opcProfile,
                publishIntervalLimitMs: Number(e.target.value)
              })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>50ms (Ultra-High Rate)</span>
              <span>Default: 250ms</span>
              <span>2,000ms (Conservative)</span>
            </div>
          </div>

          {/* Slider 3: Max Concurrent Sessions */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="opc-max-concurrent-sessions" className="font-medium text-slate-300">
                Max Concurrent Client Sessions:
              </label>
              <span className="font-mono font-bold text-amber-300 tabular-nums">
                {opcProfile.maxConcurrentSessions} Sessions
              </span>
            </div>
            <input
              id="opc-max-concurrent-sessions"
              type="range"
              min="1"
              max="15"
              step="1"
              value={opcProfile.maxConcurrentSessions}
              onChange={(e) => onUpdateOpcProfile({
                ...opcProfile,
                maxConcurrentSessions: Number(e.target.value)
              })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <p className="text-[11px] text-slate-400">
              Limits supervisory client connections to the Historian to prevent Denial-of-Service exhaustion.
            </p>
          </div>

          {/* Security Policy Toggle */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-slate-300 block">
              OPC UA Cryptographic Policy:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onUpdateOpcProfile({
                  ...opcProfile,
                  securityPolicy: 'Basic256Sha256'
                })}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  opcProfile.securityPolicy === 'Basic256Sha256'
                    ? 'bg-amber-950/60 border-amber-700 text-amber-200'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-semibold text-xs mb-0.5">Basic256Sha256</div>
                <div className="text-[10px] text-slate-400">Sign & Encrypt Enforced</div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateOpcProfile({
                  ...opcProfile,
                  securityPolicy: 'None'
                })}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  opcProfile.securityPolicy === 'None'
                    ? 'bg-rose-950/60 border-rose-700 text-rose-200'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-semibold text-xs mb-0.5">Permissive / None</div>
                <div className="text-[10px] text-slate-400">Plaintext Allowed</div>
              </button>
            </div>
          </div>

          {/* Certificate Strictness Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Reject Untrusted X.509 Certificates
              </span>
              <span className="text-[11px] text-slate-400">
                Immediately sever connections from unknown root CAs
              </span>
            </div>
            <button
              onClick={() => onUpdateOpcProfile({
                ...opcProfile,
                rejectUntrustedCerts: !opcProfile.rejectUntrustedCerts
              })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                opcProfile.rejectUntrustedCerts ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  opcProfile.rejectUntrustedCerts ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

        </div>

      </div>

      {/* Threshold Status Live Bar */}
      <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Current Ingestion Compliance:</span>
          <span className={`font-mono font-bold ${
            currentTraffic.liveRpm > currentTraffic.thresholdUpper ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {currentTraffic.liveRpm > currentTraffic.thresholdUpper
              ? `BREACH: ${currentTraffic.liveRpm} RPM > ${currentTraffic.thresholdUpper} Threshold Limit`
              : `COMPLIANT: ${currentTraffic.liveRpm} RPM within ${currentTraffic.thresholdUpper} Threshold Limit`}
          </span>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>Profile Saved & Dynamic Envelope Recomputed</span>
          </div>
        )}
      </div>
    </div>
  );
};
