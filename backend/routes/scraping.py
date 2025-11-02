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

class ScrapeMultipleRequest(BaseModel):
    urls: List[str]
    extract_text: bool = True
    extract_links: bool = False
    extract_images: bool = False

class ScrapeResponse(BaseModel):
    url: str
    title: str
    text: str
    links: List[dict] = []
    images: List[dict] = []
    metadata: dict = {}

@router.post("/single", response_model=ScrapeResponse)
async def scrape_single_url(request: ScrapeRequest):
    """Scrape a single URL"""
    try:
        logger.info(f"Scraping request for: {request.url}")
        result = await web_scraper.scrape_url(
            url=request.url,
            extract_text=request.extract_text,
            extract_links=request.extract_links,
            extract_images=request.extract_images
        )
        
        # Optionally save to database
        # await save_scraped_content_to_db(result)
        
        return ScrapeResponse(**result)
    except Exception as e:
        logger.error(f"Scraping error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")

@router.post("/multiple")
async def scrape_multiple_urls(request: ScrapeMultipleRequest):
    """Scrape multiple URLs concurrently"""
    try:
        logger.info(f"Scraping {len(request.urls)} URLs")
        results = await web_scraper.scrape_multiple_urls(
            urls=request.urls,
            extract_text=request.extract_text,
            extract_links=request.extract_links,
            extract_images=request.extract_images
        )
        return {"results": results, "count": len(results)}
    except Exception as e:
        logger.error(f"Scraping error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")

@router.post("/save-to-db")
async def scrape_and_save(request: ScrapeRequest):
    """Scrape URL and save to PostgreSQL database"""
    try:
        # Scrape the URL
        result = await web_scraper.scrape_url(
            url=request.url,
            extract_text=True,
            extract_links=False,
            extract_images=False
        )
        
        # Save to database
        import json
        from datetime import datetime
        
        async with db_manager.get_async_session() as session:
            from sqlalchemy import text
            
            query = text("""
                INSERT INTO scraped_content (url, title, content, metadata, scraped_at)
                VALUES (:url, :title, :content, :metadata, :scraped_at)
                RETURNING id
            """)
            
            result_db = await session.execute(query, {
                "url": result["url"],
                "title": result["title"],
                "content": result["text"],
                "metadata": json.dumps(result["metadata"]),
                "scraped_at": datetime.utcnow()
            })
            
            await session.commit()
            inserted_id = result_db.scalar()
        
        return {
            "status": "saved",
            "id": inserted_id,
            "url": result["url"],
            "title": result["title"]
        }
    except Exception as e:
        logger.error(f"Error saving to database: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save: {str(e)}")

@router.get("/from-db")
async def get_scraped_content(limit: int = 10, offset: int = 0):
    """Retrieve scraped content from database"""
    try:
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
                content.append({
                    "id": row[0],
                    "url": row[1],
                    "title": row[2],
                    "content": row[3][:500] + "..." if row[3] and len(row[3]) > 500 else row[3],
                    "metadata": json.loads(row[4]) if row[4] else {},
                    "scraped_at": row[5].isoformat() if row[5] else None
                })
            
            return {"content": content, "count": len(content)}
    except Exception as e:
        logger.error(f"Error retrieving from database: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve: {str(e)}")

