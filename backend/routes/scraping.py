from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import logging
from services.web_scraper import WebScraper
from services.database import db_manager

logger = logging.getLogger(__name__)

router = APIRouter()
web_scraper = WebScraper()

class ScrapeRequest(BaseModel):
    url: str
    extract_text: bool = True
    extract_links: bool = False
    extract_images: bool = False
    use_selenium: bool = True  # Use Selenium for JavaScript-heavy sites
    use_cloudscraper: bool = True  # Use cloudscraper for Cloudflare
    selenium_wait_time: int = 5  # Wait time for JavaScript to load (seconds)
    selenium_scroll: bool = True  # Scroll page to load dynamic content

class ScrapeMultipleRequest(BaseModel):
    urls: List[str]
    extract_text: bool = True
    extract_links: bool = False
    extract_images: bool = False
    use_selenium: bool = True
    use_cloudscraper: bool = True

class ScrapeResponse(BaseModel):
    url: str
    title: str
    text: str
    links: List[dict] = []
    images: List[dict] = []
    metadata: dict = {}
    scraping_method: Optional[str] = None  # Which method was used: selenium, cloudscraper, httpx, requests
    status_code: Optional[int] = None

@router.post("/single", response_model=ScrapeResponse)
async def scrape_single_url(request: ScrapeRequest):
    """Scrape a single URL with Selenium support for JavaScript-heavy sites"""
    try:
        logger.info(f"Scraping request for: {request.url} (Selenium: {request.use_selenium})")
        result = await web_scraper.scrape_url(
            url=request.url,
            extract_text=request.extract_text,
            extract_links=request.extract_links,
            extract_images=request.extract_images,
            use_selenium=request.use_selenium,
            use_cloudscraper=request.use_cloudscraper,
            selenium_wait_time=request.selenium_wait_time,
            selenium_scroll=request.selenium_scroll
        )
        
        # Optionally save to database
        # await save_scraped_content_to_db(result)
        
        return ScrapeResponse(**result)
    except Exception as e:
        logger.error(f"Scraping error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")

@router.post("/multiple")
async def scrape_multiple_urls(request: ScrapeMultipleRequest):
    """Scrape multiple URLs with Selenium support"""
    try:
        logger.info(f"Scraping {len(request.urls)} URLs (Selenium: {request.use_selenium})")
        results = await web_scraper.scrape_multiple_urls(
            urls=request.urls,
            extract_text=request.extract_text,
            extract_links=request.extract_links,
            extract_images=request.extract_images,
            use_selenium=request.use_selenium,
            use_cloudscraper=request.use_cloudscraper
        )
        return {"results": results, "count": len(results)}
    except Exception as e:
        logger.error(f"Scraping error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")

