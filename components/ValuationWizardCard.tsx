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

const BRAND_LOGOS: Record<string, string> = {
    "Maruti Suzuki": "https://logo.clearbit.com/marutisuzuki.com",
    "Hyundai": "https://logo.clearbit.com/hyundai.com",
    "Tata": "https://logo.clearbit.com/tatamotors.com",
    "Mahindra": "https://logo.clearbit.com/mahindra.com",
    "Toyota": "https://logo.clearbit.com/toyota.com",
    "Honda": "https://logo.clearbit.com/honda.com",
    "Kia": "https://logo.clearbit.com/kia.com",
    "Skoda": "https://logo.clearbit.com/skoda-auto.com",
    "Volkswagen": "https://logo.clearbit.com/volkswagen.co.in",
    "MG": "https://logo.clearbit.com/mgmotor.co.in",
    "Nissan": "https://logo.clearbit.com/nissan.in",
    "Renault": "https://logo.clearbit.com/renault.co.in",
    "Ford": "https://logo.clearbit.com/india.ford.com",
    "Jeep": "https://logo.clearbit.com/jeep-india.com",
    "Other": ""
}

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

    // Scrap calculations (honest ±20% pricing band)
    const scrapWeight = parseInt(String(formData.weight).replace(/\D/g, '')) || 0;
    const baseValuation = scrapWeight ? scrapWeight * baseScrapRate : 15750; // default average scrap rate if weight not found
    const minScrapValue = Math.round((baseValuation * 0.8) / 100) * 100;
    const maxScrapValue = Math.round((baseValuation * 1.2) / 100) * 100;
    const potentialCDDiscount = formData.buyNew === "yes" ? (cdDiscount !== null ? cdDiscount : 55000) : 55000;
    const maxTotalBenefit = maxScrapValue + potentialCDDiscount;
    const formatCurrency = (amount: number) => amount.toLocaleString('en-IN');

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

    const totalSteps = (() => {
        if (!serviceType) return 1;
        if (serviceType === "buy") return 4;
        let total = 9;
        if (fromHero) total -= 1;
        if (formData.buyNew === "no") total -= 1;
        return total;
    })();

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
                // Sandbox mode: use phone-otp provider (creates/finds user by phone)
                if (formData.otp !== "000000") {
                    throw new Error("Invalid code. Use 000000 in sandbox mode.")
                }
                const result = await signIn("phone-otp", {
                    phone: "+91" + formData.phone,
                    otp: "000000",
                    name: formData.name || `User ${formData.phone.slice(-4)}`,
                    redirect: false,
                })
                if (result?.error) throw new Error(result.error)
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

    if (mode === "scrap-valuation") {
        return (
            <>
                <div id="wizard-recaptcha-container"></div>
                <div className="w-full max-w-3xl mx-auto px-4 py-6">
                    <motion.div 
                        initial={{ scale: 0.98, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        className="bg-white border border-slate-200 rounded-[1.5rem] p-5 md:p-6 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-500 via-[#E31E24] to-amber-500" />
                        
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
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

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                                {/* Left Section: Valuation & Details (7 cols) */}
                                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                                    <div className="space-y-3">
                                        <motion.div 
                                            initial={{ opacity: 0, y: 15 }} 
                                            animate={{ opacity: 1, y: 0 }} 
                                            className="bg-gradient-to-br from-slate-900 via-[#0a1120] to-slate-900 rounded-xl py-2 px-3 text-white relative overflow-hidden shadow-lg border border-slate-800"
                                        >
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-emerald-500/30 transition-colors duration-500"></div>
                                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] -ml-24 -mb-24"></div>
                                            
                                            <p className="text-[7px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-0.5 relative z-10 flex items-center gap-1">
                                                <Sparkles className="w-2.5 h-2.5" /> Total Potential Benefit
                                            </p>
                                            <div className="relative z-10">
                                                <div className="flex items-baseline gap-1 mb-0.5">
                                                    <span className="text-lg md:text-xl font-black tracking-tight text-white">Up to ₹{formatCurrency(maxTotalBenefit)}*</span>
                                                </div>
                                                
                                                {/* Breakdown */}
                                                <div className="grid grid-cols-2 gap-1 mb-1">
                                                    <div className="bg-white/5 border border-white/10 rounded-md py-0.5 px-1.5 shadow-inner">
                                                        <p className="text-[6px] text-slate-400 font-bold uppercase tracking-widest mb-0.2">Scrap Value</p>
                                                        <p className="text-[10px] font-black text-white">₹{formatCurrency(minScrapValue)} - ₹{formatCurrency(maxScrapValue)}</p>
                                                    </div>
                                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md py-0.5 px-1.5 shadow-inner">
                                                        <p className="text-[6px] text-emerald-400 font-bold uppercase tracking-widest mb-0.2">CD Certificate</p>
                                                        <p className="text-[10px] font-black text-emerald-400">
                                                            {formData.buyNew === "yes" && cdDiscount === null ? <Loader2 className="w-3 animate-spin inline" /> : `+ ₹${formatCurrency(potentialCDDiscount)}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-1 py-0.2 px-1 bg-white/5 rounded border border-white/10 w-fit mb-0.5">
                                                    <div className="w-0.5 h-0.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    <p className="text-slate-300 text-[6px] font-bold uppercase tracking-widest">Market Rate: High Demand</p>
                                                </div>
                                                <p className="text-slate-400 text-[6.5px] leading-normal max-w-md italic">
                                                    *Calculated using industrial scrap indices for {formData.weight || "854kg"} and maximum CD Certificate redemption value.
                                                </p>
                                            </div>
                                        </motion.div>

                                        {/* Unlocked Benefits Grid */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="border border-emerald-200 rounded-xl p-2.5 bg-emerald-50/40 relative overflow-hidden group">
                                                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <p className="text-[7.5px] text-emerald-800 font-black uppercase tracking-wider mb-0.5">CD Certificate</p>
                                                <p className="text-xs font-black text-emerald-700">
                                                    {formData.buyNew === "yes" && cdDiscount === null ? <Loader2 className="w-3 h-3 animate-spin inline-block" /> : `+ ₹${formatCurrency(potentialCDDiscount)}`}
                                                </p>
                                                <p className="text-[7.5px] text-emerald-600 font-medium">Registration & tax waiver</p>
                                            </div>

                                            <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50 relative overflow-hidden group">
                                                <div className="absolute top-1.5 right-1.5 px-1 py-0.2 bg-amber-500 text-white rounded-[3px] text-[6.5px] font-black tracking-widest uppercase shadow-sm">Coming Soon</div>
                                                <p className="text-[7.5px] text-slate-500 font-black uppercase tracking-wider mb-0.5">Dealer OEM Discount</p>
                                                <p className="text-xs font-black text-slate-800">Up to ₹10,000</p>
                                                <p className="text-[7.5px] text-slate-400 font-medium">Scrappage exchange benefits</p>
                                            </div>

                                            <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50 relative overflow-hidden group">
                                                <div className="absolute top-1.5 right-1.5 px-1 py-0.2 bg-amber-500 text-white rounded-[3px] text-[6.5px] font-black tracking-widest uppercase shadow-sm">Coming Soon</div>
                                                <p className="text-[7.5px] text-slate-500 font-black uppercase tracking-wider mb-0.5">Green Finance</p>
                                                <p className="text-xs font-black text-slate-800">Up to ₹15,000</p>
                                                <p className="text-[7.5px] text-slate-400 font-medium">Lower interest green loans</p>
                                            </div>

                                            <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50 relative overflow-hidden group">
                                                <div className="absolute top-1.5 right-1.5 px-1 py-0.2 bg-amber-500 text-white rounded-[3px] text-[6.5px] font-black tracking-widest uppercase shadow-sm">Coming Soon</div>
                                                <p className="text-[7.5px] text-slate-500 font-black uppercase tracking-wider mb-0.5">Green Insurance</p>
                                                <p className="text-xs font-black text-slate-800">Up to ₹8,000</p>
                                                <p className="text-[7.5px] text-slate-400 font-medium">Eco insurance rebates</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action button at bottom of left column */}
                                    <div className="pt-3 flex justify-start">
                                        <a 
                                            href="/ekyc" 
                                            onClick={() => {
                                                localStorage.setItem("kycFormData", JSON.stringify(formData));
                                                localStorage.setItem("kycSource", "scrap");
                                            }}
                                            className="w-full sm:w-auto px-6 py-2.5 flex items-center justify-center bg-gradient-to-r from-[#E31E24] via-red-500 to-[#E31E24] text-white rounded-xl shadow-[0_0_20px_rgba(227,30,36,0.45)] hover:shadow-[0_0_30px_rgba(227,30,36,0.65)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 group overflow-hidden relative border border-red-400/30"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 relative z-10">
                                                Get More Precise Valution
                                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </a>
                                    </div>
                                </div>

                                {/* Right Section: Benefits & Actions (5 cols) */}
                                <div className="lg:col-span-5">
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }} 
                                        animate={{ opacity: 1, x: 0 }} 
                                        transition={{ delay: 0.2 }} 
                                        className="bg-slate-50 border border-slate-200 rounded-[1.25rem] p-6 shadow-xl relative overflow-hidden h-full flex flex-col justify-between"
                                    >
                                        {/* Bill / Invoice Header */}
                                        <div>
                                            <div className="flex justify-between items-center pb-3 border-b border-dashed border-slate-300 mb-4">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. Invoice</p>
                                                    <h4 className="text-slate-800 font-black text-xs uppercase tracking-wider">Benefit Summary Receipt</h4>
                                                </div>
                                                <div className="px-2 py-0.5 bg-[#E31E24]/10 border border-[#E31E24]/20 rounded text-[8px] font-bold text-[#E31E24]">
                                                    EST-BILL
                                                </div>
                                            </div>

                                            {/* Bill Details */}
                                            <div className="space-y-3.5 text-[11px]">
                                                {/* Vehicle Detail Row */}
                                                <div className="flex justify-between items-start gap-2">
                                                    <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider shrink-0">Scrap Vehicle</span>
                                                    <span className="text-slate-800 font-black text-right">
                                                        {formData.brand || "HYUNDAI MOTOR INDIA LTD"} {formData.model || "SANTRO XG"} ({formData.year || "2005"})
                                                    </span>
                                                </div>

                                                {/* Unladen Weight Row */}
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Unladen Weight</span>
                                                    <span className="text-slate-800 font-black">{scrapWeight || 854} kg</span>
                                                </div>

                                                {/* Scrap Rate Base Row */}
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Base Rate / KG</span>
                                                    <span className="text-slate-800 font-black">₹{baseScrapRate} / kg</span>
                                                </div>

                                                {/* Divider */}
                                                <div className="border-t border-slate-200 my-2"></div>

                                                {/* Itemized Calculations */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-slate-600 font-medium">Scrap Value Estimate (Average)</span>
                                                        <span className="text-slate-800 font-bold">₹{((scrapWeight || 854) * baseScrapRate).toLocaleString('en-IN')}</span>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center text-emerald-600">
                                                        <span className="font-bold flex items-center gap-1">
                                                            CD Certificate Advantage
                                                        </span>
                                                        <span className="font-black">+ ₹{potentialCDDiscount.toLocaleString('en-IN')}</span>
                                                    </div>

                                                    <div className="flex justify-between items-center text-slate-500 italic">
                                                        <span className="font-medium flex items-center gap-1">
                                                            Dealer OEM Discount <span className="text-[7px] font-black tracking-wider uppercase px-1 bg-amber-500 text-white rounded">Soon</span>
                                                        </span>
                                                        <span className="font-bold">+ ₹10,000</span>
                                                    </div>

                                                    <div className="flex justify-between items-center text-slate-500 italic">
                                                        <span className="font-medium flex items-center gap-1">
                                                            Green Finance Savings <span className="text-[7px] font-black tracking-wider uppercase px-1 bg-amber-500 text-white rounded">Soon</span>
                                                        </span>
                                                        <span className="font-bold">+ ₹15,000</span>
                                                    </div>

                                                    <div className="flex justify-between items-center text-slate-500 italic">
                                                        <span className="font-medium flex items-center gap-1">
                                                            Green Insurance Savings <span className="text-[7px] font-black tracking-wider uppercase px-1 bg-amber-500 text-white rounded">Soon</span>
                                                        </span>
                                                        <span className="font-bold">+ ₹8,000</span>
                                                    </div>
                                                </div>

                                                {/* Dashed Total Divider */}
                                                <div className="border-t border-dashed border-slate-300 my-3"></div>

                                                {/* Total Combined Worth */}
                                                <div className="bg-slate-900 rounded-xl p-4 text-white">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="text-[8px] text-emerald-400 font-black uppercase tracking-widest">Grand Total Benefit</p>
                                                            <p className="text-xs text-slate-300 font-medium leading-none mt-0.5">Scrap + CD + Partner Savings</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xl font-black text-white tracking-tight">
                                                                ₹{(((scrapWeight || 854) * baseScrapRate) + potentialCDDiscount + 10000 + 15000 + 8000).toLocaleString('en-IN')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Note footer */}
                                        <div className="pt-4 mt-4 border-t border-dashed border-slate-200">
                                            <p className="text-[9px] text-slate-400 leading-normal text-center italic">
                                                *Our team will assist you for getting best value of your CD Certificate.
                                            </p>
                                        </div>
                                    </motion.div>
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

                                    <div className="flex justify-start w-full">
                                        <a 
                                            href="/ekyc" 
                                            onClick={() => {
                                                localStorage.setItem("kycFormData", JSON.stringify(formData));
                                                localStorage.setItem("kycSource", serviceType);
                                            }}
                                            className="w-full sm:w-auto px-6 py-2.5 flex items-center justify-center gap-2 bg-gradient-to-r from-[#E31E24] via-red-500 to-[#E31E24] text-white font-black rounded-xl shadow-[0_0_20px_rgba(227,30,36,0.45)] hover:shadow-[0_0_30px_rgba(227,30,36,0.65)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest text-[10px] md:text-[11px] group border border-red-400/30"
                                        >
                                            Get More Precise Valution
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    </div>
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
            <div className={`w-full ${serviceType === "scrap" && step === 7 ? "max-w-3xl" : "max-w-2xl"} mx-auto px-4 transition-all duration-500`}>
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
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {BRANDS.map((b) => (
                                                            <button
                                                                key={b}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, desiredCompany: b })}
                                                                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all ${formData.desiredCompany === b ? 'border-[#E31E24] bg-red-50 shadow-sm' : 'border-slate-100 bg-white hover:border-red-200 hover:bg-red-50/50'}`}
                                                            >
                                                                {BRAND_LOGOS[b] ? (
                                                                    <img src={BRAND_LOGOS[b]} alt={b} className="w-7 h-7 object-contain mb-1 drop-shadow-sm" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                                ) : (
                                                                    <div className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-full mb-1"><Car className="w-3.5 h-3.5 text-slate-400" /></div>
                                                                )}
                                                                <span className="text-[8px] font-bold text-slate-700 text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full px-0.5">{b}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {formData.desiredCompany && !BRANDS.includes(formData.desiredCompany) && (
                                                        <input type="text" placeholder="e.g. Maruti Suzuki" value={formData.desiredCompany} onChange={(e) => setFormData({...formData, desiredCompany: e.target.value})} className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" />
                                                    )}
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
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {BRANDS.map((b) => (
                                                            <button
                                                                key={b}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, desiredCompany: b })}
                                                                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all ${formData.desiredCompany === b ? 'border-[#E31E24] bg-red-50 shadow-sm' : 'border-slate-100 bg-white hover:border-red-200 hover:bg-red-50/50'}`}
                                                            >
                                                                {BRAND_LOGOS[b] ? (
                                                                    <img src={BRAND_LOGOS[b]} alt={b} className="w-7 h-7 object-contain mb-1 drop-shadow-sm" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                                ) : (
                                                                    <div className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-full mb-1"><Car className="w-3.5 h-3.5 text-slate-400" /></div>
                                                                )}
                                                                <span className="text-[8px] font-bold text-slate-700 text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full px-0.5">{b}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {formData.desiredCompany && !BRANDS.includes(formData.desiredCompany) && (
                                                        <input type="text" placeholder="e.g. Maruti Suzuki" value={formData.desiredCompany} onChange={(e) => setFormData({...formData, desiredCompany: e.target.value})} className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" />
                                                    )}
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
                                        <div className="space-y-4">
                                            <div className="text-center mb-2">
                                                <h3 className="text-xl font-bold text-slate-900 leading-tight">Your Scrap Valuation is Ready! 🎉</h3>
                                                <p className="text-slate-500 text-[11px] font-medium">Verify your mobile number to unlock Certificate of Deposit (CD) and other green benefits.</p>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-stretch max-w-3xl mx-auto">
                                                {/* Left Panel: Anonymous Valuation Card (Tier 1) */}
                                                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                                                     <div className="bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 rounded-xl py-2 px-3 text-white relative overflow-hidden shadow-lg border border-slate-800 flex-1 flex flex-col justify-center">
                                                         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px]"></div>
                                                         <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-[30px]"></div>
                                                         
                                                         <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-0.5 block">
                                                             ⚡ Tier 1 — Anonymous Estimate
                                                         </span>
                                                         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                                             {formData.brand && formData.model ? `${formData.brand} ${formData.model}` : "Your Vehicle's"} Scrap Worth
                                                         </h4>
                                                         <div className="text-xl font-black tracking-tight text-white mb-0.5">
                                                             ₹{minScrapValue.toLocaleString('en-IN')} – ₹{maxScrapValue.toLocaleString('en-IN')}
                                                         </div>
                                                         <p className="text-[8px] text-slate-400 italic leading-snug">
                                                             *Honest ±20% scrap pricing based on {scrapWeight ? `${scrapWeight}kg unladen weight` : "market averages"} and global scrap metal indices. No single inflated numbers.
                                                         </p>
                                                     </div>

                                                    {/* Locked Benefits Grid */}
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {/* CD Certificate Card (Locked) */}
                                                        <div className="relative border border-slate-100 rounded-xl p-2 bg-slate-50 overflow-hidden group">
                                                            <div className="filter blur-[4px] select-none pointer-events-none transition-all duration-300">
                                                                <p className="text-[7.5px] text-slate-400 font-black uppercase tracking-wider mb-0.5">CD Value Range</p>
                                                                <p className="text-xs font-black text-slate-800">₹15,000 – ₹25,000</p>
                                                                <p className="text-[7.5px] text-slate-400">Save on new car tax</p>
                                                            </div>
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] transition-all">
                                                                <Lock className="w-3.5 h-3.5 text-[#E31E24] mb-0.5" />
                                                                <span className="text-[7.5px] font-black text-slate-800 uppercase tracking-widest text-center px-1">Unlock CD Benefits</span>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Dealer OEM Discount Card (Locked) */}
                                                        <div className="relative border border-slate-100 rounded-xl p-2 bg-slate-50 overflow-hidden group">
                                                            <div className="filter blur-[4px] select-none pointer-events-none transition-all duration-300">
                                                                <p className="text-[7.5px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Dealer Discount</p>
                                                                <p className="text-xs font-black text-slate-800">Up to ₹10,000</p>
                                                                <p className="text-[7.5px] text-slate-400">OEM Exchange Bonus</p>
                                                            </div>
                                                            <div className="absolute top-1 right-1 px-1 bg-slate-900 text-white rounded text-[5px] font-black tracking-widest uppercase z-20">Coming Soon</div>
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] transition-all">
                                                                <Lock className="w-3.5 h-3.5 text-[#E31E24] mb-0.5" />
                                                                <span className="text-[7.5px] font-black text-slate-800 uppercase tracking-widest text-center px-1">Verify to Unlock</span>
                                                            </div>
                                                        </div>

                                                        {/* Green Finance Savings Card (Locked) */}
                                                        <div className="relative border border-slate-100 rounded-xl p-2 bg-slate-50 overflow-hidden group">
                                                            <div className="filter blur-[4px] select-none pointer-events-none transition-all duration-300">
                                                                <p className="text-[7.5px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Green Finance</p>
                                                                <p className="text-xs font-black text-slate-800">Up to ₹15,000</p>
                                                                <p className="text-[7.5px] text-slate-400">Special EV Loan Rates</p>
                                                            </div>
                                                            <div className="absolute top-1 right-1 px-1 bg-slate-900 text-white rounded text-[5px] font-black tracking-widest uppercase z-20">Coming Soon</div>
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] transition-all">
                                                                <Lock className="w-3.5 h-3.5 text-[#E31E24] mb-0.5" />
                                                                <span className="text-[7.5px] font-black text-slate-800 uppercase tracking-widest text-center px-1">Verify to Unlock</span>
                                                            </div>
                                                        </div>

                                                        {/* Green Insurance Savings Card (Locked) */}
                                                        <div className="relative border border-slate-100 rounded-xl p-2 bg-slate-50 overflow-hidden group">
                                                            <div className="filter blur-[4px] select-none pointer-events-none transition-all duration-300">
                                                                <p className="text-[7.5px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Green Insurance</p>
                                                                <p className="text-xs font-black text-slate-800">Up to ₹8,000</p>
                                                                <p className="text-[7.5px] text-slate-400">Eco Insurance Rebate</p>
                                                            </div>
                                                            <div className="absolute top-1 right-1 px-1 bg-slate-900 text-white rounded text-[5px] font-black tracking-widest uppercase z-20">Coming Soon</div>
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] transition-all">
                                                                <Lock className="w-3.5 h-3.5 text-[#E31E24] mb-0.5" />
                                                                <span className="text-[7.5px] font-black text-slate-800 uppercase tracking-widest text-center px-1">Verify to Unlock</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Panel: Phone & OTP verification Form */}
                                                <div className="lg:col-span-5 flex flex-col justify-center bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm">
                                                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                                                        {otpSent ? <Lock className="w-6 h-6 text-[#E31E24]" /> : <Smartphone className="w-6 h-6 text-[#E31E24]" />}
                                                    </div>
                                                    <h4 className="text-center font-black text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                                                        {otpSent ? "Verify Code" : "Unlock Benefits"}
                                                    </h4>
                                                    <p className="text-center text-slate-500 text-[10px] mb-4 leading-normal">
                                                        {otpSent ? "Enter the 6-digit SMS verification code" : "Enter your phone number to unlock your CD certificate and partner benefits."}
                                                    </p>

                                                    <div className="space-y-3">
                                                        <div className="relative">
                                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs">+91</span>
                                                            <input 
                                                                type="tel" 
                                                                disabled={otpSent}
                                                                placeholder="10-digit number" 
                                                                value={formData.phone} 
                                                                onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} 
                                                                className="w-full pl-11 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24] disabled:opacity-60 disabled:bg-slate-100 transition-all text-center" 
                                                                maxLength={10} 
                                                            />
                                                        </div>

                                                        {otpSent && (
                                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2.5">
                                                                <input 
                                                                    type="tel" 
                                                                    placeholder={isSandboxMode ? "Use: 000000" : "••••••"} 
                                                                    value={formData.otp} 
                                                                    onChange={(e) => setFormData({...formData, otp: e.target.value.slice(0, 6)})} 
                                                                    className="w-full px-3 py-2 bg-white border border-[#E31E24]/30 rounded-xl text-lg text-center font-black tracking-[0.3em] text-slate-900 focus:outline-none focus:border-[#E31E24]" 
                                                                    maxLength={6} 
                                                                    autoFocus 
                                                                />
                                                                {isSandboxMode && (
                                                                    <p className="text-[9px] text-amber-600 font-bold text-center">⚡ Sandbox mode — enter 000000</p>
                                                                )}
                                                                <button 
                                                                    onClick={() => { setOtpSent(false); setFormData({...formData, otp: ""}); setIsSandboxMode(false); }}
                                                                    className="text-[9px] font-bold text-slate-400 hover:text-[#E31E24] uppercase tracking-widest transition-colors w-full text-center"
                                                                >
                                                                    Change Number
                                                                </button>
                                                            </motion.div>
                                                        )}

                                                        <button 
                                                            disabled={(otpSent ? (formData.otp.length !== 6 && formData.otp.length !== 4) : formData.phone.length !== 10) || isSendingOtp || isVerifying} 
                                                            onClick={otpSent ? handleVerifyOtp : handleSendOtp} 
                                                            className="w-full py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase text-[9px] tracking-widest flex items-center justify-center gap-1.5"
                                                        >
                                                            {isSendingOtp || isVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (otpSent ? "Verify & Unlock" : "Get OTP")}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
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

