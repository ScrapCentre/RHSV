"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, Store, User, LogOut, Home, Menu, X, MessageSquare } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus_Jakarta_Sans } from "next/font/google"

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
})

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const pathname = usePathname()

    // Auto open sidebar only on xl+ screens
    useEffect(() => {
        const checkWidth = () => {
            setIsSidebarOpen(window.innerWidth >= 1280)
        }
        checkWidth()
        window.addEventListener('resize', checkWidth)
        return () => window.removeEventListener('resize', checkWidth)
    }, [])

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/")

    const hideLayout = pathname === "/rvsf/login" || pathname === "/rvsf/apply" ||
        status === "unauthenticated" || (session?.user as any)?.role !== "rvsf"

    if (hideLayout) {
        return <div className={`${plusJakartaSans.className} min-h-screen w-full`}>{children}</div>
    }

    const rvsfId = (session?.user as any)?.rvsfId || "—"
    const companyName = session?.user?.name || "RVSF"

    const navItems = [
        { href: "/rvsf/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "red", active: false, coming: false },
        { href: "/rvsf/ccs", label: "Collection Centers", icon: Building2, color: "red", active: false, coming: false },
        { href: "/rvsf/marketplace", label: "Marketplace", icon: Store, color: "red", active: false, coming: false },
        { href: "/rvsf/chats", label: "My Chats", icon: MessageSquare, color: "red", active: false, coming: false },
        { href: "/rvsf/profile", label: "My Profile", icon: User, color: "red", active: false, coming: true },
    ]

    return (
        <div className={`${plusJakartaSans.className} min-h-screen bg-slate-50 flex overflow-hidden transition-colors duration-300`}>
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
                className="fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-100 shadow-xl lg:shadow-none flex flex-col h-screen w-72"
            >
                {/* Header: Logo + toggle */}
                <div className="h-auto flex flex-col px-6 pt-6 pb-4 border-b border-slate-100 gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#E31E24]/10 border border-[#E31E24]/30 flex items-center justify-center">
                                <span className="text-sm font-black text-[#E31E24]">R</span>
                            </div>
                            <span className="text-lg font-black text-slate-900 tracking-tight">RVSF Portal</span>
                        </div>
                        {/* Close button — desktop & mobile */}
                        <button onClick={() => setIsSidebarOpen(false)}
                            className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {/* Company info */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                        <p className="text-slate-900 font-bold text-sm truncate">{companyName}</p>
                        <p className="text-[#E31E24] text-xs font-mono font-bold mt-0.5">{rvsfId}</p>
                    </div>
                </div>

                {/* Nav */}
                <motion.nav variants={sidebarContainerVariants} initial="hidden" animate="visible"
                    className="flex-1 overflow-y-auto py-5 px-4 space-y-1.5">
                    {navItems.map(({ href, label, icon: Icon, coming }) => (
                        <motion.div key={href} variants={sidebarLinkVariants}>
                            {coming ? (
                                <div className="flex items-center px-4 py-3 rounded-xl text-slate-400 cursor-not-allowed select-none bg-slate-50/50">
                                    <Icon className="w-5 h-5 mr-3.5" />
                                    <span className="font-semibold text-sm">{label}</span>
                                    <span className="ml-auto text-[9px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold">Soon</span>
                                </div>
                            ) : (
                                <Link href={href}
                                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden text-sm
                                        ${isActive(href)
                                            ? `bg-[#E31E24]/5 text-[#E31E24] font-bold shadow-sm`
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"}`}
                                >
                                    {isActive(href) && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E31E24] rounded-r-full" />}
                                    <Icon className={`w-5 h-5 mr-3.5 transition-colors ${isActive(href) ? "text-[#E31E24]" : "text-slate-400 group-hover:text-slate-700"}`} />
                                    <span>{label}</span>
                                </Link>
                            )}
                        </motion.div>
                    ))}
                </motion.nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100">
                    <Link href="/" className="flex items-center px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all mb-2 group text-sm font-medium">
                        <Home className="w-5 h-5 mr-3.5 text-slate-400 group-hover:text-slate-700" />
                        <span>Back to Home</span>
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: "/rvsf/login" })}
                        className="w-full flex items-center px-4 py-3 rounded-xl text-[#E31E24] bg-[#E31E24]/5 hover:bg-[#E31E24]/10 transition-all group text-sm font-bold">
                        <LogOut className="w-5 h-5 mr-3.5 group-hover:scale-110 transition-transform" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main content */}
            <div className={`flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? "xl:pl-72" : ""}`}>
                {/* Top header */}
                <header className="h-16 bg-white border-b border-slate-100 flex items-center px-4 justify-between z-30 sticky top-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all">
                            <Menu className="w-5 h-5" />
                        </button>
                        <span className="text-base sm:text-lg font-bold text-slate-800">RVSF Portal</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">RVSF PARTNER</span>
                            <span className="text-sm font-semibold text-slate-700 truncate max-w-[140px] sm:max-w-[180px] mt-1">{companyName}</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-[#E31E24]/10 border border-[#E31E24]/30 flex items-center justify-center">
                            <span className="text-[#E31E24] font-bold text-sm">{companyName[0]}</span>
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
