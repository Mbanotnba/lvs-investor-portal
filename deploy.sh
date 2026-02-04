#!/bin/bash
#===============================================================================
# LVS Portal - Production Deployment Script
#===============================================================================
# This script deploys the frontend to Firebase Hosting with safety checks.
#
# SAFEGUARDS:
# 1. Requires explicit confirmation
# 2. Shows what will be deployed before deploying
# 3. Logs all deployments
# 4. Can only be run from the project root
#===============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DEPLOY_LOG="deployments.log"
PROJECT_ROOT="/Users/admin/lvs-investor-portal"

# Ensure we're in the right directory
if [ "$(pwd)" != "$PROJECT_ROOT" ]; then
    echo -e "${RED}ERROR: Must run from project root: $PROJECT_ROOT${NC}"
    exit 1
fi

# Check firebase.json exists and hasn't been tampered with
if [ ! -f "firebase.json" ]; then
    echo -e "${RED}ERROR: firebase.json not found${NC}"
    exit 1
fi

# Verify firebase.json checksum (update this after initial setup)
EXPECTED_CHECKSUM="0d5ba80228f773c586aec52572a978076ddec24eeebefd6153b8a7a519a2b6b9"
if [ "$EXPECTED_CHECKSUM" != "INITIAL_SETUP" ]; then
    CURRENT_CHECKSUM=$(shasum -a 256 firebase.json | cut -d' ' -f1)
    if [ "$CURRENT_CHECKSUM" != "$EXPECTED_CHECKSUM" ]; then
        echo -e "${RED}ERROR: firebase.json has been modified!${NC}"
        echo "Expected: $EXPECTED_CHECKSUM"
        echo "Current:  $CURRENT_CHECKSUM"
        echo ""
        echo "If this change was intentional, update EXPECTED_CHECKSUM in deploy.sh"
        exit 1
    fi
fi

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  LVS Portal - Production Deployment${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Show what will be deployed
echo -e "${GREEN}Files to be deployed:${NC}"
find . -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.webp" -o -name "*.png" -o -name "*.jpg" -o -name "*.pdf" \) \
    -not -path "./backend/*" \
    -not -path "./venv/*" \
    -not -path "./node_modules/*" \
    | head -30
echo "... (showing first 30 files)"
echo ""

# Confirmation
echo -e "${RED}WARNING: This will deploy to PRODUCTION${NC}"
echo ""
read -p "Type 'deploy' to confirm: " confirmation

if [ "$confirmation" != "deploy" ]; then
    echo "Deployment cancelled."
    exit 0
fi

# Log the deployment
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "no-git")
echo "[$TIMESTAMP] Deploying commit $GIT_COMMIT by $(whoami)" >> "$DEPLOY_LOG"

# Deploy
echo ""
echo -e "${GREEN}Deploying to Firebase Hosting...${NC}"
npx firebase deploy --only hosting

# Log success
echo "[$TIMESTAMP] Deployment successful" >> "$DEPLOY_LOG"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
