"use client"

/**
 * /b2b/chat/[leadId] — Partner Chat Thread Page — ScrapCentre.com
 * NEW page per engineering-design §9, §13, design-system §4.17.
 * Note: the route param is `leadId` but the actual value is the threadId
 *   (returned by POST /api/marketplace/leads/:id/buy as `threadId`).
 *   The URL is /b2b/chat/<threadId> — the param name is leadId for route clarity.
 * Polling: GET /api/chat/threads/:threadId/messages?since=<ISO> every 5 seconds.
 * Auth: role === "partner".
 * Uses: DocumentUploader (for photo messages)
 */

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Send, Phone, ChevronLeft, Camera, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const POLL_INTERVAL_MS = 5000 // 5 seconds — change this one constant to switch to WebSockets later

interface ChatMessage {
  _id: string
  senderRole: "customer" | "partner"
  textContent: string | null
  photoUrl: string | null
  createdAt: string
}

interface ThreadMeta {
  customerPhone: string | null
  customerName: string | null
  marketplaceLeadId: string
  status: string
}

export default function ChatPage() {
  const params = useParams()
  const threadId = params.leadId as string
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const [threadMeta, setThreadMeta] = useState<ThreadMeta | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastMessageAtRef = useRef<string | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const photoInputRef = useRef<HTMLInputElement | null>(null)

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/b2b")
    if (status === "authenticated" && (session?.user as any)?.role !== "partner") {
      router.replace("/b2b")
    }
  }, [status, session, router])

  // Load thread metadata
  useEffect(() => {
    if (!threadId) return
    fetch(`/api/chat/threads`)
      .then((r) => r.json())
      .then((data) => {
        const thread = (data.threads ?? data ?? []).find(
          (t: any) => t._id === threadId || t.id === threadId
        )
        if (thread) setThreadMeta(thread)
      })
      .catch(() => {})
  }, [threadId])

  // Initial message load
  useEffect(() => {
    if (!threadId) return
    fetch(`/api/chat/threads/${threadId}/messages`)
      .then((r) => r.json())
      .then((data) => {
        const msgs: ChatMessage[] = data.messages ?? data ?? []
        setMessages(msgs)
        if (msgs.length > 0) {
          lastMessageAtRef.current = msgs[msgs.length - 1].createdAt
        }
      })
      .catch(() => {})
  }, [threadId])

  // Polling
  const poll = useCallback(async () => {
    if (!threadId) return
    const since = lastMessageAtRef.current
    const url = since
      ? `/api/chat/threads/${threadId}/messages?since=${encodeURIComponent(since)}`
      : `/api/chat/threads/${threadId}/messages`

    try {
      const res = await fetch(url)
      if (!res.ok) return
      const data = await res.json()
      const newMsgs: ChatMessage[] = data.messages ?? data ?? []
      if (newMsgs.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id))
          const appended = [...prev, ...newMsgs.filter((m) => !existingIds.has(m._id))]
          return appended
        })
        lastMessageAtRef.current = newMsgs[newMsgs.length - 1].createdAt
      }
    } catch {
      // Poll failure is non-critical — try again on next interval
    }
  }, [threadId])

  useEffect(() => {
    pollerRef.current = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      if (pollerRef.current) clearInterval(pollerRef.current)
    }
  }, [poll])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isSending) return
    setIsSending(true)
    const text = input.trim()
    setInput("")
    try {
      const res = await fetch(`/api/chat/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", textContent: text }),
      })
      if (!res.ok) throw new Error("Send failed")
      const data = await res.json()
      if (data.message) {
        setMessages((prev) => [...prev, data.message])
        lastMessageAtRef.current = data.message.createdAt
      }
    } catch {
      toast({ title: "Message failed to send. Try again.", variant: "destructive" })
      setInput(text)
    } finally {
      setIsSending(false)
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append("type", "photo")
      formData.append("file", file)
      const res = await fetch(`/api/chat/threads/${threadId}/messages`, {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      if (data.message) {
        setMessages((prev) => [...prev, data.message])
        lastMessageAtRef.current = data.message.createdAt
      }
    } catch {
      toast({ title: "Photo upload failed. Check your signal and try again.", variant: "destructive" })
    } finally {
      setIsUploadingPhoto(false)
      if (e.target) e.target.value = ""
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[var(--brand-bg)]">
      {/* Chat header */}
      <header className="bg-white border-b border-[var(--brand-gray-300)] px-4 py-3 shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/b2b/marketplace" className="text-[var(--brand-gray-500)] hover:text-[var(--brand-red)]">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-[var(--brand-black)] truncate">
              Chat — Lead {threadId.slice(-5).toUpperCase()}
            </p>
            {threadMeta?.customerPhone ? (
              <a
                href={`tel:${threadMeta.customerPhone}`}
                className="flex items-center gap-1 text-xs text-[var(--brand-gray-500)] hover:text-[var(--brand-red)]"
              >
                <Phone className="w-3 h-3" />
                {threadMeta.customerName ?? "Customer"} · {threadMeta.customerPhone}
              </a>
            ) : (
              <p className="text-xs text-[var(--brand-gray-500)]">Customer contact unlocked on purchase</p>
            )}
          </div>
        </div>
        {threadMeta?.customerPhone && (
          <p className="text-xs text-[var(--brand-gray-500)] max-w-2xl mx-auto mt-1 pl-8">
            You may contact the customer directly using the details above. Off-platform communication is at your discretion.
          </p>
        )}
      </header>

      {/* Messages area */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-sm text-[var(--brand-gray-500)] py-8">
              No messages yet. Send the first one to get the conversation started.
            </p>
          )}
          {messages.map((msg) => {
            const isPartner = msg.senderRole === "partner"
            return (
              <div key={msg._id} className={`flex ${isPartner ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isPartner
                      ? "bg-[var(--brand-red)] text-white rounded-br-md"
                      : "bg-white text-[var(--brand-black)] border border-[var(--brand-gray-300)] rounded-bl-md"
                  }`}
                >
                  <p className="text-xs font-medium mb-0.5 opacity-70">
                    {isPartner ? "You (RVSF)" : "Customer"}
                  </p>
                  {msg.textContent && (
                    <p className="text-sm leading-relaxed">{msg.textContent}</p>
                  )}
                  {msg.photoUrl && (
                    <div>
                      <img
                        src={msg.photoUrl}
                        alt="[Photo shared]"
                        className="rounded-lg max-w-full max-h-48 object-cover mt-1"
                      />
                      <p className="text-xs opacity-60 mt-0.5">[Photo shared]</p>
                    </div>
                  )}
                  <p className="text-xs opacity-50 mt-1 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Message input */}
      <footer className="bg-white border-t border-[var(--brand-gray-300)] px-4 py-3 shrink-0 pb-safe">
        <form onSubmit={sendMessage} className="max-w-2xl mx-auto flex items-center gap-2">
          {/* Photo button */}
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            disabled={isUploadingPhoto}
            aria-label="Send photo"
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--brand-gray-300)] text-[var(--brand-gray-500)] hover:text-[var(--brand-red)] hover:border-[var(--brand-red)] transition-colors"
          >
            {isUploadingPhoto ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-10 px-4 border border-[var(--brand-gray-300)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)] bg-white"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage(e as any)
              }
            }}
          />

          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="h-10 px-4 bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)] disabled:opacity-50 text-white font-semibold rounded-xl flex items-center gap-1.5 transition-colors text-sm"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </footer>
    </div>
  )
}
