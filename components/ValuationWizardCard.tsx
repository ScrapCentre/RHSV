"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Car, User, MapPin, Phone, ChevronRight, ChevronLeft,
  CheckCircle, Loader2, Shield, Award, Sparkles
} from "lucide-react"
import ValuationModals from "./ValuationModals"
import { indiaData, states as indiaStates } from "@/lib/india-data"

// ─── Demo data lookup ─────────────────────────────────────────────────────────

const DEMO_VEHICLES: Record<string, {
  model: string; brand: string; fuelType: string; year: string; kerbWeight: string; vehicleType: string
}> = {
  "DL01AB1234": { model: "Swift ZXI", brand: "Maruti Suzuki", fuelType: "Petrol", year: "2019", kerbWeight: "895 kg", vehicleType: "Car" },
  "MH02CD5678": { model: "Creta SX", brand: "Hyundai", fuelType: "Diesel", year: "2020", kerbWeight: "1340 kg", vehicleType: "Car" },
  "KA03EF9012": { model: "Nexon XZ+", brand: "Tata", fuelType: "Petrol", year: "2021", kerbWeight: "1190 kg", vehicleType: "Car" },
  "GJ05GH3456": { model: "Activa 6G", brand: "Honda", fuelType: "Petrol", year: "2022", kerbWeight: "107 kg", vehicleType: "Bike" },
  "UP32IJ7890": { model: "Splendor+", brand: "Hero", fuelType: "Petrol", year: "2018", kerbWeight: "111 kg", vehicleType: "Bike" },
}

function lookupVehicle(reg: string) {
  const clean = reg.replace(/[-\s]/g, "").toUpperCase()
  return DEMO_VEHICLES[clean] || {
    model: "Swift ZXI",
    brand: "Maruti Suzuki",
    fuelType: "Petrol",
    year: "2019",
    kerbWeight: "895 kg",
    vehicleType: "Car",
  }
}

// ─── Progress dots ────────────────────────────────────────────────────────────

