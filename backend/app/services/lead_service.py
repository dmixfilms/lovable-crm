from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional, List
from app.models.lead import Lead, PipelineStatus
from app.models.pipeline_event import PipelineEvent
from app.schemas.lead import LeadCreate, LeadUpdate


class LeadService:
    def __init__(self, db: Session):
        self.db = db

    def list_leads(
        self,
        status: Optional[str] = None,
        suburb: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> dict:
        """List leads with filters"""
        query = self.db.query(Lead)

        if status:
            try:
                pipeline_status = PipelineStatus(status)
                query = query.filter(Lead.status_pipeline == pipeline_status)
            except ValueError:
                pass

        if suburb:
            query = query.filter(Lead.suburb.ilike(f"%{suburb}%"))

        if search:
            query = query.filter(
                (Lead.business_name.ilike(f"%{search}%"))
                | (Lead.website_domain.ilike(f"%{search}%"))
                | (Lead.address.ilike(f"%{search}%"))
            )

        total = query.count()
        leads = query.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()

        return {"total": total, "items": leads}

    def get_lead(self, lead_id: str) -> Optional[Lead]:
        """Get a single lead by ID"""
        return self.db.query(Lead).filter(Lead.id == lead_id).first()

    def create_lead(self, data: LeadCreate) -> Lead:
        """Create a new lead"""
        # Extract domain from website_url
        website_domain = None
        if data.website_url:
            try:
                from urllib.parse import urlparse
                parsed = urlparse(data.website_url)
                website_domain = parsed.netloc
            except:
                website_domain = None

        lead = Lead(
            business_name=data.business_name,
            industry_category=data.industry_category,
            address=data.address,
            suburb=data.suburb,
            website_url=data.website_url,
            website_domain=website_domain,
            emails=data.emails or [],
            phone=data.phone,
            instagram_url=data.instagram_url,
            google_place_id=data.google_place_id,
            owner_name=data.owner_name,
            notes=data.notes,
            status_pipeline=PipelineStatus.NEW_CAPTURED,
        )
        self.db.add(lead)
        self.db.commit()
        self.db.refresh(lead)

        # Create initial event
        self._create_event(lead.id, "CAPTURED", {})

        return lead

    def update_lead(self, lead_id: str, data: LeadUpdate) -> Optional[Lead]:
        """Update a lead"""
        lead = self.get_lead(lead_id)
        if not lead:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field != "status_pipeline":  # Don't update status via this method
                if hasattr(lead, field):
                    setattr(lead, field, value)

        self.db.commit()
        self.db.refresh(lead)
        return lead

    def move_to_stage(self, lead_id: str, new_status: str, actor_id: str = None) -> Optional[Lead]:
        """Move a lead to a new pipeline stage"""
        lead = self.get_lead(lead_id)
        if not lead:
            return None

        try:
            new_pipeline_status = PipelineStatus(new_status)
        except ValueError:
            return None  # Invalid status

        old_status = lead.status_pipeline.value
        lead.status_pipeline = new_pipeline_status
        self.db.commit()
        self.db.refresh(lead)

        # Create event
        self._create_event(
            lead.id,
            "STATUS_CHANGED",
            {"from_status": old_status, "to_status": new_status, "actor_id": actor_id},
        )

        return lead

    def _create_event(self, lead_id: str, event_type: str, payload: dict) -> PipelineEvent:
        """Helper to create a pipeline event"""
        event = PipelineEvent(lead_id=lead_id, event_type=event_type, payload=payload)
        self.db.add(event)
        self.db.commit()
        return event

    def get_leads_by_status(self, status: PipelineStatus) -> List[Lead]:
        """Get all leads with a specific status"""
        return self.db.query(Lead).filter(Lead.status_pipeline == status).all()

    def get_leads_created_today(self) -> List[Lead]:
        """Get leads created in the last 24 hours"""
        from datetime import datetime, timedelta, timezone

        cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
        return self.db.query(Lead).filter(Lead.created_at >= cutoff).all()

    def count_by_status(self) -> dict:
        """Count leads by pipeline status"""
        results = (
            self.db.query(Lead.status_pipeline, func.count(Lead.id))
            .group_by(Lead.status_pipeline)
            .all()
        )
        return {status.value: count for status, count in results}
