"use client"

import React, { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, ArrowRight, Loader2, Building2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { Plus_Jakarta_Sans } from "next/font/google"

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
})


export default function RVSFLoginPage() {
    return (
        <React.Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[#E31E24]" />
            </div>
        }>
            <RVSFLoginContent />
        </React.Suspense>
    )
}

function RVSFLoginContent() {
    const { toast } = useToast()
    const searchParams = useSearchParams()

    const [rvsfId, setRvsfId] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Handle NextAuth URL errors
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

    const handleRVSFLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const result = await signIn("rvsf-credentials", {
                rvsfId,
                password,
                redirect: false,
            })

            if (result?.error) {
                setIsLoading(false)
                let errorMsg = "Invalid RVSF ID or Password. Please check your credentials."
                if (result.error.includes("DATABASE_CONNECTION_ERROR")) {
                    errorMsg = "Database connection failed. Please ensure your IP is whitelisted in MongoDB Atlas."
                }
                setError(errorMsg)
            } else {
                toast({
                    title: "Welcome RVSF Partner",
                    description: "Redirecting to your dashboard...",
                })
                const callbackUrl = searchParams.get("callbackUrl")
                if (callbackUrl) {
                    window.location.href = callbackUrl
                } else {
                    window.location.href = "/rvsf/dashboard"
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
            className={`${plusJakartaSans.className} min-h-screen flex items-center justify-center lg:justify-end p-4 sm:p-6 lg:pr-16 xl:pr-24 2xl:pr-44 selection:bg-[#E31E24] selection:text-white transition-all duration-500 bg-slate-950`}
            style={{ 
                backgroundImage: "url('/rvsflogin.png')", 
                backgroundSize: 'cover', 
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat' 
            }}
        >
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[440px] relative"
            >
                {/* Login Card */}
                <div className="relative group">
                    {/* Card Border Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-[#E31E24]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000" />
                    
                    <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)]">

                        <form onSubmit={handleRVSFLogin} className="space-y-4 sm:space-y-5 lg:space-y-6">
                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-50 border border-red-200 text-red-600 text-xs py-3 px-4 rounded-xl font-medium text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">RVSF Identity</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="RVSF ID or Email"
                                        value={rvsfId}
                                        onChange={(e) => setRvsfId(e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-[#E31E24] focus:ring-4 focus:ring-[#E31E24]/10 focus:bg-white rounded-xl px-11 py-3 sm:py-3.5 lg:py-4 text-slate-900 outline-none transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Security Key</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-[#E31E24] focus:ring-4 focus:ring-[#E31E24]/10 focus:bg-white rounded-xl px-11 py-3 sm:py-3.5 lg:py-4 text-slate-900 outline-none transition-all placeholder:text-slate-400"
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
                                className="w-full py-3 sm:py-3.5 lg:py-4 bg-[#E31E24] hover:bg-[#c9181d] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group/btn shadow-lg shadow-red-600/10 mt-2"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        Authorize Access
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
