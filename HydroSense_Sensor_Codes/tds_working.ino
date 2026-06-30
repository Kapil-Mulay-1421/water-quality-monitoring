#define TDS_PIN 13
#define SAMPLE_SIZE 15

int buffer[SAMPLE_SIZE];

void setup() {
  Serial.begin(115200);
}

int getMedian(int arr[], int size) {
  int temp[size];
  memcpy(temp, arr, sizeof(temp));

  // simple bubble sort
  for (int i = 0; i < size - 1; i++) {
    for (int j = 0; j < size - i - 1; j++) {
      if (temp[j] > temp[j + 1]) {
        int t = temp[j];
        temp[j] = temp[j + 1];
        temp[j + 1] = t;
      }
    }
  }
  return temp[size / 2];
}

void loop() {
  // Collect samples
  for (int i = 0; i < SAMPLE_SIZE; i++) {
    buffer[i] = analogRead(TDS_PIN);
    delay(20);
  }

  // Median filtering
  int medianValue = getMedian(buffer, SAMPLE_SIZE);

  // Convert to voltage
  float voltage = medianValue * (3.3 / 4095.0);

  // TDS formula
  float tds = (133.42 * voltage * voltage * voltage 
              -255.86 * voltage * voltage 
              +857.39 * voltage) * 0.5;

  Serial.print("Stable TDS: ");
  Serial.print(tds);
  Serial.println(" ppm");

  delay(1000);
}