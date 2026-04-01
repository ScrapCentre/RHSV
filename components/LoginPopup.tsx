"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, LogIn } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

export default function LoginPopup() {
    const [isVisible, setIsVisible] = useState(false)
    const router = useRouter()
    const { data: session } = useSession()

    const pathname = usePathname()

    useEffect(() => {
        // Check if user has already seen the popup in this session
        const hasSeenPopup = sessionStorage.getItem("hasSeenLoginPopup")

        // Only show popup if user is NOT logged in, hasn't seen it yet, AND is not on restricted pages
        const isRestrictedPage = pathname === "/login" || pathname.startsWith("/services") || pathname === "/quote"
        if (!session && !hasSeenPopup && !isRestrictedPage) {
            const timer = setTimeout(() => {
                setIsVisible(true)
                // Mark as seen immediately when showing (or could do on close, but requirement implies "only one time")
                sessionStorage.setItem("hasSeenLoginPopup", "true")
            }, 30000) // 30 seconds

            return () => clearTimeout(timer)
        }
    }, [session, pathname])

    const handleLoginRedirect = () => {
        setIsVisible(false)
        router.push("/login")
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative border-t-4 border-green-600"
                    >
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <LogIn className="w-8 h-8 text-blue-900" />
                            </div>
                            <h3 className="text-xl font-bold text-blue-900 mb-2">Join ScrapCenter!</h3>
                            <p className="text-gray-600 text-sm">
                                Sign up to track your valuations, get exclusive offers, and manage your vehicle requests.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleLoginRedirect}
                                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-green-600/30"
                            >
                                Login / Sign Up
                            </button>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="w-full text-blue-900 hover:text-blue-700 font-medium text-sm py-2"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

