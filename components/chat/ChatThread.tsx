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
  pinnedOfferMessageId?: string
  pinnedOfferAmountPaise?: number
  closedReason?: string
}

export default function ChatThread({
  leadId,
  currentUserId,
  currentUserRole,  // "customer" | "rvsf_executive" | "rvsf_admin" | "admin"
}: {
  leadId: string
  currentUserId: string
  currentUserRole: "customer" | "rvsf_executive" | "rvsf_admin" | "admin"
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
  const composerEnabled = thread?.status === "active"

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
      // Stop polling once thread is archived (one final tick at 60s)
      if (thread?.status === "archived" && currentUserRole !== "admin") {
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
    <div className="flex flex-col h-[600px] border border-brand-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Archived banner (per L55) */}
      {thread.status === "archived" && (
        <div className="bg-brand-gray-100 px-4 py-3 border-b border-brand-gray-300 text-sm text-brand-gray-700">
          {isCustomer
            ? "This RVSF has returned your job to our marketplace. A new RVSF will reach out here when they unlock."
            : "This lead was returned to the marketplace — the thread is read-only. Another RVSF can now unlock it."}
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
          />
        ))}
      </div>

      {/* Composer */}
      {composerEnabled && (
        <div className="border-t border-brand-gray-300 p-3 bg-white">
          {showOfferInput ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">₹</span>
              <input
                type="number"
                min="100"
                value={offerInput}
                onChange={(e) => setOfferInput(e.target.value)}
                placeholder="Amount in rupees"
                className="flex-1 border border-brand-gray-300 rounded px-3 py-2"
              />
              <button
                onClick={() => postMessage({ type: "offer", offerAmountPaise: Number(offerInput) * 100 })}
                disabled={posting || !offerInput || Number(offerInput) < 1}
                className="btn-brand px-4 py-2"
              >
                {posting ? "Posting…" : "Send offer"}
              </button>
              <button onClick={() => setShowOfferInput(false)} className="text-sm text-brand-gray-500">Cancel</button>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={isCustomer
                  ? "Ask a question or share a detail about your vehicle…"
                  : "Introduce yourself and propose pickup…"}
                rows={2}
                className="flex-1 border border-brand-gray-300 rounded px-3 py-2 resize-none"
              />
              <button
                onClick={() => setShowOfferInput(true)}
                className="text-sm border border-brand-red text-brand-red rounded px-3 py-2 h-fit"
              >₹ Offer</button>
              <button
                onClick={() => postMessage({ type: "text", text: draft })}
                disabled={posting || !draft.trim()}
                className="btn-brand px-5 py-2"
              >
                {posting ? "…" : "Send"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Bubble({
  msg, isMine, currentUserRole, onAction,
}: {
  msg: Message
  isMine: boolean
  currentUserRole: string
  onAction: (mid: string, action: "accept" | "counter" | "reject", amount?: number) => void
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
    const canActOnIt = isOpen && !isMine && (currentUserRole === "customer" || currentUserRole === "rvsf_admin" || currentUserRole === "rvsf_executive")
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
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  if (confirm(`Accept ₹${(o.amountPaise / 100).toLocaleString("en-IN")} as the agreed price?\n\nThis will be recorded as the agreed price. Money and the vehicle change hands directly between you offline — ScrapCentre does not hold any payment.`)) {
                    onAction(msg._id, "accept")
                  }
                }}
                className="btn-unlock px-3 py-1.5 text-sm"
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
