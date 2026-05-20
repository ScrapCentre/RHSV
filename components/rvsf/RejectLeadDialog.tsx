// M19 — RejectLeadDialog. RVSF admin opens this to reject a lead.
// Shows refund eligibility BEFORE commit (per UI/UX review §2.1) so RVSF
// understands the consequences. Three-condition model:
//   - customerNumberRevealed → admin review (red banner)
//   - within 60min + zero non-system chat msgs → auto full refund (green)
//   - else → admin review (amber)
"use client"

import { useState } from "react"

export type RejectLeadDialogProps = {
  open: boolean
  onClose: () => void
  lead: {
    id: string
    vehicleReg: string
    unlockedAt: string | Date
    chatNonSystemMessageCount: number
    unlockAmountPaise: number
    customerNumberRevealed: boolean
  }
  onSuccess?: (decision: string) => void
}

const REASONS = [
  { value: "out_of_catchment",     label: "Out of catchment / too far for pickup" },
  { value: "vehicle_mismatch",     label: "Vehicle differs from listing (model/year/condition)" },
  { value: "customer_unreachable", label: "Customer is not responding" },
  { value: "pricing_disagreement", label: "Cannot reach price agreement" },
  { value: "other",                label: "Other (please explain in detail)" },
]

export default function RejectLeadDialog({ open, onClose, lead, onSuccess }: RejectLeadDialogProps) {
  const [reason, setReason] = useState("")
  const [reasonNote, setReasonNote] = useState("")
  const [acknowledged, setAcknowledged] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  // Compute eligibility client-side for the preview banner
  const unlockedAt = new Date(lead.unlockedAt)
  const minsSinceUnlock = (Date.now() - unlockedAt.getTime()) / 60_000
  const inGraceWindow = minsSinceUnlock <= 60 && lead.chatNonSystemMessageCount === 0
  const willAutoRefund = !lead.customerNumberRevealed && inGraceWindow

  const minNoteLength = reason === "other" ? 30 : 10
  const noteIsValid = reasonNote.length >= minNoteLength
  const canSubmit = reason && noteIsValid && acknowledged && !submitting

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/leads/${lead.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, reasonNote }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Reject failed")
      } else {
        onSuccess?.(data.refundDecision)
        onClose()
      }
    } catch (e: any) {
      setError(e?.message ?? "Network error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-1">Return this lead to the marketplace?</h2>
        <p className="text-sm text-brand-gray-700 mb-4">
          This will archive the chat. Another RVSF will be able to unlock it.
        </p>

        {/* Refund eligibility banner — MUST be visible before committing */}
        {lead.customerNumberRevealed ? (
          <div className="rounded p-3 mb-4 bg-status-error/10 border border-status-error">
            <p className="font-medium text-status-error">⚠ No automatic refund</p>
            <p className="text-sm text-brand-gray-700">
              You revealed the customer's number earlier. No automatic refund. You can request admin review after rejecting.
            </p>
          </div>
        ) : willAutoRefund ? (
          <div className="rounded p-3 mb-4 bg-status-success/10 border border-status-success">
            <p className="font-medium" style={{ color: "var(--status-success)" }}>✓ Auto-refund: ₹{(lead.unlockAmountPaise / 100).toLocaleString("en-IN")}</p>
            <p className="text-sm text-brand-gray-700">
              You're in the grace window (under 60 min + no chat messages). Your full unlock fee will refund automatically.
            </p>
          </div>
        ) : (
          <div className="rounded p-3 mb-4 bg-status-warning/10 border border-status-warning">
            <p className="font-medium" style={{ color: "var(--status-warning)" }}>⚠ No automatic refund</p>
            <p className="text-sm text-brand-gray-700">
              {minsSinceUnlock > 60
                ? "You're past the 60-minute grace window."
                : "You've already messaged the customer."}
              {" "}No auto-refund. You may request an admin review after rejecting.
            </p>
          </div>
        )}

        <label className="block text-sm font-medium mb-1">Reason</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border border-brand-gray-300 rounded px-3 py-2 mb-3"
        >
          <option value="">Select a reason…</option>
          {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>

        <label className="block text-sm font-medium mb-1">
          Tell us briefly what happened ({reasonNote.length}/{minNoteLength}+)
        </label>
        <textarea
          value={reasonNote}
          onChange={(e) => setReasonNote(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full border border-brand-gray-300 rounded px-3 py-2 mb-3"
          placeholder={reason === "other" ? "Describe in detail (min 30 chars)…" : "Brief explanation (min 10 chars)…"}
        />

        <label className="flex items-start gap-2 mb-4">
          <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} className="mt-1" />
          <span className="text-sm">I understand this lead returns to the marketplace and the chat is archived.</span>
        </label>

        {error && <p className="text-status-error mb-3 font-medium">{error}</p>}

        <p className="text-xs text-brand-gray-500 mb-4">
          Repeated rejections by an RVSF are reviewed by the platform team.
        </p>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-brand-gray-700">Cancel</button>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="btn-brand px-5 py-2"
            style={!canSubmit ? { opacity: 0.5, cursor: "not-allowed" } : {}}
          >
            {submitting ? "Submitting…" : "Reject and return to marketplace"}
          </button>
        </div>
      </div>
    </div>
  )
}
