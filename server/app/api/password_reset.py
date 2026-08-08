from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.password_reset import (
    ForgotPasswordRequest, ResetPasswordRequest, ResetPasswordResponse
)
from app.services import password_reset_service

router = APIRouter()


def send_reset_email(email: str, token: str):
    """Send password reset email. For dev, log to console."""
    reset_link = f"http://localhost:5173/reset-password?token={token}"
    # In production, use SendGrid/Mailgun here
    print(f"\n{'='*60}")
    print(f"PASSWORD RESET LINK FOR {email}:")
    print(f"{reset_link}")
    print(f"{'='*60}\n")


@router.post("/forgot-password", response_model=ResetPasswordResponse)
def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Send a password reset link to the user's email."""
    user = db.query(User).filter(User.email == request.email).first()
    
    # Always return success even if email doesn't exist (security)
    if not user:
        return ResetPasswordResponse(
            message="If an account with that email exists, a reset link has been sent."
        )
    
    token = password_reset_service.create_reset_token(db, user)
    
    # Send email in background
    background_tasks.add_task(send_reset_email, user.email, token)
    
    return ResetPasswordResponse(
        message="If an account with that email exists, a reset link has been sent."
    )


@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """Reset password using the token from the email."""
    success = password_reset_service.reset_password(
        db, request.token, request.new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token. Please request a new one."
        )
    
    return ResetPasswordResponse(
        message="Password has been reset successfully. You can now log in with your new password."
    )