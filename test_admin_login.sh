#!/bin/bash

# Test admin login functionality
BASE_URL="http://localhost:60206"
COOKIE_JAR="/tmp/admin_cookies.txt"

echo "Testing admin login flow..."

# Step 1: Get login page and extract CSRF token
echo "1. Getting login page..."
LOGIN_PAGE=$(curl -s -c "$COOKIE_JAR" "$BASE_URL/admin/login")
CSRF_TOKEN=$(echo "$LOGIN_PAGE" | grep -o 'csrf-token.*content="[^"]*"' | sed 's/.*content="//;s/".*//')

if [ -z "$CSRF_TOKEN" ]; then
    echo "ERROR: Could not extract CSRF token"
    exit 1
fi

echo "   CSRF Token: $CSRF_TOKEN"

# Step 2: Submit login form
echo "2. Submitting login form..."
LOGIN_RESPONSE=$(curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "_token=$CSRF_TOKEN&username=admin&password=admin" \
    "$BASE_URL/admin/login" \
    -w "HTTP_CODE:%{http_code}")

echo "   Login response: $LOGIN_RESPONSE"

# Step 3: Try to access protected admin dashboard
echo "3. Accessing admin dashboard..."
DASHBOARD_RESPONSE=$(curl -s -b "$COOKIE_JAR" "$BASE_URL/admin" -w "HTTP_CODE:%{http_code}")

echo "   Dashboard response code: $(echo "$DASHBOARD_RESPONSE" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)"

# Step 4: Try to access API endpoint
echo "4. Testing API endpoint..."
API_RESPONSE=$(curl -s -b "$COOKIE_JAR" -H "Accept: application/json" "$BASE_URL/api/admin/jobs" -w "HTTP_CODE:%{http_code}")

echo "   API response: $API_RESPONSE"

# Cleanup
rm -f "$COOKIE_JAR"

echo "Test completed."
