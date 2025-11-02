from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.training_manager import TrainingManager

router = APIRouter()
training_manager = TrainingManager()

class TrainingStartRequest(BaseModel):
    num_steps: Optional[int] = 100
    batch_size: Optional[int] = 32

class TrainingStatusResponse(BaseModel):
    is_training: bool
    current_epoch: int
    dataset_size: int
    status: str
    steps_completed: int
    mean_reward: float
    latest_loss: float

class ExampleRequest(BaseModel):
    prompt: str
    response: str
    reward: float
    metadata: Optional[dict] = None

@router.post("/start")
async def start_training(request: TrainingStartRequest):
    """Start training process"""
    try:
        result = training_manager.start_training(
            num_steps=request.num_steps,
            batch_size=request.batch_size
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status", response_model=TrainingStatusResponse)
async def get_training_status():
    """Get current training status"""
    try:
        status = training_manager.get_status()
        # Ensure all required fields have valid defaults
        safe_status = {
            "is_training": status.get("is_training", False),
            "current_epoch": status.get("current_epoch", 0),
            "dataset_size": status.get("dataset_size", 0),
            "status": status.get("status", "not_started"),
            "steps_completed": status.get("steps_completed", 0),
            "mean_reward": float(status.get("mean_reward", 0.0)),
            "latest_loss": float(status.get("latest_loss", 0.0))
        }
        return TrainingStatusResponse(**safe_status)
    except Exception as e:
        import traceback
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error getting training status: {str(e)}\n{traceback.format_exc()}")
        # Return safe default values on error
        return TrainingStatusResponse(
            is_training=False,
            current_epoch=0,
            dataset_size=0,
            status="error",
            steps_completed=0,
            mean_reward=0.0,
            latest_loss=0.0
        )

@router.post("/example")
async def add_example(request: ExampleRequest):
    """Add a training example"""
    try:
        training_manager.add_training_example(
            prompt=request.prompt,
            response=request.response,
            reward=request.reward,
            metadata=request.metadata
        )
        return {
            "status": "added",
            "dataset_size": len(training_manager.dataset.examples)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/examples")
async def get_examples(limit: Optional[int] = None):
    """Get training examples"""
    try:
        examples = training_manager.dataset.get_examples(limit=limit)
        return {"examples": examples, "count": len(examples)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/checkpoint/load")
async def load_checkpoint(checkpoint_path: str):
    """Load a checkpoint"""
    try:
        result = training_manager.load_checkpoint(checkpoint_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

