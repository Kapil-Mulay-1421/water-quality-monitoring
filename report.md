# Water Quality Monitoring System Report

## 1. System Architecture

### 1.1 Overview
This project is a full-stack water quality monitoring system built for real-time sensor data ingestion, storage, and visualization. The system is implemented using modern web technologies while preserving clarity for readers who may not be familiar with cutting-edge terms.

### 1.2 Architecture Layers

#### 1.2.1 Sensor Layer
- The system simulates or receives data from distributed water quality sensors.
- Each sensor reports the following environmental readings:
  - `pH` (acidity / alkalinity)
  - `turbidity` (water clarity)
  - `temperature` (°C)
  - `hardness` (mineral concentration)
- Sensors publish their readings through a lightweight telemetry protocol.

#### 1.2.2 Ingestion Layer
- The ingestion layer receives sensor data from the messaging system and prepares it for storage.
- It is implemented in `services/mqttIngestion.js`.
- It connects to an MQTT broker, validates incoming data, optionally enriches it, and stores it in the database.

#### 1.2.3 Data Layer
- The data layer uses MongoDB as the database.
- Schema is defined using Prisma in `prisma/schema.prisma`.
- Data models:
  - `Sensor`: stores sensor identity, location, and installation metadata.
  - `Reading`: stores time-stamped water quality measurements and derived potability values.

#### 1.2.4 API Layer
- The backend exposes REST-like HTTP endpoints using Next.js API routes in `app/api/`.
- Main endpoints:
  - `GET /api/sensors`: fetch all sensors
  - `POST /api/sensors`: create a new sensor
  - `GET /api/readings`: fetch sensor readings with time-range filters
  - `POST /api/readings`: submit a reading manually
- This layer provides the data needed by the frontend and can also be used by other services.

#### 1.2.5 Presentation Layer
- The frontend is built with Next.js and React.
- Key UI components are in `components/`.
- The home page displays an interactive global map and real-time sensor summaries.
- Individual sensor pages show detailed charts and historical trends.

### 1.3 Data Flow
1. A sensor publishes a reading to the MQTT broker.
2. The ingestion service subscribes to the broker and receives the message.
3. The ingestion service validates and processes the message.
4. Valid readings are stored in MongoDB.
5. The frontend requests data from API routes.
6. Users view sensor locations and trends in the browser.

### 1.4 Technical Design Choices
- **Next.js** for an integrated frontend and backend experience.
- **MongoDB** for flexible, document-oriented storage.
- **Prisma** as a type-safe database access layer.
- **MQTT** for lightweight, IoT-friendly messaging.
- **Leaflet.js** for geographic visualization.
- **Recharts** for charts and time series graphs.

### 1.5 Important Benefits
- **Scalable ingestion**: MQTT supports many sensors and asynchronous publishing.
- **Real-time readiness**: Sensor readings are available quickly after publication.
- **Geospatial visualization**: Map-based UI shows where sensors are located.
- **Modular structure**: Ingestion, API, database, and frontend layers are separated cleanly.

## 2. MQTT Subsystem

### 2.1 What is MQTT?
- MQTT stands for **Message Queuing Telemetry Transport**.
- It is a lightweight publish/subscribe protocol designed for devices that have limited resources or unreliable networks.
- MQTT is commonly used in Internet of Things (IoT) systems because it minimizes bandwidth and supports many small devices.

### 2.2 Role of MQTT in the Project
- MQTT is the communication channel between sensor devices and the backend ingestion service.
- Sensors publish messages to MQTT topics; the ingestion service subscribes to those topics and receives the data.
- This decouples sensors from the backend, so sensors do not need to know how the database is implemented.

### 2.3 Implementation Details
- The ingestion service is implemented in `services/mqttIngestion.js`.
- It connects to an MQTT broker using the `mqtt` Node.js client library.
- The broker address is configured with `process.env.MQTT_BROKER`, defaulting to `mqtt://broker.hivemq.com:1883`.
- The service subscribes to the topic pattern `sensors/water-quality/#`.
  - The `#` wildcard allows the service to receive data from multiple sensors under the base topic.

### 2.4 Message Structure and Validation
- Incoming MQTT messages are expected in JSON format and include:
  - `sensorId`
  - `timestamp`
  - `pH`
  - `turbidity`
  - `temperature`
  - `hardness`
- Validation rules ensure data quality before storage:
  - `sensorId` exists
  - `timestamp` is present
  - `pH` is between 0 and 14
  - `turbidity` is non-negative
  - `temperature` is between -50 and 100
  - `hardness` is non-negative
- Invalid or malformed messages are logged and discarded.

### 2.5 Data Enrichment
- The ingestion service also calls an external potability prediction API.
- The API result is stored in the `potability` field of the reading.
- This adds a derived water safety indicator alongside the raw sensor data.

### 2.6 Storage Path
- Validated readings are inserted into the database as `Reading` records.
- Each record includes raw measurements and the derived `potability` score.
- The database schema is defined in `prisma/schema.prisma`.

### 2.7 Sensor Simulation
- The repository includes a sensor simulator at `scripts/simulateSensors.js`.
- The simulator publishes test payloads to MQTT so the system can be demonstrated without physical sensors.
- Simulated metrics are generated in realistic ranges:
  - `pH`: 6.5 to 8.5
  - `turbidity`: 0 to 10
  - `temperature`: 15 to 30 °C
  - `hardness`: 50 to 250
- The simulator sends initial readings and then publishes random subsequent updates.

### 2.8 Reliability and Resilience
- The MQTT client is configured for automatic reconnection.
- Connection events such as `offline`, `reconnect`, and `error` are logged.
- This ensures the ingestion service remains robust even if the broker connection drops.

## 3. Summary
- The system integrates a modern web frontend, structured backend APIs, and a real-time ingestion pipeline.
- MQTT provides an efficient and scalable link between sensors and the backend.
- MongoDB and Prisma store sensor metadata and time-series readings.
