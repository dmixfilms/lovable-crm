"use client"
import { useState } from "react"
import { useUpdateLead, useMoveLead } from "@/hooks/useLeads"
import { useQueryClient } from "@tanstack/react-query"
import { Lead } from "@/types/index"

interface OverviewTabProps {
  lead: Lead
  onSaved: (msg: string) => void
  onError: (msg: string) => void
}

export default function OverviewTab({ lead, onSaved, onError }: OverviewTabProps) {
  const [form, setForm] = useState(lead)
  const [isDirty, setIsDirty] = useState(false)
  const [searchingInstagram, setSearchingInstagram] = useState(false)
  const updateLead = useUpdateLead(lead.id)
  const moveLead = useMoveLead()
  const qc = useQueryClient()

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const handleSave = () => {
    updateLead.mutate(form, {
      onSuccess: () => {
        setIsDirty(false)
        onSaved("Lead updated")
      },
      onError: () => onError("Failed to update lead"),
    })
  }


  const handleSearchInstagram = async () => {
    setSearchingInstagram(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
      const response = await fetch(`/api/proxy/leads/${lead.id}/search-instagram`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      })

      const result = await response.json()

      if (result.success && result.address_match) {
        setForm((prev) => ({
          ...prev,
          instagram_url: result.instagram_url,
          phone: result.phone || prev.phone,
        }))
        setIsDirty(true)
        onSaved(`✅ Instagram encontrado! ${result.phone ? "Telefone também salvo!" : ""}`)
        qc.invalidateQueries({ queryKey: ["lead", lead.id] })
      } else if (!result.success && result.candidates && result.candidates.length > 0) {
        onError(`Encontrados ${result.candidates.length} perfil(is), mas sem match exato. Verifique manualmente.`)
      } else {
        // Não encontrou - mover para INSTAGRAM_NOT_FOUND
        moveLead.mutate(
          { id: lead.id, new_status: "INSTAGRAM_NOT_FOUND" },
          {
            onSuccess: () => {
              onError(`📱 Não encontrado. Lead movido para "No Instagram Founded" tab para busca manual.`)
            },
            onError: () => {
              onError(`Não encontrado: ${result.error}`)
            },
          }
        )
      }
    } catch (error) {
      onError("Erro ao buscar Instagram")
    } finally {
      setSearchingInstagram(false)
    }
  }

  const fields = [
    { key: "business_name", label: "Business Name" },
    { key: "owner_name", label: "Owner Name" },
    { key: "suburb", label: "Suburb" },
    { key: "address", label: "Address" },
    { key: "phone", label: "Phone" },
    { key: "website_url", label: "Website URL" },
    { key: "instagram_url", label: "Instagram URL" },
    { key: "industry_category", label: "Industry" },
  ]

  const handleEmailChange = (email: string) => {
    const newEmails = email ? [email] : []
    setForm((prev) => ({ ...prev, emails: newEmails }))
    setIsDirty(true)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-slate-700 mb-2">{field.label}</label>
            {field.key === "instagram_url" ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={(form as any)[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={field.label}
                />
                <button
                  onClick={handleSearchInstagram}
                  disabled={searchingInstagram}
                  title="Buscar Instagram automaticamente"
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-400 transition-colors font-medium min-w-fit"
                >
                  {searchingInstagram ? "⏳" : "🔍"}
                </button>
              </div>
            ) : (
              <input
                type="text"
                value={(form as any)[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={field.label}
              />
            )}
          </div>
        ))}

        {/* Email field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
          <input
            type="email"
            value={form.emails?.[0] || ""}
            onChange={(e) => handleEmailChange(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="email@example.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
        <textarea
          value={form.notes || ""}
          onChange={(e) => handleChange("notes", e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
          placeholder="Add notes about this lead"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!isDirty || updateLead.isPending}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium"
        >
          {updateLead.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  )
}
