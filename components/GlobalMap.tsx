'use client';

import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import Link from "next/link";
import type { SensorResponse } from "@/lib/types";
import L from 'leaflet';

// Fix Leaflet default icon path broken by webpack
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

const createNeonIcon = () => {
  return new L.DivIcon({
    className: "bg-transparent",
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <div class="absolute inset-1 rounded-full bg-cyan-400 shadow-[0_0_15px_#00f3ff] border-2 border-white z-10"></div>
        <div class="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping z-0"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

interface GlobalMapProps {
  sensors: SensorResponse[];
}

export function GlobalMap({ sensors }: GlobalMapProps) {
  const neonIcon = createNeonIcon();

  return (
    <MapContainer
      center={[20, 0]}
      zoom={3}
      minZoom={2}
      className="w-full h-full bg-[#0a0a0f]"
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      {sensors?.map((sensor) => (
        <Marker
          key={sensor.sensorId}
          position={[Number(sensor.latitude), Number(sensor.longitude)]}
          icon={neonIcon}
        >
          <Tooltip direction="top" offset={[0, -12]} opacity={1}>
            <div className="font-display font-bold text-cyan-400 text-sm tracking-widest uppercase">
              {sensor.locationName || sensor.sensorId}
            </div>
          </Tooltip>
          <Popup closeButton={false}>
            <div className="text-center p-1 w-48">
              <h3 className="text-lg font-display text-cyan-400 font-bold mb-1 tracking-widest uppercase">
                {sensor.locationName || "Unknown Sector"}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mb-4 border-b border-cyan-500/20 pb-3">
                NODE ID: {sensor.sensorId}
                <br />
                LAT: {sensor.latitude} | LNG: {sensor.longitude}
              </p>
              <Link
                href={`/sensor/${sensor.sensorId}`}
                className="block w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-500 text-cyan-400 font-display tracking-widest uppercase text-sm rounded transition-all shadow-[inset_0_0_10px_rgba(0,243,255,0.1)] hover:shadow-[0_0_15px_rgba(0,243,255,0.3)]"
              >
                Access Telemetry
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
