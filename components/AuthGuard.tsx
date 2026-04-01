"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { LogIn } from "lucide-react"

export default function AuthGuard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const [showModal, setShowModal] = useState(false)

    // Show modal only if unauthenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            setShowModal(true)
        } else {
            setShowModal(false)
        }
    }, [status])

    // Don't render anything while checking session to avoid flash (optional)
    if (status === "loading") return null

    // If authenticated, render nothing (allow access)
    if (status === "authenticated") return null

    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 relative overflow-hidden"
                    >
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-10 -mt-10 z-0 opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-tr-full -ml-10 -mb-10 z-0 opacity-50"></div>

                        <div className="relative z-10 text-center">
                            <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm transform rotate-3">
                                <LogIn className="w-10 h-10 text-green-600 -rotate-3" />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Login Required</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                Please login or sign up to access this feature and continue your request.
                            </p>

                            <button
                                onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)}
                                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                            >
                                <span>Login / Sign Up</span>
                                <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

