"use client"

import { useEffect, useState } from "react"
import { useLeads } from "@/hooks/useLeads"
import { api } from "@/lib/api"

interface DashboardSummary {
  total_leads: number
  new_leads_today: number
  new_leads_this_week: number
  total_revenue: number
  total_deals: number
  won_deals: number
  open_deals: number
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Load leads to ensure data is available
  const { data: leadsData } = useLeads({ limit: 500 })

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get("/dashboard/summary")
        setSummary(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  const StatCard = ({
    title,
    value,
    icon,
  }: {
    title: string
    value: string | number
    icon: string
  }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome back! Here's your CRM overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value={summary?.total_leads || leadsData?.total || 0}
          icon="👥"
        />
        <StatCard
          title="New Today"
          value={summary?.new_leads_today || 0}
          icon="⭐"
        />
        <StatCard
          title="This Week"
          value={summary?.new_leads_this_week || 0}
          icon="📈"
        />
        <StatCard
          title="Total Revenue"
          value={`A$${summary?.total_revenue || 0}`}
          icon="💰"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Deals"
          value={summary?.total_deals || 0}
          icon="🤝"
        />
        <StatCard
          title="Won Deals"
          value={summary?.won_deals || 0}
          icon="🏆"
        />
        <StatCard
          title="Open Deals"
          value={summary?.open_deals || 0}
          icon="📋"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h2>
        <p className="text-blue-800 text-sm mb-4">
          Welcome to Lovable CRM! Here are the next steps:
        </p>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>✓ Authentication is working</li>
          <li>→ Import your first leads from Google Places</li>
          <li>→ Create message templates</li>
          <li>→ Set up your pricing and financial tracking</li>
        </ul>
      </div>
    </div>
  )
}
