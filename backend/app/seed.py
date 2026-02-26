"""
Seed script for initial data setup.
Run with: python -m app.seed
"""
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.message_template import MessageTemplate
from app.models.lovable_preview import LovablePreview
from app.models.lead import Lead
from app.models.task import Task
from app.models.deal import Deal
from app.models.outbound_message import OutboundMessage
from app.models.pipeline_event import PipelineEvent
from app.models.lead_import_run import LeadImportRun
from app.services.auth_service import AuthService


def seed_database():
    """Create tables and seed initial data"""
    print("🌱 Seeding database...")

    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created")

    db = SessionLocal()

    try:
        # Create default admin user if doesn't exist
        admin = db.query(User).filter(User.email == "admin@lovable.test").first()
        if not admin:
            try:
                admin = User(
                    email="admin@lovable.test",
                    password_hash=AuthService.hash_password("admin@123456"),
                    role="admin",
                )
                db.add(admin)
                db.commit()
                print("✓ Admin user created (admin@lovable.test / admin@123456)")
            except Exception as e:
                print(f"✗ Failed to create admin user: {e}")
                db.rollback()
        else:
            print("✓ Admin user already exists")

        # Create default message templates
        templates = [
            {
                "channel": "EMAIL",
                "name": "Initial Pitch",
                "subject": "Free Website Preview for {{business_name}}",
                "body": """Hi {{owner_name}},

I noticed {{business_name}}'s website at {{website_url}} could use a fresh look.

I created a free preview of what a modern redesign would look like: {{preview_url}}

Check it out and let me know if you're interested in the full project!

Best regards""",
                "variables": ["owner_name", "business_name", "website_url", "preview_url"],
            },
            {
                "channel": "EMAIL",
                "name": "Follow-up 1",
                "subject": "Did you see the preview for {{business_name}}?",
                "body": """Hi {{owner_name}},

Just checking in — did you get a chance to review the preview I created for {{business_name}}?

Link: {{preview_url}}

Let me know if you'd like to discuss further!

Cheers""",
                "variables": ["owner_name", "business_name", "preview_url"],
            },
            {
                "channel": "EMAIL",
                "name": "Follow-up 2 (Last)",
                "subject": "Last chance: Preview for {{business_name}} expires soon!",
                "body": """Hi {{owner_name}},

This is my last follow-up — the preview for {{business_name}} expires in 3 days.

If you'd like to move forward or discuss pricing, now's the time: {{preview_url}}

Looking forward to hearing from you!

Best""",
                "variables": ["owner_name", "business_name", "preview_url"],
            },
            {
                "channel": "EMAIL",
                "name": "Price Proposal",
                "subject": "Website Redesign Proposal for {{business_name}}",
                "body": """Hi {{owner_name}},

Based on the preview and your business needs, here's my investment proposal for {{business_name}}:

**Website Redesign: A${{quoted_price}}**

This includes:
- Modern, mobile-responsive design
- SEO optimization
- Performance optimization
- 3 rounds of revisions

Preview: {{preview_url}}

Let me know if you'd like to move forward!

Best regards""",
                "variables": ["owner_name", "business_name", "quoted_price", "preview_url"],
            },
            {
                "channel": "INSTAGRAM",
                "name": "Initial DM",
                "subject": None,
                "body": """Hey {{owner_name}}! 👋

I just redesigned {{business_name}}'s website as a free preview 🎨

Check it out: {{preview_url}}

Would love your thoughts! Let me know if you'd like to chat about a full redesign 😊""",
                "variables": ["owner_name", "business_name", "preview_url"],
            },
        ]

        for template_data in templates:
            existing = db.query(MessageTemplate).filter(MessageTemplate.name == template_data["name"]).first()
            if not existing:
                template = MessageTemplate(**template_data)
                db.add(template)
                print(f"✓ Template created: {template_data['name']}")

        db.commit()
        print("✓ All templates seeded")

    except Exception as e:
        print(f"✗ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

    print("🌱 Seeding complete!")


if __name__ == "__main__":
    seed_database()
