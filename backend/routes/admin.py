from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List
from services.database import db_manager
from services.auth import (
    authenticate_user,
    create_access_token,
    decode_access_token,
    get_user_by_email,
    get_password_hash,
    verify_password
)
from datetime import timedelta
import logging
import os

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin", tags=["admin"])
security = HTTPBearer()

# Admin credentials (change these in production!)
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin@123")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@intellithesis.com")

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current authenticated admin user"""
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        is_admin = payload.get("is_admin", False)
        
        if user_id is None or not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        return payload
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting admin user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

async def init_admin_user():
    """Initialize admin user if it doesn't exist"""
    try:
        async with db_manager.get_async_session() as session:
            # Check if admin user exists
            query = text("""
                SELECT id, email, username, is_admin
                FROM users
                WHERE username = :username OR email = :email
            """)
            result = await session.execute(query, {
                "username": ADMIN_USERNAME,
                "email": ADMIN_EMAIL
            })
            row = result.fetchone()
            
            if not row:
                # Create admin user
                hashed_password = get_password_hash(ADMIN_PASSWORD)
                insert_query = text("""
                    INSERT INTO users (email, username, hashed_password, full_name, is_active, is_admin, created_at, updated_at)
                    VALUES (:email, :username, :hashed_password, :full_name, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    RETURNING id, email, username, full_name
                """)
                result = await session.execute(insert_query, {
                    "email": ADMIN_EMAIL,
                    "username": ADMIN_USERNAME,
                    "hashed_password": hashed_password,
                    "full_name": "Administrator"
                })
                await session.commit()
                logger.info(f"Admin user created: {ADMIN_USERNAME}")
            else:
                # Update existing user to be admin if not already
                if not row[3]:  # is_admin field
                    update_query = text("""
                        UPDATE users
                        SET is_admin = 1, updated_at = CURRENT_TIMESTAMP
                        WHERE id = :user_id
                    """)
                    await session.execute(update_query, {"user_id": row[0]})
                    await session.commit()
                    logger.info(f"User {row[2]} updated to admin")
    except Exception as e:
        logger.error(f"Error initializing admin user: {e}")

@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(request: AdminLoginRequest):
    """Admin login"""
    try:
        await init_admin_user()
        
        # Always check database for admin user (even for default credentials)
        async with db_manager.get_async_session() as session:
            query = text("""
                SELECT id, email, username, hashed_password, full_name, is_admin
                FROM users
                WHERE (username = :username OR email = :username) AND is_admin = 1
            """)
            result = await session.execute(query, {"username": request.username})
            row = result.fetchone()
            
            # If user found, verify password
            if row:
                # Check password (either from database or default password)
                password_valid = False
                if verify_password(request.password, row[3]):
                    password_valid = True
                elif request.username == ADMIN_USERNAME and request.password == ADMIN_PASSWORD:
                    # Allow default password for admin user
                    password_valid = True
                
                if password_valid:
                    access_token = create_access_token(
                        data={
                            "sub": str(row[0]),  # Use real database user ID
                            "email": row[1],
                            "username": row[2],
                            "is_admin": True
                        },
                        expires_delta=timedelta(days=1)
                    )
                    
                    return AdminLoginResponse(
                        access_token=access_token,
                        token_type="bearer",
                        user={
                            "id": row[0],
                            "email": row[1],
                            "username": row[2],
                            "full_name": row[4] if row[4] else "Administrator",
                            "is_admin": True
                        }
                    )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Admin login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.get("/me")
async def get_admin_info(current_admin: dict = Depends(get_admin_user)):
    """Get current admin information"""
    return {
        "user": current_admin,
        "valid": True
    }

@router.get("/credentials")
async def get_admin_credentials():
    """Get default admin credentials (for initial setup)"""
    return {
        "username": ADMIN_USERNAME,
        "email": ADMIN_EMAIL,
        "note": "Change these credentials in production using environment variables"
    }

