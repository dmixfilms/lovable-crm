"use client"
import { useState } from "react"
import { useDeal, useUpdateDeal } from "@/hooks/useDeal"
import { useCreatePaymentLink } from "@/hooks/usePayment"
import { Deal } from "@/types/index"

interface DealTabProps {
  leadId: string
  onSaved: (msg: string) => void
}

export default function DealTab({ leadId, onSaved }: DealTabProps) {
  const { data: deal } = useDeal(leadId)
  const updateDeal = useUpdateDeal(leadId)
  const createPaymentLink = useCreatePaymentLink()
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [paymentLink, setPaymentLink] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null)

  const [form, setForm] = useState<Deal>(() =>
    deal || {
      id: "",
      lead_id: leadId,
      cost_lovable_aud: 0,
      domain_cost_aud: 0,
      stripe_payment_status: "pending",
      created_at: ""
    }
  )

  if (!deal) return <p>Loading...</p>

  // Helper to ensure number
  const toNum = (val: any): number => {
    if (val === null || val === undefined) return 0
    const n = Number(val)
    return isNaN(n) ? 0 : n
  }

  // Calculate profit: final_price - lovable_cost - domain_cost - other_costs
  const lovableCost = toNum(form.cost_lovable_aud)
  const domainCost = toNum(form.domain_cost_aud)
  const otherCosts = toNum(form.other_costs_aud)
  const finalPrice = toNum(form.final_price_aud)

  const totalCosts = lovableCost + domainCost + otherCosts
  const profit = finalPrice - totalCosts
  const margin = finalPrice > 0 ? ((profit / finalPrice) * 100).toFixed(1) : "0"
  const isPaid = form.stripe_payment_status === "paid"
  const isRejected = form.stripe_payment_status === "rejected"

  const handleSave = () => {
    updateDeal.mutate(form, {
      onSuccess: () => onSaved("Deal updated"),
    })
  }

  const handleMarkAsPaid = () => {
    const updatedForm = {
      ...form,
      stripe_payment_status: "paid",
    }
    setForm(updatedForm)
    updateDeal.mutate(updatedForm, {
      onSuccess: () => onSaved("Deal marked as paid"),
    })
  }

  const handleRejectDeal = () => {
    const updatedForm = {
      ...form,
      stripe_payment_status: "rejected",
      rejection_reason: rejectionReason,
    }
    setForm(updatedForm)
    updateDeal.mutate(updatedForm, {
      onSuccess: () => {
        onSaved("Deal rejected")
        setRejectModalOpen(false)
        setRejectionReason("")
      },
    })
  }

  const handleGeneratePaymentLink = () => {
    createPaymentLink.mutate(leadId, {
      onSuccess: (data) => {
        setPaymentLink(data.payment_link)
        setPaymentSessionId(data.session_id)
        setShowPaymentModal(true)
        onSaved("Payment link created")
      },
      onError: () => {
        onSaved("Failed to create payment link")
      },
    })
  }

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        onSaved("Copied to clipboard")
      }).catch(() => {
        onSaved("Failed to copy")
      })
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand("copy")
        onSaved("Copied to clipboard")
      } catch {
        onSaved("Failed to copy")
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Rejection Alert */}
      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">
            <span className="font-semibold">Deal Rejected:</span> {form.rejection_reason || "No reason provided"}
          </p>
        </div>
      )}

      {/* Price Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Quoted Price (A$)</label>
          <input
            type="number"
            step="0.01"
            value={form.quoted_price_aud || ""}
            onChange={(e) => setForm({ ...form, quoted_price_aud: parseFloat(e.target.value) || 0 })}
            disabled={isRejected}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Final Price (A$) *</label>
          <input
            type="number"
            step="0.01"
            value={form.final_price_aud || ""}
            onChange={(e) => setForm({ ...form, final_price_aud: parseFloat(e.target.value) || 0 })}
            disabled={isRejected}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Cost Fields */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Lovable Build Cost (A$)</label>
          <input
            type="number"
            step="0.01"
            value={form.cost_lovable_aud || ""}
            onChange={(e) => setForm({ ...form, cost_lovable_aud: parseFloat(e.target.value) || 0 })}
            disabled={isRejected}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Domain Cost (A$)</label>
          <input
            type="number"
            step="0.01"
            value={form.domain_cost_aud || ""}
            onChange={(e) => setForm({ ...form, domain_cost_aud: parseFloat(e.target.value) || 0 })}
            disabled={isRejected}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Other Costs (A$)</label>
          <input
            type="number"
            step="0.01"
            value={form.other_costs_aud || ""}
            onChange={(e) => setForm({ ...form, other_costs_aud: parseFloat(e.target.value) || 0 })}
            disabled={isRejected}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-600 uppercase font-semibold">Total Costs</p>
            <p className="text-xl font-bold text-slate-900">A${totalCosts.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 uppercase font-semibold">Profit</p>
            <p className={`text-xl font-bold ${profit > 0 ? "text-green-600" : "text-red-600"}`}>
              A${profit.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 uppercase font-semibold">Margin %</p>
            <p className={`text-xl font-bold ${parseFloat(margin) > 0 ? "text-green-600" : "text-red-600"}`}>
              {margin}%
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 uppercase font-semibold">Status</p>
            <div className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
              isRejected
                ? "bg-red-100 text-red-700"
                : isPaid
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}>
              {isRejected ? "❌ Rejected" : isPaid ? "✅ Paid" : "⏳ Pending"}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!isRejected && (
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={updateDeal.isPending}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {updateDeal.isPending ? "Saving..." : "Save Deal"}
          </button>

          {!isPaid && (
            <>
              <button
                onClick={handleMarkAsPaid}
                disabled={updateDeal.isPending || !form.final_price_aud}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {updateDeal.isPending ? "Updating..." : "✅ Mark as Paid"}
              </button>

              <button
                onClick={handleGeneratePaymentLink}
                disabled={createPaymentLink.isPending || !form.final_price_aud}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {createPaymentLink.isPending ? "Creating..." : "💳 Payment Link"}
              </button>
            </>
          )}

          <button
            onClick={() => setRejectModalOpen(true)}
            disabled={updateDeal.isPending}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            ❌ No Interest
          </button>
        </div>
      )}

      {isPaid && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">
            <span className="font-semibold">Payment recorded:</span> This deal will be counted in your financials dashboard.
          </p>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">❌ Reject Deal</h2>
              <p className="text-slate-600 mb-4">Why did the client reject this deal?</p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Client didn't like the design, budget constraints, changed their mind..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4 resize-none h-24"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRejectModalOpen(false)
                    setRejectionReason("")
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectDeal}
                  disabled={updateDeal.isPending || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors font-medium"
                >
                  {updateDeal.isPending ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Link Modal */}
      {showPaymentModal && paymentLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">💳 Payment Link Created</h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-700 mb-3">
                  <span className="font-semibold">Amount:</span> A${form.final_price_aud?.toFixed(2)}
                </p>
                <p className="text-xs text-blue-600 mb-3">
                  <span className="font-semibold">Session ID:</span> {paymentSessionId}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-xs text-slate-600 font-semibold mb-2">Payment Link</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm font-mono text-slate-700 truncate"
                  />
                  <button
                    onClick={() => copyToClipboard(paymentLink)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-4">
                Share this link with your client. They can complete the payment using their credit card.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setPaymentLink(null)
                    setPaymentSessionId(null)
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => copyToClipboard(paymentLink)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  📋 Copy & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
