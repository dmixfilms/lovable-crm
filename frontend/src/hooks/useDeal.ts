"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Deal } from "@/types/index"

export function useDeal(leadId: string) {
  return useQuery({
    queryKey: ["deal", leadId],
    queryFn: async () => {
      const { data } = await api.get(`/leads/${leadId}/deal`)
      return data as Deal
    },
    enabled: !!leadId,
  })
}

export function useUpdateDeal(leadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Deal>) => {
      const { data } = await api.patch(`/leads/${leadId}/deal`, payload)
      return data as Deal
    },
    onSuccess: (updated) => {
      qc.setQueryData(["deal", leadId], updated)
    },
  })
}
