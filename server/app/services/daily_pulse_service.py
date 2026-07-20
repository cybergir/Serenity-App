from datetime import date
from typing import Optional
from sqlalchemy.orm import Session
from app.models.daily_pulse import DailyPulse
from app.schemas.daily_pulse import DAILY_PROMPTS
import random


def get_today_prompt(db: Session, user_id: str) -> str:
    """Get today's prompt, or create one if none exists."""
    today = date.today()
    existing = db.query(DailyPulse).filter(
        DailyPulse.user_id == user_id,
        DailyPulse.created_at >= today
    ).first()

    if existing:
        return existing

    # Pick a random prompt
    prompt = random.choice(DAILY_PROMPTS)
    pulse = DailyPulse(user_id=user_id, prompt=prompt)
    db.add(pulse)
    db.commit()
    db.refresh(pulse)
    return pulse


def answer_pulse(db: Session, pulse: DailyPulse, answer: str) -> DailyPulse:
    pulse.answer = answer
    db.commit()
    db.refresh(pulse)
    return pulse


def get_pulse_history(db: Session, user_id: str, limit: int = 30) -> list:
    return db.query(DailyPulse).filter(
        DailyPulse.user_id == user_id
    ).order_by(DailyPulse.created_at.desc()).limit(limit).all()


def skip_pulse(db: Session, pulse: DailyPulse) -> DailyPulse:
    pulse.answer = "[skipped]"
    db.commit()
    db.refresh(pulse)
    return pulse