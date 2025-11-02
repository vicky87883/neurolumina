import asyncio
import logging
from typing import Dict, List, Any, Optional
from bs4 import BeautifulSoup
import requests
from urllib.parse import urljoin, urlparse
import time

logger = logging.getLogger(__name__)

class WebScraper:
    """Web scraping service for extracting content from websites"""
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.timeout = 10
    
    async def scrape_url(
        self,
        url: str,
        extract_text: bool = True,
        extract_links: bool = False,
        extract_images: bool = False,
        max_depth: int = 0
    ) -> Dict[str, Any]:
        """Scrape a single URL and extract content"""
        try:
            logger.info(f"Scraping URL: {url}")
            
            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: requests.get(url, headers=self.headers, timeout=self.timeout)
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to fetch URL: HTTP {response.status_code}")
            
            soup = BeautifulSoup(response.content, 'lxml')
            
            result = {
                "url": url,
                "status_code": response.status_code,
                "title": soup.title.string if soup.title else "",
                "text": "",
                "links": [],
                "images": [],
                "metadata": {}
            }
            
            if extract_text:
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()
                
                # Get text
                text = soup.get_text()
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                text = ' '.join(chunk for chunk in chunks if chunk)
                result["text"] = text[:5000]  # Limit text length
            
            if extract_links:
                links = []
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    absolute_url = urljoin(url, href)
                    links.append({
                        "url": absolute_url,
                        "text": link.get_text(strip=True)
                    })
                result["links"] = links[:50]  # Limit links
            
            if extract_images:
                images = []
                for img in soup.find_all('img', src=True):
                    src = img['src']
                    absolute_url = urljoin(url, src)
                    images.append({
                        "url": absolute_url,
                        "alt": img.get('alt', '')
                    })
                result["images"] = images[:20]  # Limit images
            
            # Extract metadata
            meta_tags = soup.find_all('meta')
            for meta in meta_tags:
                name = meta.get('name') or meta.get('property')
                content = meta.get('content')
                if name and content:
                    result["metadata"][name] = content
            
            return result
            
        except Exception as e:
            logger.error(f"Error scraping {url}: {str(e)}")
            raise Exception(f"Web scraping error: {str(e)}")
    
    async def scrape_multiple_urls(
        self,
        urls: List[str],
        extract_text: bool = True,
        extract_links: bool = False,
        extract_images: bool = False
    ) -> List[Dict[str, Any]]:
        """Scrape multiple URLs concurrently"""
        tasks = [
            self.scrape_url(url, extract_text, extract_links, extract_images)
            for url in urls
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append({
                    "url": urls[i],
                    "error": str(result)
                })
            else:
                processed_results.append(result)
        
        return processed_results
    
    async def search_and_scrape(
        self,
        query: str,
        max_results: int = 5
    ) -> List[Dict[str, Any]]:
        """Search the web and scrape top results (simplified - would use search API in production)"""
        # This is a placeholder - in production, you'd use Google Search API, Bing API, etc.
        # For now, we'll just return a message suggesting to provide URLs directly
        return [{
            "message": "Direct URL scraping is available. For web search, integrate with search APIs like Google Custom Search, Bing Search API, or DuckDuckGo API."
        }]

