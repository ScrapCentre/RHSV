// CC operator "Accept lead" button — POSTs to /api/cc/leads/[id]/accept.
// No reject affordance by design (locked decision L19 — CC cannot reject).
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"

export default function AcceptLeadButton({
  leadId,
  alreadyAccepted,
}: {
  leadId: string
  alreadyAccepted: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [pending, startTransition] = useTransition()
  const [accepted, setAccepted] = useState(alreadyAccepted)
  const [error, setError] = useState<string | null>(null)

  if (accepted) {
    return (
      <div className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-status-success/10 text-status-success font-bold text-sm border border-status-success/20">
        <CheckCircle2 className="w-4 h-4" /> Accepted — RVSF notified
      </div>
    )
  }

  async function onAccept() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/cc/leads/${leadId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? `Accept failed (${res.status})`)
        return
      }
      setAccepted(true)
      // Refresh server-rendered counts on the dashboard if the user navigates back
      startTransition(() => router.refresh())
    } catch (e: any) {
      setError(e?.message ?? "Network error")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onAccept}
        disabled={busy || pending}
        className="w-full btn-brand py-2.5 px-4 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        aria-label="Accept this lead and notify your RVSF"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {busy ? "Sending…" : "Accept lead"}
      </button>
      {error && <p className="text-xs text-status-error">{error}</p>}
    </div>
  )
}
