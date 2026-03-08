const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/water_quality';

const sampleSensors = [
  {
    sensorId: 'SENSOR_NYC_001',
    latitude: 40.7128,
    longitude: -74.0060,
    locationName: 'New York City, USA',
    installedAt: new Date('2020-01-15'),
  },
  {
    sensorId: 'SENSOR_LON_001',
    latitude: 51.5074,
    longitude: -0.1278,
    locationName: 'London, UK',
    installedAt: new Date('2020-03-20'),
  },
  {
    sensorId: 'SENSOR_TKY_001',
    latitude: 35.6762,
    longitude: 139.6503,
    locationName: 'Tokyo, Japan',
    installedAt: new Date('2020-05-10'),
  },
  {
    sensorId: 'SENSOR_SYD_001',
    latitude: -33.8688,
    longitude: 151.2093,
    locationName: 'Sydney, Australia',
    installedAt: new Date('2020-07-05'),
  },
  {
    sensorId: 'SENSOR_PAR_001',
    latitude: 48.8566,
    longitude: 2.3522,
    locationName: 'Paris, France',
    installedAt: new Date('2020-09-12'),
  },
  {
    sensorId: 'SENSOR_MUM_001',
    latitude: 19.0760,
    longitude: 72.8777,
    locationName: 'Mumbai, India',
    installedAt: new Date('2020-11-08'),
  },
  {
    sensorId: 'SENSOR_SAO_001',
    latitude: -23.5505,
    longitude: -46.6333,
    locationName: 'São Paulo, Brazil',
    installedAt: new Date('2021-01-20'),
  },
  {
    sensorId: 'SENSOR_CAI_001',
    latitude: 30.0444,
    longitude: 31.2357,
    locationName: 'Cairo, Egypt',
    installedAt: new Date('2021-03-15'),
  },
  {
    sensorId: 'SENSOR_SFO_001',
    latitude: 37.7749,
    longitude: -122.4194,
    locationName: 'San Francisco, USA',
    installedAt: new Date('2021-05-10'),
  },
  {
    sensorId: 'SENSOR_SIN_001',
    latitude: 1.3521,
    longitude: 103.8198,
    locationName: 'Singapore',
    installedAt: new Date('2021-07-22'),
  },
];

// Generate sample readings for each sensor
function generateReading(sensorId, timestamp) {
  return {
    sensorId,
    timestamp,
    pH: 6.5 + Math.random() * 2, // 6.5 - 8.5
    turbidity: Math.random() * 10, // 0 - 10 NTU
    temperature: 15 + Math.random() * 15, // 15 - 30°C
    hardness: 50 + Math.random() * 200, // 50 - 250 mg/L
  };
}

async function seedDatabase() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.collection('sensors').deleteMany({});
    await db.collection('readings').deleteMany({});
    
    // Insert sensors
    console.log('📍 Inserting sensors...');
    await db.collection('sensors').insertMany(sampleSensors);
    console.log(`✓ Inserted ${sampleSensors.length} sensors`);
    
    // Generate readings for the past 7 days
    console.log('📊 Generating sample readings...');
    const readings = [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    for (const sensor of sampleSensors) {
      // Generate readings every hour for the past 7 days
      for (let time = sevenDaysAgo.getTime(); time <= now.getTime(); time += 60 * 60 * 1000) {
        readings.push(generateReading(sensor.sensorId, new Date(time)));
      }
    }
    
    await db.collection('readings').insertMany(readings);
    console.log(`✓ Inserted ${readings.length} readings`);
    
    // Create indexes
    console.log('🔍 Creating indexes...');
    await db.collection('sensors').createIndex({ sensorId: 1 }, { unique: true });
    await db.collection('readings').createIndex({ sensorId: 1, timestamp: -1 });
    await db.collection('readings').createIndex({ timestamp: -1 });
    console.log('✓ Indexes created');
    
    console.log('\n✅ Database seeded successfully!');
    console.log(`   Sensors: ${sampleSensors.length}`);
    console.log(`   Readings: ${readings.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

seedDatabase();
