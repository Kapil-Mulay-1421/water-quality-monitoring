import { notFound } from 'next/navigation';
import SensorDetailPage from '@/components/SensorDetailPage';
import { prisma } from '@/lib/prisma';

// This is a Server Component that fetches initial data directly from the database
async function getSensorData(sensorId: string) {
  try {
    return await prisma.sensor.findUnique({
      where: { sensorId },
    });
  } catch (error) {
    console.error('Error fetching sensor:', error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const sensors = await prisma.sensor.findMany({
      select: { sensorId: true },
    });
    return sensors.map((sensor) => ({
      sensorId: sensor.sensorId,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
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