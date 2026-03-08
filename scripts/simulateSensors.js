const mqtt = require('mqtt');
require('dotenv').config({ path: '.env.local' });

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com:1883';
const MQTT_TOPIC = 'sensors/water-quality';

const sensorIds = [
  'SENSOR_NYC_001',
  'SENSOR_LON_001',
  'SENSOR_TKY_001',
  'SENSOR_SYD_001',
  'SENSOR_PAR_001',
  'SENSOR_MUM_001',
  'SENSOR_SAO_001',
  'SENSOR_CAI_001',
  'SENSOR_SFO_001',
  'SENSOR_SIN_001',
];

function generateReading(sensorId) {
  return {
    sensorId,
    timestamp: new Date().toISOString(),
    pH: (6.5 + Math.random() * 2).toFixed(2),
    turbidity: (Math.random() * 10).toFixed(2),
    temperature: (15 + Math.random() * 15).toFixed(2),
    hardness: (50 + Math.random() * 200).toFixed(2),
  };
}

function startSimulator() {
  console.log('🚀 Starting MQTT Sensor Simulator...');
  console.log(`📡 Broker: ${MQTT_BROKER}`);
  console.log(`📢 Topic: ${MQTT_TOPIC}`);
  
  const client = mqtt.connect(MQTT_BROKER, {
    clientId: `sensor_simulator_${Math.random().toString(16).substr(2, 8)}`,
    clean: true,
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
    }, 5000 + Math.random() * 10000); // Random interval between 5-15 seconds
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
