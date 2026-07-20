from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.vault import VaultItem
from app.schemas.vault import VaultItemCreate


def create_item(db: Session, user_id: str, data: VaultItemCreate) -> VaultItem:
    item = VaultItem(
        user_id=user_id,
        title=data.title,
        content=data.content,
        item_type=data.item_type
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def get_items(db: Session, user_id: str, item_type: Optional[str] = None) -> List[VaultItem]:
    query = db.query(VaultItem).filter(VaultItem.user_id == user_id)
    if item_type:
        query = query.filter(VaultItem.item_type == item_type)
    return query.order_by(VaultItem.created_at.desc()).all()


def get_item(db: Session, item_id: str, user_id: str) -> Optional[VaultItem]:
    return db.query(VaultItem).filter(
        VaultItem.id == item_id,
        VaultItem.user_id == user_id
    ).first()


def delete_item(db: Session, item: VaultItem) -> None:
    db.delete(item)
    db.commit()