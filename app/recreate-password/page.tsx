"use client"

import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, Eye, EyeOff, Loader2, Check, X, ShieldAlert, KeyRound } from "lucide-react"

export default function RecreatePasswordPage() {
    const { data: session, update, status } = useSession()
    const router = useRouter()

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    // Validation checks
    const hasMinLength = password.length >= 6
    const passwordsMatch = password && password === confirmPassword
    const isFormValid = hasMinLength && passwordsMatch

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isFormValid) return

        setIsLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/recreate-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to update password.")
            }

            setSuccess(true)

            // Update session in next-auth client side
            await update({ mustChangePassword: false })

            // Redirect based on role
            const role = (session?.user as any)?.role
            setTimeout(() => {
                if (role === "admin") {
                    window.location.href = "/admin/dashboard"
                } else if (role === "partner") {
                    window.location.href = "/personal/marketplace"
                } else if (role === "executive") {
                    window.location.href = "/executive/dashboard"
                } else if (role === "scrapcentre") {
                    window.location.href = "/scrapcentre/dashboard"
                } else if (role === "rvsf") {
                    window.location.href = "/rvsf/dashboard"
                } else if (role === "cc_operator") {
                    window.location.href = "/cc/dashboard"
                } else {
                    window.location.href = "/"
                }
            }, 1500)

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.")
            setIsLoading(false)
        }
    }

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0E192D]">
                <Loader2 className="w-10 h-10 animate-spin text-red-500" />
            </div>
        )
    }

    if (status === "unauthenticated" || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0E192D] text-white p-4">
                <div className="max-w-md w-full text-center space-y-4 bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-xl">
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto animate-bounce" />
                    <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
                    <p className="text-gray-400">You must be logged in to view this page.</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-950/40 uppercase tracking-wider text-xs"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="relative h-screen w-full overflow-hidden flex items-center justify-center font-sans">
            {/* Background Image Wrapper */}
            <div className="fixed inset-0 z-0">
                <img 
                    src="/login.png" 
                    alt="Background" 
                    className="w-full h-full object-fill opacity-90 filter brightness-75"
                />
                <div className="absolute inset-0 bg-[#0E192D]/40 backdrop-blur-[2px]" />
            </div>

            {/* Content Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="bg-white/95 backdrop-blur-xl border border-gray-200/50 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative group">
                    
                    {/* Glowing Accent Orbs */}
                    <div className="absolute -top-16 -left-16 w-36 h-36 bg-[#E31E24]/10 rounded-full blur-3xl opacity-60 pointer-events-none" />
                    <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-[#E31E24]/10 rounded-full blur-3xl opacity-60 pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                        
                        {/* Title Section */}
                        <div className="text-center space-y-2">
                            <div className="inline-flex p-3 bg-red-500/10 text-[#E31E24] rounded-2xl mb-1">
                                <KeyRound className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                Recreate Password
                            </h2>
                            <p className="text-gray-500 text-sm font-medium">
                                First-time login detected. Please set a strong, permanent password to secure your account.
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {success ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3"
                                >
                                    <div className="inline-flex p-2.5 bg-emerald-500/10 text-emerald-600 rounded-full">
                                        <Check className="w-6 h-6 stroke-[3]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-emerald-950">Password Saved!</h3>
                                    <p className="text-sm text-emerald-700">
                                        Your password has been updated. Redirecting to your dashboard...
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                                    
                                    {/* Error Message */}
                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
                                            <ShieldAlert className="w-4 h-4 shrink-0 text-[#E31E24]" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    {/* New Password Input */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-800 ml-1 uppercase tracking-wider">New Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-[#E31E24] transition-colors" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                disabled={isLoading}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter new password"
                                                className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all duration-300 font-bold"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#E31E24] transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password Input */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-800 ml-1 uppercase tracking-wider">Confirm Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-[#E31E24] transition-colors" />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                disabled={isLoading}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Re-enter password"
                                                className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all duration-300 font-bold"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#E31E24] transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Live Validation Checklist */}
                                    <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-200/50 space-y-2 mt-2">
                                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password Requirements</h4>
                                        
                                        <div className="flex items-center gap-2 text-xs">
                                            {hasMinLength ? (
                                                <span className="p-0.5 bg-emerald-500/10 text-emerald-600 rounded-full">
                                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                </span>
                                            ) : (
                                                <span className="p-0.5 bg-gray-200 text-gray-500 rounded-full">
                                                    <X className="w-3.5 h-3.5 stroke-[3]" />
                                                </span>
                                            )}
                                            <span className={hasMinLength ? "text-emerald-700 font-semibold" : "text-gray-500 font-medium"}>
                                                At least 6 characters
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs">
                                            {passwordsMatch ? (
                                                <span className="p-0.5 bg-emerald-500/10 text-emerald-600 rounded-full">
                                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                </span>
                                            ) : (
                                                <span className="p-0.5 bg-gray-200 text-gray-500 rounded-full">
                                                    <X className="w-3.5 h-3.5 stroke-[3]" />
                                                </span>
                                            )}
                                            <span className={passwordsMatch ? "text-emerald-700 font-semibold" : "text-gray-500 font-medium"}>
                                                Passwords match correctly
                                            </span>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading || !isFormValid}
                                        className="w-full bg-[#E31E24] hover:bg-[#c1191e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl shadow-lg shadow-red-950/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs uppercase tracking-widest mt-4"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            "Submit Permanent Password"
                                        )}
                                    </button>

                                </motion.form>
                            )}
                        </AnimatePresence>

                    </div>
                </div>
            </motion.div>
        </div>
    )
}
