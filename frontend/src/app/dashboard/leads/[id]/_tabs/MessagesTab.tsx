"use client"
import { useState } from "react"
import { useMessages, useSendMessage } from "@/hooks/useMessages"
import { useTemplates } from "@/hooks/useTemplates"
import { Lead } from "@/types/index"

interface MessagesTabProps {
  leadId: string
  lead: Lead
  onSaved: (msg: string) => void
}

export default function MessagesTab({ leadId, lead, onSaved }: MessagesTabProps) {
  const { data: messages = [] } = useMessages(leadId)
  const { data: templates = [] } = useTemplates()
  const sendMessage = useSendMessage(leadId)

  const [showCompose, setShowCompose] = useState(false)
  const [form, setForm] = useState({
    channel: "EMAIL",
    to_address: lead.emails?.[0] || "",
    body_rendered: "",
    template_id: "",
  })

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return

    let body = template.body
    // Replace variables with actual lead data
    body = body.replace(/\{\{business_name\}\}/g, lead.business_name || "")
    body = body.replace(/\{\{owner_name\}\}/g, lead.owner_name || "")
    body = body.replace(/\{\{suburb\}\}/g, lead.suburb || "")
    body = body.replace(/\{\{phone\}\}/g, lead.phone || "")
    body = body.replace(/\{\{website_url\}\}/g, lead.website_url || "")
    // Keep unmatched variables as-is
    // body = body.replace(/\{\{preview_url\}\}/g, "{{preview_url}}")
    // body = body.replace(/\{\{quoted_price\}\}/g, "{{quoted_price}}")

    setForm({ ...form, template_id: templateId, body_rendered: body })
  }

  const handleSend = () => {
    if (!form.to_address || !form.body_rendered) return
    console.log("📤 Sending message:", { ...form, leadId })
    sendMessage.mutate(form, {
      onSuccess: (data) => {
        console.log("✅ Message sent successfully:", data)
        setShowCompose(false)
        setForm({ channel: "EMAIL", to_address: lead.emails?.[0] || "", body_rendered: "", template_id: "" })
        onSaved("✅ Message sent successfully!")
      },
      onError: (error) => {
        console.error("❌ Error sending message:", error)
        onSaved("❌ Error sending message")
      }
    })
  }

  return (
    <div className="space-y-6">
      {!showCompose ? (
        <button
          onClick={() => setShowCompose(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          + Compose Message
        </button>
      ) : (
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Channel</label>
            <select
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="EMAIL">Email</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="SMS">SMS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">To</label>
            <input
              type="text"
              value={form.to_address}
              onChange={(e) => setForm({ ...form, to_address: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Template (optional)</label>
            <select
              value={form.template_id}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Choose a template...</option>
              {templates
                .filter((t) => {
                  if (form.channel === "EMAIL") return t.channel === "EMAIL"
                  if (form.channel === "INSTAGRAM") return t.channel === "INSTAGRAM"
                  return t.channel === form.channel
                })
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
            <textarea
              value={form.body_rendered}
              onChange={(e) => setForm({ ...form, body_rendered: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSend}
              disabled={sendMessage.isPending || !form.to_address || !form.body_rendered}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium flex items-center gap-2"
            >
              {sendMessage.isPending ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  Sending...
                </>
              ) : (
                <>✅ Send</>
              )}
            </button>
            <button
              onClick={() => setShowCompose(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No messages yet</p>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">ℹ️ Info:</span> Messages are recorded in the system. For actual email/Instagram delivery, configure your email service (SendGrid, AWS SES, etc).
            </p>
          </div>
          <p className="text-sm text-slate-600 mb-2">📬 Message History ({messages.length})</p>
          {messages.map((message) => (
            <div key={message.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded">
                    {message.channel === "EMAIL" ? "📧" : message.channel === "INSTAGRAM" ? "📸" : "💬"} {message.channel}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      message.status === "SENT"
                        ? "bg-green-100 text-green-800"
                        : message.status === "FAILED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {message.status === "SENT" ? "✅ Sent" : message.status === "FAILED" ? "❌ Failed" : "⏳ Draft"}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    {new Date(message.created_at).toLocaleDateString()} {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                  {message.sent_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Sent: {new Date(message.sent_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="mb-2 p-3 bg-slate-50 rounded border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">
                  <span className="font-semibold">To:</span> {message.to_address}
                </p>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{message.body_rendered}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
