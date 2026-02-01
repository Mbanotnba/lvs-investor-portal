"""
LVS Portal - Database Setup
SQLite database with Turso (cloud) or local fallback
"""
import sqlite3
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from pathlib import Path

from config import (
    BASE_DIR, SEED_DEMO_USERS,
    DEMO_FOUNDER_PASSWORD, DEMO_INVESTOR_PASSWORD,
    DEMO_CUSTOMER_PASSWORD, DEMO_PARTNER_PASSWORD,
    TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, USE_TURSO
)
from security import hash_password

# Try to import libsql for Turso support
try:
    import libsql_experimental as libsql
    LIBSQL_AVAILABLE = True
except ImportError:
    LIBSQL_AVAILABLE = False
    print("Warning: libsql_experimental not installed. Using local SQLite only.")

# Database file path
DB_PATH = BASE_DIR / "lvs_portal.db"

# Global connection for embedded replica (reused to maintain sync)
_turso_conn = None
_using_turso = False


def to_db_datetime(dt: Optional[datetime]) -> Optional[str]:
    """Convert datetime to ISO string for database storage.

    libsql doesn't handle Python datetime objects directly,
    so we convert to ISO format strings.
    """
    if dt is None:
        return None
    return dt.isoformat()


def get_db_connection():
    """Get a database connection (Turso embedded replica or local SQLite)."""
    global _turso_conn, _using_turso

    if USE_TURSO and LIBSQL_AVAILABLE:
        _using_turso = True
        # Use embedded replica - local SQLite that syncs to Turso
        if _turso_conn is None:
            _turso_conn = libsql.connect(
                str(DB_PATH),  # Local file path
                sync_url=TURSO_DATABASE_URL,
                auth_token=TURSO_AUTH_TOKEN
            )
            # Initial sync from remote
            try:
                _turso_conn.sync()
            except Exception as e:
                print(f"Turso sync warning: {e}")
        return _turso_conn
    else:
        # Fallback to local SQLite
        _using_turso = False
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn


def sync_to_turso():
    """Sync local changes to Turso cloud."""
    global _turso_conn
    if _turso_conn is not None:
        try:
            _turso_conn.sync()
        except Exception as e:
            print(f"Turso sync error: {e}")


def row_to_dict(cursor, row):
    """Convert a database row to a dict."""
    if row is None:
        return None
    if _using_turso:
        return dict(zip([col[0] for col in cursor.description], row))
    else:
        return dict(row)


def close_connection(conn):
    """Safely close a database connection (no-op for embedded replica)."""
    global _turso_conn
    if conn is _turso_conn:
        # Don't close the embedded replica connection, just sync
        sync_to_turso()
    else:
        # Close regular SQLite connections
        try:
            if hasattr(conn, 'close') and callable(getattr(conn, 'close', None)):
                conn.close()
        except Exception:
            pass


def init_database():
    """Initialize the database schema."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            portal_type TEXT NOT NULL CHECK (portal_type IN ('investor', 'customer', 'partner', 'founder')),
            company TEXT,
            totp_secret TEXT,
            totp_enabled INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            failed_login_attempts INTEGER DEFAULT 0,
            locked_until TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            nda_status TEXT DEFAULT 'not_required' CHECK (nda_status IN ('not_required', 'pending', 'approved', 'expired', 'revoked')),
            nda_signed_date TIMESTAMP,
            nda_expires_date TIMESTAMP,
            nda_approved_by INTEGER,
            nda_approved_at TIMESTAMP,
            nda_notes TEXT,
            FOREIGN KEY (nda_approved_by) REFERENCES users(id)
        )
    """)

    # Login attempts table (for rate limiting)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS login_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            ip_address TEXT,
            success INTEGER NOT NULL,
            attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Sessions table (for token tracking)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token_jti TEXT UNIQUE NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            revoked INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # Audit log table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            details TEXT,
            ip_address TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # Pending auth table (replaces in-memory dict for multi-step auth flow)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pending_auth (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            step TEXT NOT NULL CHECK (step IN ('password', '2fa')),
            user_id INTEGER,
            portal_info TEXT,
            ip_address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL
        )
    """)

    # NDA documents table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS nda_documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            gcs_path TEXT NOT NULL,
            file_size INTEGER,
            content_type TEXT,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            reviewed_by INTEGER,
            reviewed_at TIMESTAMP,
            review_notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (reviewed_by) REFERENCES users(id)
        )
    """)

    # Account comments/notes table (Slack-like feature)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS account_comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            edited_at TIMESTAMP,
            is_deleted INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # Create indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_token_jti ON sessions(token_jti)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_pending_auth_email ON pending_auth(email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_pending_auth_expires ON pending_auth(expires_at)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_nda_documents_user ON nda_documents(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_nda_documents_status ON nda_documents(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_account_comments_account ON account_comments(account_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_account_comments_created ON account_comments(created_at)")

    conn.commit()
    close_connection(conn)


