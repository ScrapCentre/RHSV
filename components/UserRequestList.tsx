"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
    Car,
    Calendar,
    Clock,
    CheckCircle,
    X,
    Smartphone,
    MapPin,
    Scale,
    User as UserIcon,
    ChevronRight,
    FileText,
    RefreshCw,
    ShoppingCart,
    Tag,
    Hash,
    Fuel,
    DollarSign,
    Box,
    IndianRupee,
    Recycle,
    Sparkles,
    MessageSquare,
    Shield,
    ArrowRight
} from "lucide-react"

interface BaseRequest {
    _id: string
    type: 'valuation' | 'sell' | 'exchange' | 'buy'
    status: string
    createdAt: string
}

interface UserRequestListProps {
    requests: any[]
}

export default function UserRequestList({ requests }: UserRequestListProps) {
    const t = useTranslations("ProfilePage.requests")
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted && requests.length > 0) {
            const params = new URLSearchParams(window.location.search)
            const leadId = params.get("leadId")
            if (leadId) {
                const matched = requests.find(r => r._id === leadId)
                if (matched) {
                    setSelectedRequest(matched)
                }
            }
        }
    }, [mounted, requests])

    const handleEkycClick = (e: React.MouseEvent, req: any) => {
        e.stopPropagation()
        // Pre-fill and prep localStorage for eKYC wizard
        localStorage.setItem("kycValuationId", req._id)
        localStorage.setItem("kycSource", req.type)
        localStorage.setItem("kycFormData", JSON.stringify({
            name: req.name || req.customerName || req.contact?.name || "",
            phone: req.phone || req.customerPhone || req.contact?.phone || "",
            state: req.state || "",
            city: req.city || "",
            pincode: req.pincode || "",
            brand: req.brand || req.oldVehicleBrand || req.vehicleBrand || "",
            model: req.model || req.oldVehicleModel || req.vehicleModel || "",
            year: req.year || req.oldVehicleYear || req.registrationYear || "",
            registrationNumber: req.regNo || req.oldVehicleRegistration || req.registrationNumber || ""
        }))
        // Redirect to standard ekyc verification wizard
        window.location.href = "/ekyc"
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                        <Clock className="w-3.5 h-3.5" /> {t("statuses.pending")}
                    </span>
                )
            case "reviewing":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 animate-pulse">
                        <Clock className="w-3.5 h-3.5" /> {t("statuses.reviewing")}
                    </span>
                )
            case "contacted":
            case "reviewed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <CheckCircle className="w-3.5 h-3.5" /> {t("statuses.reviewed")}
                    </span>
                )
            case "approved":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <CheckCircle className="w-3.5 h-3.5" /> {t("statuses.approved")}
                    </span>
                )
            case "pickup_scheduled":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-100">
                        <Car className="w-3.5 h-3.5" /> {t("statuses.pickup_scheduled")}
                    </span>
                )
            case "reached_collection_centre":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100">
                        <CheckCircle className="w-3.5 h-3.5" /> {t("statuses.reached_collection_centre")}
                    </span>
                )
            case "car_scrapped":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-650 border border-red-100">
                        <CheckCircle className="w-3.5 h-3.5" /> {t("statuses.car_scrapped")}
                    </span>
                )
            case "completed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <CheckCircle className="w-3.5 h-3.5" /> {t("statuses.completed")}
                    </span>
                )
            case "rejected":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                        <X className="w-3.5 h-3.5" /> {t("statuses.rejected")}
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                        {status}
                    </span>
                )
        }
    }

    const getTypeDisplayName = (type: string) => {
        switch (type) {
            case 'valuation': return t("types.valuation")
            case 'scrap': return t("types.scrap")
            case 'scrap-buy': return t("types.scrapBuy")
            case 'sell': 
            case 'wizard-sell': return t("types.sell")
            case 'exchange': return t("types.exchange")
            case 'buy': 
            case 'wizard-buy': return t("types.buy")
            default: return t("types.default")
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'valuation': 
            case 'scrap': return { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", hoverBg: "group-hover:bg-blue-100", hoverText: "group-hover:text-blue-700", solid: "bg-blue-600" }
            case 'sell': 
            case 'wizard-sell': return { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", hoverBg: "group-hover:bg-emerald-100", hoverText: "group-hover:text-emerald-700", solid: "bg-emerald-600" }
            case 'exchange': 
            case 'scrap-buy': return { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", hoverBg: "group-hover:bg-purple-100", hoverText: "group-hover:text-purple-700", solid: "bg-purple-600" }
            case 'buy': 
            case 'wizard-buy': return { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100", hoverBg: "group-hover:bg-orange-100", hoverText: "group-hover:text-orange-700", solid: "bg-orange-600" }
            default: return { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", hoverBg: "group-hover:bg-slate-200", hoverText: "group-hover:text-slate-700", solid: "bg-slate-800" }
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'valuation': return <Scale className="w-5 h-5" />
            case 'scrap': return <Recycle className="w-5 h-5" />
            case 'sell': 
            case 'wizard-sell': return <Tag className="w-5 h-5" />
            case 'exchange': return <RefreshCw className="w-5 h-5" />
            case 'scrap-buy': return <Sparkles className="w-5 h-5" />
            case 'buy': 
            case 'wizard-buy': return <ShoppingCart className="w-5 h-5" />
            default: return <FileText className="w-5 h-5" />
        }
    }

    const getRequestTitle = (req: any) => {
        if (req.type === 'buy') return `${req.vehicleBrand} ${req.vehicleModel}`
        if (req.type === 'wizard-buy') return `${req.desiredCompany} ${req.desiredModel}`
        if (req.type === 'valuation' || req.type === 'scrap' || req.type === 'sell' || req.type === 'wizard-sell' || req.type === 'scrap-buy') {
            return `${req.brand} ${req.model}`
        }
        if (req.type === 'exchange') return `${req.oldVehicleBrand} ${req.oldVehicleModel}`
        return "Vehicle Request"
    }

    const getRequestSubtitle = (req: any) => {
        if (req.type === 'valuation') return req.vehicleNumber || req.vehicleType
        if (req.type === 'sell') return req.registrationNumber
        if (req.type === 'exchange') return req.oldVehicleRegistration
        if (req.type === 'buy') return `${req.budgetRange} Budget`
        if (req.type === 'scrap' || req.type === 'wizard-sell' || req.type === 'scrap-buy') return req.regNo
        if (req.type === 'wizard-buy') return "New Vehicle Inquiry"
        return ""
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4">
                {requests.map((req) => {
                    const colors = getTypeColor(req.type)
                    return (
                        <motion.div
                            key={req._id}
                            layoutId={req._id}
                            onClick={() => setSelectedRequest(req)}
                            className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-red-200/50 hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)] transition-all duration-300 cursor-pointer group"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl transition-colors ${colors.bg} ${colors.text} ${colors.hoverBg} ${colors.hoverText} border ${colors.border}`}>
                                        {getTypeIcon(req.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
                                            {getRequestTitle(req)}
                                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-black border ${colors.border} ${colors.bg} ${colors.text}`}>
                                                {getTypeDisplayName(req.type)}
                                            </span>
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-500 font-mono mt-0.5">{getRequestSubtitle(req)}</p>
                                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5 font-medium">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {mounted ? new Date(req.createdAt).toLocaleDateString() : "Loading..."}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3 shrink-0">
                                    {getStatusBadge(req.status)}
                                    {req.type === 'valuation' && req.estimatedValue != null && (
                                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
                                            ₹{(req.estimatedValue * 0.8).toLocaleString('en-IN')} - ₹{(req.estimatedValue * 1.2).toLocaleString('en-IN')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons Section directly on the request card */}
                            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                <p className="text-[11px] text-slate-500 font-medium">
                                    {req.ekycStatus === "verified" ? (
                                        <span className="text-emerald-600 flex items-center gap-1.5 font-bold">
                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-550" /> {t("ekyc.verified")}
                                        </span>
                                    ) : req.ekycStatus === "reviewing" || req.ekycStatus === "submitted" ? (
                                        <span className="text-blue-600 flex items-center gap-1.5 font-bold animate-pulse">
                                            <Clock className="w-3.5 h-3.5 text-blue-550" /> {t("ekyc.underReview")}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">{t("ekyc.unlockBenefits")}</span>
                                    )}
                                </p>
                                <div className="flex items-center gap-2.5 w-full sm:w-auto mt-2 sm:mt-0">
                                    {/* Button 1: Complete eKYC */}
                                    {req.ekycStatus === "verified" ? (
                                        <button
                                            disabled
                                            className="px-4 py-2 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center gap-1.5 cursor-not-allowed opacity-85"
                                        >
                                            <CheckCircle className="w-3.5 h-3.5" /> {t("ekyc.btnVerified")}
                                        </button>
                                    ) : req.ekycStatus === "submitted" || req.ekycStatus === "reviewing" ? (
                                        <button
                                            disabled
                                            className="px-4 py-2 text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center gap-1.5 cursor-not-allowed opacity-85"
                                        >
                                            <Clock className="w-3.5 h-3.5" /> {t("ekyc.btnUnderReview")}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => handleEkycClick(e, req)}
                                            className="px-4 py-2 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-[#E31E24] hover:from-red-500 hover:to-red-600 text-white rounded-xl flex items-center gap-1.5 shadow-md shadow-red-600/10 active:scale-[0.97] transition-all whitespace-nowrap"
                                        >
                                            <Shield className="w-3.5 h-3.5 animate-pulse" /> {t("ekyc.btnComplete")}
                                        </button>
                                    )}

                                    {/* Button 2: Chat & Negotiate / View Details */}
                                    {req.chatThreadId ? (
                                        <Link
                                            href={`/profile/chat/${req.chatThreadId}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="px-4 py-2 text-[10px] font-black uppercase tracking-wider bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-[0.97] transition-all whitespace-nowrap"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5 text-red-500 animate-pulse" /> {t("actions.chat")}
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                 e.stopPropagation()
                                                 setSelectedRequest(req)
                                            }}
                                            className="px-4 py-2 text-[10px] font-black uppercase tracking-wider bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-[0.97] transition-all whitespace-nowrap"
                                        >
                                            <FileText className="w-3.5 h-3.5" /> {t("actions.details")}
                                        </button>
                                    )}
                                </div>
                            </div>

                        </motion.div>
                    )
                })}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedRequest && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] w-full max-w-md mx-auto overflow-hidden relative border border-slate-100 flex flex-col max-h-[90vh]"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors z-15"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Modal Header */}
                            <div className={`${getTypeColor(selectedRequest.type).solid} p-5 sm:p-6 text-white relative overflow-hidden shrink-0`}>
                                {/* Decorative circle */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                                <div className="flex items-center gap-3 mb-1 text-white/90 relative z-10">
                                    {getTypeIcon(selectedRequest.type)}
                                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">{getTypeDisplayName(selectedRequest.type)}</span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black relative z-10">{getRequestTitle(selectedRequest)}</h2>
                                <p className="text-sm text-white/80 mt-1 font-medium italic relative z-10">{getRequestSubtitle(selectedRequest)}</p>
                            </div>

                            {/* Modal Content */}
                            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto scrollbar-hide">
                                {/* Estimated Value Banner - valuation only */}
                                {selectedRequest.type === 'valuation' && selectedRequest.estimatedValue != null && (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100 gap-2">
                                        <span className="text-xs sm:text-sm font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-2">
                                            {t("modal.estimatedValue")}
                                        </span>
                                        <span className="text-xl sm:text-2xl font-black text-emerald-600">
                                            ₹{(selectedRequest.estimatedValue * 0.8).toLocaleString('en-IN')} - ₹{(selectedRequest.estimatedValue * 1.2).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                )}

                                {/* Status Timeline Section */}
                                <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wide">{t("modal.statusTracking")}</span>
                                        {getStatusBadge(selectedRequest.status)}
                                    </div>
                                    
                                    <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                                        {(() => {
                                            const steps = [
                                                { id: 'pending', label: t("modal.timeline.pending.title"), description: t("modal.timeline.pending.desc"), icon: <Clock className="w-4 h-4" />, date: selectedRequest.createdAt },
                                                { id: 'approved', label: t("modal.timeline.approved.title"), description: t("modal.timeline.approved.desc"), icon: <CheckCircle className="w-4 h-4" />, date: selectedRequest.updatedAt },
                                                { id: 'pickup_scheduled', label: t("modal.timeline.scheduled.title"), description: t("modal.timeline.scheduled.desc"), icon: <Car className="w-4 h-4" />, date: null },
                                                { id: 'reached_collection_centre', label: t("modal.timeline.reached.title"), description: t("modal.timeline.reached.desc"), icon: <CheckCircle className="w-4 h-4" />, date: null },
                                                { id: 'car_scrapped', label: t("modal.timeline.scrapped.title"), description: t("modal.timeline.scrapped.desc"), icon: <CheckCircle className="w-4 h-4" />, date: null }
                                            ];

                                            const currentStatus = selectedRequest.status || 'pending';
                                            let currentIndex = 0;
                                            if (currentStatus === 'approved') currentIndex = 1;
                                            if (currentStatus === 'pickup_scheduled') currentIndex = 2;
                                            if (currentStatus === 'reached_collection_centre') currentIndex = 3;
                                            if (currentStatus === 'car_scrapped' || currentStatus === 'completed') currentIndex = 4;

                                            return steps.map((step, index) => {
                                                const isCompleted = index <= currentIndex;
                                                return (
                                                    <div key={step.id} className="relative pl-8">
                                                        <div 
                                                            className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center transition-colors
                                                                ${isCompleted ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.25)]' : 'bg-slate-200 text-slate-400'}
                                                            `}
                                                        >
                                                            {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : React.cloneElement(step.icon as React.ReactElement<any>, { className: "w-3.5 h-3.5" })}
                                                        </div>
                                                        <div>
                                                            <h4 className={`text-sm font-bold ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                                                                {step.label}
                                                            </h4>
                                                            <p className={`text-xs mt-1 leading-relaxed ${isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                {step.description}
                                                            </p>
                                                            {isCompleted && step.date && index < 2 && (
                                                                <p className="text-[10px] font-bold text-blue-600 mt-2 uppercase tracking-widest flex items-center gap-1.5">
                                                                    <Calendar className="w-3 h-3 text-blue-500" />
                                                                    {new Date(step.date).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>

                                {/* Details Grid - Dynamic based on type */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {selectedRequest.type === 'valuation' && (
                                        <>
                                            <DetailItem icon={<Car />} label={t("modal.labels.vehicleType")} value={selectedRequest.vehicleType} />
                                            <DetailItem icon={<Calendar />} label={t("modal.labels.modelYear")} value={selectedRequest.year} />
                                            <DetailItem icon={<Scale />} label={t("modal.labels.approxWeight")} value={`${selectedRequest.vehicleWeight} Tons`} />
                                            <DetailItem icon={<MapPin />} label={t("modal.labels.pincode")} value={selectedRequest.address?.pincode} />
                                            {selectedRequest.distance !== undefined && selectedRequest.distance !== null && (
                                                <DetailItem icon={<MapPin />} label={t("modal.labels.distance")} value={`${selectedRequest.distance} km`} />
                                            )}
                                            {selectedRequest.pickupCost !== undefined && selectedRequest.pickupCost !== null && (
                                                <DetailItem icon={<IndianRupee />} label={t("modal.labels.pickupCost")} value={selectedRequest.pickupCost === 0 ? t("modal.labels.freeCost") : `${selectedRequest.pickupCost.toLocaleString("en-IN")}`} />
                                            )}
                                            {selectedRequest.estimatedValue != null && (
                                                <DetailItem icon={null} label={t("modal.labels.estimatedValue")} value={`₹${(selectedRequest.estimatedValue * 0.8).toLocaleString("en-IN")} - ₹${(selectedRequest.estimatedValue * 1.2).toLocaleString("en-IN")}`} />
                                            )}
                                        </>
                                    )}

                                    {selectedRequest.type === 'sell' && (
                                        <>
                                            <DetailItem icon={<Hash />} label={t("modal.labels.regNumber")} value={selectedRequest.registrationNumber} />
                                            <DetailItem icon={<Calendar />} label={t("modal.labels.regYear")} value={selectedRequest.registrationYear} />
                                            <DetailItem icon={<Fuel />} label={t("modal.labels.fuelType")} value={selectedRequest.fuelType} />
                                            <DetailItem icon={<IndianRupee />} label={t("modal.labels.pendingLoan")} value={selectedRequest.pendingLoan} />
                                            <DetailItem icon={<MapPin />} label={t("modal.labels.location")} value={`${selectedRequest.city}, ${selectedRequest.state}`} />
                                            <DetailItem icon={<MapPin />} label={t("modal.labels.pincode")} value={selectedRequest.pincode} />
                                        </>
                                    )}

                                    {selectedRequest.type === 'exchange' && (
                                        <>
                                            <DetailItem icon={<Hash />} label={t("modal.labels.oldRegNo")} value={selectedRequest.oldVehicleRegistration} />
                                            <DetailItem icon={<Calendar />} label={t("modal.labels.oldYear")} value={selectedRequest.oldVehicleYear} />
                                            <DetailItem icon={<Fuel />} label={t("modal.labels.oldFuel")} value={selectedRequest.oldVehicleFuelType} />
                                            <DetailItem icon={<ShoppingCart />} label={t("modal.labels.newBrand")} value={selectedRequest.newVehicleBrand} />
                                            <DetailItem icon={<Box />} label={t("modal.labels.newModel")} value={selectedRequest.newVehicleModel} />
                                            <DetailItem icon={<MapPin />} label={t("modal.labels.location")} value={`${selectedRequest.city}, ${selectedRequest.state}`} />
                                        </>
                                    )}

                                    {selectedRequest.type === 'buy' && (
                                        <>
                                            <DetailItem icon={<IndianRupee />} label={t("modal.labels.budget")} value={selectedRequest.budgetRange} />
                                            <DetailItem icon={<Fuel />} label={t("modal.labels.fuelPreference")} value={selectedRequest.fuelType} />
                                            <DetailItem icon={<MapPin />} label={t("modal.labels.location")} value={`${selectedRequest.city}, ${selectedRequest.state}`} />
                                            <DetailItem icon={<MapPin />} label={t("modal.labels.pincode")} value={selectedRequest.pincode} />
                                        </>
                                    )}

                                    {/* New WizardLead Types */}
                                    {selectedRequest.type === 'scrap' && (
                                        <>
                                            <DetailItem icon={<Hash />} label={t("modal.labels.regNumber")} value={selectedRequest.regNo} />
                                            <DetailItem icon={<Calendar />} label={t("modal.labels.modelYear")} value={selectedRequest.year} />
                                            <DetailItem icon={<Scale />} label={t("modal.labels.approxWeight")} value={`${selectedRequest.weight} kg`} />
                                            <DetailItem icon={<MapPin />} label={t("modal.labels.pincode")} value={selectedRequest.pincode} />
                                            {selectedRequest.ownerName && <DetailItem icon={<UserIcon />} label={t("modal.labels.ownerName")} value={selectedRequest.ownerName} />}
                                            {selectedRequest.fuel && selectedRequest.fuel.length > 0 && (
                                                <DetailItem icon={<Fuel />} label={t("modal.labels.fuelType")} value={Array.isArray(selectedRequest.fuel) ? selectedRequest.fuel.join(", ") : selectedRequest.fuel} />
                                            )}
                                        </>
                                    )}

                                    {selectedRequest.type === 'scrap-buy' && (
                                        <>
                                            <DetailItem icon={<Hash />} label={t("modal.labels.scrapRegNo")} value={selectedRequest.regNo} />
                                            <DetailItem icon={<Calendar />} label={t("modal.labels.scrapYear")} value={selectedRequest.year} />
                                            <DetailItem icon={<ShoppingCart />} label={t("modal.labels.desiredBrand")} value={selectedRequest.desiredCompany} />
                                            <DetailItem icon={<Box />} label={t("modal.labels.desiredModel")} value={selectedRequest.desiredModel} />
                                            <DetailItem icon={<MapPin />} label={t("modal.labels.pincode")} value={selectedRequest.pincode} />
                                            {selectedRequest.ownerName && <DetailItem icon={<UserIcon />} label={t("modal.labels.ownerName")} value={selectedRequest.ownerName} />}
                                            {selectedRequest.fuel && selectedRequest.fuel.length > 0 && (
                                                <DetailItem icon={<Fuel />} label={t("modal.labels.fuelType")} value={Array.isArray(selectedRequest.fuel) ? selectedRequest.fuel.join(", ") : selectedRequest.fuel} />
                                            )}
                                        </>
                                    )}

                                    {selectedRequest.type === 'wizard-sell' && (
                                        <>
                                            <DetailItem icon={<Hash />} label={t("modal.labels.regNumber")} value={selectedRequest.regNo} />
                                            <DetailItem icon={<Calendar />} label={t("modal.labels.modelYear")} value={selectedRequest.year} />
                                            <DetailItem icon={<Clock />} label={t("modal.labels.kmsDriven")} value={selectedRequest.kms} />
                                            <DetailItem icon={<MapPin />} label={t("modal.labels.pincode")} value={selectedRequest.pincode} />
                                        </>
                                    )}

                                    {selectedRequest.type === 'wizard-buy' && (
                                        <>
                                            <DetailItem icon={<ShoppingCart />} label={t("modal.labels.desiredBrand")} value={selectedRequest.desiredCompany} />
                                            <DetailItem icon={<Box />} label={t("modal.labels.desiredModel")} value={selectedRequest.desiredModel} />
                                            <DetailItem icon={<MapPin />} label={t("modal.labels.pincode")} value={selectedRequest.pincode} />
                                        </>
                                    )}
                                </div>

                                {/* Contact Information */}
                                <div className="pt-5 border-t border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t("modal.contact.title")}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100/85">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm text-[#E31E24] shrink-0">
                                                <UserIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400">{t("modal.contact.name")}</p>
                                                <p className="text-sm font-bold text-slate-800">
                                                    {selectedRequest.type === 'valuation' ? selectedRequest.contact?.name : selectedRequest.name || selectedRequest.customerName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm text-[#E31E24] shrink-0">
                                                <Smartphone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400">{t("modal.contact.phone")}</p>
                                                <p className="text-sm font-bold text-slate-800">
                                                    {selectedRequest.type === 'valuation' ? selectedRequest.contact?.phone : selectedRequest.phone || selectedRequest.customerPhone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Note */}
                                <div className="pt-4 text-center">
                                    <p className="text-xs text-slate-400 italic">{t("modal.submittedOn", { date: mounted ? new Date(selectedRequest.createdAt).toLocaleString() : "..." })}</p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 shrink-0 space-y-3">
                                {selectedRequest.chatThreadId && (
                                    <Link
                                        href={`/profile/chat/${selectedRequest.chatThreadId}`}
                                        className="w-full bg-[#E31E24] hover:bg-red-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 active:scale-[0.98]"
                                    >
                                        <MessageSquare className="w-4 h-4 animate-pulse" /> {t("actions.chat")} <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="w-full bg-white hover:bg-slate-100 text-slate-700 font-bold py-3 sm:py-3.5 rounded-xl transition-all border border-slate-200 active:scale-[0.98]"
                                >
                                    {t("actions.close")}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined }) {
    return (
        <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100/80">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                {icon && React.cloneElement(icon as React.ReactElement<any>, { className: "w-3 h-3 text-[#E31E24]" })} {label}
            </p>
            <p className="text-xs font-bold text-slate-800">{value || "N/A"}</p>
        </div>
    )
}

