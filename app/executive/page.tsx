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
            className="min-h-screen flex items-end lg:items-end justify-center lg:justify-end pb-10 lg:pb-28 xl:pb-36 p-4 lg:pr-32 xl:pr-44 font-sans selection:bg-[#E31E24] selection:text-white transition-all duration-500"
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
                className="w-full max-w-[440px] relative"
            >
                {/* Login Card */}
                <div className="relative group">
                    {/* Card Border Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-[#E31E24]/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000" />
                    
                    <div className="relative bg-white/95 backdrop-blur-md border border-slate-100 p-10 rounded-2xl shadow-2xl">
                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="bg-red-50 border border-red-200 text-red-600 text-xs py-3 px-4 rounded-xl font-medium text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Identity</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="email" 
                                        required
                                        placeholder="Executive Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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
