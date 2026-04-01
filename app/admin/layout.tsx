"use client"

import { useState } from "react"
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
    Database
} from "lucide-react"

import { signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isValuationsOpen, setIsValuationsOpen] = useState(true)
    const pathname = usePathname()

    // Helper to check if a link is active
    const isActive = (path: string) => pathname === path || pathname?.startsWith(path)

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
                                <span className="font-semibold">Valuations</span>
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
                                        { href: "/admin/valuations/quote", label: "Get Free Quote", color: "blue" },
                                        { href: "/admin/valuations/sell", label: "Sell Old Vehicle", color: "green" },
                                        { href: "/admin/valuations/exchange", label: "Exchange Vehicle", color: "purple" },
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
                                    <span className="font-semibold">Subcontracting</span>
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
                                <Link href="/admin/contact" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/admin/contact') ? 'bg-blue-500/10 text-blue-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    {isActive('/admin/contact') && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-r-full" />
                                    )}
                                    <MessageSquare className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/admin/contact') ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span className="font-semibold">Contact Requests</span>
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

