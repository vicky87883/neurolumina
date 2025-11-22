#!/bin/bash

# Test API Endpoints Script
# Run this on your server to test the API

echo "=========================================="
echo "Testing API Endpoints"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "1. Testing Health Endpoint..."
curl -s http://localhost:8000/health
echo ""
echo ""

# Test 2: Root Endpoint
echo "2. Testing Root Endpoint..."
curl -s http://localhost:8000/
echo ""
echo ""

# Test 3: Database Test
echo "3. Testing Database Connection..."
curl -s http://localhost:8000/api/database/test
echo ""
echo ""

# Test 4: Signup Endpoint
echo "4. Testing Signup Endpoint..."
echo "Request: POST /api/auth/signup"
echo "Payload: {email: test@example.com, username: testuser, password: Test123!@#, full_name: Test User}"
echo "Response:"
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123!@#",
    "full_name": "Test User"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo ""

# Test 5: Signup with duplicate (should fail)
echo "5. Testing Duplicate Signup (should fail with 400/409)..."
echo "Request: POST /api/auth/signup (duplicate email)"
echo "Response:"
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser2",
    "password": "Test123!@#",
    "full_name": "Test User 2"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo ""

# Test 6: Signup with invalid data (should fail)
echo "6. Testing Signup with Invalid Data (should fail)..."
echo "Request: POST /api/auth/signup (short password)"
echo "Response:"
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid@example.com",
    "username": "ab",
    "password": "short",
    "full_name": "Test"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo ""

echo "=========================================="
echo "Tests Complete"
echo "=========================================="

