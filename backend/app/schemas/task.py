from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TaskCreate(BaseModel):
    task_type: str
    due_date: Optional[datetime] = None
    notes: Optional[str] = None


class TaskUpdate(BaseModel):
    task_type: Optional[str] = None
    is_done: Optional[bool] = None
    due_date: Optional[datetime] = None
    notes: Optional[str] = None


class TaskResponse(BaseModel):
    id: str
    lead_id: str
    task_type: str
    is_done: bool
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
