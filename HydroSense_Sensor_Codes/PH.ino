#define PH_PIN 34   // Analog pin

float voltage, phValue;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int samples = 20;
  float sum = 0;

  // Take multiple readings (noise reduction)
  for (int i = 0; i < samples; i++) {
    sum += analogRead(PH_PIN);
    delay(10);
  }

  float avg = sum / samples;

  // Convert ADC to voltage (ESP32 = 12-bit, 0–4095)
  voltage = avg * (3.3 / 4095.0);

  // Convert voltage to pH (approximation)
  phValue = 7 + ((2.5 - voltage) / 0.18);

  Serial.print("Voltage: ");
  Serial.print(voltage, 3);
  Serial.print(" V  | pH: ");
  Serial.println(phValue, 2);

  delay(1000);
}