"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function RVSFLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const result = await signIn("rvsf-credentials", {
                rvsfId: email,
                password,
                redirect: false,
            })
            if (result?.error) {
                setError("Invalid email or password. Please try again.")
            } else {
                router.push("/rvsf/dashboard")
            }
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E31E24]/10 border border-[#E31E24]/30 mb-4">
                        <span className="text-2xl font-black text-[#E31E24]">R</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">RVSF Portal</h1>
                    <p className="text-slate-400 mt-2 text-sm">Sign in to manage your scrapping facility</p>
                </div>

                <div className="bg-[#0E192D] border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                Email / RVSF ID
                            </label>
                            <input
                                type="text"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="email@yourfacility.com or RVSF12345"
                                required
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all text-sm pr-12"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                {error}
                            </motion.div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-[#E31E24] hover:bg-[#c1191e] text-white font-bold rounded-xl transition-all disabled:opacity-60 text-sm mt-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
                            ← Back to ScrapCentre
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
