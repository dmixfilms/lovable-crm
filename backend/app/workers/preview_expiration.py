from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models.lovable_preview import LovablePreview
from app.models.task import Task


def expire_old_previews():
    """
    Scheduled job: Two-phase preview expiration lifecycle:
    Phase 1: Mark expired previews as archived (auto-expired)
    Phase 2: Create deletion tasks for previews archived 30+ days ago
    Runs daily at configured time.
    """
    print("🚀 Checking for expired and expired-to-delete previews...")

    db = SessionLocal()

    try:
        now = datetime.utcnow()

        # Phase 1: Find previews that have expired (but not yet archived)
        expired_previews = (
            db.query(LovablePreview)
            .filter(
                LovablePreview.expires_at <= now,
                LovablePreview.is_archived == False,
            )
            .all()
        )

        expired_count = 0
        for preview in expired_previews:
            preview.is_archived = True
            preview.archive_reason = "auto-expired"
            preview.archived_at = now
            expired_count += 1

        if expired_count > 0:
            db.commit()
            print(f"✓ Phase 1: {expired_count} previews auto-archived")

        # Phase 2: Find previews archived 30+ days ago and create deletion tasks
        deletion_cutoff = now - timedelta(days=30)
        ready_for_deletion = (
            db.query(LovablePreview)
            .filter(
                LovablePreview.is_archived == True,
                LovablePreview.archived_at != None,
                LovablePreview.archived_at <= deletion_cutoff,
            )
            .all()
        )

        deletion_count = 0
        for preview in ready_for_deletion:
            # Check if task already exists
            existing = (
                db.query(Task)
                .filter(
                    Task.lead_id == preview.lead_id,
                    Task.task_type == "delete_preview_from_lovable",
                    Task.is_done == False,
                )
                .first()
            )
            if not existing:
                task = Task(
                    lead_id=preview.lead_id,
                    task_type="delete_preview_from_lovable",
                    notes=f"30 dias após desativação. Excluir do Lovable: {preview.preview_url}",
                    due_date=now,
                )
                db.add(task)
                deletion_count += 1

        if deletion_count > 0:
            db.commit()
            print(f"✓ Phase 2: {deletion_count} deletion tasks created")

        if expired_count == 0 and deletion_count == 0:
            print("✓ No previews to process")

    except Exception as e:
        print(f"✗ Preview expiration check failed: {e}")
        db.rollback()
    finally:
        db.close()
