from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime


class PreviewCreate(BaseModel):
    preview_url: str
    expires_at: datetime
    screenshot_url: Optional[str] = None
    old_website_url: Optional[str] = None


class PreviewUpdate(BaseModel):
    preview_url: Optional[str] = None
    expires_at: Optional[datetime] = None
    screenshot_url: Optional[str] = None
    old_website_url: Optional[str] = None
    is_archived: Optional[bool] = None
    archive_reason: Optional[str] = None


class PreviewResponse(BaseModel):
    id: str
    lead_id: str
    preview_url: str
    screenshot_url: Optional[str]
    old_website_url: Optional[str]
    is_archived: bool
    archive_reason: Optional[str]
    archived_at: Optional[datetime]
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True


class ActivePreviewSummary(BaseModel):
    """Summary of active (non-archived) preview for lead listing"""
    id: str
    preview_url: str
    expires_at: datetime
    is_archived: bool
    archive_reason: Optional[str]
    archived_at: Optional[datetime]

    class Config:
        from_attributes = True
