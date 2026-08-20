from datetime import datetime, timedelta
from jose import JWTError, jwt
import hashlib
import os
from app.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        salt, hash_value = hashed_password.split("$")
        new_hash = hashlib.sha256(f"{salt}{plain_password}".encode()).hexdigest()
        return new_hash == hash_value
    except:
        return False


def get_password_hash(password: str) -> str:
    """Hash a password with a random salt."""
    salt = os.urandom(16).hex()
    hash_value = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
    return f"{salt}${hash_value}"


def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": user_id, "exp": expire, "type": "access"}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"sub": user_id, "exp": expire, "type": "refresh"}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
