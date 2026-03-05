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
    from app.workers import daily_import, email_discovery, preview_expiration, followup_scheduler, backup, instagram_auto_search

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

    # Database backup every 6 hours (4 times per day)
    scheduler.add_job(
        backup.create_backup,
        "interval",
        hours=6,
        id="database_backup",
        name="Database Backup",
        replace_existing=True,
    )

    # Instagram auto search 5 minutes AFTER daily import (to avoid conflicts)
    import datetime as dt
    import pytz
    tz = pytz.timezone(settings.timezone)
    daily_import_hour = settings.daily_import_hour
    daily_import_minute = settings.daily_import_minute + 5  # Add 5 minutes
    if daily_import_minute >= 60:
        daily_import_hour += 1
        daily_import_minute -= 60

    scheduler.add_job(
        instagram_auto_search.run_instagram_auto_search,
        CronTrigger(hour=daily_import_hour, minute=daily_import_minute),
        id="instagram_auto_search",
        name="Instagram Auto Search (after daily import)",
        replace_existing=True,
    )

    print("✓ All scheduled jobs registered")
