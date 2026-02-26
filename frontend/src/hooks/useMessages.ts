"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { OutboundMessage } from "@/types/index"

export function useMessages(leadId: string) {
  return useQuery({
    queryKey: ["messages", leadId],
    queryFn: async () => {
      const { data } = await api.get(`/leads/${leadId}/messages`)
      return data as OutboundMessage[]
    },
    enabled: !!leadId,
  })
}

export function useSendMessage(leadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      channel: string
      to_address: string
      body_rendered: string
      template_id?: string
      status?: string
    }) => {
      const { data } = await api.post(`/leads/${leadId}/messages`, { status: "SENT", ...payload })
      return data as OutboundMessage
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", leadId] }),
  })
}
