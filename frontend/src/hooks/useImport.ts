"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface ImportRun {
  id: string
  run_type: string
  keywords_used?: string[]
  leads_added: number
  leads_skipped_duplicates?: number
  started_at: string
  finished_at?: string | null
}

export function useImportRuns() {
  return useQuery({
    queryKey: ["import-runs"],
    queryFn: async () => {
      const { data } = await api.get("/jobs/runs", { params: { limit: 10 } })
      return data as ImportRun[]
    },
  })
}

export interface ImportOptions {
  keywords?: string[]
  suburbs?: string[]
  limit?: number
  radius_meters?: number
}

export function useTriggerImport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (options?: ImportOptions) => {
      const payload = options || {}
      const { data } = await api.post("/jobs/import", payload)
      return data as { status: string; message: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["import-runs"] })
    },
  })
}
