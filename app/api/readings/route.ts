import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sensorId = searchParams.get('sensorId');
    const timeRange = searchParams.get('timeRange') || '1d';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!sensorId) {
      return NextResponse.json(
        { error: 'sensorId is required' },
        { status: 400 }
      );
    }
    
    const db = await getDatabase();
    
    // Calculate time filter
    let timeFilter: any = {};
    
    if (startDate && endDate) {
      // Custom range
      timeFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      // Predefined ranges
      const now = new Date();
      const ranges: Record<string, number> = {
        '1h': 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000,
        '1w': 7 * 24 * 60 * 60 * 1000,
        '1m': 30 * 24 * 60 * 60 * 1000,
      };
      
      const rangeMs = ranges[timeRange] || ranges['1d'];
      timeFilter = { $gte: new Date(now.getTime() - rangeMs) };
    }
    
    // Fetch readings
    const readings = await db.collection('readings')
      .find({
        sensorId,
        timestamp: timeFilter,
      })
      .sort({ timestamp: 1 })
      .toArray();
    
    return NextResponse.json(readings);
  } catch (error) {
    console.error('Error fetching readings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch readings' },
      { status: 500 }
    );
  }
}
