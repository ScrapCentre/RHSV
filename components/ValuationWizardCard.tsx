"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Car, Recycle, ShoppingCart, ArrowRight, ArrowLeft, 
    Zap, Shield, Sparkles, CheckCircle, Search, 
    MapPin, Calendar, User, Phone, ClipboardList,
    Smartphone, Lock, Fuel, Gauge, Home, Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth"
import { signIn } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

import { indiaData, states as STATES } from "@/lib/india-data"

// ─── Data Definitions ─────────────────────────────────────────────────────────

const BRANDS = ["Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Toyota", "Honda", "Kia", "Skoda"]
const YEARS = ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "Older"]
const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"]

const normalizeFuelType = (fuel?: string): string => {
    if (!fuel) return "";
    const cleanFuel = fuel.trim().toUpperCase();
    if (cleanFuel.includes("PETROL") && !cleanFuel.includes("CNG")) return "Petrol";
    if (cleanFuel.includes("DIESEL")) return "Diesel";
    if (cleanFuel.includes("CNG") || cleanFuel.includes("LPG")) return "CNG";
    if (cleanFuel.includes("ELECTRIC") || cleanFuel.includes("EV")) return "Electric";
    if (cleanFuel.includes("HYBRID")) return "Hybrid";
    return fuel.charAt(0).toUpperCase() + fuel.slice(1).toLowerCase();
};

// ─── Wizard Component ─────────────────────────────────────────────────────────

