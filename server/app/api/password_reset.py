from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import os
import requests
from app.database import get_db
from app.models.user import User
from app.schemas.password_reset import (
    ForgotPasswordRequest, ResetPasswordRequest, ResetPasswordResponse
)
from app.services import password_reset_service

router = APIRouter()


def send_reset_email(email: str, token: str):
    """Send password reset email via Resend."""
    reset_link = f"https://serenity-app-one.vercel.app/reset-password?token={token}"
    
    try:
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {os.getenv('RESEND_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "from": os.getenv("RESEND_FROM_EMAIL", "noreply@serenity.app"),
                "to": email,
                "subject": "Reset your Serenity password",
                "html": f"""
                <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
                    <h2 style="color: #6366f1;">serenity</h2>
                    <p>You requested a password reset.</p>
                    <p><a href="{reset_link}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">Reset your password</a></p>
                    <p style="color: #94a3b8; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
                </div>
                """
            }
        )
        print(f"Password reset email sent to {email}: {response.status_code}")
    except Exception as e:
        print(f"Failed to send email: {e}")


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