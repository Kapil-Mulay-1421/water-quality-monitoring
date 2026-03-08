# System Architecture

## Overview

The Water Quality Monitoring System follows a modern full-stack architecture using Next.js for both frontend and backend, MongoDB for data persistence, and MQTT for real-time sensor data ingestion.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js Frontend (React 18)                  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • SensorMap Component (Leaflet.js)                       │  │
│  │  • Dashboard with Charts (Recharts)                       │  │
│  │  • Real-time Updates (Polling)                            │  │
│  │  • Responsive UI (Tailwind CSS)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               ▲                                  │
│                               │ HTTP/REST                        │
│                               ▼                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Next.js API Routes (Node.js)                    │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  GET  /api/sensors        - List all sensors              │  │
│  │  POST /api/sensors        - Create new sensor             │  │
│  │  GET  /api/readings       - Get historical readings       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               ▲                                  │
│                               │                                  │
│                               ▼                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     MongoDB Database                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • sensors collection                                     │  │
│  │    - sensorId (indexed)                                   │  │
│  │    - location (2dsphere index)                            │  │
│  │                                                            │  │
│  │  • readings collection                                    │  │
│  │    - sensorId + timestamp (compound index)                │  │
│  │    - timestamp (indexed for queries)                      │  │
│  │                                                            │  │
│  │  Retention: 5 years                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               ▲                                  │
└───────────────────────────────┼──────────────────────────────────┘
                                │
┌───────────────────────────────┼──────────────────────────────────┐
│                        INGESTION LAYER                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            MQTT Ingestion Service (Node.js)               │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • Subscribe to MQTT topics                               │  │
│  │  • Validate incoming readings                             │  │
│  │  • Store in MongoDB                                       │  │
│  │  • Error handling & logging                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               ▲                                  │
│                               │ MQTT Protocol                    │
│                               │                                  │
└───────────────────────────────┼──────────────────────────────────┘
                                │
┌───────────────────────────────┼──────────────────────────────────┐
│                         SENSOR LAYER                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Sensor 1   │  │  Sensor 2   │  │  Sensor N   │             │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤             │
│  │ • pH        │  │ • pH        │  │ • pH        │             │
│  │ • Turbidity │  │ • Turbidity │  │ • Turbidity │             │
│  │ • Temp      │  │ • Temp      │  │ • Temp      │             │
│  │ • Hardness  │  │ • Hardness  │  │ • Hardness  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                   │
│  Fixed geographic locations                                      │
│  Random transmission intervals                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend (React/Next.js)

**Key Components:**
- `SensorMap`: Main container component managing state
- `MapView`: Leaflet.js integration for interactive mapping
- `SensorDashboard`: Charts and statistics display

**Features:**
- Interactive global map with zoomable interface
- Marker clustering for performance
- Real-time data updates (30-second polling)
- Responsive design for mobile/desktop
- Time-series visualization with Recharts

**State Management:**
- React hooks (useState, useEffect)
- Local component state
- No Redux/Context needed (simple state)

### 2. API Layer (Next.js API Routes)

**Endpoints:**

```typescript
GET /api/sensors
Response: SensorWithLatestReading[]
- Returns all sensors with their most recent reading
- Efficient aggregation using MongoDB pipelines

GET /api/readings?sensorId=XXX&timeRange=1d
Response: Reading[]
- Time-filtered readings for a specific sensor
- Supports: 1h, 1d, 1w, 1m, custom ranges
- Optimized queries with indexed timestamps

POST /api/sensors
Request: { sensorId, latitude, longitude, locationName? }
Response: Sensor
- Create new sensor record
- Auto-generates installedAt timestamp
```

**Features:**
- RESTful design
- Input validation
- Error handling with proper status codes
- Connection pooling for MongoDB

### 3. MQTT Ingestion Service

**Responsibilities:**
- Subscribe to MQTT broker topics
- Parse and validate incoming JSON messages
- Store validated readings in MongoDB
- Log invalid/malformed messages
- Handle connection failures gracefully

