import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip 
} from "recharts";
import { format } from "date-fns";
import type { ParsedReading } from "@/hooks/use-readings";

interface TelemetryChartProps {
  data: ParsedReading[];
  dataKey: "ph" | "turbidity" | "temperature" | "hardness";
  color: string;
  title: string;
  unit: string;
}

export function TelemetryChart({ data, dataKey, color, title, unit }: TelemetryChartProps) {
  const gradientId = `color-${dataKey}`;

  return (
    <div className="glass-panel rounded-2xl p-5 hover:border-cyan-500/40 transition-all duration-300 group">
      <div className="flex justify-between items-end mb-6">
        <h3 className="font-display text-lg tracking-widest text-slate-300 group-hover:text-cyan-400 transition-colors uppercase">
          {title}
        </h3>
        <span className="text-xs font-mono text-slate-500">{unit}</span>
      </div>
      
      <div className="h-[260px] w-full">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-sm border border-dashed border-slate-800 rounded-lg">
            AWAITING TELEMETRY DATA...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(t) => format(new Date(t), "HH:mm")}
                stroke="#4b5563"
                tick={{ fontSize: 11, fill: "#6b7280", fontFamily: "monospace" }}
                tickMargin={12}
                minTickGap={30}
              />
              <YAxis
                stroke="#4b5563"
                tick={{ fontSize: 11, fill: "#6b7280", fontFamily: "monospace" }}
                tickMargin={12}
                domain={["auto", "auto"]}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "rgba(10, 10, 15, 0.95)",
                  border: `1px solid ${color}`,
                  borderRadius: "0.5rem",
                  boxShadow: `0 0 20px ${color}20`,
                  backdropFilter: "blur(8px)",
                }}
                labelStyle={{ color: "#9ca3af", marginBottom: "8px", fontFamily: "monospace", fontSize: "12px" }}
                itemStyle={{ color: "#fff", fontWeight: "bold", fontFamily: "sans-serif", fontSize: "16px" }}
                labelFormatter={(l) => format(new Date(l), "MMM d, yyyy HH:mm:ss")}
                formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, title]}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                activeDot={{ r: 6, fill: color, stroke: "#fff", strokeWidth: 2, className: "animate-pulse" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
