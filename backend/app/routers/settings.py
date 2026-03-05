from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services.settings_service import SettingsService
from app.schemas.settings import AppSettingsUpdate, AppSettingsResponse

router = APIRouter()


@router.get("/settings", response_model=AppSettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current app settings"""
    service = SettingsService(db)
    settings = service.get_settings()
    return settings


@router.put("/settings", response_model=AppSettingsResponse)
def update_settings(
    data: AppSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update app settings"""
    service = SettingsService(db)
    settings = service.update_settings(data)
    return settings
