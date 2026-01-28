#!/bin/bash
# One-command deploy for LVS portals
# Usage: ./scripts/deploy.sh "Commit message here"
#
# This script:
# 1. Regenerates all screenshots
# 2. Stages all changes
# 3. Commits with your message
# 4. Pushes to GitHub
# 5. Shows the live URLs

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Check for commit message
if [ -z "$1" ]; then
    echo "Usage: ./scripts/deploy.sh \"Your commit message\""
    exit 1
fi

COMMIT_MSG="$1"

echo "=== LVS Portal Deploy ==="
echo ""

# Step 1: Generate fresh screenshots
echo "[1/5] Generating screenshots..."
"$SCRIPT_DIR/screenshot.sh" > /dev/null 2>&1
echo "      Done."

# Step 2: Stage all changes
echo "[2/5] Staging changes..."
git add -A
echo "      Done."

# Step 3: Check if there are changes to commit
if git diff --cached --quiet; then
    echo ""
    echo "No changes to deploy. Everything is up to date."
    exit 0
fi

# Step 4: Commit
echo "[3/5] Committing..."
git commit -m "$COMMIT_MSG

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>" > /dev/null
echo "      Done."

# Step 5: Push
echo "[4/5] Pushing to GitHub..."
git push origin main > /dev/null 2>&1
echo "      Done."

# Step 6: Summary
echo "[5/5] Deployed!"
echo ""
echo "=== Live URLs (allow 1-2 min for GitHub Pages) ==="
echo "Investor Portal:  https://mbanotnba.github.io/lvs-investor-portal/"
echo "Customer Portal:  https://mbanotnba.github.io/lvs-investor-portal/customer-portal-mockup.html"
echo ""
echo "Latest commit:"
git log --oneline -1
