"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { LovablePreview } from "@/types/index"

export function usePreviews(leadId: string) {
  return useQuery({
    queryKey: ["previews", leadId],
    queryFn: async () => {
      const { data } = await api.get(`/leads/${leadId}/preview`)
      return data as LovablePreview[]
    },
    enabled: !!leadId,
  })
}

export function useCreatePreview(leadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      preview_url: string
      expires_at: string
      screenshot_url?: string
      old_website_url?: string
    }) => {
      const { data } = await api.post(`/leads/${leadId}/preview`, payload)
      return data as LovablePreview
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["previews", leadId] }),
  })
}

export function useArchivePreview(leadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ previewId, reason }: { previewId: string; reason?: string }) => {
      const { data } = await api.patch(`/leads/${leadId}/preview/${previewId}`, {
        is_archived: true,
        archive_reason: reason,
      })
      return data as LovablePreview
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["previews", leadId] }),
  })
}
