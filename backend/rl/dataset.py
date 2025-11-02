from typing import List, Dict, Any, Optional
import json
import os

class TrainingDataset:
    """Manages training dataset for RL"""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        self.dataset_file = os.path.join(data_dir, "training_dataset.jsonl")
        self.examples: List[Dict[str, Any]] = []
        self.load_dataset()
    
    def load_dataset(self):
        """Load dataset from file"""
        if os.path.exists(self.dataset_file):
            with open(self.dataset_file, "r") as f:
                for line in f:
                    if line.strip():
                        self.examples.append(json.loads(line))
    
    def add_example(
        self,
        prompt: str,
        response: str,
        reward: float = 0.0,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Add a training example"""
        example = {
            "prompt": prompt,
            "response": response,
            "reward": reward,
            "metadata": metadata or {}
        }
        self.examples.append(example)
        self._save_example(example)
    
    def _save_example(self, example: Dict[str, Any]):
        """Save example to file"""
        with open(self.dataset_file, "a") as f:
            f.write(json.dumps(example) + "\n")
    
    def get_examples(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get training examples"""
        if limit:
            return self.examples[-limit:]
        return self.examples
    
    def get_batch(self, batch_size: int) -> List[Dict[str, Any]]:
        """Get a batch of examples for training"""
        if len(self.examples) == 0:
            return []
        
        # Return last batch_size examples
        return self.examples[-batch_size:] if len(self.examples) >= batch_size else self.examples

