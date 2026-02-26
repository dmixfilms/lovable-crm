"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export function useTasks(leadId: string) {
  return useQuery({
    queryKey: ["tasks", leadId],
    queryFn: async () => {
      const { data } = await api.get(`/leads/${leadId}/tasks`)
      return Array.isArray(data) ? data : []
    },
    enabled: !!leadId,
    staleTime: 30000,
  })
}

export function useCreateTask(leadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { task_type: string; notes?: string; due_date?: string }) => {
      const { data } = await api.post(`/leads/${leadId}/tasks`, payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", leadId] })
    },
  })
}

export function useUpdateTask(leadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, payload }: { taskId: string; payload: any }) => {
      const { data } = await api.patch(`/leads/${leadId}/tasks/${taskId}`, payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", leadId] })
    },
  })
}

export function useDeleteTask(leadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/leads/${leadId}/tasks/${taskId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", leadId] })
    },
  })
}
