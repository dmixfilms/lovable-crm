"use client"
import { useState } from "react"
import { useUpdateLead } from "@/hooks/useLeads"
import { Lead } from "@/types/index"

interface OverviewTabProps {
  lead: Lead
  onSaved: (msg: string) => void
  onError: (msg: string) => void
}

export default function OverviewTab({ lead, onSaved, onError }: OverviewTabProps) {
  const [form, setForm] = useState(lead)
  const [isDirty, setIsDirty] = useState(false)
  const updateLead = useUpdateLead(lead.id)

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-slate-700 mb-2">{field.label}</label>
            <input
              type="text"
              value={(form as any)[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={field.label}
            />
          </div>
        ))}
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
