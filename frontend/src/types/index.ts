export interface User {
  id: string
  email: string
  role: "admin" | "operator"
}

export interface ActivePreviewSummary {
  id: string
  preview_url: string
  expires_at: string
  is_archived: boolean
  archive_reason?: string
  archived_at?: string
}

export interface Lead {
  id: string
  business_name: string
  industry_category?: string
  address?: string
  suburb?: string
  website_url?: string
  emails: string[]
  phone?: string
  instagram_url?: string
  google_place_id?: string
  status_pipeline: string
  owner_name?: string
  notes?: string
  created_at: string
  updated_at: string
  status_changed_at: string
  active_preview?: ActivePreviewSummary
}

export interface Task {
  id: string
  lead_id: string
  task_type: string
  is_done: boolean
  due_date?: string
  completed_at?: string
  notes?: string
  assigned_to?: string
  created_at: string
}

export interface Deal {
  id: string
  lead_id: string
  quoted_price_aud?: number
  final_price_aud?: number
  cost_lovable_aud: number
  domain_cost_aud: number
  other_costs_aud?: number
  stripe_payment_status: string
  paid_at?: string
  rejection_reason?: string
  rejected_at?: string
  profit_aud?: number
  created_at: string
}

export interface LovablePreview {
  id: string
  lead_id: string
  preview_url: string
  screenshot_url?: string
  old_website_url?: string
  is_archived: boolean
  archive_reason?: string
  archived_at?: string
  created_at: string
  expires_at: string
}

export interface MessageTemplate {
  id: string
  channel: "EMAIL" | "INSTAGRAM" | "SMS"
  name: string
  subject?: string
  body: string
  variables: string[]
  created_at: string
  updated_at: string
}

export interface OutboundMessage {
  id: string
  lead_id: string
  channel: string
  to_address: string
  body_rendered: string
  status: "DRAFT" | "SENT" | "FAILED"
  template_id?: string
  sent_at?: string
  created_at: string
}
