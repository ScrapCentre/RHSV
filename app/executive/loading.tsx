"use client"

import { Shield, Loader2 } from "lucide-react"

export default function ExecutiveLoading() {
    return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center space-y-6">
            <div className="relative">
                <Shield className="w-16 h-16 text-blue-500/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            </div>
            
            <div className="text-center space-y-2">
                <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] animate-pulse">Initializing Terminal</h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Establishing Secure Uplink & decrypting market feeds...</p>
            </div>

            <div className="max-w-[200px] w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-[loading_1.5s_ease-in-out_infinite]" />
            </div>

            <style jsx>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    )
}
