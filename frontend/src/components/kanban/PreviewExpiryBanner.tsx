"use client"
import { useRouter } from "next/navigation"
import { Lead } from "@/types/index"
import { getPreviewDaysLeft } from "./PreviewExpiryBadge"

interface PreviewExpiryBannerProps {
  leads: Lead[]
}

export default function PreviewExpiryBanner({ leads }: PreviewExpiryBannerProps) {
  const router = useRouter()

  // Filter leads with expiring previews (non-archived, expiring within 2 days or expired)
  const expiringPreviews = leads
    .filter(
      (lead) =>
        lead.active_preview &&
        !lead.active_preview.is_archived &&
        getPreviewDaysLeft(lead.active_preview) <= 2
    )
    .map((lead) => ({
      lead,
      preview: lead.active_preview!,
      daysLeft: getPreviewDaysLeft(lead.active_preview!),
    }))
    // Sort by urgency: expired first, then by days left
    .sort((a, b) => a.daysLeft - b.daysLeft)

  if (expiringPreviews.length === 0) {
    return null
  }

  return (
    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🔔</span>
        <h3 className="font-semibold text-red-900">
          {expiringPreviews.length} preview(s) expiring soon
        </h3>
      </div>

      <div className="space-y-2">
        {expiringPreviews.map(({ lead, daysLeft }) => (
          <button
            key={lead.id}
            onClick={() => router.push(`/dashboard/leads/${lead.id}?tab=preview`)}
            className="w-full flex items-center justify-between p-3 bg-white rounded border border-red-200 hover:bg-red-50 transition-colors text-left"
          >
            <div className="flex-1">
              <p className="font-medium text-slate-900">{lead.business_name}</p>
              <p className="text-sm text-slate-600">{lead.suburb || "No suburb"}</p>
            </div>
            <div className="text-right ml-4">
              {daysLeft <= 0 ? (
                <span className="text-red-700 font-semibold text-sm">Expired</span>
              ) : daysLeft === 1 ? (
                <span className="text-orange-700 font-semibold text-sm">Expires tomorrow</span>
              ) : (
                <span className="text-yellow-700 font-semibold text-sm">{daysLeft} days left</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
