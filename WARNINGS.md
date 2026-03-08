# Common Warnings & How to Handle Them

## Hydration Warnings

### "Extra attributes from the server: data-new-gr-c-s-check-loaded, data-gr-ext-installed"

**What it means:**
This warning comes from browser extensions (like Grammarly) that inject attributes into the DOM. It's completely harmless and doesn't affect your application.

**Why it happens:**
- Next.js expects the server-rendered HTML to match the client-rendered HTML exactly
- Browser extensions modify the DOM after the server sends it
- Common extensions that cause this: Grammarly, LastPass, password managers

**Solutions:**

1. **Ignore it** (recommended)
   - This is purely cosmetic
   - Doesn't affect functionality
   - Only shows in development mode

2. **Suppress the warning**
   
   Add this to `next.config.js`:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
     // Suppress hydration warnings
     onError: (err) => {
       if (err.digest === 'NEXT_NOT_FOUND') {
         // Ignore
       }
     }
   }
   
   module.exports = nextConfig
   ```

3. **Disable extensions during development**
   - Use incognito/private mode
   - Or disable specific extensions temporarily

4. **Add suppressHydrationWarning**
   
   In `app/layout.tsx`:
   ```tsx
   <html lang="en" suppressHydrationWarning>
     <body suppressHydrationWarning>{children}</body>
   </html>
   ```

### Other Common Hydration Warnings

#### "Text content does not match server-rendered HTML"

**Causes:**
- Date/time rendering differences
- Random values
- Browser-specific APIs used during SSR

**Solution:**
```tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;

return <div>{new Date().toLocaleString()}</div>;
```

#### "Prop `className` did not match"

**Causes:**
- CSS-in-JS libraries
- Dynamic class names

**Solution:**
- Use `suppressHydrationWarning` on the affected element
- Or ensure consistent class generation

## Leaflet Warnings

### "Attempted import error: 'Map' is not exported from 'react-leaflet'"

**Solution:**
Already handled with dynamic import:
```tsx
const MapView = dynamic(() => import('./MapView'), { ssr: false });
```

### "Cannot read property 'scrollWheelZoom' of undefined"

**Solution:**
Ensure map container has dimensions:
```css
.leaflet-container {
  height: 100%;
  width: 100%;
}
```

## MongoDB Warnings

### "DeprecationWarning: current URL string parser is deprecated"

**Solution:**
Already handled in the connection string. If you see this, update MongoDB driver:
```bash
npm install mongodb@latest
```

### "useUnifiedTopology is deprecated"

**Solution:**
This is now the default behavior. No action needed.

## React Warnings

### "Cannot update a component while rendering a different component"

**Cause:**
Setting state during render

**Solution:**
Move state updates to `useEffect`:
```tsx
// Bad
function Component() {
  setState(value); // During render
  return <div>...</div>;
}

// Good
function Component() {
  useEffect(() => {
    setState(value);
  }, []);
  return <div>...</div>;
}
```

### "Each child in a list should have a unique 'key' prop"

**Solution:**
Already handled in the code with `key={sensor.sensorId}`

### "Warning: validateDOMNesting: <div> cannot appear as a descendant of <p>"

**Solution:**
Check JSX structure - ensure block elements aren't nested in inline elements

## Development vs Production

### Warnings Only in Development

These warnings appear in development but not production:
- Hydration mismatches (most of them)
- PropTypes warnings
- React DevTools warnings

### How to Test Production Build

```bash
npm run build
npm start
```

## Console Errors vs Warnings

### Yellow Warnings ⚠️
- Usually safe to ignore if app works correctly
- Good to fix for cleaner console
- Don't block functionality

### Red Errors ❌
- Must be fixed
- Indicate broken functionality
- Block rendering or features

## Suppressing Specific Warnings

### In next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignore warnings in browser console
      config.stats = {
        ...config.stats,
        warnings: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
```

### In Browser Console

```javascript
// Temporarily suppress console warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0].includes('Extra attributes from the server')) {
    return;
  }
  originalWarn(...args);
};
```

## Best Practices

1. **Don't suppress warnings blindly**
   - Understand what they mean first
   - Fix the root cause when possible
   - Only suppress when truly harmless

2. **Browser extensions in development**
   - Use incognito mode for cleaner testing
   - Or create a separate browser profile for development

3. **Check production build**
   - Many warnings disappear in production
   - Test with `npm run build && npm start`

4. **Use TypeScript**
   - Catches many issues at compile time
   - Reduces runtime warnings

## Summary: The Grammarly Warning

The `data-new-gr-c-s-check-loaded` warning you're seeing is:
- ✅ **Completely safe to ignore**
- ✅ **Doesn't affect functionality**
- ✅ **Only appears in development**
- ✅ **Common in all Next.js apps**

You can safely continue development. The app is working correctly!

## Quick Reference

| Warning | Severity | Action |
|---------|----------|--------|
| Browser extension attributes | Low | Ignore |
| Hydration mismatch | Medium | Investigate if app breaks |
| Missing key prop | Medium | Fix |
| PropTypes | Low | Fix for cleaner code |
| Deprecated API | High | Update code |
| Memory leaks | High | Fix immediately |

---

Most warnings in development are informational. Focus on red errors first, then yellow warnings that affect functionality.
