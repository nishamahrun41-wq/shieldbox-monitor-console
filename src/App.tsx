/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { OverviewMetrics } from './components/OverviewMetrics';
import { DeviceMap } from './components/DeviceMap';
import { TrafficBaselineChart } from './components/TrafficBaselineChart';
import { SimulatorControls } from './components/SimulatorControls';
import { RealTimeAlerts } from './components/RealTimeAlerts';
import { ProtocolProfiles } from './components/ProtocolProfiles';
import { DeviceDetailModal } from './components/DeviceDetailModal';
import { PacketInspectorModal } from './components/PacketInspectorModal';
import { ReportModal } from './components/ReportModal';

import {
  INITIAL_DEVICES,
  ROGUE_DEVICE,
  INITIAL_LINKS,
  ROGUE_LINKS,
  INITIAL_MODBUS_PROFILE,
  INITIAL_OPC_PROFILE,
  generateInitialHistory,
  SAMPLE_ALERTS
} from './data/initialData';

import { 
  Device, 
  NetworkLink, 
  TrafficPoint, 
  SecurityAlert, 
  ModbusProfile, 
  OpcProfile, 
  SimulatorState 
} from './types';

export default function App() {
  // Navigation State
  const [activeSection, setActiveSection] = useState<string>('map');

  // Network Inventory & Topology State
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [links, setLinks] = useState<NetworkLink[]>(INITIAL_LINKS);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Traffic Baselining History
  const [history, setHistory] = useState<TrafficPoint[]>(() => generateInitialHistory());

  // Protocol Profiles
  const [modbusProfile, setModbusProfile] = useState<ModbusProfile>(INITIAL_MODBUS_PROFILE);
  const [opcProfile, setOpcProfile] = useState<OpcProfile>(INITIAL_OPC_PROFILE);

  // Simulator Controls State
  const [simulatorState, setSimulatorState] = useState<SimulatorState>({
    isRunning: true,
    speedMultiplier: 1,
    modbusWriteFloodActive: false,
    rogueDeviceActive: false,
    opcCertAnomalyActive: false,
    soundEnabled: true,
  });

  // Plain-Language Alerts Feed
  const [alerts, setAlerts] = useState<SecurityAlert[]>(SAMPLE_ALERTS);

  // Modals
  const [inspectingAlert, setInspectingAlert] = useState<SecurityAlert | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Sound generator
  const playAlertSound = () => {
    if (!simulatorState.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch {
      // AudioContext blocked or unsupported, ignore
    }
  };

  // Synchronize Devices and Links whenever simulation toggles change
  useEffect(() => {
    let currentDevs = [...INITIAL_DEVICES];
    let currentLinks = [...INITIAL_LINKS];

    if (simulatorState.rogueDeviceActive) {
      currentDevs.push(ROGUE_DEVICE);
      currentLinks = [...currentLinks, ...ROGUE_LINKS];
    }

    // Update link RPMs and flood states
    currentLinks = currentLinks.map(l => {
      if (l.sourceId === 'HMI-MAIN' && l.targetId === 'PLC-01-STEAM') {
        return {
          ...l,
          activeRpm: simulatorState.modbusWriteFloodActive ? 4850 : 380,
          status: simulatorState.modbusWriteFloodActive ? 'flooded' : 'normal',
        };
      }
      return l;
    });

    // Update PLC-01 status if flooded
    currentDevs = currentDevs.map(d => {
      if (d.id === 'PLC-01-STEAM') {
        return {
          ...d,
          status: simulatorState.modbusWriteFloodActive ? 'alert' : 'nominal',
          currentRpm: simulatorState.modbusWriteFloodActive ? 4850 : 380,
        };
      }
      return d;
    });

    setDevices(currentDevs);
    setLinks(currentLinks);
  }, [simulatorState.modbusWriteFloodActive, simulatorState.rogueDeviceActive]);

  // Main Simulation Ticker Loop
  useEffect(() => {
    if (!simulatorState.isRunning) return;

    const intervalTime = Math.max(200, 1000 / simulatorState.speedMultiplier);

    const timer = setInterval(() => {
      setHistory(prevHistory => {
        const lastPoint = prevHistory[prevHistory.length - 1];
        const nextTime = new Date((lastPoint.timeSeconds + 1) * 1000);
        const timeStr = nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Learned Baseline mean
        const baseNominal = 1050 + Math.sin(nextTime.getTime() / 25000) * 80;
        const toleranceMultiplier = 1 + (modbusProfile.baselineDeviationTolerancePct / 100);
        const threshold = Math.round(baseNominal * toleranceMultiplier);

        // Compute Live Traffic based on active anomaly injections
        let live = baseNominal + (Math.sin(nextTime.getTime() / 6000) + Math.cos(nextTime.getTime() / 4000)) * 45;
        let modbus = Math.round(live * 0.62);
        let opc = Math.round(live * 0.38);
        let rogue = 0;

        if (simulatorState.modbusWriteFloodActive) {
          const floodSurge = 3800 + Math.sin(nextTime.getTime() / 1500) * 350;
          modbus += Math.round(floodSurge);
          live += floodSurge;
        }

        if (simulatorState.rogueDeviceActive) {
          rogue = 1350 + Math.round(Math.random() * 200);
          live += rogue;
        }

        const finalLive = Math.round(live);
        const isBreached = finalLive > threshold;

        const newPoint: TrafficPoint = {
          timestamp: timeStr,
          timeSeconds: lastPoint.timeSeconds + 1,
          liveRpm: finalLive,
          baselineRpm: Math.round(baseNominal),
          thresholdUpper: threshold,
          modbusRpm: modbus,
          opcRpm: opc,
          rogueRpm: rogue,
          isBreached,
        };

        const updated = [...prevHistory.slice(1), newPoint];
        return updated;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [
    simulatorState.isRunning,
    simulatorState.speedMultiplier,
    simulatorState.modbusWriteFloodActive,
    simulatorState.rogueDeviceActive,
    modbusProfile.baselineDeviationTolerancePct
  ]);

  // Handle Modbus Flood Toggle
  const handleToggleModbusFlood = () => {
    const nextState = !simulatorState.modbusWriteFloodActive;
    setSimulatorState(s => ({ ...s, modbusWriteFloodActive: nextState }));

    if (nextState) {
      playAlertSound();
      const newAlert: SecurityAlert = {
        id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        severity: 'critical',
        title: 'Modbus FC16 Write Flood Exceeds Baseline on Boiler Controller PLC-01',
        sourceIp: '10.0.2.14 (HMI-Main)',
        targetIp: '10.0.1.12:502 (PLC-01-STEAM)',
        protocol: 'Modbus TCP (Port 502)',
        plainExplanation: 'ShieldBox detected an abnormal spike of 4,850 Modbus write requests/min targeting Holding Registers 40001-40150 on Siemens S7-1500 PLC-01. The normal operating baseline is 360 RPM. This represents a +304% surge above threshold bounds, consistent with automated adversary setpoint tampering.',
        impact: 'Critical Process Risk: Rapid holding register modifications may override steam boiler pressure limits, inducing physical boiler tube fatigue, process trip, or high-pressure steam blowout.',
        recommendedAction: '1. Quarantine switch port SW-02 Gi1/0/4 immediately.\n2. Review current engineering control log.\n3. Compare PLC runtime memory against golden firmware baseline hash.',
        acknowledged: false,
        resolved: false,
        anomalyType: 'modbus_flood',
        rawPayload: {
          hex: '00 2A 00 00 00 17 01 10 9C 41 00 08 10 00 FF 00 FF 01 2C 02 58 00 00 00 01',
          functionCode: '0x10 (Write Multiple Holding Registers)',
          transId: '0x002A',
          unitId: '0x01',
          registerRange: '40001 - 40008 (High-Pressure Steam Valve & Pump Setpoints)',
          decoded: 'Rapid sequential write: HR-40001 set to 0x00FF (255 Bar), HR-40004 set to 0x012C (300 Bar max limit override).'
        }
      };

      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  // Handle Rogue Device Toggle
  const handleToggleRogueDevice = () => {
    const nextState = !simulatorState.rogueDeviceActive;
    setSimulatorState(s => ({ ...s, rogueDeviceActive: nextState }));

    if (nextState) {
      playAlertSound();
      const newAlert: SecurityAlert = {
        id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        severity: 'critical',
        title: 'Unauthorized Rogue Device Detected on OT Subnet (10.0.0.99)',
        sourceIp: '10.0.0.99 (Rogue Hardware Tap)',
        targetIp: '10.0.1.0/24 Subnet (Level 1 PLCs)',
        protocol: 'ARP / Modbus TCP Sweep',
        plainExplanation: 'A new network interface with unregistered MAC address 00:1A:2B:3C:4D:EE has tapped into unmanaged field switch SW-02. Device is transmitting gratuitous ARP requests and performing rapid Port 502 sweeps targeting PLC-01 and PLC-02.',
        impact: 'Perimeter Intrusion: Unauthorized machine plugged directly into Purdue Level 1 field zone. Potential precursor to firmware corruption or unauthorized coil manipulation.',
        recommendedAction: '1. Physically inspect Switch SW-02 in Enclosure E-14.\n2. Issue automated port shutdown on SW-02 Port 8.\n3. Verify zero unauthenticated Modbus connections reached controllers.',
        acknowledged: false,
        resolved: false,
        anomalyType: 'rogue_device',
        rawPayload: {
          hex: 'FF FF FF FF FF FF 00 1A 2B 3C 4D EE 08 06 00 01 08 00 06 04 00 01 00 1A 2B 3C 4D EE 0A 00 00 63',
          functionCode: 'ARP Request / Port 502 TCP SYN',
          transId: 'N/A',
          unitId: '0xFF',
          registerRange: 'Broad subnet discovery',
          decoded: 'Broadcast ARP: Who has 10.0.1.12? Tell 10.0.0.99 (Kali Linux signature detected).'
        }
      };

      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  // Handle OPC UA Certificate Anomaly
  const handleToggleOpcCertAnomaly = () => {
    const nextState = !simulatorState.opcCertAnomalyActive;
    setSimulatorState(s => ({ ...s, opcCertAnomalyActive: nextState }));

    if (nextState) {
      playAlertSound();
      const newAlert: SecurityAlert = {
        id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        severity: 'high',
        title: 'OPC UA Security Policy Violation: Untrusted Certificate Rejected',
        sourceIp: '10.0.3.25 (Workstation-01)',
        targetIp: '10.0.3.10:4840 (Historian-01)',
        protocol: 'OPC UA (Port 4840)',
        plainExplanation: 'An OPC UA client initiated an OpenSecureChannel request requesting SecurityPolicy#None without supplying a certificate signed by the ShieldBox Plant Root CA. Session was rejected by strict profile enforcement.',
        impact: 'Confidentiality Risk: Attempted plaintext eavesdropping on historical plant telemetry and sensor archive.',
        recommendedAction: '1. Re-provision X.509 client certificate on Engineering Workstation.\n2. Verify client binary signature.',
        acknowledged: false,
        resolved: false,
        anomalyType: 'opc_untrusted_cert',
        rawPayload: {
          hex: '4F 50 4E 46 00 00 00 48 00 00 00 01 68 74 74 70 3A 2F 2F 6F 70 63 66 6F 75 6E 64 61 74 69 6F 6E',
          functionCode: 'OPN (OpenSecureChannel)',
          decoded: 'OPC UA SecureChannel Request: SecurityPolicy URI = http://opcfoundation.org/UA/SecurityPolicy#None'
        }
      };

      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  // Coordinated Attack Simulation
  const handleSimulateBoth = () => {
    setSimulatorState(s => ({
      ...s,
      modbusWriteFloodActive: true,
      rogueDeviceActive: true,
      opcCertAnomalyActive: true,
    }));
    playAlertSound();

    const dualAlert: SecurityAlert = {
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      severity: 'critical',
      title: 'Coordinated Multi-Vector Industrial Cyber Intrusion In Progress',
      sourceIp: '10.0.0.99 & 10.0.2.14',
      targetIp: 'Purdue Levels 1, 2, & 3',
      protocol: 'Multi-Protocol Coordinated',
      plainExplanation: 'Simultaneous Modbus FC16 setpoint flood and rogue hardware tap detected. Adversary is engaging in coordinated disruption across multiple Purdue layers.',
      impact: 'Critical Systemic Hazard: High probability of cascading safety trip or turbine trip.',
      recommendedAction: 'Execute OT Incident Response Playbook IR-04. Isolate OT perimeter firewall and engage manual mechanical interlocks.',
      acknowledged: false,
      resolved: false,
      anomalyType: 'modbus_flood',
      rawPayload: {
        hex: 'MULTI-VECTOR COMBINED PAYLOAD CAPTURE',
        decoded: 'Simultaneous Modbus write flood + ARP spoofing sweep.'
      }
    };

    setAlerts(prev => [dualAlert, ...prev]);
  };

  // Reset to Nominal Baseline
  const handleResetAll = () => {
    setSimulatorState(s => ({
      ...s,
      modbusWriteFloodActive: false,
      rogueDeviceActive: false,
      opcCertAnomalyActive: false,
    }));

    // Mark current active alerts as resolved
    setAlerts(prev => prev.map(a => ({ ...a, resolved: true, acknowledged: true })));
  };

  // Alert Actions
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const handleQuarantineDevice = (ip: string) => {
    const cleanIp = ip.split(' ')[0];
    setDevices(prev => prev.map(d => {
      if (d.ip === cleanIp || d.id === cleanIp) {
        return { ...d, isIsolated: !d.isIsolated, status: d.isIsolated ? 'nominal' : 'quarantined' };
      }
      return d;
    }));

    // Add info alert
    const isolationAlert: SecurityAlert = {
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      severity: 'info',
      title: `Port Isolation Action Executed for ${cleanIp}`,
      sourceIp: 'ShieldBox Automated Defense',
      targetIp: cleanIp,
      protocol: 'SNMP / IEEE 802.1X Port Control',
      plainExplanation: `Administrative quarantine signal sent to managed switch. Physical port associated with ${cleanIp} has been disabled to prevent lateral movement.`,
      impact: 'Device disconnected from industrial control network. Traffic ingestion from this node halted.',
      recommendedAction: 'Verify physical cabling before un-quarantining device.',
      acknowledged: true,
      resolved: true,
      anomalyType: 'rogue_device',
      rawPayload: {
        hex: 'SNMP SetRequest: ifAdminStatus.8 = down(2)',
        decoded: 'Port quarantine successfully acknowledged by managed switch.'
      }
    };

    setAlerts(prev => [isolationAlert, ...prev]);
  };

  const handleRecalibrateBaseline = () => {
    setHistory(prev => {
      const avg = Math.round(prev.reduce((acc, p) => acc + p.liveRpm, 0) / prev.length);
      const tolerance = 1 + (modbusProfile.baselineDeviationTolerancePct / 100);
      return prev.map(p => ({
        ...p,
        baselineRpm: avg,
        thresholdUpper: Math.round(avg * tolerance),
      }));
    });

    const recalAlert: SecurityAlert = {
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      severity: 'info',
      title: 'Dynamic Baseline Statistical Model Recalibrated',
      sourceIp: 'ShieldBox AI Baselining Engine',
      targetIp: 'All Purdue Subnets',
      protocol: 'Statistical Engine',
      plainExplanation: 'New Gaussian baseline mean recomputed from recent historical sample points. Threshold envelope updated.',
      impact: 'Nominal baseline envelope aligned with current plant operating shift.',
      recommendedAction: 'Monitor deviation variance for the next 15 minutes.',
      acknowledged: true,
      resolved: true,
      anomalyType: 'modbus_flood',
      rawPayload: {
        hex: 'CALIBRATION_EVENT_OK',
        decoded: 'Baseline recalibrated successfully.'
      }
    };

    setAlerts(prev => [recalAlert, ...prev]);
  };

  const currentTraffic = history[history.length - 1] || {
    timestamp: 'now',
    timeSeconds: 0,
    liveRpm: 1050,
    baselineRpm: 1050,
    thresholdUpper: 1417,
    modbusRpm: 651,
    opcRpm: 399,
    rogueRpm: 0,
    isBreached: false,
  };

  const activeAlerts = alerts.filter(a => !a.resolved);
  const isAnyAnomalyActive = 
    simulatorState.modbusWriteFloodActive || 
    simulatorState.rogueDeviceActive || 
    simulatorState.opcCertAnomalyActive;

  // Section reference scrolling
  const sectionRefs = {
    map: useRef<HTMLDivElement>(null),
    traffic: useRef<HTMLDivElement>(null),
    simulator: useRef<HTMLDivElement>(null),
    alerts: useRef<HTMLDivElement>(null),
    profiles: useRef<HTMLDivElement>(null),
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    const target = sectionRefs[section as keyof typeof sectionRefs];
    if (target?.current) {
      target.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      
      {/* 3-Zone Top Bar Contract */}
      <TopBar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onExportReport={() => setIsReportOpen(true)}
        alertCount={activeAlerts.length}
        anomalyActive={isAnyAnomalyActive}
      />

      {/* Top Telemetry Strip */}
      <OverviewMetrics
        currentTraffic={currentTraffic}
        totalDevices={devices.length}
        anomalyActive={isAnyAnomalyActive}
        activeAnomalyCount={activeAlerts.length}
        soundEnabled={simulatorState.soundEnabled}
        onToggleSound={() => setSimulatorState(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
        onRecalibrate={handleRecalibrateBaseline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Specification 1: Device Map */}
        <div ref={sectionRefs.map} id="device-map">
          <DeviceMap
            devices={devices}
            links={links}
            selectedDeviceId={selectedDevice?.id || null}
            onSelectDevice={(device) => setSelectedDevice(device)}
            modbusWriteFloodActive={simulatorState.modbusWriteFloodActive}
            rogueDeviceActive={simulatorState.rogueDeviceActive}
          />
        </div>

        {/* Specification 2: Traffic Baselining Live vs Baseline Chart */}
        <div ref={sectionRefs.traffic} id="traffic-baselining">
          <TrafficBaselineChart
            history={history}
            modbusThreshold={modbusProfile.maxWriteFreqRpm}
            tolerancePct={modbusProfile.baselineDeviationTolerancePct}
            modbusWriteFloodActive={simulatorState.modbusWriteFloodActive}
            rogueDeviceActive={simulatorState.rogueDeviceActive}
          />
        </div>

        {/* Specification 3: Interactive Simulator Controls */}
        <div ref={sectionRefs.simulator} id="simulator-controls">
          <SimulatorControls
            simulatorState={simulatorState}
            onToggleModbusFlood={handleToggleModbusFlood}
            onToggleRogueDevice={handleToggleRogueDevice}
            onToggleOpcCertAnomaly={handleToggleOpcCertAnomaly}
            onTogglePlayPause={() => setSimulatorState(s => ({ ...s, isRunning: !s.isRunning }))}
            onChangeSpeed={(speed) => setSimulatorState(s => ({ ...s, speedMultiplier: speed }))}
            onResetAll={handleResetAll}
            onSimulateBoth={handleSimulateBoth}
          />
        </div>

        {/* Specification 4: Real-time Anomaly Alerts */}
        <div ref={sectionRefs.alerts} id="realtime-alerts">
          <RealTimeAlerts
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            onQuarantineDevice={handleQuarantineDevice}
            onInspectPacket={(alert) => setInspectingAlert(alert)}
            onClearResolved={() => setAlerts(prev => prev.filter(a => !a.resolved))}
          />
        </div>

        {/* Specification 5: Protocol Profiles (Threshold Sliders) */}
        <div ref={sectionRefs.profiles} id="protocol-profiles">
          <ProtocolProfiles
            modbusProfile={modbusProfile}
            opcProfile={opcProfile}
            currentTraffic={currentTraffic}
            onUpdateModbusProfile={setModbusProfile}
            onUpdateOpcProfile={setOpcProfile}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-6 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">ShieldBox Monitor Console</span>
            <span>·</span>
            <span>Passive OT/ICS Threat Detection System</span>
            <span>·</span>
            <span>IEC 62443 / NIST SP 800-82 Compliant</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Engine: Passive DPI v4.2</span>
            <span>·</span>
            <span>Tap Interface: eth0 (Promiscuous)</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DeviceDetailModal
        device={selectedDevice}
        onClose={() => setSelectedDevice(null)}
        onToggleQuarantine={handleQuarantineDevice}
      />

      <PacketInspectorModal
        alert={inspectingAlert}
        onClose={() => setInspectingAlert(null)}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        devices={devices}
        alerts={alerts}
        currentTraffic={currentTraffic}
        modbusProfile={modbusProfile}
        opcProfile={opcProfile}
      />

    </div>
  );
}
