from typing import Dict, Any, Optional
import os
from rl.policy import RLPolicy
from rl.dataset import TrainingDataset
from rl.ppo_trainer import PPOTrainer
from services.groq_client import GroqClient

class TrainingManager:
    """Manages RL training process"""
    
    def __init__(self):
        self.checkpoint_dir = "checkpoints"
        os.makedirs(self.checkpoint_dir, exist_ok=True)
        
        self.policy = RLPolicy()
        self.dataset = TrainingDataset()
        self.trainer = PPOTrainer(self.policy, self.dataset)
        self._groq_client = None
        
        self.is_training = False
        self.current_epoch = 0
    
    @property
    def groq_client(self) -> GroqClient:
        """Lazy initialization of Groq client"""
        if self._groq_client is None:
            self._groq_client = GroqClient()
        return self._groq_client
    
    def start_training(
        self,
        num_steps: int = 100,
        batch_size: int = 32
    ) -> Dict[str, Any]:
        """Start training process"""
        if self.is_training:
            return {"error": "Training already in progress"}
        
        self.is_training = True
        try:
            results = self.trainer.train(num_steps=num_steps, batch_size=batch_size)
            
            # Save checkpoint
            checkpoint_path = os.path.join(
                self.checkpoint_dir,
                f"checkpoint_epoch_{self.current_epoch}.pt"
            )
            self.policy.save(checkpoint_path)
            self.current_epoch += 1
            
            return {
                "status": "completed",
                "steps": len(results),
                "results": results[-10:] if len(results) > 10 else results
            }
        except Exception as e:
            return {"error": str(e)}
        finally:
            self.is_training = False
    
    def add_training_example(
        self,
        prompt: str,
        response: str,
        reward: float = 0.0,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Add an example to the training dataset"""
        self.dataset.add_example(prompt, response, reward, metadata)
    
    def generate_response(self, prompt: str) -> str:
        """Generate response using Groq API"""
        return self.groq_client.generate_for_training(prompt)
    
    def get_status(self) -> Dict[str, Any]:
        """Get current training status"""
        trainer_status = self.trainer.get_training_status()
        return {
            "is_training": self.is_training,
            "current_epoch": self.current_epoch,
            "dataset_size": len(self.dataset.examples),
            **trainer_status
        }
    
    def load_checkpoint(self, checkpoint_path: str):
        """Load a checkpoint"""
        full_path = os.path.join(self.checkpoint_dir, checkpoint_path)
        if os.path.exists(full_path):
            self.policy.load(full_path)
            return {"status": "loaded", "path": checkpoint_path}
        return {"error": "Checkpoint not found"}

