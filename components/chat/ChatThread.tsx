// M12 — Polymorphic chat thread with negotiation widget.
// Renders text + image + pdf + offer + system_event messages.
// Polling: 5s while focused, 30s while hidden (Page Visibility API).
// Per L36 + §14 of v2-build-plan.
"use client"

import { useEffect, useRef, useState, useCallback } from "react"

type Message = {
  _id: string
  threadId: string
  senderUserId: string | null
  senderRole: "customer" | "rvsf_executive" | "system" | "admin"
  type: "text" | "image" | "pdf" | "offer" | "system_event"
  text?: string
  attachment?: { url: string; mime: string; sizeBytes: number; originalName?: string; subtype?: string; dscSigned?: boolean }
  offer?: {
    amountPaise: number
    actor: "customer" | "rvsf"
    status: "open" | "accepted" | "countered" | "rejected" | "expired"
    expiresAt: string
    decidedAt?: string
  }
  createdAt: string
}

type ThreadMeta = {
  _id: string
  leadId: string
  status: "active" | "archived"
  isReadOnly?: boolean
  pinnedOfferMessageId?: string
  pinnedOfferAmountPaise?: number
  closedReason?: string
}

export default function ChatThread({
  leadId,
  currentUserId,
  currentUserRole,  // "customer" | "rvsf_executive" | "rvsf_admin" | "admin"
  isReadOnly: forceReadOnly = false,  // page may force RO; server flag is the source of truth otherwise.
}: {
  leadId: string
  currentUserId: string
  currentUserRole: "customer" | "rvsf_executive" | "rvsf_admin" | "admin"
  isReadOnly?: boolean
}) {
  const [thread, setThread] = useState<ThreadMeta | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [offerInput, setOfferInput] = useState<string>("")
  const [showOfferInput, setShowOfferInput] = useState(false)
  const [posting, setPosting] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const isCustomer = currentUserRole === "customer"
  // HOTFIX 2026-05-22 (Codex P2 — chat archived-thread access):
  // Composer is disabled when the thread is archived OR the page forced RO.
  // Trust the server's `isReadOnly` flag if present (covers status that may
  // grow beyond active/archived later) and fall back to status comparison.
  const serverReadOnly = thread?.isReadOnly ?? (thread?.status !== "active")
  const isThreadReadOnly = forceReadOnly || serverReadOnly
  const composerEnabled = !!thread && !isThreadReadOnly

  const refresh = useCallback(async () => {
    try {
      const tRes = await fetch(`/api/chat/threads/${leadId}`)
      const tData = await tRes.json()
      if (!tRes.ok) {
        setError(tData.error ?? "Cannot load thread")
        setLoading(false)
        return
      }
      setThread(tData.active)
      const mRes = await fetch(`/api/chat/threads/${leadId}/messages`)
      const mData = await mRes.json()
      if (mRes.ok) setMessages(mData.messages)
    } catch (e: any) {
      setError(e?.message ?? "Network error")
    } finally {
      setLoading(false)
    }
  }, [leadId])

  // Visibility-aware polling
  useEffect(() => {
    refresh()
    let cancelled = false
    function tick() {
      if (cancelled) return
      const visible = !document.hidden
      // Read-only / archived → slow heartbeat (no new traffic possible). Admin
      // still polls fast so they can supervise live threads in another tab.
      const isReadOnlyForPoll = (thread?.isReadOnly ?? (thread?.status !== "active"))
      if (isReadOnlyForPoll && currentUserRole !== "admin") {
        setTimeout(tick, 60000)
      } else {
        const delay = visible ? 5000 : 30000
        setTimeout(() => { refresh().then(tick) }, delay)
      }
    }
    tick()
    return () => { cancelled = true }
  }, [leadId])  // refresh re-binds via useCallback

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages.length])

  async function postMessage(payload: any) {
    setPosting(true)
    try {
      const res = await fetch(`/api/chat/threads/${leadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? "Send failed")
      } else {
        setDraft("")
        setOfferInput("")
        setShowOfferInput(false)
        await refresh()
      }
    } catch (e: any) {
      setError(e?.message ?? "Network error")
    } finally {
      setPosting(false)
    }
  }

  async function handleOfferAction(messageId: string, action: "accept" | "counter" | "reject", counterAmount?: number) {
    const body = action === "counter" ? { counterAmountPaise: counterAmount } : {}
    const res = await fetch(`/api/chat/offers/${messageId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? `${action} failed`)
    } else {
      await refresh()
    }
  }

  if (loading) return <p className="p-6 text-brand-gray-500">Loading chat…</p>
  if (error && !thread) return <p className="p-6 text-status-error">{error}</p>
  if (!thread) return <p className="p-6 text-brand-gray-500">No chat thread exists for this lead yet.</p>

  return (
    <div className="flex flex-col h-[70vh] min-h-[420px] md:h-[600px] border border-brand-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Archived / read-only banner (per L55 + Codex P2 2026-05-22) */}
      {isThreadReadOnly && (
        <div className="bg-brand-gray-100 px-4 py-3 border-b border-brand-gray-300 text-sm text-brand-gray-700">
          <p className="font-semibold mb-0.5">Conversation closed — read only</p>
          <p>
            {isCustomer
              ? "This RVSF has returned your job to our marketplace. A new RVSF will reach out here when they unlock. The history below is preserved for your reference."
              : "This lead was returned to the marketplace — another RVSF can now unlock it. The history below is preserved for your records."}
          </p>
        </div>
      )}

      {/* Pinned offer banner */}
      {thread.pinnedOfferAmountPaise && (
        <div className="bg-status-success/10 px-4 py-2 border-b border-status-success/30 text-sm font-medium">
          ✓ Agreed price: ₹{(thread.pinnedOfferAmountPaise / 100).toLocaleString("en-IN")}
        </div>
      )}

      {/* Message scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-brand-bg">
        {messages.length === 0 && (
          <p className="text-center text-brand-gray-500 text-sm py-8">
            No messages yet. Either of you can send the first message — typically the RVSF introduces themselves and proposes a pickup time.
          </p>
        )}
        {messages.map((m) => (
          <Bubble
            key={m._id}
            msg={m}
            isMine={m.senderUserId === currentUserId}
            currentUserRole={currentUserRole}
            onAction={handleOfferAction}
            actionsDisabled={isThreadReadOnly}
          />
        ))}
      </div>

      {/* Composer */}
      {composerEnabled && (
        <div className="border-t border-brand-gray-300 p-3 bg-white">
          {showOfferInput ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                <span className="text-sm">₹</span>
                <input
                  type="number"
                  min="100"
                  value={offerInput}
                  onChange={(e) => setOfferInput(e.target.value)}
                  placeholder="Amount in rupees"
                  className="flex-1 min-w-0 border border-brand-gray-300 rounded px-3 py-2"
                />
              </div>
              <button
                onClick={() => postMessage({ type: "offer", offerAmountPaise: Number(offerInput) * 100 })}
                disabled={posting || !offerInput || Number(offerInput) < 1}
                className="btn-brand px-4 py-2 text-sm"
              >
                {posting ? "Posting…" : "Send offer"}
              </button>
              <button onClick={() => setShowOfferInput(false)} className="text-sm text-brand-gray-500 px-2 py-2">Cancel</button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={isCustomer
                  ? "Ask a question or share a detail about your vehicle…"
                  : "Introduce yourself and propose pickup…"}
                rows={2}
                className="flex-1 min-w-0 border border-brand-gray-300 rounded px-3 py-2 resize-none"
              />
              <div className="flex gap-2 sm:flex-col-reverse md:flex-row">
                <button
                  onClick={() => setShowOfferInput(true)}
                  className="text-sm border border-brand-red text-brand-red rounded px-3 py-2 flex-1 sm:flex-initial whitespace-nowrap"
                >₹ Offer</button>
                <button
                  onClick={() => postMessage({ type: "text", text: draft })}
                  disabled={posting || !draft.trim()}
                  className="btn-brand px-5 py-2 flex-1 sm:flex-initial"
                >
                  {posting ? "…" : "Send"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Bubble({
  msg, isMine, currentUserRole, onAction, actionsDisabled = false,
}: {
  msg: Message
  isMine: boolean
  currentUserRole: string
  onAction: (mid: string, action: "accept" | "counter" | "reject", amount?: number) => void
  actionsDisabled?: boolean
}) {
  if (msg.senderRole === "system") {
    return (
      <div className="text-center text-xs text-brand-gray-500 py-2">
        {msg.text}
      </div>
    )
  }

  const side = isMine ? "justify-end" : "justify-start"
  const bg = isMine ? "bg-brand-red text-white" : "bg-white border border-brand-gray-300"

  if (msg.type === "text") {
    return (
      <div className={`flex ${side}`}>
        <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${bg}`}>
          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
          <p className={`text-xs mt-1 ${isMine ? "opacity-70" : "text-brand-gray-500"}`}>
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    )
  }

  if (msg.type === "image") {
    return (
      <div className={`flex ${side}`}>
        <div className={`max-w-[60%] rounded-2xl overflow-hidden ${bg}`}>
          <img src={msg.attachment?.url} alt="" className="w-full" />
        </div>
      </div>
    )
  }

  if (msg.type === "pdf") {
    const isCod = msg.attachment?.subtype === "cod"
    const isCvs = msg.attachment?.subtype === "cvs"
    return (
      <div className={`flex ${side}`}>
        <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${bg}`}>
          <p className="text-sm font-medium">
            📄 {isCod ? "Certificate of Deposit (COD)" : isCvs ? "Certificate of Vehicle Scrapping (CVS)" : msg.attachment?.originalName ?? "PDF"}
          </p>
          {msg.attachment?.dscSigned && (
            <p className="text-xs mt-1 opacity-70">✓ Signed by RVSF with DSC</p>
          )}
          <a href={msg.attachment?.url} target="_blank" rel="noopener noreferrer" className="text-xs underline mt-1 inline-block">
            Download
          </a>
        </div>
      </div>
    )
  }

  if (msg.type === "offer") {
    const o = msg.offer!
    const isOpen = o.status === "open"
    // Read-only thread → no accept/counter/reject buttons (the API would reject
    // them anyway with 409 "Thread is archived"; this is purely a UX guard).
    const canActOnIt = isOpen && !isMine && !actionsDisabled && (currentUserRole === "customer" || currentUserRole === "rvsf_admin" || currentUserRole === "rvsf_executive")
    const statusClass = {
      open: "border-brand-red",
      accepted: "border-status-success bg-status-success/10",
      countered: "border-brand-gray-300 opacity-60",
      rejected: "border-brand-gray-300 opacity-60",
      expired: "border-brand-gray-300 opacity-60",
    }[o.status]
    return (
      <div className={`flex ${side}`}>
        <div className={`max-w-[80%] border-2 rounded-2xl px-4 py-3 bg-white ${statusClass}`}>
          <p className="text-xs uppercase font-bold tracking-wide text-brand-gray-500">
            {o.actor === "customer" ? "Customer offer" : "RVSF offer"}
          </p>
          <p className="text-2xl font-bold mt-1">₹{(o.amountPaise / 100).toLocaleString("en-IN")}</p>
          <p className="text-xs text-brand-gray-500 mt-1">
            Status: {o.status}{o.status === "open" && ` · expires ${new Date(o.expiresAt).toLocaleString()}`}
          </p>
          {canActOnIt && (
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => {
                  if (confirm(`Accept ₹${(o.amountPaise / 100).toLocaleString("en-IN")} as the agreed price?\n\nThis will be recorded as the agreed price. Money and the vehicle change hands directly between you offline — ScrapCentre does not hold any payment.`)) {
                    onAction(msg._id, "accept")
                  }
                }}
                className="btn-unlock px-3 py-1.5 text-sm rounded"
              >Accept</button>
              <button
                onClick={() => {
                  const c = prompt("Counter-offer amount in ₹:")
                  if (c && Number(c) >= 1) onAction(msg._id, "counter", Number(c) * 100)
                }}
                className="border border-brand-gray-300 px-3 py-1.5 text-sm rounded"
              >Counter</button>
              <button
                onClick={() => onAction(msg._id, "reject")}
                className="border border-brand-gray-300 px-3 py-1.5 text-sm rounded text-brand-gray-700"
              >Reject</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
