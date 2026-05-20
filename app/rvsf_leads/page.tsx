"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Factory, 
    MapPin, 
    Lock, 
    Search, 
    CreditCard, 
    CheckCircle, 
    Key, 
    Copy, 
    Check, 
    TrendingUp, 
    ShieldAlert,
    Building2,
    Calendar,
    ArrowRight,
    Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RVSFPortalPage() {
    const { toast } = useToast()
    
    // States
    const [statesList, setStatesList] = useState<string[]>([])
    const [selectedState, setSelectedState] = useState<string>("")
    const [stateCounts, setStateCounts] = useState<Record<string, number>>({})
    const [leads, setLeads] = useState<any[]>([])
    const [totalCount, setTotalCount] = useState<number>(0)
    const [leadPrice, setLeadPrice] = useState<number>(499)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isSearching, setIsSearching] = useState<boolean>(false)
    
    // Modals
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false)
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false)
    
    // Form inputs
    const [cardNumber, setCardNumber] = useState("")
    const [cardExpiry, setCardExpiry] = useState("")
    const [cardCvv, setCardCvv] = useState("")
    const [cardName, setCardName] = useState("")
    const [isProcessingPayment, setIsProcessingPayment] = useState(false)
    
    // Generated credentials
    const [credentials, setCredentials] = useState<any>(null)
    const [copiedId, setCopiedId] = useState(false)
    const [copiedPass, setCopiedPass] = useState(false)

    // Fetch initial counts and list of states
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true)
            try {
                const res = await fetch("/api/rvsf/public-leads")
                if (res.ok) {
                    const data = await res.json()
                    setStateCounts(data.stateCounts || {})
                    const sortedStates = Object.keys(data.stateCounts || {}).sort()
                    setStatesList(sortedStates)
                    if (typeof data.rvsfLeadPrice === "number") {
                        setLeadPrice(data.rvsfLeadPrice)
                    }
                }
            } catch (error) {
                console.error(error)
                toast({
                    title: "Connection Error",
                    description: "Failed to connect to the lead marketplace server.",
                    variant: "destructive"
                })
            } finally {
                setIsLoading(false)
            }
        }
        fetchInitialData()
    }, [toast])

    // Fetch leads when a state is selected
    const handleStateSelect = async (state: string) => {
        setSelectedState(state)
        if (!state) {
            setLeads([])
            setTotalCount(0)
            return
        }

        setIsSearching(true)
        try {
            const res = await fetch(`/api/rvsf/public-leads?state=${encodeURIComponent(state)}`)
            if (res.ok) {
                const data = await res.json()
                setLeads(data.leads || [])
                setTotalCount(data.totalCount || 0)
                if (typeof data.rvsfLeadPrice === "number") {
                    setLeadPrice(data.rvsfLeadPrice)
                }
            }
        } catch (error) {
            console.error(error)
            toast({
                title: "Search Error",
                description: "Failed to query leads for this state.",
                variant: "destructive"
            })
        } finally {
            setIsSearching(false)
        }
    }

    // Copy to clipboard helpers
    const handleCopy = (text: string, type: "id" | "pass") => {
        navigator.clipboard.writeText(text)
        if (type === "id") {
            setCopiedId(true)
            setTimeout(() => setCopiedId(false), 2000)
        } else {
            setCopiedPass(true)
            setTimeout(() => setCopiedPass(false), 2000)
        }
        toast({
            title: "Copied!",
            description: "Details copied to clipboard.",
        })
    }

    // Payment Submission
    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsProcessingPayment(true)

        try {
            const res = await fetch("/api/rvsf/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    state: selectedState,
                    cardDetails: {
                        cardNumber,
                        cardExpiry,
                        cardCvv,
                        cardName
                    }
                })
            })

            const data = await res.json()

            if (res.ok) {
                setCredentials(data.credentials)
                setIsPaymentModalOpen(false)
                setIsSuccessModalOpen(true)
                toast({
                    title: "Payment Approved",
                    description: "Account provisioned successfully!",
                })
            } else {
                toast({
                    title: "Payment Refused",
                    description: data.message || "Failed to process payment.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error(error)
            toast({
                title: "Transaction Error",
                description: "Failed to contact the payment gateway.",
                variant: "destructive"
            })
        } finally {
            setIsProcessingPayment(false)
        }
    }

    const leadCost = totalCount * leadPrice // Dynamic pricing based on global settings

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-[#E31E24] selection:text-white pb-16">
            {/* Background decorative glow */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header / Hero */}
            <header className="relative border-b border-white/5 bg-slate-950/40 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#E31E24]/10 p-3 rounded-2xl border border-[#E31E24]/20">
                            <Factory className="w-8 h-8 text-[#E31E24]" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none">RVSF Lead Portal</h1>
                            <p className="text-[10px] md:text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">Marketplace & Gated Lead Access</p>
                        </div>
                    </div>
                    
                    <Link
                        href="/rvsf"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-bold transition-all shadow-md"
                    >
                        <Key className="w-4 h-4 text-[#E31E24]" />
                        Login to Dashboard
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Panel: State Search & Market Statistics */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-xl relative overflow-hidden group">
                        <div className="absolute -top-16 -left-16 w-32 h-32 bg-[#E31E24]/10 rounded-full blur-2xl pointer-events-none" />
                        
                        <h2 className="text-lg font-black tracking-tight flex items-center gap-2 mb-4">
                            <Search className="w-5 h-5 text-[#E31E24]" />
                            Explore State Leads
                        </h2>
                        
                        <p className="text-xs text-slate-400 font-medium mb-6">
                            Enter your state below to count available RVSF scrap vehicle leads and unlock access credentials.
                        </p>

                        <div className="space-y-4">
                            <div className="relative">
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                                <select
                                    value={selectedState}
                                    onChange={(e) => handleStateSelect(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#E31E24]/50 focus:border-[#E31E24]/50 appearance-none cursor-pointer"
                                >
                                    <option value="">Select a State</option>
                                    {statesList.map(state => (
                                        <option key={state} value={state}>
                                            {state} ({stateCounts[state] || 0} leads)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedState && !isSearching && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#E31E24]/5 border border-[#E31E24]/20 p-5 rounded-2xl space-y-3"
                                >
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-bold">STATE</span>
                                        <span className="text-white font-extrabold uppercase">{selectedState}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-bold">AVAILABLE LEADS</span>
                                        <span className="text-emerald-400 font-black">{totalCount} Leads</span>
                                    </div>
                                    <div className="h-px bg-white/5 my-2"></div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-bold">LICENSE PRICE</span>
                                        <span className="text-white font-black">₹{leadCost.toLocaleString("en-IN")}</span>
                                    </div>

                                    {totalCount > 0 ? (
                                        <button
                                            onClick={() => setIsPaymentModalOpen(true)}
                                            className="w-full bg-[#E31E24] hover:bg-[#c1191e] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-950/50 mt-2 flex items-center justify-center gap-2"
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            Unlock Leads Now
                                        </button>
                                    ) : (
                                        <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-2">
                                            No leads to unlock in this state
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Stats Widget */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-xl">
                        <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            Market Summary
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                <span className="text-slate-400">Total RVSF States</span>
                                <span className="font-bold text-white">{statesList.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                <span className="text-slate-400">Total Available Leads</span>
                                <span className="font-bold text-emerald-400">
                                    {Object.values(stateCounts).reduce((a, b) => a + b, 0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Gating Security</span>
                                <span className="font-bold text-blue-400 text-xs uppercase bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                    Server Enforced
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Blurred Lead Table List */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl shadow-xl overflow-hidden backdrop-blur-md relative">
                        
                        {/* If no state is selected, prompt user */}
                        {!selectedState ? (
                            <div className="py-24 text-center text-slate-500">
                                <Factory className="w-16 h-16 mx-auto mb-4 text-slate-700 animate-pulse" />
                                <h3 className="text-lg font-black text-slate-300">No State Selected</h3>
                                <p className="text-xs max-w-sm mx-auto mt-2 font-medium">
                                    Please select a state from the dropdown menu to inspect available scrap leads.
                                </p>
                            </div>
                        ) : isSearching ? (
                            <div className="py-24 text-center text-slate-500">
                                <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-[#E31E24]" />
                                <p className="text-xs font-bold uppercase tracking-widest">Querying Scrap Database...</p>
                            </div>
                        ) : leads.length === 0 ? (
                            <div className="py-24 text-center text-slate-500">
                                <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-[#E31E24]/30" />
                                <h3 className="text-lg font-black text-slate-300">No Leads Available</h3>
                                <p className="text-xs max-w-sm mx-auto mt-2 font-medium">
                                    There are currently no scrap leads assigned to RVSF for the state of <strong className="text-white">{selectedState}</strong>.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <div className="p-6 border-b border-white/5 bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-lg font-black">
                                            Leads Preview for <span className="text-[#E31E24]">{selectedState}</span>
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Displaying {leads.length} leads. Contact details are securely encrypted and blurred.
                                        </p>
                                    </div>
                                    <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                                        {totalCount} Leads
                                    </span>
                                </div>

                                <div className="overflow-x-auto relative">
                                    
                                    {/* Hard Blurry Cover Overlay to prevent layout hacking */}
                                    <div className="absolute inset-0 z-10 backdrop-blur-[6px] bg-slate-950/30 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-auto">
                                        <div className="bg-slate-900/90 border border-white/10 p-8 rounded-3xl shadow-2xl max-w-sm mx-4 space-y-4">
                                            <div className="mx-auto w-12 h-12 bg-[#E31E24]/10 border border-[#E31E24]/20 rounded-full flex items-center justify-center">
                                                <Lock className="w-5 h-5 text-[#E31E24]" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-black">Leads Gated By License</h4>
                                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                                    You are viewing a secure preview of lead records. Purchase a license for {selectedState} to unlock unmasked access.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setIsPaymentModalOpen(true)}
                                                className="w-full bg-[#E31E24] hover:bg-[#c1191e] text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                            >
                                                Unlock State Feed
                                            </button>
                                        </div>
                                    </div>

                                    {/* Table with dummy & blurred data */}
                                    <table className="w-full text-left border-collapse select-none opacity-40">
                                        <thead>
                                            <tr className="border-b border-white/10 bg-black/10 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                                                <th className="p-4 pl-6">Req Details</th>
                                                <th className="p-4">Customer Name</th>
                                                <th className="p-4">Phone Number</th>
                                                <th className="p-4">Location</th>
                                                <th className="p-4 pr-6">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {leads.map((lead, idx) => (
                                                <tr key={lead._id || idx} className="text-xs">
                                                    <td className="p-4 pl-6 font-bold text-slate-200">
                                                        <span className="inline-block px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] uppercase tracking-wider font-extrabold mr-2">
                                                            {lead.type || 'scrap'}
                                                        </span>
                                                        {lead.vehicleInfo}
                                                    </td>
                                                    <td className="p-4 text-slate-400 font-medium font-mono blur-[3px]">
                                                        {lead.customerName}
                                                    </td>
                                                    <td className="p-4 text-slate-400 font-medium font-mono blur-[3px]">
                                                        {lead.customerPhone}
                                                    </td>
                                                    <td className="p-4 text-slate-400 font-medium">
                                                        {lead.location}
                                                    </td>
                                                    <td className="p-4 pr-6 text-slate-500 font-medium">
                                                        {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* PAYMENT MODAL (Mock Checkout) */}
            <AnimatePresence>
                {isPaymentModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
                        >
                            <h3 className="text-lg font-black tracking-tight mb-2 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[#E31E24]" />
                                Secure Checkout
                            </h3>
                            <p className="text-xs text-slate-400 mb-6">
                                Unlock leads for <strong className="text-white">{selectedState}</strong> state. Auto-provisions credential dashboard upon confirmation.
                            </p>

                            <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">Cardholder Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">Card Number</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="4111 2222 3333 4444"
                                        maxLength={19}
                                        value={cardNumber}
                                        onChange={(e) => {
                                            // auto format spaces
                                            const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                            setCardNumber(val);
                                        }}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">Expiry (MM/YY)</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="12/28"
                                            maxLength={5}
                                            value={cardExpiry}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length > 2) {
                                                    setCardExpiry(`${val.slice(0,2)}/${val.slice(2,4)}`);
                                                } else {
                                                    setCardExpiry(val);
                                                }
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">CVV</label>
                                        <input
                                            type="password"
                                            required
                                            placeholder="•••"
                                            maxLength={3}
                                            value={cardCvv}
                                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24]"
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-white/5 my-4"></div>

                                <div className="flex justify-between items-center text-xs mb-4">
                                    <span className="text-slate-400 font-bold">Total Bill:</span>
                                    <span className="text-lg font-black text-emerald-400">₹{leadCost.toLocaleString("en-IN")}</span>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsPaymentModalOpen(false)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl text-xs transition-all border border-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isProcessingPayment}
                                        className="flex-1 bg-[#E31E24] hover:bg-[#c1191e] text-white font-black py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-red-950/30 flex items-center justify-center gap-2"
                                    >
                                        {isProcessingPayment ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            "Pay & Generate ID"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* SUCCESS PROVISIONING MODAL */}
            <AnimatePresence>
                {isSuccessModalOpen && credentials && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-slate-900 border border-emerald-500/20 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
                        >
                            {/* Glow */}
                            <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                            <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-6 h-6 text-emerald-400" />
                            </div>

                            <h3 className="text-lg font-black tracking-tight text-center mb-1">
                                Purchase Confirmed!
                            </h3>
                            <p className="text-[11px] text-slate-400 text-center mb-6">
                                Your RVSF partner portal account is generated. Please save your login credentials carefully.
                            </p>

                            <div className="space-y-4">
                                <div className="bg-black/50 border border-white/5 p-4 rounded-2xl space-y-3.5">
                                    
                                    {/* Email */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">RVSF ID / EMAIL</span>
                                        <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2">
                                            <span className="text-xs font-bold text-slate-200 select-all">{credentials.email}</span>
                                            <button
                                                onClick={() => handleCopy(credentials.email, "id")}
                                                className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-all"
                                            >
                                                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* RVSF ID */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">RVSF LOGIN ID</span>
                                        <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2">
                                            <span className="text-xs font-mono font-bold text-slate-200 select-all">{credentials.rvsfId}</span>
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">TEMPORARY PASSWORD</span>
                                        <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2">
                                            <span className="text-xs font-mono font-bold text-emerald-400 select-all">{credentials.password}</span>
                                            <button
                                                onClick={() => handleCopy(credentials.password, "pass")}
                                                className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-all"
                                            >
                                                {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex gap-2.5">
                                    <Building2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h5 className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">State License Assigned</h5>
                                        <p className="text-[10px] text-slate-300 mt-0.5 leading-normal">
                                            This ID is licensed specifically for leads in the state of <strong>{credentials.state}</strong>.
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href="/rvsf"
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 mt-4"
                                >
                                    Proceed to RVSF Login
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
