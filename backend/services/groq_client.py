import os
from typing import Optional, Dict, Any
from groq import Groq
import json
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

class GroqClient:
    """Client for interacting with Groq API"""
    
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is required")
        self.client = Groq(api_key=api_key)
        # Use a verified available model
        self.default_model = "llama-3.3-70b-versatile"
        # Fallback models in case of issues
        self.fallback_models = ["llama-3.1-70b-versatile", "llama-3.1-8b-instant"]
    
    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate text using Groq API"""
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            selected_model = model or self.default_model
            logger.info(f"Calling Groq API with model: {selected_model}")
            
            # Use async client or run sync call in executor for compatibility
            import asyncio
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            # Try the requested/default model first, then fallback if needed
            models_to_try = [selected_model] + ([m for m in self.fallback_models if m != selected_model])
            last_error = None
            response = None
            
            for model_to_try in models_to_try:
                try:
                    def make_request(m=model_to_try):
                        return self.client.chat.completions.create(
                            model=m,
                            messages=messages,
                            temperature=temperature,
                            max_tokens=max_tokens
                        )
                    
                    response = await loop.run_in_executor(None, make_request)
                    if response and response.choices:
                        break
                except Exception as e:
                    last_error = e
                    logger.warning(f"Failed with model {model_to_try}: {str(e)}")
                    if model_to_try == models_to_try[-1]:
                        raise last_error
                    continue
            
            if not response or not response.choices:
                raise Exception(f"Failed to get response from Groq API. Last error: {str(last_error)}")
            
            return {
                "text": response.choices[0].message.content or "",
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                    "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                    "total_tokens": response.usage.total_tokens if response.usage else 0
                },
                "model": response.model
            }
        except Exception as e:
            logger.error(f"Groq API error: {str(e)}", exc_info=True)
            raise Exception(f"Groq API error: {str(e)}")
    
    async def generate_for_training(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.9,
        max_tokens: int = 512
    ) -> str:
        """Generate text specifically for training purposes"""
        response = await self.generate(
            prompt=prompt,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens
        )
        return response["text"]

