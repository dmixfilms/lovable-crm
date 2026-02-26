import { Lead } from "@/types/index"

export function exportLeadsToCSV(leads: Lead[]) {
  if (!leads || leads.length === 0) {
    alert("No leads to export")
    return
  }

  // Define CSV headers
  const headers = [
    "Business Name",
    "Owner Name",
    "Website",
    "Email(s)",
    "Phone",
    "Address",
    "Suburb",
    "Industry",
    "Instagram",
    "Status",
    "Created At",
  ]

  // Create CSV rows
  const rows = leads.map((lead) => [
    lead.business_name || "",
    lead.owner_name || "",
    lead.website_url || "",
    (lead.emails || []).join("; "),
    lead.phone || "",
    lead.address || "",
    lead.suburb || "",
    lead.industry_category || "",
    lead.instagram_url || "",
    lead.status_pipeline || "",
    new Date(lead.created_at).toLocaleDateString(),
  ])

  // Combine headers and rows
  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n")

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `leads_export_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
