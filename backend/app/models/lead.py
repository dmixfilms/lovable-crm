import uuid
import enum
import json
from sqlalchemy import Column, String, Text, DateTime, Enum, func, JSON
from app.database import Base


class PipelineStatus(str, enum.Enum):
    NEW_CAPTURED = "NEW_CAPTURED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PREVIEW_PENDING = "PREVIEW_PENDING"
    PREVIEW_CREATED = "PREVIEW_CREATED"
    SAMPLE_SENT = "SAMPLE_SENT"
    WAITING_REPLY = "WAITING_REPLY"
    LINK_SENT = "LINK_SENT"
    PRICE_SENT = "PRICE_SENT"
    PAYMENT_SENT = "PAYMENT_SENT"
    PAID = "PAID"
    DELIVERED = "DELIVERED"
    WON = "WON"
    LOST = "LOST"
    NO_RESPONSE = "NO_RESPONSE"
    ARCHIVED = "ARCHIVED"


class Lead(Base):
    __tablename__ = "leads"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    business_name = Column(String(255), nullable=False, index=True)
    industry_category = Column(String(100))
    address = Column(Text)
    suburb = Column(String(100), index=True)
    website_url = Column(String(500))
    website_domain = Column(String(255))
    emails = Column(JSON, default=list)  # list of email strings
    phone = Column(String(50))
    instagram_url = Column(String(500))
    google_place_id = Column(String(255), unique=True, nullable=True, index=True)
    google_maps_url = Column(String(500))
    rating = Column(String(10))  # e.g. "4.5"
    reviews_count = Column(String(50))
    status_pipeline = Column(Enum(PipelineStatus), default=PipelineStatus.NEW_CAPTURED, index=True, nullable=False)
    owner_name = Column(String(255))
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    tasks = None  # Will be added via imports
    deal = None  # Will be added via imports
    previews = None  # Will be added via imports
    pipeline_events = None  # Will be added via imports
    messages = None  # Will be added via imports
