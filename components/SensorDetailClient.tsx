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
        {/* Potability Status Gauge */}
        <div className="pt-2">
          <PotabilityGauge potability={latestReading?.potability} />
        </div>

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

function PotabilityGauge({ potability }: { potability: number | null | undefined }) {
  if (potability === null || potability === undefined) {
    return (
      <div className="rounded-2xl p-6 border-2 border-slate-800/50 bg-[#0A0A0F]/50 flex flex-col items-center justify-center h-32">
        <p className="text-slate-500 font-display text-sm tracking-widest uppercase">AWAITING ML MODEL INFERENCE</p>
      </div>
    );
  }

  const potabilityPercent = potability * 100;
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - potability * circumference;
  
  // Smooth color from red (0) to green (120)
  const hue = potability * 120;
  const dynamicColor = `hsl(${hue}, 100%, 50%)`;

  return (
    <div className="rounded-2xl p-6 border border-slate-800 bg-gradient-to-br from-[#0A0A0F] to-[#12121A] flex items-center gap-8 relative overflow-hidden shadow-lg">
      <div 
        className="absolute inset-0 opacity-5 blur-2xl transition-all duration-1000"
        style={{ backgroundColor: dynamicColor }}
      />
      
      <div className="relative flex items-center justify-center w-32 h-32 shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-800/50"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={dynamicColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${dynamicColor}60)`
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span 
            className="font-display text-3xl font-bold tracking-wider"
            style={{ color: dynamicColor, textShadow: `0 0 15px ${dynamicColor}80` }}
          >
            {Math.round(potabilityPercent)}
          </span>
          <span className="text-slate-400 font-mono text-[9px] tracking-[0.2em] mt-1">SCORE</span>
        </div>
      </div>

      <div className="z-10">
        <h3 className="font-display text-xl tracking-[0.2em] uppercase text-white mb-2 flex items-center gap-3">
          ML Potability Index
          <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: dynamicColor, boxShadow: `0 0 10px ${dynamicColor}` }} />
        </h3>
        <p className="text-slate-400 font-mono text-xs leading-relaxed max-w-md">
          Real-time confidence score generated by continuous neural network analysis of combined sensor telemetry. Color continuously maps from hazardous (red) to pure (green).
        </p>
      </div>
    </div>
  );
}
