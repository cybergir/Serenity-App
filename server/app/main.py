from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.api import auth, users, tasks, shopping, off_days, brain_dumps, daily_pulse, micro_wins, vault, push, password_reset

import app.models  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Serenity API",
    description="A gentle task management API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(shopping.router, prefix="/api/shopping", tags=["shopping"])
app.include_router(off_days.router, prefix="/api/off-days", tags=["off-days"])
app.include_router(brain_dumps.router, prefix="/api/brain-dumps", tags=["brain-dumps"])
app.include_router(daily_pulse.router, prefix="/api/daily-pulse", tags=["daily-pulse"])
app.include_router(micro_wins.router, prefix="/api/micro-wins", tags=["micro-wins"])
app.include_router(vault.router, prefix="/api/vault", tags=["vault"])
app.include_router(push.router, prefix="/api/push", tags=["push"])
app.include_router(password_reset.router, prefix="/api/auth", tags=["auth"])

@app.get("/")
def root():
    return {"message": "Serenity API", "docs": "/docs"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Serenity is running"}