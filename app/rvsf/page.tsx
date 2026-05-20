"use client"

import React, { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { Lock, ArrowRight, Loader2, Building2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"

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

    useEffect(() => {
        // Handle NextAuth URL errors
        const error = searchParams.get("error")
        if (error) {
            let errorMessage = "An unexpected error occurred during login."
            if (error === "CredentialsSignin") {
                errorMessage = "Invalid credentials provided."
            } else if (error === "AccessDenied") {
                errorMessage = "Access denied. You do not have permission to log in."
            } else if (error.includes("DATABASE_CONNECTION_ERROR")) {
                errorMessage = "Database connection failed. Please ensure your IP is whitelisted in MongoDB Atlas."
            }

            setTimeout(() => {
                toast({
                    title: "Authentication Error",
                    description: errorMessage,
                    variant: "destructive",
                })
            }, 100)
        }
    }, [searchParams, toast])

    const handleRVSFLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

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
                toast({
                    title: "Login Failed",
                    description: errorMsg,
                    variant: "destructive"
                })
            } else {
                toast({
                    title: "Welcome RVSF Partner",
                    description: "Redirecting to your dashboard...",
                })
                const callbackUrl = searchParams.get("callbackUrl")
                if (callbackUrl) {
                    window.location.href = callbackUrl
                } else {
                    window.location.href = "/rvsf_leads/dashboard"
                }
            }
        } catch (error) {
            console.error(error)
            setIsLoading(false)
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="relative h-screen overflow-hidden flex items-center justify-center font-sans">
            {/* Full Background Image */}
            <div className="fixed inset-0 z-0">
                <img 
                    src="/login.png" 
                    alt="Background" 
                    className="w-full h-full object-fill"
                />
            </div>

            {/* Login Card - aligned right, clear background */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-sm mx-4 lg:ml-auto lg:mr-64" style={{ marginTop: '72px' }}
            >
                <div className="bg-white/95 backdrop-blur-xl border border-gray-200 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative group">
                    {/* Glass Glow Effects */}
                    <div className="absolute -top-16 -left-16 w-32 h-32 bg-[#E31E24]/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
                    <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-[#E31E24]/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700" />

                    <div className="relative z-10 space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-1">
                            <h2 className="text-3xl font-sans font-black text-slate-900 tracking-tight">
                                RVSF Portal
                            </h2>
                            <p className="text-gray-600 text-sm font-medium">
                                Secure access for Registered Vehicle Scrapping Facilities
                            </p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5 pt-2"
                        >
                            <form onSubmit={handleRVSFLogin} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-800 ml-1 uppercase tracking-wider">RVSF ID / Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Building2 className="h-4 w-4 text-gray-400 group-focus-within:text-[#E31E24] transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={rvsfId}
                                            onChange={(e) => setRvsfId(e.target.value)}
                                            placeholder="Enter your RVSF ID"
                                            className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all duration-300 font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-800 ml-1 uppercase tracking-wider">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-[#E31E24] transition-colors" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
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

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#E31E24] hover:bg-[#c1191e] text-white font-black py-2.5 rounded-xl shadow-lg shadow-red-950/40 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-widest mt-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="text-center mt-6">
                                <p className="text-xs text-gray-500 font-medium">
                                    Authorized RVSF Personnel Only.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
