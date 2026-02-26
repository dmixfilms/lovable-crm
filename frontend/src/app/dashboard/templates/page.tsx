"use client"

import { useState, useRef } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from "@/hooks/useTemplates"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import Toast from "@/components/ui/Toast"
import { MessageTemplate } from "@/types/index"

const CHANNELS = ["EMAIL", "INSTAGRAM", "SMS"]
const VARIABLES = ["{{business_name}}", "{{owner_name}}", "{{suburb}}", "{{phone}}", "{{website_url}}", "{{preview_url}}", "{{quoted_price}}"]

export default function TemplatesPage() {
  const { data: templates = [] } = useTemplates()
  const createTemplate = useCreateTemplate()
  const updateTemplate = useUpdateTemplate()
  const deleteTemplate = useDeleteTemplate()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const [form, setForm] = useState({
    name: "",
    channel: "EMAIL",
    subject: "",
    body: "",
  })

  const handleNewTemplate = () => {
    setEditingTemplate(null)
    setForm({ name: "", channel: "EMAIL", subject: "", body: "" })
    setModalOpen(true)
  }

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template)
    setForm({
      name: template.name,
      channel: template.channel,
      subject: template.subject || "",
      body: template.body,
    })
    setModalOpen(true)
  }

  const handleSaveTemplate = () => {
    if (!form.name || !form.body) return

    const payload: any = {
      name: form.name,
      channel: form.channel,
      body: form.body,
    }
    if (form.channel === "EMAIL") payload.subject = form.subject

    if (editingTemplate) {
      updateTemplate.mutate({ id: editingTemplate.id, payload }, {
        onSuccess: () => {
          setModalOpen(false)
          setToast({ message: "Template updated", type: "success" })
        },
      })
    } else {
      createTemplate.mutate(payload, {
        onSuccess: () => {
          setModalOpen(false)
          setToast({ message: "Template created", type: "success" })
        },
      })
    }
  }

  const handleVariableInsert = (variable: string) => {
    if (!bodyRef.current) return
    const start = bodyRef.current.selectionStart
    const end = bodyRef.current.selectionEnd
    const newBody = form.body.slice(0, start) + variable + form.body.slice(end)
    setForm({ ...form, body: newBody })
  }

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return
    deleteTemplate.mutate(deleteConfirm.id, {
      onSuccess: () => {
        setDeleteConfirm(null)
        setToast({ message: "Template deleted", type: "success" })
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Message Templates</h1>
          <p className="text-slate-600 mt-2">Create and manage email and social media templates</p>
        </div>
        <button
          onClick={handleNewTemplate}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          + New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
          <p className="text-slate-600 mb-4">No templates yet</p>
          <p className="text-sm text-slate-500">Create your first message template to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {template.channel} · {new Date(template.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded p-4 mb-4">
                <p className="text-sm text-slate-700 line-clamp-3">{template.body}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm({ id: template.id, name: template.name })}
                  className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto z-50">
            <div className="p-6 space-y-4">
              <Dialog.Title className="text-2xl font-bold text-slate-900">
                {editingTemplate ? "Edit Template" : "New Template"}
              </Dialog.Title>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Template Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Initial Pitch"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Channel</label>
                <select
                  value={form.channel}
                  onChange={(e) => setForm({ ...form, channel: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {CHANNELS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {form.channel === "EMAIL" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Email subject"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Body</label>
                <textarea
                  ref={bodyRef}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-64"
                  placeholder="Template body"
                />
                <div className="mt-2 flex gap-2 flex-wrap">
                  {VARIABLES.map((v) => (
                    <button
                      key={v}
                      onClick={() => handleVariableInsert(v)}
                      className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 justify-end">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={createTemplate.isPending || updateTemplate.isPending || !form.name || !form.body}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium"
                >
                  {editingTemplate ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Template"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"?`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        isDangerous
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
