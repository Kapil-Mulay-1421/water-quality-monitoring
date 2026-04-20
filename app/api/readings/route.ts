import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TIME_RANGE_MS: Record<string, number> = {
  '1h': 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
  '1m': 30 * 24 * 60 * 60 * 1000,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sensorId = searchParams.get('sensorId');
    const timeRange = searchParams.get('timeRange') || '1d';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build timestamp filter
    let timestampFilter: any = {};
    if (startDate && endDate) {
      timestampFilter = { gte: new Date(startDate), lte: new Date(endDate) };
    } else {
      const rangeMs = TIME_RANGE_MS[timeRange] ?? TIME_RANGE_MS['1d'];
      timestampFilter = { gte: new Date(Date.now() - rangeMs) };
    }

    const where: any = { timestamp: timestampFilter };
    if (sensorId) where.sensorId = sensorId;

    if (searchParams.get('latest') === 'true') {
      const latestReading = await prisma.reading.findFirst({
        where,
        orderBy: { timestamp: 'desc' },
      });
      return NextResponse.json(latestReading ? [latestReading] : []);
    }

    const readings = await prisma.reading.findMany({
      where,
      orderBy: { timestamp: 'asc' },
    });

    return NextResponse.json(readings);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Failed to fetch readings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sensorId, ph, turbidity, temperature, hardness, potability } = body;

    if (!sensorId || ph === undefined || turbidity === undefined || 
        temperature === undefined || hardness === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate ranges
    const phVal = parseFloat(ph);
    if (phVal < 0 || phVal > 14) {
      return NextResponse.json({ error: 'pH must be between 0 and 14' }, { status: 400 });
    }

    const reading = await prisma.reading.create({
      data: {
        sensorId,
        ph: phVal,
        turbidity: parseFloat(turbidity),
        temperature: parseFloat(temperature),
        hardness: parseFloat(hardness),
        potability: potability !== undefined ? parseFloat(potability) : null,
      },
    });

    return NextResponse.json(reading, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create reading' }, { status: 500 });
  }
}