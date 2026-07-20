from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.vault import VaultItemCreate, VaultItemResponse, VaultItemListResponse
from app.services import vault_service
from app.api.users import get_current_user

router = APIRouter()


@router.post("/", response_model=VaultItemResponse, status_code=201)
def create_item(
    data: VaultItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add an item to your vault."""
    return vault_service.create_item(db, current_user.id, data)


@router.get("/", response_model=VaultItemListResponse)
def list_items(
    item_type: Optional[str] = Query(None, description="note, quote, image_url, link, memory"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List your vault items."""
    items = vault_service.get_items(db, current_user.id, item_type)
    return VaultItemListResponse(items=items, total=len(items))


@router.get("/{item_id}", response_model=VaultItemResponse)
def get_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single vault item."""
    item = vault_service.get_item(db, item_id, current_user.id)
    if not item:
        raise HTTPException(status_code=404, detail="Vault item not found")
    return item


@router.delete("/{item_id}", status_code=204)
def delete_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove an item from your vault."""
    item = vault_service.get_item(db, item_id, current_user.id)
    if not item:
        raise HTTPException(status_code=404, detail="Vault item not found")
    vault_service.delete_item(db, item)
    return None