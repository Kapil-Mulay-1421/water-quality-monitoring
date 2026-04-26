import SensorDetailClient from '@/components/SensorDetailClient';
import { getDefaultSensor, getDefaultSensors } from '@/lib/default-telemetry';

export function generateStaticParams() {
  return getDefaultSensors().map((sensor) => ({
    sensorId: sensor.sensorId,
  }));
}

export default function SensorPage({
  params,
}: {
  params: { sensorId: string };
}) {
  return <SensorDetailClient sensorId={params.sensorId} />;
}

export function generateMetadata({ params }: { params: { sensorId: string } }) {
  const sensor = getDefaultSensor(params.sensorId);

  if (!sensor) {
    return {
      title: 'Sensor Telemetry',
    };
  }

  return {
    title: `${sensor.locationName || sensor.sensorId} - Water Quality Monitor`,
    description: `View real-time water quality data and historical trends for ${sensor.locationName || sensor.sensorId}`,
  };
}
