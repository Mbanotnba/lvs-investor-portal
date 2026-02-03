#!/bin/bash
# LVS Portal - User Setup Script
# Run this whenever the Cloud Run database resets

# Configuration
API_URL="${API_URL:-https://lvs-api-657638018776.us-central1.run.app}"
BOOTSTRAP_KEY="${BOOTSTRAP_KEY:-hgU8p5v9tFVMtq5wcs9KpEJkk6WYD3oS}"

echo "=========================================="
echo "LVS Portal User Setup"
echo "API: $API_URL"
echo "=========================================="

# Step 1: Bootstrap founder account
echo ""
echo "[1/3] Creating founder account..."
BOOTSTRAP_RESULT=$(curl -s -X POST "$API_URL/admin/bootstrap" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"tayo@lolavisionsystems.com\",
    \"password\": \"Founder2026\",
    \"name\": \"Tayo Adesanya\",
    \"bootstrap_key\": \"$BOOTSTRAP_KEY\"
  }")

if echo "$BOOTSTRAP_RESULT" | grep -q '"id"'; then
  echo "  ✓ Founder account created: tayo@lolavisionsystems.com"
else
  echo "  ! Founder may already exist or error occurred"
  echo "  $BOOTSTRAP_RESULT"
fi

# Step 2: Login to get token
echo ""
echo "[2/3] Logging in to get auth token..."

# First step - email
curl -s -X POST "$API_URL/auth/email" \
  -H "Content-Type: application/json" \
  -d '{"email": "tayo@lolavisionsystems.com"}' > /dev/null

# Second step - password
LOGIN_RESULT=$(curl -s -X POST "$API_URL/auth/password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tayo@lolavisionsystems.com",
    "password": "Founder2026"
  }')

TOKEN=$(echo "$LOGIN_RESULT" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "  ✗ Failed to get auth token"
  echo "  $LOGIN_RESULT"
  exit 1
fi
echo "  ✓ Got auth token"

# Step 3: Create all other users
echo ""
echo "[3/3] Creating team and investor accounts..."

BULK_RESULT=$(curl -s -X POST "$API_URL/admin/users/bulk" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "users": [
      {"email": "randy@lolavisionsystems.com", "password": "LVS2026Randy", "name": "Randy Hollines", "portal_type": "founder"},
      {"email": "joshua@lolavisionsystems.com", "password": "LVS2026Joshua", "name": "Joshua Bush", "portal_type": "founder"},
      {"email": "jordan@lolavisionsystems.com", "password": "LVS2026Jordan", "name": "Jordan Page", "portal_type": "founder"},
      {"email": "vincent.berry2@gmail.com", "password": "LVS2026Vincent", "name": "Vincent Berry II", "portal_type": "investor"},
      {"email": "paul@theopportunityfund.com", "password": "LVS2026Paul", "name": "Paul Judge", "portal_type": "investor"},
      {"email": "nancy@theopportunityfund.com", "password": "LVS2026Nancy", "name": "Nancy Torres", "portal_type": "investor"},
      {"email": "chad@theopportunityfund.com", "password": "LVS2026Chad", "name": "Chad Harris", "portal_type": "investor"},
      {"email": "apickard@mfvpartners.com", "password": "LVS2026Aaron", "name": "Aaron Pickard", "portal_type": "investor", "company": "MFV Partners"},
      {"email": "karthee@mfvpartners.com", "password": "LVS2026Karthee", "name": "Karthee Madasamy", "portal_type": "investor", "company": "MFV Partners"},
      {"email": "natalie.warther@raymondjames.com", "password": "LVS2026Natalie", "name": "Natalie Warther", "portal_type": "investor", "company": "Raymond James"},
      {"email": "sistel@cerberus.com", "password": "LVS2026Sarah", "name": "Sarah Istel", "portal_type": "investor", "company": "Cerberus Ventures"},
      {"email": "roberthochstedler@machindustries.com", "password": "LVS2026Robert", "name": "Robert Hochstedler", "portal_type": "customer", "company": "Mach Industries"},
      {"email": "caffouda@anduril.com", "password": "LVS2026Chaffra", "name": "Chaffra Affouda", "portal_type": "customer", "company": "Anduril"},
      {"email": "kevin@glidtech.us", "password": "LVS2026Kevin", "name": "Kevin Damoa", "portal_type": "customer", "company": "Glid Technologies"},
      {"email": "maxwell@terrahaptix.com", "password": "LVS2026Maxwell", "name": "Maxwell Maduka", "portal_type": "customer", "company": "Terrahaptix"},
      {"email": "sebastian@koniku.com", "password": "LVS2026Jos", "name": "Jos Sebastian", "portal_type": "customer", "company": "Koniku"},
      {"email": "agabi@koniku.com", "password": "LVS2026Osh", "name": "Osh Agabi", "portal_type": "customer", "company": "Koniku"}
    ]
  }')

echo "$BULK_RESULT" | grep -o '"created":\[[^]]*\]' | tr ',' '\n' | while read line; do
  email=$(echo "$line" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$email" ]; then
    echo "  ✓ Created: $email"
  fi
done

CREATED_COUNT=$(echo "$BULK_RESULT" | grep -o '"created":[0-9]*' | cut -d':' -f2)
FAILED_COUNT=$(echo "$BULK_RESULT" | grep -o '"failed":[0-9]*' | cut -d':' -f2)

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "Created: ${CREATED_COUNT:-0} users"
echo "Failed: ${FAILED_COUNT:-0} users"
echo "=========================================="
echo ""
echo "User Accounts:"
echo "  Founders:"
echo "    tayo@lolavisionsystems.com     / Founder2026"
echo "    randy@lolavisionsystems.com    / LVS2026Randy"
echo "    joshua@lolavisionsystems.com   / LVS2026Joshua"
echo "    jordan@lolavisionsystems.com   / LVS2026Jordan"
echo ""
echo "  Investors:"
echo "    vincent.berry2@gmail.com           / LVS2026Vincent"
echo "    paul@theopportunityfund.com        / LVS2026Paul"
echo "    nancy@theopportunityfund.com       / LVS2026Nancy"
echo "    chad@theopportunityfund.com        / LVS2026Chad"
echo "    apickard@mfvpartners.com           / LVS2026Aaron"
echo "    karthee@mfvpartners.com            / LVS2026Karthee"
echo "    natalie.warther@raymondjames.com   / LVS2026Natalie"
echo "    sistel@cerberus.com                / LVS2026Sarah"
echo ""
echo "  Customers:"
echo "    roberthochstedler@machindustries.com / LVS2026Robert  (Mach Industries)"
echo "    caffouda@anduril.com                  / LVS2026Chaffra (Anduril)"
echo "    kevin@glidtech.us                     / LVS2026Kevin   (Glid Technologies)"
echo "    maxwell@terrahaptix.com               / LVS2026Maxwell (Terrahaptix)"
echo "    sebastian@koniku.com                  / LVS2026Jos     (Koniku)"
echo "    agabi@koniku.com                      / LVS2026Osh     (Koniku)"
echo ""
