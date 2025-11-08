from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging
from services.groq_client import GroqClient
from services.training_manager import TrainingManager

logger = logging.getLogger(__name__)

router = APIRouter()
_groq_client = None
training_manager = TrainingManager()

def get_groq_client() -> GroqClient:
    """Lazy initialization of Groq client"""
    global _groq_client
    if _groq_client is None:
        _groq_client = GroqClient()
    return _groq_client

class ChatRequest(BaseModel):
    message: str
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1024

class ChatResponse(BaseModel):
    response: str
    usage: dict

class FeedbackRequest(BaseModel):
    message: str
    response: str
    reward: float
    metadata: Optional[dict] = None

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Handle chat requests"""
    try:
        logger.info(f"Received chat request: {request.message[:50]}...")
        groq_client = get_groq_client()
        result = await groq_client.generate(
            prompt=request.message,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        # Optionally add to training dataset
        # training_manager.add_training_example(
        #     prompt=request.message,
        #     response=result["text"],
        #     reward=0.0
        # )
        
        return ChatResponse(
            response=result["text"],
            usage=result["usage"]
        )
    except ValueError as e:
        error_msg = str(e)
        logger.error(f"Configuration error: {error_msg}")
        if "GROQ_API_KEY" in error_msg or "API key" in error_msg.lower():
            raise HTTPException(
                status_code=500, 
                detail="Groq API key is missing or invalid. Please check your .env file and get a valid API key from https://console.groq.com"
            )
        raise HTTPException(status_code=500, detail=f"Configuration error: {error_msg}")
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Chat error: {error_msg}", exc_info=True)
        
        # Provide helpful error messages
        if "401" in error_msg or "Invalid API Key" in error_msg or "invalid_api_key" in error_msg:
            raise HTTPException(
                status_code=401,
                detail="Invalid Groq API key. Please get a new API key from https://console.groq.com and update your .env file, then restart the server."
            )
        elif "429" in error_msg or "rate limit" in error_msg.lower():
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please wait a moment and try again."
            )
        else:
            raise HTTPException(status_code=500, detail=f"Error processing chat request: {error_msg}")

@router.post("/with-feedback")
async def chat_with_feedback(request: FeedbackRequest):
    """Add a chat interaction with feedback to training dataset"""
    try:
        training_manager.add_training_example(
            prompt=request.message,
            response=request.response,
            reward=request.reward,
            metadata=request.metadata
        )
        return {"status": "added", "dataset_size": len(training_manager.dataset.examples)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

