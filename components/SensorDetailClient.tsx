'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";

  import { useState } from "react";
import { ChevronLeft, MapPin, Droplets, Wind, Thermometer, Hexagon } from "lucide-react";
import { useSensor } from "@/hooks/use-sensors";
import { useReadings } from "@/hooks/use-readings";
import { LoadingScreen } from "@/components/LoadingScreen";
import { TelemetryChart } from "@/components/TelemetryChart";
import { KpiCard, getPhStatus, getTurbidityStatus, getTempStatus, getHardnessStatus } from "@/components/KpiCard";
import { CreateReadingDialog } from "@/components/CreateReadingDialog";
export default function SensorDetailClient({ sensorId }: { sensorId: string }) {
  const [timeRange, setTimeRange] = useState<"1h" | "1d" | "1w" | "1m">("1d");

  const { data: sensor, isLoading: sensorLoading } = useSensor(sensorId || "");
  const { data: readings, isLoading: readingsLoading } = useReadings(sensorId, timeRange);

  if (sensorLoading) return <LoadingScreen message="ESTABLISHING NODE UPLINK..." />;
  
  if (!sensor) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="neon-border border-red-500 bg-red-950/20 p-8 rounded-2xl max-w-md">
          <h2 className="text-red-400 font-display text-2xl tracking-[0.2em] mb-4">UPLINK FAILED</h2>
          <p className="text-slate-400 font-mono text-sm mb-6">Sensor Node {sensorId} could not be located in the grid database.</p>
          <Link href="/" className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 font-display tracking-widest uppercase transition-colors">
            <ChevronLeft className="h-4 w-4" /> Return to Grid
          </Link>
        </div>
      </div>
    );
  }

  // Ensure chronological order for Recharts
  const sortedReadings = [...(readings || [])].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const latestReading = sortedReadings[sortedReadings.length - 1];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8 relative">
          <div className="absolute bottom-0 left-0 w-1/3 h-[1px] bg-gradient-to-r from-cyan-500 to-transparent"></div>
          
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-400 transition-colors mb-6 font-display uppercase tracking-widest text-xs bg-cyan-950/20 px-3 py-1.5 rounded-full border border-cyan-900/50">
              <ChevronLeft className="h-4 w-4" /> Return to Global Grid
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-widest flex items-center gap-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <MapPin className="text-cyan-400 h-10 w-10 drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]" />
              {sensor.locationName || "Unassigned Sector"}
            </h1>
            
            <div className="flex gap-4 mt-4 font-mono text-xs tracking-widest">
              <span className="text-cyan-500 border border-cyan-500/30 bg-cyan-950/30 px-3 py-1 rounded">ID: {sensor.sensorId}</span>
              <span className="text-slate-400 border border-slate-800 bg-[#0A0A0F] px-3 py-1 rounded">LAT: {sensor.latitude}</span>
              <span className="text-slate-400 border border-slate-800 bg-[#0A0A0F] px-3 py-1 rounded">LNG: {sensor.longitude}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <CreateReadingDialog sensorId={sensor.sensorId} />
          </div>
        </div>

        {/* Real-time KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KpiCard 
            title="pH Level" 
            value={latestReading?.ph} 
            unit="pH" 
            icon={Droplets} 
            status={getPhStatus(latestReading?.ph)} 
          />
          <KpiCard 
            title="Turbidity" 
            value={latestReading?.turbidity} 
            unit="NTU" 
            icon={Wind} 
            status={getTurbidityStatus(latestReading?.turbidity)} 
          />
          <KpiCard 
            title="Temperature" 
            value={latestReading?.temperature} 
            unit="°C" 
            icon={Thermometer} 
            status={getTempStatus(latestReading?.temperature)} 
          />
          <KpiCard 
            title="Hardness" 
            value={latestReading?.hardness} 
            unit="mg/L" 
            icon={Hexagon} 
            status={getHardnessStatus(latestReading?.hardness)} 
          />
        </div>
        {/* Potability Status Banner */}
{latestReading && (
  <div className={`rounded-2xl p-5 border-2 flex items-center gap-4 ${
    latestReading.potability === 1
      ? 'bg-green-950/30 border-green-500/50 shadow-[0_0_20px_rgba(74,222,128,0.1)]'
      : latestReading.potability === 0
      ? 'bg-red-950/30 border-red-500/50 shadow-[0_0_20px_rgba(248,113,113,0.1)]'
      : 'bg-slate-900/50 border-slate-700'
  }`}>
    <div className={`text-3xl ${
      latestReading.potability === 1 ? 'drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : ''
    }`}>
      {latestReading.potability === 1 ? '✅' : latestReading.potability === 0 ? '⛔' : '⏳'}
    </div>
    <div>
      <p className={`font-display text-xl tracking-widest uppercase ${
        latestReading.potability === 1 ? 'text-green-400' 
        : latestReading.potability === 0 ? 'text-red-400' 
        : 'text-slate-500'
      }`}>
        {latestReading.potability === 1 ? 'WATER POTABLE' 
         : latestReading.potability === 0 ? 'NOT POTABLE' 
         : 'POTABILITY UNKNOWN'}
      </p>
      <p className="text-xs text-slate-500 font-mono mt-1">
        ML INFERENCE {latestReading.potability !== null ? '— CLASSIFICATION COMPLETE' : '— AWAITING MODEL'}
      </p>
    </div>
  </div>
)}

        {/* Time Range Selector & Charts */}
        <div className="pt-6">
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-display text-2xl text-slate-200 tracking-[0.2em]">TELEMETRY HISTORY</h2>
            
            <div className="flex bg-[#0A0A0F]/80 backdrop-blur rounded-lg p-1 border border-slate-800 shadow-lg">
              {(["1h", "1d", "1w", "1m"] as const).map((tr) => (
                <button
                  key={tr}
                  onClick={() => setTimeRange(tr)}
                  className={`px-5 py-2 text-xs font-display tracking-widest uppercase rounded transition-all duration-300 ${
                    timeRange === tr 
                      ? "bg-cyan-500/20 text-cyan-400 shadow-[inset_0_0_15px_rgba(0,243,255,0.15)] border border-cyan-500/30" 
                      : "text-slate-500 hover:text-slate-300 border border-transparent"
                  }`}
                >
                  {tr}
                </button>
              ))}
            </div>
          </div>
          
          {readingsLoading ? (
            <div className="h-[600px] rounded-2xl glass-panel flex items-center justify-center">
              <LoadingScreen message="DOWNLOADING TELEMETRY..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TelemetryChart 
                data={sortedReadings} 
                dataKey="ph" 
                color="#00f3ff" 
                title="pH Analysis" 
                unit="pH" 
              />
              <TelemetryChart 
                data={sortedReadings} 
                dataKey="turbidity" 
                color="#00ff66" 
                title="Turbidity Matrix" 
                unit="NTU" 
              />
              <TelemetryChart 
                data={sortedReadings} 
                dataKey="temperature" 
                color="#ff3366" 
                title="Thermal Array" 
                unit="°C" 
              />
              <TelemetryChart 
                data={sortedReadings} 
                dataKey="hardness" 
                color="#bf00ff" 
                title="Hardness Index" 
                unit="mg/L" 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
