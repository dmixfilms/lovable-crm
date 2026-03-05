"use client"
import { differenceInDays } from "date-fns"
import { ActivePreviewSummary } from "@/types/index"

interface PreviewExpiryBadgeProps {
  preview: ActivePreviewSummary
}

export function getPreviewDaysLeft(preview: ActivePreviewSummary): number {
  return differenceInDays(new Date(preview.expires_at), new Date())
}

export default function PreviewExpiryBadge({ preview }: PreviewExpiryBadgeProps) {
  const daysLeft = getPreviewDaysLeft(preview)

  // Only show badge if expiring within 2 days or already expired
  if (daysLeft > 2) {
    return null
  }

  if (daysLeft <= 0) {
    // Expired - red badge
    return (
      <div className="inline-flex bg-red-100 text-red-800 px-2 py-1 rounded text-[10px] font-semibold">
        ⚠️ Expirado — confirmar desativação
      </div>
    )
  }

  if (daysLeft === 1) {
    // Expires tomorrow - orange badge
    return (
      <div className="inline-flex bg-orange-100 text-orange-800 px-2 py-1 rounded text-[10px] font-semibold">
        ⏰ Expira amanhã
      </div>
    )
  }

  // 2 days left - yellow badge
  return (
    <div className="inline-flex bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-[10px] font-semibold">
      ⏰ {daysLeft} dias restantes
    </div>
  )
}
