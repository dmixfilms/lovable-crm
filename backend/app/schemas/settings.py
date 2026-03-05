from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AppSettingsUpdate(BaseModel):
    # Import Settings
    daily_import_enabled: Optional[bool] = None
    daily_import_first_hour: Optional[int] = None
    daily_import_first_minute: Optional[int] = None
    daily_import_second_enabled: Optional[bool] = None
    daily_import_second_hour: Optional[int] = None
    daily_import_second_minute: Optional[int] = None
    daily_import_limit: Optional[int] = None
    search_radius_meters: Optional[int] = None
    import_keywords: Optional[str] = None
    import_suburbs: Optional[str] = None

    # Financial Settings
    lovable_preview_cost_aud: Optional[float] = None
    target_profit_margin: Optional[float] = None

    # Preview Settings
    preview_expiry_days: Optional[int] = None

    # General Settings
    timezone: Optional[str] = None


class AppSettingsResponse(BaseModel):
    id: str
    daily_import_enabled: bool
    daily_import_first_hour: int
    daily_import_first_minute: int
    daily_import_second_enabled: bool
    daily_import_second_hour: int
    daily_import_second_minute: int
    daily_import_limit: int
    search_radius_meters: int
    import_keywords: str
    import_suburbs: str
    lovable_preview_cost_aud: float
    target_profit_margin: float
    preview_expiry_days: int
    timezone: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
