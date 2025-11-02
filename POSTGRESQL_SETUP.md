# PostgreSQL Database Integration Flow

## Overview
This document explains how to connect NeuroLumina AI platform with PostgreSQL database for storing and retrieving training data, scraped content, and other application data.

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    NeuroLumina AI Platform                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │   Frontend   │───▶│   FastAPI    │───▶│   Services   │     │
│  │  (Next.js)   │    │   Backend    │    │   Layer     │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│                                │                               │
│                                ▼                               │
│                        ┌──────────────┐                       │
│                        │ Database     │                       │
│                        │ Manager      │                       │
│                        └──────────────┘                       │
│                                │                               │
└────────────────────────────────┼───────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   PostgreSQL Database  │
                    │                        │
                    │  ┌──────────────────┐  │
                    │  │ training_data   │  │
                    │  │ scraped_content │  │
                    │  │ checkpoints     │  │
                    │  │ analytics       │  │
                    │  └──────────────────┘  │
                    └────────────────────────┘
```

## Step-by-Step Setup Guide

### Step 1: Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from: https://www.postgresql.org/download/windows/

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE llm_training;

# Create user (optional but recommended)
CREATE USER llm_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE llm_training TO llm_user;

# Exit psql
\q
```

### Step 3: Configure Environment Variables

Create or update `backend/.env` file:

```env
# PostgreSQL Configuration
DATABASE_URL=postgresql://llm_user:your_secure_password@localhost:5432/llm_training

# Alternative async connection string (automatically generated)
ASYNC_DATABASE_URL=postgresql+asyncpg://llm_user:your_secure_password@localhost:5432/llm_training

# Groq API (already configured)
GROQ_API_KEY=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
```

### Step 4: Database Schema

The application will automatically create these tables on startup:

#### 1. `training_data` Table
```sql
CREATE TABLE training_data (
    id SERIAL PRIMARY KEY,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    reward FLOAT DEFAULT 0.0,
    metadata TEXT,  -- JSON string
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `scraped_content` Table
```sql
CREATE TABLE scraped_content (
    id SERIAL PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    title VARCHAR(500),
    content TEXT,
    metadata TEXT,  -- JSON string
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 5: Connection Flow

```
1. Application Startup
   └─▶ DatabaseManager.initialize()
       ├─▶ Creates synchronous engine (SQLAlchemy)
       ├─▶ Creates asynchronous engine (asyncpg)
       └─▶ Creates session factories

2. API Request Flow
   └─▶ FastAPI route handler
       └─▶ Service layer (e.g., web_scraper)
           └─▶ Database operation
               ├─▶ Get session: db_manager.get_async_session()
               ├─▶ Execute query: session.execute()
               └─▶ Commit/rollback: session.commit()

3. Data Retrieval Flow
   └─▶ Frontend request
       └─▶ API endpoint (/api/scraping/from-db)
           └─▶ Database query
               └─▶ Return JSON response
```

## Usage Examples

### 1. Testing Database Connection

```bash
curl http://localhost:8000/api/database/test
```

Response:
```json
{
  "status": "connected",
  "database": "llm_training",
  "version": "PostgreSQL 15.3",
  "message": "Successfully connected to PostgreSQL"
}
```

### 2. Scraping and Saving to Database

```bash
curl -X POST http://localhost:8000/api/scraping/save-to-db \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "extract_text": true
  }'
```

### 3. Retrieving Scraped Content

```bash
curl http://localhost:8000/api/scraping/from-db?limit=10&offset=0
```

## Database Operations

### Synchronous Operations
Use for simple queries or when async is not needed:
```python
session = db_manager.get_sync_session()
result = session.execute(text("SELECT * FROM training_data"))
```

### Asynchronous Operations (Recommended)
Use for better performance in FastAPI:
```python
async with db_manager.get_async_session() as session:
    result = await session.execute(text("SELECT * FROM training_data"))
```

## Security Best Practices

1. **Never commit credentials to Git**
   - Use `.env` file (already in `.gitignore`)
   - Use environment variables in production

2. **Use Connection Pooling**
   - Already configured: `pool_size=10, max_overflow=20`

3. **Parameterized Queries**
   - Always use SQLAlchemy's text() with parameters
   - Prevents SQL injection

4. **Connection String Format**
   ```
   postgresql://username:password@host:port/database
   ```

## Troubleshooting

### Connection Refused
- Check if PostgreSQL is running: `brew services list` (macOS)
- Verify port: Default is 5432
- Check firewall settings

### Authentication Failed
- Verify username and password in `.env`
- Check PostgreSQL user privileges

### Database Does Not Exist
- Create database: `CREATE DATABASE llm_training;`
- Or update DATABASE_URL in `.env`

### Tables Not Created
- Check application logs for errors
- Manually create tables using SQL provided above
- Verify database user has CREATE privileges

## Production Deployment

### Recommended Configuration:

1. **Use Connection Pooling**
   ```python
   pool_size=20
   max_overflow=40
   ```

2. **Use SSL Connection**
   ```env
   DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
   ```

3. **Environment Variables**
   - Store credentials in secure vault (AWS Secrets Manager, HashiCorp Vault)
   - Use different databases for dev/staging/prod

4. **Backup Strategy**
   - Regular automated backups
   - Point-in-time recovery enabled

## Next Steps

1. ✅ Database connection configured
2. ✅ Tables auto-created on startup
3. ✅ Web scraping can save to database
4. 🔄 Add more tables as needed (analytics, user_sessions, etc.)
5. 🔄 Implement database migrations (Alembic)
6. 🔄 Add database monitoring and logging

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/database/test` | GET | Test database connection |
| `/api/scraping/single` | POST | Scrape single URL |
| `/api/scraping/multiple` | POST | Scrape multiple URLs |
| `/api/scraping/save-to-db` | POST | Scrape and save to PostgreSQL |
| `/api/scraping/from-db` | GET | Retrieve scraped content |

## Visual Connection Flow

```
User Action
    │
    ▼
Frontend Component (Web Scraper UI)
    │
    ▼ HTTP Request
FastAPI Backend (/api/scraping/*)
    │
    ▼
WebScraper Service
    │
    ├─▶ Scrape Web Content
    │
    └─▶ Save to Database
            │
            ▼
    DatabaseManager
            │
            ▼
    PostgreSQL Database
            │
            ▼
    Data Stored ✅
```

For more details, check the code in:
- `backend/services/database.py` - Database connection logic
- `backend/routes/scraping.py` - Scraping API endpoints
- `backend/services/web_scraper.py` - Web scraping implementation

