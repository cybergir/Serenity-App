from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.user import User
from app.schemas.shopping import (
    ShoppingItemCreate, ShoppingItemUpdate,
    ShoppingItemResponse, ShoppingListResponse, ShoppingBatchPurchase
)
from app.services import shopping_service
from app.api.users import get_current_user

router = APIRouter()


# ─── Create ───────────────────────────────────────────────

@router.post("/", response_model=ShoppingItemResponse, status_code=201)
def create_item(
    item_data: ShoppingItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add an item to your shopping list."""
    return shopping_service.create_item(db, current_user.id, item_data)


# ─── List ─────────────────────────────────────────────────

@router.get("/", response_model=ShoppingListResponse)
def list_items(
    is_purchased: Optional[bool] = Query(None, description="Filter by purchase status"),
    target_date: Optional[date] = Query(None, description="Filter by planned shopping date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List your shopping items."""
    items = shopping_service.get_items(db, current_user.id, is_purchased, target_date)
    return ShoppingListResponse(items=items, total=len(items))


# ─── Read Single ──────────────────────────────────────────

@router.get("/{item_id}", response_model=ShoppingItemResponse)
def get_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single shopping item."""
    item = shopping_service.get_item(db, item_id, current_user.id)
    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")
    return item


# ─── Update ───────────────────────────────────────────────

@router.patch("/{item_id}", response_model=ShoppingItemResponse)
def update_item(
    item_id: str,
    item_data: ShoppingItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a shopping item."""
    item = shopping_service.get_item(db, item_id, current_user.id)
    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")
    return shopping_service.update_item(db, item, item_data)


# ─── Mark Purchased ──────────────────────────────────────

@router.post("/{item_id}/purchase", response_model=ShoppingItemResponse)
def mark_purchased(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark an item as purchased."""
    item = shopping_service.get_item(db, item_id, current_user.id)
    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")
    return shopping_service.mark_purchased(db, item)


# ─── Batch Purchase ──────────────────────────────────────

@router.post("/purchase/batch")
def batch_purchase(
    batch_data: ShoppingBatchPurchase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark multiple items as purchased at once."""
    count = shopping_service.batch_mark_purchased(db, current_user.id, batch_data.item_ids)
    return {"message": f"{count} item(s) marked as purchased", "count": count}


# ─── Upcoming Shopping Trips ─────────────────────────────

@router.get("/trips/upcoming")
def upcoming_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get upcoming shopping trips grouped by date."""
    trips = shopping_service.get_upcoming_shopping_dates(db, current_user.id)
    return {"trips": trips, "total": len(trips)}


# ─── Delete ───────────────────────────────────────────────

@router.delete("/{item_id}", status_code=204)
def delete_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove an item from your shopping list."""
    item = shopping_service.get_item(db, item_id, current_user.id)
    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")
    shopping_service.delete_item(db, item)
    return None