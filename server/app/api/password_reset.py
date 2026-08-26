from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import smtplib
import os
from email.mime.text import MIMEText
from app.database import get_db
from app.models.user import User
from app.schemas.password_reset import (
    ForgotPasswordRequest, ResetPasswordRequest, ResetPasswordResponse
)
from app.services import password_reset_service

router = APIRouter()


def send_reset_email(email: str, token: str):
    """Send password reset email via Gmail SMTP."""
    reset_link = f"https://serenity-app-one.vercel.app/reset-password?token={token}"
    
    msg = MIMEText(
        f"Click here to reset your Serenity password:\n\n{reset_link}\n\n"
        "This link expires in 1 hour. If you didn't request this, you can ignore this email."
    )
    msg["Subject"] = "Reset your Serenity password"
    msg["From"] = os.getenv("SMTP_EMAIL")
    msg["To"] = email
    
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(os.getenv("SMTP_EMAIL"), os.getenv("SMTP_PASSWORD"))
            server.send_message(msg)
        print(f"Password reset email sent to {email}")
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