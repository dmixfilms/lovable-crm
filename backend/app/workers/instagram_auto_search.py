"""
Instagram Auto Search Worker
Automatically searches and saves Instagram links for NEW leads
Runs AFTER daily import with intervals between searches
"""
import asyncio
import time
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.lead import Lead, PipelineStatus
from app.services.instagram_search import search_instagram
from app.services.instagram_session_manager import InstagramSessionManager

# Interval between searches (in seconds) to avoid Instagram blocking
SEARCH_INTERVAL = 3


def run_instagram_auto_search():
    """
    Find all NEW_LEADS without Instagram link and search automatically
    Runs as a background job
    """
    print(f"\n🔍 Instagram Auto Search Worker Started at {datetime.now()}")

    # Check if user has authenticated with Instagram
    if not InstagramSessionManager.has_session_file():
        print(f"⚠️ No Instagram session found. User needs to authenticate first.")
        print(f"   Click '🔐 Conectar Instagram' in the UI to authenticate.")
        return

    db = SessionLocal()

    try:
        # Find NEW_LEADS without Instagram URL
        new_leads = db.query(Lead).filter(
            Lead.status_pipeline == PipelineStatus.NEW_CAPTURED.value,
            (Lead.instagram_url == None) | (Lead.instagram_url == "")
        ).all()

        print(f"📊 Found {len(new_leads)} leads without Instagram URL")

        if not new_leads:
            print(f"✓ No leads to process")
            db.close()
            return

        processed = 0
        found = 0
        failed = 0

        # Process each lead with interval
        for idx, lead in enumerate(new_leads):
            try:
                print(f"\n  📍 Processing ({idx+1}/{len(new_leads)}): {lead.business_name}")

                if not lead.address:
                    print(f"     ⚠️ No address, skipping")
                    failed += 1
                    continue

                # Search Instagram (sync wrapper for async function)
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                result = loop.run_until_complete(
                    search_instagram(lead.business_name, lead.address)
                )
                loop.close()

                processed += 1

                if result.get('success') and result.get('address_match'):
                    # Perfect match found - save it
                    lead.instagram_url = result['instagram_url']
                    if result.get('phone') and not lead.phone:
                        lead.phone = result['phone']
                    db.commit()
                    db.refresh(lead)
                    found += 1
                    print(f"     ✅ Saved: {result['instagram_url']}")

                else:
                    # No match or candidates found
                    if result.get('candidates'):
                        print(f"     ⚠️ Found {len(result['candidates'])} candidates (no auto-save)")
                    else:
                        print(f"     ❌ Not found: {result.get('error', 'Unknown error')}")

            except Exception as e:
                print(f"     ❌ Error: {str(e)}")
                failed += 1

            # Wait between searches to avoid Instagram blocking
            if idx < len(new_leads) - 1:
                print(f"     ⏳ Waiting {SEARCH_INTERVAL}s before next search...")
                time.sleep(SEARCH_INTERVAL)

        print(f"\n📈 Summary:")
        print(f"   Total processed: {processed}")
        print(f"   Auto-saved: {found}")
        print(f"   Failed: {failed}")
        print(f"✓ Worker finished at {datetime.now()}\n")

    except Exception as e:
        print(f"❌ Worker error: {str(e)}")
    finally:
        db.close()
