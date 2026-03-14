import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@/lib/routes";
import type { SensorResponse, InsertSensor } from "@/lib/types";

export function useSensors() {
  return useQuery({
    queryKey: [api.sensors.list.path],
    queryFn: async () => {
      const res = await fetch(api.sensors.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch global sensor grid");
      return (await res.json()) as SensorResponse[];
    },
  });
}

export function useSensor(sensorId: string) {
  return useQuery({
    queryKey: [api.sensors.get.path, sensorId],
    queryFn: async () => {
      const url = buildUrl(api.sensors.get.path, { sensorId });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to connect to sensor node");
      return (await res.json()) as SensorResponse;
    },
    enabled: !!sensorId,
  });
}

export function useCreateSensor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSensor) => {
      const res = await fetch(api.sensors.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to deploy sensor node");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sensors.list.path] });
    },
  });
}
