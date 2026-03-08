'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { SensorWithLatestReading } from '@/lib/types';

// Dynamically import map to avoid SSR issues
const MapView = dynamic(() => import('./MapView'), { ssr: false });

export default function SensorMap() {
  const [sensors, setSensors] = useState<SensorWithLatestReading[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<SensorWithLatestReading | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSensors();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchSensors, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchSensors = async () => {
    try {
      const response = await fetch('/api/sensors');
      const data = await response.json();
      setSensors(data);
    } catch (error) {
      console.error('Error fetching sensors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sensors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Water Quality Monitoring</h1>
            <p className="text-sm text-gray-500 mt-1">
              {sensors.length} active sensor{sensors.length !== 1 ? 's' : ''} worldwide
            </p>
          </div>
          <button
            onClick={fetchSensors}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </header>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapView 
          sensors={sensors} 
          selectedSensor={selectedSensor}
          onSelectSensor={setSelectedSensor}
        />
      </div>
    </div>
  );
}
