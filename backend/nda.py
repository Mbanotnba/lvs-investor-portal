"""
LVS Portal - NDA Document Management
Upload and review NDA documents
"""
import os
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, HTTPException, status, Request, Depends, UploadFile, File, Form
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from google.cloud import storage

from auth import get_current_user, require_founder, get_client_ip
from database import (
    get_db_connection, log_audit, get_user_by_id,
    create_nda_document, get_nda_document, get_user_nda_documents,
    get_pending_nda_documents, get_all_nda_documents, review_nda_document
)

router = APIRouter(prefix="/nda", tags=["NDA Documents"])

# GCS Configuration
GCS_BUCKET = os.getenv("GCS_NDA_BUCKET", "lvs-nda-documents")

# Initialize GCS client (uses Application Default Credentials in Cloud Run)
try:
    storage_client = storage.Client()
    bucket = storage_client.bucket(GCS_BUCKET)
except Exception as e:
    print(f"Warning: Could not initialize GCS client: {e}")
    storage_client = None
    bucket = None


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class NDADocumentResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    file_size: int
    content_type: str
    status: str
    uploaded_at: str
    reviewed_by: Optional[int] = None
    reviewer_name: Optional[str] = None
    reviewed_at: Optional[str] = None
    review_notes: Optional[str] = None
    # User info (for admin views)
    email: Optional[str] = None
    name: Optional[str] = None
    company: Optional[str] = None
    portal_type: Optional[str] = None


class ReviewNDARequest(BaseModel):
    status: str  # 'approved' or 'rejected'
    notes: Optional[str] = None


# ============================================================================
# USER ENDPOINTS - Upload NDA
# ============================================================================

