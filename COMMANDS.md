# Quick Command Reference

## Free Port 8000

### Method 1: Kill Process on Port 8000
```bash
lsof -ti:8000 | xargs kill -9
```

### Method 2: Using the Script
```bash
./FREE_PORT_8000.sh
```

### Method 3: Find and Kill Manually
```bash
# Find process
lsof -i:8000

# Kill by PID (replace PID with actual process ID)
kill -9 PID
```

## Start Backend Server
```bash
cd backend
source venv/bin/activate
uvicorn app:app --reload --port 8000
```

## Test Database Connection
```bash
curl http://localhost:8000/api/database/test
```

## Test Web Scraper
```bash
curl -X POST http://localhost:8000/api/scraping/single \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "extract_text": true}'
```

## Check Server Health
```bash
curl http://localhost:8000/health
```

## View Scraped Content from Database
```bash
curl "http://localhost:8000/api/scraping/from-db?limit=10"
```











