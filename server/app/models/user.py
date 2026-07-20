import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_opened_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    notification_tier: Mapped[str] = mapped_column(String(20), default="normal")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tasks = relationship("Task", back_populates="user")
    shopping_items = relationship("ShoppingItem", back_populates="user")
    off_days = relationship("OffDay", back_populates="user")
    notification_preference = relationship("NotificationPreference", back_populates="user", uselist=False)
    brain_dumps = relationship("BrainDump", back_populates="user")
    daily_pulses = relationship("DailyPulse", back_populates="user")
    micro_wins = relationship("MicroWin", back_populates="user")
    vault_items = relationship("VaultItem", back_populates="user")