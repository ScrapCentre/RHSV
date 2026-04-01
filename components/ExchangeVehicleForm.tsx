"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, MapPin, ChevronRight, Car, User, Phone } from "lucide-react"
import { indiaData, states } from "@/lib/india-data"
import EKYCForm from "./eKYCForm"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface ExchangeVehicleFormProps {
    onClose: () => void
}

interface FormData {
    oldVehicleRegistration: string
    oldVehicleBrand: string
    oldVehicleModel: string
    oldVehicleYear: string
    oldVehicleFuelType: string
    newVehicleBrand: string
    newVehicleModel: string
    customerName: string
    customerPhone: string
    state: string
    city: string
    customCity: string
    pincode: string
}

export default function ExchangeVehicleForm({ onClose }: ExchangeVehicleFormProps) {
    const inputClasses = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 min-h-[50px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-[15px] font-medium appearance-none"
    const labelClasses = "text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block"
    const [formData, setFormData] = useState<FormData>({
        oldVehicleRegistration: "",
        oldVehicleBrand: "",
        oldVehicleModel: "",
        oldVehicleYear: "",
        oldVehicleFuelType: "",
        newVehicleBrand: "",
        newVehicleModel: "",
        customerName: "",
        customerPhone: "",
        state: "",
        city: "",
        customCity: "",
        pincode: "",
    })
    const [showSuccess, setShowSuccess] = useState(false)
    const [showEKYC, setShowEKYC] = useState(false)
    const [showIntermediateModal, setShowIntermediateModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const fuelTypes = ["Petrol", "Diesel", "CNG", "LPG", "Electric", "Hybrid"]
    const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)
    const brands = ["Maruti Suzuki", "Hyundai", "Tata", "Honda", "Toyota", "Mahindra", "Kia", "Skoda", "Nissan", "BMW", "Audi"]

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const requiredFields = [
            formData.oldVehicleRegistration,
            formData.oldVehicleBrand,
            formData.oldVehicleModel,
            formData.oldVehicleYear,
            formData.oldVehicleFuelType,
            formData.newVehicleBrand,
            formData.customerName,
            formData.customerPhone,
            formData.state,
            formData.city === "other" ? formData.customCity : formData.city,
            formData.pincode,
        ]

        if (requiredFields.every((field) => field && field.trim() !== "")) {
            setLoading(true)
            fetch("/api/exchange-vehicle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
                .then(async (res) => {
                    if (res.ok) {
                        const data = await res.json()
                        // Store data for eKYC
                        localStorage.setItem("kycFormData", JSON.stringify(formData))
                        if (data.data && data.data._id) {
                            localStorage.setItem("kycValuationId", data.data._id)
                        }
                        setShowIntermediateModal(true)
                    } else {
                        res.json().then(data => {
                            toast({
                                variant: "destructive",
                                title: "Submission Failed",
                                description: data.message || "Failed to submit request",
                            })
                        })
                    }
                })
                .catch((err) => {
                    console.error(err)
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Something went wrong. Please try again.",
                    })
                })
                .finally(() => {
                    setLoading(false)
                })
        } else {
            toast({
                variant: "destructive",
                title: "Incomplete Form",
                description: "Please fill in all required fields.",
            })
        }
    }


    return (
        <div className="relative">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section header: Old Vehicle */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white">
                        <Car className="w-5 h-5 text-emerald-400" />
                        <h4 className="font-bold">Your Current Vehicle</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className={labelClasses}>Registration No.*</label>
                            <input
                                type="text"
                                name="oldVehicleRegistration"
                                value={formData.oldVehicleRegistration}
                                onChange={handleChange}
                                placeholder="e.g. MH 04 AB 1234"
                                className={inputClasses}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className={labelClasses}>Vehicle Brand*</label>
                            <select
                                name="oldVehicleBrand"
                                value={formData.oldVehicleBrand}
                                onChange={handleChange}
                                className={inputClasses}
                                required
                            >
                                <option value="">Select Brand</option>
                                {brands.map((brand) => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-1">
                            <label className={labelClasses}>Model*</label>
                            <input
                                type="text"
                                name="oldVehicleModel"
                                value={formData.oldVehicleModel}
                                onChange={handleChange}
                                placeholder="e.g. Swift"
                                className={inputClasses}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className={labelClasses}>Year*</label>
                            <select
                                name="oldVehicleYear"
                                value={formData.oldVehicleYear}
                                onChange={handleChange}
                                className={inputClasses}
                                required
                            >
                                <option value="">Select Year</option>
                                {years.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className={labelClasses}>Fuel*</label>
                            <select
                                name="oldVehicleFuelType"
                                value={formData.oldVehicleFuelType}
                                onChange={handleChange}
                                className={inputClasses}
                                required
                            >
                                <option value="">Fuel Type</option>
                                {fuelTypes.map((fuel) => (
                                    <option key={fuel} value={fuel}>{fuel}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section header: Upgrade Preference */}
                <div className="space-y-4 border-t border-gray-200 pt-8">
                    <div className="flex items-center gap-2 text-gray-900">
                        <ChevronRight className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-bold">Upgrade Preference</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className={labelClasses}>Interested In*</label>
                            <select
                                name="newVehicleBrand"
                                value={formData.newVehicleBrand}
                                onChange={handleChange}
                                className={inputClasses}
                                required
                            >
                                <option value="">Select Brand</option>
                                {brands.map((brand) => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className={labelClasses}>Preferred Model</label>
                            <input
                                type="text"
                                name="newVehicleModel"
                                value={formData.newVehicleModel}
                                onChange={handleChange}
                                placeholder="Optional"
                                className={inputClasses}
                            />
                        </div>
                    </div>
                </div>

                {/* Section header: Personal & Location */}
                <div className="space-y-4 border-t border-gray-200 pt-8">
                    <div className="flex items-center gap-2 text-gray-900">
                        <User className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-bold">Your Details</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className={labelClasses}>Full Name*</label>
                            <input
                                type="text"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleChange}
                                placeholder="Enter Name"
                                className={inputClasses}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className={labelClasses}>Phone Number*</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="tel"
                                    name="customerPhone"
                                    value={formData.customerPhone}
                                    onChange={handleChange}
                                    placeholder="Enter Mobile"
                                    className={`${inputClasses} pl-12`}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className={labelClasses}>State*</label>
                            <select
                                name="state"
                                value={formData.state}
                                onChange={(e) => {
                                    const newState = e.target.value;
                                    setFormData(prev => ({ ...prev, state: newState, city: "" }));
                                }}
                                className={inputClasses}
                                required
                            >
                                <option value="">Select State</option>
                                {states.map((state) => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className={labelClasses}>City*</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    disabled={!formData.state}
                                    className={`${inputClasses} pl-12 disabled:opacity-30`}
                                    required
                                >
                                    <option value="">Select City</option>
                                    <option value="other">Other</option>
                                    {formData.state && indiaData[formData.state as string]?.map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Custom City - Conditional */}
                    {formData.city === "other" && (
                        <div className="space-y-1">
                            <label className={labelClasses}>Type Your City Name*</label>
                            <input
                                type="text"
                                name="customCity"
                                value={formData.customCity}
                                onChange={handleChange}
                                placeholder="Enter city name"
                                className={inputClasses}
                                required={formData.city === "other"}
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className={labelClasses}>Pincode*</label>
                        <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            placeholder="6-digit pincode"
                            maxLength={6}
                            className={inputClasses}
                            required
                        />
                    </div>
                </div>

                <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full relative group disabled:opacity-70 disabled:cursor-not-allowed"
                    whileHover={!loading ? { scale: 1.01 } : {}}
                    whileTap={!loading ? { scale: 0.99 } : {}}
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                    <div className="relative bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 group-hover:from-emerald-600 group-hover:to-emerald-700 transition-all duration-300">
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        <span>{loading ? "Checking..." : "Check Exchange Value"}</span>
                        {!loading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </div>
                </motion.button>
            </form>

            {/* Intermediate CC Modal */}
            <AnimatePresence>
                {showIntermediateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full border border-gray-200 p-10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none"></div>

                            <div className="flex justify-center mb-8">
                                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 relative">
                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-20"></div>
                                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Request Submitted!</h2>
                            <div className="text-center mb-10">
                                <p className="font-semibold text-emerald-600 text-lg mb-2">Our team will call you shortly</p>
                                <p className="text-sm text-gray-500">Please complete the final eKYC step to finalize your exchange valuation.</p>
                            </div>

                            <button
                                onClick={() => {
                                    setShowIntermediateModal(false)
                                    // Redirect to specific eKYC page
                                    // setShowEKYC(true) // Removed inline modal
                                    window.location.href = "/ekyc/exchange-vehicle"
                                }}
                                className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors duration-300 group"
                            >
                                <span>Complete eKYC</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-white" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* eKYC Form Modal */}
            <AnimatePresence>
                {showEKYC && (
                    <EKYCForm
                        formData={{
                            ...formData,
                            registrationNumber: formData.oldVehicleRegistration,
                            brand: formData.oldVehicleBrand,
                            model: formData.oldVehicleModel,
                            registrationYear: formData.oldVehicleYear,
                            fuelType: formData.oldVehicleFuelType,
                            name: formData.customerName,
                            phone: formData.customerPhone,
                        }}
                        onBack={() => setShowEKYC(false)}
                        valuation={0}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

