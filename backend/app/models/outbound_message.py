import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, func
from app.database import Base


class OutboundMessage(Base):
    __tablename__ = "outbound_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lead_id = Column(String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    channel = Column(String(50), nullable=False)  # EMAIL, INSTAGRAM, SMS
    to_address = Column(String(255), nullable=False)  # email address or instagram handle
    template_id = Column(String(36), ForeignKey("message_templates.id"), nullable=True)
    body_rendered = Column(Text, nullable=False)  # Full rendered message content
    status = Column(String(50), default="DRAFT")  # DRAFT, SENT, FAILED, DELIVERED
    sent_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
