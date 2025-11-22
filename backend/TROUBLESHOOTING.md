# Troubleshooting API Connection Issues

## Problem: Connection Timeout

If you're getting connection timeouts when trying to access your API, check these:

### 1. Check if Application is Running

SSH into your server and check:

```bash
# Check if uvicorn process is running
ps aux | grep uvicorn

# Or check if port 8000 is listening
netstat -tuln | grep 8000
# Or
ss -tuln | grep 8000
```

### 2. Check Application Logs

```bash
cd /www/wwwroot/neurolumina/backend
# Check if there are any error logs
tail -f logs/*.log
# Or if running in terminal, check the output
```

### 3. Test Locally on Server

Run this on your server:

```bash
cd /www/wwwroot/neurolumina/backend
source venv/bin/activate

# Test locally
curl http://localhost:8000/health
curl http://localhost:8000/
```

### 4. Check AWS Security Group

**Important:** Make sure port 8000 is open in your AWS Security Group!

1. Go to AWS Console → EC2 → Security Groups
2. Find your instance's security group
3. Edit Inbound Rules
4. Add rule:
   - Type: Custom TCP
   - Port: 8000
   - Source: 0.0.0.0/0 (or your IP for security)
   - Description: FastAPI Backend

### 5. Check aaPanel Firewall

In aaPanel:
1. Go to Security → Firewall
2. Make sure port 8000 is allowed
3. If not, add port 8000

### 6. Check if Application Crashed

```bash
# Check recent logs
journalctl -u your-service-name -n 50

# Or if using screen/tmux
screen -r
# or
tmux ls
```

### 7. Restart Application

```bash
cd /www/wwwroot/neurolumina/backend
source venv/bin/activate

# Kill existing process
pkill -f uvicorn

# Start again
uvicorn app:app --host 0.0.0.0 --port 8000
```

### 8. Test from Server Itself

Run the test script on your server:

```bash
cd /www/wwwroot/neurolumina/backend
chmod +x test_api.sh
./test_api.sh
```

## Common Issues

### Issue: "Address already in use"
**Solution:** Port 8000 is already in use
```bash
# Find what's using port 8000
lsof -i :8000
# Kill it
kill -9 <PID>
```

### Issue: "Module not found"
**Solution:** Virtual environment not activated
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: "Database connection error"
**Solution:** Set DATABASE_URL in .env file (see SETUP_ENV.md)

### Issue: "Permission denied"
**Solution:** Check file permissions
```bash
chmod +x test_api.sh
chown -R ubuntu:ubuntu /www/wwwroot/neurolumina/backend
```

## Quick Health Check Commands

```bash
# 1. Is app running?
ps aux | grep uvicorn

# 2. Is port open?
netstat -tuln | grep 8000

# 3. Can I connect locally?
curl http://localhost:8000/health

# 4. Check firewall
sudo ufw status
# or
sudo iptables -L

# 5. Check AWS Security Group
# (Do this in AWS Console)
```

## Running in Background

To run the application in the background:

### Option 1: Using screen
```bash
screen -S backend
cd /www/wwwroot/neurolumina/backend
source venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000
# Press Ctrl+A then D to detach
```

### Option 2: Using nohup
```bash
cd /www/wwwroot/neurolumina/backend
source venv/bin/activate
nohup uvicorn app:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &
```

### Option 3: Using systemd (Recommended for production)
Create `/etc/systemd/system/intellithesis-backend.service`:

```ini
[Unit]
Description=IntelliThesis Backend API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/www/wwwroot/neurolumina/backend
Environment="PATH=/www/wwwroot/neurolumina/backend/venv/bin"
ExecStart=/www/wwwroot/neurolumina/backend/venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable intellithesis-backend
sudo systemctl start intellithesis-backend
sudo systemctl status intellithesis-backend
```

## Testing from External Network

Once everything is set up, test from your local machine:

```bash
# Replace with your server IP
curl http://13.203.154.38:8000/health

# Test signup
curl -X POST http://13.203.154.38:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123!@#",
    "full_name": "Test User"
  }'
```

