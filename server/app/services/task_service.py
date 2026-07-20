from app.models.task import Task, SubTask, TaskStatus, TaskDestination
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.task import Task, SubTask, TaskStatus, TaskDestination
from app.schemas.task import TaskCreate, TaskUpdate, LimboResolution


def create_task(db: Session, user_id: str, task_data: TaskCreate) -> Task:
    """Create a new task with optional subtasks."""
    task = Task(
    user_id=user_id,
    title=task_data.title,
    description=task_data.description,
    priority=task_data.priority or "medium",
    category=task_data.category,
    due_date=task_data.due_date,
    estimated_minutes=task_data.estimated_minutes,
    tags=task_data.tags,
    reminder_enabled=task_data.reminder_enabled,
    reminder_time=task_data.reminder_time,
    routine_type=task_data.routine_type or "never",
    routine_interval=task_data.routine_interval or 1,
    routine_days=task_data.routine_days,
    routine_month_day=task_data.routine_month_day,
    routine_end_type=task_data.routine_end_type or "never",
    routine_end_count=task_data.routine_end_count,
    routine_end_date=task_data.routine_end_date,
    routine_occurrence=1,
    is_routine_template=task_data.routine_type and task_data.routine_type != "never",
    occurrence_date=task_data.due_date, 
    destination=TaskDestination.ACTIVE,
    status=TaskStatus.NOT_STARTED
)
    db.add(task)
    db.flush()  # Get task.id before adding subtasks

    # Add subtasks if provided
    if task_data.subtasks:
        for i, sub_data in enumerate(task_data.subtasks):
            subtask = SubTask(
                task_id=task.id,
                title=sub_data.title,
                order=sub_data.order or i,
                is_completed=False
            )
            db.add(subtask)

    db.commit()
    db.refresh(task)
    return task


def get_task(db: Session, task_id: str, user_id: str) -> Optional[Task]:
    """Get a single task by ID, ensuring it belongs to the user."""
    return db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id
    ).first()


def get_tasks(
    db: Session,
    user_id: str,
    destination: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20
) -> tuple[List[Task], int]:
    """Get tasks with optional filtering and pagination."""
    query = db.query(Task).filter(Task.user_id == user_id)

    # Filter by destination (active, archive, limbo)
    if destination:
        query = query.filter(Task.destination == destination)
    else:
        # Default: show active and limbo, but not archived
        query = query.filter(Task.destination.in_([TaskDestination.ACTIVE, TaskDestination.LIMBO]))

    # Filter by status
    if status:
        query = query.filter(Task.status == status)

        # Filter by category
    if category:
        query = query.filter(Task.category == category)    

    # Filter by priority
    if priority:
        query = query.filter(Task.priority == priority)

    # Search by title or description
        # Search by title, description, or subtask titles
        # Search by title, description, or subtask titles
    if search:
        search_term = f"%{search}%"
        query = query.outerjoin(Task.subtasks).filter(
            (Task.title.ilike(search_term)) |
            (Task.description.ilike(search_term)) |
            (SubTask.title.ilike(search_term))
        ).distinct()

    # Get total count before pagination
    total = query.count()

    # Paginate and order by creation date (newest first)
    tasks = query.order_by(Task.created_at.desc()) \
                 .offset((page - 1) * page_size) \
                 .limit(page_size) \
                 .all()

    return tasks, total


def update_task(db: Session, task: Task, task_data: TaskUpdate) -> Task:
    """Update a task's fields."""
    update_dict = task_data.model_dump(exclude_unset=True)

    for field, value in update_dict.items():
        if value is not None:
            setattr(task, field, value)

    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task


def toggle_subtask(db: Session, task_id: str, subtask_id: str, user_id: str) -> Task:
    """Toggle a subtask's completion. If all subtasks are done, auto-complete the task."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id
    ).first()
    
    if not task:
        return None
    
    if task.destination == TaskDestination.ARCHIVE:
        return None
    
    subtask = db.query(SubTask).filter(
        SubTask.id == subtask_id,
        SubTask.task_id == task_id
    ).first()
    
    if not subtask:
        return None
    
    # Toggle the subtask
    subtask.is_completed = not subtask.is_completed

    # Update task status based on subtask progress
    any_completed = any(s.is_completed for s in task.subtasks)
    all_completed = all(s.is_completed for s in task.subtasks)

    if all_completed and task.subtasks:
        # All subtasks done → complete the task
        task.status = TaskStatus.DONE
        task.destination = TaskDestination.ARCHIVE
        task.completed_at = datetime.utcnow()
    elif any_completed:
        # Some subtasks done → in progress
        if task.status == TaskStatus.NOT_STARTED:
            task.status = TaskStatus.IN_PROGRESS
    else:
        # No subtasks done → back to not started
        if task.status == TaskStatus.IN_PROGRESS:
            task.status = TaskStatus.NOT_STARTED

    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)

    return task


def complete_task_with_subtasks(db: Session, task: Task) -> Task:
    """Mark task as done AND mark all subtasks as done."""
    # Mark all subtasks as completed
    for subtask in task.subtasks:
        if not subtask.is_completed:
            subtask.is_completed = True
    
    # Mark task as done
    task.status = TaskStatus.DONE
    task.destination = TaskDestination.ARCHIVE
    task.completed_at = datetime.utcnow()
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)

    return task


def complete_task(db: Session, task: Task) -> Task:
    """Mark a task as done and move to archive."""
    task.status = TaskStatus.DONE
    task.destination = TaskDestination.ARCHIVE
    task.completed_at = datetime.utcnow()
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: Task) -> None:
    """Permanently delete a task and its subtasks."""
    db.delete(task)
    db.commit()


def move_to_limbo(db: Session, task: Task) -> Task:
    """Move a task to Limbo when its due date passes without resolution."""
    task.destination = TaskDestination.LIMBO
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task


def check_and_move_past_due_tasks(db: Session, user_id: str) -> int:
    """Find all active tasks past their due date and move them to Limbo.
    Returns the number of tasks moved."""
    now = datetime.utcnow()
    past_due_tasks = db.query(Task).filter(
        Task.user_id == user_id,
        Task.destination == TaskDestination.ACTIVE,
        Task.due_date.isnot(None),
        Task.due_date < now,
        Task.status.in_([TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS, TaskStatus.STUCK])
    ).all()

    count = 0
    for task in past_due_tasks:
        move_to_limbo(db, task)
        count += 1

    return count


def resolve_from_limbo(db: Session, task: Task, resolution: LimboResolution) -> Task:
    """Resolve a task that's in Limbo."""
    action = resolution.action

    if action == "done":
        for subtask in task.subtasks:
            subtask.is_completed = True
        task.status = TaskStatus.DONE
        task.destination = TaskDestination.ARCHIVE
        task.completed_at = datetime.utcnow()
        task.resolved_from_limbo_at = datetime.utcnow()

    elif action == "reschedule":
        # Move back to active with new due date
        task.destination = TaskDestination.ACTIVE
        task.status = TaskStatus.NOT_STARTED
        task.due_date = resolution.new_due_date
        task.resolved_from_limbo_at = datetime.utcnow()

    elif action == "dismiss":
        # Move to archive without completion
        task.destination = TaskDestination.ARCHIVE
        task.resolved_from_limbo_at = datetime.utcnow()

    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task


