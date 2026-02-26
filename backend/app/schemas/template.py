from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MessageTemplateCreate(BaseModel):
    channel: str  # EMAIL, INSTAGRAM, SMS
    name: str
    subject: Optional[str] = None
    body: str
    language: str = "EN"
    variables: List[str] = []


class MessageTemplateUpdate(BaseModel):
    channel: Optional[str] = None
    name: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    variables: Optional[List[str]] = None


class MessageTemplateResponse(BaseModel):
    id: str
    channel: str
    name: str
    subject: Optional[str]
    body: str
    language: str
    variables: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
