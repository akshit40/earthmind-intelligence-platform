"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import type { SatelliteTelemetry, TelemetryDataPoint } from "@/lib/types";

export function TelemetryCharts({ liveData }: { liveData: SatelliteTelemetry | null }) {
  const [data, setData] = useState<TelemetryDataPoint[]>([]);

  useEffect(() => {
    if (liveData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(prev => {
        const newData = [
          ...prev,
          {
            timestamp: liveData.timestamp,
            altitude: liveData.altitude,
            velocity: 7.67 + (Math.random() * 0.05 - 0.025), // Mock slight variations
            signal: 85 + (Math.random() * 10 - 5),
          }
        ];
        // Keep last 20 points
        if (newData.length > 20) return newData.slice(newData.length - 20);
        return newData;
      });
    }
  }, [liveData]);

  return (
    <div className="grid grid-cols-1 gap-8 w-full h-full pb-6">
      <div className="elite-card elite-card-accent-blue p-8 shadow-sm flex flex-col h-[350px] relative overflow-hidden animate-entry-4">
        <h3 className="text-[10px] font-bold mb-6 uppercase tracking-[0.2em] text-muted-foreground font-tactical flex items-center gap-2">
          <Activity className="h-3 w-3 text-foreground/70" />
          Altitude Profile (km)
        </h3>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorAlt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                hide 
              />
              <YAxis 
                domain={['auto', 'auto']} 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={10} 
                tickFormatter={(val) => val.toFixed(1)}
                fontFamily="IBM Plex Mono"
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', backdropFilter: 'blur(8px)', fontSize: '10px' }}
                labelStyle={{ display: 'none' }}
              />
              <Area 
                type="monotone" 
                dataKey="altitude" 
                stroke="#ffffff" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAlt)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="elite-card elite-card-accent-green p-8 shadow-sm flex flex-col h-[350px] relative overflow-hidden animate-entry-5">
        <h3 className="text-[10px] font-bold mb-6 uppercase tracking-[0.2em] text-muted-foreground font-tactical flex items-center gap-2">
          <Activity className="h-3 w-3 text-success" />
          Signal Strength (dBm)
        </h3>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.05)" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis 
                domain={[70, 100]} 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={10} 
                fontFamily="IBM Plex Mono"
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '8px', backdropFilter: 'blur(8px)', fontSize: '10px' }}
                labelStyle={{ display: 'none' }}
              />
              <Line 
                type="stepAfter" 
                dataKey="signal" 
                stroke="var(--success)" 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

  );
}
