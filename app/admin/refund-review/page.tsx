// M16 — Admin refund-review queue page.
"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/fetch"

type RefundRow = {
  rejectionEventId: string
  leadId: string
  unlockId: string
  vehicleReg: string
  rvsfName: string
  unlockAmountPaise: number
  reason: string
  reasonNote: string
  minutesElapsedSinceUnlock: number
  chatMessageCount: number
  chatFlaggedPatterns: { patternName: string; matchedSubstring: string }[]
  customerNumberRevealed: boolean
  refundDecision: string
  refundEntryReason?: "grace_phase" | "engaged_phase" | "number_revealed"
  refundFailureReason?: string
  createdAt: string
}

// Map RejectionEvent.refundEntryReason → human-readable chip label/colour.
// Drives the "why is this in the queue?" cue per VISION.md §4.
function entryReasonChip(r: RefundRow): { label: string; bg: string } | null {
  if (r.refundDecision === "auto_full_but_refund_failed") {
    return { label: "RAZORPAY REFUND FAILED", bg: "bg-status-error text-white" }
  }
  if (r.refundEntryReason === "engaged_phase") {
    return { label: "ENGAGED-PHASE REJECT", bg: "bg-status-warning text-white" }
  }
  if (r.refundEntryReason === "number_revealed" || r.refundDecision === "auto_denied_number_revealed") {
    return { label: "NUMBER REVEALED", bg: "bg-status-error text-white" }
  }
  if (r.refundEntryReason === "grace_phase") {
    return { label: "GRACE-PHASE (REVIEW)", bg: "bg-brand-gray-100" }
  }
  return null
}

export default function RefundReviewPage() {
  const [rows, setRows] = useState<RefundRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<RefundRow | null>(null)
  const [decision, setDecision] = useState<"approve_full" | "approve_partial" | "deny" | "">("")
  const [partialAmount, setPartialAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function refresh() {
    setLoading(true)
    fetch("/api/admin/refund-review")
      .then((r) => r.json())
      .then((d) => setRows(d.events ?? []))
      .finally(() => setLoading(false))
  }
  useEffect(() => { refresh() }, [])

  async function submitDecision() {
    if (!selected || !decision || !notes) return
    setSubmitting(true)
    try {
      const body: any = { decision, adminReviewNotes: notes }
      if (decision === "approve_partial") body.refundAmountPaise = Number(partialAmount) * 100
      const res = await apiFetch(`/api/admin/refund-review/${selected.unlockId}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setSelected(null)
        setDecision("")
        setPartialAmount("")
        setNotes("")
        refresh()
      } else {
        const d = await res.json()
        alert(`Failed: ${d.error}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Refund review queue</h1>
      <p className="text-brand-gray-700 mb-6">
        Engaged-window rejections + auto-refund failures awaiting your decision.
      </p>

      {loading && <p>Loading…</p>}
      {!loading && rows.length === 0 && (
        <div className="card-base text-center py-12">No refund requests pending. Nice.</div>
      )}

      {!loading && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((r) => {
            const chip = entryReasonChip(r)
            return (
            <div key={r.rejectionEventId} className="card-feature flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-xs">{r.vehicleReg}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-brand-gray-100">{r.reason}</span>
                  {chip && (
                    <span className={`text-xs px-2 py-0.5 rounded ${chip.bg}`}>
                      {chip.label}
                    </span>
                  )}
                  {r.customerNumberRevealed && !chip?.label.includes("NUMBER") && (
                    <span className="text-xs px-2 py-0.5 rounded bg-status-error text-white">
                      ⚠ NUMBER REVEALED
                    </span>
                  )}
                  {r.chatFlaggedPatterns.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded bg-status-warning text-white">
                      {r.chatFlaggedPatterns.length} flagged
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium">{r.rvsfName}</p>
                <p className="text-xs text-brand-gray-700 mt-1">
                  {r.minutesElapsedSinceUnlock} min since unlock · {r.chatMessageCount} messages
                </p>
                <p className="text-sm text-brand-gray-700 mt-2 break-words">{r.reasonNote}</p>
                {r.chatFlaggedPatterns.length > 0 && (
                  <div className="mt-2 text-xs space-y-1">
                    {r.chatFlaggedPatterns.slice(0, 3).map((f, i) => (
                      <p key={i} className="text-status-error break-words">⚠ {f.patternName}: <code className="break-all">{f.matchedSubstring}</code></p>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setSelected(r)} className="btn-brand px-4 py-2 text-sm shrink-0 w-full sm:w-auto">Review</button>
            </div>
            )
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{selected.vehicleReg} — {selected.rvsfName}</h2>
                <p className="text-sm text-brand-gray-700">
                  {selected.minutesElapsedSinceUnlock} min since unlock · {selected.chatMessageCount} messages
                </p>
                {selected.customerNumberRevealed && (
                  <p className="mt-2 text-sm text-status-error font-medium">
                    ⚠ Customer number was revealed before this rejection — extra scrutiny required.
                  </p>
                )}
              </div>
              <button onClick={() => setSelected(null)} className="text-brand-gray-500 text-2xl">×</button>
            </div>

            <div className="bg-brand-gray-100 p-3 rounded mb-4">
              <p className="text-xs uppercase font-bold text-brand-gray-500">Reason</p>
              <p className="text-sm">{selected.reason}: {selected.reasonNote}</p>
            </div>

            {selected.chatFlaggedPatterns.length > 0 && (
              <div className="bg-status-error/10 border border-status-error rounded p-3 mb-4">
                <p className="text-xs uppercase font-bold mb-1">Off-platform leakage detected</p>
                {selected.chatFlaggedPatterns.map((f, i) => (
                  <p key={i} className="text-sm"><strong>{f.patternName}:</strong> <code>{f.matchedSubstring}</code></p>
                ))}
              </div>
            )}

            <div className="space-y-3 mb-4">
              <p className="font-bold">Decision</p>
              {(["approve_full", "approve_partial", "deny"] as const).map((d) => (
                <label key={d} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="decision"
                    value={d}
                    checked={decision === d}
                    onChange={() => setDecision(d)}
                  />
                  <span>{d.replace(/_/g, " ")}</span>
                </label>
              ))}
              {decision === "approve_partial" && (
                <input
                  type="number"
                  min="1"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder="Partial refund amount in ₹"
                  className="w-full border border-brand-gray-300 rounded px-3 py-2"
                />
              )}
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Decision notes (visible to RVSF — REQUIRED)"
              rows={3}
              className="w-full border border-brand-gray-300 rounded px-3 py-2 mb-4"
            />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button onClick={() => setSelected(null)} className="px-4 py-2 text-brand-gray-700 w-full sm:w-auto">Cancel</button>
              <button
                onClick={submitDecision}
                disabled={submitting || !decision || !notes}
                className="btn-brand px-5 py-2 w-full sm:w-auto"
              >
                {submitting ? "Submitting…" : "Submit decision"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
