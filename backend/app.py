from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import Response
import logging
import os
from routes import chat, training, scraping, plagiarism, auth, blogs, careers, admin
from services.database import db_manager

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="IntelliThesis API", version="1.0.0")

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    # Add security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response

# CORS middleware for frontend communication
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://13.203.154.38:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(training.router, prefix="/api/training", tags=["training"])
app.include_router(scraping.router, prefix="/api/scraping", tags=["scraping"])
app.include_router(plagiarism.router, prefix="/api/plagiarism", tags=["plagiarism"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(blogs.router)
app.include_router(careers.router)
app.include_router(admin.router)

logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    try:
        db_manager.initialize()
        # Create tables if they don't exist (only if database is configured)
        if db_manager.async_engine:
            result = await db_manager.create_tables()
            if result.get("status") == "success":
                logger.info("Database initialized successfully")
            else:
                logger.warning(f"Database table creation: {result.get('message', 'Unknown error')}")
        else:
            logger.info("Application started without database (database features disabled)")
    except Exception as e:
        logger.warning(f"Database initialization skipped: {str(e)}")
        logger.warning("Web scraping will work, but database features will be unavailable")

@app.get("/")
async def root():
    return {"message": "LLM Training API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/database/test")
async def test_database():
    """Test database connection"""
    result = await db_manager.test_connection()
    return result

