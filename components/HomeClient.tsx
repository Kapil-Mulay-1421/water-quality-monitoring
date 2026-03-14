'use client';

import { useState, useCallback } from "react";
import { useSensors } from "@/hooks/use-sensors";
import { LoadingScreen } from "@/components/LoadingScreen";
import { CreateSensorDialog } from "@/components/CreateSensorDialog";
import { List, MapPin } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';

const GlobalMap = dynamic(() => import('@/components/GlobalMap').then(m => m.GlobalMap), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#000000]" />
});

export default function HomeClient() {
  const { data: sensors, isLoading } = useSensors();
  const [pendingLatLng, setPendingLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPendingLatLng({ lat, lng });
    setMapDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback((open: boolean) => {
    setMapDialogOpen(open);
    if (!open) {
      setPendingLatLng(null);
    }
  }, []);

  if (isLoading) {
    return <LoadingScreen message="SCANNING GLOBAL GRID..." />;
  }

  return (
    <div className="relative w-full h-full flex flex-col md:flex-row">
      {/* Map Layer - sits underneath the UI layer */}
      <div className="absolute inset-0 z-0">
        <GlobalMap 
          sensors={sensors || []} 
          onMapClick={handleMapClick}
          pendingLatLng={pendingLatLng}
        />
      </div>

      {/* Control Panel Overlay */}
      <div className="relative z-10 w-full md:w-[420px] h-[50vh] md:h-full p-4 md:p-6 pointer-events-none flex flex-col justify-end md:justify-start">
        <div className="glass-panel rounded-2xl p-5 md:p-6 pointer-events-auto flex flex-col h-full shadow-[0_0_40px_rgba(0,0,0,0.8)] border-cyan-500/30 bg-[#05050A]/90">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6 shrink-0 border-b border-cyan-500/20 pb-4">
            <h2 className="text-xl font-display font-bold text-cyan-400 tracking-[0.2em] flex items-center gap-3">
              <List className="h-5 w-5 opacity-70" />
              SENSOR NODES
            </h2>
            <CreateSensorDialog />
          </div>

          {/* Map Click Instructions */}
          <div className="mb-4 shrink-0 flex items-center gap-2 text-[10px] font-mono text-cyan-500/60 bg-cyan-950/20 px-3 py-2 rounded-lg border border-cyan-500/10">
            <MapPin className="h-3 w-3 shrink-0" />
            CLICK MAP TO DEPLOY NODE AT LOCATION
          </div>

          {/* Sensor List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {!sensors || sensors.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 border border-slate-800 border-dashed rounded-xl bg-[#0A0A0F]/50">
                <MapPin className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-mono text-sm tracking-widest">GRID OFFLINE</p>
                <p className="text-xs mt-2 text-slate-600">No nodes detected in current sector. Deploy a new node to initialize grid.</p>
              </div>
            ) : (
              sensors.map((sensor) => (
                <Link 
                  key={sensor.sensorId} 
                  href={`/sensor/${sensor.sensorId}`} 
                  className="block p-4 bg-[#0A0A0F] border border-slate-800 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/0 group-hover:bg-cyan-500 transition-colors" />
                  
                  <div className="font-display font-bold text-slate-200 group-hover:text-cyan-400 text-lg tracking-wider">
                    {sensor.locationName || "Unknown Sector"}
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-[10px] text-slate-500 font-mono tracking-widest">ID: {sensor.sensorId}</div>
                    <div className="text-[10px] text-cyan-500/70 font-mono bg-cyan-950/30 px-2 py-0.5 rounded">
                      ONLINE
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Map-click triggered dialog (controlled externally) */}
      <CreateSensorDialog 
        controlled
        open={mapDialogOpen}
        onOpenChange={handleDialogClose}
        defaultLatitude={pendingLatLng?.lat}
        defaultLongitude={pendingLatLng?.lng}
      />
    </div>
  );
}
