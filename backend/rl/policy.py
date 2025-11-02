from typing import List, Dict, Any
import torch
import torch.nn as nn
import torch.nn.functional as F

class PolicyNetwork(nn.Module):
    """Neural network policy for RL"""
    
    def __init__(self, input_dim: int = 768, hidden_dim: int = 512, output_dim: int = 512):
        super(PolicyNetwork, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.fc3 = nn.Linear(hidden_dim, output_dim)
        self.dropout = nn.Dropout(0.1)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass through the network"""
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.fc3(x)
        return x

class RLPolicy:
    """Policy wrapper for RL training"""
    
    def __init__(self, device: str = "cpu"):
        self.device = device
        self.policy_net = PolicyNetwork().to(device)
        self.value_net = PolicyNetwork().to(device)
        self.optimizer = torch.optim.Adam(
            list(self.policy_net.parameters()) + list(self.value_net.parameters()),
            lr=3e-4
        )
    
    def get_action(self, state: torch.Tensor) -> tuple:
        """Get action and value from state"""
        with torch.no_grad():
            action_logits = self.policy_net(state)
            value = self.value_net(state)
        return action_logits, value
    
    def update(self, states: torch.Tensor, actions: torch.Tensor, 
               rewards: torch.Tensor, advantages: torch.Tensor) -> Dict[str, float]:
        """Update policy using PPO"""
        # This is a simplified version - full PPO would include clipping, etc.
        action_logits = self.policy_net(states)
        values = self.value_net(states)
        
        # Compute loss (simplified)
        policy_loss = -(action_logits * advantages).mean()
        value_loss = F.mse_loss(values.squeeze(), rewards)
        
        total_loss = policy_loss + 0.5 * value_loss
        
        self.optimizer.zero_grad()
        total_loss.backward()
        self.optimizer.step()
        
        return {
            "policy_loss": policy_loss.item(),
            "value_loss": value_loss.item(),
            "total_loss": total_loss.item()
        }
    
    def save(self, path: str):
        """Save policy to checkpoint"""
        torch.save({
            "policy_state_dict": self.policy_net.state_dict(),
            "value_state_dict": self.value_net.state_dict(),
            "optimizer_state_dict": self.optimizer.state_dict()
        }, path)
    
    def load(self, path: str):
        """Load policy from checkpoint"""
        checkpoint = torch.load(path, map_location=self.device)
        self.policy_net.load_state_dict(checkpoint["policy_state_dict"])
        self.value_net.load_state_dict(checkpoint["value_state_dict"])
        self.optimizer.load_state_dict(checkpoint["optimizer_state_dict"])

