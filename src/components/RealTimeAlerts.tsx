import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ShieldAlert, 
  Radio, 
  FileCode, 
  ShieldBan, 
  Check, 
  ExternalLink,
  Filter,
  Trash2
} from 'lucide-react';
import { SecurityAlert } from '../types';

interface RealTimeAlertsProps {
  alerts: SecurityAlert[];
  onAcknowledge: (id: string) => void;
  onQuarantineDevice: (ip: string) => void;
  onInspectPacket: (alert: SecurityAlert) => void;
  onClearResolved: () => void;
}

export const RealTimeAlerts: React.FC<RealTimeAlertsProps> = ({
  alerts,
  onAcknowledge,
  onQuarantineDevice,
  onInspectPacket,
  onClearResolved,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'active'>('active');

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity === 'active') return !alert.resolved;
    if (filterSeverity === 'critical') return alert.severity === 'critical';
    if (filterSeverity === 'high') return alert.severity === 'high';
    return true;
  });

  const getSeverityBadge = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-rose-950/80 text-rose-300 border border-rose-800">
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-amber-950/80 text-amber-300 border border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            HIGH
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-yellow-950/80 text-yellow-300 border border-yellow-800">
            <AlertTriangle className="w-3 h-3 text-yellow-400" />
            WARNING
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-sky-950/80 text-sky-300 border border-sky-800">
            <Info className="w-3 h-3 text-sky-400" />
            INFO
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 border-b border-slate-800 bg-slate-950/60">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">
              Real-time Plain-Language Anomaly Alerts
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Decoded OT security events translated into actionable industrial engineering language
          </p>
        </div>

        {/* Filter Tabs & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setFilterSeverity('active')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterSeverity === 'active' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active Only
            </button>
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterSeverity === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800/80 shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterSeverity === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Events ({alerts.length})
            </button>
          </div>

          <button
            onClick={onClearResolved}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg transition-colors"
            title="Clear resolved events"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Resolved</span>
          </button>
        </div>
      </div>

      {/* Alert Feed Body */}
      <div className="p-6 space-y-4 max-h-[560px] overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 border border-dashed border-slate-800 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h3 className="text-xs font-semibold text-slate-200">No Active Security Alerts</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              All Purdue Level 1, 2, and 3 communication channels are adhering to learned baseline envelopes.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all ${
                alert.resolved
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : alert.severity === 'critical'
                  ? 'bg-rose-950/20 border-rose-700/80 shadow-lg ring-1 ring-rose-500/20'
                  : alert.severity === 'high'
                  ? 'bg-amber-950/20 border-amber-700/80 shadow-md ring-1 ring-amber-500/20'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              {/* Alert Top Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  {getSeverityBadge(alert.severity)}
                  <h3 className="text-xs font-bold text-slate-100 tracking-tight">
                    {alert.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span>ID: {alert.id}</span>
                  <span className="text-slate-600">·</span>
                  <span>{alert.timestamp}</span>
                </div>
              </div>

              {/* Source & Destination IP bar */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800/80 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Source:</span>
                  <span className="font-semibold text-rose-300">{alert.sourceIp}</span>
                </div>
                <span className="text-slate-600">→</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-semibold text-cyan-300">{alert.targetIp}</span>
                </div>
                <span className="text-slate-600">·</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Protocol:</span>
                  <span className="text-slate-200">{alert.protocol}</span>
                </div>
              </div>

              {/* Plain Language Explanation (Core requirement) */}
              <div className="space-y-2 text-xs mb-4">
                <div>
                  <span className="font-semibold text-slate-300 block mb-0.5">
                    Plain-Language Security Assessment:
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
                    {alert.plainExplanation}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/50">
                    <span className="font-semibold text-rose-300 block text-[11px] mb-0.5">
                      Operational Process Impact:
                    </span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {alert.impact}
                    </p>
                  </div>

                  <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/50">
                    <span className="font-semibold text-cyan-300 block text-[11px] mb-0.5">
                      Recommended Action:
                    </span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {alert.recommendedAction}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onInspectPacket(alert)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Inspect Raw Modbus/OPC Payload</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {!alert.acknowledged && (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Acknowledge</span>
                    </button>
                  )}

                  <button
                    onClick={() => onQuarantineDevice(alert.sourceIp)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <ShieldBan className="w-3.5 h-3.5" />
                    <span>Quarantine Source ({alert.sourceIp.split(' ')[0]})</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
