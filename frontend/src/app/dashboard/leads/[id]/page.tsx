"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import * as Tabs from "@radix-ui/react-tabs"
import { useLead, useGenerateLovableUrl, useSetLeadPriority } from "@/hooks/useLeads"
import StatusBadge from "@/components/ui/StatusBadge"
import Toast from "@/components/ui/Toast"
import { getLovablePrompt, renderPrompt } from "@/lib/lovablePrompt"
import { useQueryClient } from "@tanstack/react-query"
import OverviewTab from "./_tabs/OverviewTab"
import TasksTab from "./_tabs/TasksTab"
import DealTab from "./_tabs/DealTab"
import PreviewTab from "./_tabs/PreviewTab"
import MessagesTab from "./_tabs/MessagesTab"

export default function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[]>>
}) {
  const { id } = use(params)
  const sp = use(searchParams || Promise.resolve({})) as Record<string, string | string[]>
  const router = useRouter()
  const qc = useQueryClient()
  const { data: lead, isLoading } = useLead(id)
  const generateLovableUrl = useGenerateLovableUrl()
  const setLeadPriority = useSetLeadPriority()
  const [activeTab, setActiveTab] = useState((sp?.tab as string) || "overview")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const handleOpenWebsite = () => {
    if (lead?.website_url) {
      window.open(lead.website_url, "_blank")
    }
  }

  const handleStartLovableDevelopment = () => {
    // Get custom prompt from localStorage
    const customPrompt = getLovablePrompt()

    // Render prompt with lead data
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

    generateLovableUrl.mutate({ id, prompt: renderedPrompt }, {
      onSuccess: (data) => {
        setToast({ message: "Abrindo Lovable para criar o website...", type: "success" })
        // Open directly
        window.open(data.lovable_url, "_blank")
      },
      onError: (error) => {
        console.error("Error generating Lovable URL:", error)
        setToast({ message: "Erro ao gerar URL do Lovable", type: "error" })
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
          <p className="text-slate-600">Loading lead...</p>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Lead not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/leads" className="text-purple-600 hover:text-purple-700">
          Leads
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-600">{lead.business_name}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{lead.business_name}</h1>
            {lead.suburb && <p className="text-slate-600 mt-2">{lead.suburb}</p>}
          </div>
          <StatusBadge status={lead.status_pipeline} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-200 flex-wrap">
          {/* Priority Buttons - Only show for NEW_CAPTURED */}
          {lead.status_pipeline === "NEW_CAPTURED" && (
            <>
              <div className="flex gap-2 items-center text-sm text-slate-600 mr-2">
                <span>📊 Classification:</span>
              </div>
              <button
                onClick={() => {
                  setLeadPriority.mutate({ id, priority: "HIGH_PRIORITY" }, {
                    onSuccess: () => {
                      setToast({ message: "Lead classified as High Priority - No Website 🔥", type: "success" })
                      qc.invalidateQueries({ queryKey: ["lead", id] })
                      setTimeout(() => {
                        router.push("/dashboard/leads")
                      }, 500)
                    }
                  })
                }}
                disabled={setLeadPriority.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors font-medium flex items-center gap-2 text-sm"
                title="No website, only Instagram - High potential client"
              >
                🔥 No Website
              </button>
              <button
                onClick={() => {
                  setLeadPriority.mutate({ id, priority: "MEDIUM_PRIORITY" }, {
                    onSuccess: () => {
                      setToast({ message: "Lead classified as Medium Priority - Outdated Site 📌", type: "success" })
                      qc.invalidateQueries({ queryKey: ["lead", id] })
                      setTimeout(() => {
                        router.push("/dashboard/leads")
                      }, 500)
                    }
                  })
                }}
                disabled={setLeadPriority.isPending}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-400 transition-colors font-medium flex items-center gap-2 text-sm"
                title="Has outdated website - Medium potential"
              >
                📌 Outdated Site
              </button>
              <button
                onClick={() => {
                  setLeadPriority.mutate({ id, priority: "LOW_PRIORITY" }, {
                    onSuccess: () => {
                      setToast({ message: "Lead classified as Low Priority - Already has good site ✅", type: "success" })
                      qc.invalidateQueries({ queryKey: ["lead", id] })
                      setTimeout(() => {
                        router.push("/dashboard/leads")
                      }, 500)
                    }
                  })
                }}
                disabled={setLeadPriority.isPending}
                className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 disabled:bg-gray-400 transition-colors font-medium flex items-center gap-2 text-sm"
                title="Has good website already - Not needed right now"
              >
                ✅ Good Site
              </button>
            </>
          )}

          {/* Start Lovable Development - Show for HIGH and MEDIUM priority */}
          {(lead.status_pipeline === "HIGH_PRIORITY" || lead.status_pipeline === "MEDIUM_PRIORITY") && (
            <button
              onClick={handleStartLovableDevelopment}
              disabled={generateLovableUrl.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium flex items-center gap-2"
              title="Criar website preview com Lovable"
            >
              {generateLovableUrl.isPending ? "⏳ Abrindo..." : "🚀 Criar com Lovable"}
            </button>
          )}

          {/* Website Button */}
          {lead.website_url && (
            <button
              onClick={handleOpenWebsite}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 ml-auto"
              title="Abrir website em nova aba"
            >
              🌐 Ver Site
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex border-b border-slate-200 bg-white rounded-t-lg">
          <Tabs.Trigger
            value="overview"
            className="px-6 py-3 font-medium text-slate-600 hover:text-slate-900 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 transition-colors"
          >
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="tasks"
            className="px-6 py-3 font-medium text-slate-600 hover:text-slate-900 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 transition-colors"
          >
            Tasks
          </Tabs.Trigger>
          <Tabs.Trigger
            value="deal"
            className="px-6 py-3 font-medium text-slate-600 hover:text-slate-900 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 transition-colors"
          >
            Deal
          </Tabs.Trigger>
          <Tabs.Trigger
            value="preview"
            className="px-6 py-3 font-medium text-slate-600 hover:text-slate-900 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 transition-colors"
          >
            Preview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="messages"
            className="px-6 py-3 font-medium text-slate-600 hover:text-slate-900 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 transition-colors"
          >
            Messages
          </Tabs.Trigger>
        </Tabs.List>

        <div className="bg-white rounded-b-lg shadow">
          <Tabs.Content value="overview" className="p-6">
            <OverviewTab
              lead={lead}
              onSaved={(msg) => setToast({ message: msg, type: "success" })}
              onError={(msg) => setToast({ message: msg, type: "error" })}
            />
          </Tabs.Content>

          <Tabs.Content value="tasks" className="p-6">
            <TasksTab leadId={id} onSaved={(msg) => setToast({ message: msg, type: "success" })} />
          </Tabs.Content>

          <Tabs.Content value="deal" className="p-6">
            <DealTab leadId={id} onSaved={(msg) => setToast({ message: msg, type: "success" })} />
          </Tabs.Content>

          <Tabs.Content value="preview" className="p-6">
            <PreviewTab leadId={id} onSaved={(msg) => setToast({ message: msg, type: "success" })} />
          </Tabs.Content>

          <Tabs.Content value="messages" className="p-6">
            <MessagesTab leadId={id} lead={lead} onSaved={(msg) => setToast({ message: msg, type: "success" })} />
          </Tabs.Content>
        </div>
      </Tabs.Root>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
