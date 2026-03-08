# Troubleshooting Guide

## Map Not Displaying

### Issue: Blank screen or "rendering map" in console but no map

**Solutions:**

1. **Clear Next.js cache and rebuild**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Verify Leaflet CSS is loaded**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Refresh page
   - Look for `leaflet.css` being loaded
   - If missing, ensure `app/globals.css` has: `@import 'leaflet/dist/leaflet.css';`

3. **Check browser console for errors**
   - Press F12 to open DevTools
   - Check Console tab for JavaScript errors
   - Common errors:
     - `window is not defined` → Leaflet trying to run on server
     - `Cannot read property 'map'` → CSS not loaded

4. **Verify the map container has dimensions**
   - The parent container must have explicit height
   - Check: `.flex-1` class should give the container full height
   - Try adding explicit height: `style={{ height: '600px' }}`

### Issue: Map displays but markers don't show

**Solutions:**

1. **Check if sensors have data**
   ```bash
   # Run in browser console
   fetch('/api/sensors').then(r => r.json()).then(console.log)
   ```

2. **Verify database has sensors**
   ```bash
   node scripts/seedDatabase.js
   ```

3. **Check marker icon URLs**
   - Icons load from CDN
   - Verify network connection
   - Check browser console for 404 errors on marker images

## MongoDB Connection Issues

### Issue: Cannot connect to MongoDB

**Solutions:**

1. **Check if MongoDB is running**
   ```bash
   # macOS
   brew services list
   brew services start mongodb-community
   
   # Linux
   sudo systemctl status mongod
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

2. **Test MongoDB connection**
   ```bash
   mongosh
   # or
   mongo
   ```

3. **Verify connection string in .env.local**
   ```env
   MONGODB_URI=mongodb://localhost:27017/water_quality
   ```

4. **Check MongoDB logs**
   ```bash
   # macOS
   tail -f /usr/local/var/log/mongodb/mongo.log
   
   # Linux
   sudo tail -f /var/log/mongodb/mongod.log
   ```

### Issue: "MongoServerError: command find requires authentication"

**Solution:**
If your MongoDB requires authentication, update `.env.local`:
```env
MONGODB_URI=mongodb://username:password@localhost:27017/water_quality
```

## API Errors

### Issue: 404 on API routes

**Solutions:**

1. **Verify Next.js is running**
   ```bash
   npm run dev
   ```

2. **Check API route exists**
   - Should be in `app/api/sensors/route.ts`
   - Should be in `app/api/readings/route.ts`

3. **Check browser console for exact error**

### Issue: 500 Internal Server Error

**Solutions:**

1. **Check Next.js terminal for error stack trace**

2. **Common causes:**
   - MongoDB not running
   - Database not seeded
   - Invalid query parameters

3. **Test API directly**
   ```bash
   curl http://localhost:3000/api/sensors
   ```

## MQTT Issues

### Issue: MQTT ingestion service won't start

**Solutions:**

1. **Check Node.js version**
   ```bash
   node --version  # Should be 18+
   ```

2. **Install mqtt package**
   ```bash
   npm install mqtt
   ```

3. **Check .env.local configuration**
   ```env
   MQTT_BROKER=mqtt://broker.hivemq.com:1883
   MQTT_TOPIC=sensors/water-quality/#
   ```

4. **Test MQTT broker connection**
   - Try public broker: `mqtt://broker.hivemq.com:1883`
   - Check if firewall blocks port 1883

### Issue: No sensor data being ingested

**Solutions:**

1. **Start the sensor simulator**
   ```bash
   node scripts/simulateSensors.js
   ```

2. **Check MQTT service logs**
   - Look for "✓ Connected to MQTT broker"
   - Look for "✓ Stored reading" messages

3. **Verify data is being written to MongoDB**
   ```bash
   mongosh water_quality
   db.readings.count()
   db.readings.find().limit(5)
   ```

## Build Errors

### Issue: TypeScript errors during build

**Solutions:**

1. **Clear TypeScript cache**
   ```bash
   rm -rf node_modules/.cache
   ```

2. **Reinstall dependencies**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check TypeScript version**
   ```bash
   npm list typescript
   ```

### Issue: "Module not found" errors

**Solutions:**

1. **Install missing dependencies**
   ```bash
   npm install
   ```

2. **Check imports use correct paths**
   - Use `@/` for project root imports
   - Example: `import { getDatabase } from '@/lib/mongodb'`

## Performance Issues

### Issue: Map is slow or laggy

**Solutions:**

1. **Reduce number of sensors**
   - Edit `scripts/seedDatabase.js`
   - Remove some sensors from the array

2. **Add marker clustering**
   - Install: `npm install react-leaflet-cluster`
   - Implement clustering for better performance

3. **Optimize time range queries**
   - Use shorter time ranges (1h instead of 1m)
   - Limit number of data points in charts

### Issue: Charts loading slowly

**Solutions:**

1. **Check database indexes**
   ```javascript
   // In MongoDB shell
   db.readings.getIndexes()
   ```

2. **Reduce data points**
   - Aggregate data by intervals
   - Sample every Nth point

## Development Issues

### Issue: Hot reload not working

**Solutions:**

1. **Restart development server**
   ```bash
   # Kill process
   lsof -ti:3000 | xargs kill -9
   
   # Start again
   npm run dev
   ```

2. **Clear Next.js cache**
   ```bash
   rm -rf .next
   ```

### Issue: Port 3000 already in use

**Solutions:**

1. **Kill process on port 3000**
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **Use different port**
   ```bash
   PORT=3001 npm run dev
   ```

## Browser-Specific Issues

### Issue: Map works in Chrome but not Safari

**Solution:**
- Safari has stricter security policies
- Ensure all resources load over HTTPS in production
- Check Safari console for specific errors

### Issue: Leaflet styles not loading in Firefox

**Solution:**
- Clear Firefox cache
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

## Production Deployment Issues

### Issue: Map doesn't work after deployment

**Solutions:**

1. **Check environment variables are set**
   - Verify `MONGODB_URI` in production
   - Verify MQTT broker is accessible

2. **Check build logs for errors**
   ```bash
   npm run build
   ```

3. **Verify dynamic imports work**
   - Map component uses `dynamic` import
   - Ensure `ssr: false` option is present

## Getting Help

If you're still stuck:

1. **Check browser console** (F12 → Console tab)
2. **Check server logs** (terminal running `npm run dev`)
3. **Check MongoDB logs**
4. **Check MQTT service logs**

### Useful Commands

```bash
# View all logs
npm run dev | tee logs.txt

# Test MongoDB
mongosh water_quality --eval "db.sensors.count()"

# Test API
curl http://localhost:3000/api/sensors | jq

# Check ports
lsof -i :3000
lsof -i :27017
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `window is not defined` | Leaflet SSR issue | Use dynamic import with `ssr: false` |
| `MongoServerError` | MongoDB issue | Check MongoDB is running |
| `ECONNREFUSED` | Service not running | Start the required service |
| `Module not found` | Missing dependency | Run `npm install` |
| `Port in use` | Port already taken | Kill process or use different port |

---

Still having issues? Check the GitHub Issues or create a new issue with:
- Error message
- Browser console logs
- Server logs
- Steps to reproduce
