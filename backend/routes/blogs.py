from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from services.database import db_manager
from services.auth import decode_access_token, get_user_by_email
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current authenticated user"""
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        # Get user details from database
        async with db_manager.get_async_session() as session:
            query = text("""
                SELECT id, email, username, full_name, is_active
                FROM users
                WHERE id = :user_id
            """)
            result = await session.execute(query, {"user_id": int(user_id)})
            row = result.fetchone()
            
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )
            
            return {
                "id": row[0],
                "email": row[1],
                "username": row[2],
                "full_name": row[3],
                "is_active": row[4]
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

router = APIRouter(prefix="/api/blogs", tags=["blogs"])

# Pydantic models
class BlogCreate(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    is_published: bool = True

class BlogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    is_published: Optional[bool] = None

class BlogResponse(BaseModel):
    id: int
    title: str
    content: str
    excerpt: Optional[str]
    tags: Optional[List[str]]
    category: Optional[str]
    is_published: bool
    author_id: int
    author_username: Optional[str]
    author_email: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Initialize blogs table
async def init_blogs_table():
    """Initialize blogs table if it doesn't exist"""
    try:
        async with db_manager.get_async_session() as session:
            # Create blogs table
            create_table_query = text("""
                CREATE TABLE IF NOT EXISTS blogs (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(500) NOT NULL,
                    content TEXT NOT NULL,
                    excerpt TEXT,
                    tags TEXT[],
                    category VARCHAR(100),
                    is_published BOOLEAN DEFAULT TRUE,
                    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            await session.execute(create_table_query)
            
            # Create index on author_id
            create_index_query = text("""
                CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON blogs(author_id)
            """)
            await session.execute(create_index_query)
            
            # Create index on is_published
            create_index_query2 = text("""
                CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(is_published)
            """)
            await session.execute(create_index_query2)
            
            await session.commit()
            logger.info("Blogs table initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing blogs table: {e}")
        # Don't raise, table might already exist

@router.get("/", response_model=List[BlogResponse])
async def get_blogs(
    skip: int = 0,
    limit: int = 20,
    published_only: bool = True,
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get list of blogs"""
    try:
        await init_blogs_table()
        async with db_manager.get_async_session() as session:
            query = """
                SELECT 
                    b.id,
                    b.title,
                    b.content,
                    b.excerpt,
                    b.tags,
                    b.category,
                    b.is_published,
                    b.author_id,
                    u.username as author_username,
                    u.email as author_email,
                    b.created_at,
                    b.updated_at
                FROM blogs b
                JOIN users u ON b.author_id = u.id
                WHERE 1=1
            """
            params = {}
            
            if published_only:
                query += " AND b.is_published = TRUE"
            
            if category:
                query += " AND b.category = :category"
                params['category'] = category
            
            query += " ORDER BY b.created_at DESC LIMIT :limit OFFSET :skip"
            params['limit'] = limit
            params['skip'] = skip
            
            result = await session.execute(text(query), params)
            rows = result.fetchall()
            
            blogs = []
            for row in rows:
                blogs.append({
                    "id": row[0],
                    "title": row[1],
                    "content": row[2],
                    "excerpt": row[3],
                    "tags": row[4] if row[4] else [],
                    "category": row[5],
                    "is_published": row[6],
                    "author_id": row[7],
                    "author_username": row[8],
                    "author_email": row[9],
                    "created_at": row[10],
                    "updated_at": row[11]
                })
            
            return blogs
    except Exception as e:
        logger.error(f"Error fetching blogs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching blogs: {str(e)}"
        )

@router.get("/{blog_id}", response_model=BlogResponse)
async def get_blog(blog_id: int, current_user: dict = Depends(get_current_user)):
    """Get a single blog by ID"""
    try:
        await init_blogs_table()
        async with db_manager.get_async_session() as session:
            query = text("""
                SELECT 
                    b.id,
                    b.title,
                    b.content,
                    b.excerpt,
                    b.tags,
                    b.category,
                    b.is_published,
                    b.author_id,
                    u.username as author_username,
                    u.email as author_email,
                    b.created_at,
                    b.updated_at
                FROM blogs b
                JOIN users u ON b.author_id = u.id
                WHERE b.id = :blog_id AND b.is_published = TRUE
            """)
            result = await session.execute(query, {"blog_id": blog_id})
            row = result.fetchone()
            
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Blog not found"
                )
            
            return {
                "id": row[0],
                "title": row[1],
                "content": row[2],
                "excerpt": row[3],
                "tags": row[4] if row[4] else [],
                "category": row[5],
                "is_published": row[6],
                "author_id": row[7],
                "author_username": row[8],
                "author_email": row[9],
                "created_at": row[10],
                "updated_at": row[11]
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching blog: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching blog: {str(e)}"
        )

