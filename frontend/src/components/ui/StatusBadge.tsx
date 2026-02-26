interface StatusBadgeProps {
  status: string
}

const statusColors: Record<string, string> = {
  NEW_CAPTURED: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-200 text-green-900",
  REJECTED: "bg-red-200 text-red-900",
  PREVIEW_PENDING: "bg-yellow-100 text-yellow-800",
  SAMPLE_SENT: "bg-indigo-100 text-indigo-800",
  PRICE_SENT: "bg-green-100 text-green-800",
  PAYMENT_SENT: "bg-emerald-100 text-emerald-800",
  DELIVERED: "bg-teal-100 text-teal-800",
}

const statusDisplayNames: Record<string, string> = {
  NEW_CAPTURED: "New Captured",
  APPROVED: "APPROVED",
  PREVIEW_PENDING: "SENT PREVIEW",
  SAMPLE_SENT: "SENT LINK",
  PRICE_SENT: "SENT PRICE",
  PAYMENT_SENT: "SENT CONFIRMATION",
  DELIVERED: "DONE",
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = statusColors[status] || "bg-slate-100 text-slate-800"
  const displayName = statusDisplayNames[status] || status.replace(/_/g, " ")
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
      {displayName}
    </span>
  )
}
