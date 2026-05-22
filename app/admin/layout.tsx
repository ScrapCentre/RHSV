"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
    Database,
    Inbox,
    AlertTriangle,
    Building2,
    FileSignature,
    History,
    Wrench,
    Sliders,
    Bell,
} from "lucide-react"

import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { ThemeToggle } from "@/components/ThemeToggle"
import NotificationBox from "@/components/admin/NotificationBox"

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isValuationsOpen, setIsValuationsOpen] = useState(true)
    const pathname = usePathname()
    const router = useRouter()

    // Mobile auditor fix: close sidebar by default on viewports below `lg` so a
    // founder on a phone (375x667) lands on the dashboard content instead of an
    // opaque dark sidebar covering the screen. Desktop keeps it open. Runs once
    // on mount + on any cross-device viewport change.
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 1023px)")
        const apply = () => {
            if (mq.matches) setIsSidebarOpen(false)
        }
        apply()
        mq.addEventListener("change", apply)
        return () => mq.removeEventListener("change", apply)
    }, [])

    // Close sidebar after navigation on mobile so the next page is visible.
    useEffect(() => {
        if (typeof window === "undefined") return
        if (window.matchMedia("(max-width: 1023px)").matches) {
            setIsSidebarOpen(false)
        }
    }, [pathname])

    // Helper to check if a link is active
    const isActive = (path: string) => pathname === path || pathname?.startsWith(path)

    useEffect(() => {
        if (status !== "loading") {
            const isAdmin = session && (session.user as any).role === "admin"
            if (!isAdmin && pathname !== "/admin") {
                router.push("/admin")
            }
        }
    }, [session, status, pathname, router])

    // Handle Auth States
    if (status === "loading") {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#020617]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                    <p className="text-emerald-500/50 text-[10px] uppercase tracking-widest font-bold">Verifying Clearance</p>
                </div>
            </div>
        )
    }

    const isAdmin = session && (session.user as any).role === "admin"

    // If not admin, show the login page (children) without the sidebar/layout
    if (!isAdmin) {
        if (pathname !== "/admin") {
            return null // Wait for redirect
        }
        return <div className="min-h-screen w-full">{children}</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex font-sans overflow-hidden transition-colors duration-300">
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
                className="fixed inset-y-0 left-0 z-50 bg-[#0E192D] border-r border-slate-800 shadow-xl lg:shadow-none flex flex-col h-screen w-72 transition-colors duration-300"
            >
                {/* Sidebar Header */}
                <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-[#0E192D] justify-between transition-colors duration-300">
                    <div className="flex items-center">
                        <Shield className="w-8 h-8 text-emerald-400 mr-2" />
                        <span className="text-xl font-black text-white tracking-tight">Admin</span>
                    </div>
                    {/* Toggle Button in Sidebar (Desktop) */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    {/* Close button for Mobile */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
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
                        <Link href="/admin" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin') && pathname === '/admin' ? 'bg-emerald-500/10 text-emerald-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            {isActive('/admin') && pathname === '/admin' && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-r-full" />
                            )}
                            <LayoutDashboard className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/admin') && pathname === '/admin' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'}`} />
                            <span className="font-semibold">Dashboard</span>
                        </Link>
                    </motion.div>

                    {/* Valuations Dropdown */}
                    <motion.div variants={sidebarLinkVariants} className="space-y-1 pt-1">
                        <button
                            onClick={() => setIsValuationsOpen(!isValuationsOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200 group"
                        >
                            <div className="flex items-center">
                                <FileText className="w-5 h-5 mr-3.5 text-slate-400 group-hover:text-white" />
                                <span className="font-semibold">Market Data</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isValuationsOpen ? 'rotate-180' : ''}`} />
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
                                        { href: "/admin/valuations/quote", label: "Scrap", color: "blue" },
                                        { href: "/admin/valuations/scrap-buy", label: "Scrap & Buy New", color: "purple" },
                                        { href: "/admin/valuations/sell", label: "Sell Old Vehicle", color: "green" },
                                        { href: "/admin/valuations/buy", label: "Buy New Vehicle", color: "orange" }
                                    ].map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center pl-12 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(item.href) ? `bg-${item.color}-500/10 text-${item.color}-400` : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full mr-3 ${isActive(item.href) ? `bg-${item.color}-500` : 'bg-slate-600'}`} />
                                            {item.label}
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Approved Requests */}
                    <motion.div variants={sidebarLinkVariants}>
                        <Link href="/admin/approved-requests" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/approved-requests') ? 'bg-emerald-500/10 text-emerald-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            {isActive('/admin/approved-requests') && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-r-full" />
                            )}
                            <CheckCircle className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/admin/approved-requests') ? 'text-emerald-500' : 'text-slate-400 group-hover:text-white'}`} />
                            <span className="font-semibold">Approved Requests</span>
                        </Link>
                    </motion.div>

                    {/* Approved Partner Requests */}
                    <motion.div variants={sidebarLinkVariants} className="mt-1">
                        <Link href="/admin/approved-partner-request" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/approved-partner-request') ? 'bg-purple-500/10 text-purple-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            {isActive('/admin/approved-partner-request') && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500 rounded-r-full" />
                            )}
                            <CheckCircle className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/admin/approved-partner-request') ? 'text-purple-500' : 'text-slate-400 group-hover:text-white'}`} />
                            <span className="font-semibold text-sm">Approved Partner Req</span>
                        </Link>
                    </motion.div>

                    <div className="pt-6 mt-2">
                        <motion.p variants={sidebarLinkVariants} className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Management</motion.p>
                        <div className="space-y-1.5">
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/subcontracting" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/subcontracting') ? 'bg-amber-500/10 text-amber-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/subcontracting') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500 rounded-r-full" />
                                    )}
                                    <Briefcase className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/admin/subcontracting') ? 'text-amber-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">RVSF's</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/bulk-outsourcing" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/bulk-outsourcing') ? 'bg-purple-500/10 text-purple-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/bulk-outsourcing') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500 rounded-r-full" />
                                    )}
                                    <Database className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/admin/bulk-outsourcing') ? 'text-purple-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">Bulk Outsourcing</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/settings" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/settings') ? 'bg-indigo-500/10 text-indigo-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/settings') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 rounded-r-full" />
                                    )}
                                    <Settings className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/admin/settings') ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">Global Settings</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/partners" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/partners') ? 'bg-emerald-500/10 text-emerald-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/partners') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-r-full" />
                                    )}
                                    <Users className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/admin/partners') ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">B2B Partners</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/executives" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/executives') ? 'bg-blue-500/10 text-blue-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/executives') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-r-full" />
                                    )}
                                    <Shield className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/admin/executives') ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">Executives</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/scrap-center-users" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/scrap-center-users') ? 'bg-emerald-500/10 text-emerald-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/scrap-center-users') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-r-full" />
                                    )}
                                    <Shield className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/admin/scrap-center-users') ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">ScrapCentre Users</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/blogs/upload" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/blogs') ? 'bg-emerald-500/10 text-emerald-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/blogs') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-r-full" />
                                    )}
                                    <UploadCloud className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/admin/blogs') ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">Upload Blogs</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/b2b-generator" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/b2b-generator') ? 'bg-emerald-500/10 text-emerald-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/b2b-generator') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-r-full" />
                                    )}
                                    <Key className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/admin/b2b-generator') ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">B2B Generator</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/rvsf-generator" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/rvsf-generator') ? 'bg-[#E31E24]/10 text-[#E31E24] shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/rvsf-generator') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E31E24] rounded-r-full" />
                                    )}
                                    <Key className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/admin/rvsf-generator') ? 'text-[#E31E24]' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">RVSF Generator</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/contact" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/contact') ? 'bg-blue-500/10 text-blue-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/contact') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-r-full" />
                                    )}
                                    <MessageSquare className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/admin/contact') ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">Contact Requests</span>
                                </Link>
                            </motion.div>
                            {/* Demo data hub — surfaces seeded "Demo *" leads so the founder
                                can click-through the walkthrough without SSHing to VM 221. */}
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/demo-leads" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/demo-leads') ? 'bg-emerald-500/10 text-emerald-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/demo-leads') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-r-full" />
                                    )}
                                    <Database className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/admin/demo-leads') ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">Demo Data</span>
                                </Link>
                            </motion.div>
                        </div>

                        {/* ── v2 Admin Operations (Triage / Refunds / Settings / Audit) ─────
                             Surfaces the v2 admin pages so the founder doesn't have to URL-direct.
                             Per the v2 spec, /admin/{triage,refund-review,needs-attention,...}
                             are the daily-driver pages for the admin role. */}
                        <motion.p variants={sidebarLinkVariants} className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">v2 Admin</motion.p>
                        <div className="space-y-1">
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/triage" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/triage') ? 'bg-rose-500/10 text-rose-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/triage') && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500 rounded-r-full" />}
                                    <Inbox className={`w-5 h-5 mr-3.5 ${isActive('/admin/triage') ? 'text-rose-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">Triage Queue</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/needs-attention" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/needs-attention') ? 'bg-amber-500/10 text-amber-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/needs-attention') && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500 rounded-r-full" />}
                                    <AlertTriangle className={`w-5 h-5 mr-3.5 ${isActive('/admin/needs-attention') ? 'text-amber-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">Needs Attention</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/refund-review" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/refund-review') ? 'bg-orange-500/10 text-orange-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/refund-review') && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500 rounded-r-full" />}
                                    <RefreshCcw className={`w-5 h-5 mr-3.5 ${isActive('/admin/refund-review') ? 'text-orange-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">Refund Review</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/dsc-pending" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/dsc-pending') ? 'bg-cyan-500/10 text-cyan-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/dsc-pending') && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-500 rounded-r-full" />}
                                    <FileSignature className={`w-5 h-5 mr-3.5 ${isActive('/admin/dsc-pending') ? 'text-cyan-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">DSC Pending</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/rvsfs" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/rvsfs') ? 'bg-indigo-500/10 text-indigo-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/rvsfs') && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 rounded-r-full" />}
                                    <Building2 className={`w-5 h-5 mr-3.5 ${isActive('/admin/rvsfs') ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">RVSFs</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/settings" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/settings') ? 'bg-slate-500/10 text-slate-200 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/settings') && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-400 rounded-r-full" />}
                                    <Sliders className={`w-5 h-5 mr-3.5 ${isActive('/admin/settings') ? 'text-slate-200' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">Settings</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/mock-config" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/mock-config') ? 'bg-fuchsia-500/10 text-fuchsia-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/mock-config') && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-fuchsia-500 rounded-r-full" />}
                                    <Wrench className={`w-5 h-5 mr-3.5 ${isActive('/admin/mock-config') ? 'text-fuchsia-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">Mock Config</span>
                                </Link>
                            </motion.div>
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/audit-log" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/audit-log') ? 'bg-teal-500/10 text-teal-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/audit-log') && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-500 rounded-r-full" />}
                                    <History className={`w-5 h-5 mr-3.5 ${isActive('/admin/audit-log') ? 'text-teal-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">Audit Log</span>
                                </Link>
                            </motion.div>
                            {/* M15 (2026-05-22): dispatched-notification queue viewer.
                                Founder-demo target: surfaces every Notification row + its per-channel
                                send status + delivery-log evidence, so the founder can show
                                "the mock WhatsApp landed here, here's the body." */}
                            <motion.div variants={sidebarLinkVariants}>
                                <Link href="/admin/notifications" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/notifications') ? 'bg-emerald-500/10 text-emerald-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/notifications') && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-r-full" />}
                                    <Bell className={`w-5 h-5 mr-3.5 ${isActive('/admin/notifications') ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">Notif. Queue</span>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-800 bg-[#0E192D] transition-colors duration-300">
                    <Link href="/" className="flex items-center px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all mb-2 group">
                        <Home className="w-5 h-5 mr-3.5 text-slate-400 group-hover:text-white" />
                        <span className="font-semibold">Back to Home</span>
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center px-4 py-3 rounded-xl text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 hover:shadow-sm transition-all group"
                    >
                        <LogOut className="w-5 h-5 mr-3.5 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Sign Out</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'lg:pl-72' : ''}`}>
                {/* Desktop/Mobile Header Toggle */}
                <header className="h-16 bg-white dark:bg-[#0E192D] border-b border-gray-200 dark:border-slate-800 flex items-center px-4 justify-between z-30 sticky top-0 transition-colors duration-300">
                    <div className="flex items-center">
                        {!isSidebarOpen && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 -ml-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        )}
                        <span className={`ml-3 text-lg font-bold text-gray-900 dark:text-white ${isSidebarOpen ? 'lg:invisible' : ''}`}>Admin Panel</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <NotificationBox />
                        <ThemeToggle />
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Administrator</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Admin Control</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-slate-950 p-4 lg:p-8 transition-colors duration-300">
                    {children}
                </main>
            </div>
        </div>
    )
}

