"use client";

import { Activity, ShieldAlert, Globe, Server, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import type { SystemStatus, ScanHistory, Anomaly } from "@/lib/types";

interface ExecutiveViewProps {
  status: SystemStatus | null;
  scanHistory: ScanHistory[];
  recentAnomalies: Anomaly[];
}

export function ExecutiveView({ status, scanHistory, recentAnomalies }: ExecutiveViewProps) {
  // Aggregate data for charts
  const historyData = [...scanHistory].reverse().map(scan => ({
    time: new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    anomalies: scan.anomaly_count
  }));

  const criticalCount = recentAnomalies.filter(a => a.severity === "CRITICAL").length;
  const moderateCount = recentAnomalies.filter(a => a.severity === "MODERATE").length;

  const severityData = [
    { name: "Critical", value: criticalCount, color: "var(--destructive)" },
    { name: "Moderate", value: moderateCount, color: "var(--warning)" }
  ];

  return (
    <div className="h-full flex flex-col gap-6 overflow-auto pr-2">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="elite-card elite-card-accent-blue p-6 shadow-sm flex flex-col relative overflow-hidden animate-entry-1 glow-blue">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-tactical">System Health</h3>
            {status?.status === 'online' ? <CheckCircle2 className="h-4 w-4 text-success neon-pulse" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
          </div>
          <div className="flex items-end gap-2 relative z-10">
            <span className="text-4xl font-bold text-foreground font-tactical tracking-tighter">
              {status?.status === 'online' ? '100%' : 'OFFLINE'}
            </span>
          </div>
          <p className="text-[10px] font-tactical text-muted-foreground mt-2 uppercase">LATENCY: {status?.latency || '---'} | UPTIME: {status?.uptime || '---'}</p>
        </div>

        <div className="elite-card elite-card-accent-blue p-6 shadow-sm flex flex-col relative overflow-hidden animate-entry-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-tactical">Active Assets</h3>
            <Globe className="h-4 w-4 text-foreground/80" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-foreground font-tactical tracking-tighter">{status?.active_satellites || 0}</span>
            <span className="text-[10px] font-bold text-success mb-1 flex items-center font-tactical"><TrendingUp className="h-3 w-3 mr-1" /> ONLINE</span>
          </div>
          <p className="text-[10px] font-tactical text-muted-foreground mt-2 uppercase tracking-widest text-foreground/50">Global Coverage Active</p>
        </div>

        <div className="elite-card elite-card-accent-blue p-6 shadow-sm flex flex-col relative overflow-hidden animate-entry-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-tactical">24h Detections</h3>
            <ShieldAlert className="h-4 w-4 text-foreground/80" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-foreground font-tactical tracking-tighter">{status?.anomalies_detected_24h || 0}</span>
          </div>
          <p className="text-[10px] font-tactical text-muted-foreground mt-2 uppercase tracking-widest text-foreground/50">Total Intelligence Hits</p>
        </div>

        <div className="elite-card elite-card-accent-red p-6 shadow-sm flex flex-col relative overflow-hidden animate-entry-4 glow-red">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-tactical text-destructive/80">Critical Alerts</h3>
            <Activity className="h-4 w-4 text-destructive neon-pulse" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-destructive font-tactical tracking-tighter">{criticalCount}</span>
          </div>
          <p className="text-[10px] font-tactical text-destructive/60 mt-2 uppercase tracking-widest status-critical">Requires Immediate Action</p>
        </div>
      </div>

      {/* Middle Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[350px]">
        {/* Detection Trend Chart */}
        <div className="lg:col-span-2 elite-card p-6 shadow-sm flex flex-col relative overflow-hidden animate-entry-5">
          <h3 className="text-[10px] font-bold mb-6 uppercase tracking-[0.2em] text-muted-foreground font-tactical flex items-center gap-2">
            <Activity className="h-3 w-3 text-foreground/70" />
            Anomaly Detection Timeline
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAnomalies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} fontStyle="italic" />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} allowDecimals={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', backdropFilter: 'blur(8px)' }}
                />
                <Area type="monotone" dataKey="anomalies" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorAnomalies)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="elite-card p-6 shadow-sm flex flex-col relative overflow-hidden animate-entry-5" style={{ animationDelay: '400ms' }}>
          <h3 className="text-[10px] font-bold mb-6 uppercase tracking-[0.2em] text-muted-foreground font-tactical flex items-center gap-2">
            <ShieldAlert className="h-3 w-3 text-foreground/70" />
            Current Threat Level
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} fontStyle="italic" />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} allowDecimals={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', backdropFilter: 'blur(8px)' }}
                  cursor={{fill: 'rgba(255, 255, 255, 0.03)'}}
                />
                <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={40}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Strategic Summary */}
      <div className="elite-card elite-card-accent-green p-6 shadow-sm relative overflow-hidden animate-entry-5" style={{ animationDelay: '500ms' }}>
         <h3 className="text-[10px] font-bold mb-4 uppercase tracking-[0.2em] text-muted-foreground font-tactical flex items-center gap-2">
            <Server className="h-3 w-3 text-success" />
            Strategic Operations Summary
         </h3>
         <div className="text-[11px] text-foreground leading-relaxed bg-white/5 p-4 rounded-lg border border-white/10 font-tactical">
            <span className="text-foreground/70 font-bold mr-2">AUTO-SITREP // STATUS: NOMINAL //</span> 
            System is operating at peak intelligence capacity. EarthMind CV engines are processing multi-spectral optical and SAR streams. Sentinel-2 L1C integration confirmed active. 
            <span className="text-success/80 ml-2">DATA ARCHIVE SYNC SUCCESSFUL.</span>
         </div>
      </div>
    </div>

  );
}
