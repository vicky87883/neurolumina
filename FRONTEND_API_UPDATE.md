# Frontend API Configuration Update

## ✅ Changes Made

All frontend API endpoints have been updated to use your live backend server:

**Backend URL:** `http://13.203.154.38:8000`

### Files Updated:

1. ✅ `frontend/lib/api.ts` - Main API configuration
2. ✅ `frontend/app/admin/dashboard/page.tsx` - Admin dashboard
3. ✅ `frontend/app/admin/page.tsx` - Admin login
4. ✅ `frontend/components/WebScraper.tsx` - Web scraper component
5. ✅ `backend/app.py` - CORS settings updated

## 🔧 Configuration

### Frontend API Base URL

The frontend now uses:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.203.154.38:8000';
```

### Using Environment Variables (Recommended)

For production, create a `.env.local` file in the frontend directory:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://13.203.154.38:8000
```

Or if you have a domain:
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Backend CORS Settings

The backend CORS has been updated to allow requests from:
- `http://localhost:3000` (local development)
- `http://127.0.0.1:3000` (local development)
- `http://13.203.154.38:3000` (your frontend server)

You can also set `CORS_ORIGINS` environment variable in backend `.env`:
```bash
CORS_ORIGINS=http://localhost:3000,http://13.203.154.38:3000,https://yourdomain.com
```

## 🚀 Next Steps

1. **Rebuild Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Update Backend CORS (if needed):**
   If your frontend is on a different domain/IP, update the CORS origins in `backend/app.py` or set `CORS_ORIGINS` in backend `.env`

3. **Test the Connection:**
   - Sign up a new user
   - Login
   - Test other features

## 📝 API Endpoints Now Pointing to Live Backend

All these endpoints now use `http://13.203.154.38:8000`:

- ✅ `/api/auth/signup` - User signup
- ✅ `/api/auth/login` - User login
- ✅ `/api/auth/me` - Get current user
- ✅ `/api/chat/` - Chat with AI
- ✅ `/api/training/*` - Training endpoints
- ✅ `/api/scraping/*` - Web scraping
- ✅ `/api/plagiarism/*` - Plagiarism detection
- ✅ `/api/blogs/*` - Blog management
- ✅ `/api/careers/*` - Career listings
- ✅ `/api/admin/*` - Admin endpoints

## 🔒 Security Notes

1. **For Production:** 
   - Use HTTPS for both frontend and backend
   - Restrict CORS origins to your actual frontend domain
   - Use environment variables instead of hardcoded URLs

2. **Update CORS Origins:**
   When deploying frontend, update backend CORS to include your frontend domain:
   ```python
   allow_origins=[
       "https://yourdomain.com",
       "https://www.yourdomain.com",
   ]
   ```

## 🧪 Testing

After deployment, test these endpoints:
1. Sign up: `POST /api/auth/signup`
2. Login: `POST /api/auth/login`
3. Health check: `GET /health`

All should now connect to your live backend at `http://13.203.154.38:8000`

