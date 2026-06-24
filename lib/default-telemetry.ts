import type { ReadingResponse, SensorResponse, TimeRange } from "@/lib/types";

const DEFAULT_SENSORS = [
  {
    sensorId: "SENSOR_NYC_001",
    latitude: 40.7128,
    longitude: -74.006,
    locationName: "New York Hub",
  },
  {
    sensorId: "SENSOR_LON_002",
    latitude: 51.5074,
    longitude: -0.1278,
    locationName: "London Hub",
  },
  {
    sensorId: "SENSOR_TOK_003",
    latitude: 35.6764,
    longitude: 139.65,
    locationName: "Tokyo Hub",
  },
] as const;

const SENSOR_BASELINES: Record<
  string,
  { ph: number; turbidity: number; temperature: number; hardness: number; potability: number }
> = {
  SENSOR_NYC_001: { ph: 7.16, turbidity: 2.85, temperature: 21.4, hardness: 164, potability: 0.92 },
  SENSOR_LON_002: { ph: 7.42, turbidity: 3.35, temperature: 18.7, hardness: 188, potability: 0.84 },
  SENSOR_TOK_003: { ph: 6.94, turbidity: 4.1, temperature: 24.8, hardness: 151, potability: 0.78 },
};

const TIME_RANGE_MS: Record<Exclude<TimeRange, "custom">, number> = {
  "1h": 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "1w": 7 * 24 * 60 * 60 * 1000,
  "1m": 30 * 24 * 60 * 60 * 1000,
};

export function getDefaultSensors(): SensorResponse[] {
  const installedAt = new Date("2026-01-01T00:00:00.000Z");

  return DEFAULT_SENSORS.map((sensor, index) => ({
    id: `default-sensor-${index + 1}`,
    installedAt,
    ...sensor,
  }));
}

export function getDefaultSensor(sensorId: string): SensorResponse | null {
  return getDefaultSensors().find((sensor) => sensor.sensorId === sensorId) ?? null;
}

export function getDefaultReadings(
  sensorId?: string | null,
  timeRange: Exclude<TimeRange, "custom"> = "1d"
): ReadingResponse[] {
  const sensorIds = sensorId ? [sensorId] : DEFAULT_SENSORS.map((sensor) => sensor.sensorId);
  const rangeMs = TIME_RANGE_MS[timeRange] ?? TIME_RANGE_MS["1d"];
  const points = timeRange === "1h" ? 12 : 24;
  const stepMs = rangeMs / points;
  const now = Date.now();

  return sensorIds.flatMap((id) => {
    const baseline = SENSOR_BASELINES[id];
    if (!baseline) return [];

    return Array.from({ length: points }, (_, index) => {
      const wave = Math.sin((index / Math.max(points - 1, 1)) * Math.PI * 2);
      const drift = Math.cos(index * 0.85);
      const timestamp = new Date(now - rangeMs + stepMs * (index + 1));

      return {
        id: `default-reading-${id}-${timeRange}-${index}`,
        sensorId: id,
        timestamp,
        ph: round(baseline.ph + wave * 0.28 + drift * 0.05),
        turbidity: round(baseline.turbidity + drift * 0.55 + wave * 0.2),
        temperature: round(baseline.temperature + wave * 1.4 + drift * 0.3),
        hardness: round(baseline.hardness + wave * 8 + drift * 2),
        potability: round(Math.max(0, Math.min(1, baseline.potability + wave * 0.04 - drift * 0.02))),
      };
    });
  });
}

function round(value: number): number {
  return Number(value.toFixed(2));
}
