import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value?: number;
  unit: string;
  icon: LucideIcon;
  status: "optimal" | "warning" | "critical" | "offline";
}

export function KpiCard({ title, value, unit, icon: Icon, status }: KpiCardProps) {
  const statusConfig = {
    optimal: {
      color: "text-green-400",
      border: "border-green-500/30",
      shadow: "shadow-[0_0_20px_rgba(74,222,128,0.05)]",
      indicator: "bg-green-500",
    },
    warning: {
      color: "text-yellow-400",
      border: "border-yellow-500/40",
      shadow: "shadow-[0_0_20px_rgba(250,204,21,0.08)]",
      indicator: "bg-yellow-500",
    },
    critical: {
      color: "text-red-400",
      border: "border-red-500/50",
      shadow: "shadow-[0_0_20px_rgba(248,113,113,0.15)]",
      indicator: "bg-red-500",
    },
    offline: {
      color: "text-slate-500",
      border: "border-slate-800",
      shadow: "shadow-none",
      indicator: "bg-slate-600",
    },
  };

  const activeConfig = statusConfig[status];

  return (
    <div className={`glass-panel rounded-2xl p-6 relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 ${activeConfig.border} ${activeConfig.shadow}`}>
      {/* Background Icon Watermark */}
      <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none">
        <Icon className="w-40 h-40" />
      </div>
      
      <div className="relative z-10">
        <h3 className="text-slate-400 font-display tracking-widest text-sm uppercase mb-4 flex items-center gap-2">
          <Icon className={`w-4 h-4 ${activeConfig.color}`} /> {title}
        </h3>
        
        <div className="flex items-baseline gap-2 mt-2">
          <span className={`text-4xl font-display font-bold ${value !== undefined ? "text-white drop-shadow-md" : "text-slate-600"}`}>
            {value !== undefined ? value.toFixed(2) : "--"}
          </span>
          <span className="text-sm font-mono text-slate-500">{unit}</span>
        </div>
        
        <div className="mt-6 flex items-center gap-2 bg-[#05050A]/50 w-fit px-3 py-1 rounded-md border border-slate-800">
          <div className={`w-2 h-2 rounded-full ${activeConfig.indicator} ${status !== "offline" && "animate-pulse shadow-[0_0_8px_currentColor]"}`}></div>
          <span className={`text-[10px] font-display uppercase tracking-[0.2em] ${activeConfig.color}`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}

// Status Evaluators
export function getPhStatus(val?: number): KpiCardProps["status"] {
  if (val === undefined) return "offline";
  if (val >= 6.5 && val <= 8.5) return "optimal";
  if (val >= 5.0 && val <= 10.0) return "warning";
  return "critical";
}

export function getTurbidityStatus(val?: number): KpiCardProps["status"] {
  if (val === undefined) return "offline";
  if (val <= 5) return "optimal";
  if (val <= 15) return "warning";
  return "critical";
}

export function getTempStatus(val?: number): KpiCardProps["status"] {
  if (val === undefined) return "offline";
  if (val >= 10 && val <= 25) return "optimal";
  if (val >= 0 && val <= 35) return "warning";
  return "critical";
}

export function getHardnessStatus(val?: number): KpiCardProps["status"] {
  if (val === undefined) return "offline";
  if (val >= 60 && val <= 120) return "optimal";
  if (val >= 30 && val <= 180) return "warning";
  return "critical";
}
