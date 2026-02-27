"use client"

import { useState, useMemo } from "react"
import { DragDropContext, DropResult } from "@hello-pangea/dnd"
import { useLeads, useMoveLead } from "@/hooks/useLeads"
import KanbanColumn from "@/components/kanban/KanbanColumn"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import Toast from "@/components/ui/Toast"
import { Lead } from "@/types/index"

const ACTIVE_STATUSES = [
  "NEW_CAPTURED",
  "HIGH_PRIORITY",
  "MEDIUM_PRIORITY",
  "PREVIEW_PENDING",
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
  "PREVIEW_PENDING": "SENT PREVIEW",
  "SAMPLE_SENT": "SENT LINK",
  "PRICE_SENT": "SENT PRICE",
  "PAYMENT_SENT": "SENT CONFIRMATION",
  "DELIVERED": "DONE",
}

export default function LeadsPage() {
  const { data: leadsResponse, isLoading, refetch } = useLeads({ limit: 500 })
  const moveLead = useMoveLead()

  const [confirmMove, setConfirmMove] = useState<{
    leadId: string
    targetStatus: string
    sourceStatus: string
  } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [showArchived, setShowArchived] = useState(false)

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
    const sourceStatus = source.droppableId

    // Open confirmation dialog
    setConfirmMove({ leadId, targetStatus, sourceStatus })
  }

  const handleConfirmMove = () => {
    if (!confirmMove) return

    moveLead.mutate(
      { id: confirmMove.leadId, new_status: confirmMove.targetStatus },
      {
        onError: () => {
          setToast({ message: "Failed to move lead", type: "error" })
        },
        onSuccess: () => {
          setToast({ message: "Lead moved successfully", type: "success" })
        },
      }
    )
    setConfirmMove(null)
  }

  const handleCancelMove = () => {
    setConfirmMove(null)
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

  const columnsData = ACTIVE_STATUSES.map((status) => ({
    status,
    leads: columns[status] || [],
  }))

  // Extract archived leads (LOW_PRIORITY / Good Site)
  const archivedLeads = data.filter((lead) => lead.status_pipeline === "LOW_PRIORITY")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Leads</h1>
        <p className="text-slate-600 mt-2">Manage your sales pipeline with drag and drop</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columnsData.map((column) => (
            <KanbanColumn
              key={column.status}
              status={column.status}
              displayName={STATUS_DISPLAY_NAMES[column.status]}
              leads={column.leads}
            />
          ))}
        </div>
      </DragDropContext>

      <ConfirmDialog
        open={!!confirmMove}
        title="Move Lead"
        message={`Move this lead to ${confirmMove?.targetStatus.replace(/_/g, " ")}?`}
        confirmLabel="Move"
        cancelLabel="Cancel"
        onConfirm={handleConfirmMove}
        onCancel={handleCancelMove}
      />

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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
