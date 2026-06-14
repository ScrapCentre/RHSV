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
    const [lockoutTimeLeft, setLockoutTimeLeft] = useState<number | null>(null) // in seconds
    const [bypassOptions, setBypassOptions] = useState<string[] | null>(null)
    const [isRequestingBypass, setIsRequestingBypass] = useState(false)
    const [bypassStatus, setBypassStatus] = useState("")

    // Check lockout on mount
    React.useEffect(() => {
        const stored = localStorage.getItem("admin_lockout_until")
        if (stored) {
            const until = parseInt(stored)
            const left = Math.ceil((until - Date.now()) / 1000)
            if (left > 0) {
                setLockoutTimeLeft(left)
            } else {
                localStorage.removeItem("admin_lockout_until")
            }
        }
    }, [])

    // Countdown interval
    React.useEffect(() => {
        if (lockoutTimeLeft === null || lockoutTimeLeft <= 0) {
            if (lockoutTimeLeft === 0) {
                setLockoutTimeLeft(null)
                setError("")
                setBypassOptions(null)
                setBypassStatus("")
            }
            return
        }

        const timer = setInterval(() => {
            setLockoutTimeLeft(prev => {
                if (prev !== null && prev > 1) {
                    return prev - 1
                }
                clearInterval(timer)
                localStorage.removeItem("admin_lockout_until")
                return null
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [lockoutTimeLeft])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    const handleRequestBypass = async () => {
        const requestEmail = email || "scrapcentreadmin@gmail.com"
        setIsRequestingBypass(true)
        setError("")
        setBypassStatus("Requesting verification code...")

        try {
            const res = await fetch("/api/admin/bypass-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: requestEmail }),
            })

            const data = await res.json()
            if (res.ok) {
                setBypassOptions(data.options)
                setBypassStatus("Verification sent to sxxxxxxxxx69@gmail.com. Select correct option:")
            } else {
                setError(data.message || "Failed to initiate bypass request.")
                setBypassStatus("")
            }
        } catch (err) {
            setError("Failed to communicate with authorization server.")
            setBypassStatus("")
        } finally {
            setIsRequestingBypass(false)
        }
    }

    const handleVerifyBypass = async (selectedOption: string) => {
        setIsLoading(true)
        setError("")
        setBypassStatus("Verifying code and unlocking...")
        const requestEmail = email || "scrapcentreadmin@gmail.com"

        try {
            const res = await fetch("/api/admin/bypass-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: requestEmail, selectedOption }),
            })

            const data = await res.json()
            if (res.ok && data.success) {
                setBypassStatus("Identity verified! Logging you in...")
                localStorage.removeItem("admin_lockout_until")
                setLockoutTimeLeft(null)
                setBypassOptions(null)

                // Trigger NextAuth login automatically using the one-time bypass token
                const result = await signIn("credentials", {
                    email: requestEmail,
                    password: data.token,
                    redirect: false,
                })

                if (result?.error) {
                    setError("Bypass login failed: " + result.error)
                    setIsLoading(false)
                    setBypassStatus("")
                } else {
                    const params = new URLSearchParams(window.location.search)
                    const callbackUrl = params.get("callbackUrl")
                    window.location.href = callbackUrl || "/admin"
                }
            } else {
                setError(data.message || "Incorrect verification number chosen.")
                setBypassStatus("")
                setIsLoading(false)
            }
        } catch (err) {
            setError("Bypass verification communication error.")
            setBypassStatus("")
            setIsLoading(false)
        }
    }

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
                if (result.error.includes("LOCKOUT:")) {
                    const parts = result.error.split("LOCKOUT:")
                    const mins = parseInt(parts[1]) || 10
                    const seconds = mins * 60
                    setLockoutTimeLeft(seconds)
                    localStorage.setItem("admin_lockout_until", (Date.now() + seconds * 1000).toString())
                    errorMsg = `Too many failed login attempts. Access is locked.`
                } else if (result.error.includes("AUTH_ERROR:")) {
                    errorMsg = result.error.split("AUTH_ERROR:")[1]
                    if (errorMsg.includes("LOCKOUT:")) {
                        const parts = errorMsg.split("LOCKOUT:")
                        const mins = parseInt(parts[1]) || 10
                        const seconds = mins * 60
                        setLockoutTimeLeft(seconds)
                        localStorage.setItem("admin_lockout_until", (Date.now() + seconds * 1000).toString())
                        errorMsg = `Too many failed login attempts. Access is locked.`
                    }
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
            className="min-h-screen flex items-end justify-center pb-4 sm:pb-6 lg:items-center lg:justify-end p-4 sm:p-6 lg:pb-0 lg:pr-32 xl:pr-48 2xl:pr-64 selection:bg-[#E31E24] selection:text-white transition-all duration-500 font-sans"
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
                className="w-full max-w-[340px] relative z-10"
            >
                {/* Card */}
                <div className="relative group">
                    {/* Card Border Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-[#E31E24]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700" />
                    
                    <div className="relative bg-white/95 backdrop-blur-md border border-slate-100 p-4 sm:p-5 rounded-2xl shadow-2xl">
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

                            {lockoutTimeLeft !== null && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-xs py-3 px-4 rounded-xl flex flex-col items-center gap-2 font-medium">
                                    <div className="flex items-center gap-1.5 font-bold text-red-600 uppercase tracking-wider">
                                        <ShieldCheck className="w-4 h-4 animate-pulse" />
                                        <span>Access Temporarily Locked</span>
                                    </div>
                                    <p className="text-center">
                                        Too many failed attempts. Try again in <strong className="text-sm font-bold text-red-600">{formatTime(lockoutTimeLeft)}</strong>
                                    </p>
                                    
                                    {!bypassOptions && (
                                        <button
                                            type="button"
                                            disabled={isRequestingBypass}
                                            onClick={handleRequestBypass}
                                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline font-bold uppercase tracking-wider disabled:opacity-50"
                                        >
                                            {isRequestingBypass ? "Sending Request..." : "Forgot Password?"}
                                        </button>
                                    )}
                                </div>
                            )}

                            {bypassStatus && (
                                <div className="text-center text-[11px] text-slate-600 font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                                    {bypassStatus}
                                </div>
                            )}

                            {bypassOptions && (
                                <div className="grid grid-cols-3 gap-3 pt-1">
                                    {bypassOptions.map(option => (
                                        <button
                                            key={option}
                                            type="button"
                                            disabled={isLoading}
                                            onClick={() => handleVerifyBypass(option)}
                                            className="py-3 bg-slate-50 border border-slate-200 hover:border-[#E31E24] text-slate-800 hover:text-[#E31E24] hover:bg-red-50/50 rounded-xl text-sm font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
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
                                        disabled={lockoutTimeLeft !== null || isLoading}
                                        placeholder="sc01@scrapcentre.in"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-[#E31E24]/60 focus:bg-white rounded-xl px-11 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium disabled:opacity-50"
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
                                        disabled={lockoutTimeLeft !== null || isLoading}
                                        placeholder="••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-[#E31E24]/60 focus:bg-white rounded-xl px-11 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium disabled:opacity-50"
                                    />
                                    <button
                                        type="button"
                                        disabled={lockoutTimeLeft !== null || isLoading}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                disabled={lockoutTimeLeft !== null || isLoading}
                                type="submit"
                                className="w-full py-2.5 bg-[#E31E24] hover:bg-[#c9181d] active:scale-[0.98] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group/btn shadow-lg shadow-red-600/10 text-sm mt-4"
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
