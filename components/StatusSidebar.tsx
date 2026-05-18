"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, Clock, Truck, Building2, Car, Calendar, MapPin } from "lucide-react"

interface StatusSidebarProps {
    isOpen: boolean
    onClose: () => void
    lead: any
}

export default function StatusSidebar({ isOpen, onClose, lead }: StatusSidebarProps) {
    if (!lead) return null

    // Helper to get customer name based on lead type
    const customerName = lead.contact?.name || lead.name || lead.customerName || "N/A"
    const vehicleInfo = lead.type === 'quote' ? `${lead.year} ${lead.brand} ${lead.model}` :
                        lead.type === 'sell' ? `${lead.registrationYear} ${lead.brand} ${lead.model}` :
                        lead.type === 'exchange' ? `Exchange: ${lead.oldVehicleBrand} -> ${lead.newVehicleBrand}` :
                        lead.type === 'buy' ? `Buying: ${lead.vehicleBrand} ${lead.vehicleModel}` : lead.vehicleInfo

    // Define timeline steps based on ScrapCentre's workflow
    const steps = [
        {
            id: 'pending',
            label: 'Request Submitted',
            description: 'Customer requested service.',
            icon: <Clock className="w-4 h-4" />,
            date: lead.createdAt
        },
        {
            id: 'approved',
            label: 'Approved & Published',
            description: 'Verified by Admin/Executive and published to B2B marketplace.',
            icon: <CheckCircle className="w-4 h-4" />,
            date: lead.updatedAt // Approximation for approval date
        },
        {
            id: 'pickup_scheduled',
            label: 'Pickup Scheduled',
            description: 'A B2B Partner has accepted the lead.',
            icon: <Truck className="w-4 h-4" />,
            date: null
        },
        {
            id: 'reached_collection_centre',
            label: 'Reached Collection Centre',
            description: 'Vehicle successfully arrived at ScrapCentre.',
            icon: <Building2 className="w-4 h-4" />,
            date: null
        },
        {
            id: 'car_scrapped',
            label: 'Vehicle Scrapped Successfully',
            description: 'Final processing completed.',
            icon: <Car className="w-4 h-4" />,
            date: null
        }
    ]

    // Determine current step index
    const currentStatus = lead.status || 'pending'
    let currentIndex = 0
    if (currentStatus === 'approved') currentIndex = 1
    if (currentStatus === 'pickup_scheduled') currentIndex = 2
    if (currentStatus === 'reached_collection_centre') currentIndex = 3
    if (currentStatus === 'car_scrapped') currentIndex = 4

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white dark:bg-[#0E192D] shadow-2xl border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col overflow-hidden font-sans"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    Vehicle Status
                                </h2>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Tracking Timeline</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Quick Details Card */}
                            <div className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                                    <Car className="w-4 h-4 text-blue-500" />
                                    Overview
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Customer</p>
                                        <p className="font-medium text-slate-900 dark:text-white text-sm">{customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vehicle</p>
                                        <p className="font-medium text-slate-900 dark:text-white text-sm">{vehicleInfo}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</p>
                                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mt-1">
                                                {lead.type || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest">Tracking Journey</h3>
                                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-8">
                                    {steps.map((step, index) => {
                                        const isCompleted = index <= currentIndex
                                        const isCurrent = index === currentIndex

                                        return (
                                            <div key={step.id} className="relative pl-8">
                                                {/* Icon Node */}
                                                <div 
                                                    className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-4 border-white dark:border-[#0E192D] flex items-center justify-center transition-colors
                                                        ${isCompleted ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}
                                                    `}
                                                >
                                                    {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : step.icon}
                                                </div>

                                                {/* Text Content */}
                                                <div>
                                                    <h4 className={`text-sm font-bold ${isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-500'}`}>
                                                        {step.label}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                                        {step.description}
                                                    </p>
                                                    {isCompleted && step.date && (
                                                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-2 uppercase tracking-widest flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(step.date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
