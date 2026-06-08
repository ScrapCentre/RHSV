"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Send,
    Image as ImageIcon,
    DollarSign,
    Clock,
    Check,
    X,
    Loader2,
    MessageSquare,
    Pin,
    Paperclip,
    ChevronDown,
    ArrowRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import PusherClient from "pusher-js"

interface ChatMessage {
    _id?: string
    sender: "system" | "rvsf" | "customer"
    message: string
    isSystemMessage: boolean
    createdAt: string
    senderId?: string
    senderName?: string
    senderRole?: "system" | "rvsf" | "customer"
    content?: string
    type?: "text" | "image" | "offer" | "system"
    offerAmount?: number
    offerStatus?: "pending" | "accepted" | "countered" | "rejected" | "expired"
    offerExpiresAt?: string
}

interface ChatThread {
    _id: string
    leadId: string
    rvsfId: string
    customerId?: string
    messages: ChatMessage[]
    agreedPrice?: number
    agreedAt?: string
}

interface ChatContainerProps {
    role: "rvsf" | "customer"
    threadId: string
}

export default function ChatContainer({ role, threadId }: ChatContainerProps) {
    const { toast } = useToast()
    const [thread, setThread] = useState<ChatThread | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputText, setInputText] = useState("")
    const [loading, setLoading] = useState(true)

    const [showOfferForm, setShowOfferForm] = useState(false)
    const [offerAmount, setOfferAmount] = useState("")
    const [isSubmittingMessage, setIsSubmittingMessage] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState("")

    const [agreedPrice, setAgreedPrice] = useState<number | null>(null)
    const [agreedAt, setAgreedAt] = useState<string | null>(null)
    const [showScrollBtn, setShowScrollBtn] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)

    const [now, setNow] = useState(new Date())

    const fetchChatThread = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/chat/${threadId}`)
            const data = await res.json()
            if (res.ok && data.success) {
                setThread(data.thread)
                setMessages(data.thread.messages || [])
                if (data.thread.agreedPrice) {
                    setAgreedPrice(data.thread.agreedPrice)
                    setAgreedAt(data.thread.agreedAt || null)
                }
            } else {
                toast({ title: "Error loading chat", description: data.message || "Failed to load.", variant: "destructive" })
            }
        } catch (err) {
            console.error("Fetch thread error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchChatThread() }, [threadId])

    useEffect(() => {
        if (!threadId) return
        const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY || "dummy_key", {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2",
            forceTLS: true,
        })
        const channel = pusher.subscribe(threadId)
        channel.bind("new-message", (message: ChatMessage) => {
            setMessages(prev => {
                const exists = prev.some(m => m._id && message._id && m._id === message._id)
                return exists ? prev : [...prev, message]
            })
        })
        channel.bind("offer-updated", (data: { messageId: string; offerStatus: any; agreedPrice?: number; agreedAt?: string }) => {
            setMessages(prev => prev.map(msg => msg._id === data.messageId ? { ...msg, offerStatus: data.offerStatus } : msg))
            if (data.agreedPrice) { setAgreedPrice(data.agreedPrice); setAgreedAt(data.agreedAt || null) }
        })
        return () => { channel.unbind_all(); channel.unsubscribe(); pusher.disconnect() }
    }, [threadId])

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(t)
    }, [])

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

    const handleScroll = () => {
        const c = scrollContainerRef.current
        if (!c) return
        setShowScrollBtn(c.scrollHeight - c.scrollTop - c.clientHeight > 120)
    }

    const activeOffer = messages.find(
        msg => msg.type === "offer" && msg.offerStatus === "pending" && msg.offerExpiresAt && new Date(msg.offerExpiresAt) > now
    )
    const isOfferPending = !!activeOffer

    const handleSendMessage = async (e?: React.FormEvent, type: "text" | "image" | "offer" = "text", customContent?: string) => {
        if (e) e.preventDefault()
        if (isSubmittingMessage) return
        const finalContent = type === "text" ? inputText.trim() : (customContent || "")
        const amountVal = type === "offer" ? Number(offerAmount) : undefined
        if (type === "text" && !finalContent) return
        if (type === "offer" && (!amountVal || isNaN(amountVal) || amountVal <= 0)) {
            toast({ title: "Invalid Offer", description: "Please enter a valid amount.", variant: "destructive" })
            return
        }
        setIsSubmittingMessage(true)
        try {
            const res = await fetch(`/api/chat/${threadId}/message`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, content: finalContent, offerAmount: amountVal }),
            })
            const data = await res.json()
            if (res.ok && data.success) {
                setMessages(prev => {
                    const exists = prev.some(m => m._id && data.message._id && m._id === data.message._id)
                    return exists ? prev : [...prev, data.message]
                })
                if (type === "text") { setInputText(""); inputRef.current?.focus() }
                if (type === "offer") { setOfferAmount(""); setShowOfferForm(false) }
            } else {
                toast({ title: "Message Failed", description: data.message || "Failed to send.", variant: "destructive" })
            }
        } catch (err) { console.error(err) } finally { setIsSubmittingMessage(false) }
    }

    const handleImageAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setIsUploading(true); setUploadProgress("Uploading...")
        try {
            const formData = new FormData(); formData.append("file", file)
            const res = await fetch("/api/chat/upload", { method: "POST", body: formData })
            const data = await res.json()
            if (res.ok && data.url) { await handleSendMessage(undefined, "image", data.url) }
            else toast({ title: "Upload Failed", description: data.message, variant: "destructive" })
        } catch {
            toast({ title: "Upload Error", description: "Something went wrong.", variant: "destructive" })
        } finally {
            setIsUploading(false); setUploadProgress("")
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const handleOfferAction = async (action: "accept" | "reject" | "counter", counterPrice?: number) => {
        if (isSubmittingMessage) return
        setIsSubmittingMessage(true)
        try {
            const res = await fetch(`/api/chat/${threadId}/offer`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, counterAmount: counterPrice }),
            })
            const data = await res.json()
            if (res.ok && data.success) {
                toast({ title: "Offer Updated", description: `Offer ${action}ed!` })
                if (action === "accept") { setAgreedPrice(data.agreedPrice); setAgreedAt(data.agreedAt) }
                fetchChatThread()
            } else {
                toast({ title: "Action Failed", description: data.message, variant: "destructive" })
            }
        } catch (err) { console.error(err) } finally { setIsSubmittingMessage(false) }
    }

    const formatCountdown = (expiresAt: string) => {
        const ms = new Date(expiresAt).getTime() - now.getTime()
        if (ms <= 0) return "Expired"
        const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000)
        if (h > 0) return `${h}h ${m}m left`
        if (m > 0) return `${m}m ${s}s left`
        return `${s}s left`
    }

    // ─── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl sm:rounded-3xl border border-red-100"
                style={{ height: "clamp(320px, 50vh, 480px)", background: "#fff5f5" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(227,30,36,0.08)", border: "1.5px solid rgba(227,30,36,0.18)" }}>
                    <Loader2 className="w-6 h-6 text-[#E31E24] animate-spin" />
                </div>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-red-400">Loading Chat...</p>
            </div>
        )
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div
            className="flex flex-col overflow-hidden relative"
            style={{
                height: "clamp(480px, 72vh, 700px)",
                background: "#ffffff",
                border: "1.5px solid #fecaca",
                borderRadius: "20px",
                boxShadow: "0 8px 40px rgba(227,30,36,0.10), 0 2px 8px rgba(0,0,0,0.06)",
            }}
        >
            {/* ── AGREED DEAL BANNER ───────────────────────────────────────── */}
            <AnimatePresence>
                {agreedPrice && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        className="flex-shrink-0 overflow-hidden"
                        style={{ background: "linear-gradient(90deg, #dcfce7, #f0fdf4)", borderBottom: "1.5px solid #86efac" }}
                    >
                        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-6 h-6 flex-shrink-0 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Pin className="w-3.5 h-3.5 text-green-600" />
                                </div>
                                <span className="text-xs sm:text-sm font-bold text-green-800 truncate">
                                    Deal Pinned:{" "}
                                    <span className="font-black text-green-900">₹{agreedPrice.toLocaleString("en-IN")}</span>
                                    {agreedAt && <span className="font-medium text-green-700"> · {new Date(agreedAt).toLocaleDateString("en-IN")}</span>}
                                </span>
                            </div>
                            <span className="flex-shrink-0 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                                ✓ Proceeding Offline
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── HEADER ───────────────────────────────────────────────────── */}
            <div
                className="flex-shrink-0 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3"
                style={{
                    background: "linear-gradient(135deg, #E31E24 0%, #c01319 100%)",
                }}
            >
                <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-extrabold text-white text-sm border border-white/30">
                            {role === "rvsf" ? "C" : "P"}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#E31E24]" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-extrabold text-white text-sm sm:text-base leading-tight truncate">
                            {role === "rvsf" ? "Customer Lead Chat" : "RVSF Partner Desk"}
                        </h3>
                        <p className="text-[10px] text-red-200 font-mono tracking-tight mt-0.5">
                            Thread #{threadId.slice(-8).toUpperCase()}
                        </p>
                    </div>
                </div>

                {/* Live pill */}
                <div className="flex items-center gap-1.5 flex-shrink-0 px-2.5 py-1 rounded-full bg-white/15 border border-white/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                    <span className="text-[10px] font-extrabold text-white uppercase tracking-widest">Live</span>
                </div>
            </div>

            {/* ── MESSAGES ─────────────────────────────────────────────────── */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-3 scroll-smooth"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#fecaca transparent", background: "#fff8f8" }}
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 text-red-200" />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-500 text-sm font-bold">No messages yet</p>
                            <p className="text-slate-400 text-xs mt-1">Start the conversation below</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isSystem = msg.isSystemMessage || msg.sender === "system"
                        const isMe = msg.sender === role

                        // ── SYSTEM ─────────────────────────────────────────
                        if (isSystem) {
                            return (
                                <motion.div
                                    key={msg._id ? `sys-${msg._id}-${idx}` : `sys-idx-${idx}`}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-center w-full my-1"
                                >
                                    <span className="px-3 py-1.5 rounded-full text-[10px] sm:text-xs text-slate-500 italic font-medium text-center max-w-xs sm:max-w-md bg-white border border-slate-200 shadow-sm">
                                        {msg.message}
                                    </span>
                                </motion.div>
                            )
                        }

                        // ── OFFER CARD ─────────────────────────────────────
                        if (msg.type === "offer") {
                            const isExpired = msg.offerExpiresAt && new Date(msg.offerExpiresAt) <= now
                            const isThisOfferPending = msg.offerStatus === "pending" && !isExpired
                            const isOfferRecipient = msg.sender !== role

                            const statusStyles: Record<string, { bg: string; border: string; text: string }> = {
                                accepted: { bg: "#f0fdf4", border: "#86efac", text: "#15803d" },
                                countered: { bg: "#faf5ff", border: "#d8b4fe", text: "#7e22ce" },
                                rejected: { bg: "#fff1f2", border: "#fecdd3", text: "#be123c" },
                                expired: { bg: "#f8fafc", border: "#e2e8f0", text: "#64748b" },
                                pending: { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
                            }

                            return (
                                <motion.div
                                    key={msg._id ? `offer-${msg._id}-${idx}` : `offer-idx-${idx}`}
                                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className={`flex ${isMe ? "justify-end" : "justify-start"} w-full`}
                                >
                                    <div
                                        className="w-full max-w-xs sm:max-w-sm rounded-2xl overflow-hidden"
                                        style={{
                                            background: "#fff",
                                            border: "1.5px solid #fecaca",
                                            boxShadow: "0 4px 20px rgba(227,30,36,0.10)",
                                        }}
                                    >
                                        {/* Offer header */}
                                        <div className="px-4 py-3 flex items-center justify-between gap-4"
                                            style={{ background: "linear-gradient(135deg,#E31E24,#c01319)", borderBottom: "1px solid #fecaca" }}>
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 text-white">
                                                <DollarSign className="w-3 h-3" /> Negotiation Offer
                                            </span>
                                            {isThisOfferPending && msg.offerExpiresAt && (
                                                <span className="text-[10px] font-bold font-mono flex items-center gap-1 text-red-100">
                                                    <Clock className="w-3 h-3" /> {formatCountdown(msg.offerExpiresAt)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Offer body */}
                                        <div className="p-4 space-y-3">
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-medium mb-0.5">
                                                    {msg.senderName || (isMe ? "You" : "Partner")} proposed:
                                                </p>
                                                <p className="text-2xl sm:text-3xl font-black text-slate-800 select-all">
                                                    ₹{(msg.offerAmount || 0).toLocaleString("en-IN")}
                                                </p>
                                            </div>

                                            {msg.offerStatus !== "pending" && (() => {
                                                const s = statusStyles[msg.offerStatus as string] || statusStyles.expired
                                                return (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider"
                                                        style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
                                                        {msg.offerStatus}
                                                    </span>
                                                )
                                            })()}

                                            {isExpired && msg.offerStatus === "pending" && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-slate-50 border border-slate-200 text-slate-500">
                                                    Expired
                                                </span>
                                            )}

                                            {/* Action CTAs */}
                                            {isThisOfferPending && isOfferRecipient && (
                                                <div className="flex flex-wrap gap-2 pt-2 border-t border-red-50">
                                                    <button onClick={() => handleOfferAction("accept")} disabled={isSubmittingMessage}
                                                        className="flex-1 min-w-[70px] py-2 px-3 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                                                        style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", boxShadow: "0 2px 8px rgba(22,163,74,0.3)" }}>
                                                        <Check className="w-3.5 h-3.5" /> Accept
                                                    </button>
                                                    <button onClick={() => { setOfferAmount(String(msg.offerAmount)); setShowOfferForm(true) }}
                                                        disabled={isSubmittingMessage}
                                                        className="flex-1 min-w-[70px] py-2 px-3 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                                                        style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 2px 8px rgba(124,58,237,0.3)" }}>
                                                        Counter
                                                    </button>
                                                    <button onClick={() => handleOfferAction("reject")} disabled={isSubmittingMessage}
                                                        className="flex-1 min-w-[70px] py-2 px-3 text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1 text-[#E31E24]"
                                                        style={{ background: "#fff1f2", border: "1px solid #fecaca" }}>
                                                        <X className="w-3.5 h-3.5" /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        }

                        // ── TEXT / IMAGE BUBBLE ────────────────────────────
                        return (
                            <motion.div
                                key={msg._id ? `msg-${msg._id}-${idx}` : `msg-idx-${idx}`}
                                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.16 }}
                                className={`flex ${isMe ? "justify-end" : "justify-start"} w-full`}
                            >
                                <div className={`max-w-[80%] sm:max-w-[70%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                                    {!isMe && msg.senderName && (
                                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
                                            {msg.senderName}
                                        </span>
                                    )}

                                    <div
                                        className={`px-3.5 py-2.5 sm:px-4 sm:py-3 ${isMe ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-bl-md"}`}
                                        style={isMe ? {
                                            background: "linear-gradient(135deg, #E31E24, #c01319)",
                                            color: "#fff",
                                            boxShadow: "0 4px 14px rgba(227,30,36,0.22)",
                                        } : {
                                            background: "#ffffff",
                                            border: "1.5px solid #fecaca",
                                            color: "#1e293b",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                        }}
                                    >
                                        {msg.type === "image" ? (
                                            <div className="space-y-1">
                                                <img src={msg.message} alt="Attachment"
                                                    className="max-h-48 sm:max-h-64 w-full rounded-xl object-contain bg-red-50 border border-red-100" />
                                                <p className="text-[9px] text-right opacity-40 font-mono">Image</p>
                                            </div>
                                        ) : (
                                            <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap break-words">
                                                {msg.message}
                                            </p>
                                        )}

                                        <div className={`flex mt-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
                                            <span className="text-[9px] font-mono opacity-40">
                                                {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* ── SCROLL TO BOTTOM ─────────────────────────────────────────── */}
            <AnimatePresence>
                {showScrollBtn && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                        className="absolute bottom-24 right-4 sm:right-5 w-9 h-9 rounded-full flex items-center justify-center z-10"
                        style={{ background: "linear-gradient(135deg,#E31E24,#c01319)", boxShadow: "0 4px 12px rgba(227,30,36,0.35)" }}
                    >
                        <ChevronDown className="w-4 h-4 text-white" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── UPLOAD PROGRESS ──────────────────────────────────────────── */}
            <AnimatePresence>
                {isUploading && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex-shrink-0 px-4 py-2.5 flex items-center gap-2 text-xs"
                        style={{ background: "#fff1f2", borderTop: "1px solid #fecaca" }}
                    >
                        <Loader2 className="w-3.5 h-3.5 text-[#E31E24] animate-spin" />
                        <span className="font-semibold text-[#E31E24]">{uploadProgress}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── OFFER FORM OVERLAY ───────────────────────────────────────── */}
            <AnimatePresence>
                {showOfferForm && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-[72px] sm:bottom-[76px] inset-x-3 sm:inset-x-4 z-20 rounded-2xl overflow-hidden"
                        style={{ background: "#fff", border: "1.5px solid #fecaca", boxShadow: "0 -8px 32px rgba(227,30,36,0.12)" }}
                    >
                        <div className="p-4">
                            {/* Offer header strip */}
                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-red-100">
                                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-[#E31E24]" />
                                    {isOfferPending ? "Counter Offer" : "Propose Offer"}
                                </span>
                                <button onClick={() => setShowOfferForm(false)}
                                    className="w-6 h-6 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <div className="relative flex-1">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">₹</span>
                                    <input
                                        type="number"
                                        placeholder="Enter amount..."
                                        value={offerAmount}
                                        onChange={(e) => setOfferAmount(e.target.value)}
                                        autoFocus
                                        className="w-full rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none transition-all"
                                        style={{ background: "#fff8f8", border: "1.5px solid #fecaca" }}
                                        onFocus={e => e.target.style.borderColor = "#E31E24"}
                                        onBlur={e => e.target.style.borderColor = "#fecaca"}
                                    />
                                </div>
                                <button
                                    onClick={(e) => {
                                        if (isOfferPending) {
                                            handleOfferAction("counter", Number(offerAmount))
                                            setOfferAmount(""); setShowOfferForm(false)
                                        } else {
                                            handleSendMessage(e, "offer")
                                        }
                                    }}
                                    disabled={isSubmittingMessage || !offerAmount}
                                    className="px-4 py-2.5 text-white text-xs font-extrabold rounded-xl disabled:opacity-40 transition-all flex items-center gap-1.5"
                                    style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", boxShadow: "0 3px 10px rgba(22,163,74,0.3)" }}
                                >
                                    {isSubmittingMessage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                                    Send
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── INPUT BAR ────────────────────────────────────────────────── */}
            <div
                className="flex-shrink-0 p-3 sm:p-4"
                style={{ borderTop: "1.5px solid #fecaca", background: "#fff" }}
            >
                {/* Toolbar row */}
                <div className="flex items-center justify-between mb-2.5">
                    <button
                        onClick={() => setShowOfferForm(prev => !prev)}
                        disabled={isOfferPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all"
                        style={isOfferPending ? {
                            background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", cursor: "not-allowed", opacity: 0.75
                        } : {
                            background: "#fff1f2", border: "1.5px solid #fecaca", color: "#E31E24",
                        }}
                    >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isOfferPending ? "Offer Pending..." : "Make an Offer"}</span>
                        <span className="sm:hidden">{isOfferPending ? "Pending..." : "Offer"}</span>
                    </button>
                    <span className="text-[10px] text-slate-400 italic hidden sm:inline">*Agreed deals proceed offline</span>
                </div>

                {/* Message row */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleImageAttachment} className="hidden" accept="image/*" />

                    {/* Attachment */}
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || isSubmittingMessage}
                        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                        style={{ background: "#fff1f2", border: "1.5px solid #fecaca", color: "#E31E24" }}
                        title="Upload Image">
                        <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Text input */}
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
                        style={{ background: "#fff8f8", border: "1.5px solid #fecaca" }}
                        onFocus={e => e.target.style.borderColor = "#E31E24"}
                        onBlur={e => e.target.style.borderColor = "#fecaca"}
                    />

                    {/* Send */}
                    <button
                        type="submit"
                        disabled={isSubmittingMessage || isUploading || !inputText.trim()}
                        className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all active:scale-95"
                        style={{
                            background: inputText.trim()
                                ? "linear-gradient(135deg,#E31E24,#c01319)"
                                : "#fff1f2",
                            border: inputText.trim() ? "none" : "1.5px solid #fecaca",
                            boxShadow: inputText.trim() ? "0 4px 12px rgba(227,30,36,0.30)" : "none",
                        }}
                    >
                        {isSubmittingMessage
                            ? <Loader2 className="w-4 h-4 text-[#E31E24] animate-spin" />
                            : <Send className={`w-4 h-4 ${inputText.trim() ? "text-white" : "text-[#E31E24]"}`} />
                        }
                    </button>
                </form>
            </div>
        </div>
    )
}
