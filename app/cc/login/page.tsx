"use client"

import React, { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, ArrowRight, Loader2, Mail, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { Plus_Jakarta_Sans } from "next/font/google"

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
})

export default function CCLoginPage() {
    return (
        <React.Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center bg-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-[#E31E24]" />
            </div>
        }>
            <CCLoginContent />
        </React.Suspense>
    )
}

function CCLoginContent() {
    const { toast } = useToast()
    const searchParams = useSearchParams()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const errorParam = searchParams.get("error")
        if (errorParam) {
            let errorMessage = "An unexpected error occurred during login."
            if (errorParam === "CredentialsSignin") {
                errorMessage = "Invalid credentials provided."
            } else if (errorParam === "AccessDenied") {
                errorMessage = "Access denied. You do not have permission to log in."
            } else if (errorParam.includes("DATABASE_CONNECTION_ERROR")) {
                errorMessage = "Database connection failed. Please ensure your IP is whitelisted in MongoDB Atlas."
            }
            setError(errorMessage)
        }
    }, [searchParams])

    const handleCCLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const result = await signIn("cc-operator-credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setIsLoading(false)
                let errorMsg = "Invalid Email or Password. Please check your credentials."
                if (result.error.includes("DATABASE_CONNECTION_ERROR")) {
                    errorMsg = "Database connection failed. Please ensure your IP is whitelisted in MongoDB Atlas."
                }
                setError(errorMsg)
            } else {
                toast({
                    title: "CC Operator Authenticated",
                    description: "Redirecting to your dashboard...",
                })
                const callbackUrl = searchParams.get("callbackUrl")
                if (callbackUrl) {
                    window.location.href = callbackUrl
                } else {
                    window.location.href = "/cc/dashboard"
                }
            }
        } catch (err) {
            console.error(err)
            setIsLoading(false)
            setError("An unexpected error occurred. Please try again.")
        }
    }

    return (
        <div 
            className={`${plusJakartaSans.className} min-h-screen flex items-center justify-center lg:items-center lg:justify-end p-4 sm:p-6 lg:pr-20 xl:pr-32 2xl:pr-44 selection:bg-[#E31E24] selection:text-white transition-all duration-500 bg-slate-950`}
            style={{ 
                backgroundImage: "url('/cclogin.png')", 
                backgroundSize: "cover", 
                backgroundPosition: "center", 
                backgroundRepeat: "no-repeat" 
            }}
        >
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[400px] relative z-10"
            >
                <div className="relative group">
                    {/* Glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-[#E31E24]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700" />
                    
                    <div className="relative bg-white/95 backdrop-blur-md border border-slate-100 p-6 sm:p-8 rounded-2xl shadow-2xl">

                        <form onSubmit={handleCCLogin} className="space-y-4">
                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-50 border border-red-200 text-red-600 text-xs py-2.5 px-4 rounded-xl font-medium text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Operator Email</label>
                                <div className="relative mt-1.5">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="email" 
                                        required
                                        placeholder="operator@scrapcentre.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-[#E31E24]/60 focus:bg-white rounded-xl px-11 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Access Passcode</label>
                                <div className="relative mt-1.5">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-[#E31E24]/60 focus:bg-white rounded-xl px-11 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-450 font-medium"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                disabled={isLoading}
                                type="submit"
                                className="w-full py-3.5 bg-[#E31E24] hover:bg-[#c9181d] active:scale-[0.98] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group/btn shadow-lg shadow-red-600/10 text-sm mt-6"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        Authenticate Terminal
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