# ============================================================================
# USER OPERATIONS
# ============================================================================

def create_user(
    email: str,
    password: str,
    name: str,
    portal_type: str,
    company: Optional[str] = None
) -> Optional[int]:
    """Create a new user and return their ID."""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        password_hash = hash_password(password)
        cursor.execute("""
            INSERT INTO users (email, password_hash, name, portal_type, company)
            VALUES (?, ?, ?, ?, ?)
        """, (email.lower(), password_hash, name, portal_type, company))
        conn.commit()
        return cursor.lastrowid
    except (sqlite3.IntegrityError, Exception) as e:
        if "UNIQUE constraint" in str(e) or "IntegrityError" in str(type(e).__name__):
            return None  # Email already exists
        raise  # Re-raise unexpected errors
    finally:
        close_connection(conn)


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get a user by their email address."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ? AND is_active = 1", (email.lower(),))
    row = cursor.fetchone()
    result = row_to_dict(cursor, row) if row else None
    close_connection(conn)

    return result


def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """Get a user by their ID."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE id = ? AND is_active = 1", (user_id,))
    row = cursor.fetchone()
    result = row_to_dict(cursor, row) if row else None
    close_connection(conn)

    return result


def update_user_password(user_id: int, new_password: str) -> bool:
    """Update a user's password."""
    conn = get_db_connection()
    cursor = conn.cursor()

    password_hash = hash_password(new_password)
    cursor.execute("""
        UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (password_hash, user_id))

    conn.commit()
    success = cursor.rowcount > 0
    close_connection(conn)
    return success


def update_user_totp(user_id: int, totp_secret: str, enabled: bool = False) -> bool:
    """Update a user's TOTP secret."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE users SET totp_secret = ?, totp_enabled = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (totp_secret, 1 if enabled else 0, user_id))

    conn.commit()
    success = cursor.rowcount > 0
    close_connection(conn)
    return success


def enable_user_totp(user_id: int) -> bool:
    """Enable TOTP for a user (after they've verified setup)."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE users SET totp_enabled = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND totp_secret IS NOT NULL
    """, (user_id,))

    conn.commit()
    success = cursor.rowcount > 0
    close_connection(conn)
    return success


def update_last_login(user_id: int) -> None:
    """Update a user's last login timestamp."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE users SET last_login = CURRENT_TIMESTAMP, failed_login_attempts = 0
        WHERE id = ?
    """, (user_id,))

    conn.commit()
    close_connection(conn)


def increment_failed_login(email: str) -> int:
    """Increment failed login attempts and return the new count."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE users SET failed_login_attempts = failed_login_attempts + 1
        WHERE email = ?
    """, (email.lower(),))

    cursor.execute("SELECT failed_login_attempts FROM users WHERE email = ?", (email.lower(),))
    row = cursor.fetchone()

    conn.commit()
    close_connection(conn)

    return row['failed_login_attempts'] if row else 0


def lock_user_account(email: str, until: datetime) -> None:
    """Lock a user account until a specific time."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE users SET locked_until = ?
        WHERE email = ?
    """, (until, email.lower()))

    conn.commit()
    close_connection(conn)


def reset_failed_attempts(email: str) -> None:
    """Reset failed login attempts for a user."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE users SET failed_login_attempts = 0, locked_until = NULL
        WHERE email = ?
    """, (email.lower(),))

    conn.commit()
    close_connection(conn)


