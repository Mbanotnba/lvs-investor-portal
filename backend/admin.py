"""
LVS Portal - Admin Routes
User management endpoints (Founder only)
"""
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, HTTPException, status, Request, Depends, Query
from pydantic import BaseModel, EmailStr

from auth import get_current_user, require_founder, get_client_ip
from database import (
    get_db_connection, create_user, get_user_by_email, get_user_by_id,
    update_nda_status, log_audit, force_turso_resync
)
from security import hash_password
from config import PORTAL_DOMAINS

import os

router = APIRouter(prefix="/admin", tags=["Admin"])


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    portal_type: Optional[str] = None  # Auto-detected from email if not provided
    company: Optional[str] = None

class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    portal_type: Optional[str] = None
    company: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    portal_type: str
    company: Optional[str]
    is_active: bool
    has_2fa: bool
    nda_status: str
    created_at: str
    last_login: Optional[str]

class BootstrapRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    bootstrap_key: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str
    bootstrap_key: str


# ============================================================================
# BOOTSTRAP - Create First Founder (No Auth Required)
# ============================================================================

@router.post("/bootstrap", response_model=UserResponse)
async def bootstrap_founder(request: Request, body: BootstrapRequest):
    """
    Create the first founder account using a bootstrap key.
    This endpoint only works if:
    1. ADMIN_BOOTSTRAP_KEY environment variable is set
    2. The provided bootstrap_key matches
    3. No founder accounts exist yet (optional safety check)
    """
    client_ip = get_client_ip(request)

    # Check bootstrap key
    expected_key = os.getenv("ADMIN_BOOTSTRAP_KEY")
    if not expected_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bootstrap not configured. Set ADMIN_BOOTSTRAP_KEY environment variable."
        )

    if body.bootstrap_key != expected_key:
        log_audit(None, "BOOTSTRAP_FAILED", f"Invalid bootstrap key attempt from {client_ip}", client_ip)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid bootstrap key."
        )

    # Check if user already exists
    existing = get_user_by_email(body.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists."
        )

    # Create founder account
    user_id = create_user(
        email=body.email,
        password=body.password,
        name=body.name,
        portal_type="founder",
        company="lvs"
    )

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user."
        )

    log_audit(user_id, "BOOTSTRAP_SUCCESS", f"Founder account created: {body.email}", client_ip)

    user = get_user_by_id(user_id)
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        portal_type=user["portal_type"],
        company=user.get("company"),
        is_active=bool(user.get("is_active", 1)),
        has_2fa=bool(user.get("totp_enabled")),
        nda_status=user.get("nda_status", "not_required"),
        created_at=str(user.get("created_at", "")),
        last_login=str(user.get("last_login")) if user.get("last_login") else None
    )


@router.post("/reset-password")
async def reset_password_bootstrap(request: Request, body: ResetPasswordRequest):
    """
    Reset a user's password using the bootstrap key.
    For emergency access recovery only.
    """
    client_ip = get_client_ip(request)

    # Check bootstrap key
    expected_key = os.getenv("ADMIN_BOOTSTRAP_KEY")
    if not expected_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bootstrap not configured."
        )

    if body.bootstrap_key != expected_key:
        log_audit(None, "RESET_FAILED", f"Invalid bootstrap key from {client_ip}", client_ip)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid bootstrap key."
        )

    # Find user
    user = get_user_by_email(body.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Update password
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?",
        (hash_password(body.new_password), body.email.lower())
    )
    conn.commit()
    conn.close()

    log_audit(user["id"], "PASSWORD_RESET", f"Password reset via bootstrap key", client_ip)

    return {"success": True, "message": f"Password reset for {body.email}"}


@router.post("/db-sync")
async def sync_database(
    request: Request,
    current_user: dict = Depends(require_founder)
):
    """
    Force a sync with the Turso remote database (Founder only).
    Use this after direct Turso CLI changes to pull updates.
    """
    client_ip = get_client_ip(request)

    success = force_turso_resync()

    log_audit(current_user["id"], "DB_SYNC", f"Manual database sync triggered", client_ip)

    return {
        "success": success,
        "message": "Database sync completed" if success else "Sync failed or Turso not configured"
    }


