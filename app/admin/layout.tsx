"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus_Jakarta_Sans } from "next/font/google"
import {
    LayoutDashboard,
    FileText,
    Car,
    RefreshCcw,
    ShoppingCart,
    Users,
    UploadCloud,
    Key,
    LogOut,
    Home,
    Menu,
    X,
    ChevronDown,
    ChevronRight,
    Shield,
    CheckCircle,
    MessageSquare,
    Settings,
    Briefcase,
    Database
} from "lucide-react"

import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { ThemeToggle } from "@/components/ThemeToggle"
import NotificationBox from "@/components/admin/NotificationBox"

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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isValuationsOpen, setIsValuationsOpen] = useState(true)
    const pathname = usePathname()
    const router = useRouter()
    const [showOpeningAnimation, setShowOpeningAnimation] = useState(true)

    const isAdmin = session && (session.user as any).role === "admin"
    const [contactCount, setContactCount] = useState(0)

    // Poll contact requests notifications count
    useEffect(() => {
        if (!isAdmin) return
        const fetchContactCount = async () => {
            try {
                const res = await fetch("/api/admin/notifications")
                if (res.ok) {
                    const data = await res.json()
                    if (Array.isArray(data)) {
                        const count = data.filter((n: any) => n.type === "contact").length
                        setContactCount(count)
                    }
                }
            } catch (error) {
                console.error("Error fetching contact notifications:", error)
            }
        }
        fetchContactCount()
        const interval = setInterval(fetchContactCount, 30000)
        return () => clearInterval(interval)
    }, [isAdmin])

    // 3-second opening animation trigger
    useEffect(() => {
        if (status !== "loading" && isAdmin) {
            const timer = setTimeout(() => {
                setShowOpeningAnimation(false)
            }, 3000)
            return () => clearTimeout(timer)
        } else if (status !== "loading" && !isAdmin) {
            setShowOpeningAnimation(false)
        }
    }, [isAdmin, status])

    // Auto open sidebar only on large desktop screens
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
            if (!isAdmin && pathname !== "/admin") {
                router.push("/admin")
            }
        }
    }, [isAdmin, status, pathname, router])

    // Handle Auth States
    if (status === "loading") {
        return (
            <div className={`h-screen w-full flex items-center justify-center bg-white ${plusJakartaSans.className}`}>
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[#E31E24]" />
                    <p className="text-[#E31E24]/50 text-[10px] uppercase tracking-widest font-bold">Verifying Clearance</p>
                </div>
            </div>
        )
    }

    // If not admin, show the login page (children) without the sidebar/layout
    if (!isAdmin) {
        if (pathname !== "/admin") {
            return null // Wait for redirect
        }
        return <div className={`min-h-screen w-full bg-white ${plusJakartaSans.className}`}>{children}</div>
    }

    if (showOpeningAnimation) {
        return (
            <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white ${plusJakartaSans.className}`}>
                {/* Visual Glow elements */}
                <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-slate-900/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative flex flex-col items-center max-w-sm px-6 text-center space-y-6">
                    {/* Animated Icon */}
                    <motion.div
                        initial={{ scale: 0.5, rotate: -180, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 100, 
                            damping: 15,
                            duration: 0.8 
                        }}
                        className="w-16 h-16 rounded-2xl bg-[#E31E24]/10 border border-[#E31E24]/20 flex items-center justify-center relative shadow-lg shadow-red-650/5 overflow-hidden"
                    >
                        <Shield className="w-8 h-8 text-[#E31E24]" />
                        {/* Shimmer effect */}
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full"
                        />
                    </motion.div>

                    {/* Animated Text */}
                    <div className="space-y-1">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-2xl font-black text-slate-800 tracking-tight leading-none"
                        >
                            SCRAPCENTRE
                        </motion.h1>
                        <motion.p
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.45, duration: 0.6 }}
                            className="text-[10px] text-[#E31E24] font-bold tracking-widest uppercase"
                        >
                            Secure Admin Portal
                        </motion.p>
                    </div>

                    {/* Loading Progress Bar */}
                    <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden relative border border-slate-50">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.8, ease: "easeInOut" }}
                            className="h-full bg-[#E31E24] rounded-full"
                        />
                    </div>

                    {/* Micro subtext */}
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block"
                    >
                        Initializing Dashboard System...
                    </motion.span>
                </div>
            </div>
        )
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
                        <span className="text-xl font-black text-slate-800 tracking-tight">Admin</span>
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
                        <Link href="/admin" className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin') && pathname === '/admin' ? 'bg-[#E31E24]/10 text-[#E31E24] shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-[#E31E24]'}`}>
                            {isActive('/admin') && pathname === '/admin' && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E31E24] rounded-r-full" />
                            )}
                            <LayoutDashboard className={`w-4 h-4 mr-3 transition-colors ${isActive('/admin') && pathname === '/admin' ? 'text-[#E31E24]' : 'text-slate-500 group-hover:text-[#E31E24]'}`} />
                            <span className="font-semibold text-[13px]">Dashboard</span>
                        </Link>
                    </motion.div>
 
                    {/* Valuations Dropdown */}
                    <motion.div variants={sidebarLinkVariants} className="space-y-0.5 pt-0.5">
                        <button
                            onClick={() => setIsValuationsOpen(!isValuationsOpen)}
                            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-[#E31E24] transition-all duration-200 group"
                        >
                            <div className="flex items-center">
                                <FileText className="w-4 h-4 mr-3 text-slate-500 group-hover:text-[#E31E24]" />
                                <span className="font-semibold text-[13px]">Market Data</span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isValuationsOpen ? 'rotate-180' : ''}`} />
                        </button>
 
                        <AnimatePresence>
                            {isValuationsOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden space-y-0.5"
                                >
                                    {[
                                        { href: "/admin/valuations/quote", label: "Scrap" },
                                        { href: "/admin/valuations/scrap-buy", label: "Scrap & Buy New" },
                                        { href: "/admin/valuations/buy", label: "Buy New Vehicle" }
                                    ].map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center pl-11 pr-4 py-2 rounded-xl text-xs font-medium transition-all ${isActive(item.href) ? 'bg-[#E31E24]/10 text-[#E31E24]' : 'text-slate-600 hover:text-[#E31E24] hover:bg-slate-50'}`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full mr-2.5 ${isActive(item.href) ? 'bg-[#E31E24]' : 'bg-slate-400'}`} />
                                            {item.label}
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
 
                    {/* Approved Requests */}
                    <motion.div variants={sidebarLinkVariants}>
                        <Link href="/admin/approved-requests" className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/approved-requests') ? 'bg-[#E31E24]/10 text-[#E31E24] shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-[#E31E24]'}`}>
                            {isActive('/admin/approved-requests') && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E31E24] rounded-r-full" />
                            )}
                            <CheckCircle className={`w-4 h-4 mr-3 transition-colors ${isActive('/admin/approved-requests') ? 'text-[#E31E24]' : 'text-slate-500 group-hover:text-[#E31E24]'}`} />
                            <span className="font-semibold text-[13px]">Personal Leads</span>
                        </Link>
                    </motion.div>
 

 
                    <div className="pt-4 mt-1 border-t border-slate-100">
                        <motion.p variants={sidebarLinkVariants} className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Management</motion.p>
                        <div className="space-y-0.5">
                             <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/subcontracting" className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/subcontracting') ? 'bg-[#E31E24]/10 text-[#E31E24] shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-[#E31E24]'}`}>
                                    {isActive('/admin/subcontracting') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E31E24] rounded-r-full" />
                                    )}
                                    <Briefcase className={`w-4 h-4 mr-3 transition-colors ${isActive('/admin/subcontracting') ? 'text-[#E31E24]' : 'text-slate-500 group-hover:text-[#E31E24]'}`} />
                                    <span className="font-semibold text-[13px]">RVSF's Authorized</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/rvsf-applications" className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/rvsf-applications') ? 'bg-[#E31E24]/10 text-[#E31E24] shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-[#E31E24]'}`}>
                                    {isActive('/admin/rvsf-applications') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E31E24] rounded-r-full" />
                                    )}
                                    <FileText className={`w-4 h-4 mr-3 transition-colors ${isActive('/admin/rvsf-applications') ? 'text-[#E31E24]' : 'text-slate-500 group-hover:text-[#E31E24]'}`} />
                                    <span className="font-semibold text-[13px]">RVSF Applications</span>
                                </Link>
                            </motion.div>

                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/settings" className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/settings') ? 'bg-[#E31E24]/10 text-[#E31E24] shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-[#E31E24]'}`}>
                                    {isActive('/admin/settings') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E31E24] rounded-r-full" />
                                    )}
                                    <Settings className={`w-4 h-4 mr-3 transition-colors ${isActive('/admin/settings') ? 'text-[#E31E24]' : 'text-slate-500 group-hover:text-[#E31E24]'}`} />
                                    <span className="font-semibold text-[13px]">Global Settings</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/access-generator" className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/access-generator') ? 'bg-[#E31E24]/10 text-[#E31E24] shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-[#E31E24]'}`}>
                                    {isActive('/admin/access-generator') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E31E24] rounded-r-full" />
                                    )}
                                    <Key className={`w-4 h-4 mr-3 transition-colors ${isActive('/admin/access-generator') ? 'text-[#E31E24]' : 'text-slate-500 group-hover:text-[#E31E24]'}`} />
                                    <span className="font-semibold text-[13px]">Access &amp; Provisioning Hub</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/contact" className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/contact') ? 'bg-[#E31E24]/10 text-[#E31E24] shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-[#E31E24]'}`}>
                                    {isActive('/admin/contact') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E31E24] rounded-r-full" />
                                    )}
                                    <MessageSquare className={`w-4 h-4 mr-3 transition-colors ${isActive('/admin/contact') ? 'text-[#E31E24]' : 'text-slate-500 group-hover:text-[#E31E24]'}`} />
                                    <span className="font-semibold text-[13px]">Contact Requests</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/refund-review" className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/refund-review') ? 'bg-[#E31E24]/10 text-[#E31E24] shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-[#E31E24]'}`}>
                                    {isActive('/admin/refund-review') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E31E24] rounded-r-full" />
                                    )}
                                    <RefreshCcw className={`w-4 h-4 mr-3 transition-colors ${isActive('/admin/refund-review') ? 'text-[#E31E24]' : 'text-slate-500 group-hover:text-[#E31E24]'}`} />
                                    <span className="font-semibold text-[13px]">Refund Requests</span>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.nav>
 
                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-200 bg-white">
                    <Link href="/" className="flex items-center px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-[#E31E24] transition-all mb-1.5 group">
                        <Home className="w-4 h-4 mr-3 text-slate-500 group-hover:text-[#E31E24]" />
                        <span className="font-semibold text-[13px]">Back to Home</span>
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center px-4 py-2.5 rounded-xl text-[#E31E24] bg-[#E31E24]/10 hover:bg-[#E31E24]/20 hover:shadow-sm transition-all group"
                    >
                        <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-[13px]">Sign Out</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'xl:pl-72' : ''}`}>
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between z-30 sticky top-0">
                    <div className="flex items-center gap-3">
                        {/* Hamburger — always visible on mobile, shows when sidebar is closed on desktop */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5 hidden xl:block" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <span className="text-base sm:text-lg font-bold text-slate-900">Admin Panel</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            href="/admin/contact"
                            className="relative p-1.5 rounded-xl text-slate-450 hover:text-[#E31E24] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center"
                            aria-label="Contact Requests"
                            title="Contact Requests"
                        >
                            <MessageSquare className="w-5 h-5" />
                            {contactCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E31E24] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#E31E24] text-[8px] font-bold text-white items-center justify-center">
                                        {contactCount}
                                    </span>
                                </span>
                            )}
                        </Link>
                        <NotificationBox />
                        <ThemeToggle />
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Administrator</span>
                            <span className="text-sm font-semibold text-slate-900">Admin Control</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-auto overflow-y-auto bg-slate-50 p-3 sm:p-4 lg:p-6 xl:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
