from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, LimboResolution
)
from app.models.task import Task
from app.services import task_service
from app.api.users import get_current_user

router = APIRouter()


# ─── Create ───────────────────────────────────────────────

@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new task."""
    task = task_service.create_task(db, current_user.id, task_data)
    return task


# ─── Read (List) ──────────────────────────────────────────

@router.get("/", response_model=TaskListResponse)
def list_tasks(
    destination: Optional[str] = Query(None, description="active, archive, or limbo"),
    status: Optional[str] = Query(None, description="not_started, in_progress, done, stuck"),
    priority: Optional[str] = Query(None, description="low, medium, high, urgent"),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None, description="Search title and description"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List tasks with optional filtering."""
    task_service.ensure_routine_tasks(db, current_user.id)

    tasks, total = task_service.get_tasks(
        db, current_user.id, destination, status, priority, category, search, page, page_size
    )
    return TaskListResponse(
        tasks=tasks,
        total=total,
        page=page,
        page_size=page_size
    )


# ─── Read (Single) ────────────────────────────────────────

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single task by ID."""
    task = task_service.get_task(db, task_id, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    _ = task.subtasks

    return task


# ─── Update ───────────────────────────────────────────────

@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a task."""
    task = task_service.get_task(db, task_id, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_service.update_task(db, task, task_data)


# ─── Toggle Subtask ───────────────────────────────────────

@router.post("/{task_id}/subtasks/{subtask_id}/toggle", response_model=TaskResponse)
def toggle_subtask(
    task_id: str,
    subtask_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle a subtask's completion. Auto-completes task if all subtasks are done."""
    task = task_service.toggle_subtask(db, task_id, subtask_id, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task or subtask not found")
    return task

# ─── Complete ─────────────────────────────────────────────

@router.post("/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a task as complete and move to Archive."""
    task = task_service.get_task(db, task_id, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_service.complete_task_with_subtasks(db, task)


# ─── Archive ──────────────────────────────────────────────

@router.post("/{task_id}/archive", response_model=TaskResponse)
def archive_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually archive a task."""
    task = task_service.get_task(db, task_id, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_service.archive_task(db, task)


# ─── Limbo: Move to Limbo ─────────────────────────────────

@router.post("/{task_id}/limbo", response_model=TaskResponse)
def move_to_limbo(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually move a task to Limbo."""
    task = task_service.get_task(db, task_id, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_service.move_to_limbo(db, task)


# ─── Limbo: Resolve ───────────────────────────────────────

@router.post("/{task_id}/resolve", response_model=TaskResponse)
def resolve_from_limbo(
    task_id: str,
    resolution: LimboResolution,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Resolve a task that's in Limbo (done, reschedule, or dismiss)."""
    task = task_service.get_task(db, task_id, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.destination != "limbo":
        raise HTTPException(status_code=400, detail="Task is not in Limbo")
    return task_service.resolve_from_limbo(db, task, resolution)


# ─── Limbo Count ──────────────────────────────────────────

@router.get("/limbo/count")
def get_limbo_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the number of tasks currently in Limbo."""
    count = task_service.get_limbo_count(db, current_user.id)
    return {"count": count}


# ─── Delete ───────────────────────────────────────────────

@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Permanently delete a task."""
    task = task_service.get_task(db, task_id, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task_service.delete_task(db, task)
    return None


# ─── Routine Count ────────────────────────────────────────

@router.get("/routine/count")
def get_routine_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the number of unique routine templates."""
    routines = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.is_routine_template == True,
    ).all()
    
    seen = set()
    for t in routines:
        sig = f"{t.title}|{t.routine_type}|{t.routine_interval}|{t.routine_days}|{t.routine_month_day}"
        seen.add(sig)
    
    return {"count": len(seen)}


# ─── Routine List ─────────────────────────────────────────

@router.get("/routine/list")
def list_routines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get unique routine templates with next occurrence info."""
    all_routines = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.is_routine_template == True,
    ).order_by(Task.created_at.desc()).all()
    
    # Deduplicate by signature, keep the most recent
    seen = {}
    for t in all_routines:
        sig = f"{t.title}|{t.routine_type}|{t.routine_interval}|{t.routine_days}|{t.routine_month_day}"
        if sig not in seen:
            seen[sig] = t
    
    routines = []
    for sig, template in seen.items():
        # Find the latest occurrence for this routine
        latest = db.query(Task).filter(
            Task.user_id == current_user.id,
            Task.title == template.title,
            Task.routine_type == template.routine_type,
            Task.routine_interval == template.routine_interval,
            Task.occurrence_date.isnot(None),
        ).order_by(Task.occurrence_date.desc()).first()
        
        # Find the next active instance
        eat = timezone(timedelta(hours=3))
        today_dt = datetime.now(eat).replace(hour=23, minute=59, second=59)
        next_instance = db.query(Task).filter(
            Task.user_id == current_user.id,
            Task.title == template.title,
            Task.routine_type == template.routine_type,
            Task.routine_interval == template.routine_interval,
            Task.occurrence_date.isnot(None),
            Task.occurrence_date > today_dt,
        ).order_by(Task.occurrence_date.asc()).first()
        
        frequency_label = template.routine_type
        if template.routine_interval > 1:
            frequency_label = f"Every {template.routine_interval} {template.routine_type}"
        
        routines.append({
            "id": template.id,
            "title": template.title,
            "description": template.description,
            "category": template.category,
            "priority": template.priority,
            "routine_type": template.routine_type,
            "routine_interval": template.routine_interval,
            "routine_days": template.routine_days,
            "routine_month_day": template.routine_month_day,
            "routine_end_type": template.routine_end_type,
            "routine_end_count": template.routine_end_count,
            "routine_end_date": template.routine_end_date,
            "frequency_label": frequency_label,
            "latest_occurrence": latest.occurrence_date.isoformat() if latest and latest.occurrence_date else None,
            "next_occurrence": next_instance.occurrence_date.isoformat() if next_instance and next_instance.occurrence_date else None,
        })
    
    return {"routines": routines, "total": len(routines)}


# ─── Delete Routine ───────────────────────────────────────

@router.delete("/routine/{task_id}", status_code=204)
def delete_routine(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a routine template and ALL its instances."""
    template = task_service.get_task(db, task_id, current_user.id)
    if not template:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Delete all tasks with matching routine signature
    signature_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.title == template.title,
        Task.routine_type == template.routine_type,
        Task.routine_interval == template.routine_interval,
    ).all()
    
    for t in signature_tasks:
        db.delete(t)
    
    db.commit()
    return None

# ─── Check Past Due (Internal/System Use) ─────────────────

@router.post("/check-past-due")
def check_past_due_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check for past-due tasks and move them to Limbo."""
    count = task_service.check_and_move_past_due_tasks(db, current_user.id)
    return {"moved_to_limbo": count, "message": f"{count} task(s) moved to Limbo"}