# ============================================================================
# SESSION OPERATIONS
# ============================================================================

def create_session(user_id: int, token_jti: str, expires_at: datetime,
                   ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> int:
    """Create a new session record."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO sessions (user_id, token_jti, ip_address, user_agent, expires_at)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, token_jti, ip_address, user_agent, to_db_datetime(expires_at)))

    conn.commit()
    session_id = cursor.lastrowid
    close_connection(conn)
    return session_id


def revoke_session(token_jti: str) -> bool:
    """Revoke a session by its token JTI."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE sessions SET revoked = 1 WHERE token_jti = ?", (token_jti,))

    conn.commit()
    success = cursor.rowcount > 0
    close_connection(conn)
    return success


def is_session_valid(token_jti: str) -> bool:
    """Check if a session is valid (not revoked and not expired)."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM sessions
        WHERE token_jti = ? AND revoked = 0 AND expires_at > CURRENT_TIMESTAMP
    """, (token_jti,))

    row = cursor.fetchone()
    close_connection(conn)
    return row is not None


def revoke_all_user_sessions(user_id: int) -> int:
    """Revoke all sessions for a user. Returns count of revoked sessions."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE sessions SET revoked = 1 WHERE user_id = ? AND revoked = 0", (user_id,))

    conn.commit()
    count = cursor.rowcount
    close_connection(conn)
    return count


# ============================================================================
# PENDING AUTH OPERATIONS (replaces in-memory dict)
# ============================================================================

import json

def create_pending_auth(
    email: str,
    step: str,
    user_id: Optional[int] = None,
    portal_info: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    expires_minutes: int = 5
) -> bool:
    """Create or update a pending auth record for multi-step login flow.

    This replaces the in-memory pending_auth dict with a database-backed solution
    that persists across server restarts and handles race conditions properly.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    expires_at = datetime.utcnow() + timedelta(minutes=expires_minutes)
    portal_info_json = json.dumps(portal_info) if portal_info else None

    try:
        # Delete any existing pending auth for this email first
        cursor.execute("DELETE FROM pending_auth WHERE email = ?", (email.lower(),))

        # Insert new pending auth
        cursor.execute("""
            INSERT INTO pending_auth (email, step, user_id, portal_info, ip_address, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (email.lower(), step, user_id, portal_info_json, ip_address, to_db_datetime(expires_at)))

        conn.commit()
        return True
    except Exception:
        conn.rollback()
        return False
    finally:
        close_connection(conn)


def get_pending_auth(email: str) -> Optional[Dict[str, Any]]:
    """Get pending auth record if exists and not expired.

    Returns None if no record exists or if it has expired.
    Automatically cleans up expired records.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # First, clean up expired records for this email
    cursor.execute("""
        DELETE FROM pending_auth
        WHERE email = ? AND expires_at <= CURRENT_TIMESTAMP
    """, (email.lower(),))
    conn.commit()

    # Now fetch the valid record
    cursor.execute("""
        SELECT email, step, user_id, portal_info, ip_address, created_at, expires_at
        FROM pending_auth
        WHERE email = ? AND expires_at > CURRENT_TIMESTAMP
    """, (email.lower(),))

    row = cursor.fetchone()
    result = row_to_dict(cursor, row) if row else None
    close_connection(conn)

    if result:
        # Parse portal_info JSON
        if result.get('portal_info'):
            try:
                result['portal_info'] = json.loads(result['portal_info'])
            except json.JSONDecodeError:
                result['portal_info'] = None
        return result

    return None


def delete_pending_auth(email: str) -> bool:
    """Delete pending auth record after successful authentication."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM pending_auth WHERE email = ?", (email.lower(),))
    conn.commit()

    deleted = cursor.rowcount > 0
    close_connection(conn)
    return deleted


def cleanup_expired_pending_auth() -> int:
    """Clean up all expired pending auth records.

    Call this periodically (e.g., every 5 minutes) to remove stale entries.
    Returns the number of records deleted.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM pending_auth WHERE expires_at <= CURRENT_TIMESTAMP")
    conn.commit()

    deleted = cursor.rowcount
    close_connection(conn)
    return deleted


# ============================================================================
# AUDIT LOG OPERATIONS
# ============================================================================

def log_audit(user_id: Optional[int], action: str, details: Optional[str] = None,
              ip_address: Optional[str] = None) -> None:
    """Log an audit event."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO audit_log (user_id, action, details, ip_address)
        VALUES (?, ?, ?, ?)
    """, (user_id, action, details, ip_address))

    conn.commit()
    close_connection(conn)


