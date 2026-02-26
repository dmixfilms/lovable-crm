from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.executors.pool import ThreadPoolExecutor
import logging
from app.config import settings

logging.basicConfig()
logging.getLogger("apscheduler").setLevel(logging.WARNING)

# Configure scheduler with in-memory job store
job_stores = {"default": MemoryJobStore()}
executors = {"default": ThreadPoolExecutor(max_workers=3)}

scheduler = BackgroundScheduler(
    jobstores=job_stores,
    executors=executors,
    timezone=settings.timezone,
)


def register_jobs():
    """Register all scheduled jobs"""
    from app.workers import daily_import, email_discovery, preview_expiration, followup_scheduler

    # Daily import at 7 AM Sydney time
    scheduler.add_job(
        daily_import.run_daily_import_job,
        CronTrigger(hour=settings.daily_import_hour, minute=settings.daily_import_minute),
        id="daily_import",
        name="Daily Lead Import",
        replace_existing=True,
    )

    # Email discovery every 2 hours
    scheduler.add_job(
        email_discovery.discover_emails_batch,
        "interval",
        hours=settings.email_discovery_interval_hours,
        id="email_discovery",
        name="Email Discovery",
        replace_existing=True,
    )

    # Preview expiration at 8 AM Sydney time
    scheduler.add_job(
        preview_expiration.expire_old_previews,
        CronTrigger(hour=settings.preview_expiration_hour, minute=settings.preview_expiration_minute),
        id="preview_expiration",
        name="Preview Expiration",
        replace_existing=True,
    )

    # Follow-up scheduler at 9 AM Sydney time
    scheduler.add_job(
        followup_scheduler.schedule_followups,
        CronTrigger(hour=settings.followup_scheduler_hour, minute=settings.followup_scheduler_minute),
        id="followup_scheduler",
        name="Follow-up Scheduler",
        replace_existing=True,
    )

    print("✓ All scheduled jobs registered")
