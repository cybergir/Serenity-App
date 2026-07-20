from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class BrainDumpCreate(BaseModel):
    content: str = Field(..., min_length=1)


class BrainDumpResponse(BaseModel):
    id: str
    user_id: str
    content: str
    is_processed: bool
    converted_to_task_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class BrainDumpListResponse(BaseModel):
    items: List[BrainDumpResponse]
    total: int