def get_user_audit_log(user_id: int, limit: int = 50) -> List[Dict[str, Any]]:
    """Get audit log entries for a user."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM audit_log
        WHERE user_id = ?
        ORDER BY timestamp DESC
        LIMIT ?
    """, (user_id, limit))

    rows = cursor.fetchall()
    result = [row_to_dict(cursor, row) for row in rows]
    close_connection(conn)

    return result


# ============================================================================
# NDA MANAGEMENT
# ============================================================================

def get_user_nda_status(user_id: int) -> Optional[Dict[str, Any]]:
    """Get NDA status for a user."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, email, name, portal_type, company,
               nda_status, nda_signed_date, nda_expires_date,
               nda_approved_by, nda_approved_at, nda_notes
        FROM users WHERE id = ?
    """, (user_id,))

    row = cursor.fetchone()
    result = row_to_dict(cursor, row) if row else None
    close_connection(conn)

    return result


def check_nda_access(user: Dict[str, Any]) -> Dict[str, Any]:
    """
    Check if a user has valid NDA access.
    Returns: {allowed: bool, reason: str, status: str}
    """
    portal_type = user.get("portal_type", "")

    # Founders and investors are exempt from NDA requirements
    if portal_type in ("founder", "investor"):
        return {
            "allowed": True,
            "reason": "exempt",
            "status": "not_required"
        }

    nda_status = user.get("nda_status", "pending")

    # Check if NDA is approved
    if nda_status == "approved":
        # Check if NDA has expired
        expires_date = user.get("nda_expires_date")
        if expires_date:
            try:
                if isinstance(expires_date, str):
                    expires_dt = datetime.fromisoformat(expires_date)
                else:
                    expires_dt = expires_date

                if datetime.utcnow() > expires_dt:
                    # NDA has expired - update status
                    update_nda_status(user["id"], "expired")
                    return {
                        "allowed": False,
                        "reason": "NDA has expired. Please contact LVS to renew.",
                        "status": "expired"
                    }
            except (ValueError, TypeError):
                pass  # Invalid date format, ignore expiration check

        return {
            "allowed": True,
            "reason": "approved",
            "status": "approved"
        }

    # NDA not approved
    reason_map = {
        "pending": "Your NDA is pending approval. You will be notified once approved.",
        "expired": "Your NDA has expired. Please contact LVS to renew.",
        "revoked": "Your portal access has been revoked. Please contact LVS.",
        "not_required": "NDA verification required. Please contact LVS."
    }

    return {
        "allowed": False,
        "reason": reason_map.get(nda_status, "NDA approval required."),
        "status": nda_status
    }


def update_nda_status(
    user_id: int,
    status: str,
    approved_by: Optional[int] = None,
    expires_date: Optional[datetime] = None,
    signed_date: Optional[datetime] = None,
    notes: Optional[str] = None
) -> bool:
    """Update a user's NDA status. Uses parameterized queries for all values."""
    conn = get_db_connection()
    cursor = conn.cursor()

    update_fields = ["nda_status = ?", "updated_at = CURRENT_TIMESTAMP"]
    params = [status]

    if status == "approved" and approved_by:
        update_fields.append("nda_approved_by = ?")
        update_fields.append("nda_approved_at = CURRENT_TIMESTAMP")
        params.append(approved_by)

    if expires_date:
        update_fields.append("nda_expires_date = ?")
        params.append(expires_date)

    if signed_date:
        update_fields.append("nda_signed_date = ?")
        params.append(signed_date)

    if notes is not None:
        update_fields.append("nda_notes = ?")
        params.append(notes)

    params.append(user_id)

    cursor.execute(f"""
        UPDATE users SET {', '.join(update_fields)}
        WHERE id = ?
    """, params)

    conn.commit()
    success = cursor.rowcount > 0
    close_connection(conn)
    return success