@router.post("/upload", response_model=NDADocumentResponse)
async def upload_nda(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload a signed NDA document.
    Allowed for customers and partners who need NDA approval.
    """
    client_ip = get_client_ip(request)
    user_id = current_user["id"]

    # Validate file type
    allowed_types = ["application/pdf", "image/png", "image/jpeg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload a PDF or image (PNG, JPEG)."
        )

    # Validate file size (max 10MB)
    max_size = 10 * 1024 * 1024  # 10MB
    contents = await file.read()
    if len(contents) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 10MB."
        )

    # Check if GCS is available
    if bucket is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="File storage not available. Please try again later."
        )

    # Generate unique filename
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    safe_filename = file.filename.replace(" ", "_").replace("/", "_")
    gcs_path = f"ndas/{user_id}/{timestamp}_{safe_filename}"

    try:
        # Upload to GCS
        blob = bucket.blob(gcs_path)
        blob.upload_from_string(contents, content_type=file.content_type)

        # Create database record
        doc_id = create_nda_document(
            user_id=user_id,
            filename=file.filename,
            gcs_path=gcs_path,
            file_size=len(contents),
            content_type=file.content_type
        )

        if not doc_id:
            # Rollback GCS upload
            blob.delete()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save document record."
            )

        log_audit(user_id, "NDA_UPLOADED", f"Uploaded: {file.filename}", client_ip)

        # Get the created document
        doc = get_nda_document(doc_id)
        return NDADocumentResponse(
            id=doc["id"],
            user_id=doc["user_id"],
            filename=doc["filename"],
            file_size=doc["file_size"],
            content_type=doc["content_type"],
            status=doc["status"],
            uploaded_at=str(doc["uploaded_at"]),
            email=doc.get("email"),
            name=doc.get("name"),
            company=doc.get("company"),
            portal_type=doc.get("portal_type")
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload document."
        )


@router.get("/my-documents", response_model=List[NDADocumentResponse])
async def get_my_documents(current_user: dict = Depends(get_current_user)):
    """Get all NDA documents uploaded by the current user."""
    docs = get_user_nda_documents(current_user["id"])

    return [
        NDADocumentResponse(
            id=doc["id"],
            user_id=doc["user_id"],
            filename=doc["filename"],
            file_size=doc["file_size"],
            content_type=doc["content_type"],
            status=doc["status"],
            uploaded_at=str(doc["uploaded_at"]),
            reviewer_name=doc.get("reviewer_name"),
            reviewed_at=str(doc["reviewed_at"]) if doc.get("reviewed_at") else None,
            review_notes=doc.get("review_notes")
        )
        for doc in docs
    ]


# ============================================================================
# FOUNDER ENDPOINTS - Review NDAs
# ============================================================================

@router.get("/pending", response_model=List[NDADocumentResponse])
async def get_pending_documents(current_user: dict = Depends(require_founder)):
    """Get all pending NDA documents for review (Founder only)."""
    docs = get_pending_nda_documents()

    return [
        NDADocumentResponse(
            id=doc["id"],
            user_id=doc["user_id"],
            filename=doc["filename"],
            file_size=doc["file_size"],
            content_type=doc["content_type"],
            status=doc["status"],
            uploaded_at=str(doc["uploaded_at"]),
            email=doc.get("email"),
            name=doc.get("name"),
            company=doc.get("company"),
            portal_type=doc.get("portal_type")
        )
        for doc in docs
    ]


@router.get("/all", response_model=List[NDADocumentResponse])
async def get_all_documents(
    status_filter: Optional[str] = None,
    current_user: dict = Depends(require_founder)
):
    """Get all NDA documents, optionally filtered by status (Founder only)."""
    docs = get_all_nda_documents(status_filter)

    return [
        NDADocumentResponse(
            id=doc["id"],
            user_id=doc["user_id"],
            filename=doc["filename"],
            file_size=doc["file_size"],
            content_type=doc["content_type"],
            status=doc["status"],
            uploaded_at=str(doc["uploaded_at"]),
            email=doc.get("email"),
            name=doc.get("name"),
            company=doc.get("company"),
            portal_type=doc.get("portal_type"),
            reviewer_name=doc.get("reviewer_name"),
            reviewed_at=str(doc["reviewed_at"]) if doc.get("reviewed_at") else None,
            review_notes=doc.get("review_notes")
        )
        for doc in docs
    ]


@router.get("/{doc_id}", response_model=NDADocumentResponse)
async def get_document(
    doc_id: int,
    current_user: dict = Depends(require_founder)
):
    """Get a specific NDA document (Founder only)."""
    doc = get_nda_document(doc_id)

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found."
        )

    return NDADocumentResponse(
        id=doc["id"],
        user_id=doc["user_id"],
        filename=doc["filename"],
        file_size=doc["file_size"],
        content_type=doc["content_type"],
        status=doc["status"],
        uploaded_at=str(doc["uploaded_at"]),
        email=doc.get("email"),
        name=doc.get("name"),
        company=doc.get("company"),
        portal_type=doc.get("portal_type"),
        reviewer_name=doc.get("reviewer_name"),
        reviewed_at=str(doc["reviewed_at"]) if doc.get("reviewed_at") else None,
        review_notes=doc.get("review_notes")
    )


@router.get("/{doc_id}/download")
async def download_document(
    doc_id: int,
    current_user: dict = Depends(require_founder)
):
    """Get a signed URL to download the NDA document (Founder only)."""
    doc = get_nda_document(doc_id)

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found."
        )

    if bucket is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="File storage not available."
        )

    try:
        blob = bucket.blob(doc["gcs_path"])
        # Generate signed URL valid for 15 minutes
        url = blob.generate_signed_url(
            version="v4",
            expiration=900,  # 15 minutes
            method="GET"
        )
        return {"download_url": url, "filename": doc["filename"]}
    except Exception as e:
        print(f"Download URL generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate download URL."
        )


@router.post("/{doc_id}/review")
async def review_document(
    request: Request,
    doc_id: int,
    body: ReviewNDARequest,
    current_user: dict = Depends(require_founder)
):
    """Approve or reject an NDA document (Founder only)."""
    client_ip = get_client_ip(request)

    doc = get_nda_document(doc_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found."
        )

    if doc["status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document already {doc['status']}."
        )

    if body.status not in ("approved", "rejected"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be 'approved' or 'rejected'."
        )

    success = review_nda_document(
        doc_id=doc_id,
        reviewer_id=current_user["id"],
        status=body.status,
        notes=body.notes
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update document."
        )

    log_audit(
        current_user["id"],
        f"NDA_{body.status.upper()}",
        f"Document {doc_id} for user {doc['email']}: {body.notes or 'No notes'}",
        client_ip
    )

    return {
        "success": True,
        "message": f"NDA document {body.status}.",
        "user_email": doc["email"]
    }


# ============================================================================
# BULK IMPORT ENDPOINT (for importing existing NDAs)
# ============================================================================

class BulkImportRequest(BaseModel):
    user_email: str
    filename: str
    gcs_path: str
    auto_approve: bool = False
    notes: Optional[str] = None


@router.post("/admin-upload", response_model=NDADocumentResponse)
async def admin_upload_nda(
    request: Request,
    file: UploadFile = File(...),
    user_email: str = Form(...),
    auto_approve: bool = Form(True),
    notes: str = Form(None),
    current_user: dict = Depends(require_founder)
):
    """
    Upload an NDA document for a specific user (Founder only).
    Used when founders have executed NDAs to upload for customers.
    """
    client_ip = get_client_ip(request)

    # Find user by email
    from database import get_user_by_email
    user = get_user_by_email(user_email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User not found: {user_email}"
        )

    # Validate file type
    allowed_types = ["application/pdf", "image/png", "image/jpeg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload a PDF or image (PNG, JPEG)."
        )

    # Validate file size (max 10MB)
    max_size = 10 * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 10MB."
        )

    if bucket is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="File storage not available. Please try again later."
        )

    # Generate unique filename
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    safe_filename = file.filename.replace(" ", "_").replace("/", "_")
    gcs_path = f"ndas/{user['id']}/{timestamp}_{safe_filename}"

    try:
        # Upload to GCS
        blob = bucket.blob(gcs_path)
        blob.upload_from_string(contents, content_type=file.content_type)

        # Create database record
        doc_id = create_nda_document(
            user_id=user["id"],
            filename=file.filename,
            gcs_path=gcs_path,
            file_size=len(contents),
            content_type=file.content_type
        )

        if not doc_id:
            blob.delete()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save document record."
            )

        # Auto-approve if requested (default: True for admin uploads)
        if auto_approve:
            review_nda_document(
                doc_id=doc_id,
                reviewer_id=current_user["id"],
                status="approved",
                notes=notes or "Uploaded by founder"
            )

        log_audit(
            current_user["id"],
            "NDA_ADMIN_UPLOADED",
            f"Uploaded NDA for {user_email}: {file.filename}",
            client_ip
        )

        doc = get_nda_document(doc_id)
        return NDADocumentResponse(
            id=doc["id"],
            user_id=doc["user_id"],
            filename=doc["filename"],
            file_size=doc["file_size"],
            content_type=doc["content_type"],
            status=doc["status"],
            uploaded_at=str(doc["uploaded_at"]),
            email=doc.get("email"),
            name=doc.get("name"),
            company=doc.get("company"),
            portal_type=doc.get("portal_type"),
            reviewer_name=doc.get("reviewer_name"),
            reviewed_at=str(doc["reviewed_at"]) if doc.get("reviewed_at") else None,
            review_notes=doc.get("review_notes")
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Admin upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload document."
        )


@router.post("/import", response_model=NDADocumentResponse)
async def import_nda(
    request: Request,
    body: BulkImportRequest,
    current_user: dict = Depends(require_founder)
):
    """
    Import an existing NDA document (already in GCS) for a user.
    Used for bulk importing executed NDAs from Google Drive.
    """
    client_ip = get_client_ip(request)

    # Find user by email
    from database import get_user_by_email
    user = get_user_by_email(body.user_email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User not found: {body.user_email}"
        )

    # Verify file exists in GCS
    if bucket is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="File storage not available."
        )

    blob = bucket.blob(body.gcs_path)
    if not blob.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File not found in storage: {body.gcs_path}"
        )

    # Get file info
    blob.reload()
    file_size = blob.size
    content_type = blob.content_type or "application/pdf"

    # Create document record
    doc_id = create_nda_document(
        user_id=user["id"],
        filename=body.filename,
        gcs_path=body.gcs_path,
        file_size=file_size,
        content_type=content_type
    )

    if not doc_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create document record."
        )

    # Auto-approve if requested
    if body.auto_approve:
        review_nda_document(
            doc_id=doc_id,
            reviewer_id=current_user["id"],
            status="approved",
            notes=body.notes or "Imported from existing executed NDA"
        )

    log_audit(
        current_user["id"],
        "NDA_IMPORTED",
        f"Imported NDA for {body.user_email}: {body.filename}",
        client_ip
    )

    doc = get_nda_document(doc_id)
    return NDADocumentResponse(
        id=doc["id"],
        user_id=doc["user_id"],
        filename=doc["filename"],
        file_size=doc["file_size"],
        content_type=doc["content_type"],
        status=doc["status"],
        uploaded_at=str(doc["uploaded_at"]),
        email=doc.get("email"),
        name=doc.get("name"),
        company=doc.get("company"),
        portal_type=doc.get("portal_type"),
        reviewer_name=doc.get("reviewer_name"),
        reviewed_at=str(doc["reviewed_at"]) if doc.get("reviewed_at") else None,
        review_notes=doc.get("review_notes")
    )
