import React from 'react';
import { X, Download, Printer, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Device, SecurityAlert, TrafficPoint, ModbusProfile, OpcProfile } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  alerts: SecurityAlert[];
  currentTraffic: TrafficPoint;
  modbusProfile: ModbusProfile;
  opcProfile: OpcProfile;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  devices,
  alerts,
  currentTraffic,
  modbusProfile,
  opcProfile,
}) => {
  if (!isOpen) return null;

  const downloadJson = () => {
    const reportData = {
      title: 'ShieldBox Monitor Console - ICS/OT Security Audit Report',
      timestamp: new Date().toISOString(),
      currentTraffic,
      modbusProfile,
      opcProfile,
      devicesCount: devices.length,
      devices,
      alertsCount: alerts.length,
      alerts
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `shieldbox_ot_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div>
            <h2 className="text-base font-bold text-white">
              OT Cyber Defense & Baseline Audit Report
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ShieldBox Passive Monitor · Plant Network Zone (IEC 62443 / NIST SP 800-82)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-300">
          
          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
              1. Executive OT Network Health Summary
            </h3>
            <p className="text-slate-300 leading-relaxed">
              ShieldBox has continuously monitored Purdue Levels 1, 2, and 3 across industrial subnets. Baseline traffic behavior is dynamically computed based on learned Gaussian distributions. Active traffic currently sits at{' '}
              <strong className="text-white font-mono">{currentTraffic.liveRpm.toLocaleString()} RPM</strong>{' '}
              against a nominal learned baseline of{' '}
              <strong className="text-white font-mono">{currentTraffic.baselineRpm.toLocaleString()} RPM</strong>.
            </p>
          </div>

          {/* Key Metrics Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Monitored Nodes</span>
              <span className="text-base font-bold text-slate-100 font-mono">{devices.length}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Threshold Envelope</span>
              <span className="text-base font-bold text-rose-400 font-mono">{currentTraffic.thresholdUpper} RPM</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Security Events</span>
              <span className="text-base font-bold text-amber-400 font-mono">{alerts.length}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Modbus Tolerance</span>
              <span className="text-base font-bold text-cyan-400 font-mono">+{modbusProfile.baselineDeviationTolerancePct}%</span>
            </div>
          </div>

          {/* Monitored Inventory Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
              2. Industrial Asset Inventory
            </h3>
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Asset Tag</th>
                    <th className="p-2.5">IP Address</th>
                    <th className="p-2.5">Purdue Zone</th>
                    <th className="p-2.5">Protocol Role</th>
                    <th className="p-2.5">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                  {devices.map(d => (
                    <tr key={d.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-slate-200 font-sans font-medium">{d.name}</td>
                      <td className="p-2.5 text-cyan-300">{d.ip}</td>
                      <td className="p-2.5 text-slate-400">{d.purdueLevel === 'Untrusted' ? 'Untrusted' : `Level ${d.purdueLevel}`}</td>
                      <td className="p-2.5 text-slate-400 font-sans">{d.protocolRole}</td>
                      <td className="p-2.5 text-slate-200">{d.currentRpm} RPM</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Incident Log */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
              3. Detected Anomaly Log
            </h3>
            <div className="space-y-2">
              {alerts.map(a => (
                <div key={a.id} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-200">{a.title}</span>
                    <span className="text-slate-500">{a.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">{a.plainExplanation}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={downloadJson}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON Audit Log</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
