# Routing Guide

## Application Routes

### Main Routes

| Route | Description | Features |
|-------|-------------|----------|
| `/` | Home page with interactive map | View all sensors, click for overlay dashboard |
| `/sensor/[sensorId]` | Individual sensor detail page | Full dashboard, current readings, mini map |

### Examples

```
http://localhost:3000/                        # Map view
http://localhost:3000/sensor/SENSOR_NYC_001   # NYC sensor
http://localhost:3000/sensor/SENSOR_LON_001   # London sensor
http://localhost:3000/sensor/SENSOR_TKY_001   # Tokyo sensor
```

## Navigation Flow

### From Map to Sensor Detail

```
User Flow:
1. Visit homepage (/)
2. Click sensor marker on map
3. Side panel opens with quick dashboard
4. Click "Open Full Dashboard" button
5. Navigate to /sensor/[sensorId]
```

### Direct Access

Users can directly access any sensor page:
```
http://localhost:3000/sensor/SENSOR_NYC_001
```

This is useful for:
- Bookmarking favorite sensors
- Sharing specific sensor data
- Direct links in reports or emails
- Deep linking from other applications

### Return to Map

On any sensor detail page:
- Click the back arrow (←) in the header
- Returns to the map view

## URL Structure

### Sensor ID Pattern

Sensor IDs follow this format: `SENSOR_[LOCATION]_[NUMBER]`

Examples:
- `SENSOR_NYC_001` - New York City, sensor #1
- `SENSOR_LON_001` - London, sensor #1
- `SENSOR_TKY_001` - Tokyo, sensor #1

### Query Parameters

Currently not used, but can be added for:
- Time range: `?range=1w`
- Metric focus: `?metric=pH`
- Date filters: `?start=2024-01-01&end=2024-01-31`

## API Routes

### Get All Sensors
```
GET /api/sensors
```

Returns all sensors with their latest readings.

**Response:**
```json
[
  {
    "sensorId": "SENSOR_NYC_001",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "locationName": "New York City, USA",
    "installedAt": "2020-01-15T00:00:00.000Z",
    "latestReading": {
      "pH": 7.2,
      "turbidity": 3.5,
      "temperature": 22.1,
      "hardness": 150.0,
      "timestamp": "2024-02-16T10:30:00.000Z"
    }
  }
]
```

### Get Sensor Readings
```
GET /api/readings?sensorId=SENSOR_NYC_001&timeRange=1d
```

**Query Parameters:**
- `sensorId` (required): Sensor identifier
- `timeRange`: `1h`, `1d`, `1w`, `1m` (default: `1d`)
- `startDate`: ISO date string (for custom range)
- `endDate`: ISO date string (for custom range)

**Response:**
```json
[
  {
    "sensorId": "SENSOR_NYC_001",
    "timestamp": "2024-02-16T10:30:00.000Z",
    "pH": 7.2,
    "turbidity": 3.5,
    "temperature": 22.1,
    "hardness": 150.0
  }
]
```

## Route Generation

### Static Routes
- `/` - Always available
- `/api/sensors` - API endpoint
- `/api/readings` - API endpoint

### Dynamic Routes
- `/sensor/[sensorId]` - Generated for each sensor in database

### 404 Handling

If a sensor doesn't exist:
```
http://localhost:3000/sensor/INVALID_SENSOR
```

Shows a custom 404 page with:
- "Sensor Not Found" message
- Link back to map view

## Programmatic Navigation

### Using Next.js Link Component

```tsx
import Link from 'next/link';

<Link href={`/sensor/${sensorId}`}>
  View Sensor
</Link>
```

### Using useRouter Hook

```tsx
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push(`/sensor/${sensorId}`);
```

### Using Browser API

```javascript
window.location.href = `/sensor/${sensorId}`;
```

## SEO & Metadata

Each sensor page has dynamic metadata:

```tsx
// Generates:
<title>New York City, USA - Water Quality Monitor</title>
<meta name="description" content="View real-time water quality data..." />
```

This improves:
- Search engine indexing
- Social media sharing
- Browser tab titles
- Bookmark descriptions

## Deployment Considerations

### Environment Variables

For production, set:
```env
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

This ensures API calls work correctly when fetching sensor data.

### Vercel Deployment

Routes work automatically. Dynamic routes are:
- Pre-rendered at build time (if using Static Generation)
- Or rendered on-demand (Server-Side Rendering)

### Custom Domain

If deploying to custom domain:
```
https://water-quality.example.com/
https://water-quality.example.com/sensor/SENSOR_NYC_001
```

## Mobile Considerations

All routes are:
- ✅ Fully responsive
- ✅ Touch-friendly
- ✅ Mobile-optimized
- ✅ Work with mobile browsers

## Future Enhancements

### Potential New Routes

1. **Sensor Comparison**
   ```
   /compare?sensors=SENSOR_NYC_001,SENSOR_LON_001
   ```

2. **Analytics Dashboard**
   ```
   /analytics
   ```

3. **Admin Panel**
   ```
   /admin/sensors
   /admin/readings
   ```

4. **Export/Reports**
   ```
   /sensor/SENSOR_NYC_001/export
   /reports
   ```

5. **User Authentication**
   ```
   /login
   /dashboard
   /profile
   ```

### Query Parameter Options

Future query parameters for sensor pages:
```
/sensor/SENSOR_NYC_001?range=1w          # Time range
/sensor/SENSOR_NYC_001?metric=pH         # Focus on specific metric
/sensor/SENSOR_NYC_001?compare=true      # Compare with other sensors
/sensor/SENSOR_NYC_001?export=csv        # Export data
```

## Testing Routes

### Development
```bash
npm run dev

# Test routes:
open http://localhost:3000
open http://localhost:3000/sensor/SENSOR_NYC_001
```

### Production Build
```bash
npm run build
npm start

# All routes should work identically
```

### Using curl
```bash
# Test API
curl http://localhost:3000/api/sensors | jq

# Test specific sensor API
curl "http://localhost:3000/api/readings?sensorId=SENSOR_NYC_001&timeRange=1d" | jq
```

---

## Quick Reference

**Map View:** `/`  
**Sensor Detail:** `/sensor/[sensorId]`  
**Sensors API:** `/api/sensors`  
**Readings API:** `/api/readings?sensorId=XXX`

All routes are fast, SEO-friendly, and mobile-responsive! 🚀
