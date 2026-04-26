import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDefaultSensor, getDefaultSensors } from '@/lib/default-telemetry';

export async function generateStaticParams() {
  return getDefaultSensors().map((sensor) => ({
    sensorId: sensor.sensorId,
  }));
}

export async function GET(
  _request: Request,
  { params }: { params: { sensorId: string } }
) {
  try {
    const sensor = await prisma.sensor.findUnique({
      where: { sensorId: params.sensorId },
    });

    const defaultSensor = getDefaultSensor(params.sensorId);
    if (!sensor && !defaultSensor) return NextResponse.json({ error: 'Sensor not found' }, { status: 404 });

    return NextResponse.json(sensor ?? defaultSensor);
  } catch {
    const defaultSensor = getDefaultSensor(params.sensorId);
    if (!defaultSensor) return NextResponse.json({ error: 'Sensor not found' }, { status: 404 });
    return NextResponse.json(defaultSensor);
  }
}
