# Quick Fix for Database Error on Server

## The Error
```
ERROR:services.database:Error creating tables: [Errno -2] Name or service not known
```

This means the database hostname cannot be resolved because `DATABASE_URL` is not set.

## Quick Solution

### Step 1: Create .env file on your server

SSH into your server and run:

```bash
cd /www/wwwroot/neurolumina/backend
nano .env
```

### Step 2: Add your database URL

Paste this (replace with your actual database credentials):

```env
DATABASE_URL=postgresql://username:password@host:port/database
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET_KEY=your_secret_key_here
```

### Step 3: Example for Supabase

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
JWT_SECRET_KEY=change-this-to-random-string
```

### Step 4: Save and restart

1. Press `Ctrl+X` to exit
2. Press `Y` to save
3. Press `Enter` to confirm
4. Restart your application

## If You Don't Have a Database Yet

The application will now run **without** a database, but these features won't work:
- User authentication
- Blog posts
- Career listings
- Saving scraped content

**Web scraping and AI features will still work!**

## Get Database Credentials

### Option 1: Use Supabase (Free)
1. Go to https://supabase.com
2. Create a free account
3. Create a new project
4. Go to Settings → Database
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with your database password

### Option 2: Use Local PostgreSQL
If you have PostgreSQL installed on your server:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/llm_training
```

### Option 3: Use Other Cloud Databases
- **Neon**: https://neon.tech
- **Railway**: https://railway.app
- **Render**: https://render.com

## Get GROQ API Key

1. Go to https://console.groq.com
2. Sign up for free account
3. Create an API key
4. Copy the key (starts with `gsk_`)

## Generate JWT Secret Key

Run this on your server:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and use it as `JWT_SECRET_KEY`.

## Verify It Works

After restarting, test:
```bash
curl http://localhost:8000/health
```

Should return: `{"status": "healthy"}`

Test database:
```bash
curl http://localhost:8000/api/database/test
```

