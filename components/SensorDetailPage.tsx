'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SensorWithLatestReading } from '@/lib/types';
import SensorDashboard from './SensorDashboard';

// Dynamically import map to avoid SSR issues
const MiniMap = dynamic(() => import('./MiniMap'), { ssr: false });

interface SensorDetailPageProps {
  sensor: SensorWithLatestReading;
}

export default function SensorDetailPage({ sensor: initialSensor }: SensorDetailPageProps) {
  const [sensor, setSensor] = useState(initialSensor);
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/sensors');
      const sensors = await response.json();
      const updatedSensor = sensors.find((s: any) => s.sensorId === sensor.sensorId);
      if (updatedSensor) {
        setSensor(updatedSensor);
      }
    } catch (error) {
      console.error('Error refreshing sensor data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [sensor.sensorId]);

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
    {/* HEADER */}
    <header className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {sensor.locationName || sensor.sensorId}
            </h1>
            <p className="text-sm text-gray-500">
              Sensor • Installed {new Date(sensor.installedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white shadow hover:bg-blue-700 transition disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>
    </header>

    {/* CONTENT */}
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT PANEL */}
        <div className="space-y-8">

          {/* CURRENT METRICS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-6 text-gray-900">
              Current Water Quality
            </h2>

            {sensor.latestReading ? (
              <div className="grid grid-cols-2 gap-4">
                <ReadingCard label="pH" value={sensor.latestReading.ph.toFixed(2)} unit="" icon="💧" color="text-purple-600"/>
                <ReadingCard label="Turbidity" value={sensor.latestReading.turbidity.toFixed(2)} unit="NTU" icon="🌫️" color="text-amber-600"/>
                <ReadingCard label="Temperature" value={sensor.latestReading.temperature.toFixed(1)} unit="°C" icon="🌡️" color="text-red-600"/>
                <ReadingCard label="Hardness" value={sensor.latestReading.hardness.toFixed(1)} unit="mg/L" icon="💎" color="text-blue-600"/>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-10">No live readings</p>
            )}
          </div>

          {/* LOCATION */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 pb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Sensor Location
              </h2>

              <div className="flex justify-between text-sm text-gray-600">
                <span>{sensor.latitude.toFixed(5)}</span>
                <span>{sensor.longitude.toFixed(5)}</span>
              </div>
            </div>

            <div className="h-56">
              <MiniMap
                latitude={sensor.latitude}
                longitude={sensor.longitude}
                locationName={sensor.locationName || sensor.sensorId}
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Historical Analytics
            </h2>
          </div>

          <SensorDashboard sensor={sensor} />
        </div>

      </div>
    </main>
  </div>
);
}

function ReadingCard({
  label,
  value,
  unit,
  icon,
  color
}: {
  label: string;
  value: string;
  unit: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <span className="text-xl">{icon}</span>
        <span className={`text-xl font-semibold ${color}`}>
          {value}
          {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
        </span>
      </div>

      <p className="text-xs text-gray-500 mt-3 uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

