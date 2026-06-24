'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { SensorWithLatestReading } from '@/lib/types';
import SensorDashboard from './SensorDashboard';
import { ChatBot } from './ChatBot';

// Dynamically import map to avoid SSR issues
const MiniMap = dynamic(() => import('./MiniMap'), { ssr: false });

interface SensorDetailPageProps {
  sensor: SensorWithLatestReading;
}

export default function SensorDetailPage({ sensor: initialSensor }: SensorDetailPageProps) {
  const [sensor, setSensor] = useState(initialSensor);
  const [latestReading, setLatestReading] = useState(initialSensor.latestReading);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchLatestReading = async (sensorId: string) => {
    try {
      const url = new URL('/api/readings', window.location.origin);
      url.searchParams.append('sensorId', sensorId);
      url.searchParams.append('latest', 'true');
      
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch latest reading');
      
      const readings = await response.json();
      console.log("here")
      console.log(readings[0])
      if (readings.length > 0) {
        setLatestReading(readings[0]);
      }
    } catch (error) {
      console.error('Error fetching latest reading:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    console.log('refreshing...');
    try {
      const response = await fetch('/api/sensors');
      const sensors = await response.json();
      console.log(sensors)
      const updatedSensor = sensors.find((s: any) => s.sensorId === sensor.sensorId);
      if (updatedSensor) {
        setSensor({ ...updatedSensor });
        setRefreshKey(prev => prev + 1);
      }
      // Fetch the latest reading from the readings API
      await fetchLatestReading(sensor.sensorId);
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

  // Fetch latest reading on mount
  useEffect(() => {
    fetchLatestReading(sensor.sensorId);
  }, [sensor.sensorId]);

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 overflow-y-auto mb-10">
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
              Sensor • Installed {format(new Date(sensor.installedAt), 'MMM dd, yyyy')}
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

            {latestReading ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <ReadingCard label="pH" value={latestReading.ph.toFixed(2)} unit="" icon="💧" color="text-purple-600"/>
                  <ReadingCard label="Turbidity" value={latestReading.turbidity.toFixed(2)} unit="NTU" icon="🌫️" color="text-amber-600"/>
                  <ReadingCard label="Temperature" value={latestReading.temperature.toFixed(1)} unit="°C" icon="🌡️" color="text-red-600"/>
                  <ReadingCard label="Hardness" value={latestReading.hardness.toFixed(1)} unit="mg/L" icon="💎" color="text-blue-600"/>
                </div>
                
                <PotabilityGauge potability={latestReading.potability} />
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
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Historical Analytics
            </h2>
          </div>

          <div className="max-h-[800px] overflow-y-auto">
            <SensorDashboard key={refreshKey} sensor={sensor} />
          </div>
        </div>

      </div>
    </main>

    {/* ChatBot Bubble */}
    <ChatBot context={latestReading} />
  </div>
);
}

function PotabilityGauge({ potability }: { potability: number | null | undefined }) {
  if (potability === null || potability === undefined) {
    return (
      <div className="rounded-xl p-4 border border-gray-200 bg-gray-50 flex flex-col items-center justify-center h-24 text-center">
        <p className="text-gray-500 font-semibold text-xs tracking-wider uppercase">Awaiting ML Model Inference</p>
      </div>
    );
  }

  const potabilityPercent = potability * 100;
  const radius = 35;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - potability * circumference;
  
  const hue = potability * 120;
  const dynamicColor = `hsl(${hue}, 80%, 45%)`;

  return (
    <div className="rounded-xl p-4 border border-gray-200 bg-gradient-to-br from-white to-gray-50 flex items-center gap-6 shadow-sm">
      <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={dynamicColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color: dynamicColor }}>
            {Math.round(potabilityPercent)}
          </span>
          <span className="text-gray-400 text-[8px] font-bold tracking-widest mt-0.5">SCORE</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
          ML Potability Index
          <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: dynamicColor }} />
        </h3>
        <p className="text-gray-500 text-xs leading-relaxed max-w-sm">
          Real-time confidence score generated by continuous neural network analysis. Color maps from hazardous to pure.
        </p>
      </div>
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

