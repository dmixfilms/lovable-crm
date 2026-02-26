from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime


class LeadCreate(BaseModel):
    business_name: str
    industry_category: Optional[str] = None
    address: Optional[str] = None
    suburb: Optional[str] = None
    website_url: Optional[str] = None
    emails: Optional[List[str]] = []
    phone: Optional[str] = None
    instagram_url: Optional[str] = None
    google_place_id: Optional[str] = None
    owner_name: Optional[str] = None
    notes: Optional[str] = None


class LeadUpdate(BaseModel):
    business_name: Optional[str] = None
    industry_category: Optional[str] = None
    address: Optional[str] = None
    suburb: Optional[str] = None
    website_url: Optional[str] = None
    emails: Optional[List[str]] = None
    phone: Optional[str] = None
    instagram_url: Optional[str] = None
    owner_name: Optional[str] = None
    notes: Optional[str] = None
    status_pipeline: Optional[str] = None


class LeadResponse(BaseModel):
    id: str
    business_name: str
    industry_category: Optional[str]
    address: Optional[str]
    suburb: Optional[str]
    website_url: Optional[str]
    emails: List[str]
    phone: Optional[str]
    instagram_url: Optional[str]
    google_place_id: Optional[str]
    status_pipeline: str
    owner_name: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LeadListResponse(BaseModel):
    total: int
    items: List[LeadResponse]
