"use client"
import { useState } from "react"
import { usePreviews, useCreatePreview, useArchivePreview } from "@/hooks/usePreviews"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { differenceInDays } from "date-fns"

interface PreviewTabProps {
  leadId: string
  onSaved: (msg: string) => void
}

export default function PreviewTab({ leadId, onSaved }: PreviewTabProps) {
  const { data: previews = [] } = usePreviews(leadId)
  const createPreview = useCreatePreview(leadId)
  const archivePreview = useArchivePreview(leadId)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    preview_url: "",
    expires_at: "",
    screenshot_url: "",
    old_website_url: ""
  })
  const [confirmArchive, setConfirmArchive] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setImagePreview(base64)
      setForm({ ...form, screenshot_url: base64 })
    }
    reader.readAsDataURL(file)
  }

  const handleAddPreview = () => {
    if (!form.preview_url || !form.expires_at) {
      onSaved("❌ Preview URL and Expiry date are required")
      return
    }
    console.log("📤 Creating preview:", form)
    createPreview.mutate(form, {
      onSuccess: (data) => {
        console.log("✅ Preview saved:", data)
        setForm({ preview_url: "", expires_at: "", screenshot_url: "", old_website_url: "" })
        setImagePreview("")
        setShowForm(false)
        onSaved("✅ Preview saved successfully!")
      },
      onError: (error: any) => {
        console.error("❌ Error saving preview:", error)
        onSaved(`❌ Error: ${error.message || "Failed to save preview"}`)
      }
    })
  }

  const handleArchiveConfirm = () => {
    if (!confirmArchive) return
    archivePreview.mutate({ previewId: confirmArchive }, {
      onSuccess: () => {
        setConfirmArchive(null)
        onSaved("Preview archived")
      },
    })
  }

  return (
    <div className="space-y-6">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          + Add Preview
        </button>
      ) : (
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Preview URL (Lovable)</label>
            <input
              type="url"
              value={form.preview_url}
              onChange={(e) => setForm({ ...form, preview_url: e.target.value })}
              placeholder="https://lovable.dev/..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Old Website URL (for comparison)</label>
            <input
              type="url"
              value={form.old_website_url}
              onChange={(e) => setForm({ ...form, old_website_url: e.target.value })}
              placeholder="https://example.com (current website)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Screenshot (New Design)</label>
            <div className="flex gap-3 items-start">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            {imagePreview && (
              <div className="mt-3">
                <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg border border-slate-300" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Expires At</label>
            <input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddPreview}
              disabled={createPreview.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {previews.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No previews yet</p>
      ) : (
        <div className="space-y-6">
          {previews.map((preview) => {
            const daysLeft = differenceInDays(new Date(preview.expires_at), new Date())
            return (
              <div key={preview.id} className="border border-slate-200 rounded-lg overflow-hidden">
                {/* Comparison View */}
                {preview.screenshot_url && preview.old_website_url && (
                  <div className="p-4 bg-slate-50">
                    <h4 className="font-semibold text-slate-900 mb-4">Comparison</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Old Website */}
                      <div>
                        <p className="text-xs font-medium text-slate-600 mb-2">Current Website</p>
                        <a
                          href={preview.old_website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={`https://screenshot.click/webshot?q=${encodeURIComponent(preview.old_website_url)}&w=400&h=400`}
                            alt="Old website"
                            className="w-full rounded border border-slate-300 hover:border-slate-400 transition-colors cursor-pointer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23f1f5f9' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='%2364748b' text-anchor='middle' dominant-baseline='middle'%3EWebsite preview unavailable%3C/text%3E%3C/svg%3E"
                            }}
                          />
                        </a>
                      </div>

                      {/* New Website */}
                      <div>
                        <p className="text-xs font-medium text-slate-600 mb-2">New Design</p>
                        {preview.screenshot_url.startsWith("data:") || preview.screenshot_url.startsWith("http") ? (
                          <img
                            src={preview.screenshot_url}
                            alt="New design"
                            className="w-full rounded border border-slate-300"
                          />
                        ) : (
                          <div className="w-full aspect-square bg-slate-200 rounded border border-slate-300 flex items-center justify-center">
                            <span className="text-xs text-slate-500">Image loading...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Lovable Preview</p>
                      <a
                        href={preview.preview_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 underline break-all text-sm mt-1"
                      >
                        {preview.preview_url}
                      </a>
                      <div className="mt-2 flex gap-2">
                        {preview.is_archived ? (
                          <span className="text-xs text-slate-500">Archived</span>
                        ) : daysLeft > 0 ? (
                          <span className="text-xs text-green-600">Expires in {daysLeft} days</span>
                        ) : (
                          <span className="text-xs text-red-600">Expired {Math.abs(daysLeft)} days ago</span>
                        )}
                      </div>
                    </div>
                    {!preview.is_archived && (
                      <button
                        onClick={() => setConfirmArchive(preview.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium ml-4"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmArchive}
        title="Archive Preview"
        message="Are you sure you want to archive this preview?"
        confirmLabel="Archive"
        onConfirm={handleArchiveConfirm}
        onCancel={() => setConfirmArchive(null)}
        isDangerous
      />
    </div>
  )
}
