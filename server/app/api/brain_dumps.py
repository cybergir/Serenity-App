from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.brain_dump import BrainDump
from app.schemas.brain_dump import BrainDumpCreate, BrainDumpResponse, BrainDumpListResponse
from app.services import brain_dump_service
from app.api.users import get_current_user

router = APIRouter()


@router.post("/", response_model=BrainDumpResponse, status_code=201)
def create_dump(
    data: BrainDumpCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return brain_dump_service.create_dump(db, current_user.id, data.content)


@router.get("/", response_model=BrainDumpListResponse)
def list_dumps(
    processed: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = brain_dump_service.get_dumps(db, current_user.id, processed)
    return BrainDumpListResponse(items=items, total=len(items))


@router.post("/{dump_id}/process")
def process_dump(
    dump_id: str,
    task_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dump = db.query(BrainDump).filter(
        BrainDump.id == dump_id,
        BrainDump.user_id == current_user.id
    ).first()
    if not dump:
        raise HTTPException(status_code=404, detail="Not found")
    brain_dump_service.mark_processed(db, dump, task_id)
    return {"message": "Processed"}