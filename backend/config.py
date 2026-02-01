"""
LVS Portal - Configuration Settings
"""
import os
import secrets
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# Security settings
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database - Turso (cloud SQLite) or local SQLite fallback
TURSO_DATABASE_URL = os.getenv("TURSO_DATABASE_URL")  # e.g., libsql://db-name.turso.io
TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN")
USE_TURSO = bool(TURSO_DATABASE_URL and TURSO_AUTH_TOKEN)

# Legacy setting (kept for compatibility)
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{BASE_DIR}/lvs_portal.db")

# CORS - Frontend origins allowed to access API
CORS_ORIGINS = [
    # Local development
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Local domain (requires /etc/hosts)
    "http://lvs.local:8000",
    "http://lvs.local",
    # Production domains
    "https://portal.lolavisionsystems.com",
    "https://lolavisionsystems.com",
    "https://lvs.app",
    "https://www.lvs.app",
    # Cloud Run
    "https://lvs-portal-657638018776.us-central1.run.app",
    # GitHub Pages
    "https://mbanotnba.github.io",
]

# TOTP Settings (Google Authenticator)
TOTP_ISSUER = "Lola Vision Systems"
TOTP_VALID_WINDOW = 1  # Allow 1 period before/after for clock drift

# Password requirements
MIN_PASSWORD_LENGTH = 8

# Rate limiting
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15

# Portal types and their domains
PORTAL_DOMAINS = {
    # Customer domains
    'koniku.co': {'type': 'customer', 'company': 'koniku', 'name': 'Koniku'},
    'koniku.com': {'type': 'customer', 'company': 'koniku', 'name': 'Koniku'},
    'anduril.com': {'type': 'customer', 'company': 'anduril', 'name': 'Anduril Industries'},
    'glidtech.com': {'type': 'customer', 'company': 'glid', 'name': 'Glid Technologies'},
    'glid.io': {'type': 'customer', 'company': 'glid', 'name': 'Glid Technologies'},
    'machindustries.com': {'type': 'customer', 'company': 'mach', 'name': 'Mach Industries'},
    'mach.industries': {'type': 'customer', 'company': 'mach', 'name': 'Mach Industries'},
    'terrahaptix.com': {'type': 'customer', 'company': 'terrahaptix', 'name': 'Terrahaptix'},
    'revenant.com': {'type': 'customer', 'company': 'revenant', 'name': 'Revenant Industries'},
    'seasats.com': {'type': 'customer', 'company': 'seasats', 'name': 'Seasats'},

    # Partner domains
    'amd.com': {'type': 'partner', 'company': 'amd', 'name': 'AMD'},

    # Founder domain
    'lolavisionsystems.com': {'type': 'founder', 'company': 'lvs', 'name': 'Lola Vision Systems'},
}

# Portal URLs (for frontend reference)
PORTAL_URLS = {
    'investor': 'dashboard.html',
    'founder': 'founder-portal.html',
    'customer': {
        'anduril': 'customer-portal-mockup.html',
        'koniku': 'koniku-portal.html',
        'glid': 'glid-portal.html',
        'mach': 'mach-portal.html',
        'terrahaptix': 'terrahaptix-portal.html',
        'revenant': 'dashboard.html',
        'seasats': 'dashboard.html',
    },
    'partner': {
        'amd': 'partner-portal.html?partner=amd',
    }
}

# ============================================================================
# DEMO USER SEEDING (Security-sensitive settings)
# ============================================================================

# Demo user seeding - DISABLED by default for security
# Only enable in development/testing environments with explicit opt-in
SEED_DEMO_USERS = os.getenv("SEED_DEMO_USERS", "false").lower() == "true"

# Demo user passwords - MUST be set via environment variables
# NEVER commit actual passwords to source control
DEMO_FOUNDER_PASSWORD = os.getenv("DEMO_FOUNDER_PASSWORD")
DEMO_INVESTOR_PASSWORD = os.getenv("DEMO_INVESTOR_PASSWORD")
DEMO_CUSTOMER_PASSWORD = os.getenv("DEMO_CUSTOMER_PASSWORD")
DEMO_PARTNER_PASSWORD = os.getenv("DEMO_PARTNER_PASSWORD")
