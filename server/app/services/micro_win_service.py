from typing import List
from sqlalchemy.orm import Session
from app.models.micro_win import MicroWin


def create_win(db: Session, user_id: str, content: str) -> MicroWin:
    win = MicroWin(user_id=user_id, content=content)
    db.add(win)
    db.commit()
    db.refresh(win)
    return win


def get_wins(db: Session, user_id: str, limit: int = 50) -> List[MicroWin]:
    return db.query(MicroWin).filter(
        MicroWin.user_id == user_id
    ).order_by(MicroWin.created_at.desc()).limit(limit).all()


def delete_win(db: Session, win: MicroWin) -> None:
    db.delete(win)
    db.commit()