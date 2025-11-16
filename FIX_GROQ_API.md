# Fix Groq API Key Error

## Error Message
```
Error code: 401 - Invalid API Key
```

## Solution

### Step 1: Get New API Key
1. Go to https://console.groq.com
2. Sign in (or create account)
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy the new API key (starts with `gsk_`)

### Step 2: Update .env File
1. Open `backend/.env` file
2. Replace the old API key:
   ```
   GROQ_API_KEY=your_new_api_key_here
   ```
3. Save the file

### Step 3: Restart Server
```bash
# Stop the server (Ctrl+C)
# Then restart:
cd backend
source venv/bin/activate
uvicorn app:app --reload --port 8000
```

### Step 4: Test
```bash
curl http://localhost:8000/api/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

## Alternative: Test API Key
```bash
cd backend
source venv/bin/activate
python3 -c "from groq import Groq; import os; from dotenv import load_dotenv; load_dotenv(); client = Groq(api_key=os.getenv('GROQ_API_KEY')); print('✓ API Key is valid!' if client.models.list() else '❌ Invalid')"
```










