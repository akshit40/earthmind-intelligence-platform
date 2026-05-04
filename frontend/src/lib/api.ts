import type { SystemStatus, AnomaliesResponse, MapMarker, CVProcessingResult, ScanHistoryResponse } from "./types";

const BASE_URL = "http://127.0.0.1:8000/api/v1";

export async function getTelemetryStatus(): Promise<SystemStatus> {
  const response = await fetch(`${BASE_URL}/telemetry/status`);
  if (!response.ok) throw new Error("Failed to fetch telemetry status");
  return response.json();
}

export async function getMapMarkers(scanId?: string): Promise<MapMarker[]> {
  const url = scanId ? `${BASE_URL}/telemetry/markers?scan_id=${scanId}` : `${BASE_URL}/telemetry/markers`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch map markers");
  return response.json();
}

export async function getAnomalies(scanId?: string): Promise<AnomaliesResponse> {
  const url = scanId ? `${BASE_URL}/anomalies?scan_id=${scanId}` : `${BASE_URL}/anomalies`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch anomalies");
  return response.json();
}

export async function getScanHistory(): Promise<ScanHistoryResponse> {
  const response = await fetch(`${BASE_URL}/history`);
  if (!response.ok) throw new Error("Failed to fetch scan history");
  return response.json();
}

export function getTelemetryWebSocket(): WebSocket {
  return new WebSocket("ws://127.0.0.1:8000/ws/telemetry");
}

export async function processImagery(formData: FormData): Promise<CVProcessingResult> {
  const response = await fetch(`${BASE_URL}/cv/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to process imagery");
  return response.json();
}
