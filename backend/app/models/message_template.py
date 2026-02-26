import uuid
from sqlalchemy import Column, String, DateTime, Text, JSON, func
from app.database import Base


class MessageTemplate(Base):
    __tablename__ = "message_templates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    channel = Column(String(50), nullable=False)  # EMAIL, INSTAGRAM, SMS
    name = Column(String(255), nullable=False, unique=True)
    subject = Column(String(500), nullable=True)  # For EMAIL only
    body = Column(Text, nullable=False)  # Template body with {{ variable }} placeholders
    language = Column(String(10), default="EN")
    variables = Column(JSON, default=list)  # List of variable names: ["business_name", "preview_url", ...]
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
