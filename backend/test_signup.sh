#!/bin/bash

# Quick Signup Endpoint Test
# Run this on your server: bash test_signup.sh

echo "=========================================="
echo "Testing Signup Endpoint"
echo "=========================================="
echo ""

BASE_URL="http://localhost:8000"

# Test 1: Valid Signup
echo "Test 1: Valid Signup Request"
echo "----------------------------"
curl -X POST ${BASE_URL}/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser123",
    "password": "SecurePass123!",
    "full_name": "New User"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat
echo ""
echo ""

# Test 2: Duplicate Email (should fail)
echo "Test 2: Duplicate Email (should fail)"
echo "--------------------------------------"
curl -X POST ${BASE_URL}/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "differentuser",
    "password": "SecurePass123!",
    "full_name": "Different User"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat
echo ""
echo ""

# Test 3: Short Password (should fail)
echo "Test 3: Short Password (should fail)"
echo "-------------------------------------"
curl -X POST ${BASE_URL}/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "shortpass@example.com",
    "username": "shortpass",
    "password": "short",
    "full_name": "Short Pass"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat
echo ""
echo ""

# Test 4: Short Username (should fail)
echo "Test 4: Short Username (should fail)"
echo "------------------------------------"
curl -X POST ${BASE_URL}/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "shortuser@example.com",
    "username": "ab",
    "password": "ValidPass123!",
    "full_name": "Short User"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat
echo ""
echo ""

# Test 5: Invalid Email Format (should fail)
echo "Test 5: Invalid Email Format (should fail)"
echo "------------------------------------------"
curl -X POST ${BASE_URL}/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "notanemail",
    "username": "invalidemail",
    "password": "ValidPass123!",
    "full_name": "Invalid Email"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat
echo ""
echo ""

echo "=========================================="
echo "Tests Complete"
echo "=========================================="
echo ""
echo "Expected Results:"
echo "- Test 1: Should return 200 with user and access_token"
echo "- Test 2: Should return 400/409 (email already exists)"
echo "- Test 3: Should return 400 (password too short)"
echo "- Test 4: Should return 400 (username too short)"
echo "- Test 5: Should return 422 (invalid email format)"

