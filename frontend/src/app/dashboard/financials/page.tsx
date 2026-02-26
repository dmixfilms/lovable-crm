"use client"

import { useFinancials, usePipelineMetrics } from "@/hooks/useFinancials"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function FinancialsPage() {
  const { data: metrics, isLoading } = useFinancials()
  const { data: pipelineData, isLoading: pipelineLoading } = usePipelineMetrics()

  if (isLoading || pipelineLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
          <p className="text-slate-600">Loading financials...</p>
        </div>
      </div>
    )
  }

  const MetricCard = ({ title, value, icon }: { title: string; value: string | number; icon: string }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className="text-4xl opacity-50">{icon}</div>
      </div>
    </div>
  )

  const COLORS = ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Financials</h1>
        <p className="text-slate-600 mt-2">Track revenue, profit, and pipeline metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`A$${metrics?.total_revenue_aud?.toFixed(2) || "0.00"}`}
          icon="💵"
        />
        <MetricCard title="Total Profit" value={`A$${metrics?.total_profit_aud?.toFixed(2) || "0.00"}`} icon="📈" />
        <MetricCard title="Total Costs" value={`A$${metrics?.total_costs_aud?.toFixed(2) || "0.00"}`} icon="💸" />
        <MetricCard title="Average Margin" value={`${metrics?.avg_margin_percent?.toFixed(1) || "0"}%`} icon="📊" />
      </div>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Pipeline Value" value={`A$${(0).toFixed(2)}`} icon="🎯" />
        <MetricCard title="Paid Deals" value={metrics?.total_paid_deals || 0} icon="✅" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Pipeline by Stage</h2>
          {pipelineData?.stages && pipelineData.stages.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={pipelineData.stages}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={90} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-8">No pipeline data available</p>
          )}
        </div>

        {/* Stage Distribution Pie */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Lead Distribution</h2>
          {pipelineData?.stages && pipelineData.stages.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pipelineData.stages} dataKey="count" nameKey="stage" cx="50%" cy="50%" outerRadius={80}>
                  {pipelineData.stages.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Financial Summary</h2>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex justify-between">
            <span>Total Revenue:</span>
            <span className="font-semibold">A${metrics?.total_revenue_aud?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Costs:</span>
            <span className="font-semibold">A${metrics?.total_costs_aud?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="border-t border-blue-300 pt-3 flex justify-between">
            <span>Net Profit:</span>
            <span className="font-semibold">A${metrics?.total_profit_aud?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="border-t border-blue-300 pt-3 flex justify-between">
            <span>Profit Margin:</span>
            <span className="font-semibold">{metrics?.avg_margin_percent?.toFixed(1) || "0"}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
