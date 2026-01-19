# Debugging Image Upload - Step by Step

## Current Status

- Backend: Running on port 8080 ✅
- Frontend: Updated to use port 8080 ✅
- Environment: `.env.local` updated ✅

## Quick Checklist

### 1. Frontend Environment

Make sure `.env.local` has:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Verify by running in browser console:

```javascript
fetch(process.env.NEXT_PUBLIC_API_URL + '/api/upload/image');
```

### 2. Backend CORS Configuration

Your backend should allow localhost:3000:

```javascript
const allowedOrigins = [
  'http://localhost:3000', // ← This must be included
  'http://localhost:3001',
  'http://localhost:3002',
];

const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
```

### 3. Testing Steps

**Step 1: Test backend endpoint directly**

```bash
# In another terminal, test your backend upload endpoint
curl -X POST http://localhost:8080/api/upload/image \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

Expected: Should get a response (error about missing file is OK)

**Step 2: Check browser console**
When you try to upload an image, look for these logs:

```
Uploading to: http://localhost:8080/api/upload/image
File: [filename] [mimetype] [size]
Backend response status: [status code]
```

**Step 3: Check browser Network tab**

1. Open DevTools (F12)
2. Go to Network tab
3. Try uploading an image
4. Look for request to `POST /api/upload`
5. Click it and check:
   - Request URL
   - Request Headers (should have Content-Type: application/json)
   - Response (should show error or success)

### 4. Common Issues

**Issue: Frontend not making request**

- Env var not loaded? Try restarting: `npm run dev`
- Check console.log in `app/api/upload/route.ts` appears

**Issue: CORS error in browser**

```
Access to fetch at 'http://localhost:8080/...' has been blocked by CORS policy
```

Fix: Add to backend CORS:

```javascript
allowedOrigins.push('http://localhost:3000');
```

**Issue: 404 Not Found**

- Backend endpoint path wrong
- Should be: `POST /api/upload/image`
- Check your route file exists and is imported

**Issue: 500 Error from backend**

- Check backend console logs
- Verify `uploadToR2()` function working
- Check R2 credentials in backend `.env`

### 5. Debug Logs to Check

**Browser Console (F12 → Console):**

```
Starting upload for file: image.jpg
Uploading to: http://localhost:8080/api/upload/image
File: image.jpg image/jpeg 125000
Backend response status: 200
Image uploaded successfully: https://pub-xxx.r2.dev/...
```

**Backend Console:**

```
port is listening on 8080
```

(Should also show upload logs from your controller)

### 6. Full Flow Checklist

- [ ] Backend running on port 8080
- [ ] Frontend has `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8080`
- [ ] Frontend restarted after env change (`npm run dev`)
- [ ] Backend CORS allows `http://localhost:3000`
- [ ] Backend upload route exists: `POST /api/upload/image`
- [ ] Backend controller uses `uploadToR2()` function
- [ ] R2 credentials configured in backend `.env`

## If Still Not Working

1. **Check frontend terminal** for any error messages
2. **Check backend terminal** for request logs
3. **Open browser DevTools** (F12) and go to:
   - Console tab → Look for errors
   - Network tab → See requests being made
4. **Check .env.local** was saved correctly
5. **Restart frontend** - env vars need reload

## Manual Test

In browser console:

```javascript
// Should return the backend URL
console.log(process.env.NEXT_PUBLIC_API_URL);

// Try a request
fetch('http://localhost:8080/api/upload/image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: 'data' }),
})
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

If this works, the connection is fine. If CORS error, backend needs config fix.
