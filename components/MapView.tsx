'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { SensorWithLatestReading } from '@/lib/types';
import { useEffect, useState } from 'react';

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon based on water quality
function getMarkerIcon(reading: any) {
  const color = reading ? '#10b981' : '#6b7280'; // Green if has data, gray otherwise
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// Component to handle map events
function MapEvents({ selectedSensor }: { selectedSensor: SensorWithLatestReading | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedSensor) {
      map.flyTo([selectedSensor.latitude, selectedSensor.longitude], 10, {
        duration: 1.5
      });
    }
  }, [selectedSensor, map]);
  
  return null;
}

interface MapViewProps {
  sensors: SensorWithLatestReading[];
  selectedSensor: SensorWithLatestReading | null;
  onSelectSensor: (sensor: SensorWithLatestReading | null) => void;
}

export default function MapView({ sensors, selectedSensor, onSelectSensor }: MapViewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {sensors.map((sensor) => (
          <Marker
            key={sensor.sensorId}
            position={[sensor.latitude, sensor.longitude]}
            icon={getMarkerIcon(sensor.latestReading)}
            eventHandlers={{
              click: () => onSelectSensor(sensor),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-lg mb-2">
                  {sensor.locationName || sensor.sensorId}
                </h3>
                
                {sensor.latestReading ? (
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">pH:</span>
                      <span className="font-medium">{sensor.latestReading.pH.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Turbidity:</span>
                      <span className="font-medium">{sensor.latestReading.turbidity.toFixed(2)} NTU</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperature:</span>
                      <span className="font-medium">{sensor.latestReading.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hardness:</span>
                      <span className="font-medium">{sensor.latestReading.hardness.toFixed(1)} mg/L</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                      Last updated: {new Date(sensor.latestReading.timestamp).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No data available</p>
                )}
                
                <button
                  onClick={() => onSelectSensor(sensor)}
                  className="mt-3 w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  View History
                </button>
                
                <Link
                  href={`/sensor/${sensor.sensorId}`}
                  className="mt-2 block w-full px-3 py-1.5 bg-gray-100 text-gray-700 text-sm text-center rounded hover:bg-gray-200 transition-colors"
                >
                  Open Full Dashboard
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <MapEvents selectedSensor={selectedSensor} />
      </MapContainer>
      
      {/* Dashboard Panel */}
      {selectedSensor && (
        <div className="absolute top-4 right-4 bottom-4 w-96 bg-white rounded-lg shadow-xl z-[1000] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedSensor.locationName || selectedSensor.sensorId}
              </h2>
              <button
                onClick={() => onSelectSensor(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Link
              href={`/sensor/${selectedSensor.sensorId}`}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View full dashboard
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <SensorDashboard sensor={selectedSensor} />
          </div>
        </div>
      )}
    </>
  );
}

// Import dashboard component
import SensorDashboard from './SensorDashboard';
