"use client"

import { useState } from "react"
import { useImportRuns, useTriggerImport, type ImportOptions } from "@/hooks/useImport"
import { useLeads } from "@/hooks/useLeads"
import { exportLeadsToCSV } from "@/lib/exportLeads"
import Toast from "@/components/ui/Toast"

const AVAILABLE_KEYWORDS = [
  "restaurant",
  "cafe",
  "gym",
  "hair salon",
  "beauty",
  "dentist",
  "plumber",
  "electrician",
  "accountant",
  "lawyer",
  "photographer",
  "designer",
  "bakery",
  "pizza",
  "pizza delivery",
  "florist",
  "pet store",
  "veterinary",
  "pharmacy",
  "clinic",
]
const DEFAULT_SUBURBS = ["Surry Hills", "Newtown", "Bondi", "Parramatta", "Chatswood"]

export default function ImportPage() {
  const { data: runs = [] } = useImportRuns()
  const triggerImport = useTriggerImport()
  const { data: leadsResponse } = useLeads({ limit: 500 })
  const data = leadsResponse?.items || []

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [showConfig, setShowConfig] = useState(false)

  const [config, setConfig] = useState<ImportOptions>({
    keywords: AVAILABLE_KEYWORDS.slice(0, 3),
    suburbs: DEFAULT_SUBURBS.slice(0, 1),
    limit: 30,
    radius_meters: 5000,
  })

  const [customKeywordInput, setCustomKeywordInput] = useState("")
  const [customSuburbInput, setCustomSuburbInput] = useState("")

  const handleTriggerImport = () => {
    triggerImport.mutate(config, {
      onSuccess: () => {
        setToast({ message: "Import job queued successfully", type: "success" })
        setShowConfig(false)
      },
      onError: () => {
        setToast({ message: "Failed to queue import job", type: "error" })
      },
    })
  }

  const handleAddCustomKeyword = () => {
    if (!customKeywordInput.trim()) return
    const keywords = config.keywords || []
    const newKeyword = customKeywordInput.trim().toLowerCase()
    if (!keywords.includes(newKeyword)) {
      setConfig({ ...config, keywords: [...keywords, newKeyword] })
    }
    setCustomKeywordInput("")
  }

  const handleRemoveKeyword = (keyword: string) => {
    const keywords = config.keywords || []
    setConfig({ ...config, keywords: keywords.filter(k => k !== keyword) })
  }

  const handleAddCustomSuburb = () => {
    if (!customSuburbInput.trim()) return
    const suburbs = config.suburbs || []
    const newSuburb = customSuburbInput.trim()
    if (!suburbs.includes(newSuburb)) {
      setConfig({ ...config, suburbs: [...suburbs, newSuburb] })
    }
    setCustomSuburbInput("")
  }

  const handleRemoveSuburb = (suburb: string) => {
    const suburbs = config.suburbs || []
    setConfig({ ...config, suburbs: suburbs.filter(s => s !== suburb) })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Import Leads</h1>
          <p className="text-slate-600 mt-2">Import leads from Google Places API</p>
        </div>
        <button
          onClick={() => {
            if (data.length > 0) {
              exportLeadsToCSV(data)
            } else {
              alert("No leads to export")
            }
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          ⬇️ Export ({data.length})
        </button>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">⚙️</span>
            <div className="text-left">
              <p className="font-semibold text-slate-900">Import Configuration</p>
              <p className="text-xs text-slate-500">
                {config.keywords?.length || 0} keywords • {config.suburbs?.length || 0} suburbs • Limit: {config.limit}
              </p>
            </div>
          </div>
          <span className={`text-slate-400 transition-transform ${showConfig ? "rotate-180" : ""}`}>▼</span>
        </button>

        {showConfig && (
          <div className="border-t border-slate-200 p-6 space-y-6">
            {/* Keywords */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">Keywords</label>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={customKeywordInput}
                  onChange={(e) => setCustomKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddCustomKeyword()}
                  placeholder="ex: restaurant, cafe, gym..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
                <button
                  onClick={handleAddCustomKeyword}
                  disabled={!customKeywordInput.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
                >
                  Add
                </button>
              </div>

              {config.keywords && config.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {config.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium"
                    >
                      {keyword}
                      <button
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="hover:opacity-70 transition-opacity font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Suburbs */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">Suburbs/Locations</label>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={customSuburbInput}
                  onChange={(e) => setCustomSuburbInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddCustomSuburb()}
                  placeholder="ex: Newtown, Bondi, Surry Hills..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={handleAddCustomSuburb}
                  disabled={!customSuburbInput.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
                >
                  Add
                </button>
              </div>

              {config.suburbs && config.suburbs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {config.suburbs.map((suburb) => (
                    <span
                      key={suburb}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium"
                    >
                      {suburb}
                      <button
                        onClick={() => handleRemoveSuburb(suburb)}
                        className="hover:opacity-70 transition-opacity font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Limit & Radius */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Leads Limit</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={config.limit || 30}
                  onChange={(e) => setConfig({ ...config, limit: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Radius (meters)</label>
                <input
                  type="number"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={config.radius_meters || 5000}
                  onChange={(e) => setConfig({ ...config, radius_meters: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowConfig(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerImport}
                disabled={triggerImport.isPending || !config.keywords?.length || !config.suburbs?.length}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {triggerImport.isPending ? "Running..." : "Run Import"}
              </button>
            </div>

            {triggerImport.isPending && (
              <div className="flex items-center gap-2 text-purple-600 justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span className="text-sm">Import job is running...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Import History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Import History</h2>
        </div>

        {runs.length === 0 ? (
          <div className="p-6 text-center text-slate-500">No import history yet</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Keywords</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Leads Added</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Duplicates</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {runs.map((run) => (
                <tr key={run.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {new Date(run.started_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{run.run_type}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{run.keywords_used?.join(", ") || "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{run.leads_added}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{run.leads_skipped_duplicates || 0}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        run.finished_at ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {run.finished_at ? "Complete" : "Running"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
