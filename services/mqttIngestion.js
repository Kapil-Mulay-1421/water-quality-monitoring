const mqtt = require('mqtt');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com:1883';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'sensors/water-quality/#';
const ML_INFERENCE_URL = process.env.ML_INFERENCE_URL || 'http://localhost:5000/predict';

const prisma = new PrismaClient();

function validateReading(data) {
  const required = ['sensorId', 'pH', 'turbidity', 'temperature', 'hardness'];
  for (const field of required) {
    if (data[field] === undefined || data[field] === null) return false;
  }
  if (data.pH < 0 || data.pH > 14) return false;
  if (data.turbidity < 0) return false;
  if (data.temperature < -50 || data.temperature > 100) return false;
  if (data.hardness < 0) return false;
  return true;
}

async function getPotability(reading) {
  try {
    const res = await fetch(ML_INFERENCE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pH: reading.pH,
        tds: reading.hardness,
        turbidity: reading.turbidity,
        temperature: reading.temperature,
      }),
    });
    const result = await res.json();
    return result.potability ?? null;
  } catch {
    return null; // ML offline — proceed without potability
  }
}

async function processMessage(topic, message) {
  try {
    const data = JSON.parse(message.toString());
    if (!validateReading(data)) {
      console.error('✗ Invalid reading:', data);
      return;
    }

    const potability = await getPotability(data);

    await prisma.reading.create({
      data: {
        sensorId: data.sensorId,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        ph: parseFloat(data.pH),
        turbidity: parseFloat(data.turbidity),
        temperature: parseFloat(data.temperature),
        hardness: parseFloat(data.hardness),
        potability,
      },
    });

    console.log(`✓ Stored reading from ${data.sensorId} | Potable: ${potability}`);
  } catch (error) {
    console.error('✗ Error processing message:', error.message);
  }
}

async function start() {
  const client = mqtt.connect(MQTT_BROKER, {
    clientId: `mqtt_ingestion_${Math.random().toString(16).substr(2, 8)}`,
    clean: true,
    reconnectPeriod: 5000,
  });

  client.on('connect', () => {
    console.log('✓ Connected to MQTT broker');
    client.subscribe(MQTT_TOPIC);
  });

  client.on('message', processMessage);
  client.on('error', (e) => console.error('✗ MQTT error:', e));
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

console.log('🚀 Starting MQTT Ingestion Service...');
start();