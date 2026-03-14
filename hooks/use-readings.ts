import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/routes";
import type { ReadingResponse, InsertReading } from "@/lib/types";

// Extended interface with coerced numbers for the frontend components
export interface ParsedReading extends Omit<ReadingResponse, 'ph' | 'turbidity' | 'temperature' | 'hardness'> {
  ph: number;
  turbidity: number;
  temperature: number;
  hardness: number;
}

export function useReadings(sensorId?: string, timeRange: "1h" | "1d" | "1w" | "1m" = "1d") {
  return useQuery({
    queryKey: [api.readings.list.path, sensorId, timeRange],
    queryFn: async () => {
      const url = new URL(api.readings.list.path, window.location.origin);
      if (sensorId) url.searchParams.append("sensorId", sensorId);
      url.searchParams.append("timeRange", timeRange);

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to download telemetry data");
      
      const data = (await res.json()) as ReadingResponse[];
      
      // Coerce numeric strings from DB into numbers for charts
      return data.map((d): ParsedReading => ({
        ...d,
        ph: Number(d.ph),
        turbidity: Number(d.turbidity),
        temperature: Number(d.temperature),
        hardness: Number(d.hardness),
      }));
    },
    enabled: !!sensorId,
  });
}

export function useCreateReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertReading) => {
      const res = await fetch(api.readings.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to transmit reading");
      }
      return await res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate both general readings and specific sensor readings
      queryClient.invalidateQueries({ queryKey: [api.readings.list.path] });
    },
  });
}
