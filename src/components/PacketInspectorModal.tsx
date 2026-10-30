import React from 'react';
import { X, FileCode, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { SecurityAlert } from '../types';

interface PacketInspectorModalProps {
  alert: SecurityAlert | null;
  onClose: () => void;
}

export const PacketInspectorModal: React.FC<PacketInspectorModalProps> = ({
  alert,
  onClose,
}) => {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-800">
              <FileCode className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Deep Packet Inspection: {alert.protocol}
              </h2>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                <span>Event ID: {alert.id}</span>
                <span className="text-slate-600">·</span>
                <span>Captured at {alert.timestamp}</span>
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

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* IP & Transport Layer */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block text-[10px]">Source Socket:</span>
                <span className="font-semibold text-rose-300">{alert.sourceIp}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Target Socket:</span>
                <span className="font-semibold text-cyan-300">{alert.targetIp}</span>
              </div>
            </div>
          </div>

          {/* Hex Dump Section */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Raw Ethernet Frame Payload (Hex Dump):
            </span>
            <div className="bg-[#05080f] p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-400 tracking-wider overflow-x-auto selection:bg-cyan-500/30">
              <p className="leading-relaxed">
                {alert.rawPayload.hex}
              </p>
            </div>
          </div>

          {/* Protocol Data Unit (PDU) Dissection */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Decoded ICS Protocol Fields:
            </span>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs space-y-2.5 font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-1.5 text-slate-400">
                <span>MBAP Header: Protocol Identifier</span>
                <span className="text-slate-200">0x0000 (Modbus TCP)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5 text-slate-400">
                <span>MBAP Header: Unit / Slave ID</span>
                <span className="text-slate-200">0x01 (PLC Boiler Safety Loop)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5 text-slate-400">
                <span>Function Code (FC)</span>
                <span className="text-rose-400 font-bold">
                  {alert.rawPayload.functionCode || '0x10 (Write Multiple Registers)'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5 text-slate-400">
                <span>Target Register Range</span>
                <span className="text-cyan-300">
                  {alert.rawPayload.registerRange || '40001 - 40010 (Process Setpoints)'}
                </span>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 block text-[10px] mb-1">Decoded Payload Context:</span>
                <p className="text-slate-300 font-sans text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                  {alert.rawPayload.decoded}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
