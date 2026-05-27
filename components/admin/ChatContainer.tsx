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
    Paperclip, 
    Loader2, 
    AlertCircle, 
    MessageSquare,
    ChevronDown,
    Pin,
    ArrowRight
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
    
    // Negotiation offer states
    const [showOfferForm, setShowOfferForm] = useState(false)
    const [offerAmount, setOfferAmount] = useState("")
    const [isSubmittingMessage, setIsSubmittingMessage] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState("")
    
    // Final pinned price state
    const [agreedPrice, setAgreedPrice] = useState<number | null>(null)
    const [agreedAt, setAgreedAt] = useState<string | null>(null)

    // References
    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    // Current Time for live countdowns
    const [now, setNow] = useState(new Date())

    // 1. Fetch initial chat thread data
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
                toast({
                    title: "Error loading chat",
                    description: data.message || "Failed to retrieve conversation history.",
                    variant: "destructive",
                })
            }
        } catch (err) {
            console.error("Fetch thread error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchChatThread()
    }, [threadId])

    // 2. Real-time Pusher listening
    useEffect(() => {
        if (!threadId) return

        // Initialize Pusher Client
        const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "dummy_key"
        const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2"

        const pusher = new PusherClient(pusherKey, {
            cluster: pusherCluster,
            forceTLS: true,
        })

        const channel = pusher.subscribe(threadId)

        // Bind events
        channel.bind("new-message", (message: ChatMessage) => {
            setMessages(prev => {
                // Prevent duplicate messages in list if we already sent them locally
                const exists = prev.some(m => m._id && message._id && m._id === message._id)
                if (exists) return prev
                return [...prev, message]
            })
        })

        channel.bind("offer-updated", (data: { messageId: string, offerStatus: any, agreedPrice?: number, agreedAt?: string }) => {
            setMessages(prev => prev.map(msg => {
                if (msg._id && msg._id === data.messageId) {
                    return { ...msg, offerStatus: data.offerStatus }
                }
                return msg
            }))
            if (data.agreedPrice) {
                setAgreedPrice(data.agreedPrice)
                setAgreedAt(data.agreedAt || null)
            }
        })

        return () => {
            channel.unbind_all()
            channel.unsubscribe()
            pusher.disconnect()
        }
    }, [threadId])

    // 3. Keep updating countdown timers every second
    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    // 4. Auto-scroll to latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Detect if an offer is currently pending (Active Offer Rule)
    const activeOffer = messages.find(
        msg => 
            msg.type === "offer" && 
            msg.offerStatus === "pending" && 
            msg.offerExpiresAt && 
            new Date(msg.offerExpiresAt) > now
    )

    const isOfferPending = !!activeOffer

    // 5. Send dynamic messages
    const handleSendMessage = async (e?: React.FormEvent, type: "text" | "image" | "offer" = "text", customContent?: string) => {
        if (e) e.preventDefault()
        if (isSubmittingMessage) return

        let finalContent = type === "text" ? inputText.trim() : (customContent || "")
        let amountVal = type === "offer" ? Number(offerAmount) : undefined

        if (type === "text" && !finalContent) return
        if (type === "offer" && (!amountVal || isNaN(amountVal) || amountVal <= 0)) {
            toast({
                title: "Invalid Offer",
                description: "Please enter a valid offer amount.",
                variant: "destructive",
            })
            return
        }

        setIsSubmittingMessage(true)
        try {
            const res = await fetch(`/api/chat/${threadId}/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    content: finalContent,
                    offerAmount: amountVal,
                }),
            })

            const data = await res.json()
            if (res.ok && data.success) {
                // Add message locally optimistically (de-duplicated)
                setMessages(prev => {
                    const exists = prev.some(m => m._id && data.message._id && m._id === data.message._id)
                    if (exists) return prev
                    return [...prev, data.message]
                })
                if (type === "text") setInputText("")
                if (type === "offer") {
                    setOfferAmount("")
                    setShowOfferForm(false)
                }
            } else {
                toast({
                    title: "Message Failed",
                    description: data.message || "Failed to dispatch message.",
                    variant: "destructive",
                })
            }
        } catch (err) {
            console.error("Message dispatch exception:", err)
        } finally {
            setIsSubmittingMessage(false)
        }
    }

    // 6. Handle image attachment upload to Cloudinary
    const handleImageAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setUploadProgress("Uploading to Cloudinary...")

        try {
            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch("/api/chat/upload", {
                method: "POST",
                body: formData,
            })

            const data = await res.json()
            if (res.ok && data.url) {
                setUploadProgress("Success!")
                // Dispatch as image message
                await handleSendMessage(undefined, "image", data.url)
            } else {
                toast({
                    title: "Upload Failed",
                    description: data.message || "Failed to upload image.",
                    variant: "destructive",
                })
            }
        } catch (err) {
            console.error("Upload error:", err)
            toast({
                title: "Upload Error",
                description: "Something went wrong during file upload.",
                variant: "destructive",
            })
        } finally {
            setIsUploading(false)
            setUploadProgress("")
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    // 7. Handle Accept / Reject / Counter actions on offers
    const handleOfferAction = async (action: "accept" | "reject" | "counter", counterPrice?: number) => {
        if (isSubmittingMessage) return

        setIsSubmittingMessage(true)
        try {
            const res = await fetch(`/api/chat/${threadId}/offer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    counterAmount: counterPrice,
                }),
            })

            const data = await res.json()
            if (res.ok && data.success) {
                toast({
                    title: "Offer Updated",
                    description: `Offer successfully ${action}ed!`,
                })

                if (action === "accept") {
                    setAgreedPrice(data.agreedPrice)
                    setAgreedAt(data.agreedAt)
                }

                // Soft refresh local thread message statuses
                fetchChatThread()
            } else {
                toast({
                    title: "Action Failed",
                    description: data.message || `Failed to process ${action} action.`,
                    variant: "destructive",
                })
            }
        } catch (err) {
            console.error("Offer action exception:", err)
        } finally {
            setIsSubmittingMessage(false)
        }
    }

    // 8. Countdown Formatter Utility
    const formatCountdown = (expiresAt: string) => {
        const timeRemaining = new Date(expiresAt).getTime() - now.getTime()
        if (timeRemaining <= 0) return "Expired"

        const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

        return `${hours}h ${minutes}m ${seconds}s remaining`
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#E31E24]" />
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Loading Live Stream</p>
            </div>
        )
    }

    return (
        <div className="bg-[#0E192D]/60 backdrop-blur border border-slate-800 rounded-3xl h-[650px] flex flex-col overflow-hidden relative shadow-2xl">
            {/* 1. AGREE PINNED PRICE HEADER BANNER */}
            <AnimatePresence>
                {agreedPrice && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-500/15 border-b border-emerald-500/20 py-3 px-6 flex items-center justify-between text-emerald-400 z-10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/20 p-1.5 rounded-lg">
                                <Pin className="w-4 h-4 text-emerald-400 animate-pulse" />
                            </div>
                            <span className="text-sm font-bold tracking-tight">
                                Pinned Deal: Agreed on <strong className="text-white text-base">₹{agreedPrice}</strong> {agreedAt ? `on ${new Date(agreedAt).toLocaleDateString("en-IN")}` : ""}!
                            </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-0.5 rounded-full">
                            proceeding offline
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header info */}
            <div className="py-4 px-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-extrabold text-sm">
                        {role === "rvsf" ? "C" : "P"}
                    </div>
                    <div>
                        <h3 className="font-extrabold text-white text-sm">
                            {role === "rvsf" ? "Customer Lead Chat" : "RVSF Partner Desk"}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">
                            Thread: {threadId.slice(-8)}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. CHAT SCROLL WINDOW */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                        <MessageSquare className="w-10 h-10 text-slate-700" />
                        <p className="text-xs font-semibold uppercase tracking-widest">No Messages Yet</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isSystem = msg.isSystemMessage || msg.sender === "system"
                        const isMe = msg.sender === role

                        if (isSystem) {
                            return (
                                <div key={msg._id ? `sys-${msg._id}-${idx}` : `sys-idx-${idx}`} className="flex justify-center w-full my-2">
                                    <span className="bg-slate-900/60 border border-slate-800/80 px-4 py-1.5 rounded-full text-xs text-slate-400 italic text-center font-medium max-w-md">
                                        {msg.message}
                                    </span>
                                </div>
                            )
                        }

                        if (msg.type === "offer") {
                            // Render structured negotiation bubble
                            const isExpired = msg.offerExpiresAt && new Date(msg.offerExpiresAt) <= now
                            const isOfferPending = msg.offerStatus === "pending" && !isExpired
                            const isOfferRecipient = msg.sender !== role

                            return (
                                <div key={msg._id ? `offer-${msg._id}-${idx}` : `offer-idx-${idx}`} className={`flex ${isMe ? "justify-end" : "justify-start"} w-full my-3`}>
                                    <div className="bg-[#111C35] border border-slate-800 max-w-sm rounded-2xl overflow-hidden shadow-xl">
                                        {/* Card Header */}
                                        <div className="bg-[#E31E24]/10 border-b border-slate-800 py-3 px-4.5 flex justify-between items-center gap-6">
                                            <span className="text-[10px] font-extrabold uppercase text-[#E31E24] tracking-widest flex items-center gap-1.5">
                                                <DollarSign className="w-3 h-3" /> Negotiation Offer
                                            </span>
                                            {isOfferPending && msg.offerExpiresAt && (
                                                <span className="text-[10px] text-slate-400 font-mono font-semibold flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-orange-400" />
                                                    {formatCountdown(msg.offerExpiresAt)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-5 space-y-4">
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium">
                                                    {msg.senderName || (isMe ? "You" : "Opponent")} proposed:
                                                </p>
                                                <h4 className="text-2xl font-black text-white mt-1 select-all">
                                                    ₹{msg.offerAmount}
                                                </h4>
                                            </div>

                                            {/* Offer statuses badges */}
                                            {msg.offerStatus !== "pending" && (
                                                <div className="pt-1.5">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border ${
                                                        msg.offerStatus === "accepted" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                        msg.offerStatus === "countered" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                                        msg.offerStatus === "expired" ? "bg-slate-500/10 text-slate-400 border-slate-500/20" :
                                                        "bg-red-500/10 text-red-400 border-red-500/20"
                                                    }`}>
                                                        {msg.offerStatus}
                                                    </span>
                                                </div>
                                            )}

                                            {isExpired && msg.offerStatus === "pending" && (
                                                <div className="pt-1.5">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border bg-slate-500/10 text-slate-400 border-slate-500/20">
                                                        Expired
                                                    </span>
                                                </div>
                                            )}

                                            {/* Card Action CTAs for Recipient */}
                                            {isOfferPending && isOfferRecipient && (
                                                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/50">
                                                    <button 
                                                        onClick={() => handleOfferAction("accept")}
                                                        disabled={isSubmittingMessage}
                                                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1 shadow"
                                                    >
                                                        <Check className="w-3.5 h-3.5" /> Accept
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setOfferAmount(String(msg.offerAmount))
                                                            setShowOfferForm(true)
                                                        }}
                                                        disabled={isSubmittingMessage}
                                                        className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1 shadow"
                                                    >
                                                        Counter
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOfferAction("reject")}
                                                        disabled={isSubmittingMessage}
                                                        className="flex-1 py-2 px-3 bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 text-red-400 font-bold text-xs rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1 shadow"
                                                    >
                                                        <X className="w-3.5 h-3.5" /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        // Text or image message bubble
                        return (
                            <div key={msg._id ? `msg-${msg._id}-${idx}` : `msg-idx-${idx}`} className={`flex ${isMe ? "justify-end" : "justify-start"} w-full`}>
                                <div className={`max-w-md p-4.5 rounded-2xl relative shadow-md ${
                                    isMe 
                                        ? "bg-blue-600 text-white rounded-br-none" 
                                        : "bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none"
                                }`}>
                                    {/* Sender tag if other */}
                                    {!isMe && (
                                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                                            {msg.senderName}
                                        </p>
                                    )}

                                    {/* Content payload */}
                                    {msg.type === "image" ? (
                                        <div className="space-y-1.5">
                                            <img 
                                                src={msg.message} 
                                                alt="Attachment" 
                                                className="max-h-64 rounded-lg object-contain bg-slate-950 border border-slate-800"
                                            />
                                            <p className="text-[9px] text-right text-slate-300 opacity-60">Image Attachment</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap break-words">
                                            {msg.message}
                                        </p>
                                    )}

                                    {/* Date Stamp */}
                                    <div className="flex justify-end pt-1 mt-1 opacity-50">
                                        <span className="text-[9px] tracking-tight font-mono">
                                            {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Live Upload Progress Indicator */}
            {isUploading && (
                <div className="absolute inset-x-0 bottom-20 bg-slate-900/90 border-y border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs text-[#E31E24]">
                    <span className="font-bold flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#E31E24]" />
                        {uploadProgress}
                    </span>
                </div>
            )}

            {/* 3. NEGOTIATION FORM MODAL CONTROLLERS */}
            <AnimatePresence>
                {showOfferForm && (
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="absolute bottom-20 inset-x-4 bg-[#111C35] border border-slate-800 p-5 rounded-2xl z-20 shadow-2xl flex flex-col gap-4.5"
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                <DollarSign className="w-4 h-4 text-[#E31E24]" /> Propose Negotiation Offer
                            </span>
                            <button 
                                onClick={() => setShowOfferForm(false)}
                                className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                <input 
                                    type="number" 
                                    placeholder="Enter Amount in Rupees..."
                                    value={offerAmount}
                                    onChange={(e) => setOfferAmount(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-8 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                                />
                            </div>
                            <button 
                                onClick={(e) => {
                                    if (isOfferPending) {
                                        // Trigger a Counter action
                                        handleOfferAction("counter", Number(offerAmount))
                                        setOfferAmount("")
                                        setShowOfferForm(false)
                                    } else {
                                        // Send standard offer
                                        handleSendMessage(e, "offer")
                                    }
                                }}
                                disabled={isSubmittingMessage || !offerAmount}
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs active:scale-[0.98] transition-all flex items-center gap-1.5 shadow"
                            >
                                {isSubmittingMessage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                                {isOfferPending ? "Counter Offer" : "Send Offer"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 4. ATTACHMENT TRIGGERS & INPUT WIDGET */}
            <div className="p-4 border-t border-slate-800 flex flex-col gap-2.5 bg-slate-900/50">
                {/* Offer control bar */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setShowOfferForm(prev => !prev)}
                        disabled={isOfferPending}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-extrabold text-xs rounded-lg shadow-sm border transition-all ${
                            isOfferPending 
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-500 cursor-not-allowed" 
                                : "bg-[#E31E24]/10 hover:bg-[#E31E24]/20 border-[#E31E24]/20 hover:border-[#E31E24]/30 text-[#E31E24]"
                        }`}
                    >
                        <DollarSign className="w-3.5 h-3.5" />
                        {isOfferPending ? "Offer Pending..." : "Make an Offer"}
                    </button>
                    <span className="text-[10px] text-slate-500 font-semibold italic">
                        *Agreed deals proceed offline
                    </span>
                </div>

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    {/* Attachment file selector triggers */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageAttachment} 
                        className="hidden" 
                        accept="image/*"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || isSubmittingMessage}
                        className="p-2.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
                        title="Upload Image Attachment"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>

                    <input 
                        type="text" 
                        placeholder="Type your message here..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#E31E24] placeholder:text-slate-600 transition-all"
                    />

                    <button
                        type="submit"
                        disabled={isSubmittingMessage || isUploading || !inputText.trim()}
                        className="p-2.5 bg-[#E31E24] hover:bg-red-700 disabled:opacity-50 text-white rounded-xl active:scale-[0.98] transition-all flex items-center justify-center shadow"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    )
}
