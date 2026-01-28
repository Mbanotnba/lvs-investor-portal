#!/bin/bash
# Screenshot generator for LVS portals
# Usage: ./scripts/screenshot.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SCREENSHOTS_DIR="$PROJECT_DIR/screenshots"
PORT=8765

# Create screenshots directory
mkdir -p "$SCREENSHOTS_DIR"

# Start server in background
echo "Starting local server on port $PORT..."
cd "$PROJECT_DIR"
python3 -m http.server $PORT &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Function to cleanup on exit
cleanup() {
    echo "Stopping server..."
    kill $SERVER_PID 2>/dev/null || true
}
trap cleanup EXIT

# Chrome path on macOS
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

echo "Taking screenshots..."

# Customer Portal - Full page
"$CHROME" --headless --disable-gpu --screenshot="$SCREENSHOTS_DIR/customer-portal.png" \
    --window-size=1440,900 --hide-scrollbars \
    "http://localhost:$PORT/customer-portal-mockup.html" 2>/dev/null

# Investor Login
"$CHROME" --headless --disable-gpu --screenshot="$SCREENSHOTS_DIR/investor-login.png" \
    --window-size=1440,900 --hide-scrollbars \
    "http://localhost:$PORT/index.html" 2>/dev/null

# Investor Roadmap (bypass auth for screenshot)
"$CHROME" --headless --disable-gpu --screenshot="$SCREENSHOTS_DIR/investor-roadmap.png" \
    --window-size=1440,900 --hide-scrollbars \
    "http://localhost:$PORT/roadmap.html" 2>/dev/null

echo ""
echo "Screenshots saved to $SCREENSHOTS_DIR/"
ls -la "$SCREENSHOTS_DIR"/*.png
echo ""
echo "Done!"
