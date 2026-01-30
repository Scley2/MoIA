
export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum SiteStatus {
  UP = 'UP',
  DOWN = 'DOWN',
}

export interface MonitoringPayload {
  site: string;
  environment: string;
  status: SiteStatus;
  downtime_minutes: number;
  average_latency_ms: number;
  failed_checks: number;
  timestamp: string;
}

export interface AnalysisResult {
  severity: IncidentSeverity;
  explanation: string;
  businessImpact: string;
  correctiveActions: string[];
  professionalAlert: string;
  rawMarkdown: string;
}

export interface AlertHistoryItem {
  id: string;
  payload: MonitoringPayload;
  result: AnalysisResult;
  timestamp: Date;
}
