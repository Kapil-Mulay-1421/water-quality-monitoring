import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDefaultSensors } from '@/lib/default-telemetry';

export async function GET() {
  try {
    const sensors = await prisma.sensor.findMany({
      orderBy: { installedAt: 'desc' },
    });

    return NextResponse.json(sensors.length > 0 ? sensors : getDefaultSensors());
  } catch {
    return NextResponse.json(getDefaultSensors());
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sensorId, latitude, longitude, locationName } = body;

    if (!sensorId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sensor = await prisma.sensor.create({
      data: {
        sensorId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        locationName: locationName || null,
      },
    });

    return NextResponse.json(sensor, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Sensor ID already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create sensor' }, { status: 500 });
  }
}
