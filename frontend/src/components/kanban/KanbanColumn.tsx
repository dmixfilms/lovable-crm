"use client"
import { Droppable, DroppableProvided, DroppableStateSnapshot } from "@hello-pangea/dnd"
import KanbanCard from "./KanbanCard"
import { Lead } from "@/types/index"

interface KanbanColumnProps {
  status: string
  displayName?: string
  leads: Lead[]
  onToast?: (message: string, type: "success" | "error") => void
  onSelectLead?: (lead: Lead) => void
  totalLeads?: number
  isLoadMoreVisible?: boolean
  onLoadMore?: () => void
}

export default function KanbanColumn({ status, displayName, leads, onToast, onSelectLead, totalLeads = 0, isLoadMoreVisible = false, onLoadMore }: KanbanColumnProps) {
  return (
    <Droppable droppableId={status}>
      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`w-60 flex-shrink-0 rounded-lg p-4 min-h-96 transition-colors ${
            snapshot.isDraggingOver ? "bg-slate-100" : "bg-white border border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900 text-sm">{displayName || status.replace(/_/g, " ")}</h2>
            <span className="bg-slate-200 text-slate-800 rounded-full px-2 py-0.5 text-xs font-semibold">
              {leads.length}
            </span>
          </div>
          <div className="space-y-2">
            {leads.map((lead, index) => (
              <KanbanCard key={lead.id} lead={lead} index={index} onToast={onToast} onSelectLead={onSelectLead} />
            ))}
            {isLoadMoreVisible && (
              <button
                onClick={onLoadMore}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium text-sm"
              >
                +50 mais ({leads.length}/{totalLeads})
              </button>
            )}
          </div>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}
