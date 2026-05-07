"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    FileText,
    CheckCircle,
    Users,
    Shield,
    MessageSquare,
    LogOut,
    Home,
    Menu,
    X,
    ChevronDown,
    Briefcase,
    Database,
    Clock,
    Activity,
    Bell
} from "lucide-react"

import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { ThemeToggle } from "@/components/ThemeToggle"

const sidebarLinkVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.4, ease: "easeOut" as const }
    }
}

const sidebarContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.2
        }
    }
}

export default function ExecutiveLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isValuationsOpen, setIsValuationsOpen] = useState(true)
    const [notifications, setNotifications] = useState<any[]>([])
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()
    const router = useRouter()

    // Helper to check if a link is active
    const isActive = (path: string) => pathname === path || pathname?.startsWith(path)

    useEffect(() => {
        if (status !== "loading") {
            const isExecutive = session && (session.user as any).role === "executive"
            if (isExecutive && pathname === "/executive") {
                router.push("/executive/dashboard")
            } else if (!isExecutive && pathname !== "/executive") {
                router.push("/executive")
            }
        }
    }, [session, status, pathname, router])

    // Fetch notifications
    useEffect(() => {
        if (status === "authenticated" && session && (session.user as any).role === "executive") {
            fetch('/api/executive/notifications')
                .then(res => res.json())
                .then(data => {
                    if (data.notifications) setNotifications(data.notifications)
                })
                .catch(console.error)
        }
    }, [status, session])

    // Handle outside click for dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Handle Auth States
    if (status === "loading") {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-white" />
                    <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold">Verifying Executive Clearance</p>
                </div>
            </div>
        )
    }

    const isExecutive = session && (session.user as any).role === "executive"

    // If on the login page and authenticated, wait for redirect
    if (isExecutive && pathname === "/executive") {
        return null
    }

    // If not executive, show the login page (children) without the sidebar/layout
    if (!isExecutive) {
        if (pathname !== "/executive") {
            return null // Wait for redirect
        }
        return <div className="bg-black min-h-screen w-full">{children}</div>
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] flex font-sans overflow-hidden transition-colors duration-300">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    x: isSidebarOpen ? 0 : "-100%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-50 bg-black border-r border-white/10 shadow-xl lg:shadow-none flex flex-col h-screen w-72 transition-colors duration-300"
            >
                {/* Sidebar Header */}
                <div className="h-20 flex items-center px-6 border-b border-white/10 bg-black justify-between transition-colors duration-300">
                    <div className="flex items-center">
                        <Shield className="w-8 h-8 text-white mr-2" />
                        <span className="text-xl font-black text-white tracking-tight uppercase">Executive</span>
                    </div>
                    {/* Toggle Button in Sidebar (Desktop) */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    {/* Close button for Mobile */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <motion.nav
                    variants={sidebarContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-hide"
                >

                    {/* Dashboard */}
                    <motion.div variants={sidebarLinkVariants}>
                        <Link href="/executive/dashboard" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/executive/dashboard') ? 'bg-blue-600/10 text-blue-500' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                            {isActive('/executive/dashboard') && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            )}
                            <LayoutDashboard className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/executive/dashboard') ? 'text-blue-500' : 'text-white/40 group-hover:text-blue-500'}`} />
                            <span className="font-semibold">Dashboard</span>
                        </Link>
                    </motion.div>

                    {/* Valuations Dropdown */}
                    <motion.div variants={sidebarLinkVariants} className="space-y-1 pt-1">
                        <button
                            onClick={() => setIsValuationsOpen(!isValuationsOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-all duration-200 group"
                        >
                            <div className="flex items-center">
                                <FileText className="w-5 h-5 mr-3.5 text-white/40 group-hover:text-blue-500" />
                                <span className="font-semibold">Market Data</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ${isValuationsOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isValuationsOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden space-y-1"
                                >
                                    {[
                                        { href: "/executive/valuations/quote", label: "Free Quotes" },
                                        { href: "/executive/valuations/sell", label: "Sell Inquiries" },
                                        // { href: "/executive/valuations/exchange", label: "Exchange Leads" },
                                        { href: "/executive/valuations/buy", label: "Purchase Leads" }
                                    ].map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center pl-12 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(item.href) ? `bg-blue-500/10 text-blue-400` : 'text-white/40 hover:text-blue-400 hover:bg-white/5'}`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive(item.href) ? `bg-blue-400 shadow-[0_0_5px_rgba(59,130,246,0.8)]` : 'bg-white/20'}`} />
                                            {item.label}
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Approved Requests */}
                    <motion.div variants={sidebarLinkVariants}>
                        <Link href="/executive/approved-requests" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/executive/approved-requests') ? 'bg-emerald-600/10 text-emerald-500 shadow-sm' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                            {isActive('/executive/approved-requests') && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            )}
                            <CheckCircle className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/executive/approved-requests') ? 'text-emerald-500' : 'text-white/40 group-hover:text-emerald-500'}`} />
                            <span className="font-semibold">Approved Req.</span>
                        </Link>
                    </motion.div>

                    {/* Outsourcing */}
                    <motion.div variants={sidebarLinkVariants}>
                        <Link href="/executive/bulk-outsourcing" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/executive/bulk-outsourcing') ? 'bg-blue-600/10 text-blue-500 shadow-sm' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                            {isActive('/executive/bulk-outsourcing') && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            )}
                            <Database className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/executive/bulk-outsourcing') ? 'text-blue-500' : 'text-white/40 group-hover:text-blue-500'}`} />
                            <span className="font-semibold">Outsourcing</span>
                        </Link>
                    </motion.div>

                </motion.nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-white/10 bg-black transition-colors duration-300">
                    <button
                        onClick={() => signOut({ callbackUrl: "/executive" })}
                        className="w-full flex items-center px-4 py-3 rounded-xl text-black bg-white hover:bg-white/90 transition-all group shadow-sm"
                    >
                        <LogOut className="w-5 h-5 mr-3.5 group-hover:scale-110 transition-transform" />
                        <span className="font-black uppercase tracking-wider text-xs">Terminate Session</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'lg:pl-72' : ''}`}>
                {/* Desktop/Mobile Header */}
                <header className="h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-white/10 flex items-center px-4 justify-between z-30 sticky top-0 transition-colors duration-300">
                    <div className="flex items-center">
                        {!isSidebarOpen && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 -ml-2 rounded-md text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        )}
                        <div className="ml-3 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)] hidden dark:block" />
                             <span className={`text-sm font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white ${isSidebarOpen ? 'lg:invisible' : ''}`}>Executive Terminal</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="p-2 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all relative"
                            >
                                <Bell className="w-5 h-5" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-white dark:border-[#050505]"></span>
                                )}
                            </button>

                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden z-50"
                                    >
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 flex justify-between items-center">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Recent Requests</h3>
                                            <span className="text-[9px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">{notifications.length} New</span>
                                        </div>
                                        <div className="max-h-[60vh] overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map((notif: any) => (
                                                    <Link 
                                                        key={notif.id} 
                                                        href={`/executive/valuations/${notif.type}/${notif.id}`}
                                                        onClick={() => setIsNotificationsOpen(false)}
                                                        className="block px-4 py-3 border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors last:border-0 group"
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-[10px] font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">{notif.title}</span>
                                                            <span className="text-[9px] text-gray-400 dark:text-white/40">
                                                                {new Date(notif.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 dark:text-white/60 leading-snug">
                                                            {notif.message}
                                                        </p>
                                                    </Link>
                                                ))
                                            ) : (
                                                <div className="px-4 py-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/20">
                                                    No new notifications
                                                </div>
                                            )}
                                        </div>
                                        <div className="px-4 py-2 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 text-center">
                                            <Link href="/executive/valuations" onClick={() => setIsNotificationsOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                View All Market Data
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <ThemeToggle />
                        <Link href="/executive/dashboard" className="hidden sm:flex flex-col items-end hover:opacity-80 transition-opacity">
                            <span className="text-[8px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.3em]">Clearance Level 4</span>
                            <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">{session?.user?.name || 'Executive'}</span>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-[#050505] p-4 lg:p-8 transition-colors duration-300">
                    {children}
                </main>
            </div>
        </div>
    )
}
