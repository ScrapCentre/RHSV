// M19 — RevealCustomerNumberDialog — RVSF-side confirm modal for the
// founder's reveal-number rule. One-way action. Sets Lead.customerNumberRevealed.
"use client"

import { useState } from "react"

export type RevealDialogProps = {
  open: boolean
  onClose: () => void
  leadId: string
  alreadyRevealed?: { atTime: string | Date; phone?: string } | null
  onRevealed?: (phone: string, revealedAt: string) => void
}

export default function RevealCustomerNumberDialog({ open, onClose, leadId, alreadyRevealed, onRevealed }: RevealDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<{ phone: string; revealedAt: string } | null>(null)

  if (!open) return null

  async function confirm() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/leads/${leadId}/reveal-customer-number`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Reveal failed")
      } else {
        setRevealed({ phone: data.phone, revealedAt: data.revealedAt })
        onRevealed?.(data.phone, data.revealedAt)
      }
    } catch (e: any) {
      setError(e?.message ?? "Network error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl p-6">
        {revealed || alreadyRevealed ? (
          <>
            <h2 className="text-xl font-bold mb-2">Customer phone number</h2>
            <p className="text-sm text-brand-gray-700 mb-4">
              You can call them now. They've been notified you have their number.
            </p>
            <div className="bg-brand-red-light border border-brand-red rounded p-4 mb-4">
              <code className="font-mono text-lg block">
                {revealed?.phone ?? alreadyRevealed?.phone ?? "—"}
              </code>
            </div>
            <p className="text-xs text-brand-gray-500 mb-4">
              <strong>Refund policy reminder:</strong> revealing the number disabled
              automatic refunds on this lead. Any refund request goes through admin
              review.
            </p>
            <div className="flex justify-end">
              <button onClick={onClose} className="btn-brand px-5 py-2">Close</button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-2">Reveal customer's number?</h2>
            <p className="text-sm text-brand-gray-700 mb-3">
              Once you reveal this number, <strong>automatic refunds on this lead are
              permanently disabled.</strong> The customer will be notified that you've
              unlocked their number to call them directly. Use this only when on-platform
              chat isn't enough.
            </p>

            <details className="mb-4 text-sm">
              <summary className="cursor-pointer text-brand-red">What changes?</summary>
              <ul className="mt-2 pl-5 list-disc text-brand-gray-700 space-y-1">
                <li>The customer's phone number appears in your chat header.</li>
                <li>The customer gets an email + WhatsApp + in-app notification.</li>
                <li>If you later reject this lead, refund requires admin review (no auto-refund).</li>
              </ul>
            </details>

            {error && <p className="text-status-error mb-3 font-medium">{error}</p>}

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 text-brand-gray-700">Cancel</button>
              <button onClick={confirm} disabled={submitting} className="btn-brand px-5 py-2">
                {submitting ? "Revealing…" : "Reveal number"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
