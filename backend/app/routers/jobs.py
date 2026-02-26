from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.lead_import_run import LeadImportRun
from app.schemas.job import ImportJobRequest

router = APIRouter()


@router.post("/import", status_code=202)
def trigger_import(
    request: ImportJobRequest = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger a lead import job with custom parameters"""
    from app.workers.daily_import import run_daily_import

    try:
        if request:
            run_daily_import(
                keywords=request.keywords,
                suburbs=request.suburbs,
                limit=request.limit,
                radius_meters=request.radius_meters,
            )
        else:
            run_daily_import()
        return {"status": "queued", "message": "Import job started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start job: {str(e)}")


@router.post("/expiration", status_code=202)
def trigger_expiration(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger preview expiration check"""
    from app.workers.preview_expiration import expire_old_previews

    try:
        expire_old_previews()
        return {"status": "queued", "message": "Expiration job started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start job: {str(e)}")


@router.get("/runs")
def get_import_runs(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recent import runs"""
    runs = (
        db.query(LeadImportRun)
        .order_by(LeadImportRun.started_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "run_type": r.run_type,
            "keywords_used": r.keywords_used,
            "leads_added": r.leads_added,
            "leads_skipped_duplicates": r.leads_skipped_duplicates,
            "started_at": r.started_at,
            "finished_at": r.finished_at,
        }
        for r in runs
    ]
