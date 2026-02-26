import uuid
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, func
from app.database import Base


class PipelineEvent(Base):
    __tablename__ = "pipeline_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lead_id = Column(String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)  # CAPTURED, PREVIEW_CREATED, SAMPLE_SENT, etc
    payload = Column(JSON, default=dict)  # Extra data: preview_url, email_used, amount, etc
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)
