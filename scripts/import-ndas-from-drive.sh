#!/bin/bash
# Import Executed NDAs from Google Drive to LVS Portal
#
# Prerequisites:
# 1. gcloud CLI authenticated
# 2. Google Drive desktop sync or rclone configured
# 3. Access to the executed NDAs folder
#
# Usage:
#   ./import-ndas-from-drive.sh /path/to/drive/Executed_NDAs
#
# File naming convention expected:
#   NDA_companyname_email@domain.com.pdf
#   OR just have the user email somewhere in the filename

API_URL="${API_URL:-https://lvs-api-657638018776.us-central1.run.app}"
GCS_BUCKET="${GCS_BUCKET:-lvs-nda-documents}"
DRIVE_FOLDER="${1:-}"

if [ -z "$DRIVE_FOLDER" ]; then
    echo "Usage: $0 /path/to/google/drive/Executed_NDAs"
    echo ""
    echo "This script imports executed NDAs from a local Google Drive folder to the LVS Portal."
    echo ""
    echo "Steps:"
    echo "1. Copies PDF files to Google Cloud Storage"
    echo "2. Creates NDA records in the database"
    echo "3. Auto-approves the NDAs"
    exit 1
fi

if [ ! -d "$DRIVE_FOLDER" ]; then
    echo "Error: Folder not found: $DRIVE_FOLDER"
    exit 1
fi

# Get auth token (requires founder login)
echo "=========================================="
echo "LVS NDA Import Tool"
echo "=========================================="
echo ""
echo "First, let's authenticate as a founder..."
echo ""

read -p "Founder email: " FOUNDER_EMAIL
read -s -p "Password: " FOUNDER_PASSWORD
echo ""

# Login - Step 1: Email
curl -s -X POST "$API_URL/auth/email" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$FOUNDER_EMAIL\"}" > /dev/null

# Login - Step 2: Password
LOGIN_RESULT=$(curl -s -X POST "$API_URL/auth/password" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$FOUNDER_EMAIL\", \"password\": \"$FOUNDER_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESULT" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Error: Login failed"
    echo "$LOGIN_RESULT"
    exit 1
fi

echo "✓ Authenticated as $FOUNDER_EMAIL"
echo ""

# Process each PDF in the folder
echo "Scanning for PDFs in: $DRIVE_FOLDER"
echo ""

SUCCESS_COUNT=0
FAIL_COUNT=0

for PDF_FILE in "$DRIVE_FOLDER"/*.pdf "$DRIVE_FOLDER"/*.PDF; do
    [ -e "$PDF_FILE" ] || continue

    FILENAME=$(basename "$PDF_FILE")
    echo "Processing: $FILENAME"

    # Try to extract email from filename
    # Common patterns: NDA_CompanyName_email@domain.com.pdf
    EMAIL=$(echo "$FILENAME" | grep -oE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' | head -1)

    if [ -z "$EMAIL" ]; then
        echo "  ⚠ Could not extract email from filename. Skipping."
        echo "  Hint: Rename file to include email, e.g., NDA_Company_user@example.com.pdf"
        ((FAIL_COUNT++))
        continue
    fi

    # Upload to GCS
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    SAFE_FILENAME=$(echo "$FILENAME" | tr ' ' '_')
    GCS_PATH="imported/${TIMESTAMP}_${SAFE_FILENAME}"

    echo "  Uploading to gs://$GCS_BUCKET/$GCS_PATH..."
    if ! gcloud storage cp "$PDF_FILE" "gs://$GCS_BUCKET/$GCS_PATH" --quiet 2>/dev/null; then
        echo "  ✗ Failed to upload to GCS"
        ((FAIL_COUNT++))
        continue
    fi

    # Import to database
    echo "  Importing for user: $EMAIL..."
    IMPORT_RESULT=$(curl -s -X POST "$API_URL/nda/import" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"user_email\": \"$EMAIL\",
        \"filename\": \"$FILENAME\",
        \"gcs_path\": \"$GCS_PATH\",
        \"auto_approve\": true,
        \"notes\": \"Imported from Google Drive executed NDAs\"
      }")

    if echo "$IMPORT_RESULT" | grep -q '"id"'; then
        echo "  ✓ Imported and approved"
        ((SUCCESS_COUNT++))
    else
        echo "  ✗ Import failed: $IMPORT_RESULT"
        # Clean up GCS file
        gcloud storage rm "gs://$GCS_BUCKET/$GCS_PATH" --quiet 2>/dev/null
        ((FAIL_COUNT++))
    fi

    echo ""
done

echo "=========================================="
echo "Import Complete"
echo "  Successful: $SUCCESS_COUNT"
echo "  Failed: $FAIL_COUNT"
echo "=========================================="
