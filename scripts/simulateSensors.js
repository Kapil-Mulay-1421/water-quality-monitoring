const mqtt = require('mqtt');
require('dotenv').config({ path: '.env.local' });

const MQTT_HOST = process.env.MQTT_HOST || 'mqtt://broker.hivemq.com:1883';
const MQTT_TOPIC = 'sensors/water-quality';
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

const sensorIds = [
  // 'SENSOR_NYC_001',
  // 'SENSOR_LON_001',
  // 'SENSOR_TKY_001',
  // 'SENSOR_SYD_001',
  // 'SENSOR_PAR_001',
  // 'SENSOR_MUM_001',
  // 'SENSOR_SAO_001',
  // 'SENSOR_CAI_001',
  // 'SENSOR_SFO_001',
  'SENSOR_NAG_001'
  // 'SENSOR_PUN_002',
  // "AQUA_007",
  // "AQUA_008"
];

function generateReading(sensorId) {
  return {
    sensorId,
    timestamp: new Date().toISOString(),
    pH: (7.0 + Math.random() * 2).toFixed(2),
    turbidity: (100+Math.random() * 10).toFixed(2),
    temperature: (15 + Math.random() * 15).toFixed(2),
    hardness: (50 + Math.random() * 200).toFixed(2),
  };
}

function startSimulator() {
  console.log('🚀 Starting MQTT Sensor Simulator...');
  console.log(`📡 Host: ${MQTT_HOST}`);
  console.log(`📢 Topic: ${MQTT_TOPIC}`);
  
  const client = mqtt.connect({
    host: process.env.MQTT_HOST,
    port: Number(process.env.MQTT_PORT),
    protocol: 'mqtts',
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clean: true,
    clientId: `sensor_simulator_${Math.random().toString(16).slice(2,10)}`
  });
  
  client.on('connect', () => {
    console.log('✓ Connected to MQTT broker\n');
    
    // Send initial readings for all sensors
    sensorIds.forEach((sensorId, index) => {
      setTimeout(() => {
        const reading = generateReading(sensorId);
        const topic = `${MQTT_TOPIC}/${sensorId}`;
        client.publish(topic, JSON.stringify(reading));
        console.log(`📤 ${sensorId}: pH=${reading.pH}, temp=${reading.temperature}°C`);
      }, index * 1000);
    });
    
    // Send random readings at random intervals
    setInterval(() => {
      const randomSensor = sensorIds[Math.floor(Math.random() * sensorIds.length)];
      const reading = generateReading(randomSensor);
      const topic = `${MQTT_TOPIC}/${randomSensor}`;
      
      client.publish(topic, JSON.stringify(reading));
      console.log(`📤 ${randomSensor}: pH=${reading.pH}, temp=${reading.temperature}°C`);
    }, 5000 + Math.random() * 2000); // Random interval between 5-15 seconds
  });
  
  client.on('error', (error) => {
    console.error('❌ MQTT error:', error);
  });
  
  client.on('offline', () => {
    console.log('⚠️  MQTT client offline');
  });
  
  client.on('reconnect', () => {
    console.log('↻ Reconnecting to MQTT broker...');
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n⚠️  Shutting down simulator...');
    client.end();
    process.exit(0);
  });
}

startSimulator();