def get_all_users_nda_status(portal_types: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    """Get NDA status for all users (or filtered by portal type)."""
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT u.id, u.email, u.name, u.portal_type, u.company,
               u.nda_status, u.nda_signed_date, u.nda_expires_date,
               u.nda_approved_by, u.nda_approved_at, u.nda_notes,
               u.created_at, u.last_login, u.is_active,
               approver.name as approved_by_name
        FROM users u
        LEFT JOIN users approver ON u.nda_approved_by = approver.id
        WHERE u.is_active = 1
    """

    if portal_types:
        placeholders = ','.join('?' * len(portal_types))
        query += f" AND u.portal_type IN ({placeholders})"
        cursor.execute(query + " ORDER BY u.portal_type, u.company, u.name", portal_types)
    else:
        cursor.execute(query + " ORDER BY u.portal_type, u.company, u.name")

    rows = cursor.fetchall()
    result = [row_to_dict(cursor, row) for row in rows]
    close_connection(conn)

    return result


def set_user_nda_pending(user_id: int) -> bool:
    """Set a user's NDA status to pending (for new customer/partner users)."""
    return update_nda_status(user_id, "pending")


# ============================================================================
# NDA DOCUMENT MANAGEMENT
# ============================================================================

def create_nda_document(
    user_id: int,
    filename: str,
    gcs_path: str,
    file_size: int,
    content_type: str
) -> Optional[int]:
    """Create a new NDA document record."""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO nda_documents (user_id, filename, gcs_path, file_size, content_type)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, filename, gcs_path, file_size, content_type))
        conn.commit()
        doc_id = cursor.lastrowid

        # Update user NDA status to pending if not already set
        cursor.execute("""
            UPDATE users SET nda_status = 'pending', updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND nda_status IN ('not_required', 'pending')
        """, (user_id,))
        conn.commit()

        return doc_id
    except Exception as e:
        print(f"Error creating NDA document: {e}")
        return None
    finally:
        close_connection(conn)


def get_nda_document(doc_id: int) -> Optional[Dict[str, Any]]:
    """Get an NDA document by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT d.*, u.email, u.name, u.company, u.portal_type,
               r.name as reviewer_name
        FROM nda_documents d
        JOIN users u ON d.user_id = u.id
        LEFT JOIN users r ON d.reviewed_by = r.id
        WHERE d.id = ?
    """, (doc_id,))

    row = cursor.fetchone()
    result = row_to_dict(cursor, row) if row else None
    close_connection(conn)
    return result


def get_user_nda_documents(user_id: int) -> List[Dict[str, Any]]:
    """Get all NDA documents for a user."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT d.*, r.name as reviewer_name
        FROM nda_documents d
        LEFT JOIN users r ON d.reviewed_by = r.id
        WHERE d.user_id = ?
        ORDER BY d.uploaded_at DESC
    """, (user_id,))

    rows = cursor.fetchall()
    result = [row_to_dict(cursor, row) for row in rows]
    close_connection(conn)
    return result


def get_pending_nda_documents() -> List[Dict[str, Any]]:
    """Get all pending NDA documents for review."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT d.*, u.email, u.name, u.company, u.portal_type
        FROM nda_documents d
        JOIN users u ON d.user_id = u.id
        WHERE d.status = 'pending'
        ORDER BY d.uploaded_at ASC
    """)

    rows = cursor.fetchall()
    result = [row_to_dict(cursor, row) for row in rows]
    close_connection(conn)
    return result


