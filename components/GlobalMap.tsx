'use client';

import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents } from "react-leaflet";
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

const createPendingIcon = () => {
  return new L.DivIcon({
    className: "bg-transparent",
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute inset-1 rounded-full bg-yellow-400/70 shadow-[0_0_20px_#facc15] border-2 border-yellow-200 z-10"></div>
        <div class="absolute inset-0 rounded-full bg-yellow-400/30 animate-ping z-0"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

interface ClickHandlerProps {
  onMapClick?: (lat: number, lng: number) => void;
}

function MapClickHandler({ onMapClick }: ClickHandlerProps) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

interface GlobalMapProps {
  sensors: SensorResponse[];
  onMapClick?: (lat: number, lng: number) => void;
  pendingLatLng?: { lat: number; lng: number } | null;
}

export function GlobalMap({ sensors, onMapClick, pendingLatLng }: GlobalMapProps) {
  const neonIcon = createNeonIcon();
  const pendingIcon = createPendingIcon();

  return (
    <MapContainer
      center={[20, 0]}
      zoom={3}
      minZoom={2}
      className="w-full h-full bg-[#000000]"
      zoomControl={false}
      style={{ cursor: onMapClick ? 'crosshair' : '' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      <MapClickHandler onMapClick={onMapClick} />
      
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

      {/* Pending marker from map click */}
      {pendingLatLng && (
        <Marker
          position={[pendingLatLng.lat, pendingLatLng.lng]}
          icon={pendingIcon}
        >
          <Tooltip direction="top" offset={[0, -16]} opacity={1} permanent>
            <div className="font-display font-bold text-yellow-400 text-xs tracking-widest uppercase">
              DEPLOY HERE
            </div>
          </Tooltip>
        </Marker>
      )}
    </MapContainer>
  );
}
