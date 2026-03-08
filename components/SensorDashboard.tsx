'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { SensorWithLatestReading, Reading, TimeRange } from '@/lib/types';

interface SensorDashboardProps {
  sensor: SensorWithLatestReading;
}

export default function SensorDashboard({ sensor }: SensorDashboardProps) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('1d');
  const [loading, setLoading] = useState(true);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    fetchReadings();
  }, [sensor.sensorId, timeRange, customStart, customEnd]);

  const fetchReadings = async () => {
    setLoading(true);
    try {
      let url = `/api/readings?sensorId=${sensor.sensorId}&timeRange=${timeRange}`;
      
      if (timeRange === 'custom' && customStart && customEnd) {
        url = `/api/readings?sensorId=${sensor.sensorId}&startDate=${customStart}&endDate=${customEnd}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setReadings(data);
    } catch (error) {
      console.error('Error fetching readings:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeRangeButtons: { value: TimeRange; label: string }[] = [
    { value: '1h', label: 'Last Hour' },
    { value: '1d', label: 'Last Day' },
    { value: '1w', label: 'Last Week' },
    { value: '1m', label: 'Last Month' },
    { value: 'custom', label: 'Custom' },
  ];

  // Prepare chart data
  const chartData = readings.map(reading => ({
    timestamp: format(new Date(reading.timestamp), 'MMM dd HH:mm'),
    pH: reading.pH,
    turbidity: reading.turbidity,
    temperature: reading.temperature,
    hardness: reading.hardness,
  }));

  // Calculate statistics
  const calculateStats = (values: number[]) => {
    if (values.length === 0) return { min: 0, max: 0, avg: 0 };
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    };
  };

  const stats = {
    pH: calculateStats(readings.map(r => r.pH)),
    turbidity: calculateStats(readings.map(r => r.turbidity)),
    temperature: calculateStats(readings.map(r => r.temperature)),
    hardness: calculateStats(readings.map(r => r.hardness)),
  };

  return (
    <div className="p-4 space-y-6">
      {/* Time Range Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
        <div className="flex flex-wrap gap-2">
          {timeRangeButtons.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTimeRange(value)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                timeRange === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        
        {timeRange === 'custom' && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End Date</label>
              <input
                type="datetime-local"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
              />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : readings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No data available for selected time range
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title="pH"
              current={sensor.latestReading?.pH}
              stats={stats.pH}
              unit=""
            />
            <StatCard
              title="Turbidity"
              current={sensor.latestReading?.turbidity}
              stats={stats.turbidity}
              unit="NTU"
            />
            <StatCard
              title="Temperature"
              current={sensor.latestReading?.temperature}
              stats={stats.temperature}
              unit="°C"
            />
            <StatCard
              title="Hardness"
              current={sensor.latestReading?.hardness}
              stats={stats.hardness}
              unit="mg/L"
            />
          </div>

          {/* Charts */}
          <div className="space-y-6">
            <ChartSection
              title="pH Level"
              data={chartData}
              dataKey="pH"
              color="#8b5cf6"
              yDomain={[0, 14]}
            />
            
            <ChartSection
              title="Turbidity (NTU)"
              data={chartData}
              dataKey="turbidity"
              color="#f59e0b"
            />
            
            <ChartSection
              title="Temperature (°C)"
              data={chartData}
              dataKey="temperature"
              color="#ef4444"
            />
            
            <ChartSection
              title="Hardness (mg/L)"
              data={chartData}
              dataKey="hardness"
              color="#3b82f6"
            />
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, current, stats, unit }: any) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="text-xs text-gray-600 mb-1">{title}</div>
      <div className="text-xl font-bold text-gray-900 mb-2">
        {current?.toFixed(2)} {unit}
      </div>
      <div className="text-xs space-y-0.5 text-gray-600">
        <div>Min: {stats.min.toFixed(2)} {unit}</div>
        <div>Max: {stats.max.toFixed(2)} {unit}</div>
        <div>Avg: {stats.avg.toFixed(2)} {unit}</div>
      </div>
    </div>
  );
}

function ChartSection({ title, data, dataKey, color, yDomain }: any) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 11 }}
            stroke="#9ca3af"
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            stroke="#9ca3af"
            domain={yDomain}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
