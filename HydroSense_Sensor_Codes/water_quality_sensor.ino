
//  Water Quality Monitor — ESP32
//  Sensors: pH | TDS | Turbidity | Temperature (DHT22)
//  Transport: WiFi → MQTT (HiveMQ)


#include <WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"
#include <time.h>
#include <string.h>  


//  PIN ASSIGNMENTS 

#define PH_PIN    34   
#define TDS_PIN   35 
#define TURB_PIN  32   
#define DHTPIN     4   
#define DHTTYPE   DHT22


//  Wi-Fi & MQTT

const char* ssid        = "One Plus Nord CE2 Lite";
const char* password    = "********";
const char* mqtt_server = "broker.hivemq.com";
const int   mqtt_port   = 1883;

#define SENSOR_ID "SENSOR_PUN_001"
const String topic = "sensors/water-quality/" + String(SENSOR_ID);



const char* ntp_server = "pool.ntp.org";
const long  gmt_offset = 19800;   // seconds
const int   dst_offset = 0;


//  Sampling constants
#define PH_SAMPLES    20
#define TDS_SAMPLES   15
#define TURB_SAMPLES  50

// initiating sensors

DHT          dht(DHTPIN, DHTTYPE);
WiFiClient   espClient;
PubSubClient client(espClient);

float smoothedTurbVoltage = 0.0f;


String getTimestamp() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) return "1970-01-01T00:00:00";
  char buf[25];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S", &timeinfo);
  return String(buf);
}


int getMedian(int arr[], int size) {
  int temp[size];
  memcpy(temp, arr, size * sizeof(int));
  for (int i = 0; i < size - 1; i++)
    for (int j = 0; j < size - i - 1; j++)
      if (temp[j] > temp[j + 1]) {
        int t = temp[j]; temp[j] = temp[j + 1]; temp[j + 1] = t;
      }
  return temp[size / 2];
}


//  SENSOR READS


// --- pH (averaged ADC → voltage → pH)
float readPH() {
  float sum = 0;
  for (int i = 0; i < PH_SAMPLES; i++) {
    sum += analogRead(PH_PIN);
    delay(10);
  }
  float voltage = (sum / PH_SAMPLES) * (3.3f / 4095.0f);
  float ph01 =  7.0f - ((2.5f - voltage) / 0.18f);
  return 0.348f * ph01 + 6.169f;
}

// --- TDS (median-filtered ADC → voltage → ppm) 
float readTDS() {
  int buffer[TDS_SAMPLES];
  for (int i = 0; i < TDS_SAMPLES; i++) {
    buffer[i] = analogRead(TDS_PIN);
    delay(20);
  }
  float voltage = getMedian(buffer, TDS_SAMPLES) * (3.3f / 4095.0f);
  Serial.printf("[TDS DEBUG] Raw ADC: %d\n", getMedian(buffer, TDS_SAMPLES));
  Serial.printf("[TDS DEBUG] Voltage: %.4f V\n", voltage);
  return (133.42f * voltage * voltage * voltage
        - 255.86f * voltage * voltage
        + 857.39f * voltage) * 0.5f;
}

// --- Turbidity (averaged + EMA smoothing → NTU) 
float readTurbidity() {
  long sum = 0;
  for (int i = 0; i < TURB_SAMPLES; i++) {
    sum += analogRead(TURB_PIN);
    delay(5);
  }
  float voltage = (sum / (float)TURB_SAMPLES) * (3.3f / 4095.0f);
  smoothedTurbVoltage = 0.8f * smoothedTurbVoltage + 0.2f * voltage;
  float ntu = 3000.0f * (1.3f - smoothedTurbVoltage) / 1.3f;
  return (ntu < 0) ? 0 : ntu/1000;
}


//  Wi-Fi & MQTT


void setup_wifi() {
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi connected  IP: " + WiFi.localIP().toString());

  // Sync NTP
  configTime(gmt_offset, dst_offset, ntp_server);
  Serial.print("Syncing NTP");
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) { delay(500); Serial.print("."); }
  Serial.println("\nTime synced: " + getTimestamp());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect("ESP32_Client_" SENSOR_ID)) {
      Serial.println("connected");
    } else {
      Serial.print("failed rc="); Serial.print(client.state());
      Serial.println(" — retry in 2 s");
      delay(2000);
    }
  }
}


//  SETUP

void setup() {
  Serial.begin(115200);
  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}


void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  // -- Read all sensors --
  float temperature = dht.readTemperature();
  if (isnan(temperature)) {
    Serial.println("[ERR] DHT22 read failed — skipping cycle");
    delay(2000);
    return;
  }

  float phValue  = readPH();
  float tdsValue = readTDS();
  float ntuValue = readTurbidity();

  // -- Debug output --
  Serial.println("------------------------------------");
  Serial.printf("Temp       : %.2f °C\n",  temperature);
  Serial.printf("pH         : %.2f\n",     phValue);
  Serial.printf("TDS        : %.2f ppm\n", tdsValue);
  Serial.printf("Turbidity  : %.2f NTU\n", ntuValue);
  Serial.println("------------------------------------");

  // -- Build JSON payload --
  String payload = "{";
  payload += "\"sensorId\":\""   + String(SENSOR_ID)         + "\",";
  payload += "\"timestamp\":\""  + getTimestamp()             + "\",";
  payload += "\"temperature\":\"" + String(temperature, 2)   + "\",";
  payload += "\"pH\":\""          + String(phValue, 2)        + "\",";
  payload += "\"hardness\":\""         + String(tdsValue, 2)       + "\",";
  payload += "\"turbidity\":\""   + String(ntuValue, 2)       + "\"";
  payload += "}";

  // -- Publish --
  if (client.publish(topic.c_str(), payload.c_str())) {
    Serial.println("Published: " + payload);
  } else {
    Serial.println("[ERR] MQTT publish failed");
  }

  delay(5000);   // publish every 5 s
}
