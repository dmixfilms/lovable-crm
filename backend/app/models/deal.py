import uuid
from decimal import Decimal
from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, func
from app.database import Base


class Deal(Base):
    __tablename__ = "deals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lead_id = Column(String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    quoted_price_aud = Column(Numeric(10, 2), nullable=True)
    final_price_aud = Column(Numeric(10, 2), nullable=True)
    cost_lovable_aud = Column(Numeric(10, 2), default=0)
    domain_cost_aud = Column(Numeric(10, 2), default=0)
    other_costs_aud = Column(Numeric(10, 2), default=0)
    stripe_payment_status = Column(String(50), default="pending")  # pending, paid, failed, rejected
    stripe_session_id = Column(String(255), nullable=True)
    paid_at = Column(DateTime, nullable=True)
    rejection_reason = Column(String(500), nullable=True)  # reason why client rejected
    rejected_at = Column(DateTime, nullable=True)
    profit_aud = Column(Numeric(10, 2), nullable=True)  # computed: final_price - cost_lovable
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
