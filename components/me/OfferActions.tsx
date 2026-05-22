// Customer-side Accept / Counter / Reject buttons for the open OfferBubble
// surfaced on /me/lead/[id]. Calls the existing chat-offers API
// (/api/chat/offers/[messageId]/{accept,counter,reject}) — does NOT
// duplicate logic. Refreshes the route after a successful action so the
// server component re-renders with the new agreedPrice / cleared offer.
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  messageId: string
  amountPaise: number
  canAct: boolean   // false when the offer was posted by the customer (no self-accept)
}

export default function OfferActions({ messageId, amountPaise, canAct }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState<"accept" | "counter" | "reject" | null>(null)
  const [counterMode, setCounterMode] = useState(false)
  const [counterRupees, setCounterRupees] = useState<string>(String(Math.round(amountPaise / 100)))
  const [error, setError] = useState<string | null>(null)

  async function call(action: "accept" | "counter" | "reject", body?: any) {
    setBusy(action)
    setError(null)
    try {
      const res = await fetch(`/api/chat/offers/${messageId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Request failed (${res.status})`)
      }
      // Re-render the server component with fresh data.
      router.refresh()
      setCounterMode(false)
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.")
    } finally {
      setBusy(null)
    }
  }

  function handleAccept() {
    if (!confirm(`Accept ₹${(amountPaise / 100).toLocaleString("en-IN")} as the agreed price? Money + vehicle handover happen between you and the RVSF directly.`)) return
    call("accept")
  }

  function handleReject() {
    if (!confirm("Reject this offer? Either party can post a fresh offer afterwards.")) return
    call("reject")
  }

  function handleCounterSubmit() {
    const rupees = Number(counterRupees)
    if (!Number.isFinite(rupees) || rupees < 1) {
      setError("Enter a valid counter-offer amount in rupees.")
      return
    }
    call("counter", { counterAmountPaise: Math.round(rupees * 100) })
  }

  if (!canAct) {
    return (
      <p className="text-sm text-brand-gray-500 italic">
        You posted this offer — waiting on the RVSF to Accept / Counter / Reject.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-status-error bg-brand-red-xlight border border-brand-red-light rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {!counterMode && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAccept}
            disabled={!!busy}
            className="btn-unlock px-4 py-2 text-sm disabled:opacity-50"
          >
            {busy === "accept" ? "Accepting…" : `Accept ₹${(amountPaise / 100).toLocaleString("en-IN")}`}
          </button>
          <button
            onClick={() => setCounterMode(true)}
            disabled={!!busy}
            className="btn-brand px-4 py-2 text-sm disabled:opacity-50"
          >
            Counter
          </button>
          <button
            onClick={handleReject}
            disabled={!!busy}
            className="px-4 py-2 text-sm rounded-lg border border-brand-gray-300 text-brand-gray-700 hover:bg-brand-gray-100 disabled:opacity-50"
          >
            {busy === "reject" ? "Rejecting…" : "Reject"}
          </button>
        </div>
      )}

      {counterMode && (
        <div className="border border-brand-gray-300 rounded-lg p-3 bg-brand-gray-100">
          <label className="block text-xs text-brand-gray-700 mb-1">Your counter-offer (₹)</label>
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              min={1}
              step={100}
              value={counterRupees}
              onChange={(e) => setCounterRupees(e.target.value)}
              className="flex-1 min-w-[120px] px-3 py-2 border border-brand-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              placeholder="e.g. 15000"
            />
            <button
              onClick={handleCounterSubmit}
              disabled={!!busy}
              className="btn-brand px-4 py-2 text-sm disabled:opacity-50"
            >
              {busy === "counter" ? "Sending…" : "Send"}
            </button>
            <button
              onClick={() => { setCounterMode(false); setError(null) }}
              disabled={!!busy}
              className="px-3 py-2 text-sm text-brand-gray-700 hover:text-brand-red"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
