const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/water_quality';
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com:1883';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'sensors/water-quality/#';
const POTABILITY_API = 'https://dpv007-newclear.hf.space/gradio_api/call/predict_potability';

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

// Predict potability using external API
async function getPotability(pH, hardness, turbidity, temperature) {
  return new Promise((resolve, reject) => {
    try {
      // Step 1: Make initial API call to get EVENT_ID
      const postData = JSON.stringify({
        data: [pH, turbidity, temperature, hardness]
      });

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(POTABILITY_API, options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            const eventId = response.event_id;

            if (!eventId) {
              console.error('✗ Failed to get EVENT_ID from potability API');
              resolve(null);
              return;
            }

            // Step 2: Use EVENT_ID to get the prediction
            const predictionUrl = `${POTABILITY_API}/${eventId}`;
            const predictionOptions = {
              method: 'GET'
            };

            const predReq = https.request(predictionUrl, predictionOptions, (predRes) => {
              let predData = '';
              predRes.on('data', (chunk) => {
                predData += chunk;
              });
              predRes.on('end', () => {
                try {
                  const lines = predData.trim().split('\n');
                  let lastValue = null;

                  for (const line of lines) {
                    if (!line.startsWith('data:')) continue;

                    const jsonStr = line.replace('data:', '').trim();
                    const json = JSON.parse(jsonStr);
                    if (Array.isArray(json) && json.length > 0) {
                      lastValue = json[json.length - 1];
                    }
                  }

                  if (typeof lastValue !== 'string') {
                    console.error('✗ Unexpected prediction payload:', lastValue);
                    resolve(null);
                    return;
                  }

                  if (!lastValue.includes('Probabilities')) {
                    console.error('✗ Potability API returned an error or invalid response:', lastValue);
                    resolve(null);
                    return;
                  }

                  const match = lastValue.match(/ Potable:\s*([0-9.]+)/);
                  
                  const potability = match ? 1-parseFloat(match[1]) : null;

                  if (potability === null || Number.isNaN(potability)) {
                    console.error('✗ Could not extract Potable confidence from prediction:', lastValue);
                    resolve(null);
                    return;
                  }

                  resolve(potability);
                } catch (error) {
                  console.error('✗ Error parsing potability prediction:', error.message);
                  resolve(null);
                }
              });
            });

            predReq.on('error', (error) => {
              console.error('✗ Error getting potability prediction:', error.message);
              resolve(null);
            });

            predReq.end();
          } catch (error) {
            console.error('✗ Error parsing EVENT_ID response:', error.message);
            resolve(null);
          }
        });
      });

      req.on('error', (error) => {
        console.error('✗ Error calling potability API:', error.message);
        resolve(null);
      });

      req.write(postData);
      req.end();
    } catch (error) {
      console.error('✗ Unexpected error in getPotability:', error.message);
      resolve(null);
    }
  });
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
    data.pH = Number(data.pH);
    data.turbidity = Number(data.turbidity);
    data.temperature = Number(data.temperature);
    data.hardness = Number(data.hardness);
    
    console.log('📊 Processing reading:', data);
    
    // Get potability prediction from external API
    console.log('🔄 Fetching potability prediction...');
    const potability = await getPotability(data.pH, data.turbidity, data.temperature, data.hardness);

    if (potability !== null && typeof potability === 'number' && !Number.isNaN(potability)) {
      data.potability = potability;
      console.log(`✓ Potability: ${potability}`);
    } else {
      delete data.potability;
      console.warn('⚠ Could not get valid potability prediction; dropping field before insert');
    }
    
    // Store reading with potability
    await db.collection('Reading').insertOne(data);
    
    console.log(`✓ Stored reading from sensor ${data.sensorId}\n`);
  } catch (error) {
    console.error('✗ Error processing message:', error.message);
  }
}

// Start MQTT client
async function startMQTTClient() {
  await connectDB();
  
  console.log('Connecting to MQTT broker...');
  console.log(`  Broker: ${MQTT_BROKER}`);
  console.log(`  Topic: ${MQTT_TOPIC}`);
  
  const client = mqtt.connect(MQTT_BROKER, {
    clientId: `mqtt_ingestion_${Math.random().toString(16).substr(2, 8)}`,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
  });
  
  client.on('connect', () => {
    console.log('✓ Connected to MQTT broker');
    client.subscribe(MQTT_TOPIC, { qos: 0 }, (err) => {
      if (err) {
        console.error('✗ Subscription error:', err);
      } else {
        console.log(`✓ Subscribed to topic: ${MQTT_TOPIC}`);
        console.log('\n👂 Waiting for sensor data...\n');
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
