"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, FileText, Landmark, CheckCircle, ArrowRight, ArrowLeft, Upload, Loader2, X, Clock, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { INDIA_STATES, getCitiesForState } from "@/lib/india-geo"
import { Plus_Jakarta_Sans } from "next/font/google"
import Footer from "@/components/Footer"

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    variable: "--font-plus-jakarta"
})

const STEPS = [
    { id: 1, title: "Identity Verification", icon: Building2, desc: "Your basic information" },
    { id: 2, title: "KYC Documents", icon: FileText, desc: "Upload required documents" },
    { id: 3, title: "Bank Details", icon: Landmark, desc: "Account information" },
]

type FileState = { file: File | null; name: string }
const emptyFile = (): FileState => ({ file: null, name: "" })

export default function RVSFApplyPage() {
    const { data: session, status } = useSession()
    const { toast } = useToast()
    const [step, setStep] = useState(1)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [alreadyApplied, setAlreadyApplied] = useState(false)
    const [checking, setChecking] = useState(true)
    const [customCity, setCustomCity] = useState("")

    useEffect(() => {
        if (status === "loading") return
        if (status === "unauthenticated") {
            setChecking(false)
            return
        }
        fetch("/api/rvsf/apply")
            .then(r => r.json())
            .then(data => { if (data.exists) setAlreadyApplied(true) })
            .catch(console.error)
            .finally(() => setChecking(false))
    }, [status])

    // Step 1
    const [identity, setIdentity] = useState({
        legalEntityName: "", gstNumber: "", panNumber: "",
        cpcbAuthNumber: "", morthAuthNumber: "",
        businessEmail: "", phoneNumber: "",
        registeredAddress: "", city: "", state: "", pincode: "",
    })

    // Step 2
    const [docs, setDocs] = useState({
        gstCertificate: emptyFile(),
        cpcbLetter: emptyFile(),
        morthCertificate: emptyFile(),
        panCard: emptyFile(),
    })

    // Step 3
    const [bank, setBank] = useState({
        accountHolderName: "", bankName: "", accountNumber: "",
        confirmAccountNumber: "", ifscCode: "", accountType: "",
    })

    const cities = getCitiesForState(identity.state)

    const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        if (name === "state") {
            setIdentity(p => ({ ...p, state: value, city: "" }))
            setCustomCity("")
        } else {
            setIdentity(p => ({ ...p, [name]: value }))
        }
    }

    const handleBankChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setBank(p => ({ ...p, [name]: value }))
    }

    const handleFileChange = (key: keyof typeof docs, file: File | null) => {
        setDocs(p => ({ ...p, [key]: { file, name: file?.name || "" } }))
    }

    const validateStep1 = () => {
        const { legalEntityName, gstNumber, panNumber, cpcbAuthNumber, morthAuthNumber, businessEmail, phoneNumber, registeredAddress, city, state, pincode } = identity
        if (!legalEntityName || !gstNumber || !panNumber || !cpcbAuthNumber || !morthAuthNumber || !businessEmail || !phoneNumber || !registeredAddress || !state || !city || !pincode) {
            toast({ title: "Missing Fields", description: "Please fill all identity fields.", variant: "destructive" })
            return false
        }
        if (city === "Other" && !customCity.trim()) {
            toast({ title: "Missing City", description: "Please enter the city name manually.", variant: "destructive" })
            return false
        }
        return true
    }

    const validateStep2 = () => {
        const allFilled = Object.values(docs).every(d => d.file !== null)
        if (!allFilled) {
            toast({ title: "Missing Documents", description: "Please upload all 4 required documents.", variant: "destructive" })
            return false
        }
        return true
    }

    const validateStep3 = () => {
        const { accountHolderName, bankName, accountNumber, confirmAccountNumber, ifscCode, accountType } = bank
        if (!accountHolderName || !bankName || !accountNumber || !confirmAccountNumber || !ifscCode || !accountType) {
            toast({ title: "Missing Fields", description: "Please fill all bank details.", variant: "destructive" })
            return false
        }
        if (accountNumber !== confirmAccountNumber) {
            toast({ title: "Account Mismatch", description: "Account numbers do not match.", variant: "destructive" })
            return false
        }
        return true
    }

    const goNext = () => {
        if (step === 1 && !validateStep1()) return
        if (step === 2 && !validateStep2()) return
        setStep(s => s + 1)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateStep3()) return

        setIsLoading(true)
        try {
            const finalCity = identity.city === "Other" ? customCity.trim() : identity.city

            const fd = new FormData()
            Object.entries(identity).forEach(([k, v]) => {
                if (k === "city") fd.append("city", finalCity)
                else fd.append(k, v)
            })
            fd.append("gstCertificate", docs.gstCertificate.file!)
            fd.append("cpcbLetter", docs.cpcbLetter.file!)
            fd.append("morthCertificate", docs.morthCertificate.file!)
            fd.append("panCard", docs.panCard.file!)
            Object.entries(bank).forEach(([k, v]) => { if (k !== "confirmAccountNumber") fd.append(k, v) })

            const res = await fetch("/api/rvsf/apply", { method: "POST", body: fd })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Submission failed")

            setIsSubmitted(true)
        } catch (err: any) {
            toast({ title: "Submission Failed", description: err.message, variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    if (checking || status === "loading") {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#E31E24]" />
            </div>
        )
    }

    if (alreadyApplied) {
        return (
            <div className={`min-h-screen bg-slate-50 flex flex-col justify-between font-sans ${plusJakartaSans.className}`}>
                {/* Custom Light Navbar */}
                <div className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 cursor-pointer">
                            <img src="/logo.png" alt="ScrapCentre Logo" className="h-14 w-auto object-contain" />
                            <div className="flex flex-col">
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-baseline leading-none">
                                    <span className="text-[#E31E24]">Scrap</span>
                                    <span className="text-slate-900 font-black">Centre</span>
                                    <sup className="text-[10px] sm:text-xs font-bold text-slate-400 align-super -ml-0.5">®</sup>
                                </h1>
                            </div>
                        </Link>
                        <Link href="/">
                            <span className="text-sm font-bold text-[#E31E24] hover:underline cursor-pointer">Back to Home</span>
                        </Link>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center px-4 py-16">
                    <div className="w-full max-w-xl">
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                            <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mx-auto mb-5">
                                <Clock className="w-8 h-8 text-amber-500" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-3 tracking-tight">Application Already Submitted</h1>
                            <p className="text-slate-500 leading-relaxed text-sm md:text-base max-w-md mx-auto">
                                Thank you for applying to join ScrapCentre as a Registered Vehicle Scrapping Facility. Our team will review your application and get in touch with you shortly.
                            </p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 mb-8">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">What Happens Next</p>
                            <div className="space-y-0">
                                {[
                                    { num: 1, title: "Application Under Review", desc: "Our ops team will carefully review your submitted documents and details." },
                                    { num: 2, title: "KYC Video Call", desc: "You will receive an email with a scheduled KYC verification call link and timing." },
                                    { num: 3, title: "Account Activation", desc: "Once verified, your RVSF account will be activated and your login credentials will be sent to your registered email address." },
                                    { num: 4, title: "Login & Get Started", desc: "You can then log in to your RVSF dashboard at:", link: "scrapcentre.com/rvsf/login" },
                                ].map((s, i, arr) => (
                                    <motion.div key={s.num} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                                        className="flex gap-4 relative">
                                        {i < arr.length - 1 && <div className="absolute left-[18px] top-10 bottom-0 w-0.5 bg-slate-100" />}
                                        <div className="w-9 h-9 rounded-full bg-[#E31E24]/10 border border-[#E31E24]/30 flex items-center justify-center text-[#E31E24] font-extrabold text-sm shrink-0 z-10">{s.num}</div>
                                        <div className={`${i < arr.length - 1 ? "pb-7" : "pb-0"}`}>
                                            <p className="font-bold text-slate-800 text-sm">{s.title}</p>
                                            <p className="text-slate-500 text-sm mt-0.5 leading-relaxed">{s.desc}</p>
                                            {s.link && (
                                                <Link href="/rvsf/login"><span className="inline-block mt-1.5 text-sm font-bold text-[#E31E24] hover:underline">{s.link}</span></Link>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                        <div className="text-center">
                            <Link href="/"><button className="inline-flex items-center gap-2 px-8 py-3 bg-[#E31E24] hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20">Back to Home <ArrowRight className="w-4 h-4" /></button></Link>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <Footer />
            </div>
        )
    }

    if (isSubmitted) {
        return (
            <div className={`min-h-screen bg-slate-50 flex flex-col justify-between font-sans ${plusJakartaSans.className}`}>
                {/* Custom Light Navbar */}
                <div className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 cursor-pointer">
                            <img src="/logo.png" alt="ScrapCentre Logo" className="h-14 w-auto object-contain" />
                            <div className="flex flex-col">
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-baseline leading-none">
                                    <span className="text-[#E31E24]">Scrap</span>
                                    <span className="text-slate-900 font-black">Centre</span>
                                    <sup className="text-[10px] sm:text-xs font-bold text-slate-400 align-super -ml-0.5">®</sup>
                                </h1>
                            </div>
                        </Link>
                        <Link href="/">
                            <span className="text-sm font-bold text-[#E31E24] hover:underline cursor-pointer">Back to Home</span>
                        </Link>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center px-4 py-16">
                    <div className="w-full max-w-xl">
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-5">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-3 tracking-tight">Application Submitted Successfully!</h1>
                            <p className="text-slate-500 leading-relaxed text-sm md:text-base max-w-md mx-auto">
                                Thank you for applying to join ScrapCentre as a Registered Vehicle Scrapping Facility. Our team will review your application and get in touch with you shortly.
                            </p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 mb-8">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">What Happens Next</p>
                            <div className="space-y-0">
                                {[
                                    { num: 1, title: "Application Under Review", desc: "Our ops team will carefully review your submitted documents and details." },
                                    { num: 2, title: "KYC Video Call", desc: "You will receive an email with a scheduled KYC verification call link and timing." },
                                    { num: 3, title: "Account Activation", desc: "Once verified, your RVSF account will be activated and your login credentials will be sent to your registered email address." },
                                    { num: 4, title: "Login & Get Started", desc: "You can then log in to your RVSF dashboard at:", link: "scrapcentre.com/rvsf/login" },
                                ].map((s, i, arr) => (
                                    <motion.div key={s.num} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                                        className="flex gap-4 relative">
                                        {i < arr.length - 1 && <div className="absolute left-[18px] top-10 bottom-0 w-0.5 bg-slate-100" />}
                                        <div className="w-9 h-9 rounded-full bg-[#E31E24]/10 border border-[#E31E24]/30 flex items-center justify-center text-[#E31E24] font-extrabold text-sm shrink-0 z-10">{s.num}</div>
                                        <div className={`${i < arr.length - 1 ? "pb-7" : "pb-0"}`}>
                                            <p className="font-bold text-slate-800 text-sm">{s.title}</p>
                                            <p className="text-slate-500 text-sm mt-0.5 leading-relaxed">{s.desc}</p>
                                            {s.link && (
                                                <Link href="/rvsf/login"><span className="inline-block mt-1.5 text-sm font-bold text-[#E31E24] hover:underline">{s.link}</span></Link>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                        <div className="text-center">
                            <Link href="/"><button className="inline-flex items-center gap-2 px-8 py-3 bg-[#E31E24] hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20">Back to Home <ArrowRight className="w-4 h-4" /></button></Link>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <Footer />
            </div>
        )
    }

    const progress = ((step - 1) / (STEPS.length - 1)) * 100

    return (
        <div className={`min-h-screen bg-[#FDFDFD] relative flex flex-col justify-between ${plusJakartaSans.className}`}>
            
            {/* Inner Content Wrapper with Background Illustration */}
            <div className="flex-1 w-full pb-24" style={{ backgroundImage: "url('/rvsfapply.png')", backgroundSize: "100% auto", backgroundPosition: "bottom", backgroundRepeat: "no-repeat" }}>
                {/* Custom Light Navbar from Screenshot */}
                <div className="w-full bg-white/40 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 cursor-pointer">
                        <img src="/logo.png" alt="ScrapCentre Logo" className="h-14 w-auto object-contain" />
                        <div className="flex flex-col">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-baseline leading-none">
                                <span className="text-[#E31E24]">Scrap</span>
                                <span className="text-slate-900 font-black">Centre</span>
                                <sup className="text-[10px] sm:text-xs font-bold text-slate-400 align-super -ml-0.5">®</sup>
                            </h1>
                        </div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-500 font-bold hidden sm:inline">Already have an account?</span>
                        <Link href="/rvsf/login">
                            <button className="border border-red-500 rounded-xl px-4 py-1.5 text-xs text-[#E31E24] hover:bg-red-50 transition-all font-black uppercase tracking-wider">
                                Login
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Page Header */}
            <div className="text-center mt-12 mb-8 px-4">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-850 tracking-tight mb-3">
                        Join as an <span className="text-[#E31E24]">RVSF</span>
                    </h1>
                    <p className="text-slate-500 max-w-lg mx-auto text-sm md:text-base font-semibold">
                        Register your Registered Vehicle Scrapping Facility on India&apos;s leading platform
                    </p>
                </motion.div>
            </div>

            {/* Steps Navigation / Step Indicators */}
            <div className="max-w-3xl w-full mx-auto px-6 mb-12">
                <div className="flex items-start justify-between relative">
                    {/* Progress Bar Track */}
                    <div className="absolute top-[22px] left-[5%] right-[5%] h-0.5 bg-slate-100 z-0">
                        <motion.div className="h-full bg-[#E31E24]" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
                    </div>

                    {STEPS.map((s) => {
                        const Icon = s.icon
                        const done = step > s.id
                        const active = step === s.id
                        return (
                            <div key={s.id} className="flex flex-col items-center z-10 gap-3 w-1/3">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm
                                    ${done ? "bg-white border-[#E31E24] text-[#E31E24]" : active ? "bg-white border-[#E31E24] text-[#E31E24] ring-4 ring-red-500/5" : "bg-white border-slate-200 text-slate-400"}`}>
                                    {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <div className="text-center">
                                    <p className={`text-[10px] font-black uppercase tracking-wider ${active || done ? "text-slate-800" : "text-slate-400"}`}>
                                        0{s.id}
                                    </p>
                                    <p className={`text-[11px] font-black tracking-tight ${active ? "text-slate-800" : "text-slate-400"} mt-0.5`}>
                                        {s.title}
                                    </p>
                                    <p className="text-[9px] font-medium text-slate-400 leading-tight mt-0.5 hidden sm:block">
                                        {s.desc}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Form Card */}
            <div className="max-w-4xl w-full mx-auto px-4 mb-24 z-10">
                <div className="bg-white border border-slate-150 rounded-[1.5rem] p-6 md:p-10 shadow-xl shadow-slate-100/50">
                    <AnimatePresence mode="wait">
                        {/* ── STEP 1 ── */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }}>
                                <div className="mb-8">
                                    <h2 className="text-xl font-black text-slate-800">Step 1 – Identity Verification</h2>
                                    <p className="text-xs text-slate-400 mt-1 font-semibold">Please provide your basic information</p>
                                </div>

                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Legal Entity Name */}
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Legal Entity Name</label>
                                            <input type="text" name="legalEntityName" value={identity.legalEntityName} onChange={handleIdentityChange} placeholder="Enter company / firm name" 
                                                className="w-full px-4 py-3 bg-[#FAFAFA] border border-slate-200 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-red-500/5 rounded-xl text-slate-800 placeholder-slate-400 font-semibold text-sm outline-none transition-all" />
                                        </div>

                                        {/* Business Email */}
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Business Email</label>
                                            <input type="email" name="businessEmail" value={identity.businessEmail} onChange={handleIdentityChange} placeholder="contact@yourcompany.com" 
                                                className="w-full px-4 py-3 bg-[#FAFAFA] border border-slate-200 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-red-500/5 rounded-xl text-slate-800 placeholder-slate-400 font-semibold text-sm outline-none transition-all" />
                                        </div>

                                        {/* Phone Number */}
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                                            <div className="flex gap-2 w-full">
                                                <div className="flex items-center gap-1.5 px-3 py-3 bg-[#FAFAFA] border border-slate-200 rounded-xl shrink-0 text-sm font-bold text-slate-650">
                                                    <span className="text-base">🇮🇳</span>
                                                    <span>+91</span>
                                                </div>
                                                <input type="tel" name="phoneNumber" value={identity.phoneNumber} onChange={handleIdentityChange} placeholder="Enter 10-digit mobile number" 
                                                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-slate-200 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-red-500/5 rounded-xl text-slate-800 placeholder-slate-400 font-semibold text-sm outline-none transition-all" />
                                            </div>
                                        </div>

                                        {/* GST Number */}
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">GST Number</label>
                                            <input type="text" name="gstNumber" value={identity.gstNumber} onChange={handleIdentityChange} placeholder="22AAAAA0000A1Z5" 
                                                className="w-full px-4 py-3 bg-[#FAFAFA] border border-slate-200 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-red-500/5 rounded-xl text-slate-800 placeholder-slate-400 font-semibold text-sm outline-none transition-all uppercase" />
                                        </div>

                                        {/* PAN Number */}
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">PAN Number</label>
                                            <input type="text" name="panNumber" value={identity.panNumber} onChange={handleIdentityChange} placeholder="ABCDE1234F" 
                                                className="w-full px-4 py-3 bg-[#FAFAFA] border border-slate-200 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-red-500/5 rounded-xl text-slate-800 placeholder-slate-400 font-semibold text-sm outline-none transition-all uppercase" />
                                        </div>

                                        {/* CIN / Registration (CPCB auth mapped here for schema compatibility) */}
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">CIN / LLP / Registration Number</label>
                                            <input type="text" name="cpcbAuthNumber" value={identity.cpcbAuthNumber} onChange={handleIdentityChange} placeholder="U12345MH2023PTC123456" 
                                                className="w-full px-4 py-3 bg-[#FAFAFA] border border-slate-200 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-red-500/5 rounded-xl text-slate-800 placeholder-slate-400 font-semibold text-sm outline-none transition-all" />
                                        </div>

                                        {/* MSME / Udyam (MoRTH auth mapped here for schema compatibility) */}
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">MSME / Udyam / Udyog Aadhaar Number</label>
                                            <input type="text" name="morthAuthNumber" value={identity.morthAuthNumber} onChange={handleIdentityChange} placeholder="MH03D1234567" 
                                                className="w-full px-4 py-3 bg-[#FAFAFA] border border-slate-200 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-red-500/5 rounded-xl text-slate-800 placeholder-slate-400 font-semibold text-sm outline-none transition-all" />
                                        </div>

                                        {/* Registered Business Address */}
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Registered Business Address</label>
                                            <textarea name="registeredAddress" value={identity.registeredAddress} onChange={handleIdentityChange} placeholder="Full address of registered office" rows={3}
                                                className="w-full px-4 py-3 bg-[#FAFAFA] border border-slate-200 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-red-500/5 rounded-xl text-slate-800 placeholder-slate-400 font-semibold text-sm outline-none transition-all resize-none" />
                                        </div>

                                        {/* State */}
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">State</label>
                                            <div className="relative">
                                                <select name="state" value={identity.state} onChange={handleIdentityChange} required
                                                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-red-500/5 outline-none transition-all text-sm appearance-none cursor-pointer font-semibold">
                                                    <option value="">Select State</option>
                                                    {INDIA_STATES.map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* City */}
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">City</label>
                                            <div className="relative">
                                                <select name="city" value={identity.city} onChange={handleIdentityChange} required disabled={!identity.state}
                                                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-red-500/5 outline-none transition-all text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold">
                                                    <option value="">{identity.state ? "Select City" : "Select state first"}</option>
                                                    {cities.map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                    {identity.state && <option value="Other">Other (type manually)</option>}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                            {identity.city === "Other" && (
                                                <input type="text" value={customCity} onChange={e => setCustomCity(e.target.value)} placeholder="Type city name"
                                                    className="mt-2 w-full px-4 py-3 bg-[#FAFAFA] border border-[#E31E24]/50 rounded-xl text-slate-800 placeholder-slate-405 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-[#E31E24]/5 outline-none transition-all text-sm font-semibold" autoFocus />
                                            )}
                                        </div>

                                        {/* Pincode */}
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Pincode</label>
                                            <input type="number" name="pincode" value={identity.pincode} onChange={handleIdentityChange} placeholder="Enter pincode" 
                                                className="w-full px-4 py-3 bg-[#FAFAFA] border border-slate-200 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-red-500/5 rounded-xl text-slate-800 placeholder-slate-400 font-semibold text-sm outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button onClick={goNext} className="flex items-center gap-2 px-6 py-3.5 bg-[#E31E24] hover:bg-red-700 text-white font-black rounded-xl transition-all text-xs uppercase tracking-wider shadow-md active:scale-[0.98]">
                                        Next: KYC Documents <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 2 ── */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }}>
                                <div className="mb-8">
                                    <h2 className="text-xl font-black text-slate-800">Step 2 – KYC Documents</h2>
                                    <p className="text-xs text-slate-400 mt-1 font-semibold">Please upload clear scanned copies as PDF (max 10 MB each)</p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { key: "gstCertificate", label: "GST Certificate" },
                                        { key: "cpcbLetter", label: "CPCB Authorisation Letter" },
                                        { key: "morthCertificate", label: "MoRTH Certificate" },
                                        { key: "panCard", label: "PAN Card Copy" },
                                    ].map(({ key, label }) => (
                                        <FileUploadField
                                            key={key}
                                            label={label}
                                            state={(docs as any)[key]}
                                            onChange={(f) => handleFileChange(key as keyof typeof docs, f)}
                                        />
                                    ))}
                                </div>
                                <div className="mt-10 flex justify-between">
                                    <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-3.5 border border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-350 rounded-xl transition-all text-xs font-black uppercase tracking-wider">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                    <button onClick={goNext} className="flex items-center gap-2 px-6 py-3.5 bg-[#E31E24] hover:bg-red-700 text-white font-black rounded-xl transition-all text-xs uppercase tracking-wider shadow-md active:scale-[0.98]">
                                        Next: Bank Details <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 3 ── */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }}>
                                <div className="mb-8">
                                    <h2 className="text-xl font-black text-slate-800">Step 3 – Bank Account Details</h2>
                                    <p className="text-xs text-slate-400 mt-1 font-semibold">Account information for settlement verification</p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-5">
                                        {[
                                            { label: "Account Holder Name", name: "accountHolderName", placeholder: "As per bank records", type: "text" },
                                            { label: "Bank Name", name: "bankName", placeholder: "e.g. State Bank of India", type: "text" },
                                            { label: "Account Number", name: "accountNumber", placeholder: "Enter account number", type: "text" },
                                            { label: "Confirm Account Number", name: "confirmAccountNumber", placeholder: "Re-enter account number", type: "text" },
                                            { label: "IFSC Code", name: "ifscCode", placeholder: "e.g. SBIN0001234", type: "text" },
                                        ].map(f => (
                                            <div key={f.name}>
                                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                                                <input type={f.type} name={f.name} value={(bank as any)[f.name]} onChange={handleBankChange} placeholder={f.placeholder}
                                                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-slate-200 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-red-500/5 rounded-xl text-slate-800 placeholder-slate-400 font-semibold text-sm outline-none transition-all" />
                                            </div>
                                        ))}
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Account Type</label>
                                            <div className="relative">
                                                <select name="accountType" value={bank.accountType} onChange={handleBankChange}
                                                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-red-500/5 outline-none transition-all text-sm appearance-none cursor-pointer font-semibold">
                                                    <option value="">Select account type</option>
                                                    <option value="savings">Savings</option>
                                                    <option value="current">Current</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary preview */}
                                    <div className="mt-8 p-5 bg-[#FAFAFA] rounded-2xl border border-slate-150">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Application Summary</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-650">
                                            <p><span className="text-slate-400">Entity:</span> {identity.legalEntityName || "-"}</p>
                                            <p><span className="text-slate-400">GST:</span> {identity.gstNumber || "-"}</p>
                                            <p><span className="text-slate-400">PAN:</span> {identity.panNumber || "-"}</p>
                                            <p><span className="text-slate-400">Documents:</span> {Object.values(docs).filter(d => d.file).length}/4 uploaded</p>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex justify-between">
                                        <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-3.5 border border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-350 rounded-xl transition-all text-xs font-black uppercase tracking-wider">
                                            <ArrowLeft className="w-4 h-4" /> Back
                                        </button>
                                        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-3.5 bg-[#E31E24] hover:bg-red-700 text-white font-black rounded-xl transition-all text-xs uppercase tracking-wider shadow-md active:scale-[0.98] disabled:opacity-60">
                                            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Application <CheckCircle className="w-4 h-4" /></>}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            </div>

            {/* Common Footer */}
            <Footer />
        </div>
    )
}

// ── File Upload Field Component ──────────────────────────────────────────────
function FileUploadField({ label, state, onChange }: { label: string; state: FileState; onChange: (f: File | null) => void }) {
    const ref = useRef<HTMLInputElement>(null)
    return (
        <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
            <div
                onClick={() => ref.current?.click()}
                className={`relative flex items-center justify-between p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-255
                    ${state.file ? "border-green-500/50 bg-green-50/50" : "border-slate-200 bg-[#FAFAFA] hover:border-[#E31E24]/50 hover:bg-[#E31E24]/5"}`}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${state.file ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                        {state.file ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Upload className="w-5 h-5" />}
                    </div>
                    <p className={`text-xs font-bold truncate ${state.file ? "text-green-600" : "text-slate-400"}`}>
                        {state.file ? state.name : "Click to upload PDF document"}
                    </p>
                </div>
                {state.file && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); onChange(null) }}
                        className="ml-2 p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-[#E31E24] transition-colors shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                )}
                <input ref={ref} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} />
            </div>
        </div>
    )
}


