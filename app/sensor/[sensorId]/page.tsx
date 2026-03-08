import { notFound } from 'next/navigation';
import SensorDetailPage from '@/components/SensorDetailPage';

// This is a Server Component that fetches initial data
async function getSensorData(sensorId: string) {
  try {
    // In production, use full URL. In dev, relative works fine
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/sensors`, {
      cache: 'no-store' // Always get fresh data
    });
    
    if (!response.ok) {
      return null;
    }
    
    const sensors = await response.json();
    return sensors.find((s: any) => s.sensorId === sensorId);
  } catch (error) {
    console.error('Error fetching sensor:', error);
    return null;
  }
}

export default async function SensorPage({ 
  params 
}: { 
  params: { sensorId: string } 
}) {
  const sensor = await getSensorData(params.sensorId);
  
  if (!sensor) {
    notFound();
  }
  
  return <SensorDetailPage sensor={sensor} />;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { sensorId: string } }) {
  const sensor = await getSensorData(params.sensorId);
  
  if (!sensor) {
    return {
      title: 'Sensor Not Found',
    };
  }
  
  return {
    title: `${sensor.locationName || sensor.sensorId} - Water Quality Monitor`,
    description: `View real-time water quality data and historical trends for ${sensor.locationName || sensor.sensorId}`,
  };
}
