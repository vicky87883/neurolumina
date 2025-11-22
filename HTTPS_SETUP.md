# HTTPS Setup for Backend API

## Problem
Your frontend is on HTTPS (`https://www.intellithesis.com`) but your backend API is on HTTP (`http://13.203.154.38:8000`). Browsers block mixed content (HTTPS page requesting HTTP resources) for security.

## Solution Options

### Option 1: Set up HTTPS for Backend API (Recommended)

#### Using Nginx Reverse Proxy with SSL

1. **Install Nginx and Certbot:**
   ```bash
   sudo apt update
   sudo apt install nginx certbot python3-certbot-nginx
   ```

2. **Create Nginx Configuration:**
   ```bash
   sudo nano /etc/nginx/sites-available/api.intellithesis.com
   ```

3. **Add this configuration:**
   ```nginx
   server {
       listen 80;
       server_name api.intellithesis.com;
       
       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/api.intellithesis.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **Get SSL Certificate:**
   ```bash
   sudo certbot --nginx -d api.intellithesis.com
   ```

6. **Update Frontend Environment Variable:**
   ```bash
   # In frontend/.env.local or deployment settings
   NEXT_PUBLIC_API_URL=https://api.intellithesis.com
   ```

### Option 2: Use Same Domain with Path (Simpler)

If you want to use the same domain:

1. **Nginx Configuration:**
   ```nginx
   server {
       listen 443 ssl;
       server_name www.intellithesis.com;
       
       # Your existing frontend configuration
       
       # API proxy
       location /api {
           proxy_pass http://127.0.0.1:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

2. **Update Frontend API URL:**
   ```typescript
   const API_BASE_URL = '/api';  // Relative path
   ```

### Option 3: Quick Fix - Use Environment Variable

For now, you can set the API URL via environment variable in your frontend deployment:

**In your frontend deployment (Vercel/Netlify/etc):**
```
NEXT_PUBLIC_API_URL=https://api.intellithesis.com
```

Or if using the same domain:
```
NEXT_PUBLIC_API_URL=https://www.intellithesis.com/api
```

## Current Frontend Code

The frontend code has been updated to automatically detect HTTPS and use HTTPS for the API. However, you still need to:

1. **Set up HTTPS for your backend** (Option 1 or 2 above)
2. **Or set the environment variable** `NEXT_PUBLIC_API_URL` to your HTTPS API URL

## Testing

After setting up HTTPS:

1. **Test API endpoint:**
   ```bash
   curl https://api.intellithesis.com/health
   ```

2. **Update CORS in backend** to include your HTTPS domain:
   ```python
   cors_origins = os.getenv("CORS_ORIGINS", "https://www.intellithesis.com,https://intellithesis.com").split(",")
   ```

## Quick Temporary Fix

If you need a quick fix while setting up HTTPS, you can temporarily allow mixed content (NOT RECOMMENDED for production):

Add this meta tag to your frontend (only for testing):
```html
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
```

But the proper solution is to set up HTTPS for your backend API.

