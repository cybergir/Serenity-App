import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Enum, Integer, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum


class TaskStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    STUCK = "stuck"


class TaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskDestination(str, enum.Enum):
    ACTIVE = "active"
    ARCHIVE = "archive"
    LIMBO = "limbo"


class TaskRoutineType(str, enum.Enum):
    NEVER = "never"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"
    CUSTOM = "custom"


class TaskRoutineEndType(str, enum.Enum):
    NEVER = "never"
    AFTER_COUNT = "after_count"
    ON_DATE = "on_date"


class TaskCategory(str, enum.Enum):
    BUSINESS = "business",
    PERSONAL = "personal",
    FAMILY = "family"

class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[TaskStatus] = mapped_column(Enum(TaskStatus), default=TaskStatus.NOT_STARTED)
    priority: Mapped[TaskPriority] = mapped_column(Enum(TaskPriority), default=TaskPriority.MEDIUM)
    category: Mapped[str] = mapped_column(String(20), nullable=True)
    destination: Mapped[TaskDestination] = mapped_column(Enum(TaskDestination), default=TaskDestination.ACTIVE)
    due_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    estimated_minutes: Mapped[int] = mapped_column(Integer, nullable=True)
    tags: Mapped[str] = mapped_column(String(500), nullable=True)
    reminder_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    reminder_time: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    reminder_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    resolved_from_limbo_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    routine_type: Mapped[str] = mapped_column(String(20), default="never")
    routine_interval: Mapped[int] = mapped_column(Integer, default=1)
    routine_days: Mapped[str] = mapped_column(String(50), nullable=True)
    routine_month_day: Mapped[int] = mapped_column(Integer, nullable=True)
    routine_end_type: Mapped[str] = mapped_column(String(20), default="never")
    routine_end_count: Mapped[int] = mapped_column(Integer, nullable=True)
    routine_end_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    routine_occurrence: Mapped[int] = mapped_column(Integer, default=0)
    is_routine_template: Mapped[bool] = mapped_column(Boolean, default=False)
    occurrence_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
        
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="tasks")
    subtasks = relationship("SubTask", back_populates="parent_task", cascade="all, delete-orphan")


class SubTask(Base):
    __tablename__ = "subtasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id: Mapped[str] = mapped_column(String(36), ForeignKey("tasks.id"), index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    order: Mapped[int] = mapped_column(Integer, default=0)

    parent_task = relationship("Task", back_populates="subtasks")