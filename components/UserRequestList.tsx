"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
    Sparkles
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
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-900/20 text-yellow-400 border border-yellow-900/30">
                        <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                )
            case "reviewing":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/20 text-blue-400 border border-blue-900/30">
                        <Clock className="w-3.5 h-3.5 animate-pulse" /> Reviewing
                    </span>
                )
            case "contacted":
            case "reviewed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-900/20 text-indigo-400 border border-indigo-900/30">
                        <CheckCircle className="w-3.5 h-3.5" /> Reviewed
                    </span>
                )
            case "approved":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/20 text-emerald-400 border border-emerald-900/30">
                        <CheckCircle className="w-3.5 h-3.5" /> Approved
                    </span>
                )
            case "pickup_scheduled":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/20 text-blue-400 border border-blue-900/30">
                        <Car className="w-3.5 h-3.5" /> Pickup Scheduled
                    </span>
                )
            case "reached_collection_centre":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-900/20 text-purple-400 border border-purple-900/30">
                        <CheckCircle className="w-3.5 h-3.5" /> Reached Collection Centre
                    </span>
                )
            case "car_scrapped":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-900/20 text-red-400 border border-red-900/30">
                        <CheckCircle className="w-3.5 h-3.5" /> Vehicle Scrapped Successfully
                    </span>
                )
            case "completed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-900/20 text-green-400 border border-green-900/30">
                        <CheckCircle className="w-3.5 h-3.5" /> Completed
                    </span>
                )
            case "rejected":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-900/20 text-red-400 border border-red-900/30">
                        <X className="w-3.5 h-3.5" /> Rejected
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-gray-300 border border-slate-700">
                        {status}
                    </span>
                )
        }
    }

    const getTypeDisplayName = (type: string) => {
        switch (type) {
            case 'valuation': return "Get Free Quote"
            case 'scrap': return "Scrap Vehicle"
            case 'scrap-buy': return "Scrap & Buy New"
            case 'sell': 
            case 'wizard-sell': return "Sell Old Vehicle"
            case 'exchange': return "Exchange Vehicle"
            case 'buy': 
            case 'wizard-buy': return "Buy New Vehicle"
            default: return "Vehicle Request"
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'valuation': 
            case 'scrap': return { bg: "bg-blue-900/20", text: "text-blue-400", border: "border-blue-900/30", hoverBg: "group-hover:bg-blue-900/30", hoverText: "group-hover:text-blue-300", solid: "bg-blue-600" }
            case 'sell': 
            case 'wizard-sell': return { bg: "bg-green-900/20", text: "text-green-400", border: "border-green-900/30", hoverBg: "group-hover:bg-green-900/30", hoverText: "group-hover:text-green-300", solid: "bg-green-600" }
            case 'exchange': 
            case 'scrap-buy': return { bg: "bg-purple-900/20", text: "text-purple-400", border: "border-purple-900/30", hoverBg: "group-hover:bg-purple-900/30", hoverText: "group-hover:text-purple-300", solid: "bg-purple-600" }
            case 'buy': 
            case 'wizard-buy': return { bg: "bg-orange-900/20", text: "text-orange-400", border: "border-orange-900/30", hoverBg: "group-hover:bg-orange-900/30", hoverText: "group-hover:text-orange-300", solid: "bg-orange-600" }
            default: return { bg: "bg-slate-800", text: "text-slate-400", border: "border-slate-700", hoverBg: "group-hover:bg-slate-700", hoverText: "group-hover:text-slate-300", solid: "bg-slate-800" }
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
                            className="bg-[#0E192D] rounded-2xl p-6 shadow-sm shadow-black/20 border border-slate-800 hover:shadow-md hover:border-slate-700 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl transition-colors ${colors.bg} ${colors.text} ${colors.hoverBg} ${colors.hoverText}`}>
                                        {getTypeIcon(req.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                            {getRequestTitle(req)}
                                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-black ${colors.bg} ${colors.text}`}>
                                                {getTypeDisplayName(req.type)}
                                            </span>
                                        </h3>
                                        <p className="text-sm text-gray-400 font-mono mt-0.5">{getRequestSubtitle(req)}</p>
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {mounted ? new Date(req.createdAt).toLocaleDateString() : "Loading..."}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    {getStatusBadge(req.status)}
                                    <div className={`flex items-center gap-1 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity ${colors.text}`}>
                                        View Details <ChevronRight className="w-4 h-4" />
                                    </div>
                                    {req.type === 'valuation' && req.estimatedValue != null && (
                                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-900/20 px-2.5 py-1.5 rounded-lg border border-emerald-900/30">
                                            ₹{(req.estimatedValue * 0.8).toLocaleString('en-IN')} - ₹{(req.estimatedValue * 1.2).toLocaleString('en-IN')}
                                        </div>
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
                            className="bg-[#0E192D] rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden relative border border-slate-800 flex flex-col max-h-[90vh]"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors z-10"
                            >
                                <X className="w-5 h-5 text-gray-400" />
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
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-emerald-900/20 rounded-2xl border border-emerald-900/30 gap-2">
                                        <span className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                                            Estimated Scrap Value
                                        </span>
                                        <span className="text-xl sm:text-2xl font-black text-emerald-300">
                                            ₹{(selectedRequest.estimatedValue * 0.8).toLocaleString('en-IN')} - ₹{(selectedRequest.estimatedValue * 1.2).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                )}

                                {/* Status Timeline Section */}
                                <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Status Tracking</span>
                                        {getStatusBadge(selectedRequest.status)}
                                    </div>
                                    
                                    <div className="relative border-l-2 border-slate-700 ml-3 space-y-6">
                                        {(() => {
                                            const steps = [
                                                { id: 'pending', label: 'Request Submitted', description: 'Customer requested service.', icon: <Clock className="w-4 h-4" />, date: selectedRequest.createdAt },
                                                { id: 'approved', label: 'Approved & Published', description: 'Verified by Admin/Executive and published to B2B marketplace.', icon: <CheckCircle className="w-4 h-4" />, date: selectedRequest.updatedAt },
                                                { id: 'pickup_scheduled', label: 'Pickup Scheduled', description: 'A B2B Partner has accepted the lead.', icon: <Car className="w-4 h-4" />, date: null },
                                                { id: 'reached_collection_centre', label: 'Reached Collection Centre', description: 'Vehicle successfully arrived at ScrapCentre.', icon: <CheckCircle className="w-4 h-4" />, date: null },
                                                { id: 'car_scrapped', label: 'Vehicle Scrapped Successfully', description: 'Final processing completed.', icon: <CheckCircle className="w-4 h-4" />, date: null }
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
                                                            className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-4 border-[#0E192D] flex items-center justify-center transition-colors
                                                                ${isCompleted ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-slate-800 text-slate-500'}
                                                            `}
                                                        >
                                                            {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : step.icon}
                                                        </div>
                                                        <div>
                                                            <h4 className={`text-sm font-bold ${isCompleted ? 'text-white' : 'text-slate-500'}`}>
                                                                {step.label}
                                                            </h4>
                                                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                                                {step.description}
                                                            </p>
                                                            {isCompleted && step.date && index < 2 && (
                                                                <p className="text-[10px] font-bold text-blue-400 mt-2 uppercase tracking-widest flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    {selectedRequest.type === 'valuation' && (
                                        <>
                                            <DetailItem icon={<Car />} label="Vehicle Type" value={selectedRequest.vehicleType} />
                                            <DetailItem icon={<Calendar />} label="Model Year" value={selectedRequest.year} />
                                            <DetailItem icon={<Scale />} label="Approx Weight" value={`${selectedRequest.vehicleWeight} Tons`} />
                                            <DetailItem icon={<MapPin />} label="Pincode" value={selectedRequest.address?.pincode} />
                                            {selectedRequest.distance !== undefined && selectedRequest.distance !== null && (
                                                <DetailItem icon={<MapPin />} label="Distance" value={`${selectedRequest.distance} km`} />
                                            )}
                                            {selectedRequest.pickupCost !== undefined && selectedRequest.pickupCost !== null && (
                                                <DetailItem icon={<IndianRupee />} label="Pickup Cost" value={selectedRequest.pickupCost === 0 ? "Free (< 100km)" : `${selectedRequest.pickupCost.toLocaleString("en-IN")}`} />
                                            )}
                                            {selectedRequest.estimatedValue != null && (
                                                <DetailItem icon={null} label="Estimated Value" value={`₹${(selectedRequest.estimatedValue * 0.8).toLocaleString("en-IN")} - ₹${(selectedRequest.estimatedValue * 1.2).toLocaleString("en-IN")}`} />
                                            )}
                                        </>
                                    )}

                                    {selectedRequest.type === 'sell' && (
                                        <>
                                            <DetailItem icon={<Hash />} label="Reg. Number" value={selectedRequest.registrationNumber} />
                                            <DetailItem icon={<Calendar />} label="Reg. Year" value={selectedRequest.registrationYear} />
                                            <DetailItem icon={<Fuel />} label="Fuel Type" value={selectedRequest.fuelType} />
                                            <DetailItem icon={<IndianRupee />} label="Pending Loan" value={selectedRequest.pendingLoan} />
                                            <DetailItem icon={<MapPin />} label="Location" value={`${selectedRequest.city}, ${selectedRequest.state}`} />
                                            <DetailItem icon={<MapPin />} label="Pincode" value={selectedRequest.pincode} />
                                        </>
                                    )}

                                    {selectedRequest.type === 'exchange' && (
                                        <>
                                            <DetailItem icon={<Hash />} label="Old Reg. No" value={selectedRequest.oldVehicleRegistration} />
                                            <DetailItem icon={<Calendar />} label="Old Year" value={selectedRequest.oldVehicleYear} />
                                            <DetailItem icon={<Fuel />} label="Old Fuel" value={selectedRequest.oldVehicleFuelType} />
                                            <DetailItem icon={<ShoppingCart />} label="New Brand" value={selectedRequest.newVehicleBrand} />
                                            <DetailItem icon={<Box />} label="New Model" value={selectedRequest.newVehicleModel} />
                                            <DetailItem icon={<MapPin />} label="Location" value={`${selectedRequest.city}, ${selectedRequest.state}`} />
                                        </>
                                    )}

                                    {selectedRequest.type === 'buy' && (
                                        <>
                                            <DetailItem icon={<IndianRupee />} label="Budget" value={selectedRequest.budgetRange} />
                                            <DetailItem icon={<Fuel />} label="Fuel Preference" value={selectedRequest.fuelType} />
                                            <DetailItem icon={<MapPin />} label="Location" value={`${selectedRequest.city}, ${selectedRequest.state}`} />
                                            <DetailItem icon={<MapPin />} label="Pincode" value={selectedRequest.pincode} />
                                        </>
                                    )}

                                    {/* New WizardLead Types */}
                                    {selectedRequest.type === 'scrap' && (
                                        <>
                                            <DetailItem icon={<Hash />} label="Reg. Number" value={selectedRequest.regNo} />
                                            <DetailItem icon={<Calendar />} label="Model Year" value={selectedRequest.year} />
                                            <DetailItem icon={<Scale />} label="Approx Weight" value={`${selectedRequest.weight} kg`} />
                                            <DetailItem icon={<MapPin />} label="Pincode" value={selectedRequest.pincode} />
                                        </>
                                    )}

                                    {selectedRequest.type === 'scrap-buy' && (
                                        <>
                                            <DetailItem icon={<Hash />} label="Scrap Reg. No" value={selectedRequest.regNo} />
                                            <DetailItem icon={<Calendar />} label="Scrap Year" value={selectedRequest.year} />
                                            <DetailItem icon={<ShoppingCart />} label="Desired Brand" value={selectedRequest.desiredCompany} />
                                            <DetailItem icon={<Box />} label="Desired Model" value={selectedRequest.desiredModel} />
                                            <DetailItem icon={<MapPin />} label="Pincode" value={selectedRequest.pincode} />
                                        </>
                                    )}

                                    {selectedRequest.type === 'wizard-sell' && (
                                        <>
                                            <DetailItem icon={<Hash />} label="Reg. Number" value={selectedRequest.regNo} />
                                            <DetailItem icon={<Calendar />} label="Model Year" value={selectedRequest.year} />
                                            <DetailItem icon={<Clock />} label="Kms Driven" value={selectedRequest.kms} />
                                            <DetailItem icon={<MapPin />} label="Pincode" value={selectedRequest.pincode} />
                                        </>
                                    )}

                                    {selectedRequest.type === 'wizard-buy' && (
                                        <>
                                            <DetailItem icon={<ShoppingCart />} label="Desired Brand" value={selectedRequest.desiredCompany} />
                                            <DetailItem icon={<Box />} label="Desired Model" value={selectedRequest.desiredModel} />
                                            <DetailItem icon={<MapPin />} label="Pincode" value={selectedRequest.pincode} />
                                        </>
                                    )}
                                </div>

                                {/* Contact Information */}
                                <div className="pt-5 border-t border-slate-800">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Contact Information</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-orange-900/10 p-4 sm:p-5 rounded-2xl border border-orange-900/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shadow-sm text-orange-500">
                                                <UserIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500">Name</p>
                                                <p className="text-sm font-bold text-white">
                                                    {selectedRequest.type === 'valuation' ? selectedRequest.contact?.name : selectedRequest.name || selectedRequest.customerName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shadow-sm text-orange-500">
                                                <Smartphone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500">Phone</p>
                                                <p className="text-sm font-bold text-white">
                                                    {selectedRequest.type === 'valuation' ? selectedRequest.contact?.phone : selectedRequest.phone || selectedRequest.customerPhone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Note */}
                                <div className="pt-4 text-center">
                                    <p className="text-xs text-gray-400 italic">Submitted on {mounted ? new Date(selectedRequest.createdAt).toLocaleString() : "..."}</p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 shrink-0">
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="w-full bg-white hover:bg-gray-200 text-slate-900 font-bold py-3 sm:py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98]"
                                >
                                    Done
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
        <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                {icon} {label}
            </p>
            <p className="text-sm font-bold text-white">{value || "N/A"}</p>
        </div>
    )
}

