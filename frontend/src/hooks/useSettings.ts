import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface AppSettings {
  id: string
  daily_import_enabled: boolean
  daily_import_first_hour: number
  daily_import_first_minute: number
  daily_import_second_enabled: boolean
  daily_import_second_hour: number
  daily_import_second_minute: number
  daily_import_limit: number
  search_radius_meters: number
  import_keywords: string
  import_suburbs: string
  lovable_preview_cost_aud: number
  target_profit_margin: number
  preview_expiry_days: number
  timezone: string
  created_at: string
  updated_at: string
}

export interface AppSettingsUpdate {
  daily_import_enabled?: boolean
  daily_import_first_hour?: number
  daily_import_first_minute?: number
  daily_import_second_enabled?: boolean
  daily_import_second_hour?: number
  daily_import_second_minute?: number
  daily_import_limit?: number
  search_radius_meters?: number
  import_keywords?: string
  import_suburbs?: string
  lovable_preview_cost_aud?: number
  target_profit_margin?: number
  preview_expiry_days?: number
  timezone?: string
}

export function useSettings() {
  return useQuery<AppSettings>({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await api.get("/api/settings")
      return response.data
    },
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (data: AppSettingsUpdate) => {
      const response = await api.put("/api/settings", data)
      return response.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] })
    },
  })
}
