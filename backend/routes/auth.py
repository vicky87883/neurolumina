from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging
from services.auth import (
    create_user,
    authenticate_user,
    create_access_token,
    decode_access_token,
    get_user_by_email
)
from datetime import timedelta

logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()

class SignUpRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

class SignUpResponse(BaseModel):
    user: dict
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str] = None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current authenticated user"""
    token = credentials.credentials
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return payload

@router.post("/signup", response_model=SignUpResponse)
async def signup(request: SignUpRequest):
    """User signup"""
    try:
        # Validate username
        if len(request.username) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username must be at least 3 characters"
            )
        
        # Validate password (additional validation in create_user)
        if len(request.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters"
            )
        
        # Create user
        user = await create_user(
            email=request.email,
            username=request.username,
            password=request.password,
            full_name=request.full_name
        )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(user["id"]), "email": user["email"], "username": user["username"]},
            expires_delta=timedelta(days=7)
        )
        
        return SignUpResponse(
            user=user,
            access_token=access_token,
            token_type="bearer"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {str(e)}"
        )

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """User login"""
    try:
        user = await authenticate_user(request.email, request.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(user["id"]), "email": user["email"], "username": user["username"]},
            expires_delta=timedelta(days=7)
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=user
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    try:
        user_id = current_user.get("sub")
        user = await get_user_by_email(current_user.get("email"))
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            id=user["id"],
            email=user["email"],
            username=user["username"],
            full_name=user.get("full_name")
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user info error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user info: {str(e)}"
        )

@router.post("/verify-token")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Verify if token is valid"""
    return {
        "valid": True,
        "user": current_user
    }





