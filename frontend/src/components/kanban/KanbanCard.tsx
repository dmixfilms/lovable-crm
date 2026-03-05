"use client"
import { Draggable } from "@hello-pangea/dnd"
import { Lead } from "@/types/index"
import { useRouter } from "next/navigation"
import { useTasks } from "@/hooks/useTasks"
import { useMoveLead, useGenerateLovableUrl } from "@/hooks/useLeads"
import { getLovablePrompt, renderPrompt } from "@/lib/lovablePrompt"
import PreviewExpiryBadge from "./PreviewExpiryBadge"

interface KanbanCardProps {
  lead: Lead
  index: number
  onToast?: (message: string, type: "success" | "error") => void
  onSelectLead?: (lead: Lead) => void
}

export default function KanbanCard({ lead, index, onToast, onSelectLead }: KanbanCardProps) {
  const router = useRouter()
  const { data: tasks = [] } = useTasks(lead.id)
  const pendingTasks = Array.isArray(tasks) ? tasks.filter((t: any) => !t.is_done) : []
  const moveLead = useMoveLead()
  const generateLovableUrl = useGenerateLovableUrl()

  // Check if card was recently moved (last 5 minutes)
  const isReccentlyMoved = () => {
    if (!lead.status_changed_at) return false
    const changedAt = new Date(lead.status_changed_at)
    const now = new Date()
    const minutesAgo = (now.getTime() - changedAt.getTime()) / (1000 * 60)
    return minutesAgo < 5
  }

  const handleClick = () => {
    if (onSelectLead) {
      onSelectLead(lead)
    } else {
      router.push(`/dashboard/leads/${lead.id}`)
    }
  }

  // Action handlers for each status
  const handleCreatePreview = (e: React.MouseEvent) => {
    e.stopPropagation()

    // Always get the LATEST prompt from localStorage (fresh read, no cache)
    const customPrompt = getLovablePrompt()
    console.log("📝 Using prompt:", customPrompt.substring(0, 100) + "...")

    const renderedPrompt = renderPrompt(customPrompt, {
      business_name: lead?.business_name,
      owner_name: lead?.owner_name,
      suburb: lead?.suburb,
      phone: lead?.phone,
      website_url: lead?.website_url,
      email: lead?.emails?.[0] || undefined,
      industry: lead?.industry_category,
      address: lead?.address,
      instagram: lead?.instagram_url,
    })

    console.log("🎨 Rendered prompt for Lovable:", renderedPrompt.substring(0, 100) + "...")

    generateLovableUrl.mutate({ id: lead.id, prompt: renderedPrompt }, {
      onSuccess: (data) => {
        onToast?.("🎨 Lovable aberto! Crie a preview do website...", "success")
        window.open(data.lovable_url, "_blank")
        // Move to PREVIEW_PENDING after opening Lovable
        moveLead.mutate({ id: lead.id, new_status: "PREVIEW_PENDING" })
      },
      onError: () => {
        onToast?.("Erro ao abrir Lovable", "error")
      },
    })
  }

  const handleMoveStatus = (newStatus: string, message: string) => {
    moveLead.mutate({ id: lead.id, new_status: newStatus }, {
      onSuccess: () => {
        onToast?.(message, "success")
      },
      onError: () => {
        onToast?.("Erro ao atualizar status", "error")
      },
    })
  }

  const handleSendSample = (e: React.MouseEvent) => {
    e.stopPropagation()
    moveLead.mutate({ id: lead.id, new_status: "SAMPLE_SENT" }, {
      onSuccess: () => {
        onToast?.("✅ Sample enviado! Abrindo chat...", "success")
        router.push(`/dashboard/leads/${lead.id}?tab=messages`)
      },
      onError: () => {
        onToast?.("Erro ao enviar sample", "error")
      },
    })
  }

  const handleSendPrice = (e: React.MouseEvent) => {
    e.stopPropagation()
    moveLead.mutate({ id: lead.id, new_status: "PRICE_SENT" }, {
      onSuccess: () => {
        onToast?.("💰 Preço enviado! Abrindo chat...", "success")
        router.push(`/dashboard/leads/${lead.id}?tab=messages`)
      },
      onError: () => {
        onToast?.("Erro ao enviar preço", "error")
      },
    })
  }

  const handleSendPaymentLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    moveLead.mutate({ id: lead.id, new_status: "PAYMENT_SENT" }, {
      onSuccess: () => {
        onToast?.("🔗 Link de pagamento enviado!", "success")
      },
      onError: () => {
        onToast?.("Erro ao enviar link de pagamento", "error")
      },
    })
  }

  const handleMarkPaid = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleMoveStatus("PAID", "💳 Marcado como pago!")
  }

  const handleDeliver = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleMoveStatus("DELIVERED", "🚀 Entregue!")
  }

  const handlePreviewReady = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleMoveStatus("PREVIEW_CREATED", "✨ Preview pronto!")
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
          <div className="absolute top-2 right-2 flex gap-1 items-center">
            {isReccentlyMoved() && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse shadow-lg">
                🆕 New
              </span>
            )}
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              lead.status_pipeline === "NEW_CAPTURED" ? "bg-blue-100 text-blue-800" :
              lead.status_pipeline === "HIGH_PRIORITY" ? "bg-green-100 text-green-700" :
              lead.status_pipeline === "MEDIUM_PRIORITY" ? "bg-yellow-100 text-yellow-700" :
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

          {/* Preview Expiry Badge */}
          {lead.active_preview && !lead.active_preview.is_archived && (
            <div className="mb-2">
              <PreviewExpiryBadge preview={lead.active_preview} />
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

          {/* Quick Action Buttons - Status-based */}
          <div className="mt-3 pt-2 border-t border-slate-200 flex gap-1 flex-wrap">
            {(lead.status_pipeline === "HIGH_PRIORITY" || lead.status_pipeline === "MEDIUM_PRIORITY") && (
              <button
                onClick={handleCreatePreview}
                disabled={generateLovableUrl.isPending}
                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:bg-gray-200 transition-colors font-medium flex-1 min-w-max"
                title="Criar preview com Lovable e mover para PREVIEW_PENDING"
              >
                📸 Preview →
              </button>
            )}

            {lead.status_pipeline === "PREVIEW_PENDING" && (
              <button
                onClick={handlePreviewReady}
                disabled={moveLead.isPending}
                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:bg-gray-200 transition-colors font-medium flex-1 min-w-max"
                title="Preview pronto, mover para PREVIEW_CREATED"
              >
                ✅ Pronto →
              </button>
            )}

            {lead.status_pipeline === "PREVIEW_CREATED" && (
              <button
                onClick={handleSendSample}
                disabled={moveLead.isPending}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:bg-gray-200 transition-colors font-medium flex-1 min-w-max"
                title="Enviar sample e abrir chat"
              >
                💬 Sample →
              </button>
            )}

            {lead.status_pipeline === "SAMPLE_SENT" && (
              <button
                onClick={handleSendPrice}
                disabled={moveLead.isPending}
                className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 disabled:bg-gray-200 transition-colors font-medium flex-1 min-w-max"
                title="Enviar preço"
              >
                💰 Preço →
              </button>
            )}

            {lead.status_pipeline === "PRICE_SENT" && (
              <button
                onClick={handleSendPaymentLink}
                disabled={moveLead.isPending}
                className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:bg-gray-200 transition-colors font-medium flex-1 min-w-max"
                title="Enviar link de pagamento"
              >
                🔗 Link Pag. →
              </button>
            )}

            {lead.status_pipeline === "PAYMENT_SENT" && (
              <button
                onClick={handleMarkPaid}
                disabled={moveLead.isPending}
                className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 disabled:bg-gray-200 transition-colors font-medium flex-1 min-w-max"
                title="Marcar como pago"
              >
                ✅ Pago →
              </button>
            )}

            {lead.status_pipeline === "PAID" && (
              <button
                onClick={handleDeliver}
                disabled={moveLead.isPending}
                className="text-xs px-2 py-1 bg-rose-100 text-rose-700 rounded hover:bg-rose-200 disabled:bg-gray-200 transition-colors font-medium flex-1 min-w-max"
                title="Marcar como entregue"
              >
                🚀 Entregar →
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