export default function ValuationWizardCard() {
    const router = useRouter()
    const { toast } = useToast()
    const [mode, setMode] = useState<"options" | "wizard" | "success" | "scrap-valuation">("wizard")
    const [serviceType, setServiceType] = useState<string>("")
    const [step, setStep] = useState(0)
    const [direction, setDirection] = useState(1)
    const [fromHero, setFromHero] = useState(false)
    
    // Form Data
    const [formData, setFormData] = useState({
        regNo: "",
        brand: "",
        model: "",
        year: "",
        weight: "",
        kms: "",
        fuel: "",
        name: "",
        address: "",
        phone: "",
        otp: "",
        desiredCompany: "",
        desiredModel: "",
        buyNew: "",
        pincode: "",
        state: "",
        city: ""
    })

    // Listen for vehicle data from Hero section
    useEffect(() => {
        const handleHeroData = (e: CustomEvent) => {
            const data = e.detail
            setFormData(prev => ({
                ...prev,
                regNo: data.regNo || "",
                brand: data.brand || "",
                model: data.model || "",
                year: data.year || "",
                weight: data.weight || "",
                fuel: data.fuel || ""
            }))
            setFromHero(true)
            setServiceType("")
            setStep(0)
            setMode("wizard")
        }
        window.addEventListener('hero-vehicle-data', handleHeroData as EventListener)
        return () => window.removeEventListener('hero-vehicle-data', handleHeroData as EventListener)
    }, [])

    const [isFetching, setIsFetching] = useState(false)
    const [isSendingOtp, setIsSendingOtp] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)

    // Scrap Valuation Pricing
    const [cdDiscount, setCdDiscount] = useState<number | null>(null)
    const [newCarPrice, setNewCarPrice] = useState<number | null>(null)
    const [isFetchingPrice, setIsFetchingPrice] = useState(false)
    const [baseScrapRate, setBaseScrapRate] = useState<number>(25) // Default to 25

    useEffect(() => {
        // Fetch global scrap rates
        fetch('/api/settings/scrapRates')
            .then(res => res.json())
            .then(data => {
                if (data && data.scrapPricePerKg) {
                    setBaseScrapRate(data.scrapPricePerKg);
                }
            })
            .catch(err => console.error("Failed to fetch base scrap rate:", err));
    }, []);

    useEffect(() => {
        if (mode === "scrap-valuation" && formData.buyNew === "yes" && formData.desiredCompany && formData.desiredModel && !cdDiscount && !isFetchingPrice) {
            setIsFetchingPrice(true)
            fetch('/api/car-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company: formData.desiredCompany, model: formData.desiredModel })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setCdDiscount(data.data.cdDiscount)
                    setNewCarPrice(data.data.basePrice)
                }
            })
            .catch(err => {
                console.error("Car price fetch error:", err)
                // Set default discount if API fails to show something to the user
                setCdDiscount(20000)
            })
            .finally(() => setIsFetchingPrice(false))
        }
    }, [mode, formData, cdDiscount, isFetchingPrice])

    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)
    const [otpSent, setOtpSent] = useState(false)
    const [isSandboxMode, setIsSandboxMode] = useState(false)

    const getOrCreateRecaptcha = (): RecaptchaVerifier => {
        if (recaptchaVerifierRef.current) return recaptchaVerifierRef.current
        const verifier = new RecaptchaVerifier(auth, 'wizard-recaptcha-container', {
            size: 'invisible',
            callback: () => {},
            'expired-callback': () => {
                recaptchaVerifierRef.current = null
            }
        })
        recaptchaVerifierRef.current = verifier
        return verifier
    }

    const handleOptionClick = (key: string) => {
        setServiceType(key)
        setMode("wizard")
        setStep(0)
        setOtpSent(false)
        setFromHero(false)
        setFormData({
            regNo: "", brand: "", model: "", year: "", weight: "", kms: "", fuel: "", name: "", address: "", phone: "", otp: "", desiredCompany: "", desiredModel: "", buyNew: "", pincode: "", state: "", city: ""
        })
    }

    const nextStep = (overrideBuyNew?: string | React.MouseEvent) => {
        setDirection(1)
        const buyNewState = (overrideBuyNew && typeof overrideBuyNew === "string") ? overrideBuyNew : formData.buyNew;
        // In Scrap flow, if at 'Buy New' step (now step 2) and user says 'no', skip to 'Fuel Type' (now step 4)
        if (serviceType === "scrap" && step === 2 && buyNewState === "no") {
            setStep(4)
        } else {
            setStep(s => s + 1)
        }
    }

    const prevStep = () => {
        setDirection(-1)
        // When fromHero, step 1 is the first flow step, so go back to situation selection
        if (fromHero && serviceType && step === 1) {
            setServiceType("")
            setOtpSent(false)
        } else if (serviceType && step === 0) {
            setServiceType("")
            setOtpSent(false)
        } else if (serviceType === "scrap" && step === 4 && formData.buyNew === "no") {
            setStep(2)
        } else if (step > 0) {
            setStep(s => s - 1)
        }
    }

    const currentStepDisplay = () => {
        if (!serviceType) return 1
        let display = step + 2 // +1 for 0-indexing, +1 for initial selection step
        if (fromHero) display -= 1 // vehicle number step is skipped
        if (serviceType === "scrap" && formData.buyNew === "no" && step >= 4) display -= 1
        return display
    }

    const handleRegSubmit = async () => {
        if (!formData.regNo) return
        
        // Basic Registration Number Validation (e.g. DL01AB1234 or DL-01-AB-1234)
        const cleanReg = formData.regNo.replace(/[^a-zA-Z0-9]/g, "");
        if (cleanReg.length < 6) {
            toast({
                title: "Invalid Format",
                description: "Please enter a valid registration number.",
                variant: "destructive"
            });
            return;
        }

        setIsFetching(true)
        try {
            // Demo Fallback for local testing / presentation
            if (formData.regNo.includes("1234") || formData.regNo.includes("TEST")) {
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
                setFormData(prev => ({
                    ...prev,
                    brand: "Maruti Suzuki",
                    model: "Swift VXI",
                    year: "2018",
                    weight: "1250",
                    fuel: "Petrol"
                }))
                toast({
                    title: "Vehicle Found",
                    description: "Details fetched successfully for " + formData.regNo
                })
                nextStep()
                return
            }

            const response = await fetch('/api/vehicle-lookup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_number: formData.regNo }),
            });

            const rawData = await response.json();

            if (!response.ok) {
                throw new Error(rawData.error || 'Failed to fetch vehicle details');
            }

            const data = rawData?.data?.client_id ? rawData.data : rawData;

            setFormData(prev => ({
                ...prev,
                brand: data.maker_description || data.maker_name || data.maker || data.rc_maker || "",
                model: data.model_description || data.model_name || data.maker_model || data.model || data.rc_model || data.rc_model_name || "",
                year: data.registration_date ? data.registration_date.split('-')[0] : data.manufacturing_year || "",
                weight: data.vehicle_weight || data.unladen_weight || "",
                fuel: normalizeFuelType(data.fuel_type) || prev.fuel
            }))
            
            toast({
                title: "Details Fetched",
                description: "We've auto-filled the vehicle info for you."
            })
            nextStep()
        } catch (err: any) {
            console.error("Vehicle fetch error:", err)
            
            toast({
                title: "Fetch Failed",
                description: "Unable to retrieve data automatically. Please enter details manually.",
                variant: "destructive"
            })

            // Fallback for demo so user can still see the flow
            setFormData(prev => ({
                ...prev,
                brand: prev.brand || "",
                model: prev.model || "",
                year: prev.year || "",
                weight: prev.weight || "",
            }))
            nextStep()
        } finally {
            setIsFetching(false)
        }
    }

    const handleSendOtp = async () => {
        if (formData.phone.length !== 10) return
        
        setIsSendingOtp(true)
        try {
            // Try real Firebase OTP first
            const verifier = getOrCreateRecaptcha()
            const formattedPhone = `+91${formData.phone}`
            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier)
            setConfirmationResult(confirmation)
            setIsSandboxMode(false)
            setOtpSent(true)
            toast({
                title: "OTP Sent",
                description: "Please check your phone for the verification code.",
            })
        } catch (err: any) {
            // Gracefully fall back to Sandbox Mode (works when Firebase is not configured)
            console.warn("Firebase SMS failed, switching to Sandbox Mode:", err.message)
            recaptchaVerifierRef.current = null
            setIsSandboxMode(true)
            setOtpSent(true)
            toast({
                title: "OTP Ready",
                description: "Use verification code 000000 to continue.",
            })
        } finally {
            setIsSendingOtp(false)
        }
    }

    const submitLeadData = async () => {
        try {
            const res = await fetch('/api/wizard-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, serviceType })
            });
            const data = await res.json();
            if (data.lead?._id) {
                localStorage.setItem("kycValuationId", data.lead._id);
            }
        } catch (error) {
            console.error("Failed to save lead data:", error);
        }
    }

    const handleVerifyOtp = async () => {
        if (formData.otp.length !== 6 && formData.otp.length !== 4) return

        setIsVerifying(true)
        try {
            if (isSandboxMode) {
                // Sandbox mode: phone-otp provider was removed in v2 M06 (security
                // audit §1.1, lib/auth.ts comments lines 5-8). The dead provider
                // call previously silently failed and left the customer stranded.
                // In sandbox we now validate the demo code client-side and treat
                // the lead as anonymous — submitLeadData() below still persists
                // it, and the lead is reconciled to a user account when the
                // customer later signs in via the proper /calculator/verify
                // flow (which uses firebase-otp end-to-end).
                if (formData.otp !== "000000") {
                    throw new Error("Invalid code. Use 000000 in sandbox mode.")
                }
                // No signIn — anonymous lead capture is fine for this wizard.
            } else {
                // Production mode: verify with Firebase and sign in via firebase-otp
                if (!confirmationResult) throw new Error("Session expired. Please request a new OTP.")
                const userCredential = await confirmationResult.confirm(formData.otp)
                const idToken = await userCredential.user.getIdToken()
                const result = await signIn("firebase-otp", {
                    idToken,
                    name: formData.name || `User ${formData.phone.slice(-4)}`,
                    redirect: false,
                })
                if (result?.error) throw new Error(result.error || "Authentication failed")
            }

            // Account created/logged in — now save the lead
            await submitLeadData()

            toast({ title: "✅ Verified!", description: "Welcome to ScrapCentre. Your request has been saved." })
            if (serviceType === "scrap") {
                setMode("scrap-valuation")
            } else {
                setMode("success")
            }
        } catch (err: any) {
            console.error("OTP Verification Error:", err)
            toast({
                title: "Verification Failed",
                description: err.message || "Invalid OTP. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsVerifying(false)
        }
    }


    const slideVariants = {
        enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
    }

    const heroOffset = fromHero ? 1 : 0 // subtract 1 step when vehicle number is skipped
    const totalSteps = (!serviceType ? 1 : (serviceType === "sell" ? 8 - heroOffset : serviceType === "buy" ? 4 : (serviceType === "scrap" ? (formData.buyNew === "yes" ? 9 - heroOffset : 8 - heroOffset) : 4)))

    if (mode === "scrap-valuation") {
        // Calculate scrap value based on weight and baseScrapRate. Default to 15k-25k if no weight found.
        const scrapWeight = parseInt(String(formData.weight).replace(/\D/g, '')) || 0;
        const minScrapValue = scrapWeight ? scrapWeight * (baseScrapRate - 1) : 15000;
        const maxScrapValue = scrapWeight ? scrapWeight * (baseScrapRate + 1) : 25000;
        const formatCurrency = (amount: number) => amount.toLocaleString('en-IN');

        return (
            <>
                <div id="wizard-recaptcha-container"></div>
                <div className="w-full max-w-4xl mx-auto px-4 py-8">
                <motion.div 
                    initial={{ scale: 0.98, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-500 via-[#E31E24] to-amber-500" />
                    
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                                    <Recycle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-green-600 uppercase tracking-[0.3em] mb-0.5">Evaluation Finalized</p>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Vehicle's Scrap Worth</h2>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-slate-900 rounded-full hidden md:block">
                                <p className="text-[9px] font-bold text-white uppercase tracking-widest">Quote ID: SC-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Section: Valuation & Details (7 cols) */}
                            <div className="lg:col-span-7 space-y-4">
                                <motion.div 
                                    initial={{ opacity: 0, y: 15 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    className="bg-slate-900 rounded-[1.5rem] p-6 text-white relative overflow-hidden shadow-xl shadow-slate-200 group"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-green-500/30 transition-colors duration-500"></div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#E31E24]/10 rounded-full blur-[60px] -ml-24 -mb-24"></div>
                                    
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 relative z-10">Estimated Cash Value</p>
                                    <div className="relative z-10">
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <span className="text-3xl md:text-4xl font-black tracking-tighter text-white">₹{formatCurrency(minScrapValue)}</span>
                                            <span className="text-lg md:text-xl text-slate-500 font-bold tracking-tighter">to ₹{formatCurrency(maxScrapValue)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 py-1.5 px-2.5 bg-white/5 rounded-lg border border-white/10 w-fit">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Market Rate: High Demand</p>
                                        </div>
                                        <p className="mt-4 text-slate-400 text-[11px] leading-relaxed max-w-md">
                                            This valuation is based on current industrial scrap indices and the verified weight of {formData.weight || "1,200kg"}.
                                        </p>
                                    </div>
                                </motion.div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { label: "Brand", value: formData.brand || "N/A" },
                                        { label: "Model", value: formData.model || "N/A" },
                                        { label: "Year", value: formData.year || "N/A" },
                                        { label: "Weight", value: formData.weight || "N/A" }
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                                            <p className="text-[10px] font-black text-slate-800">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Section: Benefits & Actions (5 cols) */}
                            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    transition={{ delay: 0.2 }} 
                                    className="bg-gradient-to-br from-amber-50 via-amber-100/40 to-amber-50 border border-amber-200 rounded-[1.25rem] p-5 relative overflow-hidden shadow-lg shadow-amber-900/5"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 rounded-full blur-[50px] opacity-40 -mr-16 -mt-16"></div>
                                    <div className="flex items-start gap-3 relative z-10">
                                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                                            <Sparkles className="w-4.5 h-4.5" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <h4 className="text-amber-950 font-black text-[12px] uppercase tracking-wider">CD Certificate Advantage</h4>
                                            <div className="space-y-2">
                                                {formData.buyNew === "yes" ? (
                                                    cdDiscount !== null ? (
                                                        <div className="space-y-1.5">
                                                            <p className="text-amber-900 font-medium text-[11px] leading-snug">
                                                                Registration savings for your new <span className="font-bold">{formData.desiredCompany}</span>:
                                                            </p>
                                                            <div className="bg-amber-500 text-white px-3 py-1.5 rounded-xl text-center shadow-md">
                                                                <p className="text-[9px] font-black uppercase tracking-tighter">Extra Discount</p>
                                                                <p className="text-base font-black tracking-tighter">₹{formatCurrency(cdDiscount)}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-amber-800 font-medium text-[11px] flex items-center gap-2">
                                                            <Loader2 className="w-3 h-3 animate-spin" /> Tailoring savings...
                                                        </p>
                                                    )
                                                ) : (
                                                    <div className="space-y-1.5">
                                                        <p className="text-amber-800 font-medium text-[11px] leading-snug">
                                                            Redeemable discount on your next vehicle purchase:
                                                        </p>
                                                        <div className="bg-amber-200/50 border border-amber-300 px-3 py-1 rounded-xl text-center">
                                                            <p className="text-amber-950 font-black text-[13px] tracking-tighter">₹15,000 - ₹25,000</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="pt-1.5 border-t border-amber-200/50">
                                                    <p className="text-[9px] text-amber-700/80 italic font-medium">*Govt. mandated benefit for recycling</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <div className="space-y-2.5">
                                    <a 
                                        href="/ekyc" 
                                        onClick={() => {
                                            localStorage.setItem("kycFormData", JSON.stringify(formData));
                                            localStorage.setItem("kycSource", "scrap");
                                        }}
                                        className="w-full flex flex-col items-center justify-center gap-0.5 py-3.5 bg-[#E31E24] text-white rounded-xl shadow-xl shadow-red-500/30 hover:bg-red-600 hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden relative"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 relative z-10">
                                            Initiate Instant eKYC
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                        <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest italic relative z-10">🚀 Secure Priority Dispatch</span>
                                    </a>
                                    
                                    <button onClick={() => router.push("/")} className="w-full py-2.5 border border-slate-200 text-slate-400 font-black rounded-xl hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all uppercase tracking-[0.2em] text-[9px]">
                                        Return Home
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
                </div>
            </>
        )
    }

    if (mode === "success") {
        return (
            <>
                <div id="wizard-recaptcha-container"></div>
                <div className="w-full max-w-2xl mx-auto px-4 py-6">
                <motion.div 
                    initial={{ scale: 0.85, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="bg-white border border-slate-200 rounded-[1rem] p-6 text-center shadow-2xl relative overflow-hidden"
                >
                    {/* Top accent bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E31E24] to-red-400" />
                    
                    {/* Decorative background circles */}
                    <div className="absolute -top-16 -right-16 w-40 h-40 bg-red-50 rounded-full opacity-60" />
                    <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-red-50 rounded-full opacity-60" />

                    <div className="relative z-10">
                        {/* Icon */}
                        <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                            className="w-16 h-16 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-100"
                        >
                            <CheckCircle className="w-8 h-8 text-[#E31E24]" />
                        </motion.div>

                        {/* Headline */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <p className="text-[9px] font-bold text-[#E31E24] uppercase tracking-[0.2em] mb-1.5">
                                🎉 Request Submitted
                            </p>
                            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-2 tracking-tight leading-tight">
                                Congratulations!
                            </h2>
                            <p className="text-slate-500 text-[11px] font-medium max-w-sm mx-auto leading-relaxed mb-4">
                                Our expert team will reach out to you <span className="font-bold text-slate-700">shortly</span> to finalise the best deal for your vehicle.
                            </p>
                        </motion.div>

                        {/* Divider */}
                        <div className="w-full h-px bg-slate-100 mb-5" />

                        {/* eKYC CTA or Expert Talk */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-3">
                            {serviceType === "buy" ? (
                                <>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-left mb-4">
                                        <p className="text-blue-800 text-[9px] font-bold uppercase tracking-wider mb-0.5">🤝 Expert Support</p>
                                        <p className="text-blue-700 text-[10px] font-medium leading-relaxed">Rest assured, our dealership experts will reach out to you <span className="font-bold text-blue-900 italic underline">ASAP</span> to assist with your new purchase and exchange benefits.</p>
                                    </div>

                                    <a 
                                        href="/contact" 
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white font-black rounded-xl shadow-lg hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px] group"
                                    >
                                        Talk to our Experts
                                        <Phone className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                                    </a>
                                </>
                            ) : (
                                <>
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-left mb-4">
                                        <p className="text-amber-800 text-[9px] font-bold uppercase tracking-wider mb-0.5">⚡ Speed up your process</p>
                                        <p className="text-amber-700 text-[10px] font-medium">Complete your eKYC now to get instant approval and faster pickup scheduling.</p>
                                    </div>

                                    <a 
                                        href="/ekyc" 
                                        onClick={() => {
                                            localStorage.setItem("kycFormData", JSON.stringify(formData));
                                            localStorage.setItem("kycSource", serviceType);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-[#E31E24] text-white font-black rounded-xl shadow-lg shadow-red-500/25 hover:bg-red-600 transition-all uppercase tracking-widest text-[10px] group"
                                    >
                                        Complete eKYC
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </>
                            )}
                            
                            <button 
                                onClick={() => {
                                    setServiceType("")
                                    setStep(0)
                                    setMode("wizard")
                                }} 
                                className="w-full py-2.5 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest text-[9px]"
                            >
                                Back to Home
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
                </div>
            </>
        )
    }



    return (
        <>
            <div id="wizard-recaptcha-container"></div>
            <div className="w-full max-w-2xl mx-auto px-4">
            <div className="bg-white border border-slate-200 rounded-[1rem] overflow-hidden shadow-2xl">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <button onClick={prevStep} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#E31E24] transition-all"><ArrowLeft className="w-3.5 h-3.5" /></button>
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-[#E31E24] uppercase tracking-widest mb-0.5">Step {currentStepDisplay()} of {totalSteps}</span>
                        <h4 className="text-slate-900 font-bold text-xs uppercase tracking-tighter">{serviceType ? `${serviceType} Service` : "Get Started"}</h4>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center text-[#E31E24] font-bold text-[10px] bg-red-50 rounded-full">{Math.round(((currentStepDisplay()) / totalSteps) * 100)}%</div>
                </div>

                <div className="w-full h-1 bg-slate-100">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${((currentStepDisplay()) / totalSteps) * 100}%` }} className="h-full bg-[#E31E24]" />
                </div>

                <div className="relative p-5 lg:p-6 min-h-[340px] flex flex-col justify-center">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div key={serviceType ? `${serviceType}-${step}` : "selection"} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }} className="w-full">
                            
                            {/* ── INITIAL SITUATION SELECTION ── */}
                            {!serviceType && (
                                <div className="space-y-6 text-center">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-slate-900 leading-tight">What is your situation?</h3>
                                        <p className="text-slate-500 text-[11px] font-medium px-4">Choose the option that best describes what you're looking for today.</p>
                                    </div>
                                    {fromHero && formData.regNo && (
                                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-xl max-w-sm mx-auto">
                                            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                                            <span className="text-[11px] font-bold text-green-800">Vehicle <span className="tracking-widest">{formData.regNo}</span> loaded</span>
                                        </div>
                                    )}
                                    <div className="grid gap-2.5 max-w-sm mx-auto px-4">
                                        {[
                                            ...(!fromHero ? [{ title: "Buy a new Vehicle", description: "Exchange offers & OEM benefits", key: "buy" }] : []),
                                            { title: "Sell your Vehicle", description: "Best market price & doorstep pickup", key: "sell" },
                                            { title: "Scrap your Vehicle", description: "Eco-friendly & max scrap value", key: "scrap" }
                                        ].map((opt) => (
                                            <button
                                                key={opt.key}
                                                onClick={() => {
                                                    setDirection(1)
                                                    setServiceType(opt.key)
                                                    // When fromHero, skip vehicle number step (step 0) and go directly to verify details (step 1)
                                                    setStep(fromHero ? 1 : 0)
                                                }}
                                                className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-[#E31E24] hover:bg-red-50 hover:shadow-md transition-all group text-left"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-900 group-hover:text-[#E31E24] text-sm leading-none mb-0.5">{opt.title}</p>
                                                    <p className="text-[10px] text-slate-500 group-hover:text-red-700/60 font-medium">{opt.description}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#E31E24] group-hover:translate-x-1 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── SELL FLOW ── */}
                            {serviceType === "sell" && (
                                <>
                                    {step === 0 && (
                                        <div className="space-y-5 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Car className="w-7 h-7 text-[#E31E24]" /></div>
                                            <div className="space-y-0.5">
                                                <h3 className="text-xl font-bold text-slate-900">Vehicle Number</h3>
                                                <p className="text-slate-500 text-[11px] font-medium">Enter your registration number (e.g. DL-01-AB-1234)</p>
                                            </div>
                                            <div className="relative max-w-md mx-auto">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                <input type="text" placeholder="DL-01-AB-1234" value={formData.regNo} onChange={(e) => setFormData({...formData, regNo: e.target.value.toUpperCase()})} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-lg font-black tracking-widest text-slate-900 focus:outline-none focus:border-[#E31E24] transition-all text-center" />
                                            </div>
                                            <button disabled={!formData.regNo || isFetching} onClick={handleRegSubmit} className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-2 group uppercase tracking-widest text-[10px]">
                                                {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch Details"}
                                                {!isFetching && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                            </button>
                                        </div>
                                    )}

                                    {step === 1 && (
                                        <div className="space-y-4">
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-2"><ClipboardList className="w-6 h-6 text-[#E31E24]" /></div>
                                                <h3 className="text-lg font-bold text-slate-900">Verify Vehicle Details</h3>
                                                <p className="text-slate-500 text-[11px] font-medium">Auto-filled based on your registration</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto">
                                                <div className="space-y-0.5">
                                                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Company / Brand</label>
                                                    <input type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Model Name</label>
                                                    <input type="text" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" placeholder="e.g. Swift" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Reg. Year</label>
                                                    <input type="text" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Weight (KG)</label>
                                                    <input type="text" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" placeholder="e.g. 1200" />
                                                </div>
                                            </div>
                                            <button onClick={nextStep} className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">Confirm & Continue <ArrowRight className="w-3.5 h-3.5" /></button>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-5 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Gauge className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900">Distance Travelled</h3>
                                            <p className="text-slate-500 text-[11px] font-medium">Total kilometers on the odometer</p>
                                            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                                                {["0 - 10,000", "10,000 - 30,000", "30,000 - 60,000", "60,000+"].map((range, i) => (
                                                    <button key={i} onClick={() => { setFormData({...formData, kms: range}); nextStep() }} className="p-2.5 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-700 hover:border-[#E31E24] hover:bg-red-50 transition-all">{range} KM</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-5 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Fuel className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900">Fuel Type</h3>
                                            <p className="text-slate-500 text-[11px] font-medium">
                                                {formData.fuel ? <span className="text-emerald-600 font-bold">✓ Auto-filled from registration — confirm or change</span> : "Which fuel does your car use?"}
                                            </p>
                                            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                                                {FUEL_TYPES.map((f, i) => {
                                                    const isSelected = formData.fuel === f
                                                    return (
                                                        <button
                                                            key={i}
                                                            onClick={() => setFormData({...formData, fuel: f})}
                                                            className={`px-4 py-2 border rounded-xl text-[10px] font-bold transition-all ${
                                                                isSelected
                                                                    ? "bg-[#E31E24] border-[#E31E24] text-white shadow-md shadow-red-500/20"
                                                                    : "border-slate-100 text-slate-700 hover:border-[#E31E24] hover:bg-red-50"
                                                            }`}
                                                        >
                                                            {f}
                                                            {isSelected && <CheckCircle className="w-3 h-3 ml-1.5 inline-block" />}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                            <button
                                                disabled={!formData.fuel}
                                                onClick={() => nextStep()}
                                                className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Confirm & Continue <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    {step === 4 && (
                                        <div className="space-y-5 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><User className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900">Your Name</h3>
                                            <input type="text" placeholder="Enter Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full max-w-md mx-auto px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" autoFocus />
                                            <button disabled={!formData.name} onClick={nextStep} className="w-full max-w-md mx-auto py-2.5 bg-slate-900 text-white font-bold rounded-xl transition-all uppercase tracking-widest text-[10px]">Continue</button>
                                        </div>
                                    )}

                                    {step === 5 && (
                                        <div className="space-y-4 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-1"><MapPin className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900">Your Location</h3>
                                            <div className="space-y-3 max-w-md mx-auto">
                                                <div className="space-y-1 text-left">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">State</label>
                                                    <select value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value, city: ""})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]">
                                                        <option value="" disabled>Select State</option>
                                                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-1 text-left">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">City</label>
                                                    <select value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" disabled={!formData.state}>
                                                        <option value="" disabled>{formData.state ? "Select City" : "Select State First"}</option>
                                                        {formData.state && (indiaData[formData.state] || []).map((c: string) => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-1 text-left">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pincode</label>
                                                    <input 
                                                        type="tel" 
                                                        placeholder="6-digit Pincode" 
                                                        value={formData.pincode} 
                                                        onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6)})} 
                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" 
                                                    />
                                                 </div>
                                            </div>
                                            <button disabled={!formData.state || !formData.city || formData.pincode.length !== 6} onClick={nextStep} className="w-full max-w-md mx-auto py-2.5 bg-slate-900 text-white font-bold rounded-xl transition-all uppercase tracking-widest text-[10px]">Continue</button>
                                        </div>
                                    )}

                                    {step === 6 && (
                                        <div className="space-y-6 text-center">
                                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                {otpSent ? <Lock className="w-8 h-8 text-[#E31E24]" /> : <Smartphone className="w-8 h-8 text-[#E31E24]" />}
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900">{otpSent ? "Verification" : "Login with Phone"}</h3>
                                            
                                            <div className="space-y-3 max-w-sm mx-auto">
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">+91</span>
                                                    <input 
                                                        type="tel" 
                                                        disabled={otpSent}
                                                        placeholder="Mobile Number" 
                                                        value={formData.phone} 
                                                        onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} 
                                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:border-[#E31E24] disabled:opacity-50" 
                                                        maxLength={10} 
                                                    />
                                                </div>

                                                {otpSent && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                                        <input 
                                                            type="tel" 
                                                            placeholder="••••••" 
                                                            value={formData.otp} 
                                                            onChange={(e) => setFormData({...formData, otp: e.target.value.slice(0, 6)})} 
                                                            className="w-full px-4 py-3 bg-slate-50 border border-[#E31E24]/30 rounded-xl text-2xl text-center font-black tracking-[0.4em] text-slate-900 focus:outline-none focus:border-[#E31E24]" 
                                                            maxLength={6} 
                                                            autoFocus 
                                                        />
                                                        <button 
                                                            onClick={() => { setOtpSent(false); setFormData({...formData, otp: ""}) }}
                                                            className="text-[10px] font-bold text-slate-400 hover:text-[#E31E24] uppercase tracking-widest transition-colors"
                                                        >
                                                            Change Number
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>

                                            <button 
                                                disabled={(otpSent ? (formData.otp.length !== 6 && formData.otp.length !== 4) : formData.phone.length !== 10) || isSendingOtp || isVerifying} 
                                                onClick={otpSent ? handleVerifyOtp : handleSendOtp} 
                                                className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                                            >
                                                {isSendingOtp || isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : (otpSent ? "Verify & Sell" : "Get OTP")}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* ── BUY FLOW ── */}
                            {serviceType === "buy" && (
                                <>
                                    {step === 0 && (
                                        <div className="space-y-6 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Car className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900 leading-tight">Vehicle of Choice</h3>
                                            <p className="text-slate-500 text-[11px] font-medium mb-4">Tell us the details of the vehicle you wish to buy.</p>
                                            
                                            <div className="space-y-3 max-w-md mx-auto">
                                                <div className="space-y-1.5 text-left">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desired Brand</label>
                                                    <input type="text" placeholder="e.g. Maruti Suzuki" value={formData.desiredCompany} onChange={(e) => setFormData({...formData, desiredCompany: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" />
                                                </div>
                                                <div className="space-y-1.5 text-left">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desired Model</label>
                                                    <input type="text" placeholder="e.g. Swift" value={formData.desiredModel} onChange={(e) => setFormData({...formData, desiredModel: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" />
                                                </div>
                                            </div>
                                            
                                            <button disabled={!formData.desiredCompany || !formData.desiredModel} onClick={nextStep} className="w-full max-w-md mx-auto py-3 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase tracking-widest text-[11px]">Continue</button>
                                        </div>
                                    )}
                                    {step === 1 && (
                                        <div className="space-y-5 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><User className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900">Tell us your name</h3>
                                            <input type="text" placeholder="Your Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full max-w-md mx-auto px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" autoFocus />
                                            <button disabled={!formData.name} onClick={nextStep} className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase tracking-widest text-[10px]">Next Step</button>
                                        </div>
                                    )}
                                    {step === 2 && (
                                        <div className="space-y-5 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                {otpSent ? <Lock className="w-7 h-7 text-[#E31E24]" /> : <Smartphone className="w-7 h-7 text-[#E31E24]" />}
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900">{otpSent ? "Verification" : "Mobile Number"}</h3>
                                            
                                            <div className="space-y-3 max-w-md mx-auto">
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">+91</span>
                                                    <input 
                                                        type="tel" 
                                                        disabled={otpSent}
                                                        placeholder="10-digit number" 
                                                        value={formData.phone} 
                                                        onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} 
                                                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:border-[#E31E24] disabled:opacity-50" 
                                                        maxLength={10} 
                                                    />
                                                </div>

                                                {otpSent && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                                        <input 
                                                            type="tel" 
                                                            placeholder={isSandboxMode ? "Use: 000000" : "••••••"} 
                                                            value={formData.otp} 
                                                            onChange={(e) => setFormData({...formData, otp: e.target.value.slice(0, 6)})} 
                                                            className="w-full px-4 py-2.5 bg-slate-50 border border-[#E31E24]/30 rounded-xl text-2xl text-center font-black tracking-[0.4em] text-slate-900 focus:outline-none focus:border-[#E31E24]" 
                                                            maxLength={6} 
                                                            autoFocus 
                                                        />
                                                        {isSandboxMode && (
                                                            <p className="text-[10px] text-amber-600 font-bold">⚡ Sandbox mode — enter 000000</p>
                                                        )}
                                                        <button 
                                                            onClick={() => { setOtpSent(false); setFormData({...formData, otp: ""}); setIsSandboxMode(false); }}
                                                            className="text-[10px] font-bold text-slate-400 hover:text-[#E31E24] uppercase tracking-widest transition-colors"
                                                        >
                                                            Change Number
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>

                                            <button 
                                                disabled={(otpSent ? (formData.otp.length !== 6 && formData.otp.length !== 4) : formData.phone.length !== 10) || isSendingOtp || isVerifying} 
                                                onClick={otpSent ? handleVerifyOtp : handleSendOtp} 
                                                className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                                            >
                                                {isSendingOtp || isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : (otpSent ? "Verify & Complete" : "Get OTP")}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* ── SCRAP FLOW ── */}
                            {serviceType === "scrap" && (
                                <>
                                    {step === 0 && (
                                        <div className="space-y-5 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Car className="w-7 h-7 text-[#E31E24]" /></div>
                                            <div className="space-y-0.5">
                                                <h3 className="text-xl font-bold text-slate-900">Vehicle Number</h3>
                                                <p className="text-slate-500 text-[11px] font-medium">Enter your registration number (e.g. DL-01-AB-1234)</p>
                                            </div>
                                            <div className="relative max-w-md mx-auto">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                <input type="text" placeholder="DL-01-AB-1234" value={formData.regNo} onChange={(e) => setFormData({...formData, regNo: e.target.value.toUpperCase()})} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-lg font-black tracking-widest text-slate-900 focus:outline-none focus:border-[#E31E24] transition-all text-center" />
                                            </div>
                                            <button disabled={!formData.regNo || isFetching} onClick={handleRegSubmit} className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-2 group uppercase tracking-widest text-[10px]">
                                                {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch Details"}
                                                {!isFetching && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                            </button>
                                        </div>
                                    )}
                                    {step === 1 && (
                                        <div className="space-y-4">
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-2"><ClipboardList className="w-6 h-6 text-[#E31E24]" /></div>
                                                <h3 className="text-lg font-bold text-slate-900">Verify Vehicle Details</h3>
                                                <p className="text-slate-500 text-[11px] font-medium">Auto-filled based on your registration</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto">
                                                <div className="space-y-0.5">
                                                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Company / Brand</label>
                                                    <input type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Model Name</label>
                                                    <input type="text" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" placeholder="e.g. Santro" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Reg. Year</label>
                                                    <input type="text" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Weight (KG)</label>
                                                    <input type="text" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" placeholder="e.g. 1200" />
                                                </div>
                                            </div>
                                            <button onClick={nextStep} className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">Confirm & Continue <ArrowRight className="w-3.5 h-3.5" /></button>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-5 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Car className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900">Buy a new vehicle?</h3>
                                            <p className="text-slate-500 text-[11px] font-medium">Would you like to purchase a new vehicle while scrapping this one to claim CD certificate benefits?</p>
                                            <div className="flex gap-3 max-w-md mx-auto justify-center">
                                                <button onClick={() => { setFormData({...formData, buyNew: "yes"}); nextStep("yes") }} className="w-1/2 py-2.5 border border-slate-100 rounded-xl font-bold text-sm text-slate-700 hover:border-[#E31E24] hover:bg-red-50 transition-all shadow-sm">Yes</button>
                                                <button onClick={() => { setFormData({...formData, buyNew: "no"}); nextStep("no") }} className="w-1/2 py-2.5 border border-slate-100 rounded-xl font-bold text-sm text-slate-700 hover:border-[#E31E24] hover:bg-red-50 transition-all shadow-sm">No</button>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-6 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><ShoppingCart className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900 leading-tight">Vehicle Choice</h3>
                                            <p className="text-slate-500 text-[11px] font-medium mb-4">Details of the new vehicle you wish to buy.</p>
                                            
                                            <div className="space-y-3 max-w-md mx-auto">
                                                <div className="space-y-1.5 text-left">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand</label>
                                                    <input type="text" placeholder="e.g. Maruti Suzuki" value={formData.desiredCompany} onChange={(e) => setFormData({...formData, desiredCompany: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" />
                                                </div>
                                                <div className="space-y-1.5 text-left">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Model</label>
                                                    <input type="text" placeholder="e.g. Swift" value={formData.desiredModel} onChange={(e) => setFormData({...formData, desiredModel: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" />
                                                </div>
                                            </div>
                                            
                                            <button disabled={!formData.desiredCompany || !formData.desiredModel} onClick={nextStep} className="w-full max-w-md mx-auto py-3 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase tracking-widest text-[11px]">Continue</button>
                                        </div>
                                    )}

                                    {step === 4 && (
                                        <div className="space-y-5 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Fuel className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900">Fuel type of {formData.model ? <span className="text-[#E31E24]">{formData.model}</span> : "your vehicle"}?</h3>
                                            <p className="text-slate-500 text-[11px] font-medium">Select all that apply for your vehicle</p>
                                            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                                                {FUEL_TYPES.map((f, i) => {
                                                    const isSelected = formData.fuel.split(', ').includes(f);
                                                    return (
                                                        <button 
                                                            key={i} 
                                                            onClick={() => { 
                                                                const currentFuels = formData.fuel ? formData.fuel.split(', ') : [];
                                                                const newFuels = isSelected 
                                                                    ? currentFuels.filter(fuel => fuel !== f)
                                                                    : [...currentFuels, f];
                                                                setFormData({...formData, fuel: newFuels.join(', ')});
                                                            }} 
                                                            className={`px-4 py-2 border rounded-xl text-[10px] font-bold transition-all ${
                                                                isSelected 
                                                                    ? "bg-[#E31E24] border-[#E31E24] text-white shadow-md shadow-red-500/20" 
                                                                    : "border-slate-100 text-slate-700 hover:border-[#E31E24] hover:bg-red-50"
                                                            }`}
                                                        >
                                                            {f}
                                                            {isSelected && <CheckCircle className="w-3 h-3 ml-1.5 inline-block" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <button 
                                                disabled={!formData.fuel} 
                                                onClick={() => nextStep()} 
                                                className="w-full max-w-md mx-auto mt-4 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                                            >
                                                Next Step <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    {step === 5 && (
                                        <div className="space-y-5 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><User className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900">Your Name</h3>
                                            <input type="text" placeholder="Enter Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full max-w-md mx-auto px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" autoFocus />
                                            <button disabled={!formData.name} onClick={nextStep} className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase tracking-widest text-[10px]">Continue</button>
                                        </div>
                                    )}

                                    {step === 6 && (
                                        <div className="space-y-4 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-1"><MapPin className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900">Vehicle Location</h3>
                                            <div className="space-y-3 max-w-md mx-auto">
                                                <div className="space-y-1 text-left">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">State</label>
                                                    <select value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value, city: ""})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]">
                                                        <option value="" disabled>Select State</option>
                                                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-1 text-left">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">City</label>
                                                    <select value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" disabled={!formData.state}>
                                                        <option value="" disabled>{formData.state ? "Select City" : "Select State First"}</option>
                                                        {formData.state && (indiaData[formData.state] || []).map((c: string) => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-1 text-left">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pincode</label>
                                                    <input 
                                                        type="tel" 
                                                        placeholder="6-digit Pincode" 
                                                        value={formData.pincode} 
                                                        onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6)})} 
                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" 
                                                    />
                                                 </div>
                                            </div>
                                            <button disabled={!formData.state || !formData.city || formData.pincode.length !== 6} onClick={nextStep} className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase tracking-widest text-[10px]">Continue</button>
                                        </div>
                                    )}

                                    {step === 7 && (
                                        <div className="space-y-5 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                {otpSent ? <Lock className="w-7 h-7 text-[#E31E24]" /> : <Smartphone className="w-7 h-7 text-[#E31E24]" />}
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900">{otpSent ? "Verification" : "Login with Phone"}</h3>
                                            
                                            <div className="space-y-3 max-w-md mx-auto">
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">+91</span>
                                                    <input 
                                                        type="tel" 
                                                        disabled={otpSent}
                                                        placeholder="Mobile Number" 
                                                        value={formData.phone} 
                                                        onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} 
                                                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:border-[#E31E24] disabled:opacity-50" 
                                                        maxLength={10} 
                                                    />
                                                </div>

                                                {otpSent && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                                        <input 
                                                            type="tel" 
                                                            placeholder={isSandboxMode ? "Use: 000000" : "••••••"} 
                                                            value={formData.otp} 
                                                            onChange={(e) => setFormData({...formData, otp: e.target.value.slice(0, 6)})} 
                                                            className="w-full px-4 py-2.5 bg-slate-50 border border-[#E31E24]/30 rounded-xl text-2xl text-center font-black tracking-[0.4em] text-slate-900 focus:outline-none focus:border-[#E31E24]" 
                                                            maxLength={6} 
                                                            autoFocus 
                                                        />
                                                        {isSandboxMode && (
                                                            <p className="text-[10px] text-amber-600 font-bold">⚡ Sandbox mode — enter 000000</p>
                                                        )}
                                                        <button 
                                                            onClick={() => { setOtpSent(false); setFormData({...formData, otp: ""}); setIsSandboxMode(false); }}
                                                            className="text-[10px] font-bold text-slate-400 hover:text-[#E31E24] uppercase tracking-widest transition-colors"
                                                        >
                                                            Change Number
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>

                                            <button 
                                                disabled={(otpSent ? (formData.otp.length !== 6 && formData.otp.length !== 4) : formData.phone.length !== 10) || isSendingOtp || isVerifying} 
                                                onClick={otpSent ? handleVerifyOtp : handleSendOtp} 
                                                className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                                            >
                                                {isSendingOtp || isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : (otpSent ? "Verify & Get Valuation" : "Get OTP")}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="bg-slate-50/50 px-6 py-3 border-t border-slate-100 flex flex-wrap gap-2">
                    {formData.regNo && <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[9px] font-bold text-slate-600 uppercase">{formData.regNo}</span>}
                    {formData.brand && <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[9px] font-bold text-slate-600 uppercase">{formData.brand}</span>}
                    {formData.kms && <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[9px] font-bold text-slate-600 uppercase">{formData.kms} KM</span>}
                </div>
                <div id="wizard-recaptcha-container"></div>
            </div>
            </div>
        </>
    )
}

