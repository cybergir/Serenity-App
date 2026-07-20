from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class SubTaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    order: int = 0


class SubTaskResponse(BaseModel):
    id: str
    title: str
    is_completed: bool
    order: int

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    category: str = Field(..., min_length=1)
    due_date: datetime
    description: Optional[str] = None
    priority: Optional[str] = "medium"
    estimated_minutes: Optional[int] = None
    tags: Optional[str] = None
    subtasks: Optional[List[SubTaskCreate]] = []
    reminder_enabled: bool = False
    reminder_time: Optional[datetime] = None
    routine_type: str = "never"
    routine_interval: int = 1
    routine_days: Optional[str] = None
    routine_month_day: Optional[int] = None
    routine_end_type: str = "never"
    routine_end_count: Optional[int] = None
    routine_end_date: Optional[datetime] = None
    occurrence_date: Optional[datetime] = None
    is_routine_template: bool = False


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_minutes: Optional[int] = None
    tags: Optional[str] = None
    reminder_enabled: Optional[bool] = None
    reminder_time: Optional[datetime] = None
    routine_type: Optional[str] = None
    routine_interval: Optional[int] = None
    routine_days: Optional[str] = None
    routine_month_day: Optional[int] = None
    routine_end_type: Optional[str] = None
    routine_end_count: Optional[int] = None
    routine_end_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    id: str
    user_id: str
    title: str
    category: Optional[str] = None
    description: Optional[str]
    status: str
    priority: str
    destination: str
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    estimated_minutes: Optional[int]
    tags: Optional[str]
    reminder_enabled: bool
    reminder_time: Optional[datetime]
    reminder_sent: bool
    resolved_from_limbo_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    subtasks: List[SubTaskResponse] = []
    routine_type: str = "never"
    routine_interval: int = 1
    routine_days: Optional[str] = None
    routine_month_day: Optional[int] = None
    routine_end_type: str = "never"
    routine_end_count: Optional[int] = None
    routine_end_date: Optional[datetime] = None
    routine_occurrence: int = 0
    occurrence_date: Optional[datetime] = None
    is_routine_template: bool = False

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int
    page: int
    page_size: int


class LimboResolution(BaseModel):
    action: str
    new_due_date: Optional[datetime] = None