---
title: HydroSense
emoji: 💧
colorFrom: blue
colorTo: green
sdk: docker
app_port: 3000
---
# Water Quality Monitoring System

A full-stack Next.js application for monitoring and visualizing water quality measurements from geographically distributed sensors worldwide.

## 🌟 Features

- **Real-time Monitoring**: MQTT-based ingestion of sensor data
- **Interactive Global Map**: Visualize sensor locations with Leaflet.js
- **Historical Analysis**: Time-series charts for water quality metrics
- **Responsive Dashboard**: Detailed sensor views with customizable time ranges
- **Scalable Architecture**: MongoDB storage with efficient indexing
- **RESTful APIs**: Backend endpoints for data retrieval

## 📊 Water Quality Metrics

- **pH**: Acidity or alkalinity of water (0-14)
- **Turbidity**: Water clarity measurement (NTU)
- **Temperature**: Water temperature (°C)
- **Hardness**: Mineral concentration in water (mg/L)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB
- **Mapping**: Leaflet.js, React-Leaflet
- **Charts**: Recharts
- **Messaging**: MQTT (HiveMQ)

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud instance)
- MQTT Broker (HiveMQ public broker by default)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   cd water-quality-monitoring
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Edit `.env.local` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/water_quality
   MQTT_BROKER=mqtt://broker.hivemq.com:1883
   MQTT_TOPIC=sensors/water-quality/#
   ```

4. **Start MongoDB**
   
   If running locally:
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

5. **Seed the database with sample data**
   ```bash
   node scripts/seedDatabase.js
   ```

## 🏃 Running the Application

### Development Mode

Start the Next.js development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### MQTT Ingestion Service

In a separate terminal, start the MQTT ingestion service:
```bash
npm run mqtt:start
```

This service subscribes to MQTT topics and stores incoming sensor readings in MongoDB.

### Sensor Simulator (Optional)

To simulate sensor data for testing:
```bash
node scripts/simulateSensors.js
```

This will publish random sensor readings to the MQTT broker.

## 📁 Project Structure

```
water-quality-monitoring/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── sensors/          # Sensor endpoints
│   │   └── readings/         # Readings endpoints
│   ├── sensor/               # Dynamic sensor routes
│   │   └── [sensorId]/       # Individual sensor pages
│   │       ├── page.tsx      # Sensor detail page
│   │       └── not-found.tsx # 404 page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page (map view)
├── components/               # React components
│   ├── SensorMap.tsx         # Main map interface
│   ├── MapView.tsx           # Leaflet map component
│   ├── SensorDashboard.tsx   # Charts and statistics
│   ├── SensorDetailPage.tsx  # Full sensor page
│   └── MiniMap.tsx           # Small location map
├── lib/                      # Utilities and types
│   ├── mongodb.ts            # Database connection
│   └── types.ts              # TypeScript types
├── services/                 # Background services
│   └── mqttIngestion.js      # MQTT subscriber
├── scripts/                  # Utility scripts
│   ├── seedDatabase.js       # Database seeding
│   └── simulateSensors.js    # Sensor simulation
├── .env.local                # Environment variables
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── next.config.js            # Next.js config
```

## 🔌 API Endpoints

### Get All Sensors
```
GET /api/sensors
```
Returns all sensors with their latest readings.

### Create Sensor
```
POST /api/sensors
Content-Type: application/json

{
  "sensorId": "SENSOR_XXX_001",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "locationName": "Location Name"
}
```

### Get Sensor Readings
```
GET /api/readings?sensorId=SENSOR_XXX_001&timeRange=1d
```

Query Parameters:
- `sensorId` (required): Sensor identifier
- `timeRange`: `1h`, `1d`, `1w`, `1m`
- `startDate`: ISO date string (for custom range)
- `endDate`: ISO date string (for custom range)

## 📊 Database Schema

### Sensors Collection
```javascript
{
  sensorId: String,      // Unique identifier
  latitude: Number,      // Geographic latitude
  longitude: Number,     // Geographic longitude
  locationName: String,  // Optional location name
  installedAt: Date      // Installation timestamp
}
```

### Readings Collection
```javascript
{
  sensorId: String,      // Reference to sensor
  timestamp: Date,       // Reading timestamp
  pH: Number,           // pH level (0-14)
  turbidity: Number,    // Turbidity (NTU)
  temperature: Number,  // Temperature (°C)
  hardness: Number      // Hardness (mg/L)
}
```

## 🎯 Usage

### Routes

- **`/`** - Main map view with all sensors
- **`/sensor/[sensorId]`** - Individual sensor dashboard page
  - Example: `/sensor/SENSOR_NYC_001`
  - Direct link to specific sensor with full dashboard
  - Bookmarkable and shareable URLs

### Navigation

1. **View All Sensors**: Visit the home page to see the interactive map
2. **Quick Preview**: Hover over any sensor marker for current readings
3. **Overlay Dashboard**: Click a sensor marker to open side panel with charts
4. **Full Dashboard**: Click "Open Full Dashboard" or visit `/sensor/[sensorId]` directly
5. **Return to Map**: Click the back arrow on any sensor page

### Features by View

**Map View (`/`):**
- Interactive global map
- All sensors displayed
- Quick hover previews
- Click for overlay dashboard

**Sensor Detail Page (`/sensor/[sensorId]`):**
- Dedicated page for each sensor
- Current readings with icons
- Mini location map
- Full historical charts
- Auto-refresh every 30 seconds
- Shareable URL

## 🔒 Data Validation

The MQTT ingestion service validates all incoming readings:
- All required fields must be present
- pH: 0-14 range
- Turbidity: Non-negative
- Temperature: -50°C to 100°C
- Hardness: Non-negative

Invalid messages are logged and rejected.

## 📈 Performance Optimizations

- **Database Indexes**: Optimized queries with compound indexes
- **Caching**: Connection pooling for MongoDB
- **Efficient Querying**: Time-based filtering with indexed timestamps
- **Lazy Loading**: Dynamic imports for map components

## 🚧 Future Enhancements

- Water quality safety alerts
- Sensor offline detection
- Data export functionality (CSV, PDF)
- Predictive analytics using historical trends
- Real-time WebSocket streaming
- User authentication and access control
- Mobile app integration
- Alert notifications via email/SMS

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB status
mongosh --eval "db.runCommand({ ping: 1 })"
```

### MQTT Connection Issues
- Verify broker URL is correct
- Check network connectivity
- Ensure no firewall blocking port 1883

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/water_quality` |
| `MQTT_BROKER` | MQTT broker URL | `mqtt://broker.hivemq.com:1883` |
| `MQTT_TOPIC` | MQTT topic pattern | `sensors/water-quality/#` |

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on the repository.

---

Built with ❤️ using Next.js and MongoDB
