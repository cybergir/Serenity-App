from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.daily_pulse import DailyPulseAnswer, DailyPulseResponse, DailyPulseListResponse
from app.services import daily_pulse_service
from app.api.users import get_current_user

router = APIRouter()


@router.get("/today", response_model=DailyPulseResponse)
def get_today_prompt(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pulse = daily_pulse_service.get_today_prompt(db, current_user.id)
    return pulse


@router.post("/{pulse_id}/answer", response_model=DailyPulseResponse)
def answer_prompt(
    pulse_id: str,
    data: DailyPulseAnswer,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pulse = db.query(daily_pulse_service.DailyPulse).filter(
        daily_pulse_service.DailyPulse.id == pulse_id,
        daily_pulse_service.DailyPulse.user_id == current_user.id
    ).first()
    if not pulse:
        raise HTTPException(status_code=404, detail="Not found")
    return daily_pulse_service.answer_pulse(db, pulse, data.answer)


@router.post("/{pulse_id}/skip", response_model=DailyPulseResponse)
def skip_prompt(
    pulse_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pulse = db.query(daily_pulse_service.DailyPulse).filter(
        daily_pulse_service.DailyPulse.id == pulse_id,
        daily_pulse_service.DailyPulse.user_id == current_user.id
    ).first()
    if not pulse:
        raise HTTPException(status_code=404, detail="Not found")
    return daily_pulse_service.skip_pulse(db, pulse)


@router.get("/history", response_model=DailyPulseListResponse)
def get_history(
    limit: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get pulse check-in history."""
    items = daily_pulse_service.get_pulse_history(db, current_user.id, limit)
    return DailyPulseListResponse(items=items, total=len(items))