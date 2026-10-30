import { Device, NetworkLink, ModbusProfile, OpcProfile, SecurityAlert, TrafficPoint } from '../types';

export const INITIAL_DEVICES: Device[] = [
  // Level 3 - Operations & Historians
  {
    id: 'HIST-01',
    name: 'Historian-01 (OSIsoft PI)',
    ip: '10.0.3.10',
    mac: '00:0C:29:4F:8E:11',
    type: 'Historian',
    purdueLevel: 3,
    purdueName: 'Level 3 - Operations Network',
    vendor: 'AVEVA / OSIsoft',
    model: 'PI Server Enterprise 2024 SP2',
    firmware: 'Build 3.4.435.12',
    protocolRole: 'OPC-UA Server & Client',
    status: 'nominal',
    currentRpm: 480,
    baselineRpm: 475,
    x: 260,
    y: 85,
    lastSeen: '1s ago',
    ports: [4840, 5450, 443],
    processFunction: 'Plant-wide historical telemetry archiving, process tag aggregation (42,000 active tags).',
    registersMonitored: 42000
  },
  {
    id: 'ENG-WS-01',
    name: 'Eng-Workstation-01',
    ip: '10.0.3.25',
    mac: '00:50:56:B2:77:AA',
    type: 'Workstation',
    purdueLevel: 3,
    purdueName: 'Level 3 - Operations Network',
    vendor: 'Dell Industrial / TIA Portal',
    model: 'Precision 7920 Rack Workstation',
    firmware: 'Win10 IoT Enterprise 21H2',
    protocolRole: 'Engineering Supervisory Client',
    status: 'nominal',
    currentRpm: 120,
    baselineRpm: 110,
    x: 640,
    y: 85,
    lastSeen: '3s ago',
    ports: [102, 502, 4840],
    processFunction: 'PLC logic compilation, safety setpoint calibration, routine firmware signing.',
    registersMonitored: 850
  },

  // Level 2 - Supervisory & HMI
  {
    id: 'HMI-MAIN',
    name: 'HMI-Main (InTouch Master)',
    ip: '10.0.2.14',
    mac: '70:B3:D5:19:33:02',
    type: 'HMI',
    purdueLevel: 2,
    purdueName: 'Level 2 - Supervisory Control',
    vendor: 'Schneider / InTouch',
    model: 'InTouch HMI Industrial PC 2023',
    firmware: 'v23.1.002',
    protocolRole: 'Modbus Master & OPC Client',
    status: 'nominal',
    currentRpm: 540,
    baselineRpm: 520,
    x: 280,
    y: 235,
    lastSeen: 'just now',
    ports: [502, 4840],
    processFunction: 'Central control room graphic interface for boiler feed and steam turbine synchronization.',
    registersMonitored: 3400
  },
  {
    id: 'HMI-LINE2',
    name: 'HMI-Sub (PanelMaster)',
    ip: '10.0.2.18',
    mac: '70:B3:D5:8C:1A:E4',
    type: 'HMI',
    purdueLevel: 2,
    purdueName: 'Level 2 - Supervisory Control',
    vendor: 'Siemens SIMATIC',
    model: 'TP1500 Comfort Touch Panel',
    firmware: 'v17.0.0.4',
    protocolRole: 'Modbus Master',
    status: 'nominal',
    currentRpm: 210,
    baselineRpm: 205,
    x: 620,
    y: 235,
    lastSeen: 'just now',
    ports: [502],
    processFunction: 'Local floor operator panel for electrical substation breaker control and telemetry.',
    registersMonitored: 1200
  },

  // Level 1 - Basic Control / PLCs
  {
    id: 'PLC-01-STEAM',
    name: 'PLC-01 (Boiler Steam Feed)',
    ip: '10.0.1.12',
    mac: '00:1B:1B:44:A1:09',
    type: 'PLC',
    purdueLevel: 1,
    purdueName: 'Level 1 - Field Controllers',
    vendor: 'Siemens SIMATIC',
    model: 'S7-1518F-4 PN/DP Fail-Safe',
    firmware: 'v2.9.4 Certified IEC-62443',
    protocolRole: 'Modbus TCP Server (Slave)',
    status: 'nominal',
    currentRpm: 380,
    baselineRpm: 360,
    x: 170,
    y: 395,
    lastSeen: 'just now',
    ports: [502, 102],
    processFunction: 'Safety-instrumented system for High Pressure Steam Drum (Holding Registers 40001-40150).',
    registersMonitored: 150
  },
  {
    id: 'PLC-02-TURB',
    name: 'PLC-02 (Turbine Governor)',
    ip: '10.0.1.20',
    mac: '00:00:BC:88:21:65',
    type: 'PLC',
    purdueLevel: 1,
    purdueName: 'Level 1 - Field Controllers',
    vendor: 'Rockwell Automation',
    model: 'ControlLogix 5580 (1756-L83E)',
    firmware: 'v33.011 Redundant',
    protocolRole: 'Modbus TCP & OPC-UA Server',
    status: 'nominal',
    currentRpm: 340,
    baselineRpm: 330,
    x: 450,
    y: 395,
    lastSeen: 'just now',
    ports: [502, 4840, 44818],
    processFunction: 'Turbine rotation speed regulation, emergency trip solenoids, bearing oil pressure sensors.',
    registersMonitored: 310
  },
  {
    id: 'RTU-03-SUB',
    name: 'RTU-03 (Substation Feeder)',
    ip: '10.0.1.45',
    mac: '00:80:F4:99:3D:17',
    type: 'PLC',
    purdueLevel: 1,
    purdueName: 'Level 1 - Field Controllers',
    vendor: 'Schneider Electric',
    model: 'Modicon M580 ePAC BMEP584040',
    firmware: 'v3.20 Cyber-Hardened',
    protocolRole: 'Modbus TCP Server (Slave)',
    status: 'nominal',
    currentRpm: 190,
    baselineRpm: 185,
    x: 730,
    y: 395,
    lastSeen: 'just now',
    ports: [502],
    processFunction: '13.8kV electrical bus monitoring, breaker status telemetry, transformer temperature probes.',
    registersMonitored: 85
  }
];

