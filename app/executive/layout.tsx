"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus_Jakarta_Sans } from "next/font/google"
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
    Clock,
    Activity,
    Bell,
    Key
} from "lucide-react"

import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { ThemeToggle } from "@/components/ThemeToggle"

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
})

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isValuationsOpen, setIsValuationsOpen] = useState(true)
    const [notifications, setNotifications] = useState<any[]>([])
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()
    const router = useRouter()

    // Auto open sidebar only on xl+ screens
    useEffect(() => {
        const checkWidth = () => {
            setIsSidebarOpen(window.innerWidth >= 1280)
        }
        checkWidth()
        window.addEventListener('resize', checkWidth)
        return () => window.removeEventListener('resize', checkWidth)
    }, [])

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
            <div className={`h-screen w-full flex items-center justify-center bg-white ${plusJakartaSans.className}`}>
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[#E31E24]" />
                    <p className="text-[#E31E24]/50 text-[10px] uppercase tracking-widest font-bold">Verifying Executive Clearance</p>
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
        return <div className={`min-h-screen w-full bg-white ${plusJakartaSans.className}`}>{children}</div>
    }

    return (
        <div className={`min-h-screen bg-slate-50 flex overflow-hidden ${plusJakartaSans.className}`}>
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
            <motion.aside
                initial={false}
                animate={{
                    x: isSidebarOpen ? 0 : "-100%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 shadow-xl lg:shadow-none flex flex-col h-screen w-72"
            >
                {/* Sidebar Header */}
                <div className="h-20 flex items-center px-6 border-b border-slate-200 bg-white justify-between">
                    <div className="flex items-center">
                        <Shield className="w-8 h-8 text-[#E31E24] mr-2" />
                        <span className="text-xl font-black text-slate-800 tracking-tight uppercase">Executive</span>
                    </div>
                    {/* Toggle Button in Sidebar (Desktop) */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    {/* Close button for Mobile */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
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
                        <Link href="/executive/dashboard" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/executive/dashboard') ? 'bg-[#E31E24]/10 text-[#E31E24]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#E31E24]'}`}>
                            {isActive('/executive/dashboard') && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E31E24] rounded-r-full" />
                            )}
                            <LayoutDashboard className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/executive/dashboard') ? 'text-[#E31E24]' : 'text-slate-500 group-hover:text-[#E31E24]'}`} />
                            <span className="font-semibold">Dashboard</span>
                        </Link>
                    </motion.div>

                    {/* Valuations Dropdown */}
                    <motion.div variants={sidebarLinkVariants} className="space-y-1 pt-1">
                        <button
                            onClick={() => setIsValuationsOpen(!isValuationsOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-[#E31E24] transition-all duration-200 group"
                        >
                            <div className="flex items-center">
                                <FileText className="w-5 h-5 mr-3.5 text-slate-500 group-hover:text-[#E31E24]" />
                                <span className="font-semibold">Market Data</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isValuationsOpen ? 'rotate-180' : ''}`} />
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
                                        { href: "/executive/valuations/quote", label: "Scrap" },
                                        { href: "/executive/valuations/scrap-buy", label: "Scrap & Buy New" },
                                        { href: "/executive/valuations/buy", label: "Buy New Vehicle" }
                                    ].map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center pl-12 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(item.href) ? 'bg-[#E31E24]/10 text-[#E31E24]' : 'text-slate-600 hover:text-[#E31E24] hover:bg-slate-50'}`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive(item.href) ? 'bg-[#E31E24]' : 'bg-slate-400'}`} />
                                            {item.label}
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Approved Requests */}
                    <motion.div variants={sidebarLinkVariants}>
                        <Link href="/executive/approved-requests" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/executive/approved-requests') ? 'bg-[#E31E24]/10 text-[#E31E24] shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-[#E31E24]'}`}>
                            {isActive('/executive/approved-requests') && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E31E24] rounded-r-full" />
                            )}
                            <CheckCircle className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/executive/approved-requests') ? 'text-[#E31E24]' : 'text-slate-500 group-hover:text-[#E31E24]'}`} />
                            <span className="font-semibold">Approved Req.</span>
                        </Link>
                    </motion.div>

                    {/* Access & Provisioning Hub */}
                    <motion.div variants={sidebarLinkVariants}>
                        <Link href="/executive/access-generator" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/executive/access-generator') ? 'bg-[#E31E24]/10 text-[#E31E24] shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-[#E31E24]'}`}>
                            {isActive('/executive/access-generator') && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E31E24] rounded-r-full" />
                            )}
                            <Key className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/executive/access-generator') ? 'text-[#E31E24]' : 'text-slate-500 group-hover:text-[#E31E24]'}`} />
                            <span className="font-semibold">Access Generator</span>
                        </Link>
                    </motion.div>

                    {/* Contact Requests */}
                    <motion.div variants={sidebarLinkVariants}>
                        <Link href="/executive/contact" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/executive/contact') ? 'bg-[#E31E24]/10 text-[#E31E24] shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-[#E31E24]'}`}>
                            {isActive('/executive/contact') && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E31E24] rounded-r-full" />
                            )}
                            <MessageSquare className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/executive/contact') ? 'text-[#E31E24]' : 'text-slate-500 group-hover:text-[#E31E24]'}`} />
                            <span className="font-semibold">Contact Requests</span>
                        </Link>
                    </motion.div>

                </motion.nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-200 bg-white">
                    <button
                        onClick={() => signOut({ callbackUrl: "/executive" })}
                        className="w-full flex items-center px-4 py-3 rounded-xl text-[#E31E24] bg-[#E31E24]/10 hover:bg-[#E31E24]/20 hover:shadow-sm transition-all group"
                    >
                        <LogOut className="w-5 h-5 mr-3.5 group-hover:scale-110 transition-transform" />
                        <span className="font-black uppercase tracking-wider text-xs">Terminate Session</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'xl:pl-72' : ''}`}>
                {/* Desktop/Mobile Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between z-30 sticky top-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                             <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Executive Terminal</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all relative"
                            >
                                <Bell className="w-5 h-5" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E31E24] rounded-full border border-white"></span>
                                )}
                            </button>

                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50"
                                    >
                                        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Recent Requests</h3>
                                            <span className="text-[9px] font-bold bg-red-100 text-[#E31E24] px-2 py-0.5 rounded-full">{notifications.length} New</span>
                                        </div>
                                        <div className="max-h-[60vh] overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map((notif: any) => (
                                                    <Link 
                                                        key={notif.id} 
                                                        href={`/executive/valuations/${notif.type}/${notif.id}`}
                                                        onClick={() => setIsNotificationsOpen(false)}
                                                        className="block px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0 group"
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-[10px] font-bold text-slate-900 group-hover:text-[#E31E24] transition-colors">{notif.title}</span>
                                                            <span className="text-[9px] text-slate-450">
                                                                {new Date(notif.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 leading-snug">
                                                            {notif.message}
                                                        </p>
                                                    </Link>
                                                ))
                                            ) : (
                                                <div className="px-4 py-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                    No new notifications
                                                </div>
                                            )}
                                        </div>
                                        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 text-center">
                                            <Link href="/executive/valuations" onClick={() => setIsNotificationsOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-[#E31E24] hover:text-red-700 transition-colors">
                                                View All Market Data
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <ThemeToggle />
                        <Link href="/executive/dashboard" className="hidden sm:flex flex-col items-end hover:opacity-80 transition-opacity">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Clearance Level 4</span>
                            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{session?.user?.name || 'Executive'}</span>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-x-auto overflow-y-auto bg-slate-50 p-3 sm:p-4 lg:p-6 xl:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