# ============================================================================
# USER MANAGEMENT (Founder Only)
# ============================================================================

def get_portal_type_from_email(email: str) -> dict:
    """Determine portal type from email domain."""
    domain = email.split("@")[1].lower() if "@" in email else ""

    if domain in PORTAL_DOMAINS:
        info = PORTAL_DOMAINS[domain]
        return {"portal_type": info["type"], "company": info["company"]}

    return {"portal_type": "investor", "company": None}


@router.post("/users", response_model=UserResponse)
async def create_new_user(
    request: Request,
    body: CreateUserRequest,
    current_user: dict = Depends(require_founder)
):
    """
    Create a new user account (Founder only).
    Portal type is auto-detected from email domain if not provided.
    """
    client_ip = get_client_ip(request)

    # Check if user already exists
    existing = get_user_by_email(body.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    # Auto-detect portal type from email if not provided
    if not body.portal_type:
        detected = get_portal_type_from_email(body.email)
        portal_type = detected["portal_type"]
        company = detected["company"]
    else:
        portal_type = body.portal_type
        company = body.company

    # Validate portal type
    if portal_type not in ("investor", "customer", "partner", "founder"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid portal_type. Must be: investor, customer, partner, or founder"
        )

    # Create user
    user_id = create_user(
        email=body.email,
        password=body.password,
        name=body.name,
        portal_type=portal_type,
        company=company
    )

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user."
        )

    # Set appropriate NDA status
    if portal_type in ("customer", "partner"):
        update_nda_status(user_id, "pending")
        nda_status = "pending"
    else:
        nda_status = "not_required"

    log_audit(
        current_user["id"],
        "USER_CREATED",
        f"Created user: {body.email} ({portal_type})",
        client_ip
    )

    user = get_user_by_id(user_id)
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        portal_type=user["portal_type"],
        company=user.get("company"),
        is_active=bool(user.get("is_active", 1)),
        has_2fa=bool(user.get("totp_enabled")),
        nda_status=nda_status,
        created_at=str(user.get("created_at", "")),
        last_login=None
    )


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    request: Request,
    portal_type: Optional[str] = Query(None, description="Filter by portal type"),
    current_user: dict = Depends(require_founder)
):
    """
    List all users (Founder only).
    Optional filter by portal_type: investor, customer, partner, founder
    """
    client_ip = get_client_ip(request)

    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT id, email, name, portal_type, company, is_active,
               totp_enabled, nda_status, created_at, last_login
        FROM users
        WHERE 1=1
    """
    params = []

    if portal_type:
        query += " AND portal_type = ?"
        params.append(portal_type)

    query += " ORDER BY created_at DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    log_audit(current_user["id"], "USERS_LISTED", f"Listed {len(rows)} users", client_ip)

    return [
        UserResponse(
            id=row["id"],
            email=row["email"],
            name=row["name"],
            portal_type=row["portal_type"],
            company=row["company"],
            is_active=bool(row["is_active"]),
            has_2fa=bool(row["totp_enabled"]),
            nda_status=row["nda_status"] or "not_required",
            created_at=str(row["created_at"] or ""),
            last_login=str(row["last_login"]) if row["last_login"] else None
        )
        for row in rows
    ]


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: dict = Depends(require_founder)
):
    """Get a specific user by ID (Founder only)."""
    user = get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        portal_type=user["portal_type"],
        company=user.get("company"),
        is_active=bool(user.get("is_active", 1)),
        has_2fa=bool(user.get("totp_enabled")),
        nda_status=user.get("nda_status", "not_required"),
        created_at=str(user.get("created_at", "")),
        last_login=str(user.get("last_login")) if user.get("last_login") else None
    )


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    request: Request,
    user_id: int,
    body: UpdateUserRequest,
    current_user: dict = Depends(require_founder)
):
    """Update a user's information (Founder only)."""
    client_ip = get_client_ip(request)

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    conn = get_db_connection()
    cursor = conn.cursor()

    updates = []
    params = []

    if body.name is not None:
        updates.append("name = ?")
        params.append(body.name)

    if body.password is not None:
        updates.append("password_hash = ?")
        params.append(hash_password(body.password))

    if body.portal_type is not None:
        if body.portal_type not in ("investor", "customer", "partner", "founder"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid portal_type."
            )
        updates.append("portal_type = ?")
        params.append(body.portal_type)

    if body.company is not None:
        updates.append("company = ?")
        params.append(body.company)

    if body.is_active is not None:
        updates.append("is_active = ?")
        params.append(1 if body.is_active else 0)

    if updates:
        updates.append("updated_at = CURRENT_TIMESTAMP")
        params.append(user_id)

        cursor.execute(f"""
            UPDATE users SET {', '.join(updates)}
            WHERE id = ?
        """, params)
        conn.commit()

    conn.close()

    log_audit(
        current_user["id"],
        "USER_UPDATED",
        f"Updated user {user_id}: {user['email']}",
        client_ip
    )

    # Fetch updated user
    user = get_user_by_id(user_id)
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        portal_type=user["portal_type"],
        company=user.get("company"),
        is_active=bool(user.get("is_active", 1)),
        has_2fa=bool(user.get("totp_enabled")),
        nda_status=user.get("nda_status", "not_required"),
        created_at=str(user.get("created_at", "")),
        last_login=str(user.get("last_login")) if user.get("last_login") else None
    )


