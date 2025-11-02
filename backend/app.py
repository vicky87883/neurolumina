from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from routes import chat, training, scraping
from services.database import db_manager

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="LLM Training API", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(training.router, prefix="/api/training", tags=["training"])
app.include_router(scraping.router, prefix="/api/scraping", tags=["scraping"])

logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    try:
        db_manager.initialize()
        # Create tables if they don't exist
        await db_manager.create_tables()
        logger.info("Database initialized successfully")
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

