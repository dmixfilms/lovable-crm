from pydantic import BaseModel
from typing import List, Dict, Optional
from decimal import Decimal


class PipelineStageCount(BaseModel):
    stage: str
    count: int


class ConversionFunnelStage(BaseModel):
    stage: str
    count: int
    percentage: float


class PipelineValueByStage(BaseModel):
    stage: str
    total_value_aud: Decimal


class DealBreakdown(BaseModel):
    id: str
    lead_name: str
    final_price_aud: Optional[Decimal]
    profit_aud: Optional[Decimal]


class FinancialSummary(BaseModel):
    total_revenue_aud: Decimal
    total_profit_aud: Decimal
    total_costs_aud: Decimal
    pipeline_value_aud: Decimal
    avg_margin_percent: float
    total_won_deals: int
    monthly_revenue: List[Dict] = []  # {month: str, revenue: Decimal}
    funnel: List[ConversionFunnelStage] = []
    pipeline_by_stage: List[PipelineValueByStage] = []
    recent_deals: List[DealBreakdown] = []


class DashboardSummary(BaseModel):
    leads_today: int
    leads_this_week: int
    leads_this_month: int
    pipeline: List[PipelineStageCount]
    financial: FinancialSummary
