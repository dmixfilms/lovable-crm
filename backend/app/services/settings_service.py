from sqlalchemy.orm import Session
from app.models.settings import AppSettings
from app.schemas.settings import AppSettingsUpdate


class SettingsService:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_settings(self) -> AppSettings:
        """Get the singleton settings record or create one"""
        settings = self.db.query(AppSettings).first()
        if not settings:
            settings = AppSettings()
            self.db.add(settings)
            self.db.commit()
            self.db.refresh(settings)
        return settings

    def get_settings(self) -> AppSettings:
        """Get current settings"""
        return self.get_or_create_settings()

    def update_settings(self, data: AppSettingsUpdate) -> AppSettings:
        """Update settings"""
        settings = self.get_or_create_settings()

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(settings, field):
                setattr(settings, field, value)

        self.db.commit()
        self.db.refresh(settings)
        return settings
