const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/water_quality';
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com:1883';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'sensors/water-quality/#';

let db = null;

// Connect to MongoDB
async function connectDB() {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    db = client.db();
    console.log('✓ Connected to MongoDB');
    
    // Ensure indexes exist
    await db.collection('sensors').createIndex({ sensorId: 1 }, { unique: true });
    await db.collection('readings').createIndex({ sensorId: 1, timestamp: -1 });
    
    return db;
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Validate reading data
function validateReading(data) {
  const required = ['sensorId', 'timestamp', 'pH', 'turbidity', 'temperature', 'hardness'];
  
  for (const field of required) {
    if (data[field] === undefined || data[field] === null) {
      return false;
    }
  }
  
  // Validate numeric ranges
  if (data.pH < 0 || data.pH > 14) return false;
  if (data.turbidity < 0) return false;
  if (data.temperature < -50 || data.temperature > 100) return false;
  if (data.hardness < 0) return false;
  
  return true;
}

// Process incoming MQTT message
async function processMessage(topic, message) {
  try {
    const data = JSON.parse(message.toString());
    
    if (!validateReading(data)) {
      console.error('✗ Invalid reading data:', data);
      return;
    }
    
    // Convert timestamp to Date object
    data.timestamp = new Date(data.timestamp);
    
    // Store reading
    await db.collection('readings').insertOne(data);
    
    console.log(`✓ Stored reading from sensor ${data.sensorId}`);
  } catch (error) {
    console.error('✗ Error processing message:', error.message);
  }
}

// Start MQTT client
async function startMQTTClient() {
  await connectDB();
  
  const client = mqtt.connect(MQTT_BROKER, {
    clientId: `mqtt_ingestion_${Math.random().toString(16).substr(2, 8)}`,
    clean: true,
    reconnectPeriod: 5000,
  });
  
  client.on('connect', () => {
    console.log('✓ Connected to MQTT broker');
    client.subscribe(MQTT_TOPIC, (err) => {
      if (err) {
        console.error('✗ Subscription error:', err);
      } else {
        console.log(`✓ Subscribed to topic: ${MQTT_TOPIC}`);
      }
    });
  });
  
  client.on('message', processMessage);
  
  client.on('error', (error) => {
    console.error('✗ MQTT error:', error);
  });
  
  client.on('offline', () => {
    console.log('⚠ MQTT client offline');
  });
  
  client.on('reconnect', () => {
    console.log('↻ Reconnecting to MQTT broker...');
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠ Shutting down gracefully...');
  process.exit(0);
});

// Start the service
console.log('🚀 Starting MQTT Ingestion Service...');
startMQTTClient();
