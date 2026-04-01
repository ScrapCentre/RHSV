"use client"

import React, { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, ArrowRight, Loader2, Sparkles, Building2, User, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
    return (
        <React.Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
            </div>
        }>
            <LoginContent />
        </React.Suspense>
    )
}

function LoginContent() {
    const [activeTab, setActiveTab] = useState<"standard" | "b2b">("standard")
    const [isLogin, setIsLogin] = useState(true)
    const { toast } = useToast()
    const searchParams = useSearchParams()

    // Auto-select B2B tab if redirected from partner-register
    useEffect(() => {
        if (searchParams.get("tab") === "b2b") {
            setActiveTab("b2b")
        }

        // Handle NextAuth URL errors
        const error = searchParams.get("error")
        if (error) {
            let errorMessage = "An unexpected error occurred during login."
            if (error === "CredentialsSignin") {
                errorMessage = "Invalid credentials provided."
            } else if (error === "OAuthAccountNotLinked") {
                errorMessage = "Email already in use with a different login method."
            } else if (error === "AccessDenied") {
                errorMessage = "Access denied. You do not have permission to log in."
            } else if (error === "OAuthSignin" || error === "OAuthCallback") {
                errorMessage = "Failed to communicate with Google authentication."
            } else if (error === "Configuration") {
                errorMessage = "Server authentication configuration error."
            }

            // Using setTimeout to ensure toast fires correctly post-render mounting
            setTimeout(() => {
                toast({
                    title: "Authentication Error",
                    description: errorMessage,
                    variant: "destructive",
                })
            }, 100)
        }
    }, [searchParams, toast])

    // Standard (User/Admin) State
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // B2B State
    const [b2bUserId, setB2BUserId] = useState("")
    const [b2bPassword, setB2BPassword] = useState("")
    const [showB2BPassword, setShowB2BPassword] = useState(false)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (!isLogin) {
                // Registration Flow
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password }),
                })

                if (!res.ok) {
                    const data = await res.json()
                    toast({
                        title: "Registration Failed",
                        description: data.message || "Something went wrong. Please try again.",
                        variant: "destructive"
                    })
                    setIsLoading(false)
                    return
                }
                toast({
                    title: "Account Created",
                    description: "You've successfully registered. Signing you in...",
                })
            }

            // Login Flow
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setIsLoading(false)
                toast({
                    title: "Login Failed",
                    description: "Invalid credentials. Please check your email and password.",
                    variant: "destructive"
                })
            } else {
                // Successful login
                toast({
                    title: "Success",
                    description: "Welcome back!",
                })
                window.location.href = "/"
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

    const handleB2BLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await signIn("b2b-credentials", {
                userId: b2bUserId,
                password: b2bPassword,
                redirect: false,
            })

            if (result?.error) {
                setIsLoading(false)
                toast({
                    title: "B2B Login Failed",
                    description: "Invalid Partner ID or Password. Please check your credentials.",
                    variant: "destructive"
                })
            } else {
                toast({
                    title: "Welcome Partner",
                    description: "Redirecting to your marketplace...",
                })
                window.location.href = "/b2b" // Redirect to dedicated B2B marketplace
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



    const handleGoogleLogin = (callbackUrl = "/") => {
        setIsLoading(true)
        signIn("google", { callbackUrl })
    }

    return (
        <div className="h-screen flex items-stretch bg-[#0E192D] overflow-hidden font-sans pt-24 lg:pt-28">
            {/* Left Side - Image Background & Branding */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" as const }}
                className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-6"
            >
                {/* Illustration Image */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="relative w-[98%] h-[95%] bg-[#0E192D] rounded-3xl overflow-hidden flex items-center justify-center p-2"
                    >
                        <img
                            src="/login.jpeg"
                            alt="Login Visual"
                            className="w-full h-full object-contain rounded-2xl opacity-90"
                        />
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" as const }}
                className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 lg:px-20 relative bg-[#0E192D]"
            >
                <div className="w-full max-w-[380px] space-y-5">
                    {/* Header */}
                    <div className="text-center lg:text-left space-y-1.5">
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            {activeTab === "standard" ? (isLogin ? "Welcome Back" : "Create Account") : "Partner Portal"}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {activeTab === "standard"
                                ? (isLogin ? "Please enter your details to sign in." : "Join us to get the best value for your scrap.")
                                : "Access for registered corporate partners."}
                        </p>
                    </div>

                    {/* Custom Tabs */}
                    <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
                        <button
                            onClick={() => setActiveTab("standard")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === "standard"
                                ? "bg-slate-800 text-white shadow-sm ring-1 ring-white/10"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <User className="w-4 h-4" />
                            User
                        </button>
                        <button
                            onClick={() => setActiveTab("b2b")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === "b2b"
                                ? "bg-slate-800 text-emerald-400 shadow-sm ring-1 ring-white/10"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <Building2 className="w-4 h-4" />
                            B2B Partner
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "standard" ? (
                            <motion.div
                                key={isLogin ? "login" : "register"}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                {/* Standard Auth Form */}
                                <form onSubmit={handleAuth} className="space-y-4">
                                    {!isLogin && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-300 ml-1">Full Name</label>
                                            <div className="relative group transition-all">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <User className="h-5 w-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="John Doe"
                                                    className="block w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-gray-500 focus:bg-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-300 ml-1">Email Address</label>
                                        <div className="relative group transition-all">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="name@example.com"
                                                className="block w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-gray-500 focus:bg-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-xs font-semibold text-gray-300">Password</label>
                                        </div>
                                        <div className="relative group transition-all">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Lock className="h-4 w-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="block w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-gray-500 focus:bg-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-emerald-500 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-xl shadow-emerald-900/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm mt-2"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                {isLogin ? "Sign In" : "Create Account"}
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                {isLogin && (
                                    <>
                                        <div className="relative py-1">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-slate-800"></div>
                                            </div>
                                            <div className="relative flex justify-center text-xs">
                                                <span className="px-4 bg-[#0E192D] text-gray-500 font-medium">Or</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleGoogleLogin("/")}
                                            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 group mt-1"
                                        >
                                            <img
                                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                                alt="Google"
                                                className="w-4 h-4 group-hover:scale-110 transition-transform"
                                            />
                                            <span className="text-sm">Continue with Google</span>
                                        </button>
                                    </>
                                )}



                                <p className="text-center text-xs text-gray-500 mt-4">
                                    {isLogin ? "New to ScrapCenter?" : "Already have an account?"}
                                    <button
                                        onClick={() => setIsLogin(!isLogin)}
                                        className="font-bold text-white hover:text-emerald-400 ml-1 transition-colors"
                                    >
                                        {isLogin ? "Create an account" : "Sign in"}
                                    </button>
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="b2b"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-5"
                            >
                                <form onSubmit={handleB2BLogin} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-300 ml-1">User ID</label>
                                        <div className="relative group transition-all">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                value={b2bUserId}
                                                onChange={(e) => setB2BUserId(e.target.value)}
                                                placeholder="Enter Partner ID"
                                                className="block w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-gray-500 focus:bg-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-300 ml-1">Password</label>
                                        <div className="relative group transition-all">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Lock className="h-4 w-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                            </div>
                                            <input
                                                type={showB2BPassword ? "text" : "password"}
                                                required
                                                value={b2bPassword}
                                                onChange={(e) => setB2BPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="block w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-gray-500 focus:bg-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowB2BPassword(!showB2BPassword)}
                                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-blue-500 transition-colors"
                                            >
                                                {showB2BPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-xl shadow-blue-600/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm mt-2"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Partner Sign In
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="relative py-1 border-t-0">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-800"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-4 bg-[#0E192D] text-gray-500 font-medium">New Partner?</span>
                                    </div>
                                </div>

                                <Link href="/partner-register" className="block mt-1">
                                    <button
                                        type="button"
                                        className="w-full bg-slate-900 border-2 border-blue-600 text-blue-500 font-bold py-3 rounded-xl hover:bg-blue-900/20 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Building2 className="w-4 h-4" />
                                        Be Our Partner
                                    </button>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}

