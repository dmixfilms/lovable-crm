import asyncio
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from app.database import SessionLocal
from app.services.google_places import GooglePlacesService
from app.models.lead import Lead, PipelineStatus
from app.models.lead_import_run import LeadImportRun
from app.config import settings


def run_daily_import_job(keywords=None, suburbs=None, limit=None, radius_meters=None):
    """
    Scheduled job: Import leads from Google Places API.
    Runs daily at configured time.
    """
    print("🚀 Starting daily lead import...")

    db = SessionLocal()
    service = GooglePlacesService()

    # Use provided parameters or fall back to defaults
    if not keywords:
        keywords = settings.default_keywords.split(",")
    if not suburbs:
        suburbs = settings.default_suburbs.split(",")
    if not limit:
        limit = settings.default_daily_lead_limit
    if not radius_meters:
        radius_meters = settings.default_search_radius_meters

    leads_added = 0
    leads_skipped = 0

    try:
        for suburb in suburbs[:1]:  # Import from first suburb for now
            for keyword in keywords[:3]:  # Limit to first 3 keywords per suburb
                try:
                    places = asyncio.run(
                        service.search_businesses(keyword, location=f"{suburb}, Sydney, NSW", limit=10)
                    )

                    for place in places:
                        details = asyncio.run(service.get_place_details(place.get("place_id")))
                        if not details:
                            continue

                        lead_data = service.map_to_lead_dict(place, details)
                        lead = Lead(**lead_data, status_pipeline=PipelineStatus.NEW_CAPTURED)

                        db.add(lead)
                        try:
                            db.commit()
                            leads_added += 1
                        except IntegrityError:
                            db.rollback()
                            leads_skipped += 1

                except Exception as e:
                    print(f"Error processing keyword '{keyword}': {e}")
                    continue

        # Record import run
        run = LeadImportRun(
            run_type="scheduled",
            keywords_used=keywords[:3],
            limit_target=limit,
            leads_added=leads_added,
            leads_skipped_duplicates=leads_skipped,
            finished_at=datetime.utcnow(),
        )
        db.add(run)
        db.commit()

        print(f"✓ Daily import completed: {leads_added} added, {leads_skipped} skipped")

    except Exception as e:
        print(f"✗ Daily import failed: {e}")
        db.rollback()
    finally:
        db.close()


def run_daily_import(keywords=None, suburbs=None, limit=None, radius_meters=None):
    """Manual trigger for import (used by API)"""
    # Fallback to defaults
    if not keywords:
        keywords = settings.default_keywords.split(",")[:3]
    if not suburbs:
        suburbs = settings.default_suburbs.split(",")
    if not limit:
        limit = settings.default_daily_lead_limit
    if not radius_meters:
        radius_meters = settings.default_search_radius_meters

    run_daily_import_job(keywords=keywords, suburbs=suburbs, limit=limit, radius_meters=radius_meters)
