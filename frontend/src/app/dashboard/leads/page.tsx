"use client"

import { useState, useMemo, useRef } from "react"
import { DragDropContext, DropResult } from "@hello-pangea/dnd"
import { useLeads, useMoveLead } from "@/hooks/useLeads"
import KanbanColumn from "@/components/kanban/KanbanColumn"
import PreviewExpiryBanner from "@/components/kanban/PreviewExpiryBanner"
import SearchLeadsModal from "@/components/leads/SearchLeadsModal"
import LeadDetailModal from "@/components/leads/LeadDetailModal"
import Toast from "@/components/ui/Toast"
import { Lead } from "@/types/index"

const ACTIVE_STATUSES = [
  "NEW_CAPTURED",
  "MEDIUM_PRIORITY",
  "HIGH_PRIORITY",
  "PREVIEW_PENDING",
  "PREVIEW_CREATED",
  "SAMPLE_SENT",
  "PRICE_SENT",
  "PAYMENT_SENT",
  "DELIVERED",
]

const STATUS_DISPLAY_NAMES: Record<string, string> = {
  "NEW_CAPTURED": "New Lead",
  "HIGH_PRIORITY": "No Website",
  "MEDIUM_PRIORITY": "Need Update",
  "LOW_PRIORITY": "Good Site",
  "PREVIEW_PENDING": "DEVELOPING",
  "PREVIEW_CREATED": "PREVIEW READY",
  "SAMPLE_SENT": "SENT LINK",
  "PRICE_SENT": "SENT PRICE",
  "PAYMENT_SENT": "SENT CONFIRMATION",
  "DELIVERED": "DONE",
  "REJECTED": "Rejeitados",
  "NO_RESPONSE": "Sem Resposta",
}

