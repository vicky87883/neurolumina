# PostgreSQL Database Connection Flow Diagram

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NEUROLUMINA AI PLATFORM                          │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    FRONTEND (Next.js)                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │  Chat Window │  │ Web Scraper  │  │Training Status│      │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │  │
│  └─────────┼──────────────────┼─────────────────┼─────────────┘  │
│            │                  │                   │                 │
│            │ HTTP Request     │                   │                 │
│            │ (JSON)           │                   │                 │
└────────────┼──────────────────┼───────────────────┼───────────────┘
             │                  │                   │
             ▼                  ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │  │
│  │  Chat Route  │  │Scraping Route│  │Training Route│            │  │
│  │  /api/chat   │  │/api/scraping │  │/api/training │            │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │  │
│         │                  │                  │                    │
│         │                  │                  │                    │
│         │         ┌────────▼─────────┐        │                    │
│         │         │ WebScraper       │        │                    │
│         │         │ Service          │        │                    │
│         │         └────────┬─────────┘        │                    │
│         │                  │                  │                    │
│         │                  ▼                  │                    │
│         │         ┌──────────────────────┐    │                    │
│         │         │ DatabaseManager      │    │                    │
│         │         │ - Sync Engine        │◄───┘                    │
│         │         │ - Async Engine       │                         │
│         │         │ - Session Factories  │                         │
│         │         └──────────┬───────────┘                         │
│         │                    │                                      │
└─────────┼────────────────────┼────────────────────────────────────┘
          │                    │
          │                    ▼
          │         ┌──────────────────────┐
          │         │   PostgreSQL DB      │
          │         │                      │
          │         │  ┌──────────────┐    │
          │         │  │training_data │    │
          │         │  ├──────────────┤    │
          │         │  │scraped_content│   │
          │         │  ├──────────────┤    │
          │         │  │  (future)    │    │
          │         │  │  tables...   │    │
          │         │  └──────────────┘    │
          │         └──────────────────────┘
          │
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                │
│  ┌──────────────┐              ┌──────────────┐                    │
│  │  Groq API    │              │   Web URLs   │                    │
│  │  (LLM)       │              │  (Scraping)  │                    │
│  └──────────────┘              └──────────────┘                    │
└─────────────────────────────────────────────────────────────────────┘
```

## Step-by-Step Flow for Web Scraping with Database

### Flow 1: Scrape and Save to Database

```
User enters URL in Web Scraper UI
    │
    ▼
Frontend sends POST request
POST /api/scraping/save-to-db
Body: { "url": "https://example.com" }
    │
    ▼
FastAPI Route Handler
routes/scraping.py::scrape_and_save()
    │
    ├─▶ WebScraper.scrape_url()
    │   │
    │   ├─▶ requests.get() - Fetch HTML
    │   ├─▶ BeautifulSoup - Parse HTML
    │   └─▶ Extract: title, text, metadata
    │
    └─▶ DatabaseManager.save()
        │
        ├─▶ Get async session
        ├─▶ Execute INSERT query
        └─▶ Commit transaction
            │
            ▼
        PostgreSQL Database
        Table: scraped_content
        ┌────────┬──────────┬─────────┐
        │   id   │   url    │  title  │
        ├────────┼──────────┼─────────┤
        │   1    │ example  │  Title  │
        └────────┴──────────┴─────────┘
            │
            ▼
        Return success response
            │
            ▼
        Frontend displays: "Saved! ID: 1"
```

### Flow 2: Retrieve Scraped Content

```
User clicks "Load Saved"
    │
    ▼
Frontend sends GET request
GET /api/scraping/from-db?limit=10&offset=0
    │
    ▼
FastAPI Route Handler
routes/scraping.py::get_scraped_content()
    │
    └─▶ DatabaseManager.query()
        │
        ├─▶ Get async session
        ├─▶ Execute SELECT query
        │   SELECT id, url, title, content, metadata, scraped_at
        │   FROM scraped_content
        │   ORDER BY scraped_at DESC
        │   LIMIT 10 OFFSET 0
        └─▶ Fetch results
            │
            ▼
        PostgreSQL Database
        Returns rows
            │
            ▼
        Transform to JSON
            │
            ▼
        Return to Frontend
            │
            ▼
        Display in UI cards
```

### Flow 3: Database Connection Initialization

```
Application Startup (uvicorn app:app)
    │
    ▼
@app.on_event("startup")
startup_event()
    │
    ├─▶ DatabaseManager.initialize()
    │   │
    │   ├─▶ Load DATABASE_URL from .env
    │   │   postgresql://user:pass@host:5432/db
    │   │
    │   ├─▶ Create Sync Engine
    │   │   SQLAlchemy Engine
    │   │   Connection Pool: 10 connections
    │   │
    │   ├─▶ Create Async Engine
    │   │   postgresql+asyncpg://...
    │   │   Connection Pool: 10 connections
    │   │
    │   └─▶ Create Session Factories
    │
    └─▶ DatabaseManager.create_tables()
        │
        ├─▶ Define table schemas
        │   - training_data
        │   - scraped_content
        │
        ├─▶ Execute CREATE TABLE IF NOT EXISTS
        │
        └─▶ Log success/failure
            │
            ▼
        Ready to accept requests
```

## Database Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]
         │       │        │      │     │      │
         │       │        │      │     │      └─ Database name
         │       │        │      │     └─ Port (default: 5432)
         │       │        │      └─ Host (localhost/remote)
         │       │        └─ Password
         │       └─ Username
         └─ Protocol

Example:
postgresql://llm_user:secure_pass@localhost:5432/llm_training
```

## Connection Pooling

```
┌──────────────────────────────────────┐
│      SQLAlchemy Connection Pool      │
│                                       │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐     │
│  │Conn│  │Conn│  │Conn│  │Conn│ ... │
│  │  1 │  │  2 │  │  3 │  │  4 │     │
│  └──┬─┘  └──┬─┘  └──┬─┘  └──┬─┘     │
│     │       │       │       │        │
└─────┼───────┼───────┼───────┼────────┘
      │       │       │       │
      └───────┴───────┴───────┘
              │
              ▼
      ┌───────────────┐
      │  PostgreSQL   │
      │   Database    │
      └───────────────┘

Pool Size: 10 connections
Max Overflow: 20 connections
Total Possible: 30 connections
```

## Query Execution Flow

```
API Request
    │
    ▼
Route Handler
    │
    ▼
Get Async Session
async with db_manager.get_async_session() as session:
    │
    ▼
Execute Query
result = await session.execute(
    text("SELECT * FROM table"),
    {"param": value}
)
    │
    ▼
Process Results
rows = result.fetchall()
data = [transform(row) for row in rows]
    │
    ▼
Commit Transaction
await session.commit()
    │
    ▼
Return Response
return {"data": data}
```

## Error Handling Flow

```
Query Execution
    │
    ├─▶ Success
    │   └─▶ Return data
    │
    └─▶ Error
        │
        ├─▶ Connection Error
        │   └─▶ Retry logic / Return error
        │
        ├─▶ SQL Error
        │   └─▶ Log error / Return 500
        │
        └─▶ Transaction Error
            └─▶ Rollback / Return error
```

## Security Flow

```
Environment Variables (.env)
    │
    ├─▶ DATABASE_URL (never in code)
    │   └─▶ Loaded by python-dotenv
    │
    ├─▶ .env in .gitignore
    │   └─▶ Never committed
    │
    └─▶ Production: Use secrets manager
        └─▶ AWS Secrets Manager / Vault
```

For detailed setup instructions, see `POSTGRESQL_SETUP.md`

