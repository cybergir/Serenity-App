from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field


class ShoppingItemCreate(BaseModel):
    item_name: str = Field(..., min_length=1, max_length=300)
    quantity: int = Field(1, ge=1)
    target_date: Optional[date] = None


class ShoppingItemUpdate(BaseModel):
    item_name: Optional[str] = Field(None, min_length=1, max_length=300)
    quantity: Optional[int] = Field(None, ge=1)
    target_date: Optional[date] = None
    is_purchased: Optional[bool] = None


class ShoppingItemResponse(BaseModel):
    id: str
    user_id: str
    item_name: str
    quantity: int
    target_date: Optional[date]
    is_purchased: bool
    purchased_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class ShoppingListResponse(BaseModel):
    items: List[ShoppingItemResponse]
    total: int


class ShoppingBatchPurchase(BaseModel):
    item_ids: List[str]