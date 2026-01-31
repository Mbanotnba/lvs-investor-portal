"""
LVS Portal - Security Utilities
Password hashing, JWT tokens, TOTP (Google Authenticator)
"""
import secrets
from datetime import datetime, timedelta
from typing import Optional

import pyotp
import qrcode
import qrcode.image.svg
from io import BytesIO
import base64
from jose import JWTError, jwt
from passlib.context import CryptContext

from config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    TOTP_ISSUER,
    TOTP_VALID_WINDOW,
)

# Password hashing context (using Argon2 - more secure than bcrypt)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


# ============================================================================
# PASSWORD HASHING
# ============================================================================

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ============================================================================
# JWT TOKENS
# ============================================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "jti": secrets.token_urlsafe(16),  # Unique token ID
    })

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# ============================================================================
# TOTP (Google Authenticator)
# ============================================================================

def generate_totp_secret() -> str:
    """Generate a new TOTP secret for a user."""
    return pyotp.random_base32()


def get_totp_uri(secret: str, email: str) -> str:
    """Get the TOTP provisioning URI for QR code generation."""
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=email, issuer_name=TOTP_ISSUER)


def generate_totp_qr_code(secret: str, email: str) -> str:
    """Generate a QR code for TOTP setup as base64 PNG."""
    uri = get_totp_uri(secret, email)

    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(uri)
    qr.make(fit=True)

    # Create image
    img = qr.make_image(fill_color="black", back_color="white")

    # Convert to base64
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

    return f"data:image/png;base64,{img_base64}"


def verify_totp(secret: str, code: str) -> bool:
    """Verify a TOTP code against the secret."""
    if not secret or not code:
        return False

    # Remove any spaces or dashes from the code
    code = code.replace(" ", "").replace("-", "")

    # Validate code format (6 digits)
    if not code.isdigit() or len(code) != 6:
        return False

    totp = pyotp.TOTP(secret)

    # valid_window allows for clock drift (1 = ±30 seconds)
    return totp.verify(code, valid_window=TOTP_VALID_WINDOW)


def get_current_totp(secret: str) -> str:
    """Get the current TOTP code (for testing/debugging only)."""
    totp = pyotp.TOTP(secret)
    return totp.now()


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def generate_secure_token(length: int = 32) -> str:
    """Generate a cryptographically secure random token."""
    return secrets.token_urlsafe(length)


def get_domain_from_email(email: str) -> str:
    """Extract domain from email address."""
    if "@" in email:
        return email.split("@")[1].lower()
    return ""
