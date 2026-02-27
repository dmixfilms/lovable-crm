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
  "LOW_PRIORITY",
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
