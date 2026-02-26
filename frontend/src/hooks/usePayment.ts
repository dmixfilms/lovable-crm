"use client"
import { useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface PaymentLink {
  payment_link: string
  session_id: string
  amount: number
  business_name: string
  message: string
}

export function useCreatePaymentLink() {
  return useMutation({
    mutationFn: async (leadId: string) => {
      const { data } = await api.post(`/leads/${leadId}/payment-link`)
      return data as PaymentLink
    },
  })
}

export function useGetPaymentLink() {
  return useMutation({
    mutationFn: async (leadId: string) => {
      const { data } = await api.get(`/leads/${leadId}/payment-link`)
      return data as PaymentLink
    },
  })
}
