"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Shield, Key, Building, MapPin, Mail, Phone, ChevronLeft, RefreshCcw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { apiFetch } from "@/lib/fetch"

function B2BGeneratorContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { toast } = useToast()

    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        registrationId: searchParams.get("registrationId") || "",
        businessName: searchParams.get("name") || "",
        email: searchParams.get("email") || "",
        contactNumber: searchParams.get("contactNumber") || "",
        address: searchParams.get("address") || "",
        city: searchParams.get("city") || "",
        state: searchParams.get("state") || "",
        pincode: searchParams.get("pincode") || "",
        originalUserId: searchParams.get("originalUserId") || "",
        userId: "",
        password: "",
    })

    // Generate random credentials on load if empty
    useEffect(() => {
        if (!formData.userId) generateCredentials()
    }, [])

    const generateCredentials = () => {
        const randomId = `B2B${Math.floor(10000 + Math.random() * 90000)}`
        const randomPass = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 10)
        setFormData(prev => ({ ...prev, userId: randomId, password: randomPass }))
    }

    const handleCreate = async () => {
        if (!formData.userId || !formData.password || !formData.businessName) {
            toast({ title: "Validation Error", description: "User ID, Password and Business Name are required.", variant: "destructive" })
            return
        }

        setIsLoading(true)
        try {
            // /api/b2b-partner is admin-gated (withAuth(["admin"]) — role gate
            // + CSRF). apiFetch injects the required X-CSRF-Token header.
            const res = await apiFetch("/api/b2b-partner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to create B2B partner")
            }

            toast({
                title: "Partner Created!",
                description: `Successfully generated access for ${formData.businessName}. The pending request has been cleared.`,
            })
            
            router.push("/admin/partners")
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center gap-4">
                <Link href="/admin/partners" className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-500" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <Key className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                        Access Generator
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Generate and grant B2B portal access to verified partners.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Credentials Panel */}
                <div className="bg-white dark:bg-[#0E192D] rounded-2xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6 h-fit sticky top-24">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-500" />
                            Portal Credentials
                        </h2>
                        <button 
                            onClick={generateCredentials}
                            className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        >
                            <RefreshCcw className="w-3.5 h-3.5" />
                            Regenerate
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Partner User ID</label>
                            <input
                                type="text"
                                value={formData.userId}
                                onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 font-mono text-blue-600 dark:text-blue-400 font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Access Password</label>
                            <input
                                type="text"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        {isLoading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                        {isLoading ? "Provisioning Access..." : "Generate & Approve Access"}
                    </button>
                </div>

                {/* Info Panel */}
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 space-y-8">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Building className="w-5 h-5 text-gray-500" />
                        Partner Application Details
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Business Name</label>
                            <input
                                type="text"
                                value={formData.businessName}
                                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                                className="w-full bg-white dark:bg-[#0E192D] border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Phone className="w-3 h-3"/> Contact</label>
                                <input
                                    type="text"
                                    value={formData.contactNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                                    className="w-full bg-white dark:bg-[#0E192D] border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Mail className="w-3 h-3"/> Email</label>
                                <input
                                    type="text"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full bg-white dark:bg-[#0E192D] border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><MapPin className="w-3 h-3"/> Location Data</label>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    className="w-full bg-white dark:bg-[#0E192D] border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-400"
                                    placeholder="Street Address"
                                />
                                <div className="grid grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                        className="col-span-1 w-full bg-white dark:bg-[#0E192D] border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="City"
                                    />
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                                        className="col-span-1 w-full bg-white dark:bg-[#0E192D] border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="State"
                                    />
                                    <input
                                        type="text"
                                        value={formData.pincode}
                                        onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                                        className="col-span-1 w-full bg-white dark:bg-[#0E192D] border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Pincode"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function B2BGeneratorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div>}>
            <B2BGeneratorContent />
        </Suspense>
    )
}
