import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, func, Boolean
from app.database import Base


class AppSettings(Base):
    __tablename__ = "app_settings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Import Settings
    daily_import_enabled = Column(Boolean, default=True)
    daily_import_first_hour = Column(Integer, default=7)  # 7 AM
    daily_import_first_minute = Column(Integer, default=0)
    daily_import_second_enabled = Column(Boolean, default=False)  # 2nd run of the day
    daily_import_second_hour = Column(Integer, default=19)  # 7 PM
    daily_import_second_minute = Column(Integer, default=0)
    daily_import_limit = Column(Integer, default=30)
    search_radius_meters = Column(Integer, default=5000)
    import_keywords = Column(String(500), default="restaurant,cafe,gym,hair salon,beauty,dentist")
    import_suburbs = Column(String(500), default="Surry Hills,Newtown,Bondi,Parramatta,Chatswood")

    # Financial Settings
    lovable_preview_cost_aud = Column(Float, default=50.0)
    target_profit_margin = Column(Float, default=60.0)

    # Preview Settings
    preview_expiry_days = Column(Integer, default=7)

    # General Settings
    timezone = Column(String(50), default="Australia/Sydney")

    # Timestamps
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
