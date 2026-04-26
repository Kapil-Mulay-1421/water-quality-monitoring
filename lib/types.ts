export type Sensor = {
  id: string;
  sensorId: string;
  latitude: number;
  longitude: number;
  locationName: string | null;
  installedAt: Date | string;
};

export type Reading = {
  id: string;
  sensorId: string;
  timestamp: Date | string;
  ph: number;
  turbidity: number;
  temperature: number;
  hardness: number;
  potability: number | null;
};

export type SensorResponse = Sensor;
export type ReadingResponse = Reading;

export type SensorWithLatestReading = Sensor & {
  latestReading?: Reading | null;
};

export type InsertSensor = {
  sensorId: string;
  latitude: number;
  longitude: number;
  locationName?: string;
};

export type InsertReading = {
  sensorId: string;
  ph: number;
  turbidity: number;
  temperature: number;
  hardness: number;
  potability?: number;
};

export type TimeRange = '1h' | '1d' | '1w' | '1m' | 'custom';
