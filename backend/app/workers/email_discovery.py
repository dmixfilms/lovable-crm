import asyncio
from datetime import datetime
from app.database import SessionLocal
from app.models.lead import Lead
from app.services.email_discovery import EmailDiscoveryService


def discover_emails_batch():
    """
    Scheduled job: Discover emails from websites.
    Runs every 2 hours.
    """
    print("🚀 Starting email discovery batch...")

    db = SessionLocal()
    service = EmailDiscoveryService()

    # Find leads without emails that have a website
    leads = (
        db.query(Lead)
        .filter(
            Lead.website_url.isnot(None),
            (Lead.emails.isnot(None) == False) | (Lead.emails == []),
        )
        .limit(20)  # Process max 20 leads per batch
        .all()
    )

    processed = 0
    found = 0

    try:
        for lead in leads:
            try:
                emails = asyncio.run(service.discover_emails(lead.website_url))
                if emails:
                    lead.emails = emails
                    db.commit()
                    found += 1
                    print(f"  ✓ Found {len(emails)} emails for {lead.business_name}")
            except Exception as e:
                print(f"  ✗ Error processing {lead.business_name}: {e}")
                continue
            finally:
                processed += 1

        print(f"✓ Email discovery completed: {found} leads updated from {processed} processed")

    except Exception as e:
        print(f"✗ Email discovery failed: {e}")
        db.rollback()
    finally:
        db.close()
