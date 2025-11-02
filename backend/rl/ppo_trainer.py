from typing import Dict, List, Any, Optional
import torch
import numpy as np
from .policy import RLPolicy
from .dataset import TrainingDataset

class PPOTrainer:
    """Proximal Policy Optimization trainer"""
    
    def __init__(
        self,
        policy: RLPolicy,
        dataset: TrainingDataset,
        device: str = "cpu",
        clip_epsilon: float = 0.2,
        gamma: float = 0.99,
        lambda_gae: float = 0.95
    ):
        self.policy = policy
        self.dataset = dataset
        self.device = device
        self.clip_epsilon = clip_epsilon
        self.gamma = gamma
        self.lambda_gae = lambda_gae
        self.training_history: List[Dict[str, Any]] = []
    
    def compute_advantages(
        self,
        rewards: List[float],
        values: List[float],
        next_value: float = 0.0
    ) -> np.ndarray:
        """Compute advantages using GAE (Generalized Advantage Estimation)"""
        advantages = []
        gae = 0
        
        for t in reversed(range(len(rewards))):
            delta = rewards[t] + self.gamma * next_value - values[t]
            gae = delta + self.gamma * self.lambda_gae * gae
            advantages.insert(0, gae)
            next_value = values[t]
        
        return np.array(advantages)
    
    def train_step(self, batch_size: int = 32) -> Dict[str, Any]:
        """Perform one training step"""
        batch = self.dataset.get_batch(batch_size)
        
        if len(batch) == 0:
            return {"error": "No training data available"}
        
        # Extract data
        rewards = [example["reward"] for example in batch]
        
        # Convert to tensors (simplified - in practice, states would come from embeddings)
        # For now, we'll use dummy states
        states = torch.randn(len(batch), 768).to(self.device)
        values = torch.randn(len(batch), 1).to(self.device).squeeze().tolist()
        
        # Compute advantages
        advantages = self.compute_advantages(rewards, values)
        advantages_tensor = torch.FloatTensor(advantages).to(self.device)
        rewards_tensor = torch.FloatTensor(rewards).to(self.device)
        
        # Normalize advantages
        advantages_tensor = (advantages_tensor - advantages_tensor.mean()) / (advantages_tensor.std() + 1e-8)
        
        # Get dummy actions (in practice, these would be token logits)
        actions = torch.randn(len(batch), 512).to(self.device)
        
        # Update policy
        losses = self.policy.update(states, actions, rewards_tensor, advantages_tensor)
        
        # Record training step
        step_info = {
            "step": len(self.training_history) + 1,
            "batch_size": len(batch),
            "mean_reward": np.mean(rewards),
            **losses
        }
        self.training_history.append(step_info)
        
        return step_info
    
    def train(self, num_steps: int = 100, batch_size: int = 32) -> List[Dict[str, Any]]:
        """Train for multiple steps"""
        results = []
        for i in range(num_steps):
            result = self.train_step(batch_size)
            results.append(result)
        return results
    
    def get_training_status(self) -> Dict[str, Any]:
        """Get current training status"""
        if len(self.training_history) == 0:
            return {
                "status": "not_started",
                "steps_completed": 0,
                "mean_reward": 0.0
            }
        
        recent_history = self.training_history[-10:] if len(self.training_history) > 10 else self.training_history
        
        return {
            "status": "training",
            "steps_completed": len(self.training_history),
            "mean_reward": np.mean([h["mean_reward"] for h in recent_history]),
            "latest_loss": self.training_history[-1]["total_loss"] if self.training_history else 0.0
        }

