# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ MongoDB running locally or connection string ready
- ✅ npm or yarn package manager

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start MongoDB
```bash
# Choose your method:

# Docker (recommended for quick testing)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use local MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod           # Linux
net start MongoDB                      # Windows
```

### 3. Seed Database
```bash
node scripts/seedDatabase.js
```

You should see:
```
✓ Inserted 10 sensors
✓ Inserted 1680 readings
✅ Database seeded successfully!
```

### 4. Start the Application
```bash
npm run dev
```

Open http://localhost:3000 in your browser!

### 5. (Optional) Start MQTT Ingestion

In a new terminal:
```bash
npm run mqtt:start
```

### 6. (Optional) Simulate Live Data

In another terminal:
```bash
node scripts/simulateSensors.js
```

## What You Should See

1. **Map View**: Interactive world map with 10 sensor markers
2. **Hover**: Popup showing current water quality readings
3. **Click**: Detailed dashboard with charts for the past 7 days
4. **Live Updates**: Refresh button to get latest data

## Common Issues

### Port 3000 Already in Use
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### MongoDB Connection Error
Check if MongoDB is running:
```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

### Missing Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Explore the interactive map and click on different sensors
- Try different time ranges (Last Hour, Day, Week, Month)
- Check the code in `components/` and `app/api/`
- Modify sensor locations in `scripts/seedDatabase.js`
- Configure your own MQTT broker in `.env.local`

## Architecture Overview

```
┌─────────────┐      MQTT      ┌──────────────────┐
│   Sensors   │ ────────────> │  MQTT Ingestion  │
└─────────────┘               │     Service      │
                              └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │     MongoDB      │
                              └────────┬─────────┘
                                       │
                                       ▼
┌─────────────┐    REST API   ┌──────────────────┐
│   Browser   │ ◄──────────── │   Next.js App    │
└─────────────┘               └──────────────────┘
```

## API Testing

Test the APIs with curl:

```bash
# Get all sensors
curl http://localhost:3000/api/sensors

# Get readings for a sensor
curl "http://localhost:3000/api/readings?sensorId=SENSOR_NYC_001&timeRange=1d"
```

---

Happy monitoring! 🌊📊
