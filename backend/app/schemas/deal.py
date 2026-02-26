from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime


class DealCreate(BaseModel):
    quoted_price_aud: Optional[Decimal] = None
    final_price_aud: Optional[Decimal] = None
    cost_lovable_aud: Decimal = Decimal("0")
    domain_cost_aud: Decimal = Decimal("0")
    other_costs_aud: Decimal = Decimal("0")


class DealUpdate(BaseModel):
    quoted_price_aud: Optional[Decimal] = None
    final_price_aud: Optional[Decimal] = None
    cost_lovable_aud: Optional[Decimal] = None
    domain_cost_aud: Optional[Decimal] = None
    other_costs_aud: Optional[Decimal] = None
    stripe_payment_status: Optional[str] = None
    stripe_session_id: Optional[str] = None
    rejection_reason: Optional[str] = None


class DealResponse(BaseModel):
    id: str
    lead_id: str
    quoted_price_aud: Optional[Decimal]
    final_price_aud: Optional[Decimal]
    cost_lovable_aud: Decimal
    domain_cost_aud: Decimal
    other_costs_aud: Decimal
    stripe_payment_status: str
    stripe_session_id: Optional[str]
    paid_at: Optional[datetime]
    rejection_reason: Optional[str]
    rejected_at: Optional[datetime]
    profit_aud: Optional[Decimal]
    created_at: datetime

    class Config:
        from_attributes = True