const STEPS = ["Vehicle", "Details", "Location", "Verify"]

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEPS.map((label, i) => {
        const isActive = i === step
        const isDone = i < step
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                transition-all duration-300
                ${isDone ? "bg-emerald-500 text-white" : isActive ? "bg-[#0E192D] text-white ring-2 ring-emerald-400" : "bg-slate-200 text-slate-400"}
              `}>
                {isDone ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? "text-emerald-600" : isDone ? "text-emerald-500" : "text-slate-400"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 mb-4 rounded transition-colors duration-300 ${isDone ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Input component ──────────────────────────────────────────────────────────

function Field({
  label, icon: Icon, children
}: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
        <Icon className="w-3.5 h-3.5" />{label}
      </label>
      {children}
    </div>
  )
}

const inputCls = `
  w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200
  text-slate-900 placeholder-slate-400 text-sm font-medium
  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
  outline-none transition-all duration-200
`

// ─── Main wizard ──────────────────────────────────────────────────────────────

export default function ValuationWizardCard() {
  const { status } = useSession()
  const [step, setStep] = useState(0)
  const [regNum, setRegNum] = useState("")
  const [isLooking, setIsLooking] = useState(false)
  const [vehicleData, setVehicleData] = useState<ReturnType<typeof lookupVehicle> | null>(null)
  const [name, setName] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [customCity, setCustomCity] = useState("")
  const [pincode, setPincode] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [showValuation, setShowValuation] = useState(false)
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null)
  const [valError, setValError] = useState("")

  const DEMO_OTP = "1234"

  // Auto-fetch only when a complete Indian reg number is entered (e.g. UP78AB1234)
  // Format: 2-letter state + 2-digit district + 1-2 letter series + 4-digit number
  const INDIA_REG_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/

  useEffect(() => {
    const clean = regNum.replace(/[-\s]/g, "")
    if (!INDIA_REG_REGEX.test(clean)) {
      setVehicleData(null)
      setIsLooking(false)
      return
    }
    setIsLooking(true)
    setVehicleData(null)
    const timer = setTimeout(() => {
      setVehicleData(lookupVehicle(regNum))
      setIsLooking(false)
      setValError("")
    }, 600)
    return () => clearTimeout(timer)
  }, [regNum])

  const handleStep1Next = () => {
    if (!vehicleData) { setValError("Please look up your vehicle first"); return }
    setStep(1)
    setValError("")
  }

  const handleStep2Next = () => {
    if (!name.trim()) { setValError("Please enter your full name"); return }
    setStep(2)
    setValError("")
  }

  const handleStep3Next = () => {
    const resolvedCity = city === "other" ? customCity.trim() : city.trim()
    if (!state || !resolvedCity || !pincode.trim()) { setValError("Please fill all location fields"); return }
    setStep(3)
    setValError("")
  }

  const handleSendOtp = () => {
    if (phone.length !== 10) { setValError("Enter a valid 10-digit phone number"); return }
    setValError("")
    setSendingOtp(true)
    setTimeout(() => {
      setOtpSent(true)
      setSendingOtp(false)
    }, 1000)
  }

  const handleVerifyOtp = async () => {
    if (otp !== DEMO_OTP) {
      setOtpError("Incorrect OTP. Demo OTP is 1234")
      return
    }
    setOtpError("")
    setVerifyingOtp(true)

    if (status !== "authenticated") {
        try {
          const result = await signIn("phone-otp", {
              phone,
              otp,
              redirect: false,
          });
          if (result?.error) {
              setOtpError("Authentication failed. Try again.");
              setVerifyingOtp(false);
              return;
          }
        } catch (err) {
          setOtpError("Something went wrong");
          setVerifyingOtp(false);
          return;
        }
    }

    setOtpVerified(true)
    setVerifyingOtp(false)

    // Save to valuations collection
    try {
      const payload = {
          requestType: "valuation",
          vehicleType: vehicleData?.vehicleType || "Car",
          brand: vehicleData?.brand || "Maruti Suzuki",
          model: vehicleData?.model || "Swift VXI",
          year: vehicleData?.year || "2018",
          vehicleNumber: regNum,
          vehicleWeight: vehicleData ? String(parseInt(vehicleData.kerbWeight) / 1000) : "0.895",
          address: {
            state,
            city: city === "other" ? customCity.trim() : city.trim(),
            pincode
          },
          contact: {
            name,
            phone
          }
      };
      const res = await fetch("/api/valuation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.id) {
          localStorage.setItem("kycValuationId", data.id);
      }
    } catch (e) {
      console.error("Failed to save valuation request", e);
    }

    // Calculate a realistic demo valuation based on year & weight
    const ageYears = new Date().getFullYear() - parseInt(vehicleData?.year || "2019")
    const weightKg = parseInt(vehicleData?.kerbWeight || "895")
    const scrapRate = vehicleData?.vehicleType === "Bike" ? 28 : vehicleData?.vehicleType === "Truck" ? 22 : 25
    const base = (weightKg * scrapRate) - (ageYears * 1200)
    setEstimatedValue(Math.max(base, 8000))
    setTimeout(() => setShowValuation(true), 600)
  }

  const formDataForModal = {
    requestType: "valuation",
    vehicleType: vehicleData?.vehicleType || "Car",
    brand: vehicleData?.brand || "",
    customBrand: "",
    model: vehicleData?.model || "",
    customModel: "",
    year: vehicleData?.year || "",
    vehicleNumber: regNum,
    vehicleWeight: vehicleData ? String(parseInt(vehicleData.kerbWeight) / 1000) : "0.895",
    name,
    phone,
    pincode,
    state,
    city: city === "other" ? customCity : city,
    customCity: "",
    agreeTC: true,
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 60 : -60, opacity: 0 }),
  }
  const [dir, setDir] = useState(1)

  const goNext = (fn: () => void) => { setDir(1); fn() }
  const goPrev = () => { setDir(-1); setStep(s => s - 1); setValError("") }



  return (
    <>
      {/* Valuation result modal — same as QuoteForm triggers */}
      <AnimatePresence>
        {showValuation && (
          <ValuationModals
            formData={formDataForModal}
            valuationId={null}
            estimatedValue={estimatedValue}
            pickupCost={null}
            distance={null}
            appliedPickupRate={null}
            onClose={() => {
              setShowValuation(false)
              setStep(0)
              setRegNum("")
              setVehicleData(null)
              setName("")
              setState("")
              setCity("")
              setCustomCity("")
              setPincode("")
              setPhone("")
              setOtp("")
              setOtpSent(false)
              setOtpVerified(false)
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative w-full bg-[#0b1628] border border-slate-800 rounded-[24px] overflow-hidden shadow-[10px_10px_30px_rgba(0,0,0,0.3)]">

        {/* Header strip */}
        <div className="bg-gradient-to-r from-[#0E192D] to-violet-950 px-6 pt-5 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Free Vehicle Valuation</h3>
            <p className="text-[11px] text-slate-400">AI-powered • Results in 60 seconds • Zero cost</p>
          </div>
        </div>

        {/* Wizard body */}
        <div className="p-5">
          <ProgressBar step={step} />

          <AnimatePresence mode="wait" custom={dir}>
            {/* ── Step 0: Vehicle Reg Number ── */}
            {step === 0 && (
              <motion.div
                key="s0"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-4"
              >
                <div className="text-center mb-4">
                  <Car className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                  <h4 className="text-white font-bold text-base">Enter your vehicle number</h4>
                  <p className="text-slate-400 text-xs mt-0.5">We'll auto-fetch your vehicle details</p>
                </div>

                <Field label="Registration Number" icon={Car}>
                  <div className="relative">
                    <input
                      className={inputCls + " uppercase font-mono tracking-widest pr-10"}
                      placeholder="e.g. DL-01-AB-1234"
                      value={regNum}
                      onChange={e => setRegNum(e.target.value.toUpperCase())}
                    />
                    {isLooking && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                      </div>
                    )}
                  </div>
                </Field>

                {/* Auto-populated summary card */}
                <AnimatePresence>
                  {vehicleData && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.3 }}
                      className="bg-emerald-500/8 border border-emerald-500/25 rounded-2xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Vehicle Found</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Brand", val: vehicleData.brand },
                          { label: "Model", val: vehicleData.model },
                          { label: "Year", val: vehicleData.year },
                          { label: "Fuel", val: vehicleData.fuelType },
                          { label: "Type", val: vehicleData.vehicleType },
                          { label: "Kerb Weight", val: vehicleData.kerbWeight },
                        ].map(({ label, val }) => (
                          <div key={label} className="bg-white/5 rounded-xl p-2.5">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
                            <p className="text-white text-xs font-bold truncate">{val}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-slate-500 text-[10px] mt-2.5 text-center">Please verify the details above are correct</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {valError && <p className="text-red-400 text-xs font-semibold text-center">{valError}</p>}

                <button
                  onClick={() => goNext(handleStep1Next)}
                  disabled={!vehicleData}
                  className="w-full py-3 bg-[#0E192D] hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-200"
                >
                  Confirm Vehicle <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── Step 1: Full Name ── */}
            {step === 1 && (
              <motion.div
                key="s1"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-4"
              >
                <div className="text-center mb-4">
                  <User className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                  <h4 className="text-white font-bold text-base">What's your name?</h4>
                  <p className="text-slate-400 text-xs mt-0.5">As per your official ID</p>
                </div>

                <Field label="Full Name" icon={User}>
                  <input
                    className={inputCls}
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && goNext(handleStep2Next)}
                    autoFocus
                  />
                </Field>

                {valError && <p className="text-red-400 text-xs font-semibold text-center">{valError}</p>}

                <div className="flex gap-3">
                  <button onClick={goPrev} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={() => goNext(handleStep2Next)} className="flex-[2] py-3 bg-[#0E192D] hover:bg-violet-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Location ── */}
            {step === 2 && (
              <motion.div
                key="s2"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-4"
              >
                <div className="text-center mb-4">
                  <MapPin className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                  <h4 className="text-white font-bold text-base">Your location</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Helps us calculate pickup cost accurately</p>
                </div>

                <Field label="State" icon={MapPin}>
                  <select
                    value={state}
                    onChange={e => { setState(e.target.value); setCity("") }}
                    className={inputCls + " cursor-pointer"}
                  >
                    <option value="">Select state</option>
                    {indiaStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>

                <Field label="City" icon={MapPin}>
                  {!state ? (
                    <input
                      className={inputCls + " opacity-50 cursor-not-allowed"}
                      placeholder="Select a state first"
                      disabled
                    />
                  ) : city === "other" ? (
                    <div className="flex gap-2">
                      <input
                        className={inputCls + " flex-1"}
                        placeholder="Enter your city"
                        value={customCity}
                        onChange={e => setCustomCity(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => { setCity(""); setCustomCity("") }}
                        className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl text-xs font-bold transition-all shrink-0"
                      >
                        ↩
                      </button>
                    </div>
                  ) : (
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className={inputCls + " cursor-pointer"}
                    >
                      <option value="">Select city</option>
                      <option value="other">Other</option>
                      {(indiaData[state] || []).map((c: string) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </Field>

                <Field label="Pincode" icon={MapPin}>
                  <input
                    className={inputCls}
                    placeholder="e.g. 110001"
                    value={pincode}
                    onChange={e => setPincode(e.target.value.slice(0, 6))}
                    maxLength={6}
                    type="tel"
                  />
                </Field>

                {valError && <p className="text-red-400 text-xs font-semibold text-center">{valError}</p>}

                <div className="flex gap-3">
                  <button onClick={goPrev} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={() => goNext(handleStep3Next)} className="flex-[2] py-3 bg-[#0E192D] hover:bg-violet-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Phone + OTP ── */}
            {step === 3 && (
              <motion.div
                key="s3"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-4"
              >
                <div className="text-center mb-4">
                  <Phone className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                  <h4 className="text-white font-bold text-base">Verify your number</h4>
                  <p className="text-slate-400 text-xs mt-0.5">We'll send you an OTP to confirm</p>
                </div>

                <Field label="Phone Number" icon={Phone}>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold shrink-0">
                      🇮🇳 +91
                    </div>
                    <input
                      className={inputCls + " flex-1"}
                      placeholder="10-digit number"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      type="tel"
                      maxLength={10}
                      disabled={otpSent}
                    />
                    {!otpSent && (
                      <button
                        onClick={handleSendOtp}
                        disabled={sendingOtp || phone.length !== 10}
                        className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-all shrink-0 flex items-center gap-1.5"
                      >
                        {sendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
                      </button>
                    )}
                  </div>
                </Field>

                {/* OTP input */}
                <AnimatePresence>
                  {otpSent && !otpVerified && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                        <p className="text-emerald-400 text-xs font-semibold">OTP sent to +91 {phone}</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">(Demo: use <span className="font-black text-white">1234</span>)</p>
                      </div>

                      <Field label="Enter OTP" icon={Shield}>
                        <input
                          className={inputCls + " text-center text-2xl font-black tracking-[0.5em]"}
                          placeholder="••••"
                          value={otp}
                          onChange={e => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 4)); setOtpError("") }}
                          maxLength={4}
                          type="tel"
                          autoFocus
                        />
                      </Field>

                      {otpError && <p className="text-red-400 text-xs font-semibold text-center">{otpError}</p>}

                      <button
                        onClick={handleVerifyOtp}
                        disabled={otp.length !== 4 || verifyingOtp}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
                      >
                        {verifyingOtp ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                        ) : (
                          <><CheckCircle className="w-4 h-4" /> Verify & Get Valuation</>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success state before modal opens */}
                <AnimatePresence>
                  {otpVerified && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center space-y-2"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto"
                      >
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                      </motion.div>
                      <p className="text-emerald-400 font-bold text-sm">Verified! Calculating your valuation…</p>
                      <div className="w-8 h-1 bg-emerald-400/40 rounded-full mx-auto animate-pulse" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {valError && <p className="text-red-400 text-xs font-semibold text-center">{valError}</p>}

                {!otpSent && (
                  <div className="flex gap-3">
                    <button onClick={goPrev} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  </div>
                )}

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 pt-2 border-t border-white/5">
                  {[
                    { icon: Shield, label: "Secure" },
                    { icon: Award, label: "Certified" },
                    { icon: Sparkles, label: "AI-Powered" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                      <Icon className="w-3.5 h-3.5 text-violet-400" />
                      {label}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