@router.delete("/users/{user_id}")
async def delete_user(
    request: Request,
    user_id: int,
    current_user: dict = Depends(require_founder)
):
    """
    Delete a user (Founder only).
    Actually deactivates the user rather than hard delete.
    """
    client_ip = get_client_ip(request)

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Prevent self-deletion
    if user_id == current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account."
        )

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (user_id,))

    conn.commit()
    conn.close()

    log_audit(
        current_user["id"],
        "USER_DELETED",
        f"Deactivated user {user_id}: {user['email']}",
        client_ip
    )

    return {
        "success": True,
        "message": f"User {user['email']} has been deactivated."
    }


# ============================================================================
# BULK OPERATIONS
# ============================================================================

class BulkCreateRequest(BaseModel):
    users: List[CreateUserRequest]

@router.post("/users/bulk", response_model=dict)
async def bulk_create_users(
    request: Request,
    body: BulkCreateRequest,
    current_user: dict = Depends(require_founder)
):
    """
    Create multiple users at once (Founder only).
    Returns summary of created/failed users.
    """
    client_ip = get_client_ip(request)

    created = []
    failed = []

    for user_req in body.users:
        try:
            # Check if exists
            if get_user_by_email(user_req.email):
                failed.append({"email": user_req.email, "reason": "Already exists"})
                continue

            # Auto-detect portal type
            if not user_req.portal_type:
                detected = get_portal_type_from_email(user_req.email)
                portal_type = detected["portal_type"]
                company = detected["company"]
            else:
                portal_type = user_req.portal_type
                company = user_req.company

            # Create user
            user_id = create_user(
                email=user_req.email,
                password=user_req.password,
                name=user_req.name,
                portal_type=portal_type,
                company=company
            )

            if user_id:
                if portal_type in ("customer", "partner"):
                    update_nda_status(user_id, "pending")
                created.append({"email": user_req.email, "id": user_id, "portal_type": portal_type})
            else:
                failed.append({"email": user_req.email, "reason": "Creation failed"})

        except Exception as e:
            failed.append({"email": user_req.email, "reason": str(e)})

    log_audit(
        current_user["id"],
        "BULK_USERS_CREATED",
        f"Created {len(created)} users, {len(failed)} failed",
        client_ip
    )

    return {
        "success": True,
        "created": created,
        "failed": failed,
        "summary": {
            "total": len(body.users),
            "created": len(created),
            "failed": len(failed)
        }
    }
