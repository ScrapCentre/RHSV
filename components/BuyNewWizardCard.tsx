"use client"

import { useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Car, User, MapPin, Phone, ChevronRight, ChevronLeft,
  CheckCircle, Shield, Award, Sparkles, Mail, IndianRupee, Fuel
} from "lucide-react"
import { indiaData, states as indiaStates } from "@/lib/india-data"

// ─── Progress dots ────────────────────────────────────────────────────────────

const STEPS = ["Preferences", "Contact", "Location", "Verify"]

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
                ${isDone ? "bg-blue-500 text-white" : isActive ? "bg-[#0E192D] text-white ring-2 ring-blue-400" : "bg-slate-200 text-slate-400"}
              `}>
                {isDone ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? "text-blue-600" : isDone ? "text-blue-500" : "text-slate-400"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 mb-4 rounded transition-colors duration-300 ${isDone ? "bg-blue-400" : "bg-slate-200"}`} />
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
  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
  outline-none transition-all duration-200
`

// ─── Main wizard ──────────────────────────────────────────────────────────────

export default function BuyNewWizardCard() {
  const { status } = useSession()
  const [step, setStep] = useState(0)
  
  // Preferences
  const [brand, setBrand] = useState("")
  const [modelType, setModelType] = useState("")
  const [budget, setBudget] = useState("")
  const [fuelType, setFuelType] = useState("")
  
  // Contact
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  
  // Location
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [customCity, setCustomCity] = useState("")
  const [pincode, setPincode] = useState("")

  const [valError, setValError] = useState("")
  const [submitted, setSubmitted] = useState(false)
  
  // OTP
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const DEMO_OTP = "1234"

  const handleStep0Next = () => {
    if (!brand || !modelType || !budget || !fuelType) {
      setValError("Please select all preferences")
      return
    }
    setStep(1)
    setValError("")
  }

  const handleStep1Next = () => {
    if (!name.trim() || !email.trim() || phone.length !== 10) {
      setValError("Please fill all contact details correctly")
      return
    }
    setStep(2)
    setValError("")
  }

  const handleStep2Next = () => {
    const resolvedCity = city === "other" ? customCity.trim() : city.trim()
    if (!state || !resolvedCity || !pincode.trim()) {
      setValError("Please fill all location fields")
      return
    }
    setValError("")
    setStep(3)
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
    
    // Save data to BuyVehicle DB
    try {
        await fetch("/api/buy-vehicle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                vehicleBrand: brand,
                vehicleModel: modelType,
                budgetRange: budget,
                fuelType: fuelType,
                customerName: name,
                customerEmail: email,
                customerPhone: phone,
                state: state,
                city: city === "other" ? customCity.trim() : city.trim(),
                pincode: pincode
            })
        });
    } catch (e) {
        console.error("Failed to save buy request", e);
    }

    setTimeout(() => {
        setSubmitted(true)
    }, 600)
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 60 : -60, opacity: 0 }),
  }
  const [dir, setDir] = useState(1)

  const goNext = (fn: () => void) => { setDir(1); fn() }
  const goPrev = () => { setDir(-1); setStep(s => s - 1); setValError("") }

  const BRANDS = ["Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Kia", "Toyota", "Honda", "MG", "Skoda", "Volkswagen", "Other"]
  const MODEL_TYPES = ["Hatchback", "Sedan", "Compact SUV", "SUV", "MUV/MPV", "Luxury"]
  const BUDGETS = ["Under 5 Lakh", "5 - 10 Lakh", "10 - 15 Lakh", "15 - 25 Lakh", "25 - 40 Lakh", "40+ Lakh"]
  const FUELS = ["Petrol", "Diesel", "CNG", "Electric (EV)", "Hybrid"]

  if (submitted) {
    return (
      <div className="relative w-full bg-[#0b1628] border border-slate-800 rounded-[24px] overflow-hidden shadow-[10px_10px_30px_rgba(0,0,0,0.3)] p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-8 h-8 text-blue-400" />
        </motion.div>
        <h3 className="text-xl font-bold text-white mb-2">Preferences Saved!</h3>
        <p className="text-slate-400 text-sm mb-6">
          Our experts are curating the best {brand} {modelType} options under {budget} for you. We'll contact you shortly at +91 {phone}.
        </p>
        <button
          onClick={() => {
            setSubmitted(false); setStep(0); setBrand(""); setModelType(""); setBudget(""); setFuelType("");
            setName(""); setEmail(""); setPhone(""); setState(""); setCity(""); setCustomCity(""); setPincode("");
          }}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all"
        >
          Start New Search
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full bg-[#0b1628] border border-slate-800 rounded-[24px] overflow-hidden shadow-[10px_10px_30px_rgba(0,0,0,0.3)]">

      {/* Header strip */}
      <div className="bg-gradient-to-r from-[#0E192D] to-blue-950 px-6 pt-5 pb-4 border-b border-white/5">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Buy New Vehicle</h3>
          <p className="text-[11px] text-slate-400">Personalized recommendations • Best offers</p>
        </div>
      </div>

      {/* Wizard body */}
      <div className="p-5">
        <ProgressBar step={step} />

        <AnimatePresence mode="wait" custom={dir}>
          {/* ── Step 0: Preferences ── */}
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
                <Car className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h4 className="text-white font-bold text-base">Vehicle Preferences</h4>
                <p className="text-slate-400 text-xs mt-0.5">Tell us what you're looking for</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Brand" icon={Award}>
                  <select value={brand} onChange={e => setBrand(e.target.value)} className={inputCls + " cursor-pointer"}>
                    <option value="">Select Brand</option>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>

                <Field label="Model Type" icon={Car}>
                  <select value={modelType} onChange={e => setModelType(e.target.value)} className={inputCls + " cursor-pointer"}>
                    <option value="">Select Type</option>
                    {MODEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>

                <Field label="Budget Range" icon={IndianRupee}>
                  <select value={budget} onChange={e => setBudget(e.target.value)} className={inputCls + " cursor-pointer"}>
                    <option value="">Select Budget</option>
                    {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>

                <Field label="Fuel Type" icon={Fuel}>
                  <select value={fuelType} onChange={e => setFuelType(e.target.value)} className={inputCls + " cursor-pointer"}>
                    <option value="">Select Fuel</option>
                    {FUELS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
              </div>

              {valError && <p className="text-red-400 text-xs font-semibold text-center">{valError}</p>}

              <button
                onClick={() => goNext(handleStep0Next)}
                className="w-full py-3 bg-[#0E192D] hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-200 mt-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* ── Step 1: Contact Details ── */}
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
                <User className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h4 className="text-white font-bold text-base">Contact Details</h4>
                <p className="text-slate-400 text-xs mt-0.5">Where should we send the offers?</p>
              </div>

              <Field label="Full Name" icon={User}>
                <input
                  className={inputCls}
                  placeholder="Your Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                />
              </Field>

              <Field label="Email Address" icon={Mail}>
                <input
                  className={inputCls}
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </Field>

              <Field label="Phone Number" icon={Phone}>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold shrink-0">
                    🇮🇳 +91
                  </div>
                  <input
                    className={inputCls + " flex-1"}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    type="tel"
                    maxLength={10}
                  />
                </div>
              </Field>

              {valError && <p className="text-red-400 text-xs font-semibold text-center">{valError}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={goPrev} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => goNext(handleStep1Next)} className="flex-[2] py-3 bg-[#0E192D] hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all">
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
                <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h4 className="text-white font-bold text-base">Your Location</h4>
                <p className="text-slate-400 text-xs mt-0.5">To find dealerships near you</p>
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
                  placeholder="6-digit pincode"
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  type="tel"
                />
              </Field>

              {valError && <p className="text-red-400 text-xs font-semibold text-center">{valError}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={goPrev} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => goNext(handleStep2Next)} className="flex-[2] py-3 bg-[#0E192D] hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: OTP Verify ── */}
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
                <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
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
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-all shrink-0 flex items-center gap-1.5"
                    >
                      {sendingOtp ? "Sending..." : "Send OTP"}
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
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                      <p className="text-blue-400 text-xs font-semibold">OTP sent to +91 {phone}</p>
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
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
                    >
                      {verifyingOtp ? "Verifying..." : "Verify & Submit"}
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
                    className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 text-center space-y-2"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto"
                    >
                      <CheckCircle className="w-6 h-6 text-blue-400" />
                    </motion.div>
                    <p className="text-blue-400 font-bold text-sm">Verified! Submitting request...</p>
                    <div className="w-8 h-1 bg-blue-400/40 rounded-full mx-auto animate-pulse" />
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
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
