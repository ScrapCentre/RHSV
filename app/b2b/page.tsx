"use client"

import React, { useState } from "react"
import { signIn } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Lock, 
    ArrowRight, 
    Loader2, 
    Mail, 
    Eye, 
    EyeOff,
    Briefcase,
    ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function B2BLoginPage() {
    const [userId, setUserId] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const result = await signIn("b2b-credentials", {
                userId,
                password,
                redirect: false,
            })

            if (result?.error) {
                setIsLoading(false)
                let errorMsg = "Invalid Partner ID or password. Please try again."
                if (result.error.includes("DATABASE_CONNECTION_ERROR")) {
                    errorMsg = "Database connection failed. Please ensure your IP is whitelisted in MongoDB Atlas."
                }
                setError(errorMsg)
            } else {
                router.push("/b2b/dashboard")
            }
        } catch (err) {
            setIsLoading(false)
            setError("An unexpected error occurred. Please contact support.")
        }
    }

    return (
        <div className="min-h-screen bg-[#070D19] flex items-center justify-center p-4 font-sans selection:bg-blue-500 selection:text-white transition-all duration-500">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[440px] relative"
            >
                {/* Branding */}
                <div className="flex flex-col items-center mb-12 text-center">
                    <h1 className="text-2xl font-light text-white tracking-[0.2em] uppercase">Partner Portal</h1>
                    <div className="h-px w-12 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent mt-4" />
                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em] mt-4">Logistics Network Access</p>
                </div>

                {/* Login Card */}
                <div className="relative group">
                    {/* Card Border Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-500/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000" />
                    
                    <div className="relative bg-slate-950/40 backdrop-blur-2xl border border-white/5 p-10 rounded-2xl shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl font-medium text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Partner Identity</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Partner ID / Email"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        className="w-full bg-white/[0.02] border border-white/5 focus:border-blue-500/30 rounded-xl px-11 py-4 text-white outline-none transition-all placeholder:text-white/10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Secure Key</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/[0.02] border border-white/5 focus:border-blue-500/30 rounded-xl px-11 py-4 text-white outline-none transition-all placeholder:text-white/10"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                disabled={isLoading}
                                type="submit"
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group/btn shadow-lg shadow-blue-600/10"
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

                {/* Footer Info */}
                <div className="mt-12 text-center space-y-6">
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-medium leading-relaxed">
                        Authorized B2B Access Only &bull; Secured Terminal
                    </p>
                    
                    <div className="flex flex-col gap-4">
                        <Link href="/partner-register" className="text-[10px] text-blue-400 hover:text-blue-300 uppercase tracking-widest font-black transition-colors">
                            Apply for Partnership Account
                        </Link>
                        <Link href="/" className="flex items-center justify-center gap-2 text-white/20 hover:text-white/40 transition-colors text-[10px] font-black uppercase tracking-widest">
                            <ArrowLeft className="w-3 h-3" />
                            Return to Website
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
