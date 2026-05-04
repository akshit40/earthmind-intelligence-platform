// ============================================================================
// EarthMind TypeScript Interfaces
// Shared type definitions for the entire frontend
// ============================================================================

/** System status returned by /api/v1/telemetry/status */
export interface SystemStatus {
  status: "online" | "offline";
  uptime: string;
  latency: string;
  active_satellites: number;
  anomalies_detected_24h: number;
}

/** Live satellite telemetry from WebSocket */
export interface SatelliteTelemetry {
  type: "telemetry";
  id: string;
  lat: number;
  lng: number;
  altitude: number;
  timestamp: number;
}

/** AI report broadcast from WebSocket */
export interface AIReportMessage {
  type: "ai_report";
  report: string;
  anomalies?: Anomaly[];
}

/** Union type for all WebSocket messages */
export type WebSocketMessage = SatelliteTelemetry | AIReportMessage;

/** Anomaly detected by the CV engine */
export interface Anomaly {
  id: string;
  type: string;
  lat: number;
  lng: number;
  severity: "CRITICAL" | "MODERATE";
  status: string;
}

/** Response from /api/v1/anomalies */
export interface AnomaliesResponse {
  anomalies: Anomaly[];
  ai_report: string | null;
}

/** Map marker from /api/v1/telemetry/markers */
export interface MapMarker {
  id: number | string;
  lat: number;
  lng: number;
  type: "station" | "anomaly";
  label: string;
}

/** CV processing result from /api/v1/cv/upload */
export interface CVProcessingResult {
  filename: string;
  result: {
    status: string;
    anomalies_detected: number;
    dl_feature_magnitude: number;
    anomalies: Anomaly[];
  };
}

/** Telemetry chart data point */
export interface TelemetryDataPoint {
  timestamp: number;
  altitude: number;
  velocity: number;
  signal: number;
}

/** Scan History item */
export interface ScanHistory {
  id: string;
  timestamp: string;
  source: string;
  image_path?: string;
  anomaly_count: number;
}

/** Response from /api/v1/history */
export interface ScanHistoryResponse {
  history: ScanHistory[];
}
