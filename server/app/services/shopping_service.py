from datetime import datetime, date
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.shopping import ShoppingItem
from app.schemas.shopping import ShoppingItemCreate, ShoppingItemUpdate


def create_item(db: Session, user_id: str, item_data: ShoppingItemCreate) -> ShoppingItem:
    """Add an item to the shopping list."""
    item = ShoppingItem(
        user_id=user_id,
        item_name=item_data.item_name,
        quantity=item_data.quantity,
        target_date=item_data.target_date
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def get_item(db: Session, item_id: str, user_id: str) -> Optional[ShoppingItem]:
    """Get a single shopping item."""
    return db.query(ShoppingItem).filter(
        ShoppingItem.id == item_id,
        ShoppingItem.user_id == user_id
    ).first()


def get_items(
    db: Session,
    user_id: str,
    is_purchased: Optional[bool] = None,
    target_date: Optional[date] = None
) -> List[ShoppingItem]:
    """Get shopping items with optional filters."""
    query = db.query(ShoppingItem).filter(ShoppingItem.user_id == user_id)

    if is_purchased is not None:
        query = query.filter(ShoppingItem.is_purchased == is_purchased)

    if target_date:
        query = query.filter(ShoppingItem.target_date == target_date)

    return query.order_by(ShoppingItem.created_at.desc()).all()


def update_item(db: Session, item: ShoppingItem, item_data: ShoppingItemUpdate) -> ShoppingItem:
    """Update a shopping item."""
    update_dict = item_data.model_dump(exclude_unset=True)

    for field, value in update_dict.items():
        if value is not None:
            setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


def mark_purchased(db: Session, item: ShoppingItem) -> ShoppingItem:
    """Mark an item as purchased."""
    item.is_purchased = True
    item.purchased_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return item


def batch_mark_purchased(db: Session, user_id: str, item_ids: List[str]) -> int:
    """Mark multiple items as purchased at once."""
    count = 0
    for item_id in item_ids:
        item = get_item(db, item_id, user_id)
        if item and not item.is_purchased:
            item.is_purchased = True
            item.purchased_at = datetime.utcnow()
            count += 1
    db.commit()
    return count


def delete_item(db: Session, item: ShoppingItem) -> None:
    """Remove an item from the shopping list."""
    db.delete(item)
    db.commit()


def get_upcoming_shopping_dates(db: Session, user_id: str) -> List[dict]:
    """Get upcoming shopping trips (grouped by target_date)."""
    items = db.query(ShoppingItem).filter(
        ShoppingItem.user_id == user_id,
        ShoppingItem.is_purchased == False,
        ShoppingItem.target_date.isnot(None)
    ).order_by(ShoppingItem.target_date).all()

    # Group by date
    dates = {}
    for item in items:
        date_key = item.target_date.isoformat()
        if date_key not in dates:
            dates[date_key] = {"date": item.target_date, "item_count": 0, "items": []}
        dates[date_key]["item_count"] += 1
        dates[date_key]["items"].append(item.item_name)

    return list(dates.values())