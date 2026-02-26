from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class OutboundMessageCreate(BaseModel):
    channel: str  # EMAIL, INSTAGRAM
    to_address: str
    template_id: Optional[str] = None
    body_rendered: str
    status: str = "DRAFT"


class OutboundMessageUpdate(BaseModel):
    status: Optional[str] = None
    error_message: Optional[str] = None


class OutboundMessageResponse(BaseModel):
    id: str
    lead_id: str
    channel: str
    to_address: str
    template_id: Optional[str]
    body_rendered: str
    status: str
    sent_at: Optional[datetime]
    error_message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
