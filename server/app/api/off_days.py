from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.off_day import (
    OffDayCreate, OffDayUpdate,
    OffDayResponse, OffDayListResponse
)
from app.services import off_day_service
from app.api.users import get_current_user

router = APIRouter()


# ─── Create ───────────────────────────────────────────────

@router.post("/", response_model=OffDayResponse, status_code=201)
def create_entry(
    data: OffDayCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add an employee off-day entry."""
    return off_day_service.create_entry(db, current_user.id, data)


# ─── List ─────────────────────────────────────────────────

@router.get("/", response_model=OffDayListResponse)
def list_entries(
    show_past: Optional[bool] = Query(None, description="Filter past/future"),
    employee_name: Optional[str] = Query(None, description="Search by name"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List off-day entries."""
    entries = off_day_service.get_entries(db, current_user.id, show_past, employee_name)
    upcoming = sum(1 for e in entries if not e.is_past)
    past = sum(1 for e in entries if e.is_past)
    return OffDayListResponse(
        entries=entries,
        total=len(entries),
        upcoming=upcoming,
        past=past
    )


# ─── Read Single ──────────────────────────────────────────

@router.get("/{entry_id}", response_model=OffDayResponse)
def get_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single off-day entry."""
    entry = off_day_service.get_entry(db, entry_id, current_user.id)
    if not entry:
        raise HTTPException(status_code=404, detail="Off-day entry not found")
    return entry


# ─── Update ───────────────────────────────────────────────

@router.patch("/{entry_id}", response_model=OffDayResponse)
def update_entry(
    entry_id: str,
    data: OffDayUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an off-day entry."""
    entry = off_day_service.get_entry(db, entry_id, current_user.id)
    if not entry:
        raise HTTPException(status_code=404, detail="Off-day entry not found")
    return off_day_service.update_entry(db, entry, data)


# ─── Upcoming ─────────────────────────────────────────────

@router.get("/upcoming/soon")
def upcoming_off_days(
    days: int = Query(7, ge=1, le=90, description="Days to look ahead"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get off days in the next N days."""
    entries = off_day_service.get_upcoming_off_days(db, current_user.id, days)
    return {
        "entries": entries,
        "total": len(entries),
        "days_ahead": days
    }


# ─── Today ────────────────────────────────────────────────

@router.get("/today/list")
def today_off(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get employees off today."""
    entries = off_day_service.get_today_off(db, current_user.id)
    return {
        "entries": entries,
        "total": len(entries),
        "message": f"{len(entries)} employee(s) off today" if entries else "Everyone's in today"
    }


# ─── Delete ───────────────────────────────────────────────

@router.delete("/{entry_id}", status_code=204)
def delete_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove an off-day entry."""
    entry = off_day_service.get_entry(db, entry_id, current_user.id)
    if not entry:
        raise HTTPException(status_code=404, detail="Off-day entry not found")
    off_day_service.delete_entry(db, entry)
    return None