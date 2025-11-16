# 🔧 Fix LLM Not Working

## Problem
The LLM/chat functionality is not working because the Groq API key is **invalid or expired**.

## ✅ Quick Fix (5 minutes)

### Step 1: Get a New API Key
1. Go to **https://console.groq.com**
2. Sign in (or create a free account)
3. Click on **"API Keys"** in the sidebar
4. Click **"Create API Key"**
5. Copy the new API key (starts with `gsk_`)

### Step 2: Update .env File
1. Open `backend/.env` file
2. Find the line: `GROQ_API_KEY=...`
3. Replace with your new key:
   ```
   GROQ_API_KEY=your_new_api_key_here
   ```
4. Save the file

### Step 3: Restart Backend Server
```bash
# Stop the server (Ctrl+C in the terminal where it's running)

# Start it again
cd backend
source venv/bin/activate
uvicorn app:app --reload --port 8000
```

### Step 4: Test
```bash
curl -X POST http://localhost:8000/api/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

## 🧪 Test Your API Key

Run this command to test if your API key works:

```bash
cd backend
source venv/bin/activate
python3 -c "
from groq import Groq
import os
from dotenv import load_dotenv
load_dotenv()
api_key = os.getenv('GROQ_API_KEY')
if api_key:
    try:
        client = Groq(api_key=api_key)
        models = client.models.list()
        print('✅ API Key is VALID!')
        print(f'✅ Found {len(models.data)} models')
    except Exception as e:
        print('❌ API Key is INVALID')
        print(f'Error: {e}')
else:
    print('❌ API Key not found in .env file')
"
```

## 🔍 Common Issues

### Issue 1: API Key Not Found
**Error:** `GROQ_API_KEY environment variable is required`

**Solution:**
- Make sure `backend/.env` file exists
- Add `GROQ_API_KEY=your_key_here` to the file
- Restart the server

### Issue 2: Invalid API Key
**Error:** `Error code: 401 - Invalid API Key`

**Solution:**
- Get a new API key from https://console.groq.com
- Update `backend/.env` file
- Restart the server

### Issue 3: API Key Expired
**Error:** `Error code: 401 - Invalid API Key`

**Solution:**
- API keys can expire or be revoked
- Create a new API key
- Update `.env` file
- Restart the server

### Issue 4: Server Not Running
**Error:** `Connection refused` or `Cannot connect to server`

**Solution:**
```bash
cd backend
source venv/bin/activate
uvicorn app:app --reload --port 8000
```

## 📝 .env File Format

Your `backend/.env` file should look like this:

```env
# Groq API Key
GROQ_API_KEY=gsk_your_actual_api_key_here

# Database (optional)
DATABASE_URL=postgresql://...
ASYNC_DATABASE_URL=postgresql+asyncpg://...
```

## 🎯 Verify It's Working

After updating the API key, test the chat:

```bash
# Test chat endpoint
curl -X POST http://localhost:8000/api/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Expected response:
# {
#   "response": "...",
#   "usage": {...}
# }
```

Or test in the frontend:
1. Open http://localhost:3000
2. Go to "Neural Chat"
3. Type a message
4. Should get a response

## 🆘 Still Not Working?

1. **Check server logs:**
   ```bash
   # Look at the terminal where backend is running
   # Check for error messages
   ```

2. **Verify .env file:**
   ```bash
   cd backend
   cat .env | grep GROQ_API_KEY
   ```

3. **Test API key directly:**
   ```bash
   cd backend
   source venv/bin/activate
   python3 -c "from groq import Groq; import os; from dotenv import load_dotenv; load_dotenv(); client = Groq(api_key=os.getenv('GROQ_API_KEY')); print('✅ Working!' if client.models.list() else '❌ Not working')"
   ```

4. **Check server is running:**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"healthy"}
   ```

## 📚 Additional Resources

- Groq Console: https://console.groq.com
- Groq Documentation: https://console.groq.com/docs
- API Keys Guide: https://console.groq.com/keys

## ✅ Success Checklist

- [ ] Got new API key from Groq Console
- [ ] Updated `backend/.env` file
- [ ] Restart backend server
- [ ] Test API key works
- [ ] Test chat endpoint
- [ ] Frontend chat works

---

**After following these steps, your LLM should be working!** 🚀










