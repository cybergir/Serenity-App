from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


DAILY_PROMPTS = [
    "How's your energy today? Low / Steady / High",
    "What's one thing on your mind that's not a task?",
    "What felt heavy today?",
    "What's one tiny thing that went okay?",
    "Any moment you want to remember?",
    "What are you gently letting go of today?",
    "What would make today feel like enough?",
]


class DailyPulseAnswer(BaseModel):
    answer: str


class DailyPulseResponse(BaseModel):
    id: str
    user_id: str
    prompt: str
    answer: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class DailyPulseListResponse(BaseModel):
    items: List[DailyPulseResponse]
    total: int