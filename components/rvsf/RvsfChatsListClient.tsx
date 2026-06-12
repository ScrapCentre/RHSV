"use client"

import React, { useState } from "react"
import Link from "next/link"
import { MessageSquare, Calendar, ArrowRight, User, Car, Pin, Trash2, Loader2, AlertCircle } from "lucide-react"

interface ChatItem {
    id: string
    leadId: string
    customerName: string
    vehicleInfo: string
    lastMessage: string
    agreedPrice: number | null
    updatedAt: string
}

interface Props {
    initialChats: ChatItem[]
}

export default function RvsfChatsListClient({ initialChats }: Props) {
    const [chats, setChats] = useState<ChatItem[]>(initialChats)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    const handleDeleteClick = (chatId: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setConfirmDeleteId(chatId)
    }

    const confirmDelete = async () => {
        if (!confirmDeleteId) return
        const chatId = confirmDeleteId
        setConfirmDeleteId(null)
        setDeletingId(chatId)

        try {
            const res = await fetch(`/api/chat/${chatId}`, {
                method: "DELETE",
            })
            if (res.ok) {
                setChats(prev => prev.filter(c => c.id !== chatId))
            } else {
                alert("Failed to delete chat thread. Please try again.")
            }
        } catch (err) {
            console.error(err)
            alert("An error occurred while deleting the chat thread.")
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <>
            {chats.length === 0 ? (
                <div className="bg-white dark:bg-[#0E192D] rounded-3xl border border-gray-100 dark:border-slate-800 p-16 text-center space-y-4 shadow-sm">
                    <MessageSquare className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No active chats found</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Accept leads from your active dashboard queue to unlock custom chat panels.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {chats.map((chat) => (
                        <Link 
                            key={chat.id} 
                            href={`/rvsf/chat/${chat.id}`}
                            className="bg-white dark:bg-[#0E192D] border border-gray-100 dark:border-slate-800 hover:border-emerald-500/30 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all shadow-sm group hover:shadow-md"
                        >
                            <div className="space-y-2 flex-1 w-full min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                                        <User className="w-4 h-4 text-blue-500 shrink-0" />
                                        {chat.customerName}
                                    </span>
                                    <span className="text-slate-300 dark:text-slate-700 font-light">•</span>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Car className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                        {chat.vehicleInfo}
                                    </span>
                                    <span className="text-slate-300 dark:text-slate-700 font-light">•</span>
                                    <span className="text-[10px] font-mono text-slate-400 font-medium tracking-tight uppercase">
                                        Lead: {chat.leadId.slice(-8)}
                                    </span>
                                    {chat.agreedPrice && (
                                        <span className="text-[9px] uppercase font-extrabold tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <Pin className="w-2.5 h-2.5 shrink-0" /> ₹{chat.agreedPrice} Pinned
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xl italic">
                                    "{chat.lastMessage}"
                                </p>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t border-slate-100 dark:border-slate-800 md:border-t-0 shrink-0">
                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    {new Date(chat.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={(e) => handleDeleteClick(chat.id, e)}
                                        disabled={deletingId === chat.id}
                                        className="inline-flex items-center justify-center p-2 bg-red-50 hover:bg-[#E31E24] dark:bg-slate-900 dark:hover:bg-red-650 text-red-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-red-100 dark:border-slate-800 hover:border-transparent shrink-0 shadow-sm"
                                        title="Delete Chat"
                                    >
                                        {deletingId === chat.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                    
                                    <span className="inline-flex items-center gap-1 px-4 py-2 bg-slate-50 hover:bg-emerald-500 hover:text-white dark:bg-slate-900 dark:hover:bg-emerald-500 text-gray-900 dark:text-white rounded-xl text-xs font-bold transition-all border border-slate-100 dark:border-slate-800 hover:border-transparent shrink-0 shadow-sm">
                                        Open
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        onClick={() => setConfirmDeleteId(null)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Box */}
                    <div className="bg-white dark:bg-[#0E192D] border border-slate-100 dark:border-slate-800 w-full max-w-sm rounded-2xl p-6 relative z-10 shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-950 dark:text-white text-sm">Delete Chat Thread</h3>
                                <p className="text-xs text-gray-500 dark:text-slate-450 mt-1 leading-normal">
                                    Are you sure you want to permanently delete this conversation? This will delete all messages and cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button 
                                onClick={() => setConfirmDeleteId(null)}
                                className="flex-1 py-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="flex-1 py-2 bg-[#E31E24] hover:bg-[#c9181d] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-md shadow-red-600/10"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
