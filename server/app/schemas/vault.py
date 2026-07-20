from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class VaultItemCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    content: str = Field(..., min_length=1)
    item_type: str = "note"  # note, quote, image_url, link, memory


class VaultItemResponse(BaseModel):
    id: str
    user_id: str
    title: str
    content: str
    item_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class VaultItemListResponse(BaseModel):
    items: List[VaultItemResponse]
    total: int