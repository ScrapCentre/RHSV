"use client"

/**
 * GrowWithUs — ScrapCentre.com
 * RESTYLED per design-system §6: changed green to brand-red, updated copy to
 * "Partner RVSF" framing. Kept structural layout. Removed variant prop default
 * (now always brand-red). variant prop kept for backward compat.
 */

import { useSession } from "next-auth/react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Lock } from "lucide-react"

type GrowWithUsProps = {
    variant?: "red" | "green" // kept for compat; always renders brand-red now
}

export default function GrowWithUs({ variant: _variant = "red" }: GrowWithUsProps) {
    const { data: session } = useSession()

    return (
        <section className="py-6 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                <div className="bg-[var(--brand-gray-900)] rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[200px]">

                    {/* Left accent bar — brand-red */}
                    <div className="w-full lg:w-2 bg-[var(--brand-red)] lg:h-auto min-h-[4px]" aria-hidden="true" />

                    {/* Content */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="text-[var(--brand-red)] font-bold uppercase tracking-wider text-sm mb-3 block">
                                Partner RVSF Programme
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                                Grow With{" "}
                                <span className="text-[var(--brand-red)]">ScrapCentre.com</span>
                            </h2>
                            <p className="text-slate-400 font-medium mb-8 text-lg max-w-xl">
                                Join our network of verified RVSF partners. Get quality leads routed to your
                                facility — screened, verified, and ready for pickup.
                            </p>

                            <div className="w-full sm:w-auto">
                                {session ? (
                                    <Link
                                        href="/partner-register"
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)] text-white rounded-full font-bold text-lg shadow-lg transition-colors duration-200"
                                    >
                                        <span>
                                            {(session.user as any)?.role === "partner"
                                                ? "View Partner Dashboard"
                                                : "Apply as RVSF Partner"}
                                        </span>
                                        <ArrowRight className="w-5 h-5" aria-hidden="true" />
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-slate-800 text-slate-500 rounded-full font-bold shadow-inner cursor-not-allowed hover:bg-slate-700 transition-colors"
                                    >
                                        <Lock className="w-5 h-5" aria-hidden="true" />
                                        <span>Login to Apply</span>
                                    </Link>
                                )}
                            </div>

                            {!session && (
                                <p className="text-xs text-slate-600 mt-4 font-medium pl-2">
                                    Please sign in to access partner registration.
                                </p>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}

