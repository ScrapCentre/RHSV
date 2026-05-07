"use client"

import React, { useState } from "react"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminLoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                console.log("[AdminLogin] Error:", result.error);
                let errorMsg = "Invalid email or password."
                if (result.error.includes("AUTH_ERROR:")) {
                    errorMsg = result.error.split("AUTH_ERROR:")[1]
                } else if (result.error.includes("DATABASE_CONNECTION_ERROR")) {
                    errorMsg = "Database unreachable. Check MongoDB IP Whitelist."
                } else if (result.error !== "CredentialsSignin") {
                    errorMsg = result.error
                }
                setError(errorMsg);
                setIsLoading(false)
            } else {
                // Check if there is a callbackUrl in the URL
                const params = new URLSearchParams(window.location.search)
                const callbackUrl = params.get("callbackUrl")
                
                // Use window.location.href for a hard reload
                window.location.href = callbackUrl || "/admin"
            }
        } catch (err) {
            setError("A secure connection error occurred. Please try again.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans selection:bg-emerald-500 selection:text-white transition-all duration-500">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[440px] relative"
            >
                {/* Branding */}
                <div className="flex flex-col items-center mb-12 text-center">
                    <h1 className="text-2xl font-light text-white tracking-[0.2em] uppercase">Admin Portal</h1>
                    <div className="h-px w-12 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent mt-4" />
                </div>

                {/* Login Card */}
                <div className="relative group">
                    {/* Card Border Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-emerald-500/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000" />
                    
                    <div className="relative bg-slate-950/40 backdrop-blur-2xl border border-white/5 p-10 rounded-2xl shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl font-medium text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Administrator Identity</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Email or Login ID"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/[0.02] border border-white/5 focus:border-emerald-500/30 rounded-xl px-11 py-4 text-white outline-none transition-all placeholder:text-white/10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Access Key</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/[0.02] border border-white/5 focus:border-emerald-500/30 rounded-xl px-11 py-4 text-white outline-none transition-all placeholder:text-white/10"
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
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group/btn shadow-lg shadow-emerald-600/10"
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
                <div className="mt-12 text-center space-y-4">
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-medium">
                        Secure Environment &bull; Administrative Clearance Required
                    </p>
                    <button 
                        onClick={() => window.location.href = "/"}
                        className="text-[10px] text-emerald-500/40 hover:text-emerald-500/60 uppercase tracking-widest font-black transition-colors"
                    >
                        Return to Public Terminal
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
