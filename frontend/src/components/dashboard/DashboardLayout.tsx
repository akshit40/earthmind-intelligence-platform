"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Activity, Globe, Map as MapIcon, Database, Settings, ShieldAlert } from "lucide-react";
import { MapWrapper } from "@/components/map/MapWrapper";
import { TelemetryCharts } from "./TelemetryCharts";
import { ImageryUpload } from "./ImageryUpload";
import { ExecutiveView } from "./ExecutiveView";
import { getTelemetryStatus, getTelemetryWebSocket, getAnomalies, getScanHistory } from "@/lib/api";
import type { SystemStatus, SatelliteTelemetry, Anomaly, WebSocketMessage, ScanHistory } from "@/lib/types";

// WebSocket reconnection config
const WS_RECONNECT_DELAY_MS = 3000;
const WS_MAX_RECONNECT_ATTEMPTS = 10;

export function DashboardLayout() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [liveSatellite, setLiveSatellite] = useState<SatelliteTelemetry | null>(null);
  const [currentView, setCurrentView] = useState<"executive" | "map" | "telemetry" | "anomalies" | "upload">("executive");
  const [anomaliesData, setAnomaliesData] = useState<Anomaly[]>([]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isLoadingAnomalies, setIsLoadingAnomalies] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [targetCoordinate, setTargetCoordinate] = useState<[number, number] | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

  // Refs for WebSocket reconnection
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connectWebSocket = useCallback(function connectWebSocket() {
    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const ws = getTelemetryWebSocket();
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Connected to telemetry stream");
      setWsConnected(true);
      reconnectAttemptsRef.current = 0; // Reset reconnect counter on success
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        if (data.type === "telemetry") {
          setLiveSatellite(data as SatelliteTelemetry);
        } else if (data.type === "ai_report") {
          setAiReport(data.report);
          
          if (data.anomalies) {
            setAnomaliesData(data.anomalies);
            
            // Check for critical anomalies to trigger alerts
            const criticalAnomalies = data.anomalies.filter(a => a.severity === "CRITICAL");
            if (criticalAnomalies.length > 0) {
              // 1. Play Red Alert Sound
              try {
                // @ts-expect-error - webkitAudioContext is not in standard Window interface
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                  const ctx = new AudioContext();
                  const osc = ctx.createOscillator();
                  const gainNode = ctx.createGain();
                  
                  osc.type = 'square';
                  osc.frequency.setValueAtTime(800, ctx.currentTime);
                  osc.frequency.setValueAtTime(600, ctx.currentTime + 0.2);
                  
                  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
                  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                  
                  osc.connect(gainNode);
                  gainNode.connect(ctx.destination);
                  
                  osc.start();
                  osc.stop(ctx.currentTime + 0.4);
                }
              } catch (e) {
                console.warn("Audio play failed", e);
              }
              
              // 2. Trigger Browser Notification
              if ("Notification" in window && Notification.permission === "granted") {
                const latest = criticalAnomalies[0];
                new Notification("CRITICAL ANOMALY DETECTED", {
                  body: `Type: ${latest.type} at ${latest.lat.toFixed(4)}, ${latest.lng.toFixed(4)}`,
                  icon: "/favicon.ico"
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("[WS] Failed to parse message", error);
      }
    };

    ws.onerror = (event) => {
      console.error("[WS] Connection error", event);
    };

    ws.onclose = (event) => {
      console.warn(`[WS] Connection closed (code: ${event.code}). Attempting reconnect...`);
      setWsConnected(false);
      wsRef.current = null;

      // Auto-reconnect with exponential backoff
      if (reconnectAttemptsRef.current < WS_MAX_RECONNECT_ATTEMPTS) {
        const delay = WS_RECONNECT_DELAY_MS * Math.pow(1.5, reconnectAttemptsRef.current);
        reconnectAttemptsRef.current += 1;
        reconnectTimerRef.current = setTimeout(connectWebSocket, delay);
      } else {
        console.error("[WS] Max reconnect attempts reached. Please refresh the page.");
      }
    };
  }, []);

  useEffect(() => {
    // Request notification permissions for red alerts
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    const fetchStatus = async () => {
      try {
        const data = await getTelemetryStatus();
        setStatus(data);
      } catch (error) {
        console.error("Status fetch failed", error);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    
    const fetchHistory = async () => {
      try {
        const data = await getScanHistory();
        setScanHistory(data.history);
      } catch (error) {
        console.error("History fetch failed", error);
      }
    };
    fetchHistory();
    const historyInterval = setInterval(fetchHistory, 15000);

    // Establish WebSocket connection with reconnection logic
    connectWebSocket();

    return () => {
      clearInterval(interval);
      clearInterval(historyInterval);
      // Cleanup WebSocket and reconnect timer
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    if (currentView === "anomalies" && anomaliesData.length === 0) {
      const fetchAnomalies = async () => {
        setIsLoadingAnomalies(true);
        try {
          const data = await getAnomalies();
          setAnomaliesData(data.anomalies);
          setAiReport(data.ai_report);
        } catch (error) {
          console.error("Failed to fetch anomalies", error);
        } finally {
          setIsLoadingAnomalies(false);
        }
      };
      fetchAnomalies();
    }
  }, [currentView, anomaliesData.length]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar className="border-r border-white/8 bg-[#050505]">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-3 font-bold text-lg tracking-[0.2em] text-primary font-tactical">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <Globe className="h-5 w-5 neon-pulse" />
              </div>
              <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">EARTHMIND</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-bold font-tactical uppercase tracking-[0.3em] text-muted-foreground/50 mb-2 px-4">Tactical Intelligence</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={currentView === "executive"} 
                      onClick={() => setCurrentView("executive")}
                      className="font-tactical text-[11px] uppercase tracking-widest h-11 transition-all hover:bg-white/5 hover:text-primary active:scale-[0.98]"
                    >
                      <Activity className="h-4 w-4" />
                      <span>Executive Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={currentView === "map"} 
                      onClick={() => setCurrentView("map")}
                      className="font-tactical text-[11px] uppercase tracking-widest h-11 transition-all hover:bg-white/5 hover:text-primary active:scale-[0.98]"
                    >
                      <MapIcon className="h-4 w-4" />
                      <span>Global Operations</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={currentView === "telemetry"} 
                      onClick={() => setCurrentView("telemetry")}
                      className="font-tactical text-[11px] uppercase tracking-widest h-11 transition-all hover:bg-white/5 hover:text-primary active:scale-[0.98]"
                    >
                      <Activity className="h-4 w-4" />
                      <span>Live Telemetry</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={currentView === "anomalies"} 
                      onClick={() => setCurrentView("anomalies")}
                      className="font-tactical text-[11px] uppercase tracking-widest h-11 transition-all hover:bg-white/5 hover:text-primary active:scale-[0.98]"
                    >
                      <ShieldAlert className="h-4 w-4" />
                      <span>Anomalies Feed</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={currentView === "upload"} 
                      onClick={() => setCurrentView("upload")}
                      className="font-tactical text-[11px] uppercase tracking-widest h-11 transition-all hover:bg-white/5 hover:text-primary active:scale-[0.98]"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Neural Analysis</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="text-[10px] font-bold font-tactical uppercase tracking-[0.3em] text-muted-foreground/50 mb-2 px-4">System Core</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="font-tactical text-[11px] uppercase tracking-widest h-11 opacity-60 hover:opacity-100">
                      <Database className="h-4 w-4" />
                      <span>Intelligence Archive</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="font-tactical text-[11px] uppercase tracking-widest h-11 opacity-60 hover:opacity-100">
                      <Settings className="h-4 w-4" />
                      <span>Core Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>


        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Elite Scanning Line Overlay */}
          <div className="absolute inset-0 pointer-events-none scan-line-overlay opacity-10 z-50"></div>

          <header className="h-16 flex items-center px-8 elite-header z-20 shrink-0">
            <h1 className="text-xs font-bold tracking-[0.3em] uppercase font-tactical text-foreground/80">
              {currentView === "executive" && "// Command Center // Strategic Dashboard"}
              {currentView === "map" && "// Global Operations // Satellite Feed"}
              {currentView === "telemetry" && "// Real-Time Telemetry // Signal Stream"}
              {currentView === "anomalies" && "// Intelligence // Anomaly Reports"}
              {currentView === "upload" && "// Custom Imagery // Neural Analysis"}
            </h1>
            <div className="ml-auto flex items-center gap-6">
              {/* WebSocket connection indicator */}
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-tactical">
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${wsConnected ? 'bg-success' : 'bg-warning'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${wsConnected ? 'bg-success' : 'bg-warning'}`}></span>
                </span>
                <span className="uppercase tracking-widest">{wsConnected ? 'Data Link: Active' : 'Link: Lost'}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-tactical border-l border-white/10 pl-6">
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status?.status === 'online' ? 'bg-success' : 'bg-destructive'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${status?.status === 'online' ? 'bg-success' : 'bg-destructive'}`}></span>
                </span>
                <span className="uppercase tracking-widest">{status?.status === 'online' ? 'System Online' : 'System Offline'}</span>
              </div>
            </div>
          </header>
          
          <div className="flex-1 p-8 overflow-auto relative z-10">
            {currentView === "executive" && (
              <ExecutiveView status={status} scanHistory={scanHistory} recentAnomalies={anomaliesData} />
            )}

            {currentView === "map" && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full animate-entry-1">
                <div className="lg:col-span-3 flex flex-col gap-6">
                  <div className="flex-1 elite-card overflow-hidden relative min-h-[400px] border-white/10">
                    <div className="absolute top-6 left-6 z-10 bg-black/60 backdrop-blur-md border border-white/20 rounded-md px-4 py-2 text-[10px] font-tactical text-foreground uppercase tracking-[0.2em] shadow-lg">
                      {liveSatellite 
                        ? `COORD: ${liveSatellite.lat.toFixed(6)}° ${liveSatellite.lat >= 0 ? 'N' : 'S'}, ${liveSatellite.lng.toFixed(6)}° ${liveSatellite.lng >= 0 ? 'E' : 'W'}` 
                        : 'COORD: ACQUIRING SIGNAL...'}
                    </div>
                    <MapWrapper liveSatellite={liveSatellite} targetCoordinate={targetCoordinate} scanId={selectedScanId} />
                  </div>
                  
                  {/* Temporal UI Slider */}
                  <div className="elite-card p-6 shadow-sm flex flex-col gap-4 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-white rounded-full neon-pulse" />
                        <h3 className="font-bold text-[10px] font-tactical uppercase tracking-[0.2em]">Temporal Intelligence Archive</h3>
                      </div>
                      <span className="text-[10px] text-foreground/70 font-tactical border border-white/10 px-3 py-1 rounded bg-white/5">
                        {selectedScanId 
                          ? new Date(scanHistory.find(s => s.id === selectedScanId)?.timestamp || "").toLocaleString() 
                          : "LIVE TELEMETRY STREAM"}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-[10px] text-muted-foreground font-tactical uppercase tracking-widest">Archive</span>
                      <input 
                        type="range" 
                        min="0" 
                        max={scanHistory.length} 
                        value={selectedScanId ? scanHistory.length - 1 - scanHistory.findIndex(s => s.id === selectedScanId) : scanHistory.length}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val === scanHistory.length) {
                            setSelectedScanId(null);
                          } else {
                            const reversedIndex = scanHistory.length - 1 - val;
                            setSelectedScanId(scanHistory[reversedIndex]?.id || null);
                          }
                        }}
                        className="flex-1" 
                      />
                      <span className="text-[10px] text-foreground font-bold font-tactical uppercase tracking-widest neon-pulse">Live</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-8 animate-entry-2">
                  <div className="elite-card elite-card-accent-blue p-6 shadow-sm">
                    <h3 className="font-bold text-[10px] font-tactical uppercase tracking-[0.2em] mb-6 flex items-center gap-2 text-foreground/80">
                      <Globe className="h-3 w-3" />
                      Active Operations
                    </h3>
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-4 group">
                          <div className="h-1 w-4 mt-2 rounded-full bg-white/20 group-hover:bg-white transition-colors" />
                          <div>
                            <p className="text-[11px] font-bold font-tactical uppercase text-foreground/90 tracking-wider">Sat-Scan Alpha {i}</p>
                            <p className="text-[10px] text-muted-foreground font-tactical mt-1">Multi-band spectral analysis active...</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="elite-card p-6 shadow-sm flex-1">
                    <h3 className="font-bold text-[10px] font-tactical uppercase tracking-[0.2em] mb-6 flex items-center gap-2 text-muted-foreground">
                      <Activity className="h-3 w-3" />
                      System Status
                    </h3>
                    <div className="space-y-5">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <span className="text-[10px] font-tactical text-muted-foreground uppercase tracking-widest">Network Uptime</span>
                        <span className="text-[11px] font-tactical text-success font-bold">{status?.uptime || "---"}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <span className="text-[10px] font-tactical text-muted-foreground uppercase tracking-widest">Latency</span>
                        <span className="text-[11px] font-tactical text-warning font-bold">{status?.latency || "---"}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <span className="text-[10px] font-tactical text-muted-foreground uppercase tracking-widest">Active Assets</span>
                        <span className="text-[11px] font-tactical text-foreground font-bold">{status?.active_satellites || "---"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-tactical text-muted-foreground uppercase tracking-widest text-destructive/80">Anomalies (24h)</span>
                        <span className="text-[11px] font-tactical text-destructive font-bold">{status?.anomalies_detected_24h || "0"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {currentView === "telemetry" && (
              <div className="h-full flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="elite-card p-6 shadow-sm flex flex-col">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-tactical mb-2">Live Altitude</p>
                    <p className="text-3xl font-bold font-tactical text-foreground">
                      {liveSatellite ? `${liveSatellite.altitude.toFixed(2)} km` : "---"}
                    </p>
                  </div>
                  <div className="elite-card p-6 shadow-sm flex flex-col">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-tactical mb-2">Orbital Velocity</p>
                    <p className="text-3xl font-bold font-tactical text-success">
                      {liveSatellite ? "7.67 km/s" : "---"}
                    </p>
                  </div>
                  <div className="elite-card p-6 shadow-sm flex flex-col">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-tactical mb-2">Data Rate</p>
                    <p className="text-3xl font-bold font-tactical text-warning">
                      {liveSatellite ? "1.2 Gbps" : "---"}
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 min-h-0 overflow-auto">
                  <TelemetryCharts liveData={liveSatellite} />
                </div>

                <div className="elite-card p-4 flex items-center justify-center text-center gap-4">
                  <Activity className="h-4 w-4 text-foreground animate-pulse" />
                  <p className="text-muted-foreground text-[10px] font-tactical uppercase tracking-[0.2em]">
                    WebSocket Stream: {wsConnected ? 'Active' : 'Reconnecting...'} | Decoding Signal SAT-01...
                  </p>
                </div>
              </div>
            )}

            {currentView === "anomalies" && (
              <div className="h-full flex flex-col gap-6">
                
                {/* AI Intelligence Report */}
                <div className="elite-card p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-foreground/20" />
                  <h3 className="text-[10px] font-bold mb-4 uppercase tracking-[0.2em] text-foreground/80 font-tactical flex items-center gap-2">
                    <Activity className="h-4 w-4 text-foreground" />
                    AI SITREP // INTELLIGENCE ANALYSIS
                  </h3>
                  {isLoadingAnomalies ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-white/5 rounded w-3/4"></div>
                      <div className="h-4 bg-white/5 rounded w-1/2"></div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-tactical">
                      {aiReport || "Awaiting intelligence report generation..."}
                    </p>
                  )}
                </div>

                <div className="elite-card overflow-hidden">
                  <table className="w-full text-left text-[11px] font-tactical intel-table">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground">Type</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground">Coordinates</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground">Severity</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {isLoadingAnomalies ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground uppercase tracking-widest">
                            Scanning sectors...
                          </td>
                        </tr>
                      ) : anomaliesData.map((anomaly, idx) => (
                        <tr 
                          key={anomaly.id || idx}
                          className="cursor-pointer transition-colors"
                          onClick={() => {
                            setTargetCoordinate([anomaly.lat, anomaly.lng]);
                            setCurrentView("map");
                          }}
                        >
                          <td className="px-6 py-4 font-bold flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${anomaly.severity === 'CRITICAL' ? 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-warning'}`} />
                            {anomaly.type}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {anomaly.lat.toFixed(4)}, {anomaly.lng.toFixed(4)}
                          </td>
                          <td className={`px-6 py-4 font-bold ${anomaly.severity === 'CRITICAL' ? 'text-destructive' : 'text-warning'}`}>
                            {anomaly.severity}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${anomaly.severity === 'CRITICAL' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                              {anomaly.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {currentView === "upload" && (
              <div className="h-full flex flex-col gap-6">
                <ImageryUpload />
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
