"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Lead } from "@/types/index"

export function useLeads(params?: { status?: string; search?: string; suburb?: string; skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: async () => {
      const { data } = await api.get("/leads/", { params: { limit: 200, ...params } })
      return data as { total: number; items: Lead[] }
    },
    enabled: true,
    staleTime: 0,
  })
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const { data } = await api.get(`/leads/${id}`)
      return data as Lead
    },
    enabled: !!id,
  })
}

export function useUpdateLead(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Lead>) => {
      const { data } = await api.patch(`/leads/${id}`, payload)
      return data as Lead
    },
    onSuccess: (updated) => {
      qc.setQueryData(["lead", id], updated)
      qc.invalidateQueries({ queryKey: ["leads"] })
    },
  })
}

export function useMoveLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, new_status }: { id: string; new_status: string }) => {
      const { data } = await api.patch(`/leads/${id}/move`, null, { params: { new_status } })
      return data as Lead
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] })
    },
  })
}

export function useApproveLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/leads/${id}/approve`)
      return data as Lead
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] })
    },
  })
}

export function useRejectLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/leads/${id}/reject`)
      return data as Lead
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] })
    },
  })
}

export function useGenerateLovableUrl() {
  return useMutation({
    mutationFn: async ({ id, prompt }: { id: string; prompt?: string }) => {
      const { data } = await api.post(`/leads/${id}/generate-lovable-url`,
        prompt ? { prompt } : {}
      )
      return data as {
        lovable_url: string
        lead_id: string
        business_name: string
        message: string
      }
    },
  })
}
