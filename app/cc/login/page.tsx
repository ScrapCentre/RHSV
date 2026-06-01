"use client"

import React, { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, ArrowRight, Loader2, Mail, Eye, EyeOff, Shield } from "lucide-react"
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
        <div className={`${plusJakartaSans.className} min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-zinc-900 to-black selection:bg-[#E31E24] selection:text-white`}>
            {/* Visual background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-600 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#E31E24] rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[440px] relative z-10"
            >
                <div className="relative group">
                    {/* Glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E31E24]/20 to-red-500/10 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000" />
                    
                    <div className="relative bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 p-8 sm:p-10 rounded-2xl shadow-2xl">
                        <div className="flex flex-col items-center mb-6 text-center">
                            <div className="w-12 h-12 rounded-xl bg-[#E31E24]/10 border border-[#E31E24]/20 flex items-center justify-center text-[#E31E24] mb-3">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-extrabold text-white uppercase tracking-wider">CC Operator Terminal</h2>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1.5">Collection Center Authorization Required</p>
                        </div>

                        <form onSubmit={handleCCLogin} className="space-y-5">
                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-950/50 border border-red-800/60 text-red-400 text-xs py-3 px-4 rounded-xl font-semibold text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Operator Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input 
                                        type="email" 
                                        required
                                        placeholder="operator@scrapcentre.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-[#E31E24]/80 text-white rounded-xl px-11 py-3.5 text-sm outline-none transition-all placeholder:text-zinc-650"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Access Passcode</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-[#E31E24]/80 text-white rounded-xl px-11 py-3.5 text-sm outline-none transition-all placeholder:text-zinc-650"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                disabled={isLoading}
                                type="submit"
                                className="w-full py-3.5 bg-[#E31E24] hover:bg-[#c9181d] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group/btn shadow-lg shadow-red-600/10 mt-2 text-sm"
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
