from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field


class OffDayCreate(BaseModel):
    employee_name: str = Field(..., min_length=1, max_length=200)
    off_date: date
    note: Optional[str] = None


class OffDayUpdate(BaseModel):
    employee_name: Optional[str] = Field(None, min_length=1, max_length=200)
    off_date: Optional[date] = None
    note: Optional[str] = None


class OffDayResponse(BaseModel):
    id: str
    user_id: str
    employee_name: str
    off_date: date
    note: Optional[str]
    is_past: bool
    created_at: datetime

    class Config:
        from_attributes = True


class OffDayListResponse(BaseModel):
    entries: List[OffDayResponse]
    total: int
    upcoming: int
    past: int