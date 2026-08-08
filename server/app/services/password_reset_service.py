import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.password_reset import PasswordReset
from app.utils.security import get_password_hash


def create_reset_token(db: Session, user: User) -> str:
    """Create a password reset token valid for 1 hour."""
    # Invalidate old tokens
    db.query(PasswordReset).filter(
        PasswordReset.user_id == user.id,
        PasswordReset.is_used == False
    ).update({"is_used": True})
    
    token = str(uuid.uuid4())
    reset = PasswordReset(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=1)
    )
    db.add(reset)
    db.commit()
    return token


def verify_token(db: Session, token: str) -> User:
    """Verify a reset token and return the user if valid."""
    reset = db.query(PasswordReset).filter(
        PasswordReset.token == token,
        PasswordReset.is_used == False,
        PasswordReset.expires_at > datetime.utcnow()
    ).first()
    
    if not reset:
        return None
    
    user = db.query(User).filter(User.id == reset.user_id).first()
    return user


def reset_password(db: Session, token: str, new_password: str) -> bool:
    """Reset the user's password using a valid token."""
    user = verify_token(db, token)
    if not user:
        return False
    
    user.hashed_password = get_password_hash(new_password)
    
    # Mark token as used
    reset = db.query(PasswordReset).filter(PasswordReset.token == token).first()
    reset.is_used = True
    
    db.commit()
    return True