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
        logger.error(f"Configuration error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except Exception as e:
        logger.error(f"Chat error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

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

