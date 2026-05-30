"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Activity,
    LogOut,
    Home,
    Menu,
    X,
    Shield,
    Database,
    Truck
} from "lucide-react"

import { signOut, useSession } from "next-auth/react"
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

export default function PartnerClientLayout({ children }: { children: React.ReactNode }) {
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

    // Helper to check if a link is active
    const isActive = (path: string) => pathname === path || (pathname?.startsWith(path + "/") && path !== "/b2b/marketplace")

    // Check if we are on the login page (/b2b)
    const isLoginPage = pathname === "/b2b"

    // If on login page OR not authenticated/not a partner, don't show sidebar/header
    const hideLayout = isLoginPage || status === "unauthenticated" || (session?.user as any)?.role !== "partner"

    if (hideLayout) {
        return <div className="min-h-screen w-full font-sans">{children}</div>
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
                        <Shield className="w-8 h-8 text-blue-400 mr-2" />
                        <span className="text-xl font-black text-white tracking-tight">Partner Panel</span>
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
                        <Link href="/b2b/dashboard" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${pathname === '/b2b/dashboard' ? 'bg-indigo-500/10 text-indigo-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            {pathname === '/b2b/dashboard' && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 rounded-r-full" />
                            )}
                            <Home className={`w-5 h-5 mr-3.5 transition-colors ${pathname === '/b2b/dashboard' ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'}`} />
                            <span className="font-semibold">Dashboard</span>
                        </Link>
                    </motion.div>

                    {/* Market Feed */}
                    <motion.div variants={sidebarLinkVariants}>
                        <Link href="/b2b/marketplace" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${pathname === '/b2b/marketplace' ? 'bg-blue-500/10 text-blue-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            {pathname === '/b2b/marketplace' && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-r-full" />
                            )}
                            <Activity className={`w-5 h-5 mr-3.5 transition-colors ${pathname === '/b2b/marketplace' ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`} />
                            <span className="font-semibold">Market Feed</span>
                        </Link>
                    </motion.div>

                    {/* Enter Data */}
                    <motion.div variants={sidebarLinkVariants}>
                        <Link href="/b2b/enter-data" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/b2b/enter-data') ? 'bg-purple-500/10 text-purple-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            {isActive('/b2b/enter-data') && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500 rounded-r-full" />
                            )}
                            <Database className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/b2b/enter-data') ? 'text-purple-400' : 'text-slate-400 group-hover:text-white'}`} />
                            <span className="font-semibold">Enter Your data here</span>
                        </Link>
                    </motion.div>

                    {/* Pickups */}
                    <motion.div variants={sidebarLinkVariants}>
                        <Link href="/b2b/pickups" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive('/b2b/pickups') ? 'bg-emerald-500/10 text-emerald-400 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            {isActive('/b2b/pickups') && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-r-full" />
                            )}
                            <Truck className={`w-5 h-5 mr-3.5 transition-colors ${isActive('/b2b/pickups') ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'}`} />
                            <span className="font-semibold">Pickups</span>
                        </Link>
                    </motion.div>

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
            <div className={`flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'xl:pl-72' : ''}`}>
                {/* Header */}
                <header className="h-16 bg-white dark:bg-[#0E192D] border-b border-gray-200 dark:border-slate-800 flex items-center px-4 justify-between z-30 sticky top-0 transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-1 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Partner Panel</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <ThemeToggle />
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Partner</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Dashboard</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-auto overflow-y-auto bg-gray-50 dark:bg-slate-950 p-3 sm:p-4 lg:p-6 xl:p-8 transition-colors duration-300">
                    {children}
                </main>
            </div>
        </div>
    )
}
