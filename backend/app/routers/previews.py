from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.lovable_preview import LovablePreview
from app.schemas.preview import PreviewCreate, PreviewUpdate, PreviewResponse

router = APIRouter()


@router.get("/{lead_id}/preview", response_model=list[PreviewResponse])
def list_previews(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all previews for a lead"""
    previews = (
        db.query(LovablePreview)
        .filter(LovablePreview.lead_id == lead_id)
        .order_by(LovablePreview.created_at.desc())
        .all()
    )
    return previews


@router.post("/{lead_id}/preview", response_model=PreviewResponse, status_code=201)
def create_preview(
    lead_id: str,
    data: PreviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new Lovable preview for a lead"""
    preview = LovablePreview(lead_id=lead_id, **data.model_dump())
    db.add(preview)
    db.commit()
    db.refresh(preview)
    return preview


@router.patch("/{lead_id}/preview/{preview_id}", response_model=PreviewResponse)
def update_preview(
    lead_id: str,
    preview_id: str,
    data: PreviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a preview"""
    preview = (
        db.query(LovablePreview)
        .filter(LovablePreview.id == preview_id, LovablePreview.lead_id == lead_id)
        .first()
    )
    if not preview:
        raise HTTPException(status_code=404, detail="Preview not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(preview, field, value)

    db.commit()
    db.refresh(preview)
    return preview


@router.delete("/{lead_id}/preview/{preview_id}", status_code=204)
def delete_preview(
    lead_id: str,
    preview_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a preview"""
    preview = (
        db.query(LovablePreview)
        .filter(LovablePreview.id == preview_id, LovablePreview.lead_id == lead_id)
        .first()
    )
    if not preview:
        raise HTTPException(status_code=404, detail="Preview not found")
    db.delete(preview)
    db.commit()
