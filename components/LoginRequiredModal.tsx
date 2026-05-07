"use client"

import { motion, AnimatePresence } from "framer-motion"
import { LogIn, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

interface LoginRequiredModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function LoginRequiredModal({ isOpen, onClose }: LoginRequiredModalProps) {
    const router = useRouter()
    const pathname = usePathname()

    const handleLogin = () => {
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-8 relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 z-0 opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-tr-full -ml-10 -mb-10 z-0 opacity-50"></div>

                        {/* Close Button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors z-20"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="relative z-10 text-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm transform rotate-3">
                                <LogIn className="w-10 h-10 text-emerald-600 -rotate-3" />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Login Required</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                                To protect your data and provide a personalized experience, please log in before submitting your request.
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={handleLogin}
                                    className="w-full bg-[#0E192D] hover:bg-black text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                                >
                                    <span>Continue to Login</span>
                                    <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                
                                <button
                                    onClick={onClose}
                                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold py-3 px-6 rounded-xl transition-all text-sm"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
