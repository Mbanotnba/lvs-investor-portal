"""
LVS Portal - Email Service
SendGrid integration for transactional emails (password reset, etc.)
"""
import os
from typing import Optional

from config import (
    SENDGRID_API_KEY,
    SENDGRID_FROM_EMAIL,
    SENDGRID_FROM_NAME,
    PORTAL_URL
)

# Try to import SendGrid
try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail, Email, To, Content, HtmlContent
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False
    print("Warning: sendgrid not installed. Email functionality disabled.")


def is_email_configured() -> bool:
    """Check if email service is properly configured."""
    return bool(SENDGRID_AVAILABLE and SENDGRID_API_KEY)


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """Send an email using SendGrid.

    Args:
        to_email: Recipient email address
        subject: Email subject line
        html_content: HTML body of the email
        text_content: Plain text fallback (optional)

    Returns:
        True if email sent successfully, False otherwise
    """
    if not is_email_configured():
        print(f"Email not configured. Would send to: {to_email}, Subject: {subject}")
        return False

    try:
        message = Mail(
            from_email=Email(SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME),
            to_emails=To(to_email),
            subject=subject,
            html_content=html_content
        )

        if text_content:
            message.content = [
                Content("text/plain", text_content),
                Content("text/html", html_content)
            ]

        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)

        if response.status_code in (200, 201, 202):
            print(f"Email sent successfully to {to_email}")
            return True
        else:
            print(f"Email send failed: {response.status_code} - {response.body}")
            return False

    except Exception as e:
        print(f"Email send error: {e}")
        return False


def send_password_reset_email(
    to_email: str,
    user_name: str,
    reset_token: str,
    reset_code: str
) -> bool:
    """Send a password reset email with both link and code.

    Args:
        to_email: User's email address
        user_name: User's display name
        reset_token: Secure URL token for reset link
        reset_code: 6-digit verification code

    Returns:
        True if email sent successfully, False otherwise
    """
    reset_url = f"{PORTAL_URL}/login.html?reset_token={reset_token}"

    subject = "Reset Your LVS Portal Password"

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f1a; color: #e0e0e0;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #7c4dff; font-size: 24px; margin: 0;">LOLA VISION SYSTEMS</h1>
            <p style="color: #888; font-size: 14px; margin-top: 8px;">Secure Portal Access</p>
        </div>

        <!-- Main Content -->
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 32px; border: 1px solid rgba(124, 77, 255, 0.2);">
            <h2 style="color: #fff; font-size: 20px; margin: 0 0 16px 0;">Password Reset Request</h2>

            <p style="color: #ccc; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Hi {user_name},
            </p>

            <p style="color: #ccc; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                We received a request to reset your password for the LVS Portal. Use one of the options below to complete the reset:
            </p>

            <!-- Option 1: 6-digit Code -->
            <div style="background: rgba(124, 77, 255, 0.1); border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
                <p style="color: #888; font-size: 13px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #7c4dff; font-family: monospace;">
                    {reset_code}
                </div>
                <p style="color: #666; font-size: 12px; margin: 12px 0 0 0;">Enter this code on the password reset page</p>
            </div>

            <!-- Option 2: Reset Link -->
            <div style="text-align: center; margin-bottom: 24px;">
                <p style="color: #888; font-size: 13px; margin: 0 0 12px 0;">Or click the button below:</p>
                <a href="{reset_url}" style="display: inline-block; background: linear-gradient(135deg, #7c4dff, #6200ea); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                    Reset Password
                </a>
            </div>

            <!-- Expiration Warning -->
            <div style="background: rgba(255, 193, 7, 0.1); border-left: 3px solid #ffc107; padding: 12px 16px; border-radius: 0 8px 8px 0;">
                <p style="color: #ffc107; font-size: 13px; margin: 0; font-weight: 600;">
                    This link and code expire in 15 minutes
                </p>
            </div>
        </div>

        <!-- Security Notice -->
        <div style="margin-top: 24px; padding: 20px; background: rgba(255, 255, 255, 0.02); border-radius: 8px;">
            <p style="color: #888; font-size: 13px; line-height: 1.6; margin: 0;">
                <strong style="color: #ccc;">Didn't request this?</strong><br>
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="color: #666; font-size: 12px; margin: 0;">
                &copy; 2026 Lola Vision Systems | Confidential
            </p>
            <p style="color: #555; font-size: 11px; margin: 8px 0 0 0;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
"""

    text_content = f"""
LOLA VISION SYSTEMS - Password Reset

Hi {user_name},

We received a request to reset your password for the LVS Portal.

Your verification code: {reset_code}

Or use this link to reset your password:
{reset_url}

This code and link expire in 15 minutes.

If you didn't request this, you can safely ignore this email.

---
Lola Vision Systems | Confidential
"""

    return send_email(to_email, subject, html_content, text_content)


def send_password_changed_notification(
    to_email: str,
    user_name: str,
    ip_address: Optional[str] = None
) -> bool:
    """Send a notification that the password was changed.

    Args:
        to_email: User's email address
        user_name: User's display name
        ip_address: IP address where the change was made (optional)

    Returns:
        True if email sent successfully, False otherwise
    """
    subject = "Your LVS Portal Password Was Changed"

    ip_info = f"<p style='color: #888; font-size: 13px; margin: 8px 0 0 0;'>IP Address: {ip_address}</p>" if ip_address else ""

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f1a; color: #e0e0e0;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #7c4dff; font-size: 24px; margin: 0;">LOLA VISION SYSTEMS</h1>
            <p style="color: #888; font-size: 14px; margin-top: 8px;">Security Notification</p>
        </div>

        <!-- Main Content -->
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 32px; border: 1px solid rgba(76, 175, 80, 0.3);">
            <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 48px;">&#9989;</span>
            </div>

            <h2 style="color: #4caf50; font-size: 20px; margin: 0 0 16px 0; text-align: center;">Password Changed Successfully</h2>

            <p style="color: #ccc; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Hi {user_name},
            </p>

            <p style="color: #ccc; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Your LVS Portal password was successfully changed. You can now use your new password to log in.
            </p>
            {ip_info}
        </div>

        <!-- Security Warning -->
        <div style="margin-top: 24px; padding: 20px; background: rgba(244, 67, 54, 0.05); border-radius: 8px; border-left: 3px solid #f44336;">
            <p style="color: #f44336; font-size: 13px; line-height: 1.6; margin: 0; font-weight: 600;">
                Didn't make this change?
            </p>
            <p style="color: #ccc; font-size: 13px; line-height: 1.6; margin: 8px 0 0 0;">
                If you didn't change your password, please contact us immediately at <a href="mailto:security@lolavisionsystems.com" style="color: #7c4dff;">security@lolavisionsystems.com</a>
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="color: #666; font-size: 12px; margin: 0;">
                &copy; 2026 Lola Vision Systems | Confidential
            </p>
        </div>
    </div>
</body>
</html>
"""

    text_content = f"""
LOLA VISION SYSTEMS - Security Notification

Hi {user_name},

Your LVS Portal password was successfully changed.

If you didn't make this change, please contact us immediately at security@lolavisionsystems.com

---
Lola Vision Systems | Confidential
"""

    return send_email(to_email, subject, html_content, text_content)
