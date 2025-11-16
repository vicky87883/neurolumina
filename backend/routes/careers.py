from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from services.database import db_manager
from services.auth import decode_access_token
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)

async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[dict]:
    """Get current authenticated user (optional for public endpoints)"""
    if not credentials:
        return None
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        is_admin = payload.get("is_admin", False)
        
        if user_id is None:
            return None
        
        # Try to convert user_id to int, if it fails, it might be an invalid token
        try:
            user_id_int = int(user_id)
        except (ValueError, TypeError):
            logger.warning(f"Invalid user_id in token: {user_id}")
            return None
        
        async with db_manager.get_async_session() as session:
            query = text("""
                SELECT id, email, username, full_name, is_active, is_admin
                FROM users
                WHERE id = :user_id
            """)
            result = await session.execute(query, {"user_id": user_id_int})
            row = result.fetchone()
            
            if not row:
                # If admin token but user not found, check if it's a valid admin token
                if is_admin:
                    # Return a minimal admin user object
                    return {
                        "id": user_id_int,
                        "email": payload.get("email", ""),
                        "username": payload.get("username", ""),
                        "full_name": payload.get("full_name", "Administrator"),
                        "is_active": 1,
                        "is_admin": True
                    }
                return None
            
            return {
                "id": row[0],
                "email": row[1],
                "username": row[2],
                "full_name": row[3],
                "is_active": row[4],
                "is_admin": row[5] if len(row) > 5 else False
            }
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        return None

router = APIRouter(prefix="/api/careers", tags=["careers"])

# Pydantic models
class CareerCreate(BaseModel):
    title: str
    department: str
    location: str
    type: str  # Full-time, Part-time, Contract, etc.
    description: str
    requirements: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    salary_range: Optional[str] = None
    is_active: bool = True

class CareerUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    salary_range: Optional[str] = None
    is_active: Optional[bool] = None

class CareerResponse(BaseModel):
    id: int
    title: str
    department: str
    location: str
    type: str
    description: str
    requirements: Optional[List[str]]
    benefits: Optional[List[str]]
    salary_range: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Initialize careers table
