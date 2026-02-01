"""
LVS Portal - Account Comments API
Slack-like comments/notes for customer accounts
"""
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, HTTPException, status, Request, Depends
from pydantic import BaseModel

from auth import get_current_user, get_client_ip
from database import (
    create_comment, get_comments, delete_comment,
    get_user_display_name, log_audit
)

router = APIRouter(prefix="/comments", tags=["Comments"])


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class CreateCommentRequest(BaseModel):
    message: str


class CommentResponse(BaseModel):
    id: int
    account_id: str
    message: str
    created_at: str
    edited_at: Optional[str] = None
    user_id: int
    user_name: str
    display_name: str  # FirstName (Company) format
    is_own: bool = False  # True if current user posted this


class CommentsListResponse(BaseModel):
    account_id: str
    comments: List[CommentResponse]
    count: int


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/{account_id}", response_model=CommentsListResponse)
async def get_account_comments(
    account_id: str,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all comments for an account.
    Account ID can be a customer company name (e.g., 'koniku', 'anduril')
    or a user email for investor/partner accounts.
    """
    comments = get_comments(account_id, limit)

    comment_responses = []
    for c in comments:
        display_name = get_user_display_name({
            'name': c.get('name'),
            'company': c.get('company'),
            'portal_type': c.get('portal_type')
        })

        comment_responses.append(CommentResponse(
            id=c['id'],
            account_id=c['account_id'],
            message=c['message'],
            created_at=str(c['created_at']),
            edited_at=str(c['edited_at']) if c.get('edited_at') else None,
            user_id=c['user_id'],
            user_name=c.get('name', 'Unknown'),
            display_name=display_name,
            is_own=c['user_id'] == current_user['id']
        ))

    return CommentsListResponse(
        account_id=account_id,
        comments=comment_responses,
        count=len(comment_responses)
    )


@router.post("/{account_id}", response_model=CommentResponse)
async def post_comment(
    request: Request,
    account_id: str,
    body: CreateCommentRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Post a new comment to an account.
    """
    client_ip = get_client_ip(request)

    if not body.message or not body.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty."
        )

    # Limit message length
    if len(body.message) > 2000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message too long. Maximum 2000 characters."
        )

    comment_id = create_comment(
        account_id=account_id,
        user_id=current_user['id'],
        message=body.message.strip()
    )

    if not comment_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create comment."
        )

    log_audit(
        current_user['id'],
        "COMMENT_POSTED",
        f"Comment on {account_id}: {body.message[:50]}...",
        client_ip
    )

    display_name = get_user_display_name(current_user)

    return CommentResponse(
        id=comment_id,
        account_id=account_id,
        message=body.message.strip(),
        created_at=datetime.utcnow().isoformat(),
        user_id=current_user['id'],
        user_name=current_user.get('name', 'Unknown'),
        display_name=display_name,
        is_own=True
    )


@router.delete("/{account_id}/{comment_id}")
async def remove_comment(
    request: Request,
    account_id: str,
    comment_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a comment.
    Users can only delete their own comments.
    Founders can delete any comment.
    """
    client_ip = get_client_ip(request)

    success = delete_comment(comment_id, current_user['id'])

    if not success:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete this comment. You may not have permission."
        )

    log_audit(
        current_user['id'],
        "COMMENT_DELETED",
        f"Deleted comment {comment_id} on {account_id}",
        client_ip
    )

    return {"success": True, "message": "Comment deleted."}


# ============================================================================
# HELPER ENDPOINT - Get current user's display name
# ============================================================================

@router.get("/me/display-name")
async def get_my_display_name(current_user: dict = Depends(get_current_user)):
    """Get the current user's formatted display name."""
    display_name = get_user_display_name(current_user)
    first_name = current_user.get('name', 'User').split()[0]

    return {
        "display_name": display_name,
        "first_name": first_name,
        "full_name": current_user.get('name'),
        "company": current_user.get('company'),
        "portal_type": current_user.get('portal_type')
    }
