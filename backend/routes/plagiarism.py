from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import logging
from services.plagiarism_detector import PlagiarismDetector

logger = logging.getLogger(__name__)

router = APIRouter()
plagiarism_detector = PlagiarismDetector()

class PlagiarismCheckRequest(BaseModel):
    text: str
    min_similarity: Optional[float] = 0.3  # 30% default threshold
    use_chunks: Optional[bool] = True
    max_results: Optional[int] = 10

class PlagiarismBatchRequest(BaseModel):
    texts: List[str]
    min_similarity: Optional[float] = 0.3

@router.post("/check")
async def check_plagiarism(request: PlagiarismCheckRequest):
    """Check text for plagiarism against database content"""
    try:
        logger.info(f"Plagiarism check request (text length: {len(request.text)})")
        
        result = await plagiarism_detector.check_plagiarism(
            text=request.text,
            min_similarity=request.min_similarity,
            use_chunks=request.use_chunks,
            max_results=request.max_results
        )
        
        return result
    except Exception as e:
        logger.error(f"Plagiarism check error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Plagiarism check failed: {str(e)}")

@router.post("/check-batch")
async def check_plagiarism_batch(request: PlagiarismBatchRequest):
    """Check multiple texts for plagiarism"""
    try:
        logger.info(f"Batch plagiarism check request ({len(request.texts)} texts)")
        
        results = await plagiarism_detector.check_plagiarism_batch(
            texts=request.texts,
            min_similarity=request.min_similarity
        )
        
        return {
            "results": results,
            "total_checked": len(request.texts)
        }
    except Exception as e:
        logger.error(f"Batch plagiarism check error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch plagiarism check failed: {str(e)}")

@router.get("/stats")
async def get_plagiarism_stats():
    """Get statistics about database content for plagiarism detection"""
    try:
        from services.database import db_manager
        from sqlalchemy import text
        import socket
        
        # Check if database connection is available
        try:
            # Test database connection first
            connection_test = await db_manager.test_connection()
            if connection_test.get("status") != "connected":
                logger.warning("Database not connected, returning empty stats")
                return {
                    "scraped_content_count": 0,
                    "training_data_count": 0,
                    "total_content_size": 0,
                    "total_content_items": 0,
                    "database_status": "disconnected",
                    "message": "Database connection unavailable. Please configure DATABASE_URL in your environment variables."
                }
        except (socket.gaierror, OSError) as conn_error:
            # Handle DNS/connection errors gracefully
            error_msg = str(conn_error)
            if "nodename nor servname provided" in error_msg or "not known" in error_msg:
                logger.warning(f"Database hostname resolution failed: {error_msg}")
                return {
                    "scraped_content_count": 0,
                    "training_data_count": 0,
                    "total_content_size": 0,
                    "total_content_items": 0,
                    "database_status": "connection_error",
                    "message": "Database connection failed. Please check your DATABASE_URL configuration."
                }
            else:
                raise
        
        # Proceed with database query if connection is available
        async with db_manager.get_async_session() as session:
            # Count scraped content
            query_scraped = text("SELECT COUNT(*) FROM scraped_content WHERE content IS NOT NULL AND content != ''")
            result = await session.execute(query_scraped)
            scraped_count = result.scalar() or 0
            
            # Count training data
            query_training = text("SELECT COUNT(*) FROM training_data")
            result = await session.execute(query_training)
            training_count = result.scalar() or 0
            
            # Get total content size
            query_size = text("""
                SELECT 
                    SUM(LENGTH(content)) as total_size
                FROM scraped_content
                WHERE content IS NOT NULL
            """)
            result = await session.execute(query_size)
            total_size = result.scalar() or 0
            
            return {
                "scraped_content_count": scraped_count,
                "training_data_count": training_count,
                "total_content_size": total_size,
                "total_content_items": scraped_count + training_count,
                "database_status": "connected"
            }
    except (socket.gaierror, OSError) as conn_error:
        # Handle connection errors at the session level
        error_msg = str(conn_error)
        logger.error(f"Database connection error: {error_msg}", exc_info=True)
        return {
            "scraped_content_count": 0,
            "training_data_count": 0,
            "total_content_size": 0,
            "total_content_items": 0,
            "database_status": "connection_error",
            "message": "Database connection failed. Please check your DATABASE_URL environment variable.",
            "error": error_msg
        }
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error getting stats: {error_msg}", exc_info=True)
        # Return error response instead of raising exception for better UX
        return {
            "scraped_content_count": 0,
            "training_data_count": 0,
            "total_content_size": 0,
            "total_content_items": 0,
            "database_status": "error",
            "message": f"Failed to get stats: {error_msg}",
            "error": error_msg
        }