export const ROGUE_DEVICE: Device = {
  id: 'ROGUE-99',
  name: 'Rogue Device (10.0.0.99)',
  ip: '10.0.0.99',
  mac: '00:1A:2B:3C:4D:EE',
  type: 'Rogue',
  purdueLevel: 'Untrusted',
  purdueName: 'Level 0/1 - Rogue Physical Drop',
  vendor: 'Unregistered / Virtual Interface',
  model: 'Kali Linux / Scapy / Modbus Scanner',
  firmware: 'Unknown / Linux 6.6.15-amd64',
  protocolRole: 'Unauthorized Scanner & Flooder',
  status: 'alert',
  currentRpm: 1420,
  baselineRpm: 0,
  x: 450,
  y: 495,
  lastSeen: 'just now',
  ports: [502, 4840, 102],
  processFunction: 'Unauthorized connection detected on unmanaged switch port SW-02. Port scanning Level 1 controllers.',
  registersMonitored: 0
};

export const INITIAL_LINKS: NetworkLink[] = [
  {
    id: 'link-1',
    sourceId: 'HMI-MAIN',
    targetId: 'PLC-01-STEAM',
    protocol: 'Modbus',
    activeRpm: 380,
    status: 'normal',
    description: 'Modbus TCP Port 502 polling holding registers 40001-40150'
  },
  {
    id: 'link-2',
    sourceId: 'HMI-MAIN',
    targetId: 'PLC-02-TURB',
    protocol: 'Modbus',
    activeRpm: 290,
    status: 'normal',
    description: 'Modbus TCP Port 502 governor setpoint synchronization'
  },
  {
    id: 'link-3',
    sourceId: 'HMI-LINE2',
    targetId: 'RTU-03-SUB',
    protocol: 'Modbus',
    activeRpm: 190,
    status: 'normal',
    description: 'Modbus TCP Port 502 substation breaker telemetry'
  },
  {
    id: 'link-4',
    sourceId: 'HIST-01',
    targetId: 'HMI-MAIN',
    protocol: 'OPC-UA',
    activeRpm: 320,
    status: 'normal',
    description: 'OPC UA Port 4840 subscribed items (Certificate: CN=ShieldBox-CA)'
  },
  {
    id: 'link-5',
    sourceId: 'HIST-01',
    targetId: 'PLC-02-TURB',
    protocol: 'OPC-UA',
    activeRpm: 180,
    status: 'normal',
    description: 'OPC UA Port 4840 direct high-frequency telemetry archive'
  },
  {
    id: 'link-6',
    sourceId: 'ENG-WS-01',
    targetId: 'HIST-01',
    protocol: 'OPC-UA',
    activeRpm: 110,
    status: 'normal',
    description: 'OPC UA Supervisory queries and batch historical validation'
  }
];