def get_all_nda_documents(status: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get all NDA documents, optionally filtered by status."""
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT d.*, u.email, u.name, u.company, u.portal_type,
               r.name as reviewer_name
        FROM nda_documents d
        JOIN users u ON d.user_id = u.id
        LEFT JOIN users r ON d.reviewed_by = r.id
    """

    if status:
        query += " WHERE d.status = ?"
        cursor.execute(query + " ORDER BY d.uploaded_at DESC", (status,))
    else:
        cursor.execute(query + " ORDER BY d.uploaded_at DESC")

    rows = cursor.fetchall()
    result = [row_to_dict(cursor, row) for row in rows]
    close_connection(conn)
    return result


def review_nda_document(
    doc_id: int,
    reviewer_id: int,
    status: str,
    notes: Optional[str] = None
) -> bool:
    """Review (approve/reject) an NDA document."""
    if status not in ('approved', 'rejected'):
        return False

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Update document status
        cursor.execute("""
            UPDATE nda_documents
            SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, review_notes = ?
            WHERE id = ?
        """, (status, reviewer_id, notes, doc_id))

        # If approved, update the user's NDA status
        if status == 'approved':
            cursor.execute("SELECT user_id FROM nda_documents WHERE id = ?", (doc_id,))
            row = cursor.fetchone()
            if row:
                user_id = row[0]
                cursor.execute("""
                    UPDATE users
                    SET nda_status = 'approved',
                        nda_approved_by = ?,
                        nda_approved_at = CURRENT_TIMESTAMP,
                        nda_notes = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (reviewer_id, notes, user_id))

        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Error reviewing NDA document: {e}")
        return False
    finally:
        close_connection(conn)


# ============================================================================
# ACCOUNT COMMENTS (Slack-like feature)
# ============================================================================

def create_comment(
    account_id: str,
    user_id: int,
    message: str
) -> Optional[int]:
    """Create a new comment on an account."""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO account_comments (account_id, user_id, message)
            VALUES (?, ?, ?)
        """, (account_id, user_id, message))
        conn.commit()
        return cursor.lastrowid
    except Exception as e:
        print(f"Error creating comment: {e}")
        return None
    finally:
        close_connection(conn)


def get_comments(account_id: str, limit: int = 100) -> List[Dict[str, Any]]:
    """Get comments for an account with user info."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT c.id, c.account_id, c.message, c.created_at, c.edited_at,
               u.id as user_id, u.name, u.email, u.company, u.portal_type
        FROM account_comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.account_id = ? AND c.is_deleted = 0
        ORDER BY c.created_at ASC
        LIMIT ?
    """, (account_id, limit))

    rows = cursor.fetchall()
    result = [row_to_dict(cursor, row) for row in rows]
    close_connection(conn)
    return result


def delete_comment(comment_id: int, user_id: int) -> bool:
    """Soft delete a comment (only owner or founder can delete)."""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if user owns the comment or is a founder
        cursor.execute("""
            SELECT c.user_id, u.portal_type
            FROM account_comments c
            JOIN users u ON u.id = ?
            WHERE c.id = ?
        """, (user_id, comment_id))

        row = cursor.fetchone()
        if not row:
            return False

        comment_owner_id = row[0]
        requester_portal_type = row[1]

        # Allow if owner or founder
        if comment_owner_id != user_id and requester_portal_type != 'founder':
            return False

        cursor.execute("""
            UPDATE account_comments SET is_deleted = 1 WHERE id = ?
        """, (comment_id,))

        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Error deleting comment: {e}")
        return False
    finally:
        close_connection(conn)


def get_user_display_name(user: Dict[str, Any]) -> str:
    """Get formatted display name: FirstName (Company)."""
    name = user.get('name', 'Unknown')
    first_name = name.split()[0] if name else 'Unknown'

    company = user.get('company', '')
    portal_type = user.get('portal_type', '')

    # LVS employees get (LVS)
    if portal_type == 'founder' or company == 'lvs':
        return f"{first_name} (LVS)"

    # Others get their company name capitalized
    if company:
        return f"{first_name} ({company.upper()})"

    # Fallback to portal type
    if portal_type:
        return f"{first_name} ({portal_type.capitalize()})"

    return first_name


# ============================================================================
# SEED DATA
# ============================================================================

