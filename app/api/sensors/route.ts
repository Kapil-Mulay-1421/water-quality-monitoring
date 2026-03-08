import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Get all sensors
    const sensors = await db.collection('sensors').find({}).toArray();
    
    // Get latest reading for each sensor
    const sensorsWithReadings = await Promise.all(
      sensors.map(async (sensor) => {
        const latestReading = await db.collection('readings')
          .find({ sensorId: sensor.sensorId })
          .sort({ timestamp: -1 })
          .limit(1)
          .toArray();
        
        return {
          ...sensor,
          latestReading: latestReading[0] || null,
        };
      })
    );
    
    return NextResponse.json(sensorsWithReadings);
  } catch (error) {
    console.error('Error fetching sensors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sensors' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const sensor = await request.json();
    
    // Validate sensor data
    if (!sensor.sensorId || !sensor.latitude || !sensor.longitude) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const db = await getDatabase();
    
    // Add installation timestamp
    sensor.installedAt = new Date();
    
    // Insert sensor
    await db.collection('sensors').insertOne(sensor);
    
    return NextResponse.json(sensor, { status: 201 });
  } catch (error) {
    console.error('Error creating sensor:', error);
    return NextResponse.json(
      { error: 'Failed to create sensor' },
      { status: 500 }
    );
  }
}
