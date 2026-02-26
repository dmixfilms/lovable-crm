from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter()


@router.get("/{lead_id}/tasks", response_model=list[TaskResponse])
def list_tasks(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all tasks for a lead"""
    tasks = db.query(Task).filter(Task.lead_id == lead_id).order_by(Task.created_at.desc()).all()
    return tasks


@router.post("/{lead_id}/tasks", response_model=TaskResponse, status_code=201)
def create_task(
    lead_id: str,
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new task for a lead"""
    task = Task(lead_id=lead_id, **data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{lead_id}/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    lead_id: str,
    task_id: str,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a task"""
    from datetime import datetime

    task = db.query(Task).filter(Task.id == task_id, Task.lead_id == lead_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "is_done" and value and not task.is_done:
            task.completed_at = datetime.utcnow()
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{lead_id}/tasks/{task_id}", status_code=204)
def delete_task(
    lead_id: str,
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a task"""
    task = db.query(Task).filter(Task.id == task_id, Task.lead_id == lead_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
