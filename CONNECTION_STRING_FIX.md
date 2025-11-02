# PostgreSQL Connection String Fix

## Your Original Connection String
```
postgresql://postgres:Intelsupabase@786@db.bzexdvmsxtsafnhxjmph.supabase.co:5432/postgres
```

## Issue Identified
❌ **Problem**: Your password contains an `@` symbol (`Intelsupabase@786`), which conflicts with the connection string format. The `@` is used as a delimiter between credentials and host, so it breaks the parsing.

## Fixed Connection String
✅ **Corrected** (with URL-encoding):
```
postgresql://postgres:Intelsupabase%40786@db.bzexdvmsxtsafnhxjmph.supabase.co:5432/postgres
```

## Explanation
In PostgreSQL connection strings:
- Format: `postgresql://username:password@host:port/database`
- Special characters in password must be URL-encoded
- `@` symbol → `%40`
- So `Intelsupabase@786` becomes `Intelsupabase%40786`

## How to Update Your .env File

### Step 1: Open backend/.env
```bash
cd backend
nano .env
# or use your preferred editor
```

### Step 2: Update DATABASE_URL
Replace the connection string with the corrected version:

```env
# Groq API Key
GROQ_API_KEY=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

# PostgreSQL Database (FIXED - URL-encoded password)
DATABASE_URL=postgresql://postgres:Intelsupabase%40786@db.bzexdvmsxtsafnhxjmph.supabase.co:5432/postgres

# Async connection string
ASYNC_DATABASE_URL=postgresql+asyncpg://postgres:Intelsupabase%40786@db.bzexdvmsxtsafnhxjmph.supabase.co:5432/postgres
```

### Step 3: Save and Test
```bash
# Test the connection
cd backend
source venv/bin/activate
python -c "from services.database import db_manager; import asyncio; print(asyncio.run(db_manager.test_connection()))"
```

Or start your server and test:
```bash
uvicorn app:app --reload --port 8000
# In another terminal:
curl http://localhost:8000/api/database/test
```

## Alternative: Change Password (If URL-encoding doesn't work)
If you prefer, you can change your Supabase database password to one without special characters:

1. Go to Supabase Dashboard
2. Settings → Database
3. Reset Database Password
4. Use a password without `@` symbol (e.g., `Intelsupabase786` or `IntelSupabase786!`)

## Common Special Characters That Need Encoding

| Character | URL Encoding |
|-----------|--------------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |
| `=` | `%3D` |

## Your Connection Details Summary

- **Provider**: Supabase ✅
- **Username**: postgres
- **Password**: Intelsupabase@786 (encode as Intelsupabase%40786)
- **Host**: db.bzexdvmsxtsafnhxjmph.supabase.co
- **Port**: 5432
- **Database**: postgres

## Quick Verification Commands

### Test Connection String Format
```bash
python3 -c "
from urllib.parse import urlparse
conn = 'postgresql://postgres:Intelsupabase%40786@db.bzexdvmsxtsafnhxjmph.supabase.co:5432/postgres'
parsed = urlparse(conn)
print(f'Username: {parsed.username}')
print(f'Password: {parsed.password}')
print(f'Host: {parsed.hostname}')
print(f'Port: {parsed.port}')
print(f'Database: {parsed.path[1:]}')
"
```

### Test Database Connection
```bash
cd backend
source venv/bin/activate
python -c "
import asyncio
from services.database import db_manager
result = asyncio.run(db_manager.test_connection())
print(result)
"
```

## Expected Success Response
If connection works, you should see:
```json
{
  "status": "connected",
  "database": "postgres",
  "version": "PostgreSQL x.x.x",
  "message": "Successfully connected to PostgreSQL"
}
```

---

**Note**: After updating the .env file, make sure to restart your backend server for changes to take effect.

