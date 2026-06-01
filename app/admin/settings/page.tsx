"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Settings, Save, AlertCircle, RefreshCw, MapPin, IndianRupee, ShieldCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Plus_Jakarta_Sans } from "next/font/google"

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
})

export default function AdminSettingsPage() {
    const { toast } = useToast()
    const [scrapPrice, setScrapPrice] = useState<string>("")
    const [scrapDiscount, setScrapDiscount] = useState<string>("")
    const [pickupCharge, setPickupCharge] = useState<string>("")
    const [pickupDiscount, setPickupDiscount] = useState<string>("")
    const [rvsfLeadPrice, setRvsfLeadPrice] = useState<string>("")
    const [rvsfLeadDiscount, setRvsfLeadDiscount] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const applyScrapDiscount = () => {
        const price = parseFloat(scrapPrice);
        const discount = parseFloat(scrapDiscount);
        if (!isNaN(price) && !isNaN(discount)) {
            const newPrice = price - (price * (discount / 100));
            setScrapPrice(newPrice.toFixed(2).toString());
            setScrapDiscount("");
        }
    }

    const applyPickupDiscount = () => {
        const charge = parseFloat(pickupCharge);
        const discount = parseFloat(pickupDiscount);
        if (!isNaN(charge) && !isNaN(discount)) {
            const newCharge = charge - (charge * (discount / 100));
            setPickupCharge(newCharge.toFixed(2).toString());
            setPickupDiscount("");
        }
    }

    const applyRvsfLeadDiscount = () => {
        const price = parseFloat(rvsfLeadPrice);
        const discount = parseFloat(rvsfLeadDiscount);
        if (!isNaN(price) && !isNaN(discount)) {
            const newPrice = price - (price * (discount / 100));
            setRvsfLeadPrice(newPrice.toFixed(0).toString());
            setRvsfLeadDiscount("");
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/settings/scrapRates")
            if (res.ok) {
                const data = await res.json()
                setScrapPrice(data.scrapPricePerKg?.toString() || "")
                setPickupCharge(data.pickupChargePerKm?.toString() || "")
                setRvsfLeadPrice(data.rvsfLeadPrice?.toString() || "499")
            }
        } catch (error) {
            console.error("Failed to fetch settings", error)
            toast({
                title: "Error",
                description: "Failed to load current settings.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        const price = parseFloat(scrapPrice)
        const pickup = parseFloat(pickupCharge)
        const rvsfPrice = parseFloat(rvsfLeadPrice)
        
        if (isNaN(price) || price <= 0 || isNaN(pickup) || pickup < 0 || isNaN(rvsfPrice) || rvsfPrice <= 0) {
            toast({
                title: "Invalid Input",
                description: "Please enter valid positive numbers for all fields.",
                variant: "destructive"
            })
            return
        }

        setIsSaving(true)
        try {
            const res = await fetch("/api/settings/scrapRates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    scrapPricePerKg: price, 
                    pickupChargePerKm: pickup,
                    rvsfLeadPrice: rvsfPrice
                })
            })

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Global settings updated successfully.",
                })
            } else {
                throw new Error("Failed to update")
            }
        } catch (error) {
            console.error("Failed to save settings", error)
            toast({
                title: "Error",
                description: "Failed to save the new configuration.",
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className={`min-h-screen bg-[#F8FAFC] dark:bg-[#070e1a] text-slate-800 dark:text-white p-4 md:p-6 selection:bg-[#E31E24]/20 ${plusJakartaSans.className}`}>
            <div className="max-w-4xl mx-auto space-y-5">

                {/* Compact Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0E192D] border border-slate-100 dark:border-slate-800 p-5 shadow-sm"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center border border-red-100 dark:border-red-900/30">
                                <Settings className="w-5 h-5 text-[#E31E24]" />
                            </div>
                            <div>
                                <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    Global Settings
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage platform-wide pricing &amp; configurations</p>
                            </div>
                        </div>

                        <div className="flex bg-slate-50 dark:bg-slate-900/40 rounded-lg px-3 py-1.5 border border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-450 dark:text-slate-450 uppercase tracking-widest self-start sm:self-center">
                            Admin Override
                        </div>
                    </div>
                </motion.div>

                {/* Main Pricing Configurations Form */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.3 }}
                >
                    <div className="bg-white dark:bg-[#0E192D] border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm relative">
                        {/* Section Header */}
                        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-900/30">
                            <IndianRupee className="w-4.5 h-4.5 text-[#E31E24]" />
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Pricing Configuration</h2>
                        </div>

                        {/* Form Area */}
                        <div className="p-5 md:p-6">
                            {isLoading ? (
                                <div className="space-y-6 animate-pulse">
                                    <div className="space-y-2">
                                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/5"></div>
                                        <div className="h-10 bg-slate-50 dark:bg-slate-800/50 rounded-lg w-full"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/5"></div>
                                        <div className="h-10 bg-slate-50 dark:bg-slate-800/50 rounded-lg w-full"></div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSave} className="space-y-7">

                                    {/* 1. Base Scrap Rate */}
                                    <div className="grid md:grid-cols-[1.2fr_2fr] gap-4 md:gap-8 items-start">
                                        <div className="space-y-0.5">
                                            <h3 className="text-sm font-bold text-slate-850 dark:text-white">Base Scrap Rate</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-medium">
                                                Determines the per-KG payout for users obtaining a free scrap quote on the platform.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <div className="relative flex-1 group">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span className="text-slate-400 dark:text-slate-500 font-bold group-focus-within:text-[#E31E24] transition-colors text-sm">₹</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        required
                                                        value={scrapPrice}
                                                        onChange={(e) => setScrapPrice(e.target.value)}
                                                        className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#E31E24] dark:focus:border-[#E31E24] rounded-xl outline-none text-slate-900 dark:text-white font-mono text-sm transition-all focus:ring-4 focus:ring-red-500/5 hover:border-slate-350 dark:hover:border-slate-700"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 sm:w-[32%] w-full">
                                                    <input
                                                        type="number"
                                                        placeholder="% Off"
                                                        value={scrapDiscount}
                                                        onChange={(e) => setScrapDiscount(e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#E31E24] dark:focus:border-[#E31E24] rounded-xl outline-none text-slate-900 dark:text-white font-mono text-xs transition-all focus:ring-4 focus:ring-red-500/5 hover:border-slate-350 dark:hover:border-slate-700"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={applyScrapDiscount}
                                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all shadow-sm whitespace-nowrap border border-slate-200/40 dark:border-slate-800"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
                                                <AlertCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                                <p>Example: If weight is 1.5 Tons (1500kg) and rate is ₹{scrapPrice || "0"}, quote = ₹{(!isNaN(parseFloat(scrapPrice)) ? (1500 * parseFloat(scrapPrice)).toLocaleString() : "0")}.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100 dark:bg-slate-850/60 w-full"></div>

                                    {/* 2. Distance Surcharge */}
                                    <div className="grid md:grid-cols-[1.2fr_2fr] gap-4 md:gap-8 items-start">
                                        <div className="space-y-0.5">
                                            <h3 className="text-sm font-bold text-slate-850 dark:text-white">Distance Surcharge</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-medium">
                                                Calculated fee per kilometer for collection distances exceeding the 100km free limit.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <div className="relative flex-1 group">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span className="text-slate-400 dark:text-slate-500 font-bold group-focus-within:text-[#E31E24] transition-colors text-sm">₹</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        required
                                                        value={pickupCharge}
                                                        onChange={(e) => setPickupCharge(e.target.value)}
                                                        className="w-full pl-7 pr-16 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#E31E24] dark:focus:border-[#E31E24] rounded-xl outline-none text-slate-900 dark:text-white font-mono text-sm transition-all focus:ring-4 focus:ring-red-500/5 hover:border-slate-350 dark:hover:border-slate-700"
                                                        placeholder="0.00"
                                                    />
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold bg-slate-100/60 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200/20">/ KM</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 sm:w-[32%] w-full">
                                                    <input
                                                        type="number"
                                                        placeholder="% Off"
                                                        value={pickupDiscount}
                                                        onChange={(e) => setPickupDiscount(e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#E31E24] dark:focus:border-[#E31E24] rounded-xl outline-none text-slate-900 dark:text-white font-mono text-xs transition-all focus:ring-4 focus:ring-red-500/5 hover:border-slate-350 dark:hover:border-slate-700"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={applyPickupDiscount}
                                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all shadow-sm whitespace-nowrap border border-slate-200/40 dark:border-slate-800"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
                                                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                                <p>Applies automatically to all incoming requests evaluated by the Google Distance Matrix.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100 dark:bg-slate-855/60 w-full"></div>

                                    {/* 3. RVSF Lead Price */}
                                    <div className="grid md:grid-cols-[1.2fr_2fr] gap-4 md:gap-8 items-start">
                                        <div className="space-y-0.5">
                                            <h3 className="text-sm font-bold text-slate-850 dark:text-white">RVSF Price Per Lead</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-medium">
                                                Determines the flat charge applied per lead when an RVSF partner registers and purchases state-level leads.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <div className="relative group flex-1">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span className="text-slate-400 dark:text-slate-500 font-bold group-focus-within:text-[#E31E24] transition-colors text-sm">₹</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        step="1"
                                                        min="1"
                                                        required
                                                        value={rvsfLeadPrice}
                                                        onChange={(e) => setRvsfLeadPrice(e.target.value)}
                                                        className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#E31E24] dark:focus:border-[#E31E24] rounded-xl outline-none text-slate-900 dark:text-white font-mono text-sm transition-all focus:ring-4 focus:ring-red-500/5 hover:border-slate-350 dark:hover:border-slate-700"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 sm:w-[32%] w-full">
                                                    <input
                                                        type="number"
                                                        placeholder="% Off"
                                                        value={rvsfLeadDiscount}
                                                        onChange={(e) => setRvsfLeadDiscount(e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#E31E24] dark:focus:border-[#E31E24] rounded-xl outline-none text-slate-900 dark:text-white font-mono text-xs transition-all focus:ring-4 focus:ring-red-500/5 hover:border-slate-350 dark:hover:border-slate-700"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={applyRvsfLeadDiscount}
                                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all shadow-sm whitespace-nowrap border border-slate-200/40 dark:border-slate-800"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
                                                <AlertCircle className="w-3.5 h-3.5 text-[#E31E24] shrink-0 mt-0.5" />
                                                <p>Example: If a state contains 10 leads, the unlock license will cost: 10 × ₹{rvsfLeadPrice || "0"} = ₹{(!isNaN(parseFloat(rvsfLeadPrice)) ? (10 * parseFloat(rvsfLeadPrice)).toLocaleString() : "0")}.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Compact Save Button */}
                                    <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="w-full sm:w-auto px-8 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-purple-500/10 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                    <span>Applying Changes...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    <span>Save Globally</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Footer Note */}
                <div className="text-center pb-4 flex items-center justify-center gap-1.5 text-slate-400 dark:text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                        Automated Valuation Engine • AutoScrap Admin
                    </p>
                </div>

            </div>
        </div>
    )
}
