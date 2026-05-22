"use client"

import React, { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, ArrowRight, Loader2, Building2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { isRvsfRole, landingForRole } from "@/lib/landing-by-role"

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
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session, status } = useSession()

    const [rvsfId, setRvsfId] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // If an RVSF user is already authenticated, skip the form and route them
    // straight to their landing page. Honors ?callbackUrl=… if present,
    // otherwise uses the shared LANDING_BY_ROLE map (single source of truth
    // shared with /post-login and /login).
    useEffect(() => {
        if (status !== "authenticated") return
        const role = (session?.user as any)?.role
        if (isRvsfRole(role)) {
            const cb = searchParams.get("callbackUrl")
            router.replace(cb || landingForRole(role))
        }
    }, [status, session, router, searchParams])

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
                    description: "Redirecting to your marketplace...",
                })
                // Honor explicit ?callbackUrl=… if provided, otherwise hand off
                // to the role-aware dispatcher at /post-login (which routes
                // rvsf_admin / rvsf_executive to /rvsf/marketplace).
                // We avoid the legacy /rvsf_leads/dashboard target — that page
                // still guards on role === "rvsf" (pre-v2 taxonomy) and would
                // bounce v2 users back to the home page.
                const callbackUrl = searchParams.get("callbackUrl")
                window.location.href = callbackUrl || "/post-login"
            }
        } catch (err) {
            console.error(err)
            setIsLoading(false)
            setError("An unexpected error occurred. Please try again.")
        }
    }

    return (
        <div 
            className="min-h-screen flex items-end lg:items-end justify-center lg:justify-end pb-10 lg:pb-28 xl:pb-36 p-4 lg:pr-32 xl:pr-44 font-sans selection:bg-[#E31E24] selection:text-white transition-all duration-500"
            style={{ 
                backgroundImage: "url('/rvsflogin.png')", 
                backgroundSize: '100% 100%', 
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
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-[#E31E24]/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000" />
                    
                    <div className="relative bg-white/95 backdrop-blur-md border border-slate-100 p-10 rounded-2xl shadow-2xl">
                        <form onSubmit={handleRVSFLogin} className="space-y-6">
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
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#E31E24]/60 focus:bg-white rounded-xl px-11 py-4 text-slate-900 outline-none transition-all placeholder:text-slate-400"
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
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#E31E24]/60 focus:bg-white rounded-xl px-11 py-4 text-slate-900 outline-none transition-all placeholder:text-slate-400"
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
                                className="w-full py-4 bg-[#E31E24] hover:bg-[#c9181d] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group/btn shadow-lg shadow-red-600/10"
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
