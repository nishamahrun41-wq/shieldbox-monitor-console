export type DeviceType = 'PLC' | 'HMI' | 'Historian' | 'Workstation' | 'Rogue';
export type PurdueLevel = 1 | 2 | 3 | 'Untrusted';
export type DeviceStatus = 'nominal' | 'warning' | 'alert' | 'quarantined';
export type ProtocolType = 'Modbus' | 'OPC-UA' | 'ARP / Scan';

export interface Device {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: DeviceType;
  purdueLevel: PurdueLevel;
  purdueName: string;
  vendor: string;
  model: string;
  firmware: string;
  protocolRole: string;
  status: DeviceStatus;
  currentRpm: number;
  baselineRpm: number;
  x: number;
  y: number;
  lastSeen: string;
  ports: number[];
  processFunction: string;
  registersMonitored?: number;
  isIsolated?: boolean;
}

export interface NetworkLink {
  id: string;
  sourceId: string;
  targetId: string;
  protocol: 'Modbus' | 'OPC-UA' | 'Malicious-Scan';
  activeRpm: number;
  status: 'normal' | 'flooded' | 'anomalous';
  description: string;
}

export interface TrafficPoint {
  timestamp: string;
  timeSeconds: number;
  liveRpm: number;
  baselineRpm: number;
  thresholdUpper: number;
  modbusRpm: number;
  opcRpm: number;
  rogueRpm: number;
  isBreached: boolean;
}

export type AlertSeverity = 'critical' | 'high' | 'warning' | 'info';

export interface RawPayload {
  hex: string;
  functionCode?: string;
  transId?: string;
  unitId?: string;
  registerRange?: string;
  decoded: string;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  title: string;
  sourceIp: string;
  targetIp: string;
  protocol: string;
  plainExplanation: string;
  impact: string;
  recommendedAction: string;
  acknowledged: boolean;
  resolved: boolean;
  anomalyType: 'modbus_flood' | 'rogue_device' | 'opc_untrusted_cert' | 'unauthorized_write' | 'cpu_stop';
  rawPayload: RawPayload;
}

export interface ModbusProfile {
  maxWriteFreqRpm: number;
  baselineDeviationTolerancePct: number;
  maxExceptionRate: number;
  allowedFunctionCodes: { code: string; name: string; allowed: boolean }[];
  enforceMasterWhitelist: boolean;
  whitelistedMasters: string[];
}

export interface OpcProfile {
  maxMonitoredItems: number;
  publishIntervalLimitMs: number;
  maxConcurrentSessions: number;
  securityPolicy: 'Basic256Sha256' | 'None';
  rejectUntrustedCerts: boolean;
}

export interface SimulatorState {
  isRunning: boolean;
  speedMultiplier: number;
  modbusWriteFloodActive: boolean;
  rogueDeviceActive: boolean;
  opcCertAnomalyActive: boolean;
  soundEnabled: boolean;
}
