import uuid
from datetime import datetime, time
from sqlalchemy import String, DateTime, Time, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), unique=True, index=True)
    start_of_day_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    start_of_day_time: Mapped[time] = mapped_column(Time, default=time(8, 0))
    task_nudge_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    check_in_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    celebration_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    end_of_day_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    end_of_day_time: Mapped[time] = mapped_column(Time, default=time(19, 0))
    max_notifications_per_day: Mapped[int] = mapped_column(Integer, default=5)
    quiet_hours_start: Mapped[time] = mapped_column(Time, default=time(21, 0))
    quiet_hours_end: Mapped[time] = mapped_column(Time, default=time(8, 0))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="notification_preference")