"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, FileText, Landmark, CheckCircle, ArrowRight, ArrowLeft, Upload, Loader2, X, Clock, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { INDIA_STATES, getCitiesForState } from "@/lib/india-geo"

const STEPS = [
    { id: 1, title: "Identity", icon: Building2, desc: "Legal & regulatory details" },
    { id: 2, title: "KYC Documents", icon: FileText, desc: "Upload certificates as PDF" },
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
        // Only check once session status is resolved
        if (status === "loading") return
        if (status === "unauthenticated") {
            setChecking(false)
            return
        }
        // Logged in — check if they already applied
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

    const progress = ((step - 1) / (STEPS.length - 1)) * 100

    // Checking session / existing application
    if (checking || status === "loading") {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#E31E24]" />
            </div>
        )
    }

    // Already applied screen
    if (alreadyApplied) {
        const steps = [
            { num: 1, title: "Application Under Review", desc: "Our ops team will carefully review your submitted documents and details." },
            { num: 2, title: "KYC Video Call", desc: "You will receive an email with a scheduled KYC verification call link and timing." },
            { num: 3, title: "Account Activation", desc: "Once verified, your RVSF account will be activated and your login credentials will be sent to your registered email address." },
            { num: 4, title: "Login & Get Started", desc: "You can then log in to your RVSF dashboard at:", link: "scrapcentre.com/rvsf/login" },
        ]
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-24 font-sans">
                <div className="w-full max-w-xl">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                        <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mx-auto mb-5">
                            <Clock className="w-8 h-8 text-amber-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">Application Already Submitted</h1>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base max-w-md mx-auto">
                            Thank you for applying to join ScrapCentre as a Registered Vehicle Scrapping Facility. Our team will review your application and get in touch with you shortly.
                        </p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="bg-[#0E192D] border border-slate-800 rounded-3xl p-6 md:p-8 mb-8">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">What Happens Next</p>
                        <div className="space-y-0">
                            {steps.map((s, i) => (
                                <motion.div key={s.num} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                                    className="flex gap-4 relative">
                                    {i < steps.length - 1 && <div className="absolute left-[18px] top-10 bottom-0 w-0.5 bg-slate-800" />}
                                    <div className="w-9 h-9 rounded-full bg-[#E31E24]/10 border border-[#E31E24]/30 flex items-center justify-center text-[#E31E24] font-extrabold text-sm shrink-0 z-10">{s.num}</div>
                                    <div className={`${i < steps.length - 1 ? "pb-7" : "pb-0"}`}>
                                        <p className="font-bold text-white text-sm">{s.title}</p>
                                        <p className="text-slate-400 text-sm mt-0.5 leading-relaxed">{s.desc}</p>
                                        {s.link && (
                                            <Link href="/rvsf/login"><span className="inline-block mt-1.5 text-sm font-bold text-[#E31E24] hover:underline">{s.link}</span></Link>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                    <div className="text-center">
                        <Link href="/"><button className="inline-flex items-center gap-2 px-8 py-3 bg-[#E31E24] hover:bg-[#c1191e] text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20">Back to Home <ArrowRight className="w-4 h-4" /></button></Link>
                    </div>
                </div>
            </div>
        )
    }

    if (isSubmitted) {
        const steps = [
            {
                num: 1,
                title: "Application Under Review",
                desc: "Our ops team will carefully review your submitted documents and details.",
            },
            {
                num: 2,
                title: "KYC Video Call",
                desc: "You will receive an email with a scheduled KYC verification call link and timing.",
            },
            {
                num: 3,
                title: "Account Activation",
                desc: "Once verified, your RVSF account will be activated and your login credentials will be sent to your registered email address.",
            },
            {
                num: 4,
                title: "Login & Get Started",
                desc: "You can then log in to your RVSF dashboard at:",
                link: "scrapcentre.com/rvsf/login",
            },
        ]

        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-24 font-sans">
                <div className="w-full max-w-xl">
                    {/* Icon + heading */}
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 10, stiffness: 200, delay: 0.1 }}
                            className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle className="w-10 h-10 text-green-400" />
                        </motion.div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
                            Application Submitted Successfully!
                        </h1>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base max-w-md mx-auto">
                            Thank you for applying to join ScrapCentre as a Registered Vehicle Scrapping Facility.
                            Our team will review your application and get in touch with you shortly.
                        </p>
                    </motion.div>

                    {/* What happens next */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-[#0E192D] border border-slate-800 rounded-3xl p-6 md:p-8 mb-8">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">What Happens Next</p>
                        <div className="space-y-0">
                            {steps.map((s, i) => (
                                <motion.div key={s.num}
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="flex gap-4 relative"
                                >
                                    {/* Vertical line connector */}
                                    {i < steps.length - 1 && (
                                        <div className="absolute left-[18px] top-10 bottom-0 w-0.5 bg-slate-800" />
                                    )}
                                    {/* Step number bubble */}
                                    <div className="w-9 h-9 rounded-full bg-[#E31E24]/10 border border-[#E31E24]/30 flex items-center justify-center text-[#E31E24] font-extrabold text-sm shrink-0 z-10">
                                        {s.num}
                                    </div>
                                    {/* Content */}
                                    <div className={`pb-7 ${i === steps.length - 1 ? "pb-0" : ""}`}>
                                        <p className="font-bold text-white text-sm">{s.title}</p>
                                        <p className="text-slate-400 text-sm mt-0.5 leading-relaxed">{s.desc}</p>
                                        {s.link && (
                                            <Link href="/rvsf/login">
                                                <span className="inline-block mt-1.5 text-sm font-bold text-[#E31E24] hover:underline">
                                                    {s.link}
                                                </span>
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* CTA */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-center">
                        <Link href="/">
                            <button className="inline-flex items-center gap-2 px-8 py-3 bg-[#E31E24] hover:bg-[#c1191e] text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20">
                                Back to Home <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-16 px-4 font-sans">
            {/* Page Header */}
            <div className="text-center mb-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#E31E24]/10 border border-[#E31E24]/30 text-[#E31E24] text-xs font-bold uppercase tracking-widest mb-4">
                        RVSF Registration
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
                        Join as an <span className="text-[#E31E24]">RVSF</span>
                    </h1>
                    <p className="text-slate-400 max-w-lg mx-auto text-base">
                        Register your Registered Vehicle Scrapping Facility on India&apos;s leading platform.
                    </p>
                </motion.div>
            </div>

            {/* Progress Bar + Step Indicators */}
            <div className="max-w-2xl mx-auto mb-10">
                <div className="flex items-center justify-between relative">
                    {/* Track */}
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-800 z-0">
                        <motion.div className="h-full bg-[#E31E24]" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
                    </div>
                    {STEPS.map((s) => {
                        const Icon = s.icon
                        const done = step > s.id
                        const active = step === s.id
                        return (
                            <div key={s.id} className="flex flex-col items-center z-10 gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${done ? "bg-[#E31E24] border-[#E31E24]" : active ? "bg-[#E31E24]/10 border-[#E31E24]" : "bg-slate-900 border-slate-700"}`}>
                                    {done ? <CheckCircle className="w-5 h-5 text-white" /> : <Icon className={`w-5 h-5 ${active ? "text-[#E31E24]" : "text-slate-500"}`} />}
                                </div>
                                <div className="text-center hidden sm:block">
                                    <p className={`text-xs font-bold uppercase tracking-wider ${active ? "text-white" : done ? "text-[#E31E24]" : "text-slate-600"}`}>{s.title}</p>
                                    <p className="text-[10px] text-slate-600">{s.desc}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Form Card */}
            <div className="max-w-2xl mx-auto">
                <div className="bg-[#0E192D] border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl">
                    <AnimatePresence mode="wait">
                        {/* ── STEP 1 ── */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                                <h2 className="text-xl font-bold text-white mb-6">Step 1 — Identity Verification</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: "Legal Entity Name", name: "legalEntityName", placeholder: "Registered company / firm name", type: "text" },
                                        { label: "Business Email", name: "businessEmail", placeholder: "contact@yourcompany.com", type: "email" },
                                        { label: "Phone Number", name: "phoneNumber", placeholder: "10-digit mobile number", type: "tel", elementType: "input" },
                                        { label: "GST Number", name: "gstNumber", placeholder: "22AAAAA0000A1Z5", type: "text", elementType: "input" },
                                        { label: "PAN Number", name: "panNumber", placeholder: "ABCDE1234F", type: "text", elementType: "input" },
                                        { label: "CPCB Authorisation Number", name: "cpcbAuthNumber", placeholder: "CPCB/AUTH/XXXX/2024", type: "text", elementType: "input" },
                                        { label: "MoRTH Authorisation Number", name: "morthAuthNumber", placeholder: "MoRTH/RVSF/XXXX/2024", type: "text", elementType: "input" },
                                        { label: "Registered Business Address", name: "registeredAddress", placeholder: "Full address", type: "text", elementType: "textarea" },
                                        { label: "State", name: "state", placeholder: "— Select State —", type: "text", elementType: "state_select" },
                                        { label: "City", name: "city", placeholder: "— Select City —", type: "text", elementType: "city_select" },
                                        { label: "Pincode", name: "pincode", placeholder: "e.g. 400001", type: "number", elementType: "input" },
                                    ].map(field => (
                                        <div key={field.name}>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{field.label}</label>
                                            {field.elementType === "textarea" ? (
                                                <textarea
                                                    name={field.name}
                                                    value={(identity as any)[field.name]}
                                                    onChange={handleIdentityChange as any}
                                                    placeholder={field.placeholder}
                                                    rows={3}
                                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all text-sm resize-none"
                                                />
                                            ) : field.elementType === "state_select" ? (
                                                <div className="relative">
                                                    <select name="state" value={identity.state} onChange={handleIdentityChange} required
                                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all text-sm appearance-none cursor-pointer">
                                                        <option value="">{field.placeholder}</option>
                                                        {INDIA_STATES.map(s => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                </div>
                                            ) : field.elementType === "city_select" ? (
                                                <div>
                                                    <div className="relative">
                                                        <select name="city" value={identity.city} onChange={handleIdentityChange} required disabled={!identity.state}
                                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                                            <option value="">{identity.state ? field.placeholder : "Select state first"}</option>
                                                            {cities.map(c => (
                                                                <option key={c} value={c}>{c}</option>
                                                            ))}
                                                            {identity.state && <option value="Other">Other (type manually)</option>}
                                                        </select>
                                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                    </div>
                                                    {identity.city === "Other" && (
                                                        <input
                                                            type="text"
                                                            value={customCity}
                                                            onChange={e => setCustomCity(e.target.value)}
                                                            placeholder="Type city name"
                                                            className="mt-2 w-full px-4 py-3 bg-slate-900 border border-[#E31E24]/50 rounded-xl text-white placeholder-slate-500 focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all text-sm"
                                                            autoFocus
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    name={field.name}
                                                    value={(identity as any)[field.name]}
                                                    onChange={handleIdentityChange}
                                                    placeholder={field.placeholder}
                                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all text-sm"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button onClick={goNext} className="flex items-center gap-2 px-8 py-3 bg-[#E31E24] hover:bg-[#c1191e] text-white font-bold rounded-xl transition-all text-sm">
                                        Next — KYC Documents <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 2 ── */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                                <h2 className="text-xl font-bold text-white mb-2">Step 2 — KYC Documents</h2>
                                <p className="text-slate-500 text-sm mb-6">Upload clear scanned copies as PDF (max 10 MB each).</p>
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
                                <div className="mt-8 flex justify-between">
                                    <button onClick={() => setStep(1)} className="flex items-center gap-2 px-6 py-3 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded-xl transition-all text-sm font-bold">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                    <button onClick={goNext} className="flex items-center gap-2 px-8 py-3 bg-[#E31E24] hover:bg-[#c1191e] text-white font-bold rounded-xl transition-all text-sm">
                                        Next — Bank Details <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 3 ── */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                                <h2 className="text-xl font-bold text-white mb-6">Step 3 — Bank Account Details</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        {[
                                            { label: "Account Holder Name", name: "accountHolderName", placeholder: "As per bank records", type: "text" },
                                            { label: "Bank Name", name: "bankName", placeholder: "e.g. State Bank of India", type: "text" },
                                            { label: "Account Number", name: "accountNumber", placeholder: "Enter account number", type: "text" },
                                            { label: "Confirm Account Number", name: "confirmAccountNumber", placeholder: "Re-enter account number", type: "text" },
                                            { label: "IFSC Code", name: "ifscCode", placeholder: "e.g. SBIN0001234", type: "text" },
                                        ].map(f => (
                                            <div key={f.name}>
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                                                <input
                                                    type={f.type}
                                                    name={f.name}
                                                    value={(bank as any)[f.name]}
                                                    onChange={handleBankChange}
                                                    placeholder={f.placeholder}
                                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all text-sm"
                                                />
                                            </div>
                                        ))}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Account Type</label>
                                            <select
                                                name="accountType"
                                                value={bank.accountType}
                                                onChange={handleBankChange}
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all text-sm"
                                            >
                                                <option value="">Select account type</option>
                                                <option value="savings">Savings</option>
                                                <option value="current">Current</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Summary preview */}
                                    <div className="mt-6 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Application Summary</p>
                                        <p className="text-sm text-slate-300"><span className="text-slate-500">Entity:</span> {identity.legalEntityName}</p>
                                        <p className="text-sm text-slate-300"><span className="text-slate-500">GST:</span> {identity.gstNumber} &nbsp;|&nbsp; <span className="text-slate-500">PAN:</span> {identity.panNumber}</p>
                                        <p className="text-sm text-slate-300"><span className="text-slate-500">Documents:</span> {Object.values(docs).filter(d => d.file).length}/4 uploaded</p>
                                    </div>

                                    <div className="mt-8 flex justify-between">
                                        <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 px-6 py-3 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded-xl transition-all text-sm font-bold">
                                            <ArrowLeft className="w-4 h-4" /> Back
                                        </button>
                                        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-8 py-3 bg-[#E31E24] hover:bg-[#c1191e] text-white font-bold rounded-xl transition-all text-sm disabled:opacity-60">
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
    )
}

// ── File Upload Field Component ──────────────────────────────────────────────
function FileUploadField({ label, state, onChange }: { label: string; state: FileState; onChange: (f: File | null) => void }) {
    const ref = useRef<HTMLInputElement>(null)
    return (
        <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
            <div
                onClick={() => ref.current?.click()}
                className={`relative flex items-center justify-between p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${state.file ? "border-green-500/50 bg-green-500/5" : "border-slate-700 bg-slate-900 hover:border-[#E31E24]/50 hover:bg-[#E31E24]/5"}`}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${state.file ? "bg-green-500/10" : "bg-slate-800"}`}>
                        {state.file ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Upload className="w-5 h-5 text-slate-500" />}
                    </div>
                    <p className={`text-sm font-medium truncate ${state.file ? "text-green-300" : "text-slate-500"}`}>
                        {state.file ? state.name : "Click to upload PDF"}
                    </p>
                </div>
                {state.file && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); onChange(null) }}
                        className="ml-2 p-1 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                )}
                <input ref={ref} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} />
            </div>
        </div>
    )
}
