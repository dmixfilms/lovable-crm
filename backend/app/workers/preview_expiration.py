from datetime import datetime
from app.database import SessionLocal
from app.models.lovable_preview import LovablePreview
from app.models.task import Task


def expire_old_previews():
    """
    Scheduled job: Mark expired previews as archived.
    Runs daily at configured time.
    """
    print("🚀 Checking for expired previews...")

    db = SessionLocal()

    try:
        now = datetime.utcnow()

        # Find previews that have expired
        expired_previews = (
            db.query(LovablePreview)
            .filter(
                LovablePreview.expires_at <= now,
                LovablePreview.is_archived == False,
            )
            .all()
        )

        count = 0
        for preview in expired_previews:
            preview.is_archived = True
            preview.archive_reason = "auto-expired"
            count += 1

            # Create a task for the operator to recreate if needed
            task = Task(
                lead_id=preview.lead_id,
                task_type="recreate_preview",
                notes=f"Preview expired on {preview.expires_at}. Recreate if needed.",
                due_date=datetime.utcnow(),
            )
            db.add(task)

        db.commit()
        print(f"✓ Expiration check completed: {count} previews archived")

    except Exception as e:
        print(f"✗ Expiration check failed: {e}")
        db.rollback()
    finally:
        db.close()
