"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, MapPin, Phone, Mail, User, CheckCircle, ArrowRight, ArrowLeft, Lock, Copy, Check, Shield } from "lucide-react"
import Link from "next/link"
import confetti from "canvas-confetti"
import { useToast } from "@/components/ui/use-toast"
import { indiaData, states } from "@/lib/india-data"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function PartnerRegistrationPage() {
    const { data: session, status } = useSession()
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    // Hard redirect to B2B login if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login?tab=b2b")
        }
    }, [status, router])

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        pincode: "",
        city: "",
        customCity: "",
        state: "",
        contactNumber: "",
        email: ""
    })

    const [existingApplication, setExistingApplication] = useState<any>(null)
    const [isCheckingStatus, setIsCheckingStatus] = useState(true)
    const [copiedField, setCopiedField] = useState<string | null>(null)

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        toast({
            title: "Copied!",
            description: `${field} copied to clipboard.`,
        })
        setTimeout(() => setCopiedField(null), 2000)
    }

    useEffect(() => {
        const checkStatus = async () => {
            if (session?.user) {
                try {
                    const res = await fetch(`/api/b2b-register?userId=${(session.user as any).id}&email=${session.user?.email}`)
                    const data = await res.json()
                    if (data.data) {
                        setExistingApplication(data.data)
                    }
                } catch (error) {
                    console.error("Error fetching status:", error)
                } finally {
                    setIsCheckingStatus(false)
                }
            } else {
                setIsCheckingStatus(false)
            }
        }

        if (status === "authenticated") {
            checkStatus()
        } else if (status === "unauthenticated") {
            setIsCheckingStatus(false)
        }
    }, [session, status])

    if (status === "loading" || status === "unauthenticated") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
                <p className="text-slate-400 font-medium">
                    {status === "loading" ? "Checking authentication..." : "Redirecting to B2B Login..."}
                </p>
            </div>
        )
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch("/api/b2b-register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    city: formData.city === "other" ? formData.customCity : formData.city,
                    userId: session?.user ? (session.user as any).id : undefined
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong")
            }

            setIsLoading(false)
            setIsSubmitted(true)
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            })
        } catch (error: any) {
            setIsLoading(false)
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center pt-32 pb-16 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none focus:outline-none">
            </div>


            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                {!existingApplication && (
                    <>
                        <div className="flex justify-center mt-6">
                            <div className="w-20 h-20 bg-[#0E192D] rounded-2xl shadow-xl flex items-center justify-center border border-slate-800">
                                <Building2 className="w-10 h-10 text-orange-500" />
                            </div>
                        </div>
                        <h2 className="mt-8 text-center text-4xl font-extrabold text-white tracking-tight">
                            Become a <span className="text-orange-600">Partner</span>
                        </h2>
                        <p className="mt-3 text-center text-lg text-gray-400 max-w-sm mx-auto">
                            Join India's fastest-growing network of certified scrap dealers.
                        </p>
                    </>
                )}
            </div>

            <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-3xl relative z-10 px-4">
                <div
                    className="bg-[#0E192D] py-4 px-6 shadow-2xl shadow-black/20 sm:rounded-3xl sm:px-10 border border-slate-800 relative overflow-hidden"
                    style={{
                        backgroundImage: `url(${existingApplication?.backgroundImage || ''})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    {/* Overlay for readability if BG image exists */}
                    {existingApplication?.backgroundImage && (
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"></div>
                    )}

                    <AnimatePresence mode="wait">
                        {isCheckingStatus ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
                            </div>
                        ) : existingApplication ? (
                            <motion.div
                                key="status"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                {existingApplication.status === "approved" ? (
                                    <div className="relative">
                                        {/* Content for approved status */}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                            className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 mb-2 relative z-10"
                                        >
                                            <CheckCircle className="h-10 w-10 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
                                        </motion.div>
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <h3 className="text-3xl font-black bg-gradient-to-r from-white via-green-100 to-white bg-clip-text text-transparent mb-0.5 tracking-tight">
                                                Congratulations!
                                            </h3>
                                            <p className="text-slate-400 mb-4 max-w-lg mx-auto text-base leading-relaxed font-medium">
                                                Your partnership has been <span className="text-green-400 font-bold">Approved</span>. Welcome to the network!
                                            </p>
                                        </motion.div>

                                        <motion.div
                                            initial={{ y: 30, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="relative group"
                                        >
                                            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                            <div className="relative bg-[#0E192D]/40 backdrop-blur-2xl rounded-2xl p-5 mb-3 w-full border border-white/10 text-left shadow-2xl">
                                                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                                                    <h4 className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
                                                        Login Credentials
                                                    </h4>
                                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] font-black rounded-lg border border-green-500/20 uppercase tracking-tighter">Secure</span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="group/field relative">
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1.5 ml-1">Partner ID</p>
                                                        <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-xl border border-white/5 group-hover/field:border-green-500/30 transition-colors">
                                                            <p className="font-mono text-lg font-bold text-white tracking-wider">{existingApplication.userId}</p>
                                                            <button
                                                                onClick={() => copyToClipboard(existingApplication.userId, "Partner ID")}
                                                                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-green-400"
                                                            >
                                                                {copiedField === "Partner ID" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="group/field relative">
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1.5 ml-1">Password</p>
                                                        <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-xl border border-white/5 group-hover/field:border-green-500/30 transition-colors">
                                                            <p className="font-mono text-lg font-bold text-white tracking-wider">
                                                                {existingApplication.password || "••••••••"}
                                                            </p>
                                                            <button
                                                                onClick={() => copyToClipboard(existingApplication.password || "", "Password")}
                                                                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-green-400"
                                                            >
                                                                {copiedField === "Password" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                        {!existingApplication.password && (
                                                            <p className="text-[10px] text-slate-500 mt-2 ml-1 italic font-medium">
                                                                Use your existing email password
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            <button
                                                onClick={() => signOut({ callbackUrl: "/login" })}
                                                className="group relative w-full inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-lg font-black rounded-2xl text-white bg-green-600 hover:bg-green-500 transition-all shadow-[0_10px_40px_-10px_rgba(22,163,74,0.5)] hover:shadow-[0_15px_50px_-10px_rgba(22,163,74,0.6)] hover:-translate-y-1 active:scale-[0.98] overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                                                <Lock className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                                Log Out & Login as Partner
                                            </button>
                                            <p className="mt-2 text-slate-500 text-sm font-medium">
                                                Need help? <Link href="/contact" className="text-green-400 hover:underline">Contact Support</Link>
                                            </p>
                                        </motion.div>
                                    </div>
                                ) : existingApplication.status === "rejected" ? (
                                    <>
                                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-900/20 mb-6 border border-red-500/30">
                                            <Shield className="h-10 w-10 text-red-500" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Application Rejected</h3>
                                        <p className="text-gray-400 mb-8 max-w-sm mx-auto font-medium leading-relaxed">
                                            We regret to inform you that your partnership request for <span className="text-red-400 font-bold">{existingApplication.name}</span> has been <span className="text-red-500 font-bold">Rejected</span> by our review team.
                                        </p>
                                        <div className="space-y-4">
                                            <Link href="/contact">
                                                <button className="w-full inline-flex items-center justify-center px-6 py-3 border border-slate-700 text-base font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]">
                                                    Contact Support <Mail className="ml-2 h-5 w-5" />
                                                </button>
                                            </Link>
                                            <Link href="/">
                                                <button className="w-full flex items-center justify-center text-slate-500 hover:text-white text-sm font-bold transition-colors">
                                                    Back to Home
                                                </button>
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-900/20 mb-6">
                                            <CheckCircle className="h-10 w-10 text-yellow-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Application Under Review</h3>
                                        <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                                            Your application for <span className="font-semibold text-white">{existingApplication.name}</span> was submitted on {new Date(existingApplication.createdAt).toLocaleDateString()}. Our team is reviewing your details.
                                        </p>
                                        <Link href="/">
                                            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-bold rounded-xl text-orange-400 bg-orange-900/30 hover:bg-orange-900/50 transition-colors">
                                                Back to Home <ArrowRight className="ml-2 h-5 w-5" />
                                            </button>
                                        </Link>
                                    </>
                                )}
                            </motion.div>
                        ) : !isSubmitted ? (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                                onSubmit={handleSubmit}
                            >
                                {/* Row 1: Name and Contact */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 ml-1 mb-2">Business / Owner Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="block w-full pl-11 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:bg-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 ml-1 mb-2">Contact Number</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                            </div>
                                            <input
                                                type="tel"
                                                name="contactNumber"
                                                required
                                                value={formData.contactNumber}
                                                onChange={handleChange}
                                                className="block w-full pl-11 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:bg-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 ml-1 mb-2">Detailed Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 pt-4 pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                        </div>
                                        <textarea
                                            name="address"
                                            required
                                            rows={2}
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:bg-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                            placeholder="Shop No, Street, Landmark"
                                        />
                                    </div>
                                </div>

                                {/* State & City */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 ml-1 mb-2">State</label>
                                        <select
                                            name="state"
                                            required
                                            value={formData.state}
                                            onChange={(e) => {
                                                const newState = e.target.value;
                                                setFormData(prev => ({ ...prev, state: newState, city: "" }));
                                            }}
                                            className="block w-full px-4 py-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:bg-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                        >
                                            <option value="" className="text-gray-500">Select State</option>
                                            {states.map((state) => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 ml-1 mb-2">City</label>
                                        <select
                                            name="city"
                                            required
                                            disabled={!formData.state}
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="block w-full px-4 py-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:bg-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200 disabled:opacity-50"
                                        >
                                            <option value="" className="text-gray-500">Select City</option>
                                            <option value="other">Other</option>
                                            {formData.state && indiaData[formData.state as string]?.map((city) => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Custom City */}
                                {formData.city === "other" && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 ml-1 mb-2">Enter City</label>
                                        <input
                                            type="text"
                                            name="customCity"
                                            required={formData.city === "other"}
                                            value={formData.customCity}
                                            onChange={handleChange}
                                            className="block w-full px-4 py-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:bg-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                            placeholder="Enter your city"
                                        />
                                    </div>
                                )}

                                {/* Row 4: Pincode and Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 ml-1 mb-2">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="block w-full pl-11 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:bg-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                                placeholder="partner@business.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 ml-1 mb-2">Pincode</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                name="pincode"
                                                required
                                                value={formData.pincode}
                                                onChange={handleChange}
                                                className="block w-full pl-11 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:bg-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                                placeholder="110001"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-xl shadow-orange-500/20 text-base font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all active:scale-[0.98]"
                                    >
                                        {isLoading ? "Submitting..." : "Submit Application"}
                                    </button>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12"
                            >
                                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-900/20 mb-6">
                                    <CheckCircle className="h-12 w-12 text-green-400" />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-3">Submission Successful!</h3>
                                <p className="text-gray-400 mb-10 max-w-sm mx-auto text-lg">
                                    Thank you for your interest. Our team will verify your details and contact you within 24 hours.
                                </p>
                                <Link href="/">
                                    <button className="inline-flex items-center px-8 py-4 border border-transparent text-base font-bold rounded-xl text-orange-400 bg-orange-900/30 hover:bg-orange-900/50 transition-colors">
                                        Back to Home <ArrowRight className="ml-2 h-5 w-5" />
                                    </button>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

