import os
import logging
from typing import Optional, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class DatabaseManager:
    """PostgreSQL database connection manager"""
    
    def __init__(self):
        self.database_url = os.getenv(
            "DATABASE_URL",
            "postgresql://user:password@localhost:5432/llm_training"
        )
        self.async_database_url = os.getenv(
            "ASYNC_DATABASE_URL",
            self.database_url.replace("postgresql://", "postgresql+asyncpg://")
        )
        self.engine = None
        self.async_engine = None
        self.SessionLocal = None
        self.AsyncSessionLocal = None
    
    def initialize(self):
        """Initialize database connections"""
        try:
            # Synchronous engine
            self.engine = create_engine(
                self.database_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20
            )
            
            # Synchronous session
            self.SessionLocal = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=self.engine
            )
            
            # Asynchronous engine
            self.async_engine = create_async_engine(
                self.async_database_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                echo=False
            )
            
            # Asynchronous session
            self.AsyncSessionLocal = sessionmaker(
                self.async_engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            
            logger.info("Database connections initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
            raise
    
    def get_sync_session(self):
        """Get synchronous database session"""
        if not self.SessionLocal:
            self.initialize()
        return self.SessionLocal()
    
    def get_async_session(self):
        """Get asynchronous database session"""
        if not self.AsyncSessionLocal:
            self.initialize()
        return self.AsyncSessionLocal()
    
    async def test_connection(self) -> Dict[str, Any]:
        """Test database connection"""
        try:
            async with self.get_async_session() as session:
                result = await session.execute(text("SELECT version()"))
                version = result.scalar()
                
                # Get database name
                result = await session.execute(text("SELECT current_database()"))
                db_name = result.scalar()
                
                return {
                    "status": "connected",
                    "database": db_name,
                    "version": version,
                    "message": "Successfully connected to PostgreSQL"
                }
        except Exception as e:
            logger.error(f"Database connection test failed: {str(e)}")
            return {
                "status": "error",
                "message": f"Connection failed: {str(e)}"
            }
    
    async def execute_query(self, query: str, params: Optional[Dict[str, Any]] = None) -> Any:
        """Execute a SQL query asynchronously"""
        try:
            async with self.get_async_session() as session:
                result = await session.execute(text(query), params or {})
                await session.commit()
                return result.fetchall()
        except Exception as e:
            logger.error(f"Query execution error: {str(e)}")
            raise
    
    async def create_tables(self):
        """Create necessary tables for the application"""
        from sqlalchemy import MetaData, Table, Column, Integer, String, Text, Float, DateTime
        from datetime import datetime
        
        metadata = MetaData()
        
        # Training data table
        training_data = Table(
            'training_data',
            metadata,
            Column('id', Integer, primary_key=True),
            Column('prompt', Text, nullable=False),
            Column('response', Text, nullable=False),
            Column('reward', Float, default=0.0),
            Column('metadata', Text),  # JSON string
            Column('created_at', DateTime, default=datetime.utcnow),
        )
        
        # Scraped content table
        scraped_content = Table(
            'scraped_content',
            metadata,
            Column('id', Integer, primary_key=True),
            Column('url', String(500), nullable=False),
            Column('title', String(500)),
            Column('content', Text),
            Column('metadata', Text),  # JSON string
            Column('scraped_at', DateTime, default=datetime.utcnow),
        )
        
        try:
            async with self.async_engine.begin() as conn:
                await conn.run_sync(metadata.create_all)
            logger.info("Database tables created successfully")
            return {"status": "success", "message": "Tables created"}
        except Exception as e:
            logger.error(f"Error creating tables: {str(e)}")
            return {"status": "error", "message": str(e)}


# Global database manager instance
db_manager = DatabaseManager()