@router.post("/", response_model=BlogResponse)
async def create_blog(blog: BlogCreate, current_user: dict = Depends(get_current_user)):
    """Create a new blog post"""
    try:
        await init_blogs_table()
        async with db_manager.get_async_session() as session:
            # Generate excerpt if not provided
            excerpt = blog.excerpt
            if not excerpt and blog.content:
                excerpt = blog.content[:200] + "..." if len(blog.content) > 200 else blog.content
            
            query = text("""
                INSERT INTO blogs (title, content, excerpt, tags, category, is_published, author_id, created_at, updated_at)
                VALUES (:title, :content, :excerpt, :tags, :category, :is_published, :author_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, created_at, updated_at
            """)
            result = await session.execute(query, {
                "title": blog.title,
                "content": blog.content,
                "excerpt": excerpt,
                "tags": blog.tags if blog.tags else [],
                "category": blog.category,
                "is_published": blog.is_published,
                "author_id": current_user["id"]
            })
            row = result.fetchone()
            await session.commit()
            
            return {
                "id": row[0],
                "title": blog.title,
                "content": blog.content,
                "excerpt": excerpt,
                "tags": blog.tags if blog.tags else [],
                "category": blog.category,
                "is_published": blog.is_published,
                "author_id": current_user["id"],
                "author_username": current_user.get("username"),
                "author_email": current_user.get("email"),
                "created_at": row[1],
                "updated_at": row[2]
            }
    except Exception as e:
        logger.error(f"Error creating blog: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating blog: {str(e)}"
        )

@router.put("/{blog_id}", response_model=BlogResponse)
async def update_blog(
    blog_id: int,
    blog: BlogUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a blog post (only by author)"""
    try:
        await init_blogs_table()
        async with db_manager.get_async_session() as session:
            # Check if blog exists and user is author
            check_query = text("SELECT author_id FROM blogs WHERE id = :blog_id")
            result = await session.execute(check_query, {"blog_id": blog_id})
            row = result.fetchone()
            
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Blog not found"
                )
            
            if row[0] != current_user["id"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only update your own blogs"
                )
            
            # Build update query
            update_fields = []
            params = {"blog_id": blog_id}
            
            if blog.title is not None:
                update_fields.append("title = :title")
                params["title"] = blog.title
            
            if blog.content is not None:
                update_fields.append("content = :content")
                params["content"] = blog.content
            
            if blog.excerpt is not None:
                update_fields.append("excerpt = :excerpt")
                params["excerpt"] = blog.excerpt
            
            if blog.tags is not None:
                update_fields.append("tags = :tags")
                params["tags"] = blog.tags
            
            if blog.category is not None:
                update_fields.append("category = :category")
                params["category"] = blog.category
            
            if blog.is_published is not None:
                update_fields.append("is_published = :is_published")
                params["is_published"] = blog.is_published
            
            if not update_fields:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No fields to update"
                )
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            
            update_query = text(f"""
                UPDATE blogs
                SET {', '.join(update_fields)}
                WHERE id = :blog_id
                RETURNING *
            """)
            
            result = await session.execute(update_query, params)
            row = result.fetchone()
            await session.commit()
            
            # Fetch updated blog with author info
            fetch_query = text("""
                SELECT 
                    b.id,
                    b.title,
                    b.content,
                    b.excerpt,
                    b.tags,
                    b.category,
                    b.is_published,
                    b.author_id,
                    u.username as author_username,
                    u.email as author_email,
                    b.created_at,
                    b.updated_at
                FROM blogs b
                JOIN users u ON b.author_id = u.id
                WHERE b.id = :blog_id
            """)
            result = await session.execute(fetch_query, {"blog_id": blog_id})
            updated_row = result.fetchone()
            
            return {
                "id": updated_row[0],
                "title": updated_row[1],
                "content": updated_row[2],
                "excerpt": updated_row[3],
                "tags": updated_row[4] if updated_row[4] else [],
                "category": updated_row[5],
                "is_published": updated_row[6],
                "author_id": updated_row[7],
                "author_username": updated_row[8],
                "author_email": updated_row[9],
                "created_at": updated_row[10],
                "updated_at": updated_row[11]
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating blog: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating blog: {str(e)}"
        )

@router.delete("/{blog_id}")
async def delete_blog(blog_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a blog post (only by author)"""
    try:
        await init_blogs_table()
        async with db_manager.get_async_session() as session:
            # Check if blog exists and user is author
            check_query = text("SELECT author_id FROM blogs WHERE id = :blog_id")
            result = await session.execute(check_query, {"blog_id": blog_id})
            row = result.fetchone()
            
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Blog not found"
                )
            
            if row[0] != current_user["id"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only delete your own blogs"
                )
            
            delete_query = text("DELETE FROM blogs WHERE id = :blog_id")
            await session.execute(delete_query, {"blog_id": blog_id})
            await session.commit()
            
            return {"message": "Blog deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting blog: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting blog: {str(e)}"
        )

