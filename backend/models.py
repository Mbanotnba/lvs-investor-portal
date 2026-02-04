"""
LVS Portal - Pydantic Models
Request/Response validation models
"""
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field, field_validator
import re

from config import MIN_PASSWORD_LENGTH


# ============================================================================
# REQUEST MODELS
# ============================================================================

class EmailRequest(BaseModel):
    """Step 1: Email submission to determine portal type."""
    email: EmailStr


class PasswordRequest(BaseModel):
    """Step 2: Password submission."""
    email: EmailStr
    password: str = Field(..., min_length=MIN_PASSWORD_LENGTH)


class TwoFactorRequest(BaseModel):
    """Step 3: 2FA code submission."""
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)

    @field_validator('code')
    @classmethod
    def validate_code(cls, v):
        if not v.isdigit():
            raise ValueError('Code must contain only digits')
        return v


class UserCreateRequest(BaseModel):
    """Create a new user (admin only)."""
    email: EmailStr
    password: str = Field(..., min_length=MIN_PASSWORD_LENGTH)
    name: str = Field(..., min_length=1, max_length=100)
    portal_type: Literal['investor', 'customer', 'partner', 'founder']
    company: Optional[str] = None

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < MIN_PASSWORD_LENGTH:
            raise ValueError(f'Password must be at least {MIN_PASSWORD_LENGTH} characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v


class PasswordChangeRequest(BaseModel):
    """Change password request."""
    current_password: str
    new_password: str = Field(..., min_length=MIN_PASSWORD_LENGTH)

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v


class Setup2FARequest(BaseModel):
    """Request to set up 2FA."""
    email: EmailStr
    password: str  # Require password to enable 2FA


class Verify2FASetupRequest(BaseModel):
    """Verify 2FA setup with initial code."""
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)

    @field_validator('code')
    @classmethod
    def validate_code(cls, v):
        if not v.isdigit():
            raise ValueError('Code must contain only digits')
        return v


class ForgotPasswordRequest(BaseModel):
    """Request password reset email."""
    email: EmailStr


class VerifyResetTokenRequest(BaseModel):
    """Verify password reset token (from email link)."""
    token: str = Field(..., min_length=32)


class VerifyResetCodeRequest(BaseModel):
    """Verify password reset code (manual entry)."""
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)

    @field_validator('code')
    @classmethod
    def validate_code(cls, v):
        if not v.isdigit():
            raise ValueError('Code must contain only digits')
        return v


class ResetPasswordRequest(BaseModel):
    """Reset password with token."""
    token: str = Field(..., min_length=32)
    new_password: str = Field(..., min_length=MIN_PASSWORD_LENGTH)

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v


# ============================================================================
# RESPONSE MODELS
# ============================================================================

class PortalInfoResponse(BaseModel):
    """Response with portal type information."""
    email: str
    portal_type: str
    company: Optional[str] = None
    company_name: Optional[str] = None
    requires_2fa: bool = True


class AuthStepResponse(BaseModel):
    """Response for authentication step completion."""
    success: bool
    next_step: Optional[str] = None
    message: str
    portal_info: Optional[PortalInfoResponse] = None


class TokenResponse(BaseModel):
    """Response with JWT token after successful authentication."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    portal_type: str
    portal_url: str
    user: dict


class Setup2FAResponse(BaseModel):
    """Response with 2FA setup information."""
    qr_code: str  # Base64 encoded QR code image
    secret: str   # Manual entry secret (shown to user)
    message: str


class UserResponse(BaseModel):
    """User information response."""
    id: int
    email: str
    name: str
    portal_type: str
    company: Optional[str]
    has_2fa: bool
    created_at: datetime
    last_login: Optional[datetime]


class ErrorResponse(BaseModel):
    """Error response model."""
    detail: str
    error_code: Optional[str] = None


class SuccessResponse(BaseModel):
    """Generic success response."""
    success: bool
    message: str
