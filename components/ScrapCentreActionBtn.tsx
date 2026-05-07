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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all ml-2"
        >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
            Car Scrapped
        </button>
    )
}
