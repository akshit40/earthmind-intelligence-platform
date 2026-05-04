"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, CircleMarker, useMap, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getMapMarkers } from "@/lib/api";
import type { SatelliteTelemetry, MapMarker } from "@/lib/types";

// Fix Leaflet marker icons issue in Next.js
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

function MapController({ targetCoordinate }: { targetCoordinate?: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (targetCoordinate) {
      map.flyTo(targetCoordinate, 14, {
        duration: 1.5,
      });
    }
  }, [targetCoordinate, map]);
  return null;
}

function InteractiveMarker({ m }: { m: MapMarker }) {
  const map = useMap();
  return (
    <Marker 
      position={[m.lat, m.lng]}
      eventHandlers={{
        click: () => {
          map.flyTo([m.lat, m.lng], 14, { duration: 1.5 });
        }
      }}
    >
      <Popup className="elite-popup">
        <div className="text-[10px] font-tactical uppercase tracking-widest">
          <p className="font-bold text-foreground">{m.label}</p>
          <p className="text-muted-foreground mt-1">{m.type}</p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function EarthMap({ 
  liveSatellite, 
  targetCoordinate,
  scanId
}: { 
  liveSatellite?: SatelliteTelemetry | null,
  targetCoordinate?: [number, number] | null,
  scanId?: string | null
}) {
  const [mounted, setMounted] = useState(false);
  const [markers, setMarkers] = useState<MapMarker[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // @ts-expect-error - Fix Leaflet marker icons issue in Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });
  }, []);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const data = await getMapMarkers(scanId || undefined);
        setMarkers(data);
      } catch (error) {
        console.error("Marker fetch failed", error);
      }
    };
    fetchMarkers();
  }, [scanId]);

  if (!mounted) {
    return <div className="h-full w-full bg-black/40 animate-pulse rounded-lg border border-white/10"></div>;
  }

  return (
    <MapContainer
      center={[20, 0]}
      zoom={3}
      zoomControl={false}
      className="h-full w-full rounded-lg border border-white/10"
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Optical (Visible)">
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Infrared (Thermal View)">
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            className="hue-rotate-180 invert saturate-200"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="SAR (Synthetic Aperture Radar)">
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            className="grayscale contrast-125 invert"
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      
      <MapController targetCoordinate={targetCoordinate} />
      
      {markers.map((m) => (
        <InteractiveMarker key={m.id} m={m} />
      ))}

      {/* Live Satellite Marker */}
      {liveSatellite && (
        <CircleMarker
          center={[liveSatellite.lat, liveSatellite.lng]}
          radius={8}
          pathOptions={{ color: '#ffffff', fillColor: '#ffffff', fillOpacity: 0.7 }}
        >
          <Popup className="elite-popup">
            <div className="text-[10px] font-tactical uppercase tracking-widest">
              <p className="font-bold text-foreground">LIVE TELEMETRY</p>
              <p className="text-muted-foreground mt-1">ID: {liveSatellite.id}</p>
              <p className="text-muted-foreground mt-1">ALT: {liveSatellite.altitude.toFixed(2)} KM</p>
              <p className="text-muted-foreground mt-1">COORD: {liveSatellite.lat.toFixed(4)}, {liveSatellite.lng.toFixed(4)}</p>
            </div>
          </Popup>
        </CircleMarker>
      )}

      <ZoomControl position="bottomright" />
    </MapContainer>
  );
}
