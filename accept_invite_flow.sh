#!/bin/bash
set -e

# Step 1: Build frontend
cd packages/web
echo "Running npm run build in packages/web..."
npm run build
cd ../..

# Step 2: Test POST to /invites/accept endpoint
# Example test data (replace with real token/email/password if needed)
INVITE_TOKEN="test-token"
EMAIL="test@example.com"
PASSWORD="testpassword"

API_URL="http://localhost:3000/api/invites/accept"
echo "Testing POST to $API_URL with curl..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$INVITE_TOKEN\", \"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}"

# Step 3: Git add all files
cd /workspaces/local-pro-sites-platform
echo "Running git add . ..."
git add .

# Step 4: Git commit
COMMIT_MSG="feat(web): complete AcceptInvite flow"
echo "Running git commit..."
git commit -m "$COMMIT_MSG"

# Step 5: Git push
echo "Running git push..."
git push

echo "Script completed."
