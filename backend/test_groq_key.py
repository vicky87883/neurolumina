#!/usr/bin/env python3
"""
Quick script to test if Groq API key is valid
Usage: python3 test_groq_key.py
"""

import os
import sys
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

def test_groq_key():
    """Test if Groq API key is valid"""
    print("=" * 70)
    print("GROQ API KEY TEST")
    print("=" * 70)
    
    # Get API key
    api_key = os.getenv("GROQ_API_KEY")
    
    if not api_key:
        print("❌ GROQ_API_KEY not found in .env file")
        print("\nSOLUTION:")
        print("1. Open backend/.env file")
        print("2. Add: GROQ_API_KEY=your_api_key_here")
        print("3. Get API key from: https://console.groq.com")
        return False
    
    print(f"✓ API Key found (length: {len(api_key)})")
    print(f"✓ API Key starts with: {api_key[:15]}...")
    
    try:
        # Test API key
        client = Groq(api_key=api_key)
        models = client.models.list()
        
        print(f"✅ API Key is VALID!")
        print(f"✅ Available models: {len(models.data)}")
        print("\nModels available:")
        for model in models.data[:5]:  # Show first 5 models
            print(f"  - {model.id}")
        
        # Try a simple test generation
        print("\n🧪 Testing generation...")
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "Say 'Hello, World!'"}],
            max_tokens=10
        )
        
        if response.choices:
            print(f"✅ Generation test successful!")
            print(f"✅ Response: {response.choices[0].message.content}")
            print("\n" + "=" * 70)
            print("✅ YOUR LLM IS WORKING!")
            print("=" * 70)
            return True
        else:
            print("❌ Generation test failed")
            return False
            
    except Exception as e:
        error_str = str(e)
        print(f"\n❌ API Key is INVALID or expired")
        print(f"Error: {error_str}")
        
        if "401" in error_str or "Invalid API Key" in error_str:
            print("\n" + "=" * 70)
            print("HOW TO FIX:")
            print("=" * 70)
            print("1. Go to https://console.groq.com")
            print("2. Sign in (or create account)")
            print("3. Navigate to 'API Keys' section")
            print("4. Click 'Create API Key'")
            print("5. Copy the new API key")
            print("6. Open backend/.env file")
            print("7. Update: GROQ_API_KEY=your_new_api_key_here")
            print("8. Run this test again: python3 test_groq_key.py")
            print("9. Restart backend server")
        
        return False

if __name__ == "__main__":
    success = test_groq_key()
    sys.exit(0 if success else 1)



