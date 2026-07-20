from typing import List
from sqlalchemy.orm import Session
from app.models.brain_dump import BrainDump


def create_dump(db: Session, user_id: str, content: str) -> BrainDump:
    dump = BrainDump(user_id=user_id, content=content)
    db.add(dump)
    db.commit()
    db.refresh(dump)
    return dump


def get_dumps(db: Session, user_id: str, is_processed: bool = False) -> List[BrainDump]:
    return db.query(BrainDump).filter(
        BrainDump.user_id == user_id,
        BrainDump.is_processed == is_processed
    ).order_by(BrainDump.created_at.desc()).all()


def mark_processed(db: Session, dump: BrainDump, task_id: str = None) -> BrainDump:
    dump.is_processed = True
    dump.converted_to_task_id = task_id
    db.commit()
    db.refresh(dump)
    return dump


def delete_dump(db: Session, dump: BrainDump) -> None:
    db.delete(dump)
    db.commit()