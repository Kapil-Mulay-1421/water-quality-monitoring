#include <WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"
#include <time.h>                        // ← added

// ----------- WIFI CREDENTIALS -----------
const char* ssid = "One Plus Nord CE2 Lite";
const char* password = "********";

// ----------- MQTT SETTINGS -----------
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

#define SENSOR_ID "SENSOR_PUN_001"
String topic = "sensors/water-quality/" + String(SENSOR_ID);

// ----------- DHT SETTINGS -----------
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// ----------- NTP SETTINGS -----------          // ← added block
const char* ntp_server   = "pool.ntp.org";
const long  gmt_offset   = 19800;               // UTC+5:30 for India (seconds)
const int   dst_offset   = 0;

// ----------- OBJECTS -----------
WiFiClient espClient;
PubSubClient client(espClient);

// ----------- GET ISO 8601 TIMESTAMP -----------  // ← added
String getTimestamp() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return "1970-01-01T00:00:00";               // fallback if NTP not ready
  }
  char buf[25];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S", &timeinfo);
  return String(buf);
}

// ----------- WIFI CONNECT -----------
void setup_wifi() {
  delay(10);
  Serial.println("Connecting to WiFi...");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");

  // Sync time after WiFi is up                  // ← added
  configTime(gmt_offset, dst_offset, ntp_server);
  Serial.print("Syncing NTP time");
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {             // wait until synced
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nTime synced: " + getTimestamp());
}

// ----------- MQTT RECONNECT -----------
void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");

    if (client.connect("ESP32_Client_" SENSOR_ID)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

// ----------- SETUP -----------
void setup() {
  Serial.begin(115200);
  dht.begin();
  setup_wifi();

  client.setServer(mqtt_server, mqtt_port);
}

// ----------- LOOP -----------
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  float temperature = dht.readTemperature();

  if (isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  // ----------- JSON PAYLOAD -----------
  String payload = "{";
  payload += "\"sensorId\":\"" + String(SENSOR_ID) + "\",";
  payload += "\"timestamp\":\"" + getTimestamp() + "\",";  // ← real timestamp
  payload += "\"pH\":\"0\",";
  payload += "\"turbidity\":\"0\",";
  payload += "\"temperature\":\"" + String(temperature, 2) + "\",";
  payload += "\"hardness\":\"0\"";
  payload += "}";

  // ----------- PUBLISH -----------
  client.publish(topic.c_str(), payload.c_str());

  Serial.println("Published:");
  Serial.println(payload);

  delay(5000);
}