import os
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from services.database import db_manager
from sqlalchemy import text

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this-in-production-change-in-production-please")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Security settings
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 72
PASSWORD_REQUIRE_UPPERCASE = False  # Set to True for stronger passwords
PASSWORD_REQUIRE_LOWERCASE = True
PASSWORD_REQUIRE_NUMBER = False  # Set to True for stronger passwords
PASSWORD_REQUIRE_SPECIAL = False  # Set to True for stronger passwords

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)

def validate_password_strength(password: str) -> tuple:
    """Validate password strength"""
    if len(password) < MIN_PASSWORD_LENGTH:
        return False, f"Password must be at least {MIN_PASSWORD_LENGTH} characters long"
    
    if len(password) > MAX_PASSWORD_LENGTH:
        return False, f"Password must be at most {MAX_PASSWORD_LENGTH} characters long"
    
    if PASSWORD_REQUIRE_LOWERCASE and not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    
    if PASSWORD_REQUIRE_UPPERCASE and not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    
    if PASSWORD_REQUIRE_NUMBER and not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    
    if PASSWORD_REQUIRE_SPECIAL and not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        return False, "Password must contain at least one special character"
    
    return True, ""

def get_password_hash(password: str) -> str:
    """Hash a password"""
    # Bcrypt has a 72-byte limit for passwords
    # Truncate if necessary (though this is unusual for normal passwords)
    if isinstance(password, str):
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            logger.warning(f"Password exceeds 72 bytes, truncating. Original length: {len(password_bytes)}")
            password = password_bytes[:72].decode('utf-8', errors='ignore')
    return pwd_context.hash(password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode a JWT access token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email"""
    try:
        async with db_manager.get_async_session() as session:
            query = text("""
                SELECT id, email, username, hashed_password, full_name, is_active, created_at
                FROM users
                WHERE email = :email
            """)
            result = await session.execute(query, {"email": email})
            row = result.fetchone()
            
            if row:
                return {
                    "id": row[0],
                    "email": row[1],
                    "username": row[2],
                    "hashed_password": row[3],
                    "full_name": row[4],
                    "is_active": row[5],
                    "created_at": row[6]
                }
            return None
    except Exception as e:
        error_msg = str(e)
        # Check if it's a database connection error
        if "nodename nor servname provided" in error_msg or "not known" in error_msg:
            logger.error(f"Database connection error getting user by email: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable. Please check your database connection."
            )
        logger.error(f"Error getting user by email: {error_msg}")
        return None

async def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    """Get user by username"""
    try:
        async with db_manager.get_async_session() as session:
            query = text("""
                SELECT id, email, username, hashed_password, full_name, is_active, created_at
                FROM users
                WHERE username = :username
            """)
            result = await session.execute(query, {"username": username})
            row = result.fetchone()
            
            if row:
                return {
                    "id": row[0],
                    "email": row[1],
                    "username": row[2],
                    "hashed_password": row[3],
                    "full_name": row[4],
                    "is_active": row[5],
                    "created_at": row[6]
                }
            return None
    except Exception as e:
        error_msg = str(e)
        # Check if it's a database connection error
        if "nodename nor servname provided" in error_msg or "not known" in error_msg:
            logger.error(f"Database connection error getting user by username: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable. Please check your database connection."
            )
        logger.error(f"Error getting user by username: {error_msg}")
        return None

async def create_user(
    email: str,
    username: str,
    password: str,
    full_name: Optional[str] = None
) -> Dict[str, Any]:
    """Create a new user"""
    try:
        # Validate password strength
        is_valid, error_message = validate_password_strength(password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_message
            )
        
        # Validate password length (bcrypt limit is 72 bytes)
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is too long. Maximum length is 72 characters."
            )
        
        # Check if user already exists
        existing_user = await get_user_by_email(email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        existing_username = await get_user_by_username(username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        # Hash password
        hashed_password = get_password_hash(password)
        
        # Create user
        async with db_manager.get_async_session() as session:
            query = text("""
                INSERT INTO users (email, username, hashed_password, full_name, is_active, created_at, updated_at)
                VALUES (:email, :username, :hashed_password, :full_name, 1, :created_at, :updated_at)
                RETURNING id, email, username, full_name, created_at
            """)
            
            now = datetime.utcnow()
            result = await session.execute(query, {
                "email": email,
                "username": username,
                "hashed_password": hashed_password,
                "full_name": full_name,
                "created_at": now,
                "updated_at": now
            })
            
            await session.commit()
            row = result.fetchone()
            
            return {
                "id": row[0],
                "email": row[1],
                "username": row[2],
                "full_name": row[3],
                "created_at": row[4].isoformat() if row[4] else None
            }
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error creating user: {error_msg}")
        
        # Check if it's a database connection error
        if "nodename nor servname provided" in error_msg or "not known" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable. Please check your database connection."
            )
        # Check if it's a password length error
        elif "password cannot be longer than 72 bytes" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is too long. Maximum length is 72 characters."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create user: {error_msg}"
            )

async def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate a user"""
    user = await get_user_by_email(email)
    if not user:
        return None
    
    if not verify_password(password, user["hashed_password"]):
        return None
    
    if user["is_active"] != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Remove password from response
    user.pop("hashed_password", None)
    return user

async def get_current_user(token: str) -> Dict[str, Any]:
    """Get current authenticated user from token"""
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


