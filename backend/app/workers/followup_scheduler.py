from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models.lead import Lead, PipelineStatus
from app.models.task import Task


# Rules: how many days before auto-creating a follow-up task
FOLLOWUP_RULES = {
    PipelineStatus.SAMPLE_SENT: 2,
    PipelineStatus.WAITING_REPLY: 3,
    PipelineStatus.LINK_SENT: 2,
    PipelineStatus.PRICE_SENT: 3,
    PipelineStatus.PAYMENT_SENT: 4,
}


def schedule_followups():
    """
    Scheduled job: Create follow-up tasks for stale leads.
    Runs daily at configured time.
    """
    print("🚀 Scheduling follow-up tasks...")

    db = SessionLocal()

    try:
        now = datetime.utcnow()
        created_count = 0

        for status, days_threshold in FOLLOWUP_RULES.items():
            cutoff = now - timedelta(days=days_threshold)

            # Find leads stuck in this status
            stale_leads = (
                db.query(Lead)
                .filter(
                    Lead.status_pipeline == status,
                    Lead.updated_at <= cutoff,
                )
                .all()
            )

            for lead in stale_leads:
                # Check if we already have a follow-up task
                existing = (
                    db.query(Task)
                    .filter(
                        Task.lead_id == lead.id,
                        Task.task_type.in_(["followup", "followup_1", "followup_2"]),
                        Task.is_done == False,
                    )
                    .first()
                )

                if not existing:
                    task = Task(
                        lead_id=lead.id,
                        task_type="followup",
                        due_date=now + timedelta(days=1),
                        notes=f"Follow-up: Lead stalled in {status.value} for {days_threshold}+ days",
                    )
                    db.add(task)
                    created_count += 1

        db.commit()
        print(f"✓ Follow-up scheduling completed: {created_count} tasks created")

    except Exception as e:
        print(f"✗ Follow-up scheduling failed: {e}")
        db.rollback()
    finally:
        db.close()
