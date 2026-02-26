"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { MessageTemplate } from "@/types/index"

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data } = await api.get("/templates/")
      return data as MessageTemplate[]
    },
  })
}

export function useCreateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (
      payload: Omit<MessageTemplate, "id" | "created_at" | "updated_at" | "variables"> & {
        variables?: string[]
      }
    ) => {
      const { data } = await api.post("/templates/", payload)
      return data as MessageTemplate
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  })
}

export function useUpdateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<MessageTemplate> }) => {
      const { data } = await api.patch(`/templates/${id}`, payload)
      return data as MessageTemplate
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  })
}

export function useDeleteTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/templates/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  })
}
