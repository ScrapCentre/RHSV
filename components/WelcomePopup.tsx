"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, X } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

export default function WelcomePopup() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (searchParams.get("welcome") === "true") {
            setIsOpen(true)
            // Clean up URL
            router.replace("/", { scroll: false })
        }
    }, [searchParams, router])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative"
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-4 pt-2">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Welcome to ScrapCenter!</h2>
                                <p className="text-gray-500 mt-2">
                                    You have successfully logged in. We are excited to have you on board.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all"
                            >
                                Get Started
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

