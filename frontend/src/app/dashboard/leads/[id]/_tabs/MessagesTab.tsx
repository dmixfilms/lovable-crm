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

  const [channel, setChannel] = useState<"EMAIL" | "INSTAGRAM" | "SMS">("EMAIL")
  const [showCompose, setShowCompose] = useState(false)
  const [form, setForm] = useState({
    channel: "EMAIL",
    to_address: lead.emails?.[0] || "",
    body_rendered: "",
    template_id: "",
  })

  // Helper to render message with lead data
  const renderTemplate = (body: string): string => {
    let rendered = body
    rendered = rendered.replace(/\{\{business_name\}\}/g, lead.business_name || "")
    rendered = rendered.replace(/\{\{owner_name\}\}/g, lead.owner_name || "")
    rendered = rendered.replace(/\{\{suburb\}\}/g, lead.suburb || "")
    rendered = rendered.replace(/\{\{phone\}\}/g, lead.phone || "")
    rendered = rendered.replace(/\{\{website_url\}\}/g, lead.website_url || "")
    return rendered
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return
    const body = renderTemplate(template.body)
    setForm({ ...form, template_id: templateId, body_rendered: body })
  }

  const handleSend = () => {
    if (!form.to_address || !form.body_rendered) return
    sendMessage.mutate(form, {
      onSuccess: () => {
        setShowCompose(false)
        setForm({ channel: "EMAIL", to_address: lead.emails?.[0] || "", body_rendered: "", template_id: "" })
        onSaved("✅ Message sent successfully!")
      },
      onError: () => {
        onSaved("❌ Error sending message")
      }
    })
  }

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        onSaved("✅ Copied to clipboard!")
      }).catch(() => {
        onSaved("Failed to copy")
      })
    } else {
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand("copy")
        onSaved("✅ Copied to clipboard!")
      } catch {
        onSaved("Failed to copy")
      }
      document.body.removeChild(textArea)
    }
  }

  const isInstagram = channel === "INSTAGRAM"
  const instagramTemplates = templates.filter((t) => t.channel === "INSTAGRAM")
  const emailTemplates = templates.filter((t) => t.channel === "EMAIL")

  // INSTAGRAM VIEW - Quick copy interface
  if (isInstagram && !showCompose) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={() => setChannel("EMAIL")}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors font-medium"
          >
            📧 Email
          </button>
          <button
            onClick={() => setShowCompose(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            + Custom Message
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 <span className="font-semibold">Instagram Quick Copy:</span> Click any message to copy. Then paste in Instagram DM.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {instagramTemplates.map((template) => {
            const rendered = renderTemplate(template.body)
            return (
              <button
                key={template.id}
                onClick={() => copyToClipboard(rendered)}
                className="text-left p-4 bg-gradient-to-br from-pink-50 to-orange-50 border border-pink-200 rounded-lg hover:shadow-md hover:border-pink-400 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-semibold text-pink-900">{template.name}</span>
                  <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity">📋 Copy</span>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-4">{rendered}</p>
                <p className="text-xs text-slate-500 mt-2 opacity-75">Click to copy to clipboard</p>
              </button>
            )
          })}
        </div>

        {messages.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <p className="text-sm font-semibold text-slate-700">📬 Sent Messages ({messages.length})</p>
            {messages.filter(m => m.channel === "INSTAGRAM").map((message) => (
              <div key={message.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600">
                    {new Date(message.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded">✅ Copied</span>
                </div>
                <p className="text-xs text-slate-700 whitespace-pre-wrap">{message.body_rendered}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // EMAIL/SMS VIEW - Normal compose interface
  return (
    <div className="space-y-6">
      {!showCompose ? (
        <div className="flex gap-3">
          {channel === "INSTAGRAM" && (
            <button
              onClick={() => setChannel("EMAIL")}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors font-medium"
            >
              Back to Instagram
            </button>
          )}
          {channel !== "INSTAGRAM" && (
            <>
              <button
                onClick={() => setChannel("INSTAGRAM")}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors font-medium"
              >
                📸 Instagram Quick Mode
              </button>
              <button
                onClick={() => setShowCompose(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                + Compose Message
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Channel</label>
            <select
              value={form.channel}
              onChange={(e) => {
                setForm({ ...form, channel: e.target.value as any })
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="EMAIL">📧 Email</option>
              <option value="SMS">💬 SMS</option>
              <option value="INSTAGRAM">📸 Instagram</option>
            </select>
          </div>

          {form.channel !== "INSTAGRAM" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">To</label>
              <input
                type="text"
                value={form.to_address}
                onChange={(e) => setForm({ ...form, to_address: e.target.value })}
                placeholder={form.channel === "EMAIL" ? "email@example.com" : "Phone number"}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Template (optional)</label>
            <select
              value={form.template_id}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Choose a template...</option>
              {(form.channel === "EMAIL" ? emailTemplates : instagramTemplates).map((t) => (
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
              disabled={sendMessage.isPending || (form.channel !== "INSTAGRAM" && !form.to_address) || !form.body_rendered}
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

      {!isInstagram && messages.length > 0 && (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">ℹ️ Info:</span> Messages are recorded in the system. For actual email/SMS delivery, configure your email service.
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
                    {new Date(message.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {message.to_address && (
                <div className="mb-2 p-3 bg-slate-50 rounded border border-slate-200">
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold">To:</span> {message.to_address}
                  </p>
                </div>
              )}
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{message.body_rendered}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