async def init_careers_table():
    """Initialize careers table if it doesn't exist"""
    try:
        async with db_manager.get_async_session() as session:
            # Create careers table
            create_table_query = text("""
                CREATE TABLE IF NOT EXISTS careers (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(500) NOT NULL,
                    department VARCHAR(200) NOT NULL,
                    location VARCHAR(200) NOT NULL,
                    type VARCHAR(100) NOT NULL,
                    description TEXT NOT NULL,
                    requirements TEXT[],
                    benefits TEXT[],
                    salary_range VARCHAR(100),
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            await session.execute(create_table_query)
            
            # Create indexes
            create_index_query = text("""
                CREATE INDEX IF NOT EXISTS idx_careers_active ON careers(is_active)
            """)
            await session.execute(create_index_query)
            
            create_index_query2 = text("""
                CREATE INDEX IF NOT EXISTS idx_careers_department ON careers(department)
            """)
            await session.execute(create_index_query2)
            
            await session.commit()
            logger.info("Careers table initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing careers table: {e}")

@router.get("/", response_model=List[CareerResponse])
async def get_careers(
    skip: int = 0,
    limit: int = 50,
    active_only: bool = True,
    department: Optional[str] = None,
    location: Optional[str] = None,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Get list of career openings (public endpoint)"""
    try:
        await init_careers_table()
        async with db_manager.get_async_session() as session:
            query = """
                SELECT 
                    id,
                    title,
                    department,
                    location,
                    type,
                    description,
                    requirements,
                    benefits,
                    salary_range,
                    is_active,
                    created_at,
                    updated_at
                FROM careers
                WHERE 1=1
            """
            params = {}
            
            if active_only:
                query += " AND is_active = TRUE"
            
            if department:
                query += " AND department = :department"
                params['department'] = department
            
            if location:
                query += " AND location = :location"
                params['location'] = location
            
            query += " ORDER BY created_at DESC LIMIT :limit OFFSET :skip"
            params['limit'] = limit
            params['skip'] = skip
            
            result = await session.execute(text(query), params)
            rows = result.fetchall()
            
            careers = []
            for row in rows:
                careers.append({
                    "id": row[0],
                    "title": row[1],
                    "department": row[2],
                    "location": row[3],
                    "type": row[4],
                    "description": row[5],
                    "requirements": row[6] if row[6] else [],
                    "benefits": row[7] if row[7] else [],
                    "salary_range": row[8],
                    "is_active": row[9],
                    "created_at": row[10],
                    "updated_at": row[11]
                })
            
            return careers
    except Exception as e:
        logger.error(f"Error fetching careers: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching careers: {str(e)}"
        )

@router.get("/{career_id}", response_model=CareerResponse)
async def get_career(
    career_id: int,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Get a single career opening by ID (public endpoint)"""
    try:
        await init_careers_table()
        async with db_manager.get_async_session() as session:
            query = text("""
                SELECT 
                    id,
                    title,
                    department,
                    location,
                    type,
                    description,
                    requirements,
                    benefits,
                    salary_range,
                    is_active,
                    created_at,
                    updated_at
                FROM careers
                WHERE id = :career_id AND is_active = TRUE
            """)
            result = await session.execute(query, {"career_id": career_id})
            row = result.fetchone()
            
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Career opening not found"
                )
            
            return {
                "id": row[0],
                "title": row[1],
                "department": row[2],
                "location": row[3],
                "type": row[4],
                "description": row[5],
                "requirements": row[6] if row[6] else [],
                "benefits": row[7] if row[7] else [],
                "salary_range": row[8],
                "is_active": row[9],
                "created_at": row[10],
                "updated_at": row[11]
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching career: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching career: {str(e)}"
        )

@router.post("/", response_model=CareerResponse)
async def create_career(
    career: CareerCreate,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Create a new career opening (requires authentication)"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        await init_careers_table()
        async with db_manager.get_async_session() as session:
            query = text("""
                INSERT INTO careers (
                    title, department, location, type, description,
                    requirements, benefits, salary_range, is_active,
                    created_at, updated_at
                )
                VALUES (
                    :title, :department, :location, :type, :description,
                    :requirements, :benefits, :salary_range, :is_active,
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
                RETURNING id, created_at, updated_at
            """)
            result = await session.execute(query, {
                "title": career.title,
                "department": career.department,
                "location": career.location,
                "type": career.type,
                "description": career.description,
                "requirements": career.requirements if career.requirements else [],
                "benefits": career.benefits if career.benefits else [],
                "salary_range": career.salary_range,
                "is_active": career.is_active
            })
            row = result.fetchone()
            await session.commit()
            
            return {
                "id": row[0],
                "title": career.title,
                "department": career.department,
                "location": career.location,
                "type": career.type,
                "description": career.description,
                "requirements": career.requirements if career.requirements else [],
                "benefits": career.benefits if career.benefits else [],
                "salary_range": career.salary_range,
                "is_active": career.is_active,
                "created_at": row[1],
                "updated_at": row[2]
            }
    except Exception as e:
        logger.error(f"Error creating career: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating career: {str(e)}"
        )

@router.put("/{career_id}", response_model=CareerResponse)
async def update_career(
    career_id: int,
    career: CareerUpdate,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Update a career opening (requires authentication)"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        await init_careers_table()
        async with db_manager.get_async_session() as session:
            # Check if career exists
            check_query = text("SELECT id FROM careers WHERE id = :career_id")
            result = await session.execute(check_query, {"career_id": career_id})
            row = result.fetchone()
            
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Career opening not found"
                )
            
            # Build update query
            update_fields = []
            params = {"career_id": career_id}
            
            if career.title is not None:
                update_fields.append("title = :title")
                params["title"] = career.title
            
            if career.department is not None:
                update_fields.append("department = :department")
                params["department"] = career.department
            
            if career.location is not None:
                update_fields.append("location = :location")
                params["location"] = career.location
            
            if career.type is not None:
                update_fields.append("type = :type")
                params["type"] = career.type
            
            if career.description is not None:
                update_fields.append("description = :description")
                params["description"] = career.description
            
            if career.requirements is not None:
                update_fields.append("requirements = :requirements")
                params["requirements"] = career.requirements
            
            if career.benefits is not None:
                update_fields.append("benefits = :benefits")
                params["benefits"] = career.benefits
            
            if career.salary_range is not None:
                update_fields.append("salary_range = :salary_range")
                params["salary_range"] = career.salary_range
            
            if career.is_active is not None:
                update_fields.append("is_active = :is_active")
                params["is_active"] = career.is_active
            
            if not update_fields:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No fields to update"
                )
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            
            update_query = text(f"""
                UPDATE careers
                SET {', '.join(update_fields)}
                WHERE id = :career_id
                RETURNING *
            """)
            
            result = await session.execute(update_query, params)
            row = result.fetchone()
            await session.commit()
            
            return {
                "id": row[0],
                "title": row[1],
                "department": row[2],
                "location": row[3],
                "type": row[4],
                "description": row[5],
                "requirements": row[6] if row[6] else [],
                "benefits": row[7] if row[7] else [],
                "salary_range": row[8],
                "is_active": row[9],
                "created_at": row[10],
                "updated_at": row[11]
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating career: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating career: {str(e)}"
        )

@router.delete("/{career_id}")
async def delete_career(
    career_id: int,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Delete a career opening (requires authentication)"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        await init_careers_table()
        async with db_manager.get_async_session() as session:
            # Check if career exists
            check_query = text("SELECT id FROM careers WHERE id = :career_id")
            result = await session.execute(check_query, {"career_id": career_id})
            row = result.fetchone()
            
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Career opening not found"
                )
            
            delete_query = text("DELETE FROM careers WHERE id = :career_id")
            await session.execute(delete_query, {"career_id": career_id})
            await session.commit()
            
            return {"message": "Career opening deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting career: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting career: {str(e)}"
        )

