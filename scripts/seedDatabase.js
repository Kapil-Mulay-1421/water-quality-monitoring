const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

const sampleSensors = [
  { sensorId: 'SENSOR_NYC_001', latitude: 40.7128, longitude: -74.0060, locationName: 'New York Hub' },
  { sensorId: 'SENSOR_LON_002', latitude: 51.5074, longitude: -0.1278,  locationName: 'London Hub' },
  { sensorId: 'SENSOR_TOK_003', latitude: 35.6762, longitude: 139.6503, locationName: 'Tokyo Hub' },
  { sensorId: 'SENSOR_SYD_004', latitude: -33.8688, longitude: 151.2093, locationName: 'Sydney Hub' },
  { sensorId: 'SENSOR_MUM_005', latitude: 19.0760,  longitude: 72.8777,  locationName: 'Mumbai Hub' },
];

async function seed() {
  console.log('🌱 Seeding database...');

  for (const s of sampleSensors) {
    const sensor = await prisma.sensor.upsert({
      where: { sensorId: s.sensorId },
      update: {},
      create: s,
    });

    // Generate 48 readings over last 2 days
    for (let i = 0; i < 48; i++) {
      const hoursAgo = 48 - i;
      await prisma.reading.create({
        data: {
          sensorId: sensor.sensorId,
          timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
          ph: parseFloat((6.5 + Math.random() * 2).toFixed(2)),
          turbidity: parseFloat((1 + Math.random() * 8).toFixed(2)),
          temperature: parseFloat((18 + Math.random() * 12).toFixed(2)),
          hardness: parseFloat((80 + Math.random() * 100).toFixed(2)),
          potability: Math.random() > 0.3 ? 1 : 0,
        },
      });
    }
    console.log(`✓ Seeded ${sensor.locationName}`);
  }

  await prisma.$disconnect();
  console.log('✅ Seeding complete');
}

seed().catch(console.error);