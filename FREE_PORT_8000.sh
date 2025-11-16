#!/bin/bash

# Script to free port 8000

echo "Checking for processes using port 8000..."

# Find process using port 8000
PID=$(lsof -ti:8000)

if [ -z "$PID" ]; then
    echo "✅ Port 8000 is already free"
else
    echo "Found process(es) using port 8000: $PID"
    echo "Killing process(es)..."
    kill -9 $PID
    sleep 1
    
    # Verify
    if [ -z "$(lsof -ti:8000)" ]; then
        echo "✅ Port 8000 is now free"
    else
        echo "❌ Failed to free port 8000"
    fi
fi










