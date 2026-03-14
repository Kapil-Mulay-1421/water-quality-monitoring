import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: { sensorId: string } }
) {
  try {
    const sensor = await prisma.sensor.findUnique({
      where: { sensorId: params.sensorId },
    });

    if (!sensor) {
      return NextResponse.json({ error: 'Sensor not found' }, { status: 404 });
    }

    return NextResponse.json(sensor);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sensor' }, { status: 500 });
  }
}