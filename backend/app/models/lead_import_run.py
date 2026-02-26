import uuid
from sqlalchemy import Column, String, DateTime, Integer, JSON, Text, func
from app.database import Base


class LeadImportRun(Base):
    __tablename__ = "lead_import_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_type = Column(String(50), nullable=False)  # PLACES_API, SCRAPE, MANUAL
    keywords_used = Column(JSON, default=list)  # List of search keywords
    limit_target = Column(Integer, default=30)  # Target number of leads
    leads_added = Column(Integer, default=0)
    leads_skipped_duplicates = Column(Integer, default=0)
    started_at = Column(DateTime, server_default=func.now(), nullable=False)
    finished_at = Column(DateTime, nullable=True)
    logs = Column(Text, nullable=True)  # JSON or plain text logs
