# Environment Variables Setup for Backend

## Quick Fix for Database Error

The error "[Errno -2] Name or service not known]" means the database hostname cannot be resolved. 

### Option 1: Set Up Database (Recommended)

1. **Create a `.env` file in your backend directory:**
   ```bash
   cd /www/wwwroot/neurolumina/backend
   nano .env
   ```

2. **Add your database connection string:**
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   GROQ_API_KEY=your_groq_api_key_here
   JWT_SECRET_KEY=your_secret_key_here_change_this
   ```

3. **Example for Supabase:**
   ```env
   DATABASE_URL=postgresql://postgres:your_password@db.xxxxx.supabase.co:5432/postgres
   GROQ_API_KEY=gsk_xxxxxxxxxxxxx
   JWT_SECRET_KEY=your-super-secret-key-change-this-in-production
   ```

4. **Example for local PostgreSQL:**
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/llm_training
   GROQ_API_KEY=gsk_xxxxxxxxxxxxx
   JWT_SECRET_KEY=your-super-secret-key-change-this-in-production
   ```

5. **Save and exit (Ctrl+X, then Y, then Enter)**

6. **Restart your application**

### Option 2: Run Without Database (Temporary)

The application will now run without database if DATABASE_URL is not set. However, features like:
- User authentication
- Blog posts
- Career listings
- Scraped content storage

Will not work. Only web scraping and AI features will work.

## Required Environment Variables

### 1. DATABASE_URL (Optional but Recommended)
- **Format:** `postgresql://username:password@host:port/database`
- **Example:** `postgresql://postgres:mypassword@db.example.com:5432/mydb`
- **For Supabase:** Get from your Supabase project settings → Database → Connection string
- **For local:** `postgresql://postgres:password@localhost:5432/llm_training`

### 2. GROQ_API_KEY (Required for AI features)
- Get from: https://console.groq.com
- Sign up and create an API key
- Format: `gsk_xxxxxxxxxxxxx`

### 3. JWT_SECRET_KEY (Required for authentication)
- Generate a random secret key
- You can generate one using:
  ```python
  import secrets
  print(secrets.token_urlsafe(32))
  ```
- Or use any long random string

## Setting Environment Variables in aaPanel

### Method 1: Using .env file (Recommended)

1. SSH into your server or use aaPanel terminal
2. Navigate to your backend directory:
   ```bash
   cd /www/wwwroot/neurolumina/backend
   ```
3. Create `.env` file:
   ```bash
   nano .env
   ```
4. Add your variables (see format above)
5. Save and exit

### Method 2: Using aaPanel Environment Variables

1. Go to your Python project in aaPanel
2. Find "Environment Variables" or "Environment" section
3. Add variables:
   - Key: `DATABASE_URL`
   - Value: `postgresql://user:pass@host:port/db`
4. Repeat for other variables
5. Save and restart

### Method 3: Export in Shell (Temporary)

```bash
export DATABASE_URL="postgresql://user:pass@host:port/db"
export GROQ_API_KEY="gsk_xxxxx"
export JWT_SECRET_KEY="your-secret-key"
```

## Verify Environment Variables

Test if variables are loaded:

```bash
cd /www/wwwroot/neurolumina/backend
source venv/bin/activate
python3 -c "from dotenv import load_dotenv; import os; load_dotenv(); print('DATABASE_URL:', os.getenv('DATABASE_URL', 'NOT SET')); print('GROQ_API_KEY:', 'SET' if os.getenv('GROQ_API_KEY') else 'NOT SET')"
```

## Common Database URLs

### Supabase
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Neon
```
postgresql://[user]:[password]@[hostname]/[database]?sslmode=require
```

### Local PostgreSQL
```
postgresql://postgres:password@localhost:5432/llm_training
```

### Railway
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

## Troubleshooting

### Error: "Name or service not known"
- Check if DATABASE_URL is set correctly
- Verify the hostname is reachable: `ping db.example.com`
- Check if you need SSL: Add `?sslmode=require` to URL

### Error: "Connection refused"
- Verify PostgreSQL is running
- Check if port is correct (usually 5432)
- Check firewall settings

### Error: "Authentication failed"
- Verify username and password are correct
- Check if user has proper permissions

### Application runs but database features don't work
- Check if DATABASE_URL is set
- Check application logs for database errors
- Verify database connection: `curl http://localhost:8000/api/database/test`

## Security Notes

1. **Never commit `.env` file to Git**
2. **Use strong JWT_SECRET_KEY in production**
3. **Keep database credentials secure**
4. **Use environment variables, not hardcoded values**
5. **Rotate API keys regularly**

## Testing Database Connection

After setting up, test the connection:

```bash
curl http://localhost:8000/api/database/test
```

Expected response:
```json
{
  "status": "connected",
  "database": "postgres",
  "version": "PostgreSQL 15.x",
  "message": "Successfully connected to PostgreSQL"
}
```