**Data Validation:**
```javascript
{
  sensorId: required,
  timestamp: required (ISO date),
  pH: 0-14,
  turbidity: >= 0,
  temperature: -50 to 100°C,
  hardness: >= 0
}
```

**Error Handling:**
- Retry logic for MongoDB failures
- Graceful reconnection to MQTT broker
- Detailed error logging

### 4. Database (MongoDB)

**Collections:**

**sensors:**
```javascript
{
  _id: ObjectId,
  sensorId: "SENSOR_XXX_001",
  latitude: 40.7128,
  longitude: -74.0060,
  locationName: "New York City",
  installedAt: ISODate("2020-01-15")
}
```

Indexes:
- `{ sensorId: 1 }` - Unique index for lookups
- `{ location: "2dsphere" }` - Geospatial queries

**readings:**
```javascript
{
  _id: ObjectId,
  sensorId: "SENSOR_XXX_001",
  timestamp: ISODate("2024-02-16T10:30:00Z"),
  pH: 7.2,
  turbidity: 3.5,
  temperature: 22.1,
  hardness: 150.0
}
```

Indexes:
- `{ sensorId: 1, timestamp: -1 }` - Compound index for sensor queries
- `{ timestamp: -1 }` - Time-based filtering

**Retention Policy:**
- TTL index for 5-year retention (future implementation)
- Archive strategy for historical data

## Data Flow

### 1. Sensor Reading Flow

```
Sensor Device
    │
    │ MQTT Publish
    ▼
MQTT Broker (HiveMQ)
    │
    │ Subscribe
    ▼
Ingestion Service
    │
    │ Validate
    ▼
MongoDB (readings)
    │
    │ Query (via API)
    ▼
Next.js Frontend
    │
    │ Render
    ▼
User Browser
```

### 2. User Query Flow

```
User clicks sensor
    │
    ▼
Frontend fetches data
    │
    ▼
API Route handler
    │
    ▼
MongoDB query
    │
    ▼
Data aggregation
    │
    ▼
JSON response
    │
    ▼
Chart rendering
```

## Scalability Considerations

### Current Scale
- 10-100 sensors: Easily handled
- 1 reading/sensor/hour: ~240 readings/day per sensor
- 5 years retention: ~440K readings per sensor

### Scaling Strategies

**Horizontal Scaling:**
- Multiple MQTT ingestion workers
- Load balancer for Next.js instances
- MongoDB replica sets

**Vertical Scaling:**
- Increased server resources
- MongoDB sharding by sensorId
- Redis caching layer

**Optimization:**
- Data aggregation pre-computation
- CDN for static assets
- Query result caching

## Security Considerations

**Current Status (Development):**
- No authentication (as per PRD requirements)
- Public MQTT broker
- Open API endpoints

**Production Recommendations:**
- JWT authentication for APIs
- MQTT broker with TLS/SSL
- Role-based access control
- API rate limiting
- Input sanitization
- Environment variable protection

## Monitoring & Observability

**Recommended Tools:**
- Application logs (Winston/Pino)
- MongoDB Atlas monitoring
- MQTT broker metrics
- Error tracking (Sentry)
- Performance monitoring (New Relic)

**Key Metrics:**
- Sensor uptime
- Reading ingestion rate
- API response times
- Database query performance
- Error rates

## Technology Choices Rationale

| Technology | Reason |
|-----------|--------|
| Next.js | Full-stack framework, API routes, SSR/SSG |
| MongoDB | Flexible schema, time-series data, geospatial queries |
| MQTT | Lightweight, efficient for IoT, publish-subscribe |
| Leaflet | Open-source, customizable mapping |
| Recharts | React-friendly, responsive charts |
| TypeScript | Type safety, better developer experience |

## Future Enhancements

1. **Real-time Updates**: WebSocket integration
2. **Advanced Analytics**: ML-based anomaly detection
3. **Alerting System**: Email/SMS notifications
4. **Data Export**: CSV/PDF generation
5. **Mobile App**: React Native implementation
6. **Admin Panel**: Sensor management interface
7. **Authentication**: User accounts and permissions
8. **Caching Layer**: Redis for frequently accessed data

---

This architecture supports the current requirements while providing a foundation for future enhancements and scale.
