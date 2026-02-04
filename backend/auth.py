"""
LVS Portal - Authentication Routes
Handles login flow: Email -> Password -> 2FA -> Token
"""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from models import (
    EmailRequest, PasswordRequest, TwoFactorRequest,
    PortalInfoResponse, AuthStepResponse, TokenResponse,
    Setup2FARequest, Setup2FAResponse, Verify2FASetupRequest,
    SuccessResponse, ErrorResponse,
    ForgotPasswordRequest, VerifyResetTokenRequest,
    VerifyResetCodeRequest, ResetPasswordRequest
)
from security import (
    verify_password, create_access_token, decode_access_token,
    generate_totp_secret, generate_totp_qr_code, verify_totp,
    get_domain_from_email
)
from database import (
    get_user_by_email, get_user_by_id, update_last_login,
    increment_failed_login, lock_user_account, reset_failed_attempts,
    update_user_totp, enable_user_totp, create_session, is_session_valid,
    revoke_session, revoke_all_user_sessions, log_audit, check_nda_access,
    update_nda_status, get_all_users_nda_status, update_user_password,
    create_pending_auth, get_pending_auth, delete_pending_auth,
    cleanup_expired_pending_auth,
    create_password_reset_token, verify_password_reset_token,
    verify_password_reset_code, mark_password_reset_used,
    get_recent_password_reset_requests
)
from config import (
    PORTAL_DOMAINS, PORTAL_URLS, ACCESS_TOKEN_EXPIRE_MINUTES,
    MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MINUTES,
    PASSWORD_RESET_EXPIRE_MINUTES, PASSWORD_RESET_RATE_LIMIT
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


def get_client_ip(request: Request) -> str:
    """Get client IP address from request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def get_portal_info_from_email(email: str) -> dict:
    """Determine portal type and info from email domain."""
    domain = get_domain_from_email(email)

    if domain in PORTAL_DOMAINS:
        info = PORTAL_DOMAINS[domain]
        return {
            "type": info["type"],
            "company": info["company"],
            "name": info["name"]
        }

    # Default to investor
    return {
        "type": "investor",
        "company": None,
        "name": "Investor"
    }


def get_portal_url(portal_type: str, company: Optional[str] = None) -> str:
    """Get the portal URL for a given portal type and company."""
    if portal_type in ("customer", "partner") and company:
        return PORTAL_URLS.get(portal_type, {}).get(company, "dashboard.html")
    return PORTAL_URLS.get(portal_type, "dashboard.html")


# ============================================================================
# AUTHENTICATION FLOW
# ============================================================================

@router.post("/email", response_model=AuthStepResponse)
async def submit_email(request: Request, body: EmailRequest):
    """
    Step 1: Submit email to determine portal type.
    Returns portal info and proceeds to password step.
    """
    email = body.email.lower()
    client_ip = get_client_ip(request)

    # Check if user exists
    user = get_user_by_email(email)

    # Get portal info from email domain
    portal_info = get_portal_info_from_email(email)

    # Check if account is locked
    if user and user.get("locked_until"):
        locked_until = datetime.fromisoformat(user["locked_until"])
        if datetime.utcnow() < locked_until:
            remaining = int((locked_until - datetime.utcnow()).total_seconds() / 60)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Account is locked. Try again in {remaining} minutes."
            )
        else:
            # Lockout expired, reset
            reset_failed_attempts(email)

    # Store pending auth state in database (replaces in-memory dict)
    create_pending_auth(
        email=email,
        step="password",
        portal_info=portal_info,
        ip_address=client_ip,
        expires_minutes=5
    )

    log_audit(user["id"] if user else None, "LOGIN_STEP_EMAIL", f"Email submitted: {email}", client_ip)

    return AuthStepResponse(
        success=True,
        next_step="password",
        message="Email verified. Please enter your password.",
        portal_info=PortalInfoResponse(
            email=email,
            portal_type=portal_info["type"],
            company=portal_info.get("company"),
            company_name=portal_info.get("name"),
            requires_2fa=user.get("totp_enabled", False) if user else True
        )
    )


@router.post("/password")
async def submit_password(request: Request, body: PasswordRequest):
    """
    Step 2: Submit password for verification.
    If 2FA is enabled, proceeds to 2FA step. Otherwise, returns token.
    """
    email = body.email.lower()
    password = body.password
    client_ip = get_client_ip(request)

    # Get portal info from email
    portal_info = get_portal_info_from_email(email)

    # Get user
    user = get_user_by_email(email)
    if not user:
        # Don't reveal that user doesn't exist
        log_audit(None, "LOGIN_FAILED", f"User not found: {email}", client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Check if account is locked
    if user.get("locked_until"):
        try:
            locked_until = datetime.fromisoformat(user["locked_until"])
            if datetime.utcnow() < locked_until:
                remaining = int((locked_until - datetime.utcnow()).total_seconds() / 60)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Account is locked. Try again in {remaining} minutes."
                )
        except (ValueError, TypeError):
            pass  # Invalid date format, ignore

    # Verify password
    if not verify_password(password, user["password_hash"]):
        attempts = increment_failed_login(email)
        log_audit(user["id"], "LOGIN_FAILED", f"Invalid password (attempt {attempts})", client_ip)

        if attempts >= MAX_LOGIN_ATTEMPTS:
            lockout_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            lock_user_account(email, lockout_until)
            log_audit(user["id"], "ACCOUNT_LOCKED", f"Too many failed attempts", client_ip)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many failed attempts. Account locked for {LOCKOUT_DURATION_MINUTES} minutes."
            )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Password correct - check if 2FA is required
    if user.get("totp_enabled") and user.get("totp_secret"):
        # Store pending 2FA state in database
        create_pending_auth(
            email=email,
            step="2fa",
            user_id=user["id"],
            portal_info=portal_info,
            ip_address=client_ip,
            expires_minutes=5
        )

        log_audit(user["id"], "LOGIN_STEP_PASSWORD", "Password verified, 2FA required", client_ip)

        return {
            "success": True,
            "next_step": "2fa",
            "message": "Password verified. Please enter your 2FA code.",
            "portal_info": {
                "email": email,
                "portal_type": user["portal_type"],
                "company": user.get("company"),
                "company_name": portal_info.get("name"),
                "requires_2fa": True
            }
        }

    # No 2FA - complete login
    return await complete_login(user, client_ip, request)


@router.post("/2fa", response_model=TokenResponse)
async def submit_2fa(request: Request, body: TwoFactorRequest):
    """
    Step 3: Submit 2FA code for verification.
    Returns JWT token on success.
    """
    email = body.email.lower()
    code = body.code
    client_ip = get_client_ip(request)

    # Check pending auth state from database
    auth_state = get_pending_auth(email)
    if not auth_state or auth_state["step"] != "2fa":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please start the login process from the beginning."
        )

    # Get user
    user = get_user_by_id(auth_state["user_id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed."
        )

    # Verify TOTP code
    if not verify_totp(user["totp_secret"], code):
        log_audit(user["id"], "2FA_FAILED", "Invalid TOTP code", client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid verification code."
        )

    log_audit(user["id"], "2FA_SUCCESS", "TOTP verified", client_ip)

    # Complete login
    return await complete_login(user, client_ip, request)


async def complete_login(user: dict, client_ip: str, request: Request):
    """Complete the login process and return a token."""
    email = user["email"]

    # Clear pending auth from database
    delete_pending_auth(email)

    # Cleanup expired pending auth on every login (~1ms, negligible)
    cleanup_expired_pending_auth()

    # Reset failed attempts
    reset_failed_attempts(email)

    # Update last login
    update_last_login(user["id"])

    # Check NDA access
    nda_check = check_nda_access(user)

    # Create access token
    token_data = {
        "sub": str(user["id"]),
        "email": email,
        "portal_type": user["portal_type"],
        "company": user.get("company"),
        "nda_status": nda_check["status"],
    }
    access_token = create_access_token(token_data)

    # Decode token to get JTI and expiration
    decoded = decode_access_token(access_token)
    expires_at = datetime.utcfromtimestamp(decoded["exp"])

    # Create session record
    create_session(
        user_id=user["id"],
        token_jti=decoded["jti"],
        expires_at=expires_at,
        ip_address=client_ip,
        user_agent=request.headers.get("User-Agent")
    )

    log_audit(user["id"], "LOGIN_SUCCESS", f"Login completed (NDA: {nda_check['status']})", client_ip)

    # Get portal URL - redirect to NDA pending page if not approved
    if nda_check["allowed"]:
        portal_url = get_portal_url(user["portal_type"], user.get("company"))
    else:
        portal_url = "nda-pending.html"

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "portal_type": user["portal_type"],
        "portal_url": portal_url,
        "nda": {
            "status": nda_check["status"],
            "allowed": nda_check["allowed"],
            "reason": nda_check["reason"],
            "expires_date": user.get("nda_expires_date")
        },
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "portal_type": user["portal_type"],
            "company": user.get("company")
        }
    }


# ============================================================================
# 2FA SETUP
# ============================================================================

@router.post("/setup-2fa", response_model=Setup2FAResponse)
async def setup_2fa(request: Request, body: Setup2FARequest):
    """
    Set up 2FA for a user. Requires password verification.
    Returns QR code and secret for Google Authenticator.
    """
    email = body.email.lower()
    password = body.password
    client_ip = get_client_ip(request)

    # Get user
    user = get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials."
        )

    # Verify password
    if not verify_password(password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials."
        )

    # Generate TOTP secret
    secret = generate_totp_secret()

    # Store secret (not yet enabled)
    update_user_totp(user["id"], secret, enabled=False)

    # Generate QR code
    qr_code = generate_totp_qr_code(secret, email)

    log_audit(user["id"], "2FA_SETUP_STARTED", "TOTP setup initiated", client_ip)

    return Setup2FAResponse(
        qr_code=qr_code,
        secret=secret,
        message="Scan the QR code with Google Authenticator, then verify with a code."
    )


@router.post("/verify-2fa-setup", response_model=SuccessResponse)
async def verify_2fa_setup(request: Request, body: Verify2FASetupRequest):
    """
    Verify 2FA setup by confirming the user can generate valid codes.
    Enables 2FA on success.
    """
    email = body.email.lower()
    code = body.code
    client_ip = get_client_ip(request)

    # Get user
    user = get_user_by_email(email)
    if not user or not user.get("totp_secret"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA setup not started."
        )

    # Verify code
    if not verify_totp(user["totp_secret"], code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid verification code. Please try again."
        )

    # Enable 2FA
    enable_user_totp(user["id"])

    log_audit(user["id"], "2FA_ENABLED", "TOTP enabled successfully", client_ip)

    return SuccessResponse(
        success=True,
        message="Two-factor authentication enabled successfully!"
    )


# ============================================================================
# TOKEN VALIDATION & LOGOUT
# ============================================================================

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Dependency to get the current authenticated user from JWT token."""
    token = credentials.credentials

    # Decode token
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if session is valid (not revoked)
    if not is_session_valid(payload.get("jti", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been revoked.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user
    user = get_user_by_id(int(payload["sub"]))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {**user, "token_jti": payload.get("jti")}


@router.post("/logout", response_model=SuccessResponse)
async def logout(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Log out the current user by revoking their session."""
    client_ip = get_client_ip(request)

    # Revoke current session
    revoke_session(current_user["token_jti"])

    log_audit(current_user["id"], "LOGOUT", "User logged out", client_ip)

    return SuccessResponse(
        success=True,
        message="Logged out successfully."
    )


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get information about the currently authenticated user."""
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "portal_type": current_user["portal_type"],
        "company": current_user.get("company"),
        "has_2fa": bool(current_user.get("totp_enabled")),
    }


@router.post("/change-password")
async def change_password(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Change the current user's password.
    Requires current_password and new_password in request body.
    """
    from models import ChangePasswordRequest

    client_ip = get_client_ip(request)
    body = await request.json()

    current_password = body.get("current_password")
    new_password = body.get("new_password")

    if not current_password or not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both current_password and new_password are required."
        )

    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters."
        )

    # Verify current password
    if not verify_password(current_password, current_user["password_hash"]):
        log_audit(current_user["id"], "PASSWORD_CHANGE_FAILED", "Invalid current password", client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect."
        )

    # Update password
    from database import update_user_password
    success = update_user_password(current_user["id"], new_password)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password."
        )

    log_audit(current_user["id"], "PASSWORD_CHANGED", "Password changed successfully", client_ip)

    return {
        "success": True,
        "message": "Password changed successfully."
    }


# ============================================================================
# PASSWORD RESET FLOW
# ============================================================================

@router.post("/forgot-password", response_model=SuccessResponse)
async def forgot_password(request: Request, body: ForgotPasswordRequest):
    """
    Request a password reset email.
    Sends email with reset link and 6-digit code.
    Rate limited to prevent abuse.
    """
    email = body.email.lower()
    client_ip = get_client_ip(request)

    # Rate limiting: Check recent requests for this email
    recent_requests = get_recent_password_reset_requests(email, minutes=60)
    if recent_requests >= PASSWORD_RESET_RATE_LIMIT:
        log_audit(None, "PASSWORD_RESET_RATE_LIMITED", f"Rate limit exceeded: {email}", client_ip)
        # Don't reveal rate limiting to prevent enumeration
        return SuccessResponse(
            success=True,
            message="If an account exists with this email, you will receive a password reset link shortly."
        )

    # Check if user exists
    user = get_user_by_email(email)
    if not user:
        # Don't reveal if user exists - return same message
        log_audit(None, "PASSWORD_RESET_UNKNOWN_EMAIL", f"Unknown email: {email}", client_ip)
        return SuccessResponse(
            success=True,
            message="If an account exists with this email, you will receive a password reset link shortly."
        )

    # Check if account is active
    if not user.get("is_active", True):
        log_audit(user["id"], "PASSWORD_RESET_INACTIVE", "Inactive account", client_ip)
        return SuccessResponse(
            success=True,
            message="If an account exists with this email, you will receive a password reset link shortly."
        )

    # Create password reset token
    reset_data = create_password_reset_token(
        user_id=user["id"],
        email=email,
        ip_address=client_ip,
        expires_minutes=PASSWORD_RESET_EXPIRE_MINUTES
    )

    if not reset_data:
        log_audit(user["id"], "PASSWORD_RESET_FAILED", "Failed to create reset token", client_ip)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process password reset request. Please try again."
        )

    # Send password reset email
    try:
        from email_service import send_password_reset_email, is_email_configured

        if is_email_configured():
            email_sent = send_password_reset_email(
                to_email=email,
                user_name=user["name"],
                reset_token=reset_data["token"],
                reset_code=reset_data["code"]
            )
            if email_sent:
                log_audit(user["id"], "PASSWORD_RESET_EMAIL_SENT", f"Reset email sent", client_ip)
            else:
                log_audit(user["id"], "PASSWORD_RESET_EMAIL_FAILED", f"Email send failed", client_ip)
        else:
            # Email not configured - log for debugging
            log_audit(user["id"], "PASSWORD_RESET_NO_EMAIL", f"Email not configured, token: {reset_data['token'][:8]}...", client_ip)
            print(f"DEBUG: Password reset for {email} - Code: {reset_data['code']}, Token: {reset_data['token'][:16]}...")

    except Exception as e:
        log_audit(user["id"], "PASSWORD_RESET_EMAIL_ERROR", f"Email error: {str(e)}", client_ip)
        print(f"Email send error: {e}")

    return SuccessResponse(
        success=True,
        message="If an account exists with this email, you will receive a password reset link shortly."
    )


@router.post("/verify-reset-token")
async def verify_reset_token(request: Request, body: VerifyResetTokenRequest):
    """
    Verify a password reset token from email link.
    Returns user email if valid.
    """
    token = body.token
    client_ip = get_client_ip(request)

    # Verify token
    token_data = verify_password_reset_token(token)
    if not token_data:
        log_audit(None, "RESET_TOKEN_INVALID", f"Invalid/expired token", client_ip)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset link is invalid or has expired. Please request a new one."
        )

    log_audit(token_data["user_id"], "RESET_TOKEN_VERIFIED", "Token verified", client_ip)

    return {
        "success": True,
        "email": token_data["email"],
        "message": "Token verified. You can now reset your password."
    }


@router.post("/verify-reset-code")
async def verify_reset_code(request: Request, body: VerifyResetCodeRequest):
    """
    Verify a 6-digit password reset code.
    Returns reset token for password change if valid.
    """
    email = body.email.lower()
    code = body.code
    client_ip = get_client_ip(request)

    # Verify code
    token_data = verify_password_reset_code(email, code)
    if not token_data:
        log_audit(None, "RESET_CODE_INVALID", f"Invalid code for: {email}", client_ip)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code. Please try again or request a new code."
        )

    log_audit(token_data["user_id"], "RESET_CODE_VERIFIED", "Code verified", client_ip)

    return {
        "success": True,
        "token": token_data["token"],
        "email": token_data["email"],
        "message": "Code verified. You can now reset your password."
    }


@router.post("/reset-password", response_model=SuccessResponse)
async def reset_password(request: Request, body: ResetPasswordRequest):
    """
    Reset password using verified token.
    Invalidates all existing sessions for security.
    """
    token = body.token
    new_password = body.new_password
    client_ip = get_client_ip(request)

    # Verify token is still valid
    token_data = verify_password_reset_token(token)
    if not token_data:
        log_audit(None, "RESET_PASSWORD_INVALID_TOKEN", "Invalid/expired token", client_ip)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset link is invalid or has expired. Please request a new one."
        )

    user_id = token_data["user_id"]
    email = token_data["email"]

    # Get user to verify they still exist
    user = get_user_by_id(user_id)
    if not user:
        log_audit(user_id, "RESET_PASSWORD_USER_NOT_FOUND", "User not found", client_ip)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to reset password. Please contact support."
        )

    # Update password
    success = update_user_password(user_id, new_password)
    if not success:
        log_audit(user_id, "RESET_PASSWORD_FAILED", "Failed to update password", client_ip)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset password. Please try again."
        )

    # Mark token as used
    mark_password_reset_used(token_data["id"])

    # Invalidate all existing sessions for security
    revoked_count = revoke_all_user_sessions(user_id)
    log_audit(user_id, "SESSIONS_REVOKED", f"Revoked {revoked_count} sessions after password reset", client_ip)

    # Reset failed login attempts
    reset_failed_attempts(email)

    log_audit(user_id, "PASSWORD_RESET_SUCCESS", "Password reset completed", client_ip)

    # Send password changed notification
    try:
        from email_service import send_password_changed_notification, is_email_configured

        if is_email_configured():
            send_password_changed_notification(
                to_email=email,
                user_name=user["name"],
                ip_address=client_ip
            )
    except Exception as e:
        print(f"Failed to send password change notification: {e}")

    return SuccessResponse(
        success=True,
        message="Your password has been reset successfully. Please log in with your new password."
    )


@router.post("/validate-token")
async def validate_token(current_user: dict = Depends(get_current_user)):
    """Validate the current token and return user info."""
    nda_check = check_nda_access(current_user)
    return {
        "valid": True,
        "user": {
            "id": current_user["id"],
            "email": current_user["email"],
            "portal_type": current_user["portal_type"],
        },
        "nda": {
            "status": nda_check["status"],
            "allowed": nda_check["allowed"],
        }
    }


# ============================================================================
# NDA MANAGEMENT (Founder Only)
# ============================================================================

def require_founder(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency to require founder access."""
    if current_user.get("portal_type") != "founder":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Founder access required."
        )
    return current_user


@router.get("/nda/users")
async def list_users_nda_status(
    request: Request,
    portal_type: Optional[str] = None,
    current_user: dict = Depends(require_founder)
):
    """
    List all users with their NDA status (Founder only).
    Optional filter by portal_type: customer, partner
    """
    client_ip = get_client_ip(request)

    # Filter to only customer/partner if specified
    if portal_type:
        if portal_type not in ("customer", "partner"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="portal_type must be 'customer' or 'partner'"
            )
        users = get_all_users_nda_status([portal_type])
    else:
        # Get customers and partners only (they require NDA)
        users = get_all_users_nda_status(["customer", "partner"])

    log_audit(current_user["id"], "NDA_LIST_VIEWED", f"Viewed NDA list", client_ip)

    return {
        "users": users,
        "count": len(users),
        "summary": {
            "pending": len([u for u in users if u["nda_status"] == "pending"]),
            "approved": len([u for u in users if u["nda_status"] == "approved"]),
            "expired": len([u for u in users if u["nda_status"] == "expired"]),
            "revoked": len([u for u in users if u["nda_status"] == "revoked"]),
        }
    }


@router.post("/nda/approve/{user_id}")
async def approve_user_nda(
    request: Request,
    user_id: int,
    expires_days: Optional[int] = 365,
    notes: Optional[str] = None,
    current_user: dict = Depends(require_founder)
):
    """
    Approve a user's NDA access (Founder only).
    Sets expiration date based on expires_days (default: 1 year).
    """
    client_ip = get_client_ip(request)

    # Get the user
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Check user is customer or partner
    if user.get("portal_type") not in ("customer", "partner"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only customers and partners require NDA approval."
        )

    # Calculate expiration date
    expires_date = datetime.utcnow() + timedelta(days=expires_days) if expires_days else None
    signed_date = datetime.utcnow()

    # Update NDA status
    success = update_nda_status(
        user_id=user_id,
        status="approved",
        approved_by=current_user["id"],
        expires_date=expires_date,
        signed_date=signed_date,
        notes=notes
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update NDA status."
        )

    log_audit(
        current_user["id"],
        "NDA_APPROVED",
        f"Approved NDA for {user['email']} (expires: {expires_date})",
        client_ip
    )

    return {
        "success": True,
        "message": f"NDA approved for {user['name']}",
        "user_id": user_id,
        "nda_status": "approved",
        "expires_date": expires_date.isoformat() if expires_date else None
    }


@router.post("/nda/revoke/{user_id}")
async def revoke_user_nda(
    request: Request,
    user_id: int,
    reason: Optional[str] = None,
    current_user: dict = Depends(require_founder)
):
    """Revoke a user's NDA access (Founder only)."""
    client_ip = get_client_ip(request)

    # Get the user
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Update NDA status
    success = update_nda_status(
        user_id=user_id,
        status="revoked",
        notes=reason
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update NDA status."
        )

    log_audit(
        current_user["id"],
        "NDA_REVOKED",
        f"Revoked NDA for {user['email']}: {reason}",
        client_ip
    )

    return {
        "success": True,
        "message": f"NDA access revoked for {user['name']}",
        "user_id": user_id,
        "nda_status": "revoked"
    }


@router.post("/nda/extend/{user_id}")
async def extend_user_nda(
    request: Request,
    user_id: int,
    expires_days: int = 365,
    current_user: dict = Depends(require_founder)
):
    """Extend a user's NDA expiration date (Founder only)."""
    client_ip = get_client_ip(request)

    # Get the user
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Calculate new expiration date (from now, not from current expiry)
    new_expires_date = datetime.utcnow() + timedelta(days=expires_days)

    # Update NDA status
    success = update_nda_status(
        user_id=user_id,
        status="approved",
        expires_date=new_expires_date
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to extend NDA."
        )

    log_audit(
        current_user["id"],
        "NDA_EXTENDED",
        f"Extended NDA for {user['email']} to {new_expires_date}",
        client_ip
    )

    return {
        "success": True,
        "message": f"NDA extended for {user['name']}",
        "user_id": user_id,
        "nda_status": "approved",
        "expires_date": new_expires_date.isoformat()
    }
