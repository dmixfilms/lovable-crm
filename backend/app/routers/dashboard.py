from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.lead import Lead, PipelineStatus
from app.models.deal import Deal
from app.schemas.dashboard import DashboardSummary, FinancialSummary, PipelineStageCount
from app.services.lead_service import LeadService

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get dashboard summary with metrics"""
    # Count leads by time period
    now = datetime.now(timezone.utc)
    today_cutoff = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_cutoff = today_cutoff - timedelta(days=7)
    month_cutoff = today_cutoff.replace(day=1)

    leads_today = db.query(Lead).filter(Lead.created_at >= today_cutoff).count()
    leads_week = db.query(Lead).filter(Lead.created_at >= week_cutoff).count()
    leads_month = db.query(Lead).filter(Lead.created_at >= month_cutoff).count()

    # Pipeline counts
    service = LeadService(db)
    status_counts = service.count_by_status()
    pipeline = [
        PipelineStageCount(stage=status, count=count)
        for status, count in status_counts.items()
    ]

    # Financial summary
    deals = db.query(Deal).all()
    total_revenue = float(sum(d.final_price_aud or 0 for d in deals))
    total_costs = float(sum(d.cost_lovable_aud or 0 for d in deals))
    total_profit = total_revenue - total_costs
    avg_margin = 0.0

    pipeline_value = 0.0
    for status, count in status_counts.items():
        if status not in ["WON", "LOST", "ARCHIVED", "NO_RESPONSE"]:
            # Assume average deal value of $2000 AUD
            pipeline_value += count * 2000.0

    won_count = sum(1 for d in deals if d.stripe_payment_status == "paid")

    financial = FinancialSummary(
        total_revenue_aud=Decimal(str(total_revenue)),
        total_profit_aud=Decimal(str(total_profit)),
        total_costs_aud=Decimal(str(total_costs)),
        pipeline_value_aud=Decimal(str(pipeline_value)),
        avg_margin_percent=avg_margin,
        total_won_deals=won_count,
    )

    return DashboardSummary(
        leads_today=leads_today,
        leads_this_week=leads_week,
        leads_this_month=leads_month,
        pipeline=pipeline,
        financial=financial,
    )


@router.get("/pipeline")
def get_pipeline_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get detailed pipeline metrics"""
    service = LeadService(db)
    counts = service.count_by_status()
    return {
        "stages": [
            {"stage": status, "count": count}
            for status, count in counts.items()
        ]
    }


@router.get("/financials")
def get_financial_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get detailed financial metrics - REVENUE from PAID deals, COSTS from ALL deals"""
    # Revenue: only from PAID deals
    paid_deals = db.query(Deal).filter(
        Deal.stripe_payment_status == "paid",
        Deal.final_price_aud.isnot(None)
    ).all()

    total_revenue = sum(d.final_price_aud or 0 for d in paid_deals)

    # COSTS: from ALL deals with final_price_aud (including rejected, pending)
    # This counts Lovable costs even if client rejected
    all_deals_with_price = db.query(Deal).filter(
        Deal.final_price_aud.isnot(None)
    ).all()

    total_costs = sum(
        (d.cost_lovable_aud or 0) + (d.domain_cost_aud or 0) + (d.other_costs_aud or 0)
        for d in all_deals_with_price
    )

    total_profit = total_revenue - total_costs

    if total_revenue > 0:
        margin_percent = (total_profit / total_revenue) * 100
    else:
        margin_percent = 0.0

    # Count deals by status for reference
    paid_count = len(paid_deals)
    rejected_count = db.query(Deal).filter(Deal.stripe_payment_status == "rejected").count()
    pending_count = db.query(Deal).filter(Deal.stripe_payment_status == "pending").count()

    return {
        "total_revenue_aud": float(total_revenue),
        "total_profit_aud": float(total_profit),
        "total_costs_aud": float(total_costs),
        "avg_margin_percent": margin_percent,
        "total_paid_deals": paid_count,
        "total_rejected_deals": rejected_count,
        "total_pending_deals": pending_count,
    }
