"use client"

import React, { useState } from "react"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react"
import Image from "next/image"

export default function AdminLoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

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
                let errorMsg = "Invalid email or password."
                if (result.error.includes("AUTH_ERROR:")) {
                    errorMsg = result.error.split("AUTH_ERROR:")[1]
                } else if (result.error.includes("DATABASE_CONNECTION_ERROR")) {
                    errorMsg = "Database unreachable. Check MongoDB IP Whitelist."
                } else if (result.error !== "CredentialsSignin") {
                    errorMsg = result.error
                }
                setError(errorMsg)
                setIsLoading(false)
            } else {
                const params = new URLSearchParams(window.location.search)
                const callbackUrl = params.get("callbackUrl")
                window.location.href = callbackUrl || "/admin"
            }
        } catch (err) {
            setError("A secure connection error occurred. Please try again.")
            setIsLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center lg:items-center lg:justify-end p-4 sm:p-6 lg:pr-20 xl:pr-32 2xl:pr-44 selection:bg-[#E31E24] selection:text-white transition-all duration-500 font-sans"
            style={{
                backgroundImage: "url('/adminlogin.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[400px] relative z-10"
            >
                {/* Card */}
                <div className="relative group">
                    {/* Card Border Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-[#E31E24]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700" />
                    
                    <div className="relative bg-white/95 backdrop-blur-md border border-slate-100 p-6 sm:p-8 rounded-2xl shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="bg-red-50 border border-red-200 text-red-600 text-xs py-2.5 px-4 rounded-xl font-medium text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                                    Login ID or Email
                                </label>
                                <div className="relative mt-1.5">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="sc01@scrapcentre.in"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-[#E31E24]/60 focus:bg-white rounded-xl px-11 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                                    Access Key
                                </label>
                                <div className="relative mt-1.5">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-[#E31E24]/60 focus:bg-white rounded-xl px-11 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium"
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

                            {/* Submit */}
                            <button
                                disabled={isLoading}
                                type="submit"
                                className="w-full py-3.5 bg-[#E31E24] hover:bg-[#c9181d] active:scale-[0.98] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group/btn shadow-lg shadow-red-600/10 text-sm mt-6"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
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