@router.post("/save-to-db")
async def scrape_and_save(request: ScrapeRequest):
    """Scrape URL with Selenium and save to PostgreSQL database"""
    try:
        # Scrape the URL with Selenium for best results
        logger.info(f"Starting scrape for URL: {request.url}")
        result = await web_scraper.scrape_url(
            url=request.url,
            extract_text=True,
            extract_links=False,
            extract_images=False,
            use_selenium=request.use_selenium,
            use_cloudscraper=request.use_cloudscraper,
            selenium_wait_time=request.selenium_wait_time,
            selenium_scroll=request.selenium_scroll
        )
        
        logger.info(f"Scraping completed. Title: {result.get('title', 'N/A')[:50]}...")
        logger.info(f"Content length: {len(result.get('text', ''))} characters")
        
        # Save to database
        import json
        from datetime import datetime
        import socket
        
        try:
            # Check database connection first
            connection_test = await db_manager.test_connection()
            if connection_test.get("status") != "connected":
                logger.warning("Database not connected, returning scraped data without saving")
                return {
                    "status": "scraped_but_not_saved",
                    "message": "Database connection unavailable. Content scraped but not saved.",
                    "url": result["url"],
                    "title": result["title"],
                    "content_preview": result["text"][:500] + "..." if len(result.get("text", "")) > 500 else result.get("text", ""),
                    "database_status": connection_test.get("status", "unknown")
                }
            
            async with db_manager.get_async_session() as session:
                from sqlalchemy import text
                
                query = text("""
                    INSERT INTO scraped_content (url, title, content, metadata, scraped_at)
                    VALUES (:url, :title, :content, :metadata, :scraped_at)
                    RETURNING id
                """)
                
                # Truncate title if too long (max 500 chars)
                title = result.get("title", "")[:500] if result.get("title") else ""
                # Truncate URL if too long (max 500 chars)
                url = result.get("url", "")[:500] if result.get("url") else ""
                # Content can be TEXT type, so no truncation needed
                content = result.get("text", "")
                
                result_db = await session.execute(query, {
                    "url": url,
                    "title": title,
                    "content": content,
                    "metadata": json.dumps(result.get("metadata", {})),
                    "scraped_at": datetime.utcnow()
                })
                
                await session.commit()
                inserted_id = result_db.scalar()
                
                logger.info(f"Successfully saved to database. ID: {inserted_id}")
            
            return {
                "status": "saved",
                "id": inserted_id,
                "url": result["url"],
                "title": result["title"],
                "content_length": len(content)
            }
            
        except (socket.gaierror, OSError) as conn_error:
            # Handle database connection errors gracefully
            error_msg = str(conn_error)
            logger.error(f"Database connection error: {error_msg}")
            return {
                "status": "scraped_but_not_saved",
                "message": "Database connection failed. Content scraped but not saved.",
                "url": result["url"],
                "title": result["title"],
                "content_preview": result["text"][:500] + "..." if len(result.get("text", "")) > 500 else result.get("text", ""),
                "database_error": "Database connection unavailable. Please check your DATABASE_URL.",
                "error": error_msg
            }
        except Exception as db_error:
            # Handle other database errors
            error_msg = str(db_error)
            logger.error(f"Database error: {error_msg}", exc_info=True)
            return {
                "status": "scraped_but_not_saved",
                "message": "Database error occurred. Content scraped but not saved.",
                "url": result["url"],
                "title": result["title"],
                "content_preview": result["text"][:500] + "..." if len(result.get("text", "")) > 500 else result.get("text", ""),
                "database_error": error_msg
            }
            
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error in scrape_and_save: {error_msg}", exc_info=True)
        # Return error response instead of raising exception for better UX
        return {
            "status": "error",
            "message": f"Scraping failed: {error_msg}",
            "error": error_msg
        }

@router.get("/from-db")
async def get_scraped_content(limit: int = 10, offset: int = 0):
    """Retrieve scraped content from database"""
    try:
        import socket
        
        # Check database connection first
        connection_test = await db_manager.test_connection()
        if connection_test.get("status") != "connected":
            logger.warning("Database not connected, returning empty results")
            return {
                "content": [],
                "count": 0,
                "database_status": "disconnected",
                "message": "Database connection unavailable. Please check your DATABASE_URL."
            }
        
        async with db_manager.get_async_session() as session:
            from sqlalchemy import text
            
            query = text("""
                SELECT id, url, title, content, metadata, scraped_at
                FROM scraped_content
                ORDER BY scraped_at DESC
                LIMIT :limit OFFSET :offset
            """)
            
            result = await session.execute(query, {"limit": limit, "offset": offset})
            rows = result.fetchall()
            
            content = []
            for row in rows:
                import json
                try:
                    metadata = json.loads(row[4]) if row[4] else {}
                except:
                    metadata = {}
                
                content.append({
                    "id": row[0],
                    "url": row[1],
                    "title": row[2],
                    "content": row[3][:500] + "..." if row[3] and len(row[3]) > 500 else row[3],
                    "metadata": metadata,
                    "scraped_at": row[5].isoformat() if row[5] else None
                })
            
            return {"content": content, "count": len(content)}
            
    except (socket.gaierror, OSError) as conn_error:
        error_msg = str(conn_error)
        logger.error(f"Database connection error: {error_msg}")
        return {
            "content": [],
            "count": 0,
            "database_status": "connection_error",
            "message": "Database connection failed. Please check your DATABASE_URL.",
            "error": error_msg
        }
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error retrieving from database: {error_msg}", exc_info=True)
        return {
            "content": [],
            "count": 0,
            "database_status": "error",
            "message": f"Failed to retrieve: {error_msg}",
            "error": error_msg
        }

