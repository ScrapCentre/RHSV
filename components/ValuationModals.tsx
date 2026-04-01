"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, Shield, Sparkles, Smartphone, Award, FileText, Home } from "lucide-react"
import Link from "next/link"

interface ValuationModalsProps {
    formData: any
    valuationId: string | null
    estimatedValue: number | null
    pickupCost?: number | null
    distance?: number | null
    appliedPickupRate?: number | null
    onClose: () => void
}

export default function ValuationModals({ formData, valuationId, estimatedValue, pickupCost, distance, appliedPickupRate, onClose }: ValuationModalsProps) {
    const router = useRouter()
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Format estimated value (Fallback to 0 if API didn't return one)
    const formattedValue = (estimatedValue || 0).toLocaleString("en-IN")

    // Pre-generate confetti pieces (stable across renders)
    const confettiPieces = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
        id: i,
        color: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#ffffff"][i % 8],
        x: (Math.random() - 0.5) * 120,
        y: -(30 + Math.random() * 80),
        rotate: Math.random() * 720,
        delay: Math.random() * 0.8,
        duration: 1.8 + Math.random() * 1.2,
        size: 6 + Math.random() * 8,
        shape: i % 3,
    })), [])

    const valuationConfetti = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
        id: i,
        color: ["#10b981", "#3b82f6", "#f59e0b", "#ffffff", "#06b6d4"][i % 5],
        x: (Math.random() - 0.5) * 100,
        y: -(20 + Math.random() * 60),
        rotate: Math.random() * 540,
        delay: Math.random() * 0.6,
        duration: 1.5 + Math.random() * 1,
        size: 5 + Math.random() * 6,
        shape: i % 2,
    })), [])

    const handleCompleteKYC = () => {
        setIsSubmitting(true)
        setTimeout(() => {
            setStep(3)
            setIsSubmitting(false)
        }, 1500)
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden">
            {/* Confetti on Step 1 */}
            {step === 1 && valuationConfetti.map((piece) => (
                <motion.div
                    key={`vc-${piece.id}`}
                    className="absolute pointer-events-none"
                    style={{
                        width: piece.size,
                        height: piece.shape === 1 ? piece.size * 0.4 : piece.size,
                        backgroundColor: piece.color,
                        borderRadius: piece.shape === 0 ? "50%" : "2px",
                        left: "50%",
                        top: "50%",
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                    animate={{ x: `${piece.x}vw`, y: `${piece.y}vh`, opacity: [1, 1, 0], rotate: piece.rotate }}
                    transition={{ duration: piece.duration, delay: piece.delay, ease: "easeOut" as const, repeat: Infinity, repeatDelay: 3 }}
                />
            ))}

            <AnimatePresence mode="wait">

                {/* Step 1: Valuation Result */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-lg sm:max-w-xl bg-white rounded-2xl md:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] md:max-h-[90vh] relative overflow-hidden"
                    >
                        {/* Close Button */}
                        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20 text-white backdrop-blur-sm shrink-0">
                            <X className="w-4 h-4" />
                        </button>

                        <div className="bg-[#0E192D] p-5 sm:p-6 text-center text-white relative shrink-0">
                            {/* Background Effects */}
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>

                            <h2 className="text-xl sm:text-2xl font-bold mb-1 relative z-10 w-[90%] mx-auto">Build Your Quote</h2>
                            <p className="opacity-90 text-xs sm:text-sm text-emerald-100 relative z-10">Based on your {formData.vehicleType} details</p>

                            <div className="mt-4 bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-emerald-500/30 inline-block w-full max-w-[280px] sm:max-w-xs mx-auto relative z-10 shadow-xl">
                                <p className="text-xs font-medium text-emerald-400 uppercase tracking-widest mb-1">Estimated Valuation</p>
                                <div className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md break-words">
                                    ₹{formattedValue}
                                </div>
                                {distance !== undefined && distance !== null && pickupCost !== undefined && pickupCost !== null && (
                                    <div className="mt-4 lg:mt-5 pt-3 lg:pt-4 border-t border-emerald-500/20">
                                        {distance <= 100 ? (
                                            <div className="bg-emerald-500/20 rounded-lg p-3 animate-pulse border border-emerald-500/30">
                                                <p className="text-emerald-300 font-bold text-sm lg:text-base">Congratulations! 🎊</p>
                                                <p className="text-white text-xs lg:text-sm mt-0.5">Your pickup is free as you&apos;re under 100 km ({distance} km)</p>
                                            </div>
                                        ) : (
                                            <div className="bg-orange-500/20 rounded-lg p-3 border border-orange-500/30">
                                                <p className="text-orange-300 font-bold text-sm lg:text-base">Pickup Cost: ₹{pickupCost.toLocaleString("en-IN")}</p>
                                                <p className="text-white text-xs lg:text-sm mt-0.5">Distance: {distance} km <span className="opacity-70">(₹{appliedPickupRate || 5}/km after 100km)</span></p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-3 sm:p-4 bg-white overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
                                {[
                                    { icon: Shield, title: "Certificate of Deposit", desc: "Secure investment options" },
                                    { icon: Sparkles, title: "25% Tax Rebate", desc: "Save big on new purchases" },
                                    { icon: Award, title: "Registration Waiver", desc: "Complete fee exemption" }
                                ].map((item, i) => (
                                    <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-3 sm:p-4 hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300 flex flex-row md:flex-col items-center justify-start md:justify-center text-left md:text-center gap-3 sm:gap-2 group">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center sm:mb-1 shadow-sm group-hover:scale-110 transition-transform duration-300 shrink-0">
                                            <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#0E192D] text-[12px] sm:text-[13px] md:text-[12px] leading-tight mb-0.5">{item.title}</h3>
                                            <p className="text-[10px] sm:text-[11px] md:text-[10px] text-gray-500 group-hover:text-emerald-700/80 transition-colors leading-snug">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-row items-center gap-3 p-3 sm:p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl shadow-sm mb-4 sm:mb-5 relative overflow-hidden text-left">
                                <div className="absolute top-1/2 -translate-y-1/2 right-2 p-2 opacity-5 pointer-events-none hidden sm:block">
                                    <Smartphone className="w-20 h-20 text-emerald-800" />
                                </div>
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md animate-[pulse_3s_ease-in-out_infinite] shrink-0 z-10">
                                    <Smartphone className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="z-10">
                                    <p className="font-black text-[#0E192D] text-sm leading-tight mb-1">Our Call Center will contact you</p>
                                    <p className="text-[10px] border border-emerald-200 bg-white/50 inline-block px-2 py-0.5 rounded-full font-bold text-emerald-700">Support available 24/7</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    localStorage.setItem("kycFormData", JSON.stringify(formData))
                                    localStorage.setItem("kycValuation", (estimatedValue || 0).toString())
                                    if (valuationId) localStorage.setItem("kycValuationId", valuationId)
                                    router.push("/ekyc/get-quote")
                                }}
                                className="w-full bg-[#0E192D] hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-emerald-500/30 transform transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                            >
                                <Sparkles className="w-4 h-4 text-emerald-400 group-hover:text-white" />
                                Proceed to Final Step (eKYC)
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: eKYC Form */}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full max-w-2xl bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]"
                    >
                        <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20">
                            <button onClick={() => setStep(1)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center">
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-5 sm:p-8 lg:p-10">
                            <div className="text-center mb-6 lg:mb-8 pt-4 sm:pt-0">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-[#0E192D] mb-1">Complete eKYC</h2>
                                <p className="text-gray-500 text-sm lg:text-base">Verify your identity to claim benefits</p>
                            </div>

                            <div className="space-y-4 lg:space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-[#0E192D] mb-1">Full Name</label>
                                    <input type="text" defaultValue={formData.name} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" placeholder="As per Aadhaar" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-[#0E192D] mb-1">Date of Birth</label>
                                        <input type="date" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[#0E192D] mb-1">Aadhaar Number</label>
                                        <input type="text" maxLength={12} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" placeholder="XXXX XXXX XXXX" />
                                    </div>
                                </div>

                                {/* File Uploads */}
                                <div className="space-y-4 pt-2 border-t border-gray-100">
                                    <div>
                                        <label className="block text-sm font-bold text-[#0E192D] mb-1">Upload Aadhaar Card (PDF)</label>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-emerald-500 outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[#0E192D] mb-1">Upload RC (PDF)</label>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-emerald-500 outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[#0E192D] mb-1">Upload Car Photo (PNG/JPG)</label>
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg"
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-emerald-500 outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors cursor-pointer"
                                        />
                                    </div>
                                </div>


                                <div className="border-t border-gray-100 pt-3">
                                    <label className="block text-sm font-bold text-[#0E192D] mb-1">Aadhaar Registered Mobile</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="tel"
                                            defaultValue={formData.phone}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 mt-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                    <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 mt-0.5 shrink-0 cursor-pointer" defaultChecked />
                                    <span className="text-sm text-gray-600 font-medium">I agree to the eKYC terms & conditions and grant permission to verify my identity documents.</span>
                                </div>

                                <button
                                    onClick={handleCompleteKYC}
                                    disabled={isSubmitting}
                                    className="w-full mt-6 bg-[#0E192D] hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Verifying Identity...</span>
                                        </>
                                    ) : (
                                        "Submit & Complete eKYC"
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Success Celebration */}
                {step === 3 && (
                    <>
                        {/* Full confetti on success */}
                        {confettiPieces.map((piece) => (
                            <motion.div
                                key={`sc-${piece.id}`}
                                className="absolute pointer-events-none z-[110]"
                                style={{
                                    width: piece.size,
                                    height: piece.shape === 1 ? piece.size * 0.4 : piece.size,
                                    backgroundColor: piece.color,
                                    borderRadius: piece.shape === 0 ? "50%" : "2px",
                                    left: "50%",
                                    top: "50%",
                                }}
                                initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                                animate={{ x: `${piece.x}vw`, y: `${piece.y}vh`, opacity: [1, 1, 0], rotate: piece.rotate, scale: [1, 1.2, 0.5] }}
                                transition={{ duration: piece.duration, delay: piece.delay, ease: "easeOut" as const, repeat: Infinity, repeatDelay: 1.5 }}
                            />
                        ))}
                        {/* Floating emoji */}
                        {["🎉", "🎊", "✨", "🏆", "🎈", "⭐"].map((emoji, i) => (
                            <motion.div
                                key={`emoji-${i}`}
                                className="absolute text-3xl pointer-events-none select-none z-[110]"
                                style={{ left: `${10 + i * 15}%`, bottom: "-5%" }}
                                animate={{ y: ["-0vh", "-120vh"], opacity: [0, 1, 1, 0], rotate: [0, i % 2 === 0 ? 30 : -30] }}
                                transition={{ duration: 3 + i * 0.4, delay: i * 0.3, repeat: Infinity, repeatDelay: 0.5, ease: "easeOut" as const }}
                            >
                                {emoji}
                            </motion.div>
                        ))}
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.5, y: 60 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: "spring", duration: 0.7, bounce: 0.4 }}
                            className="w-full max-w-lg bg-[#0E192D] rounded-3xl shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden z-20 border border-emerald-500/30 max-h-[95vh] flex flex-col"
                        >
                            {/* Glow blobs */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="absolute top-4 right-4 z-30">
                                <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="relative z-10 overflow-y-auto">
                                <motion.div
                                    className="flex justify-center mb-6 mt-4"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", duration: 0.8, bounce: 0.5, delay: 0.2 }}
                                >
                                    <motion.div
                                        className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-500/40"
                                        animate={{ scale: [1, 1.1, 1], boxShadow: ["0 0 0 0 rgba(16,185,129,0.4)", "0 0 0 20px rgba(16,185,129,0)", "0 0 0 0 rgba(16,185,129,0)"] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <CheckCircle className="w-12 h-12 text-emerald-400" />
                                    </motion.div>
                                </motion.div>

                                <motion.h2 className="text-3xl sm:text-4xl font-black text-white mb-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                    You&apos;re All Set! <span className="text-2xl">🎉</span>
                                </motion.h2>
                                <div className="h-1 w-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mx-auto my-4" />

                                <motion.p className="text-emerald-400 font-bold text-lg mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                    eKYC Completed Successfully!
                                </motion.p>
                                <motion.p className="text-gray-400 text-sm mb-8 leading-relaxed px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                                    Your identity has been verified. Our team will reach out within <span className="text-emerald-400 font-bold">24 hours</span>.
                                </motion.p>

                                <motion.div className="grid grid-cols-3 gap-3 mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                                    {[
                                        { label: "Verified", icon: "✅", color: "text-emerald-400" },
                                        { label: "Submitted", icon: "📤", color: "text-blue-400" },
                                        { label: "Processing", icon: "⚡", color: "text-yellow-400" },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-slate-800/60 rounded-xl p-3 sm:p-4 border border-slate-700/50">
                                            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{item.icon}</div>
                                            <div className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${item.color}`}>{item.label}</div>
                                        </div>
                                    ))}
                                </motion.div>

                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                                    <Link href="/" className="block w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 text-base sm:text-lg flex items-center justify-center gap-2">
                                        <Home className="w-5 h-5" />
                                        Back to Home
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    </>
                )}

            </AnimatePresence>
        </div>
    )
}

