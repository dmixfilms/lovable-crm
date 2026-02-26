from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import stripe
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.deal import Deal
from app.models.lead import Lead
from app.config import settings

router = APIRouter()

# Initialize Stripe
if settings.stripe_secret_key:
    stripe.api_key = settings.stripe_secret_key


@router.post("/{lead_id}/payment-link")
def create_payment_link(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a Stripe payment link for a deal"""

    if not settings.stripe_secret_key:
        raise HTTPException(status_code=400, detail="Stripe not configured")

    # Get lead and deal
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    deal = db.query(Deal).filter(Deal.lead_id == lead_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if not deal.final_price_aud:
        raise HTTPException(status_code=400, detail="Deal final price not set")

    try:
        # Create Stripe payment link
        payment_link = stripe.PaymentLink.create(
            line_items=[
                {
                    "price_data": {
                        "currency": "aud",
                        "product_data": {
                            "name": f"Website Redesign - {lead.business_name}",
                            "description": f"Website redesign project for {lead.business_name}",
                            "metadata": {
                                "lead_id": lead_id,
                                "deal_id": deal.id,
                            },
                        },
                        "unit_amount": int(deal.final_price_aud * 100),  # Convert to cents
                    },
                    "quantity": 1,
                }
            ],
            metadata={
                "lead_id": lead_id,
                "deal_id": deal.id,
                "business_name": lead.business_name,
            },
        )

        # Store the payment link session ID in the deal
        deal.stripe_session_id = payment_link.id
        db.commit()
        db.refresh(deal)

        return {
            "payment_link": payment_link.url,
            "session_id": payment_link.id,
            "amount": float(deal.final_price_aud),
            "business_name": lead.business_name,
            "message": "Payment link created successfully. Share this link with your client.",
        }

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")


@router.get("/{lead_id}/payment-link")
def get_payment_link(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get existing payment link for a deal"""

    deal = db.query(Deal).filter(Deal.lead_id == lead_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if not deal.stripe_session_id:
        raise HTTPException(status_code=404, detail="No payment link created yet")

    try:
        # Get the payment link from Stripe
        payment_link = stripe.PaymentLink.retrieve(deal.stripe_session_id)

        return {
            "payment_link": payment_link.url,
            "session_id": payment_link.id,
            "status": payment_link.status,
            "amount": float(deal.final_price_aud or 0),
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
