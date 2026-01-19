# Image Upload Setup - Backend Integration Complete ✅

## Architecture Overview

```
Frontend (Next.js)
    ↓
    POST /api/upload (Next.js proxy endpoint)
    ↓
Backend (Express on port 9000)
    ↓
    POST /api/upload/image (your controller)
    ↓
R2 Storage
    ↓
Returns secure URL → Frontend → Shows in Editor
```

## What's Set Up

### Frontend (`/app/api/upload/route.ts`)

- Receives file from editor
- Validates image type
- Converts file to buffer
- Calls your backend endpoint
- Returns URL to editor

### Backend (Your existing setup)

- **Route:** `routes/shared/upload.routes.js`
- **Controller:** `controllers/shared/upload.controller.js`
- Uses your `utils/r2.js` for R2 uploads
- Returns secure R2 URL

## Environment Configuration

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:9000
```

For production, update to your backend URL:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

## Testing the Setup

1. **Start your backend:**

   ```bash
   cd ../your-backend-project
   npm start
   # Should see: "port is listening on 9000"
   ```

2. **Start your frontend:**

   ```bash
   npm run dev
   # Should see: "ready - started server on 0.0.0.0:3000"
   ```

3. **Test image upload:**
   - Click image button in editor
   - Select an image from your device
   - Image should appear in editor
   - Check console for logs

## File Locations

### Frontend

- Upload utility: `utils/uploadImage.ts`
- API route: `app/api/upload/route.ts`
- Environment: `.env.local`

### Backend (Your project)

- Routes: `routes/shared/upload.routes.js`
- Controller: `controllers/shared/upload.controller.js`
- R2 Utils: `utils/r2.js`

## How Image Upload Works

1. User clicks image button in editor
2. File picker opens
3. User selects image
4. Frontend validates:
   - File type (must be image)
   - File size (max 5MB)
5. Frontend creates preview URL (instant display)
6. Frontend sends file to `/api/upload`
7. Next.js endpoint proxies to backend
8. Backend uploads to R2
9. R2 returns secure URL
10. Backend returns URL
11. Next.js returns URL to frontend
12. Frontend updates image in editor with R2 URL

## Error Handling

If upload fails:

- Frontend shows error alert
- Image remains visible with preview URL
- Check backend console for detailed errors
- Check CORS configuration in backend

## CORS Configuration

Your backend already has CORS configured:

```javascript
const allowedOrigins = [
  'http://localhost:3000', // ✅ Covers Next.js
  'http://localhost:3001',
  'http://localhost:3002',
];
```

This allows requests from your frontend.

## Next Steps

✅ Backend endpoint created
✅ Frontend proxy created
✅ Environment configured
✅ CORS enabled

Just make sure:

1. Backend is running on port 9000
2. Frontend has `NEXT_PUBLIC_API_URL=http://localhost:9000` in `.env.local`
3. Your R2 credentials are in backend `.env`

That's it! Upload should work seamlessly. 🎉
