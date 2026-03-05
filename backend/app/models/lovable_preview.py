import uuid
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, func
from app.database import Base


class LovablePreview(Base):
    __tablename__ = "lovable_previews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lead_id = Column(String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    preview_url = Column(String(500), nullable=False)
    screenshot_url = Column(String(500), nullable=True)  # URL or base64 of new design screenshot
    old_website_url = Column(String(500), nullable=True)  # URL of old website for comparison
    is_archived = Column(Boolean, default=False, index=True)
    archive_reason = Column(String(255), nullable=True)
    archived_at = Column(DateTime, nullable=True)  # When the preview was archived
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    expires_at = Column(DateTime, nullable=False)  # 7 days from creation by default