export const ROGUE_LINKS: NetworkLink[] = [
  {
    id: 'link-rogue-1',
    sourceId: 'ROGUE-99',
    targetId: 'PLC-01-STEAM',
    protocol: 'Malicious-Scan',
    activeRpm: 840,
    status: 'anomalous',
    description: 'Unauthorized Modbus TCP Port 502 sweep / FC03 dump attempts'
  },
  {
    id: 'link-rogue-2',
    sourceId: 'ROGUE-99',
    targetId: 'PLC-02-TURB',
    protocol: 'Malicious-Scan',
    activeRpm: 580,
    status: 'anomalous',
    description: 'Unauthorized ARP spoofing and Port 4840 probe'
  }
];

export const INITIAL_MODBUS_PROFILE: ModbusProfile = {
  maxWriteFreqRpm: 1500,
  baselineDeviationTolerancePct: 35,
  maxExceptionRate: 10,
  allowedFunctionCodes: [
    { code: '01', name: 'Read Coils (FC01)', allowed: true },
    { code: '02', name: 'Read Discrete Inputs (FC02)', allowed: true },
    { code: '03', name: 'Read Holding Registers (FC03)', allowed: true },
    { code: '04', name: 'Read Input Registers (FC04)', allowed: true },
    { code: '05', name: 'Write Single Coil (FC05)', allowed: false },
    { code: '06', name: 'Write Single Register (FC06)', allowed: true },
    { code: '16', name: 'Write Multiple Registers (FC16)', allowed: true }
  ],
  enforceMasterWhitelist: true,
  whitelistedMasters: ['10.0.2.14', '10.0.2.18', '10.0.3.25']
};

export const INITIAL_OPC_PROFILE: OpcProfile = {
  maxMonitoredItems: 500,
  publishIntervalLimitMs: 250,
  maxConcurrentSessions: 5,
  securityPolicy: 'Basic256Sha256',
  rejectUntrustedCerts: true
};

// Generates initial 30 minutes of historical baseline data points
export function generateInitialHistory(): TrafficPoint[] {
  const points: TrafficPoint[] = [];
  const now = Date.now();
  const count = 30;

  for (let i = count; i >= 0; i--) {
    const time = new Date(now - i * 60 * 1000);
    const minuteStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Normal nominal baseline pattern
    const baseline = 1050 + Math.sin(i * 0.4) * 80;
    const variation = (Math.sin(i * 1.3) + Math.cos(i * 0.7)) * 40;
    const live = Math.round(baseline + variation);
    const threshold = Math.round(baseline * 1.35); // 35% default tolerance
    
    const modbus = Math.round(live * 0.62);
    const opc = Math.round(live * 0.38);

    points.push({
      timestamp: minuteStr,
      timeSeconds: Math.floor(time.getTime() / 1000),
      liveRpm: live,
      baselineRpm: Math.round(baseline),
      thresholdUpper: threshold,
      modbusRpm: modbus,
      opcRpm: opc,
      rogueRpm: 0,
      isBreached: false
    });
  }

  return points;
}

export const SAMPLE_ALERTS: SecurityAlert[] = [
  {
    id: 'ALT-1094',
    timestamp: '14:28:12',
    severity: 'info',
    title: 'Baseline Statistical Calibration Completed',
    sourceIp: '10.0.0.1 (ShieldBox Engine)',
    targetIp: '10.0.1.0/24 Subnet',
    protocol: 'System / Passive Deep Packet Inspection',
    plainExplanation: 'ShieldBox has verified 24-hour network normality across 7 OT nodes. Normal traffic envelope established at 1,050 RPM ± 35%.',
    impact: 'System is operating in standard operational state. All Purdue Level 1-3 communications validated.',
    recommendedAction: 'No action required. Continuous DPI enforcement active.',
    acknowledged: true,
    resolved: true,
    anomalyType: 'modbus_flood',
    rawPayload: {
      hex: '00 00 00 00 00 06 01 03 9C 41 00 0A',
      decoded: 'Baseline calibration audit packet - normal read holding registers'
    }
  }
];
