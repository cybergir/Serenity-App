from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.micro_win import MicroWinCreate, MicroWinResponse, MicroWinListResponse
from app.services import micro_win_service
from app.api.users import get_current_user

router = APIRouter()


@router.post("/", response_model=MicroWinResponse, status_code=201)
def create_win(
    data: MicroWinCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return micro_win_service.create_win(db, current_user.id, data.content)


@router.get("/", response_model=MicroWinListResponse)
def list_wins(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = micro_win_service.get_wins(db, current_user.id, limit)
    return MicroWinListResponse(items=items, total=len(items))


@router.delete("/{win_id}", status_code=204)
def delete_win(
    win_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    win = db.query(micro_win_service.MicroWin).filter(
        micro_win_service.MicroWin.id == win_id,
        micro_win_service.MicroWin.user_id == current_user.id
    ).first()
    if not win:
        raise HTTPException(status_code=404, detail="Not found")
    micro_win_service.delete_win(db, win)
    return None


@router.get("/count/total")
def get_total_wins(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get total number of micro-wins."""
    items = micro_win_service.get_wins(db, current_user.id, limit=1000)
    return {"total": len(items)}