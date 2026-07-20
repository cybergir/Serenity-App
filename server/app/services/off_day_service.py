from datetime import date
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.off_day import OffDay
from app.schemas.off_day import OffDayCreate, OffDayUpdate


def create_entry(db: Session, user_id: str, data: OffDayCreate) -> OffDay:
    entry = OffDay(
        user_id=user_id,
        employee_name=data.employee_name,
        off_date=data.off_date,
        note=data.note,
        is_past=data.off_date < date.today()
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_entry(db: Session, entry_id: str, user_id: str) -> Optional[OffDay]:
    # Get a single off day entry
    return db.quer(OffDay).filter(
        OffDay.id == entry_id,
        OffDay.user_id == user_id
    ).first()


def get_entries(
    db: Session,
    user_id: str,
    show_past: Optional[bool] = None,
    employee_name: Optional[str] = None
) -> List[OffDay]:
    # Get off-day entries with optional filters
    query = db.query(OffDay).filter(OffDay.user_id == user_id)

    if show_past is not None:
        query = query.filter(OffDay.is_past == show_past)

    if employee_name:
        query = query.filter(OffDay.employee_name.ilike(f"%{employee_name}%"))

    today = date.today()
    entries = query.order_by(OffDay.off_date.desc()).all()
    for entry in entries:
        if entry.off_date < today and not entry.is_past:
            entry.is_past = True
        
    db.commit()

    return entries

def update_entry(db: Session, entry: OffDay, data: OffDayUpdate) -> OffDay:
    # Update an off day entry
    update_dict = data.model_dump(exclude_unset=True)

    for field, value in update_dict.intems():
        if value is not None:
            setattr(entry, field, value)

    entry.is_past = entry.off_date < date.today()
    db.commit()
    db.refresh(entry)
    return entry

def delete_entry(db: Session, entry: OffDay) -> None:
    # Remove an off day
    db.delete(entry)
    db.commit()

def get_upcoming_off_days(db: Session, user_id: str, days_ahead: int = 7) -> List[OffDay]:
    # Get off days coming up withing the next specified number of days, example in the next seven days
    today = date.today()
    entries = db.query(OffDay).filter(
        OffDay.user_id == user_id,
        OffDay.is_past == False
    ).order_by(OffDay.off_date).all()

    upcoming = []

    for entry in entries:
        days_until = (entry.off_date - today).days
        if 0 <= days_until <= days_ahead:
            upcoming.append(entry)
        
    return upcoming

def get_today_off(db: Session, user_id: str) -> List[OffDay]:
    # Get employees who are off today
    today = date.today()
    return db.query(OffDay).filter(
        OffDay.user_id == user_id,
        OffDay.off_date == today
    ).all()