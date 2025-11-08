# Web Scraper Flow Documentation

## Overview
This document explains how the web scraper works and how it stores data in the database.

## Web Scraper Architecture

### 1. Scraping Service (`backend/services/web_scraper.py`)

The web scraper uses a **multi-strategy approach** with fallbacks:

#### Scraping Strategies (in order of preference):
1. **Selenium with Undetected Chrome** (Primary)
   - Best for JavaScript-heavy sites
   - Bypasses bot detection
   - Renders full page with JavaScript
   - Scrolls page to load dynamic content

2. **Cloudscraper** (Fallback 1)
   - Handles Cloudflare protection
   - Mimics browser behavior
   - Good for protected sites

3. **Httpx** (Fallback 2)
   - Async HTTP client
   - Fast for simple sites
   - JavaScript-like headers

4. **Requests** (Fallback 3)
   - Standard HTTP library
   - Last resort option

### 2. Data Flow

```
User Request (URL)
    ↓
Web Scraper Service
    ↓
Try Strategy 1: Selenium
    ↓ (if fails)
Try Strategy 2: Cloudscraper
    ↓ (if fails)
Try Strategy 3: Httpx
    ↓ (if fails)
Try Strategy 4: Requests
    ↓
Extract Content (BeautifulSoup)
    ↓
Return Scraped Data
    ↓
Save to Database (optional)
```

### 3. Content Extraction

The scraper extracts:
- **Title**: From `<title>` tag or Open Graph meta
- **Text**: Main content (removes scripts, styles, nav, etc.)
- **Links**: All URLs found on the page
- **Images**: All image URLs with alt text
- **Metadata**: Open Graph, JSON-LD, meta tags

### 4. Database Storage

#### Endpoint: `POST /api/scraping/save-to-db`

**Process:**
1. Scrapes the URL using the multi-strategy approach
2. Extracts content (text, title, metadata)
3. Saves to `scraped_content` table

**Database Table: `scraped_content`**
```sql
CREATE TABLE scraped_content (
    id SERIAL PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    title VARCHAR(500),
    content TEXT,
    metadata TEXT,  -- JSON string
    scraped_at TIMESTAMP DEFAULT NOW()
);
```

**Example Request:**
```json
POST /api/scraping/save-to-db
{
    "url": "https://en.wikipedia.org/wiki/Large_language_model",
    "extract_text": true,
    "extract_links": false,
    "extract_images": false,
    "use_selenium": true,
    "use_cloudscraper": true,
    "selenium_wait_time": 5,
    "selenium_scroll": true
}
```

**Response:**
```json
{
    "status": "saved",
    "id": 1,
    "url": "https://en.wikipedia.org/wiki/Large_language_model",
    "title": "Large language model - Wikipedia"
}
```

### 5. How Data Was Stored This Morning

When you processed a Wikipedia blog about LLM this morning:

1. **You called the endpoint**: `POST /api/scraping/save-to-db`
2. **Web scraper scraped the URL**: Used Selenium to render the Wikipedia page
3. **Content was extracted**: 
   - Title: "Large language model - Wikipedia"
   - Content: Full text of the Wikipedia article
   - Metadata: Wikipedia page metadata
4. **Data was saved**: Inserted into `scraped_content` table in Supabase

### 6. Available Endpoints

#### Scrape Single URL (No DB Save)
```
POST /api/scraping/single
```
- Scrapes URL and returns data
- Does NOT save to database
- Useful for testing

#### Scrape and Save to Database
```
POST /api/scraping/save-to-db
```
- Scrapes URL
- Saves to `scraped_content` table
- Returns saved record ID

#### Scrape Multiple URLs
```
POST /api/scraping/multiple
```
- Scrapes multiple URLs
- Rate limited (2 seconds between requests)
- Returns all results

#### Get Scraped Content from DB
```
GET /api/scraping/from-db?limit=10&offset=0
```
- Retrieves saved content from database
- Returns paginated results
- Ordered by `scraped_at` DESC (newest first)

### 7. Features

- **Anti-Bot Detection**: Uses undetected-chromedriver
- **Cloudflare Bypass**: Cloudscraper integration
- **JavaScript Rendering**: Full Selenium support
- **Dynamic Content**: Scrolls page to load lazy content
- **Error Handling**: Multiple fallback strategies
- **Rate Limiting**: Built-in delays for multiple URLs
- **Content Cleaning**: Removes scripts, styles, navigation
- **Metadata Extraction**: Open Graph, JSON-LD support

### 8. Example: Wikipedia LLM Article

**Request:**
```bash
curl -X POST http://localhost:8000/api/scraping/save-to-db \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://en.wikipedia.org/wiki/Large_language_model",
    "extract_text": true,
    "use_selenium": true,
    "selenium_scroll": true
  }'
```

**What Happened:**
1. Selenium opened Chrome (headless)
2. Navigated to Wikipedia LLM page
3. Waited 5 seconds for page load
4. Scrolled page to load all content
5. Extracted title and main content
6. Removed navigation, scripts, styles
7. Saved to database with:
   - URL: Wikipedia LLM page URL
   - Title: "Large language model - Wikipedia"
   - Content: Full article text
   - Metadata: Wikipedia metadata (JSON)
   - scraped_at: Current timestamp

**Database Record:**
```sql
INSERT INTO scraped_content (url, title, content, metadata, scraped_at)
VALUES (
    'https://en.wikipedia.org/wiki/Large_language_model',
    'Large language model - Wikipedia',
    '[Full Wikipedia article text...]',
    '{"open_graph": {...}, "json_ld": [...], ...}',
    '2024-11-08 10:30:00'
);
```

### 9. Configuration

**Selenium Settings:**
- Headless mode: Enabled
- Wait time: 5 seconds (default)
- Scroll: Enabled (default)
- Window size: 1920x1080
- User agent: Random browser user agent

**Content Extraction:**
- Max text length: 15,000 characters
- Max links: 150
- Max images: 100
- Content cleaning: Removes scripts, styles, nav, footer, aside

### 10. Error Handling

- **Connection errors**: Retries with different strategy
- **Timeout errors**: Falls back to next strategy
- **403 errors**: Tries cloudscraper
- **Database errors**: Returns error message, doesn't crash
- **Invalid URLs**: Automatically adds https://

### 11. Performance

- **Single URL**: ~5-10 seconds (with Selenium)
- **Multiple URLs**: ~2 seconds delay between requests
- **Database save**: ~100-200ms per record
- **Content extraction**: ~1-2 seconds

### 12. Future Enhancements

- Convert scraped content to training data automatically
- Batch processing for multiple URLs
- Scheduled scraping
- Content deduplication
- Link following and recursive scraping
- Export to different formats