def migrate_add_nda_columns():
    """Add NDA columns to existing database if they don't exist."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if nda_status column exists
    cursor.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in cursor.fetchall()]

    if "nda_status" not in columns:
        print("Migrating database: Adding NDA columns...")
        cursor.execute("ALTER TABLE users ADD COLUMN nda_status TEXT DEFAULT 'not_required'")
        cursor.execute("ALTER TABLE users ADD COLUMN nda_signed_date TIMESTAMP")
        cursor.execute("ALTER TABLE users ADD COLUMN nda_expires_date TIMESTAMP")
        cursor.execute("ALTER TABLE users ADD COLUMN nda_approved_by INTEGER")
        cursor.execute("ALTER TABLE users ADD COLUMN nda_approved_at TIMESTAMP")
        cursor.execute("ALTER TABLE users ADD COLUMN nda_notes TEXT")

        # Set appropriate NDA status for existing users
        cursor.execute("""
            UPDATE users SET nda_status = 'not_required'
            WHERE portal_type IN ('founder', 'investor')
        """)
        cursor.execute("""
            UPDATE users SET nda_status = 'pending'
            WHERE portal_type IN ('customer', 'partner')
        """)

        conn.commit()
        print("Migration complete: NDA columns added.")

    close_connection(conn)


def seed_default_users():
    """Create default users for testing/initial setup.

    SECURITY: This function only runs if:
    1. SEED_DEMO_USERS environment variable is set to "true"
    2. All required password environment variables are set

    This prevents accidental credential exposure in production.
    """
    # Check if demo user seeding is explicitly enabled
    if not SEED_DEMO_USERS:
        print("Demo user seeding DISABLED. Set SEED_DEMO_USERS=true to enable.")
        return

    # Verify all required passwords are set via environment variables
    required_passwords = {
        'DEMO_FOUNDER_PASSWORD': DEMO_FOUNDER_PASSWORD,
        'DEMO_INVESTOR_PASSWORD': DEMO_INVESTOR_PASSWORD,
        'DEMO_CUSTOMER_PASSWORD': DEMO_CUSTOMER_PASSWORD,
        'DEMO_PARTNER_PASSWORD': DEMO_PARTNER_PASSWORD
    }

    missing_passwords = [name for name, value in required_passwords.items() if not value]

    if missing_passwords:
        print(f"ERROR: Missing required environment variables: {', '.join(missing_passwords)}")
        print("Demo users will NOT be created. Set all password variables to enable.")
        return

    # Define demo users (passwords come from environment, not hardcoded)
    default_users = [
        # Founder (NDA not required)
        {
            "email": "tayo@lolavisionsystems.com",
            "password": DEMO_FOUNDER_PASSWORD,
            "name": "Tayo Adesanya",
            "portal_type": "founder",
            "company": "lvs",
            "nda_status": "not_required"
        },
        # Investor (NDA not required)
        {
            "email": "investor@example.com",
            "password": DEMO_INVESTOR_PASSWORD,
            "name": "Demo Investor",
            "portal_type": "investor",
            "company": None,
            "nda_status": "not_required"
        },
        # Customers (NDA required - set to approved for demo)
        {
            "email": "demo@koniku.co",
            "password": DEMO_CUSTOMER_PASSWORD,
            "name": "Koniku Demo",
            "portal_type": "customer",
            "company": "koniku",
            "nda_status": "approved"
        },
        {
            "email": "demo@terrahaptix.com",
            "password": DEMO_CUSTOMER_PASSWORD,
            "name": "Terrahaptix Demo",
            "portal_type": "customer",
            "company": "terrahaptix",
            "nda_status": "approved"
        },
        # Partner (NDA required - set to approved for demo)
        {
            "email": "demo@amd.com",
            "password": DEMO_PARTNER_PASSWORD,
            "name": "AMD Demo",
            "portal_type": "partner",
            "company": "amd",
            "nda_status": "approved"
        },
    ]

    print("Creating demo users (SEED_DEMO_USERS=true)...")

    for user_data in default_users:
        existing = get_user_by_email(user_data["email"])
        if not existing:
            user_id = create_user(
                email=user_data["email"],
                password=user_data["password"],
                name=user_data["name"],
                portal_type=user_data["portal_type"],
                company=user_data["company"]
            )
            # Set NDA status
            if user_id and user_data.get("nda_status"):
                update_nda_status(user_id, user_data["nda_status"])
            print(f"Created user: {user_data['email']} (NDA: {user_data.get('nda_status', 'pending')})")


if __name__ == "__main__":
    print("Initializing database...")
    init_database()
    print("Cleaning up expired pending auth...")
    deleted = cleanup_expired_pending_auth()
    if deleted:
        print(f"  Removed {deleted} expired pending auth records")
    print("Seeding default users...")
    seed_default_users()
    print("Done!")
