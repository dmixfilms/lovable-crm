"use client"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface FinancialMetrics {
  total_revenue_aud: number
  total_profit_aud: number
  total_costs_aud: number
  avg_margin_percent: number
  total_paid_deals: number
}

export interface PipelineStage {
  stage: string
  count: number
}

export function useFinancials() {
  return useQuery({
    queryKey: ["financials"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/financials")
      return data as FinancialMetrics
    },
  })
}

export function usePipelineMetrics() {
  return useQuery({
    queryKey: ["pipeline-metrics"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/pipeline")
      return data as { stages: PipelineStage[] }
    },
  })
}
