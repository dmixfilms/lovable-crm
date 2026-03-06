"use client"

import { useState } from "react"
import { useLead, useGenerateLovableUrl, useSetLeadPriority } from "@/hooks/useLeads"
import StatusBadge from "@/components/ui/StatusBadge"
import Toast from "@/components/ui/Toast"
import { getLovablePrompt, renderPrompt } from "@/lib/lovablePrompt"
import { useQueryClient } from "@tanstack/react-query"
import * as Tabs from "@radix-ui/react-tabs"
import OverviewTab from "@/app/dashboard/leads/[id]/_tabs/OverviewTab"
import TasksTab from "@/app/dashboard/leads/[id]/_tabs/TasksTab"
import DealTab from "@/app/dashboard/leads/[id]/_tabs/DealTab"
import PreviewTab from "@/app/dashboard/leads/[id]/_tabs/PreviewTab"
import MessagesTab from "@/app/dashboard/leads/[id]/_tabs/MessagesTab"

interface LeadDetailModalProps {
  leadId: string
  isOpen: boolean
  onClose: () => void
  initialTab?: string
  onLeadClassified?: (currentLeadId: string, currentStatus: string) => string | null
}

export default function LeadDetailModal({
  leadId,
  isOpen,
  onClose,
  initialTab = "overview",
  onLeadClassified,
}: LeadDetailModalProps) {
  const qc = useQueryClient()
  const { data: lead, isLoading } = useLead(leadId)
  const generateLovableUrl = useGenerateLovableUrl()
  const setLeadPriority = useSetLeadPriority()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  if (!isOpen) return null

  const handleOpenWebsite = () => {
    if (lead?.website_url) {
      window.open(lead.website_url, "_blank")
    }
  }

  const handleLeadClassified = (newStatus: string) => {
    if (onLeadClassified && lead?.status_pipeline === "NEW_CAPTURED") {
      const nextLeadId = onLeadClassified(leadId, newStatus)
      if (nextLeadId) {
        // Load next lead without closing modal
        return nextLeadId
      }
    }
    // Close modal if no next lead or not from NEW_CAPTURED
    onClose()
    return null
  }

  const handleStartLovableDevelopment = () => {
    const customPrompt = getLovablePrompt()
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

    generateLovableUrl.mutate({ id: leadId, prompt: renderedPrompt }, {
      onSuccess: (data) => {
        setToast({ message: "Abrindo Lovable para criar o website...", type: "success" })
        window.open(data.lovable_url, "_self")
      },
      onError: (error) => {
        console.error("Error generating Lovable URL:", error)
        setToast({ message: "Erro ao gerar URL do Lovable", type: "error" })
      },
    })
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with close button */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
            <h2 className="text-2xl font-bold text-slate-900">
              {isLoading ? "Loading..." : lead?.business_name}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 transition-colors p-1 hover:bg-slate-200 rounded"
              title="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                  <p className="text-slate-600">Loading lead details...</p>
                </div>
              </div>
            ) : !lead ? (
              <div className="p-6">
                <p className="text-red-800">Lead not found</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Lead Header Info */}
                <div className="border-l-4 border-purple-600 pl-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {lead.suburb && <p className="text-slate-600 text-sm">{lead.suburb}</p>}
                    </div>
                    <StatusBadge status={lead.status_pipeline} />
                  </div>

                  {/* Action Buttons */}
                  {lead.status_pipeline === "NEW_CAPTURED" && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500">Classification:</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setLeadPriority.mutate({ id: leadId, priority: "HIGH_PRIORITY" }, {
                              onSuccess: () => {
                                setToast({ message: "Lead classified as High Priority - No Website 🔥", type: "success" })
                                qc.invalidateQueries({ queryKey: ["lead", leadId] })
                                qc.invalidateQueries({ queryKey: ["leads"] })
                                handleLeadClassified("HIGH_PRIORITY")
                              }
                            })
                          }}
                          disabled={setLeadPriority.isPending}
                          className="px-2.5 py-1.5 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 disabled:bg-gray-200 transition-colors font-semibold"
                        >
                          No Website
                        </button>
                        <button
                          onClick={() => {
                            setLeadPriority.mutate({ id: leadId, priority: "MEDIUM_PRIORITY" }, {
                              onSuccess: () => {
                                setToast({ message: "Lead classified as Medium Priority - Outdated Site 📌", type: "success" })
                                qc.invalidateQueries({ queryKey: ["lead", leadId] })
                                qc.invalidateQueries({ queryKey: ["leads"] })
                                handleLeadClassified("MEDIUM_PRIORITY")
                              }
                            })
                          }}
                          disabled={setLeadPriority.isPending}
                          className="px-2.5 py-1.5 bg-amber-100 text-amber-700 rounded text-xs hover:bg-amber-200 disabled:bg-gray-200 transition-colors font-semibold"
                        >
                          Outdated Site
                        </button>
                        <button
                          onClick={() => {
                            setLeadPriority.mutate({ id: leadId, priority: "LOW_PRIORITY" }, {
                              onSuccess: () => {
                                setToast({ message: "Lead classified as Low Priority - Already has good site ✅", type: "success" })
                                qc.invalidateQueries({ queryKey: ["lead", leadId] })
                                qc.invalidateQueries({ queryKey: ["leads"] })
                                handleLeadClassified("LOW_PRIORITY")
                              }
                            })
                          }}
                          disabled={setLeadPriority.isPending}
                          className="px-2.5 py-1.5 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 disabled:bg-gray-200 transition-colors font-semibold"
                        >
                          Good Site
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Start Lovable Development + Website Button */}
                  <div className="flex gap-2">
                    {(lead.status_pipeline === "HIGH_PRIORITY" || lead.status_pipeline === "MEDIUM_PRIORITY") && (
                      <button
                        onClick={handleStartLovableDevelopment}
                        disabled={generateLovableUrl.isPending}
                        className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium"
                      >
                        {generateLovableUrl.isPending ? "⏳ Abrindo..." : "🚀 Lovable"}
                      </button>
                    )}

                    {/* Website Button - Always on the right */}
                    {lead.website_url && (
                      <button
                        onClick={handleOpenWebsite}
                        className="ml-auto px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors font-medium"
                      >
                        🌐 Ver Site
                      </button>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                  <Tabs.List className="flex border-b border-slate-200 bg-white">
                    <Tabs.Trigger
                      value="overview"
                      className="px-6 py-3 font-medium text-slate-600 hover:text-slate-900 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 transition-colors text-sm"
                    >
                      Overview
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="tasks"
                      className="px-6 py-3 font-medium text-slate-600 hover:text-slate-900 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 transition-colors text-sm"
                    >
                      Tasks
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="deal"
                      className="px-6 py-3 font-medium text-slate-600 hover:text-slate-900 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 transition-colors text-sm"
                    >
                      Deal
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="preview"
                      className="px-6 py-3 font-medium text-slate-600 hover:text-slate-900 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 transition-colors text-sm"
                    >
                      Preview
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="messages"
                      className="px-6 py-3 font-medium text-slate-600 hover:text-slate-900 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 transition-colors text-sm"
                    >
                      Messages
                    </Tabs.Trigger>
                  </Tabs.List>

                  <div className="bg-white">
                    <Tabs.Content value="overview" className="p-6">
                      <OverviewTab
                        lead={lead}
                        onSaved={(msg) => setToast({ message: msg, type: "success" })}
                        onError={(msg) => setToast({ message: msg, type: "error" })}
                      />
                    </Tabs.Content>

                    <Tabs.Content value="tasks" className="p-6">
                      <TasksTab leadId={leadId} onSaved={(msg) => setToast({ message: msg, type: "success" })} />
                    </Tabs.Content>

                    <Tabs.Content value="deal" className="p-6">
                      <DealTab leadId={leadId} onSaved={(msg) => setToast({ message: msg, type: "success" })} />
                    </Tabs.Content>

                    <Tabs.Content value="preview" className="p-6">
                      <PreviewTab leadId={leadId} onSaved={(msg) => setToast({ message: msg, type: "success" })} />
                    </Tabs.Content>

                    <Tabs.Content value="messages" className="p-6">
                      <MessagesTab leadId={leadId} lead={lead} onSaved={(msg) => setToast({ message: msg, type: "success" })} />
                    </Tabs.Content>
                  </div>
                </Tabs.Root>
              </div>
            )}
          </div>

          {/* Toast */}
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
      </div>
    </>
  )
}
