"""
Backup management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user
from app.models.user import User
from app.workers.backup import create_backup, list_backups, restore_from_backup
from pathlib import Path

router = APIRouter()


@router.post("/backups/create", tags=["backups"])
async def create_backup_endpoint(current_user: User = Depends(get_current_user)):
    """Create an immediate database backup"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create backups")

    backup_file = create_backup()
    if backup_file:
        return {"status": "success", "backup_file": backup_file}
    else:
        raise HTTPException(status_code=500, detail="Backup creation failed")


@router.get("/backups/list", tags=["backups"])
async def list_backups_endpoint(current_user: User = Depends(get_current_user)):
    """List all available backups"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view backups")

    backups = list_backups()
    return {
        "status": "success",
        "count": len(backups),
        "backups": [
            {
                "filename": Path(b).name,
                "path": b,
                "size_mb": Path(b).stat().st_size / 1024 / 1024,
            }
            for b in backups
        ],
    }


@router.post("/backups/restore/{filename}", tags=["backups"])
async def restore_backup_endpoint(
    filename: str, current_user: User = Depends(get_current_user)
):
    """Restore database from a backup"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can restore backups")

    backup_file = Path("backups") / filename

    # Validate filename to prevent path traversal
    if not filename.endswith(".db.gz") or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid backup filename")

    if not backup_file.exists():
        raise HTTPException(status_code=404, detail="Backup not found")

    if restore_from_backup(str(backup_file)):
        return {"status": "success", "message": f"Restored from {filename}"}
    else:
        raise HTTPException(status_code=500, detail="Restore failed")
