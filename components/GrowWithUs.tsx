"use client"

import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Lock } from "lucide-react"

type GrowWithUsProps = {
    variant?: "red" | "green"
}

export default function GrowWithUs({ variant = "green" }: GrowWithUsProps) {
    const { data: session } = useSession()

    const styles = {
        red: {
            // ... (keeping red for backward compatibility if needed, but we focus on green)
            border: "border-red-50",
            hoverBg: "hover:bg-red-600",
            accentText: "text-red-600",
            hoverAccent: "group-hover:text-red-100",
            heading: "text-gray-900",
            headingHover: "group-hover:text-white",
            spanText: "text-red-600",
            desc: "text-gray-600",
            descHover: "group-hover:text-red-50",
            btnBg: "bg-red-600",
            btnShadow: "shadow-red-600/30",
            btnHover: "hover:bg-red-700",
            btnHoverShadow: "hover:shadow-red-600/40",
            btnGroupHoverBg: "group-hover:bg-white",
            btnGroupHoverText: "group-hover:text-red-600",
            btnGroupHoverShadow: "group-hover:shadow-white/20",
            lockedText: "text-red-500",
            lockedHover: "group-hover:text-red-200"
        },
        green: {
            border: "border-slate-800",
            hoverBg: "hover:bg-slate-800",
            accentText: "text-emerald-400",
            hoverAccent: "group-hover:text-emerald-300",
            heading: "text-white",
            headingHover: "group-hover:text-white",
            spanText: "text-emerald-400",
            desc: "text-slate-400",
            descHover: "group-hover:text-slate-300",
            btnBg: "bg-emerald-600",
            btnShadow: "shadow-emerald-900/40",
            btnHover: "hover:bg-emerald-500",
            btnHoverShadow: "hover:shadow-emerald-900/50",
            btnGroupHoverBg: "group-hover:bg-white",
            btnGroupHoverText: "group-hover:text-emerald-700",
            btnGroupHoverShadow: "group-hover:shadow-white/20",
            lockedText: "text-slate-500",
            lockedHover: "group-hover:text-slate-400"
        }
    }

    const s = styles[variant]

    return (
        <section className="py-6 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className={`bg-[#0E192D] rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/20 flex flex-col lg:flex-row min-h-[200px] border ${s.border}`}>

                    {/* Left Side: Image (30%) */}
                    <div className="relative w-full lg:w-[30%] h-[160px] lg:h-auto min-h-[160px]">
                        <Image
                            src="/frontpage/b2b2.png"
                            alt="Grow With Us"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0E192D]/90 lg:to-[#0E192D]/20" />
                    </div>

                    {/* Right Side: Content (70%) */}
                    <div className={`w-full lg:w-[70%] p-6 md:p-8 flex flex-col justify-center bg-[#0E192D] relative group transition-colors duration-500 ease-in-out`}>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className={`${s.accentText} font-bold uppercase tracking-wider text-sm mb-3 block ${s.hoverAccent} transition-colors`}>
                                Be Our Partner
                            </span>
                            <h2 className={`text-3xl md:text-5xl font-black ${s.heading} mb-6 leading-tight ${s.headingHover} transition-colors`}>
                                Grow <span className={`${s.spanText} ${s.headingHover} transition-colors`}>With Us</span>
                            </h2>
                            <p className={`${s.desc} font-medium mb-8 text-lg ${s.descHover} transition-colors max-w-xl`}>
                                Join our network of verified partners and expand your business with ScrapCenter India.
                            </p>

                            <div className="w-full sm:w-auto">
                                {session ? (
                                    <Link
                                        href="/partner-register"
                                        className={`inline-flex items-center gap-3 px-8 py-4 ${s.btnBg} text-white rounded-full font-bold text-lg shadow-lg ${s.btnShadow} ${s.btnHover} ${s.btnHoverShadow} ${s.btnGroupHoverBg} ${s.btnGroupHoverText} ${s.btnGroupHoverShadow} transition-all duration-300`}
                                    >
                                        <span>{(session.user as any)?.role === 'partner' ? "View Credentials" : "Apply For Partner"}</span>
                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-slate-800 text-slate-500 rounded-full font-bold shadow-inner cursor-not-allowed hover:bg-slate-700 transition-all duration-300"
                                    >
                                        <Lock className="w-5 h-5" />
                                        <span>Login to Apply</span>
                                    </Link>
                                )}
                            </div>

                            {!session && (
                                <p className={`text-xs ${s.lockedText} mt-4 font-medium ${s.lockedHover} transition-colors pl-2`}>
                                    * Please login to access partner registration
                                </p>
                            )}
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    )
}

