from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Security
    secret_key: str = "dev-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    # Database
    database_url: str = "sqlite:///./lovable_crm.db"

    # Google Places API
    google_places_api_key: Optional[str] = None

    # Stripe Payment
    stripe_secret_key: Optional[str] = None

    # APScheduler
    timezone: str = "Australia/Sydney"
    daily_import_hour: int = 7
    daily_import_minute: int = 0
    email_discovery_interval_hours: int = 2
    preview_expiration_hour: int = 8
    preview_expiration_minute: int = 0
    followup_scheduler_hour: int = 9
    followup_scheduler_minute: int = 0

    # Lead Capture Defaults
    default_daily_lead_limit: int = 30
    default_search_radius_meters: int = 5000
    default_suburbs: str = "Surry Hills,Newtown,Bondi,Parramatta,Chatswood"
    default_keywords: str = "restaurant,cafe,gym,hair salon,beauty,dentist"

    # Lovable Config
    lovable_cost_per_preview_aud: float = 0.0
    preview_expiry_days: int = 7

    # App Config
    debug: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"


settings = Settings()