export default function LeadsPage() {
  const { data: leadsResponse, isLoading } = useLeads()
  const moveLead = useMoveLead()
  const kanbanContainerRef = useRef<HTMLDivElement>(null)

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [showRejected, setShowRejected] = useState(false)
  const [showNoResponse, setShowNoResponse] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [isDraggingKanban, setIsDraggingKanban] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [newCapturedCount, setNewCapturedCount] = useState(50)
  const [deliveredCount, setDeliveredCount] = useState(50)
  const [showNoInstagram, setShowNoInstagram] = useState(false)

  // Extract leads array from response
  const data = leadsResponse?.items || []

  // Build local columns from data
  const columns = useMemo(() => {
    const map: Record<string, Lead[]> = {}
    ACTIVE_STATUSES.forEach((status) => {
      map[status] = []
    })
    data.forEach((lead) => {
      if (map[lead.status_pipeline]) {
        map[lead.status_pipeline].push(lead)
      }
    })
    return map
  }, [data])

  const onDragEnd = (result: DropResult) => {
    const { draggableId, source, destination } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    const leadId = draggableId
    const targetStatus = destination.droppableId

    // Move lead directly without confirmation
    moveLead.mutate(
      { id: leadId, new_status: targetStatus },
      {
        onError: () => {
          setToast({ message: "Failed to move lead", type: "error" })
        },
        onSuccess: () => {
          setToast({ message: "Lead moved successfully", type: "success" })
        },
      }
    )
  }


  const handleCardToast = (message: string, type: "success" | "error") => {
    setToast({ message, type })
  }

  const handleSelectLead = (lead: Lead) => {
    setSelectedLeadId(lead.id)
  }

  const handleLeadClassified = (classifiedLeadId: string, newStatus: string): string | null => {
    // Only auto-load next if classifying from NEW_CAPTURED status
    const newCapturedLeads = columns["NEW_CAPTURED"] || []
    const currentIndex = newCapturedLeads.findIndex((l) => l.id === classifiedLeadId)

    // Get next unclassified lead in NEW_CAPTURED
    if (currentIndex !== -1 && currentIndex < newCapturedLeads.length - 1) {
      const nextLead = newCapturedLeads[currentIndex + 1]
      setSelectedLeadId(nextLead.id)
      return nextLead.id
    }

    return null
  }

  // Horizontal drag handlers for Kanban viewport
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag if clicking on empty space (not on cards, buttons, or text)
    const target = e.target as HTMLElement
    if (target.closest('[class*="bg-white"]') ||
        target.closest('button') ||
        target.closest('span') ||
        target.closest('p') ||
        target.closest('div[class*="rounded-lg"]')) {
      return
    }

    setIsDraggingKanban(true)
    setDragStartX(e.pageX)
    setScrollLeft(kanbanContainerRef.current?.scrollLeft || 0)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingKanban || !kanbanContainerRef.current) return

    e.preventDefault()
    const walk = (e.pageX - dragStartX) * 0.8 // Reduced multiplier for smoothness
    kanbanContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDraggingKanban(false)
  }

  const handleMouseLeave = () => {
    setIsDraggingKanban(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
          <p className="text-slate-600">Loading leads...</p>
        </div>
      </div>
    )
  }

  const columnsData = ACTIVE_STATUSES.map((status) => {
    let leads = columns[status] || []
    // Limit NEW_CAPTURED and DELIVERED to show only requested count
    if (status === "NEW_CAPTURED") {
      leads = leads.slice(0, newCapturedCount)
    } else if (status === "DELIVERED") {
      leads = leads.slice(0, deliveredCount)
    }
    return { status, leads }
  })

  // Extract archived leads (LOW_PRIORITY / Good Site)
  const archivedLeads = data.filter((lead) => lead.status_pipeline === "LOW_PRIORITY")

  // Extract rejected leads
  const rejectedLeads = data.filter((lead) => lead.status_pipeline === "REJECTED")

  // Extract no response leads
  const noResponseLeads = data.filter((lead) => lead.status_pipeline === "NO_RESPONSE")

  // Extract leads with Instagram Not Found status (searched but not found)
  const noInstagramLeads = data.filter((lead) => lead.status_pipeline === "INSTAGRAM_NOT_FOUND")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-600 mt-2">Total de {data.length} leads • Manage your sales pipeline with drag and drop</p>
        </div>
        <button
          onClick={() => setShowSearch(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
        >
          🔍 Search Leads
        </button>
      </div>

      <PreviewExpiryBanner leads={data} />

      <DragDropContext onDragEnd={onDragEnd}>
        <div
          ref={kanbanContainerRef}
          className={`flex gap-4 overflow-x-auto pb-4 ${
            isDraggingKanban ? "cursor-grabbing" : "cursor-grab"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ userSelect: isDraggingKanban ? "none" : "auto" }}
        >
          {columnsData.map((column) => {
            const totalLeads = columns[column.status]?.length || 0
            const isLoadMoreVisible =
              (column.status === "NEW_CAPTURED" && newCapturedCount < totalLeads) ||
              (column.status === "DELIVERED" && deliveredCount < totalLeads)

            return (
              <KanbanColumn
                key={column.status}
                status={column.status}
                displayName={STATUS_DISPLAY_NAMES[column.status]}
                leads={column.leads}
                onToast={handleCardToast}
                onSelectLead={handleSelectLead}
                totalLeads={totalLeads}
                isLoadMoreVisible={isLoadMoreVisible}
                onLoadMore={() => {
                  if (column.status === "NEW_CAPTURED") {
                    setNewCapturedCount(prev => prev + 50)
                  } else if (column.status === "DELIVERED") {
                    setDeliveredCount(prev => prev + 50)
                  }
                }}
              />
            )
          })}
        </div>
      </DragDropContext>


      {/* Archived Leads Section */}
      {archivedLeads.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-red-700 font-semibold hover:text-red-800 transition-colors"
          >
            {showArchived ? "▼" : "▶"} 📋 Good Site ({archivedLeads.length}) - {showArchived ? "Hide" : "Show"}
          </button>

          {showArchived && (
            <div className="mt-4 space-y-2 bg-red-50 border border-red-200 rounded-lg p-4">
              {archivedLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 bg-white rounded border border-red-100 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/dashboard/leads/${lead.id}`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{lead.business_name}</p>
                    {lead.suburb && <p className="text-xs text-slate-500">{lead.suburb}</p>}
                  </div>
                  <span className="text-2xl">✅</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rejected Leads Section */}
      {rejectedLeads.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <button
            onClick={() => setShowRejected(!showRejected)}
            className="flex items-center gap-2 text-orange-700 font-semibold hover:text-orange-800 transition-colors"
          >
            {showRejected ? "▼" : "▶"} ❌ Rejeitados ({rejectedLeads.length}) - {showRejected ? "Hide" : "Show"}
          </button>

          {showRejected && (
            <div className="mt-4 space-y-2 bg-orange-50 border border-orange-200 rounded-lg p-4">
              {rejectedLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 bg-white rounded border border-orange-100 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/dashboard/leads/${lead.id}`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{lead.business_name}</p>
                    {lead.suburb && <p className="text-xs text-slate-500">{lead.suburb}</p>}
                  </div>
                  <span className="text-2xl">❌</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Response Leads Section */}
      {noResponseLeads.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <button
            onClick={() => setShowNoResponse(!showNoResponse)}
            className="flex items-center gap-2 text-yellow-700 font-semibold hover:text-yellow-800 transition-colors"
          >
            {showNoResponse ? "▼" : "▶"} ⏳ Sem Resposta ({noResponseLeads.length}) - {showNoResponse ? "Hide" : "Show"}
          </button>

          {showNoResponse && (
            <div className="mt-4 space-y-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              {noResponseLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 bg-white rounded border border-yellow-100 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/dashboard/leads/${lead.id}`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{lead.business_name}</p>
                    {lead.suburb && <p className="text-xs text-slate-500">{lead.suburb}</p>}
                  </div>
                  <span className="text-2xl">⏳</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Instagram Founded Section */}
      {noInstagramLeads.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <button
            onClick={() => setShowNoInstagram(!showNoInstagram)}
            className="flex items-center gap-2 text-slate-700 font-semibold hover:text-slate-800 transition-colors"
          >
            {showNoInstagram ? "▼" : "▶"} 📱 No Instagram Founded ({noInstagramLeads.length}) - {showNoInstagram ? "Hide" : "Show"}
          </button>

          {showNoInstagram && (
            <div className="mt-4 space-y-2 bg-slate-50 border border-slate-300 rounded-lg p-4">
              {noInstagramLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 bg-white rounded border border-slate-200 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/dashboard/leads/${lead.id}`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{lead.business_name}</p>
                    {lead.suburb && <p className="text-xs text-slate-500">{lead.suburb}</p>}
                    {lead.phone && <p className="text-xs text-slate-500">📞 {lead.phone}</p>}
                  </div>
                  <span className="text-2xl">📱</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <LeadDetailModal
        leadId={selectedLeadId || ""}
        isOpen={!!selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        onLeadClassified={handleLeadClassified}
      />

      <SearchLeadsModal
        open={showSearch}
        leads={data}
        onClose={() => setShowSearch(false)}
        onSelectLead={handleSelectLead}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
