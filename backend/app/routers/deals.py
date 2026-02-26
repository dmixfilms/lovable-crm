from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.deal import Deal
from app.schemas.deal import DealCreate, DealUpdate, DealResponse

router = APIRouter()


@router.get("/{lead_id}/deal", response_model=DealResponse)
def get_lead_deal(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get or create deal for a lead"""
    deal = db.query(Deal).filter(Deal.lead_id == lead_id).first()
    if not deal:
        deal = Deal(lead_id=lead_id)
        db.add(deal)
        db.commit()
        db.refresh(deal)
    return deal


@router.post("/{lead_id}/deal", response_model=DealResponse, status_code=201)
def create_or_update_deal(
    lead_id: str,
    data: DealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create or update deal for a lead"""
    deal = db.query(Deal).filter(Deal.lead_id == lead_id).first()

    if not deal:
        deal = Deal(lead_id=lead_id, **data.model_dump())
    else:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(deal, field, value)

    db.add(deal)
    db.commit()
    db.refresh(deal)
    return deal


@router.patch("/{lead_id}/deal", response_model=DealResponse)
def update_deal(
    lead_id: str,
    data: DealUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update deal for a lead"""
    from datetime import datetime

    deal = db.query(Deal).filter(Deal.lead_id == lead_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    # Update all provided fields
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(deal, field, value)

    # Set rejected_at timestamp when marking as rejected
    if deal.stripe_payment_status == "rejected" and not deal.rejected_at:
        deal.rejected_at = datetime.now()

    # Compute profit: final_price - (lovable_cost + domain_cost + other_costs)
    if deal.final_price_aud:
        total_costs = (deal.cost_lovable_aud or 0) + (deal.domain_cost_aud or 0) + (deal.other_costs_aud or 0)
        deal.profit_aud = deal.final_price_aud - total_costs

    db.commit()
    db.refresh(deal)
    return deal
