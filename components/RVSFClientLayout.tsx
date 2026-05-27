"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, Store, User, LogOut, Home, Menu, X, MessageSquare } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

const sidebarLinkVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" as const } }
}
const sidebarContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
}

export default function RVSFClientLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/")

    const hideLayout = pathname === "/rvsf/login" || pathname === "/rvsf/apply" ||
        status === "unauthenticated" || (session?.user as any)?.role !== "rvsf"

    if (hideLayout) {
        return <div className="min-h-screen w-full font-sans">{children}</div>
    }

    const rvsfId = (session?.user as any)?.rvsfId || "—"
    const companyName = session?.user?.name || "RVSF"

    const navItems = [
        { href: "/rvsf/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "emerald", active: false, coming: false },
        { href: "/rvsf/ccs", label: "Collection Centers", icon: Building2, color: "blue", active: false, coming: false },
        { href: "/rvsf/marketplace", label: "Marketplace", icon: Store, color: "purple", active: false, coming: false },
        { href: "/rvsf/chats", label: "My Chats", icon: MessageSquare, color: "pink", active: false, coming: false },
        { href: "/rvsf/profile", label: "My Profile", icon: User, color: "amber", active: false, coming: true },
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex font-sans overflow-hidden transition-colors duration-300">
            {/* Mobile overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black z-40 lg:hidden" />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: isSidebarOpen ? 0 : "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-50 bg-[#0E192D] border-r border-slate-800 shadow-xl lg:shadow-none flex flex-col h-screen w-72"
            >
                {/* Header: Logo + toggle */}
                <div className="h-auto flex flex-col px-6 pt-6 pb-4 border-b border-slate-800 gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#E31E24]/10 border border-[#E31E24]/30 flex items-center justify-center">
                                <span className="text-sm font-black text-[#E31E24]">R</span>
                            </div>
                            <span className="text-lg font-black text-white tracking-tight">RVSF Portal</span>
                        </div>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {/* Company info */}
                    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3">
                        <p className="text-white font-bold text-sm truncate">{companyName}</p>
                        <p className="text-[#E31E24] text-xs font-mono font-bold mt-0.5">{rvsfId}</p>
                    </div>
                </div>

                {/* Nav */}
                <motion.nav variants={sidebarContainerVariants} initial="hidden" animate="visible"
                    className="flex-1 overflow-y-auto py-5 px-4 space-y-1.5">
                    {navItems.map(({ href, label, icon: Icon, color, coming }) => (
                        <motion.div key={href} variants={sidebarLinkVariants}>
                            {coming ? (
                                <div className="flex items-center px-4 py-3 rounded-xl text-slate-600 cursor-not-allowed select-none">
                                    <Icon className="w-5 h-5 mr-3.5" />
                                    <span className="font-semibold">{label}</span>
                                    <span className="ml-auto text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold">Soon</span>
                                </div>
                            ) : (
                                <Link href={href}
                                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                                        ${isActive(href)
                                            ? `bg-${color}-500/10 text-${color}-400 shadow-sm`
                                            : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                                >
                                    {isActive(href) && <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${color}-500 rounded-r-full`} />}
                                    <Icon className={`w-5 h-5 mr-3.5 transition-colors ${isActive(href) ? `text-${color}-400` : "text-slate-400 group-hover:text-white"}`} />
                                    <span className="font-semibold">{label}</span>
                                </Link>
                            )}
                        </motion.div>
                    ))}
                </motion.nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800">
                    <Link href="/" className="flex items-center px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all mb-2 group">
                        <Home className="w-5 h-5 mr-3.5 text-slate-400 group-hover:text-white" />
                        <span className="font-semibold">Back to Home</span>
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: "/rvsf/login" })}
                        className="w-full flex items-center px-4 py-3 rounded-xl text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all group">
                        <LogOut className="w-5 h-5 mr-3.5 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Sign Out</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main content */}
            <div className={`flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : ""}`}>
                {/* Top header */}
                <header className="h-16 bg-white dark:bg-[#0E192D] border-b border-gray-200 dark:border-slate-800 flex items-center px-4 justify-between z-30 sticky top-0">
                    <div className="flex items-center">
                        {!isSidebarOpen && (
                            <button onClick={() => setIsSidebarOpen(true)}
                                className="p-2 -ml-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-all">
                                <Menu className="w-6 h-6" />
                            </button>
                        )}
                        <span className={`ml-3 text-lg font-bold text-gray-900 dark:text-white ${isSidebarOpen ? "lg:invisible" : ""}`}>RVSF Portal</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">RVSF</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">{companyName}</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-[#E31E24]/10 border border-[#E31E24]/30 flex items-center justify-center">
                            <span className="text-[#E31E24] font-bold text-sm">{companyName[0]}</span>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-slate-950 p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
