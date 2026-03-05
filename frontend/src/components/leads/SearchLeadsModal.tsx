"use client"

import { useState, useMemo } from "react"
import { Lead } from "@/types/index"

interface SearchLeadsModalProps {
  open: boolean
  leads: Lead[]
  onClose: () => void
  onSelectLead: (lead: Lead) => void
}

export default function SearchLeadsModal({ open, leads, onClose, onSelectLead }: SearchLeadsModalProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter leads by search query
  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) {
      return leads
    }

    const query = searchQuery.toLowerCase().trim()
    return leads.filter((lead) => {
      const name = lead.business_name?.toLowerCase() || ""
      const suburb = lead.suburb?.toLowerCase() || ""
      const phone = lead.phone?.toLowerCase() || ""
      const owner = lead.owner_name?.toLowerCase() || ""

      return name.includes(query) || suburb.includes(query) || phone.includes(query) || owner.includes(query)
    })
  }, [leads, searchQuery])

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">🔍 Search Leads</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 text-2xl font-light leading-none"
            >
              ✕
            </button>
          </div>

          {/* Search Input */}
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <input
              type="text"
              placeholder="Search by name, suburb, phone, or owner name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            />
            <p className="text-xs text-slate-500 mt-2">
              {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto">
            {filteredLeads.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-500">
                  {searchQuery ? "No leads found. Try a different search." : "Enter a search term..."}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => {
                      onSelectLead(lead)
                      onClose()
                    }}
                    className="w-full px-6 py-4 text-left hover:bg-purple-50 transition-colors flex items-start justify-between group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 group-hover:text-purple-700 break-words">
                        {lead.business_name}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-600">
                        {lead.suburb && <span>📍 {lead.suburb}</span>}
                        {lead.phone && <span>📱 {lead.phone}</span>}
                        {lead.owner_name && <span>👤 {lead.owner_name}</span>}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        {lead.status_pipeline.replace(/_/g, " ")}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors font-medium text-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
