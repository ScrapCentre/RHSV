"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCcw, Home } from "lucide-react"
import Link from "next/link"

export default function ExecutiveError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Executive Portal Error:", error)
    }, [error])

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-zinc-900 border border-red-500/20 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
                <div className="inline-flex p-4 bg-red-500/10 rounded-full">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-xl font-black text-white uppercase tracking-widest">Terminal Exception</h1>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        The executive terminal encountered a critical error while processing data. This may be due to a connection timeout or unauthorized interception.
                    </p>
                </div>

                {error.digest && (
                    <div className="py-2 px-4 bg-black rounded-lg border border-white/5">
                        <p className="text-[10px] font-mono text-gray-500 truncate">ID: {error.digest}</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => reset()}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Reboot
                    </button>
                    <Link
                        href="/executive"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-700 transition-all"
                    >
                        <Home className="w-4 h-4" />
                        Portal
                    </Link>
                </div>
            </div>
        </div>
    )
}
