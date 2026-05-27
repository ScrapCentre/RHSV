"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, CheckCircle, Copy, Check, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { INDIA_STATES, getCitiesForState } from "@/lib/india-geo"

const defaultForm = {
    name: "", fullAddress: "", city: "", state: "", pincode: "",
    catchmentRadius: 200,
    contactPersonName: "", contactPersonPhone: "", contactPersonEmail: "",
}

export default function NewCCPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [form, setForm] = useState(defaultForm)
    const [customCity, setCustomCity] = useState("")
    const [loading, setLoading] = useState(false)
    const [tempPassword, setTempPassword] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const cities = getCitiesForState(form.state)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        if (name === "state") {
            setForm(p => ({ ...p, state: value, city: "" }))
            setCustomCity("")
        } else {
            setForm(p => ({ ...p, [name]: value }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.state) return toast({ title: "Please select a state", variant: "destructive" })
        if (!form.city) return toast({ title: "Please select a city", variant: "destructive" })
        if (form.city === "Other" && !customCity.trim()) return toast({ title: "Please enter the city name", variant: "destructive" })
        setLoading(true)
        const finalCity = form.city === "Other" ? customCity.trim() : form.city
        try {
            const res = await fetch("/api/rvsf/ccs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, city: finalCity }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to create CC")
            setTempPassword(data.tempPassword)
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }


    const handleCopy = () => {
        if (!tempPassword) return
        navigator.clipboard.writeText(tempPassword)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Success screen
    if (tempPassword) {
        return (
            <div className="max-w-lg mx-auto pt-10">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-[#0E192D] border border-gray-100 dark:border-slate-800 rounded-3xl p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">CC Created!</h2>
                    <p className="text-slate-500 text-sm mb-6">The CC operator account has been created and credentials sent to their email.</p>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-6">
                        <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">⚠️ One-Time Password — Save This Now</p>
                        <div className="flex items-center justify-between gap-3 bg-slate-900 rounded-xl px-4 py-3 border border-slate-700">
                            <code className="text-xl font-mono font-bold text-white tracking-widest">{tempPassword}</code>
                            <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors shrink-0">
                                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                        <p className="text-xs text-amber-400/70 mt-3 font-medium">
                            Password has been sent to the CC operator&apos;s email. It will not be shown again.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => { setTempPassword(null); setForm(defaultForm) }}
                            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-xl text-sm transition-colors">
                            Add Another CC
                        </button>
                        <Link href="/rvsf/ccs" className="flex-1">
                            <button className="w-full py-3 bg-[#E31E24] hover:bg-[#c1191e] text-white font-bold rounded-xl text-sm transition-colors">
                                View All CCs
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/rvsf/ccs">
                    <button className="p-2 bg-white dark:bg-[#0E192D] border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Add New Collection Center</h1>
                    <p className="text-sm text-slate-500">Fill in the details below to onboard a new CC</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* CC Details */}
                <div className="bg-white dark:bg-[#0E192D] border border-gray-100 dark:border-slate-800 rounded-2xl p-6">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Collection Center Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <FormField label="CC Name" name="name" value={form.name} onChange={handleChange} placeholder="Name of the collection center" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Address <span className="text-red-500">*</span></label>
                            <textarea name="fullAddress" value={form.fullAddress} onChange={handleChange} required rows={2} placeholder="Full street address"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-slate-400 focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all text-sm resize-none" />
                        </div>

                        {/* State dropdown */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">State <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select name="state" value={form.state} onChange={handleChange} required
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all text-sm appearance-none cursor-pointer">
                                    <option value="">— Select State —</option>
                                    {INDIA_STATES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* City dropdown — depends on state */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">City <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select name="city" value={form.city} onChange={handleChange} required disabled={!form.state}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                    <option value="">{form.state ? "— Select City —" : "Select state first"}</option>
                                    {cities.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                    {form.state && <option value="Other">Other (type manually)</option>}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                            {form.city === "Other" && (
                                <input
                                    type="text"
                                    value={customCity}
                                    onChange={e => setCustomCity(e.target.value)}
                                    placeholder="Type city name"
                                    className="mt-2 w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-[#E31E24]/50 rounded-xl text-gray-900 dark:text-white placeholder-slate-400 focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all text-sm"
                                    autoFocus
                                />
                            )}
                        </div>

                        <FormField label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" required type="text" pattern="\d{6}" />

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Catchment Radius: <span className="text-[#E31E24] font-mono">{form.catchmentRadius} km</span>
                            </label>
                            <input type="range" name="catchmentRadius" min={50} max={1000} step={10}
                                value={form.catchmentRadius}
                                onChange={e => setForm(p => ({ ...p, catchmentRadius: Number(e.target.value) }))}
                                className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-[#E31E24]"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>50 km</span><span>1000 km</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Person */}
                <div className="bg-white dark:bg-[#0E192D] border border-gray-100 dark:border-slate-800 rounded-2xl p-6">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">Contact Person</h2>
                    <p className="text-xs text-slate-500 mb-4">This person will receive the CC Operator login credentials via email.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Name" name="contactPersonName" value={form.contactPersonName} onChange={handleChange} placeholder="Full name" required />
                        <FormField label="Phone Number" name="contactPersonPhone" value={form.contactPersonPhone} onChange={handleChange} placeholder="10-digit mobile" required type="tel" />
                        <div className="md:col-span-2">
                            <FormField label="Email" name="contactPersonEmail" value={form.contactPersonEmail} onChange={handleChange} placeholder="operator@email.com" required type="email" />
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-[#E31E24] hover:bg-[#c1191e] text-white font-bold rounded-2xl transition-all disabled:opacity-60 text-base shadow-lg shadow-red-500/20">
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : "Create Collection Center"}
                </button>
            </form>
        </div>
    )
}

function FormField({ label, name, value, onChange, placeholder, required, type = "text", pattern }: {
    label: string; name: string; value: string; onChange: any; placeholder: string; required?: boolean; type?: string; pattern?: string
}) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
                required={required} pattern={pattern}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-slate-400 focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all text-sm"
            />
        </div>
    )
}
