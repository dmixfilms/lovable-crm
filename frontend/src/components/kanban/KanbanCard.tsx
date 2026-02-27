"use client"
import { Draggable } from "@hello-pangea/dnd"
import { Lead } from "@/types/index"
import { useRouter } from "next/navigation"
import { useTasks } from "@/hooks/useTasks"

interface KanbanCardProps {
  lead: Lead
  index: number
}

export default function KanbanCard({ lead, index }: KanbanCardProps) {
  const router = useRouter()
  const { data: tasks = [] } = useTasks(lead.id)
  const pendingTasks = Array.isArray(tasks) ? tasks.filter((t: any) => !t.is_done) : []

  const handleClick = () => {
    router.push(`/dashboard/leads/${lead.id}`)
  }

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg shadow p-4 mb-3 cursor-move hover:shadow-md transition-shadow relative ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-purple-500" : ""
          }`}
          onClick={handleClick}
        >
          {/* Status Badge - Top Right */}
          <div className="absolute top-2 right-2">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              lead.status_pipeline === "NEW_CAPTURED" ? "bg-blue-100 text-blue-800" :
              lead.status_pipeline === "APPROVED" ? "bg-green-100 text-green-800" :
              lead.status_pipeline === "REJECTED" ? "bg-red-100 text-red-800" :
              "bg-slate-100 text-slate-800"
            }`}>
              {lead.status_pipeline.replace(/_/g, " ")}
            </span>
          </div>

          <h3 className="font-semibold text-slate-900 text-sm mb-2 truncate pr-24">{lead.business_name}</h3>
          {lead.suburb && <p className="text-xs text-slate-500 mb-1">{lead.suburb}</p>}
          {lead.phone && <p className="text-xs text-slate-500 mb-1">📞 {lead.phone}</p>}
          {lead.emails && lead.emails.length > 0 && (
            <p className="text-xs text-slate-500 mb-3 truncate">📧 {lead.emails[0]}</p>
          )}

          {/* Notes Badge */}
          {lead.notes && (
            <div className="mb-2">
              <div className="inline-flex bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-[10px] max-w-[95%]">
                <span className="truncate">{lead.notes}</span>
              </div>
            </div>
          )}

          {/* Tasks Display */}
          {pendingTasks.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-200">
              <div className="space-y-1">
                {pendingTasks.slice(0, 2).map((task: any) => (
                  <div key={task.id} className="flex items-start gap-1 text-[10px] text-slate-600">
                    <span className="text-slate-400 flex-shrink-0">•</span>
                    <span className="truncate">{task.notes || task.task_type}</span>
                  </div>
                ))}
                {pendingTasks.length > 2 && (
                  <div className="text-[9px] text-slate-500 font-semibold">
                    +{pendingTasks.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}
