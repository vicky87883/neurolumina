# Online PostgreSQL Database Setup Guide

## Overview
This guide shows you how to connect NeuroLumina AI platform to various online PostgreSQL database services. Online databases are perfect for production deployments and allow access from anywhere.

## Popular Online PostgreSQL Providers

1. **Supabase** (Recommended for beginners) - Free tier available
2. **Neon** (Serverless PostgreSQL) - Free tier available
3. **Railway** - Simple deployment, free tier
4. **Render** - Free tier available
5. **AWS RDS** - Enterprise-grade
6. **Google Cloud SQL** - Enterprise-grade
7. **Heroku Postgres** - Simple but limited free tier
8. **DigitalOcean Managed Databases** - Good pricing

---

## Option 1: Supabase (Recommended - Easiest)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Create a new project

### Step 2: Create Database
1. Click "New Project"
2. Fill in:
   - **Project Name**: neurolumina-ai (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (or Paid for production)
3. Click "Create new project"
4. Wait 2-3 minutes for database setup

### Step 3: Get Connection String
1. Go to **Settings** → **Database**
2. Scroll to **Connection string** section
3. Copy the **URI** connection string
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`
4. Replace `[YOUR-PASSWORD]` with your actual password

### Step 4: Configure Your App
1. Open `backend/.env` file
2. Add/update the following lines (replace with your actual connection string):
   ```
   DATABASE_URL=postgresql://postgres:your_password@db.xxx.supabase.co:5432/postgres
   ASYNC_DATABASE_URL=postgresql+asyncpg://postgres:your_password@db.xxx.supabase.co:5432/postgres
   ```
3. Save the file

### Step 5: Enable Remote Connections
- Supabase allows connections by default
- No additional configuration needed

### Step 6: Test Connection
```bash
cd backend
source venv/bin/activate
python -c "from services.database import db_manager; import asyncio; asyncio.run(db_manager.test_connection())"
```

### Supabase Free Tier Limits:
- 500 MB database size
- 2 GB bandwidth
- Unlimited API requests
- Up to 2 projects

---

## Option 2: Neon (Serverless PostgreSQL)

### Step 1: Create Neon Account
1. Go to https://neon.tech
2. Click "Sign Up"
3. Sign up with GitHub or email
4. Create a new project

### Step 2: Create Database
1. After signup, you'll see your project dashboard
2. Click "Create project"
3. Fill in:
   - **Project Name**: neurolumina-ai
   - **Region**: Choose closest
   - **PostgreSQL Version**: 15 (recommended)
4. Click "Create Project"

### Step 3: Get Connection String
1. In project dashboard, go to **Connection Details**
2. Copy the **Connection string**
   - Format: `postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb`
3. Copy the connection string exactly

### Step 4: Configure Your App
1. Open `backend/.env` file
2. Add/update:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb
   ASYNC_DATABASE_URL=postgresql+asyncpg://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb
   ```
3. Save the file

### Step 5: Enable Pooling (Optional but Recommended)
Neon supports connection pooling. Use pooler connection string:
```
DATABASE_URL=postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

### Neon Free Tier Limits:
- 3 GB storage
- Unlimited compute (with auto-suspend)
- Branching feature
- 512 MB RAM

---

## Option 3: Railway

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Click "Login"
3. Sign up with GitHub
4. Authorize Railway app

### Step 2: Create PostgreSQL Database
1. Click "New Project"
2. Click "Provision PostgreSQL"
3. Wait for database creation (30 seconds)
4. Database will auto-create

### Step 3: Get Connection String
1. Click on the PostgreSQL service
2. Go to **Variables** tab
3. Find **DATABASE_URL** variable
4. Click to reveal and copy the connection string
   - Format: `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`

### Step 4: Configure Your App
1. Open `backend/.env` file
2. Add/update:
   ```
   DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
   ASYNC_DATABASE_URL=postgresql+asyncpg://postgres:password@containers-us-west-xxx.railway.app:5432/railway
   ```
3. Save the file

### Railway Free Tier:
- $5 credit monthly (free tier ended, but cheap pricing)
- Pay-as-you-go after credit

---

## Option 4: Render

### Step 1: Create Render Account
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub or email

### Step 2: Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Fill in:
   - **Name**: neurolumina-db
   - **Database**: neurolumina
   - **User**: neurolumina_user (auto-generated)
   - **Region**: Choose closest
   - **PostgreSQL Version**: 15
   - **Plan**: Free (or Paid)
3. Click "Create Database"
4. Wait 2-3 minutes

### Step 3: Get Connection String
1. Go to your database dashboard
2. Find **Internal Database URL** or **External Database URL**
3. Copy the connection string
   - Format: `postgresql://user:password@dpg-xxx-xxx.oregon-postgres.render.com/dbname`

### Step 4: Configure Your App
1. Open `backend/.env` file
2. Add/update:
   ```
   DATABASE_URL=postgresql://user:password@dpg-xxx-xxx.oregon-postgres.render.com/dbname
   ASYNC_DATABASE_URL=postgresql+asyncpg://user:password@dpg-xxx-xxx.oregon-postgres.render.com/dbname
   ```
3. Save the file

### Render Free Tier Limits:
- 90 days free trial
- 1 GB storage
- Then $7/month

---

## Option 5: AWS RDS (Enterprise)

### Step 1: Create AWS Account
1. Go to https://aws.amazon.com
2. Create account (credit card required)
3. Complete account verification

### Step 2: Create RDS Database
1. Go to AWS Console → RDS
2. Click "Create database"
3. Select:
   - **Engine**: PostgreSQL
   - **Version**: 15.x
   - **Template**: Free tier (if eligible)
   - **DB Instance Identifier**: neurolumina-db
   - **Master Username**: admin
   - **Master Password**: (create strong password)
   - **DB Instance Class**: db.t3.micro (free tier)
   - **Storage**: 20 GB (free tier)
4. Configure:
   - **VPC**: Default VPC
   - **Publicly Accessible**: Yes (for external access)
   - **Security Group**: Allow PostgreSQL (port 5432) from your IP
5. Click "Create database"
6. Wait 5-10 minutes

### Step 3: Get Connection String
1. Go to RDS → Databases
2. Click on your database
3. Find **Endpoint** and **Port**
4. Connection string format:
   ```
   postgresql://admin:password@endpoint.region.rds.amazonaws.com:5432/postgres
   ```

### Step 4: Configure Security Group
1. Go to EC2 → Security Groups
2. Find security group for your RDS instance
3. Edit **Inbound Rules**
4. Add rule:
   - **Type**: PostgreSQL
   - **Port**: 5432
   - **Source**: Your IP address (or 0.0.0.0/0 for testing only)

### Step 5: Configure Your App
1. Open `backend/.env` file
2. Add/update:
   ```
   DATABASE_URL=postgresql://admin:password@endpoint.region.rds.amazonaws.com:5432/postgres
   ASYNC_DATABASE_URL=postgresql+asyncpg://admin:password@endpoint.region.rds.amazonaws.com:5432/postgres
   ```
3. Save the file

### AWS Free Tier:
- 750 hours/month for 12 months
- 20 GB storage
- After free tier: Pay-as-you-go

---

## Option 6: Google Cloud SQL

### Step 1: Create GCP Account
1. Go to https://cloud.google.com
2. Create account (free $300 credit)
3. Create new project

### Step 2: Enable Cloud SQL API
1. Go to APIs & Services
2. Enable "Cloud SQL Admin API"

### Step 3: Create Cloud SQL Instance
1. Go to SQL → Create Instance
2. Select PostgreSQL
3. Fill in:
   - **Instance ID**: neurolumina-db
   - **Password**: Create strong password
   - **Region**: Choose closest
   - **Database Version**: PostgreSQL 15
4. Configure:
   - **Machine Type**: Shared Core (for free tier testing)
   - **Storage**: 10 GB
   - **Enable Public IP**: Yes
5. Click "Create"
6. Wait 5-10 minutes

### Step 4: Authorize Networks
1. Go to Connections → Networking
2. Add authorized network: Your IP address (0.0.0.0/0 for testing)
3. Save

### Step 5: Get Connection String
1. Go to Overview
2. Find **Public IP address**
3. Connection string:
   ```
   postgresql://postgres:password@public-ip:5432/postgres
   ```

### Step 6: Configure Your App
Same as other options - update `.env` file

---

## General Setup Steps (After Choosing Provider)

### Step 1: Update .env File
```env
# Replace with your connection string from chosen provider
DATABASE_URL=postgresql://user:password@host:port/database

# For async operations (auto-generated from DATABASE_URL)
ASYNC_DATABASE_URL=postgresql+asyncpg://user:password@host:port/database
```

### Step 2: Install Dependencies
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Step 3: Test Connection
```bash
# Method 1: Using Python
python -c "from services.database import db_manager; import asyncio; print(asyncio.run(db_manager.test_connection()))"

# Method 2: Using curl (after starting server)
curl http://localhost:8000/api/database/test
```

### Step 4: Start Your Server
```bash
uvicorn app:app --reload --port 8000
```

The application will automatically:
- Connect to your online database
- Create tables if they don't exist
- Be ready to use!

---

## Connection String Format Guide

### Standard Format:
```
postgresql://[username]:[password]@[host]:[port]/[database]
```

### With SSL (Recommended for production):
```
postgresql://[username]:[password]@[host]:[port]/[database]?sslmode=require
```

### Example Connection Strings:

**Supabase:**
```
postgresql://postgres:your_password@db.abc123.supabase.co:5432/postgres
```

**Neon:**
```
postgresql://neondb_owner:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Railway:**
```
postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
```

**Render:**
```
postgresql://user:password@dpg-abc123def456-oregon-postgres.render.com/neurlumina_db
```

---

## Security Best Practices

### 1. Use Environment Variables
- ✅ Store connection strings in `.env` file
- ✅ Never commit `.env` to Git (already in `.gitignore`)
- ✅ Use different databases for dev/staging/prod

### 2. Use SSL Connections (Production)
Add `?sslmode=require` to connection string:
```
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### 3. Strong Passwords
- Use at least 16 characters
- Mix uppercase, lowercase, numbers, symbols
- Don't reuse passwords

### 4. IP Whitelisting (Where Available)
- Restrict database access to specific IPs
- Use your application server IPs
- Avoid 0.0.0.0/0 in production

### 5. Regular Backups
- Enable automatic backups (most providers offer this)
- Test restore procedures
- Keep backups for at least 30 days

---

## Troubleshooting Common Issues

### Issue 1: Connection Refused
**Error**: `connection refused` or `timeout`

**Solutions**:
- Check if database is running
- Verify connection string is correct
- Check firewall/security group settings
- Ensure database allows public connections
- Try from different network

### Issue 2: Authentication Failed
**Error**: `password authentication failed`

**Solutions**:
- Double-check username and password
- Reset password in provider dashboard
- Verify special characters are properly encoded in URL

### Issue 3: SSL Required
**Error**: `SSL connection required`

**Solutions**:
- Add `?sslmode=require` to connection string
- Or set `sslmode=prefer` for optional SSL

### Issue 4: Database Does Not Exist
**Error**: `database "xxx" does not exist`

**Solutions**:
- Create database in provider dashboard
- Use default database (usually `postgres`)
- Update connection string with correct database name

### Issue 5: Too Many Connections
**Error**: `too many connections`

**Solutions**:
- Increase connection pool size
- Use connection pooling (pgBouncer)
- Check for connection leaks in code

---

## Migration from Local to Online Database

### Step 1: Export Local Data (Optional)
```bash
pg_dump -h localhost -U your_user -d llm_training > backup.sql
```

### Step 2: Update .env File
Replace local connection with online connection string

### Step 3: Import Data to Online Database
```bash
psql -h online-host -U user -d database < backup.sql
```

### Step 4: Test Application
Start your application and verify everything works

---

## Recommended Provider by Use Case

| Use Case | Recommended Provider |
|----------|---------------------|
| **Learning/Development** | Supabase or Neon (both have great free tiers) |
| **Small Project** | Railway or Render |
| **Production App** | Neon or Supabase (good performance) |
| **Enterprise** | AWS RDS or Google Cloud SQL |
| **Serverless** | Neon (built for serverless) |
| **Budget-Conscious** | Neon or Supabase (generous free tiers) |

---

## Quick Start Checklist

- [ ] Choose a provider (Supabase recommended for beginners)
- [ ] Create account and database
- [ ] Copy connection string
- [ ] Update `backend/.env` file with connection string
- [ ] Test connection using curl or Python
- [ ] Start your application
- [ ] Verify tables are created automatically
- [ ] Test web scraping save functionality

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Railway Docs**: https://docs.railway.app
- **PostgreSQL Official Docs**: https://www.postgresql.org/docs/

---

## Example .env File

```env
# Groq API Key
GROQ_API_KEY=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

# Online PostgreSQL Database (Supabase Example)
DATABASE_URL=postgresql://postgres:your_password@db.abc123.supabase.co:5432/postgres
ASYNC_DATABASE_URL=postgresql+asyncpg://postgres:your_password@db.abc123.supabase.co:5432/postgres

# For production, add SSL:
# DATABASE_URL=postgresql://postgres:password@host:5432/postgres?sslmode=require
```

---

**Note**: After setting up your online database, restart your backend server to apply the new connection. The application will automatically create the necessary tables on startup.

**Security Reminder**: Never share your database connection strings publicly. Keep your `.env` file secure and never commit it to version control.

