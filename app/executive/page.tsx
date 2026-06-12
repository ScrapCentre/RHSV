"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
    Lock, 
    ArrowRight, 
    Mail, 
    Eye, 
    EyeOff,
    Loader2
} from "lucide-react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ExecutiveLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "authenticated" && (session?.user as any)?.role === "executive") {
            router.push("/executive/dashboard")
        }
    }, [session, status, router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await signIn("executive-credentials", {
                email,
                password,
                redirect: false
            })

            if (res?.error) {
                let errorMsg = "Authentication failed. Invalid credentials."
                if (res.error.includes("DATABASE_CONNECTION_ERROR")) {
                    errorMsg = "Database connection failed. Please ensure your IP is whitelisted in MongoDB Atlas."
                }
                setError(errorMsg)
            } else {
                router.push("/executive/dashboard")
            }
        } catch (err) {
            setError("A system error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div 
            className="min-h-screen flex items-center justify-center lg:items-center lg:justify-end p-4 sm:p-6 lg:pr-20 xl:pr-32 2xl:pr-44 selection:bg-[#E31E24] selection:text-white transition-all duration-500 font-sans"
            style={{ 
                backgroundImage: "url('/executivelogin.png')", 
                backgroundSize: '100% 100%', 
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat' 
            }}
        >
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[400px] relative z-10"
            >
                {/* Login Card */}
                <div className="relative group">
                    {/* Card Border Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-[#E31E24]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700" />
                    
                    <div className="relative bg-white/95 backdrop-blur-md border border-slate-100 p-6 sm:p-8 rounded-2xl shadow-2xl">
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="bg-red-50 border border-red-200 text-red-600 text-xs py-2.5 px-4 rounded-xl font-medium text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Identity</label>
                                <div className="relative mt-1.5">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="email" 
                                        required
                                        placeholder="Executive Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-[#E31E24]/60 focus:bg-white rounded-xl px-11 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Security Key</label>
                                <div className="relative mt-1.5">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        required
                                        placeholder="••••••••"
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

                            <button 
                                disabled={isLoading}
                                type="submit"
                                className="w-full py-3.5 bg-[#E31E24] hover:bg-[#c9181d] active:scale-[0.98] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group/btn shadow-lg shadow-red-600/10 text-sm mt-6"
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
