"use client"

import { useState } from "react"
import { CheckCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function ScrapCentreActionBtn({ pickupId, currentStatus }: { pickupId: string, currentStatus: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    if (currentStatus !== 'picked_up') return null

    const handleCarScrapped = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/scrapcentre/pickups/${pickupId}/status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "car_scrapped" }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to update status")
            
            toast({ title: "Success", description: "Car has been marked as scrapped successfully" })
            router.refresh()
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleCarScrapped}
            disabled={isLoading}
            className={`
                group relative overflow-hidden inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-300 w-full sm:w-auto
                ${isLoading 
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700' 
                    : 'bg-gradient-to-r from-red-500/10 to-orange-500/10 hover:from-red-500 hover:to-orange-600 text-red-400 hover:text-white border border-red-500/30 hover:border-transparent hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95'
                }
            `}
        >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center gap-2">
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                {isLoading ? 'Processing...' : 'Mark as Scrapped'}
            </span>
        </button>
    )
}
