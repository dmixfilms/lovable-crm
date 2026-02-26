import uuid
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, func
from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lead_id = Column(String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    task_type = Column(String(100), nullable=False)  # CREATE_PREVIEW, SEND_SAMPLE, FOLLOWUP_1, etc
    is_done = Column(Boolean, default=False, index=True)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    assigned_to = Column(String(36), nullable=True)  # user_id
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
