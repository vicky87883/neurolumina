import asyncio
import logging
from typing import Dict, List, Any, Optional
from bs4 import BeautifulSoup
import requests
from urllib.parse import urljoin, urlparse
import time
import random
import cloudscraper
from fake_useragent import UserAgent
import httpx
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager
import undetected_chromedriver as uc

logger = logging.getLogger(__name__)

class WebScraper:
    """Advanced web scraping service with Selenium for JavaScript and anti-bot protection"""
    
    def __init__(self):
        self.ua = UserAgent()
        self.timeout = 30
        self.retry_count = 3
        self.retry_delay = 2
        self.selenium_timeout = 20
        self._driver = None
        
        # Enhanced headers to mimic real browser
        self.base_headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
        }
        
        # Initialize cloudscraper for Cloudflare bypass
        try:
            self.cloudscraper_session = cloudscraper.create_scraper(
                browser={
                    'browser': 'chrome',
                    'platform': 'windows',
                    'desktop': True
                }
            )
        except Exception as e:
            logger.warning(f"Cloudscraper initialization failed: {str(e)}")
            self.cloudscraper_session = None
    
    def _get_random_headers(self) -> Dict[str, str]:
        """Generate random headers to avoid detection"""
        headers = self.base_headers.copy()
        try:
            headers['User-Agent'] = self.ua.random
        except:
            headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        return headers
    
    def _create_selenium_driver(self, headless: bool = True, use_undetected: bool = True) -> webdriver.Chrome:
        """Create Selenium WebDriver with anti-detection features"""
        try:
            if use_undetected:
                # Use undetected-chromedriver to bypass bot detection
                options = uc.ChromeOptions()
                if headless:
                    options.add_argument('--headless=new')
                options.add_argument('--no-sandbox')
                options.add_argument('--disable-dev-shm-usage')
                options.add_argument('--disable-blink-features=AutomationControlled')
                options.add_argument('--disable-extensions')
                options.add_argument('--disable-gpu')
                options.add_argument('--window-size=1920,1080')
                options.add_argument(f'user-agent={self._get_random_headers()["User-Agent"]}')
                options.add_experimental_option("excludeSwitches", ["enable-automation"])
                options.add_experimental_option('useAutomationExtension', False)
                
                driver = uc.Chrome(options=options, version_main=None)
                # Execute script to remove webdriver property
                driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
                return driver
            else:
                # Standard Selenium setup
                chrome_options = Options()
                if headless:
                    chrome_options.add_argument('--headless=new')
                chrome_options.add_argument('--no-sandbox')
                chrome_options.add_argument('--disable-dev-shm-usage')
                chrome_options.add_argument('--disable-blink-features=AutomationControlled')
                chrome_options.add_argument('--disable-extensions')
                chrome_options.add_argument('--window-size=1920,1080')
                chrome_options.add_argument(f'user-agent={self._get_random_headers()["User-Agent"]}')
                chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
                chrome_options.add_experimental_option('useAutomationExtension', False)
                
                service = Service(ChromeDriverManager().install())
                driver = webdriver.Chrome(service=service, options=chrome_options)
                driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
                return driver
        except Exception as e:
            logger.error(f"Failed to create Selenium driver: {str(e)}")
            raise
    
    async def _scrape_with_selenium(
        self,
        url: str,
        wait_for_element: Optional[str] = None,
        scroll: bool = True,
        wait_time: int = 5
    ) -> Dict[str, Any]:
        """Scrape using Selenium for JavaScript-rendered content"""
        driver = None
        try:
            logger.info(f"Scraping with Selenium: {url}")
            
            # Create driver in executor
            loop = asyncio.get_event_loop()
            driver = await loop.run_in_executor(
                None,
                lambda: self._create_selenium_driver(headless=True, use_undetected=True)
            )
            
            # Navigate to URL
            await loop.run_in_executor(None, lambda: driver.get(url))
            
            # Wait for page to load
            await asyncio.sleep(wait_time)
            
            # Wait for specific element if provided
            if wait_for_element:
                try:
                    wait = WebDriverWait(driver, self.selenium_timeout)
                    await loop.run_in_executor(
                        None,
                        lambda: wait.until(EC.presence_of_element_located((By.TAG_NAME, wait_for_element)))
                    )
                except TimeoutException:
                    logger.warning(f"Timeout waiting for element {wait_for_element}")
            
            # Scroll to load dynamic content
            if scroll:
                await loop.run_in_executor(
                    None,
                    lambda: driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                )
                await asyncio.sleep(2)
                await loop.run_in_executor(
                    None,
                    lambda: driver.execute_script("window.scrollTo(0, 0);")
                )
                await asyncio.sleep(1)
            
            # Get page source
            html_content = await loop.run_in_executor(None, lambda: driver.page_source)
            
            # Get current URL (in case of redirects)
            current_url = await loop.run_in_executor(None, lambda: driver.current_url)
            
            # Get page title
            page_title = await loop.run_in_executor(None, lambda: driver.title)
            
            # Close driver
            await loop.run_in_executor(None, lambda: driver.quit())
            driver = None
            
            return {
                "html": html_content,
                "url": current_url,
                "title": page_title,
                "method": "selenium"
            }
            
        except Exception as e:
            logger.error(f"Selenium scraping failed: {str(e)}")
            if driver:
                try:
                    loop = asyncio.get_event_loop()
                    await loop.run_in_executor(None, lambda: driver.quit())
                except:
                    pass
            raise
    
    async def _scrape_with_requests(
        self,
        url: str,
        use_cloudscraper: bool = False
    ) -> requests.Response:
        """Scrape using requests with enhanced headers"""
        loop = asyncio.get_event_loop()
        
        for attempt in range(self.retry_count):
            try:
                headers = self._get_random_headers()
                
                if use_cloudscraper and self.cloudscraper_session:
                    response = await loop.run_in_executor(
                        None,
                        lambda: self.cloudscraper_session.get(
                            url,
                            headers=headers,
                            timeout=self.timeout,
                            allow_redirects=True
                        )
                    )
                else:
                    response = await loop.run_in_executor(
                        None,
                        lambda: requests.get(
                            url,
                            headers=headers,
                            timeout=self.timeout,
                            allow_redirects=True
                        )
                    )
                
                if response.status_code == 200:
                    return response
                elif response.status_code == 403:
                    if not use_cloudscraper and self.cloudscraper_session:
                        logger.info(f"Got 403, retrying with cloudscraper for {url}")
                        return await self._scrape_with_requests(url, use_cloudscraper=True)
                    
            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed for {url}: {str(e)}")
                if attempt < self.retry_count - 1:
                    await asyncio.sleep(self.retry_delay * (attempt + 1))
                else:
                    raise
        
        raise Exception(f"Failed to fetch {url} after {self.retry_count} attempts")
    
    async def _scrape_with_httpx(self, url: str) -> str:
        """Scrape using httpx with JavaScript-like headers"""
        headers = self._get_random_headers()
        try:
            headers['User-Agent'] = self.ua.chrome
        except:
            pass
        
        async with httpx.AsyncClient(
            headers=headers,
            timeout=self.timeout,
            follow_redirects=True,
            verify=True
        ) as client:
            response = await client.get(url)
            if response.status_code == 200:
                return response.text
            else:
                raise Exception(f"HTTP {response.status_code}: {response.text[:200]}")
    
    def _extract_content_from_html(
        self,
        html_content: str,
        url: str,
        extract_text: bool = True,
        extract_links: bool = False,
        extract_images: bool = False
    ) -> Dict[str, Any]:
        """Extract content from HTML using BeautifulSoup"""
        soup = BeautifulSoup(html_content, 'lxml')
        
        result = {
            "url": url,
            "title": "",
            "text": "",
            "links": [],
            "images": [],
            "metadata": {}
        }
        
        # Extract title
        if soup.title:
            result["title"] = soup.title.get_text(strip=True)
        else:
            title_tag = soup.find('meta', property='og:title')
            if title_tag:
                result["title"] = title_tag.get('content', '')
        
        if extract_text:
            # Remove script, style, and other non-content elements
            for element in soup(["script", "style", "nav", "header", "footer", "aside", "noscript", "iframe"]):
                element.decompose()
            
            # Try to find main content area
            main_content = (soup.find('main') or 
                          soup.find('article') or 
                          soup.find('div', class_='content') or
                          soup.find('div', id='content') or
                          soup.find('div', class_='main-content') or
                          soup.find('div', class_='post-content'))
            
            if main_content:
                text = main_content.get_text(separator=' ', strip=True)
            else:
                body = soup.find('body')
                if body:
                    text = body.get_text(separator=' ', strip=True)
                else:
                    text = soup.get_text(separator=' ', strip=True)
            
            # Clean up text
            lines = [line.strip() for line in text.splitlines()]
            chunks = [phrase.strip() for line in lines for phrase in line.split("  ")]
            text = ' '.join(chunk for chunk in chunks if chunk and len(chunk) > 1)
            
            result["text"] = text[:15000]  # Increased limit
        
        if extract_links:
            links = []
            seen_urls = set()
            
            for link in soup.find_all('a', href=True):
                href = link['href']
                absolute_url = urljoin(url, href)
                
                if absolute_url not in seen_urls and absolute_url.startswith(('http://', 'https://')):
                    link_text = link.get_text(strip=True)
                    links.append({
                        "url": absolute_url,
                        "text": link_text if link_text else absolute_url
                    })
                    seen_urls.add(absolute_url)
                
                if len(links) >= 150:
                    break
            
            result["links"] = links
        
        if extract_images:
            images = []
            seen_srcs = set()
            
            for img in soup.find_all('img', src=True):
                src = img['src']
                absolute_url = urljoin(url, src)
                
                if absolute_url not in seen_srcs:
                    images.append({
                        "url": absolute_url,
                        "alt": img.get('alt', ''),
                        "title": img.get('title', '')
                    })
                    seen_srcs.add(absolute_url)
                
                if len(images) >= 100:
                    break
            
            result["images"] = images
        
        # Extract comprehensive metadata
        meta_tags = soup.find_all('meta')
        for meta in meta_tags:
            name = meta.get('name') or meta.get('property') or meta.get('itemprop')
            content = meta.get('content')
            if name and content:
                result["metadata"][name] = content
        
        # Extract Open Graph data
        og_data = {}
        for meta in soup.find_all('meta', property=lambda x: x and x.startswith('og:')):
            prop = meta.get('property', '').replace('og:', '')
            content = meta.get('content', '')
            if prop and content:
                og_data[prop] = content
        if og_data:
            result["metadata"]["open_graph"] = og_data
        
        # Extract JSON-LD structured data
        json_ld = []
        for script in soup.find_all('script', type='application/ld+json'):
            try:
                import json
                data = json.loads(script.string)
                json_ld.append(data)
            except:
                pass
        if json_ld:
            result["metadata"]["json_ld"] = json_ld
        
        return result
    
    async def scrape_url(
        self,
        url: str,
        extract_text: bool = True,
        extract_links: bool = False,
        extract_images: bool = False,
        use_selenium: bool = True,
        use_cloudscraper: bool = True,
        selenium_wait_time: int = 5,
        selenium_scroll: bool = True,
        max_depth: int = 0
    ) -> Dict[str, Any]:
        """Scrape a single URL with multiple fallback strategies (Selenium → Cloudscraper → Httpx → Requests)"""
        try:
            logger.info(f"Scraping URL: {url}")
            
            # Normalize URL
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
            
            html_content = None
            page_url = url
            page_title = ""
            scraping_method = "unknown"
            
            # Strategy 1: Try Selenium first (best for JavaScript-heavy sites)
            if use_selenium:
                try:
                    logger.info(f"Attempting with Selenium (undetected Chrome) for {url}")
                    selenium_result = await self._scrape_with_selenium(
                        url,
                        wait_for_element="body",
                        scroll=selenium_scroll,
                        wait_time=selenium_wait_time
                    )
                    html_content = selenium_result["html"]
                    page_url = selenium_result["url"]
                    page_title = selenium_result["title"]
                    scraping_method = "selenium"
                    logger.info(f"✓ Successfully scraped with Selenium")
                except Exception as e:
                    logger.warning(f"Selenium failed: {str(e)}")
            
            # Strategy 2: Try with cloudscraper (for Cloudflare)
            if not html_content and use_cloudscraper:
                try:
                    logger.info(f"Attempting with cloudscraper for {url}")
                    response = await self._scrape_with_requests(url, use_cloudscraper=True)
                    html_content = response.text
                    scraping_method = "cloudscraper"
                    logger.info(f"✓ Successfully scraped with cloudscraper")
                except Exception as e:
                    logger.warning(f"Cloudscraper failed: {str(e)}")
            
            # Strategy 3: Try with httpx
            if not html_content:
                try:
                    logger.info(f"Attempting with httpx for {url}")
                    html_content = await self._scrape_with_httpx(url)
                    scraping_method = "httpx"
                    logger.info(f"✓ Successfully scraped with httpx")
                except Exception as e:
                    logger.warning(f"Httpx failed: {str(e)}")
            
            # Strategy 4: Try with regular requests
            if not html_content:
                try:
                    logger.info(f"Attempting with requests for {url}")
                    response = await self._scrape_with_requests(url, use_cloudscraper=False)
                    html_content = response.text
                    scraping_method = "requests"
                    logger.info(f"✓ Successfully scraped with requests")
                except Exception as e:
                    logger.warning(f"Requests failed: {str(e)}")
            
            if not html_content:
                raise Exception("All scraping strategies failed - Unable to fetch content")
            
            # Extract content from HTML
            result = self._extract_content_from_html(
                html_content,
                page_url,
                extract_text=extract_text,
                extract_links=extract_links,
                extract_images=extract_images
            )
            
            # Override title if we got it from Selenium
            if page_title:
                result["title"] = page_title
            
            result["status_code"] = 200
            result["scraping_method"] = scraping_method
            
            return result
            
        except Exception as e:
            logger.error(f"Error scraping {url}: {str(e)}", exc_info=True)
            raise Exception(f"Web scraping error: {str(e)}")
    
    async def scrape_multiple_urls(
        self,
        urls: List[str],
        extract_text: bool = True,
        extract_links: bool = False,
        extract_images: bool = False,
        use_selenium: bool = True,
        use_cloudscraper: bool = True
    ) -> List[Dict[str, Any]]:
        """Scrape multiple URLs with rate limiting"""
        results = []
        for i, url in enumerate(urls):
            if i > 0:
                await asyncio.sleep(2)  # Rate limiting between requests
            
            try:
                result = await self.scrape_url(
                    url,
                    extract_text=extract_text,
                    extract_links=extract_links,
                    extract_images=extract_images,
                    use_selenium=use_selenium,
                    use_cloudscraper=use_cloudscraper
                )
                results.append(result)
            except Exception as e:
                results.append({
                    "url": url,
                    "error": str(e)
                })
        
        return results
    
    async def search_and_scrape(
        self,
        query: str,
        max_results: int = 5
    ) -> List[Dict[str, Any]]:
        """Search the web and scrape top results"""
        return [{
            "message": "Direct URL scraping is available. For web search, integrate with search APIs like Google Custom Search, Bing Search API, or DuckDuckGo API."
        }]
