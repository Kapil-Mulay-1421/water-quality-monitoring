export const api = {
  sensors: {
    list:   { path: '/api/sensors' as const },
    create: { path: '/api/sensors' as const },
    get:    { path: '/api/sensors/:sensorId' as const },
  },
  readings: {
    list:   { path: '/api/readings' as const },
    create: { path: '/api/readings' as const },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}