def archive_task(db: Session, task: Task) -> Task:
    """Manually archive an active task."""
    task.destination = TaskDestination.ARCHIVE
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task


def get_limbo_count(db: Session, user_id: str) -> int:
    """Get the number of tasks currently in Limbo."""
    return db.query(Task).filter(
        Task.user_id == user_id,
        Task.destination == TaskDestination.LIMBO
    ).count()


from dateutil.relativedelta import relativedelta
from datetime import timedelta
import calendar


def ensure_routine_tasks(db: Session, user_id: str) -> int:
    """Generate routine task instances that should exist by now.
    Moves expired incomplete routine tasks to Limbo.
    Returns number of tasks created."""
    
    now = datetime.utcnow()
    today = now.date()
    created = 0

    # Find all routine tasks (templates)
    routine_tasks = db.query(Task).filter(
        Task.user_id == user_id,
        Task.is_routine_template == True,
    ).order_by(Task.created_at.desc()).all()

    # Group by routine signature to find the latest instance of each routine
    routines = {}
    for task in routine_tasks:
        sig = f"{task.title}|{task.routine_type}|{task.routine_interval}|{task.routine_days}|{task.routine_month_day}"
        if sig not in routines:
            routines[sig] = task

    for sig, template in routines.items():
        # Find the latest occurrence date for this routine
        latest = db.query(Task).filter(
            Task.user_id == user_id,
            Task.title == template.title,
            Task.routine_type == template.routine_type,
            Task.routine_interval == template.routine_interval,
            Task.occurrence_date.isnot(None),
        ).order_by(Task.occurrence_date.desc()).first()

        if latest and latest.occurrence_date:
            next_date = latest.occurrence_date.date() + timedelta(days=1)
        else:
            next_date = template.due_date.date() if template.due_date else today

        # Generate missing instances up to today
        current = next_date
        while current <= today:
            existing = db.query(Task).filter(
                Task.user_id == user_id,
                Task.title == template.title,
                Task.routine_type == template.routine_type,
                Task.routine_interval == template.routine_interval,
                Task.occurrence_date == datetime(current.year, current.month, current.day)
            ).first()

            if not existing:
                new_task = Task(
                    user_id=template.user_id,
                    title=template.title,
                    description=template.description,
                    priority=template.priority,
                    category=template.category,
                    due_date=datetime(current.year, current.month, current.day, 23, 59, 0),
                    occurrence_date=datetime(current.year, current.month, current.day),
                    estimated_minutes=template.estimated_minutes,
                    tags=template.tags,
                    routine_type=template.routine_type,
                    routine_interval=template.routine_interval,
                    routine_days=template.routine_days,
                    routine_month_day=template.routine_month_day,
                    routine_end_type=template.routine_end_type,
                    routine_end_count=template.routine_end_count,
                    routine_end_date=template.routine_end_date,
                    routine_occurrence=1,
                    is_routine_template=False,  # ← ADD
                    destination=TaskDestination.ACTIVE,
                    status=TaskStatus.NOT_STARTED
                )
                db.add(new_task)
                db.flush()

                for sub in template.subtasks:
                    new_sub = SubTask(
                        task_id=new_task.id,
                        title=sub.title,
                        order=sub.order,
                        is_completed=False
                    )
                    db.add(new_sub)

                created += 1

            current += timedelta(days=1)

    # Move expired incomplete routine tasks to Limbo
    expired = db.query(Task).filter(
        Task.user_id == user_id,
        Task.routine_type != "never",
        Task.routine_type.isnot(None),
        Task.destination == TaskDestination.ACTIVE,
        Task.occurrence_date.isnot(None),
        Task.occurrence_date < today,
        Task.status.in_([TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS])
    ).all()

    for task in expired:
        task.destination = TaskDestination.LIMBO
        task.updated_at = now

    db.commit()
    return created