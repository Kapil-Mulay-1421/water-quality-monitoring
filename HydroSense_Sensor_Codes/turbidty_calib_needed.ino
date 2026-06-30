#define TURB_PIN 34
#define SAMPLES 50

float smoothedVoltage = 0;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int sum = 0;

  for (int i = 0; i < SAMPLES; i++) {
    sum += analogRead(TURB_PIN);
    delay(5);
  }

  int avgValue = sum / SAMPLES;

  float voltage = avgValue * (3.3 / 4095.0);

  // Smooth readings
  smoothedVoltage = 0.8 * smoothedVoltage + 0.2 * voltage;

  float V = smoothedVoltage;

  // Custom calibrated NTU
  float NTU = 3000 * (1.3 - V) / (1.3 - 0);

  // Limit values
  if (NTU < 0) NTU = 0;

  Serial.print("Voltage: ");
  Serial.print(V);

  Serial.print(" V | Turbidity: ");
  Serial.print(NTU);
  Serial.println(" NTU");

  delay(1000);
}