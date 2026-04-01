"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Settings, Save, AlertCircle, RefreshCw, MapPin, IndianRupee } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AdminSettingsPage() {
    const { toast } = useToast()
    const [scrapPrice, setScrapPrice] = useState<string>("")
    const [scrapDiscount, setScrapDiscount] = useState<string>("")
    const [pickupCharge, setPickupCharge] = useState<string>("")
    const [pickupDiscount, setPickupDiscount] = useState<string>("")
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
        if (isNaN(price) || price <= 0 || isNaN(pickup) || pickup < 0) {
            toast({
                title: "Invalid Input",
                description: "Please enter valid numbers for both fields.",
                variant: "destructive"
            })
            return
        }

        setIsSaving(true)
        try {
            const res = await fetch("/api/settings/scrapRates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scrapPricePerKg: price, pickupChargePerKm: pickup })
            })

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Global settings updated successfully.",
                    className: "bg-emerald-950/50 border-emerald-500/20 text-emerald-400"
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
        <div className="min-h-screen bg-gray-50 dark:bg-[#0E192D] text-gray-900 dark:text-white p-4 md:p-8 selection:bg-red-500/30">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 shadow-2xl"
                >
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-900/40 flex items-center justify-center border border-red-500/30 shadow-lg shadow-red-500/10">
                                <Settings className="w-8 h-8 text-red-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-1">
                                    Global Settings
                                </h1>
                                <p className="text-gray-500 dark:text-slate-400 font-medium">Manage platform-wide pricing &amp; configurations</p>
                            </div>
                        </div>

                        <div className="flex bg-gray-100 dark:bg-slate-800/50 rounded-xl p-1 border border-gray-200 dark:border-slate-700/50">
                            <span className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Admin Override</span>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

                        {/* Section Header */}
                        <div className="px-8 py-6 border-b border-gray-200 dark:border-slate-800 flex items-center gap-3 bg-gray-50 dark:bg-slate-950/50">
                            <IndianRupee className="w-5 h-5 text-red-500" />
                            <h2 className="text-xl font-bold font-mono text-gray-900 dark:text-white">Pricing Configuration</h2>
                        </div>

                        {/* Form Area */}
                        <div className="p-8">
                            {isLoading ? (
                                <div className="space-y-8 animate-pulse">
                                    <div className="space-y-3">
                                        <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded w-1/4"></div>
                                        <div className="h-14 bg-gray-100 dark:bg-slate-800/50 rounded-xl w-full max-w-lg"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-slate-800/30 rounded w-2/3"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded w-1/4"></div>
                                        <div className="h-14 bg-gray-100 dark:bg-slate-800/50 rounded-xl w-full max-w-lg"></div>
                                        <div className="h-4 bg-gray-100 dark:bg-slate-800/30 rounded w-2/3"></div>
                                    </div>
                                    <div className="h-14 bg-gray-200 dark:bg-slate-800 rounded-xl w-40 mt-8"></div>
                                </div>
                            ) : (
                                <form onSubmit={handleSave} className="space-y-10">

                                    {/* Scrap Price Row */}
                                    <div className="grid md:grid-cols-[1fr_2fr] gap-6 md:gap-12 items-start max-w-5xl">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Base Scrap Rate</h3>
                                            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
                                                Determines the per-KG payout for users obtaining a free scrap quote on the platform.
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <div className="relative group flex-1">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <span className="text-gray-400 dark:text-slate-500 font-bold group-focus-within:text-red-500 transition-colors">₹</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        required
                                                        value={scrapPrice}
                                                        onChange={(e) => setScrapPrice(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-800 focus:border-red-500 rounded-xl outline-none text-gray-900 dark:text-white font-mono text-lg transition-all focus:ring-4 focus:ring-red-500/10 placeholder-gray-400 dark:placeholder-slate-700 hover:border-gray-400 dark:hover:border-slate-700"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 sm:w-[35%] w-full">
                                                    <input
                                                        type="number"
                                                        placeholder="% Off"
                                                        value={scrapDiscount}
                                                        onChange={(e) => setScrapDiscount(e.target.value)}
                                                        className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-800 focus:border-red-500 rounded-xl outline-none text-gray-900 dark:text-white font-mono text-sm transition-all focus:ring-4 focus:ring-red-500/10 placeholder-gray-400 dark:placeholder-slate-700 hover:border-gray-400 dark:hover:border-slate-700"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={applyScrapDiscount}
                                                        className="px-4 py-4 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all shadow-sm whitespace-nowrap"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 text-xs font-semibold text-gray-500 dark:text-slate-500 bg-gray-50 dark:bg-slate-950/50 p-3 rounded-lg border border-gray-200 dark:border-slate-800">
                                                <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                                <p>Example: If weight is 1.5 Tons (1500kg) and rate is ₹25, quote = ₹37,500.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-200 dark:bg-slate-800 w-full"></div>

                                    {/* Pickup Charge Row */}
                                    <div className="grid md:grid-cols-[1fr_2fr] gap-6 md:gap-12 items-start max-w-5xl">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 ml-1">Distance Surcharge</h3>
                                            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
                                                The calculated fee applied <span className="text-red-400 font-bold">per kilometer</span> for any collection distance exceeding the 100km free limit.
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <div className="relative group flex-1">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <span className="text-gray-400 dark:text-slate-500 font-bold group-focus-within:text-red-500 transition-colors">₹</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        required
                                                        value={pickupCharge}
                                                        onChange={(e) => setPickupCharge(e.target.value)}
                                                        className="w-full pl-10 pr-16 py-4 bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-800 focus:border-red-500 rounded-xl outline-none text-gray-900 dark:text-white font-mono text-lg transition-all focus:ring-4 focus:ring-red-500/10 placeholder-gray-400 dark:placeholder-slate-700 hover:border-gray-400 dark:hover:border-slate-700"
                                                        placeholder="0.00"
                                                    />
                                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                        <span className="text-gray-400 dark:text-slate-600 font-bold text-sm bg-gray-100 dark:bg-slate-900 px-2 py-1 rounded">/ KM</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 sm:w-[35%] w-full">
                                                    <input
                                                        type="number"
                                                        placeholder="% Off"
                                                        value={pickupDiscount}
                                                        onChange={(e) => setPickupDiscount(e.target.value)}
                                                        className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-800 focus:border-red-500 rounded-xl outline-none text-gray-900 dark:text-white font-mono text-sm transition-all focus:ring-4 focus:ring-red-500/10 placeholder-gray-400 dark:placeholder-slate-700 hover:border-gray-400 dark:hover:border-slate-700"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={applyPickupDiscount}
                                                        className="px-4 py-4 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all shadow-sm whitespace-nowrap"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 text-xs font-semibold text-gray-500 dark:text-slate-500 bg-gray-50 dark:bg-slate-950/50 p-3 rounded-lg border border-gray-200 dark:border-slate-800">
                                                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                                                <p>Applies automatically to all incoming requests evaluated by the Google Distance Matrix.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save Actions */}
                                    <div className="pt-8 border-t border-gray-200 dark:border-slate-800 flex items-center justify-end">
                                        <motion.button
                                            type="submit"
                                            disabled={isSaving}
                                            whileHover={{ scale: isSaving ? 1 : 1.02 }}
                                            whileTap={{ scale: isSaving ? 1 : 0.98 }}
                                            className="relative overflow-hidden flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 group"
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                                            {isSaving ? (
                                                <>
                                                    <RefreshCw className="w-5 h-5 animate-spin relative z-10" />
                                                    <span className="relative z-10 text-lg tracking-wide">Applying Changes...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-5 h-5 relative z-10" />
                                                    <span className="relative z-10 text-lg tracking-wide">Save Globally</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Footer Note */}
                <div className="text-center pb-8">
                    <p className="text-xs font-bold text-gray-400 dark:text-slate-600 uppercase tracking-widest">
                        Automated Valuation Engine • AutoScrap Admin
                    </p>
                </div>

            </div>
        </div>
    )
}
