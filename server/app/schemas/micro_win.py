from datetime import datetime
from typing import List
from pydantic import BaseModel, Field


class MicroWinCreate(BaseModel):
    content: str = Field(..., min_length=1)


class MicroWinResponse(BaseModel):
    id: str
    user_id: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class MicroWinListResponse(BaseModel):
    items: List[MicroWinResponse]
    total: int