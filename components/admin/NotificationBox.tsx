"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Clock, FileText, MessageSquare, Car, RefreshCcw, ShoppingCart, ChevronRight, Building2, Database } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Notification {
    id: string
    type: "valuation" | "sell" | "exchange" | "buy" | "contact" | "b2b_registration" | "b2b_bulk"
    title: string
    description: string
    createdAt: string
    href: string
}

export default function NotificationBox() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch("/api/admin/notifications")
                const data = await res.json()
                if (Array.isArray(data)) {
                    setNotifications(data)
                }
            } catch (error) {
                console.error("Error fetching notifications:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchNotifications()
        const interval = setInterval(fetchNotifications, 60000) // Polling every minute
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "valuation": return <FileText className="w-4 h-4 text-blue-500" />
            case "sell": return <Car className="w-4 h-4 text-green-500" />
            case "exchange": return <RefreshCcw className="w-4 h-4 text-purple-500" />
            case "buy": return <ShoppingCart className="w-4 h-4 text-orange-500" />
            case "contact": return <MessageSquare className="w-4 h-4 text-pink-500" />
            case "b2b_registration": return <Building2 className="w-4 h-4 text-orange-500" />
            case "b2b_bulk": return <Database className="w-4 h-4 text-indigo-500" />
            default: return <Bell className="w-4 h-4 text-slate-400" />
        }
    }

    const unreadCount = notifications.length

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-1.5 rounded-xl text-gray-400 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 text-[8px] font-bold text-white items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-[-45px] sm:right-0 mt-3 w-[270px] sm:w-80 bg-white dark:bg-[#0E192D] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                        <div className="p-3 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Requests</h3>
                        </div>

                        <div className="max-h-[320px] overflow-y-auto scrollbar-hide">
                            {loading ? (
                                <div className="p-6 text-center text-gray-400 dark:text-slate-500 text-sm">
                                    Loading notifications...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-10 text-center">
                                    <div className="bg-gray-100 dark:bg-slate-800 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Bell className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">No new notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                                    {notifications.map((notif, index) => (
                                        <motion.div
                                            key={notif.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link
                                                href={notif.href}
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group"
                                            >
                                                <div className="mt-0.5 bg-white dark:bg-slate-900 p-1.5 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 group-hover:border-emerald-500/30 transition-colors">
                                                    {getIcon(notif.type)}
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                                {notif.title}
                                                            </span>
                                                            {notif.createdAt && new Date().getTime() - new Date(notif.createdAt).getTime() < 5 * 60 * 1000 && (
                                                                <span className="px-1 py-0.5 rounded text-[7px] font-black bg-emerald-500 text-white uppercase tracking-tighter animate-pulse">
                                                                    New
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="flex items-center text-[9px] text-gray-400 dark:text-slate-500 font-medium">
                                                            <Clock className="w-2.5 h-2.5 mr-1" />
                                                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-1">
                                                        {notif.description}
                                                    </p>
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-700 ml-1 mt-1.5 group-hover:text-emerald-500 transition-colors" />
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="p-2 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 text-center">
                                <Link
                                    href="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
                                >
                                    View Dashboard Overview
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
