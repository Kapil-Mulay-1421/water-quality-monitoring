export interface Sensor {
  sensorId: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  installedAt: Date;
}

export interface Reading {
  sensorId: string;
  timestamp: Date;
  pH: number;
  turbidity: number;
  temperature: number;
  hardness: number;
}

export interface SensorWithLatestReading extends Sensor {
  latestReading?: Reading;
}

export type TimeRange = '1h' | '1d' | '1w' | '1m' | 'custom';

export interface ChartDataPoint {
  timestamp: string;
  pH: number;
  turbidity: number;
  temperature: number;
  hardness: number;
}
