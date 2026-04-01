"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Shield, Key, CheckCircle, User, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

function B2BGeneratorContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    // Pre-fill data from URL params
    const initialData = {
        registrationId: searchParams.get("registrationId") || "",
        businessName: searchParams.get("name") || "",
        email: searchParams.get("email") || "",
        contactNumber: searchParams.get("contactNumber") || "",
        address: searchParams.get("address") || "",
        city: searchParams.get("city") || "",
        state: searchParams.get("state") || "",
        pincode: searchParams.get("pincode") || "",
        originalUserId: searchParams.get("originalUserId") || "",
    }

    const [partnerId, setPartnerId] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast({
                title: "Passwords do not match",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch("/api/b2b-partner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: partnerId,
                    password,
                    ...initialData
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong")
            }

            toast({
                title: "Success",
                description: "Partner account created successfully!",
                variant: "default",
            })

            // Redirect back to partners page after success
            setTimeout(() => {
                router.push("/admin/partners")
            }, 1000)

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-2xl mx-auto">
                <Link href="/admin/partners" className="inline-flex items-center text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Partners
                </Link>

                <div className="bg-white dark:bg-[#0E192D] rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="bg-blue-600 px-8 py-6 text-white">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Key className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Generate Access Credentials</h1>
                                <p className="text-blue-100 text-sm mt-1">Create login details for {initialData.businessName || "New Partner"}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b dark:border-slate-800 pb-2">Partner Details</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <label className="block text-gray-500 dark:text-slate-400 mb-1">Business Name</label>
                                        <input disabled value={initialData.businessName} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-gray-700 dark:text-slate-300" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 dark:text-slate-400 mb-1">Email</label>
                                        <input disabled value={initialData.email} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-gray-700 dark:text-slate-300" />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b dark:border-slate-800 pb-2">Login Credentials</h3>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Partner User ID</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={partnerId}
                                        onChange={(e) => setPartnerId(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                                        placeholder="Create a unique username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Key className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                                        placeholder="Enter password"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CheckCircle className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                                        placeholder="Re-enter password"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Generating Partner Account..." : "Create Partner Account"}
                            </button>
                        </div>
                    </form>
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

