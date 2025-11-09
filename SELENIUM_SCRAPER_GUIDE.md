# 🚀 Selenium-Powered Web Scraper Guide

## Overview

Your web scraper now uses **Selenium with undetected Chrome** for powerful JavaScript rendering and anti-bot bypass capabilities. It automatically falls back to multiple strategies if one fails.

## 🎯 Key Features

### 1. **Selenium with Undetected Chrome**
- ✅ Full JavaScript rendering
- ✅ Bypasses bot detection
- ✅ Handles dynamic content
- ✅ Scrolls to load lazy-loaded content
- ✅ Waits for elements to load

### 2. **Multiple Fallback Strategies**
The scraper tries methods in this order:
1. **Selenium** (undetected Chrome) - Best for JavaScript-heavy sites
2. **Cloudscraper** - Best for Cloudflare protection
3. **Httpx** - Fast async HTTP client
4. **Requests** - Standard HTTP requests

### 3. **Advanced Features**
- ✅ Random user agents
- ✅ Enhanced browser headers
- ✅ Automatic scrolling
- ✅ Element waiting
- ✅ Retry logic
- ✅ Rate limiting

## 📋 API Usage

### Single URL Scraping

```bash
curl -X POST http://localhost:8000/api/scraping/single \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "extract_text": true,
    "extract_links": true,
    "extract_images": true,
    "use_selenium": true,
    "use_cloudscraper": true,
    "selenium_wait_time": 5,
    "selenium_scroll": true
  }'
```

### Parameters

- `url` (required): URL to scrape
- `extract_text` (default: `true`): Extract text content
- `extract_links` (default: `false`): Extract links
- `extract_images` (default: `false`): Extract images
- `use_selenium` (default: `true`): Use Selenium for JavaScript rendering
- `use_cloudscraper` (default: `true`): Use cloudscraper for Cloudflare
- `selenium_wait_time` (default: `5`): Seconds to wait for JavaScript to load
- `selenium_scroll` (default: `true`): Scroll page to load dynamic content

### Multiple URLs Scraping

```bash
curl -X POST http://localhost:8000/api/scraping/multiple \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://example.com",
      "https://another-site.com"
    ],
    "extract_text": true,
    "use_selenium": true
  }'
```

### Save to Database

```bash
curl -X POST http://localhost:8000/api/scraping/save-to-db \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "use_selenium": true,
    "selenium_wait_time": 10
  }'
```

## 🔧 Configuration

### When to Use Selenium

✅ **Use Selenium when:**
- Website uses heavy JavaScript
- Content is loaded dynamically
- Site has React/Vue/Angular
- Need to interact with page elements
- Site has lazy-loaded content

❌ **Don't use Selenium when:**
- Simple static HTML pages
- Need very fast scraping
- Limited resources
- Just need basic content

### Selenium Wait Time

- **Short (3-5 seconds)**: Fast sites, simple pages
- **Medium (5-10 seconds)**: Standard websites
- **Long (10-15 seconds)**: Heavy JavaScript, complex sites

### Scrolling

Enable scrolling (`selenium_scroll: true`) for:
- Infinite scroll pages
- Lazy-loaded content
- Dynamic content loading
- Images loaded on scroll

## 🎨 Frontend Integration

### TypeScript Example

```typescript
interface ScrapeRequest {
  url: string;
  extract_text?: boolean;
  extract_links?: boolean;
  extract_images?: boolean;
  use_selenium?: boolean;
  use_cloudscraper?: boolean;
  selenium_wait_time?: number;
  selenium_scroll?: boolean;
}

async function scrapeUrl(request: ScrapeRequest) {
  const response = await fetch('http://localhost:8000/api/scraping/single', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  const result = await response.json();
  console.log('Scraping method used:', result.scraping_method);
  return result;
}

// Example: Scrape with Selenium
const result = await scrapeUrl({
  url: 'https://javascript-heavy-site.com',
  use_selenium: true,
  selenium_wait_time: 10,
  selenium_scroll: true,
});
```

## 🛠️ Troubleshooting

### Selenium Not Working

1. **Check Chrome Installation**
   ```bash
   google-chrome --version
   # or
   chromium --version
   ```

2. **Check ChromeDriver**
   - Automatically managed by `webdriver-manager`
   - Automatically managed by `undetected-chromedriver`

3. **Check Dependencies**
   ```bash
   cd backend
   source venv/bin/activate
   pip install selenium webdriver-manager undetected-chromedriver
   ```

### Common Errors

**Error: "ChromeDriver not found"**
- Solution: Dependencies will auto-install ChromeDriver

**Error: "Session not created"**
- Solution: Update Chrome browser to latest version

**Error: "Timeout waiting for page load"**
- Solution: Increase `selenium_wait_time` parameter

**Error: "Unable to locate element"**
- Solution: Increase wait time or disable specific element waiting

### Performance Tips

1. **Disable Selenium for Simple Sites**
   ```json
   {
     "url": "https://simple-site.com",
     "use_selenium": false
   }
   ```

2. **Adjust Wait Time**
   - Shorter wait = faster scraping
   - Longer wait = more reliable

3. **Disable Scrolling for Static Sites**
   ```json
   {
     "url": "https://static-site.com",
     "selenium_scroll": false
   }
   ```

## 📊 Response Format

```json
{
  "url": "https://example.com",
  "title": "Example Domain",
  "text": "Extracted text content...",
  "links": [
    {
      "url": "https://example.com/page1",
      "text": "Page 1"
    }
  ],
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "alt": "Image description",
      "title": "Image title"
    }
  ],
  "metadata": {
    "description": "Meta description",
    "keywords": "meta keywords",
    "open_graph": {
      "title": "OG Title",
      "description": "OG Description"
    }
  },
  "scraping_method": "selenium",
  "status_code": 200
}
```

## 🔐 Security & Best Practices

1. **Rate Limiting**: Built-in delays between requests
2. **User Agents**: Random user agents to avoid detection
3. **Headers**: Realistic browser headers
4. **Respect robots.txt**: Consider implementing robots.txt checking
5. **Legal Compliance**: Always check website's terms of service

## 🚀 Advanced Usage

### Custom Wait Conditions

The scraper automatically waits for the `body` element. For custom elements:

```python
# In web_scraper.py, modify _scrape_with_selenium
wait_for_element="main-content"  # Wait for specific class/id
```

### Headless vs Headed Mode

Currently uses headless mode for performance. To use headed mode (see browser):

```python
# In _create_selenium_driver
headless=False  # Show browser window
```

## 📚 Resources

- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [Undetected ChromeDriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver)
- [WebDriver Manager](https://github.com/SergeyPirogov/webdriver_manager)

## ✅ Testing

Test the scraper:

```bash
# Test with Selenium
curl -X POST http://localhost:8000/api/scraping/single \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "use_selenium": true}'

# Test without Selenium (faster)
curl -X POST http://localhost:8000/api/scraping/single \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "use_selenium": false}'
```

## 🎉 Success!

Your web scraper is now powerful enough to handle:
- ✅ JavaScript-heavy websites
- ✅ React/Vue/Angular applications
- ✅ Cloudflare-protected sites
- ✅ Dynamic content loading
- ✅ Lazy-loaded images
- ✅ Infinite scroll pages
- ✅ Anti-bot protection

Happy scraping! 🕷️





