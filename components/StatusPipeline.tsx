import React from "react"
import { Lock, MessageSquare, Building2, Truck, CheckCircle, Check } from "lucide-react"

interface StatusPipelineProps {
    status: string
}

export default function StatusPipeline({ status }: StatusPipelineProps) {
    const stages = [
        { key: "locked_lead", label: "Locked", icon: Lock },
        { key: "negotiation_phase", label: "Negotiation", icon: MessageSquare },
        { key: "assigned_to_cc", label: "Assigned", icon: Building2 },
        { key: "vehicle_picked_up", label: "Picked Up", icon: Truck },
        { key: "scraped_successfully", label: "Scraped", icon: CheckCircle },
    ]

    // Fallback if status is something else
    let currentIdx = stages.findIndex(s => s.key === status)
    if (currentIdx === -1) {
        // Handle legacy statuses mapping
        if (status === "accepted") {
            currentIdx = 2 // Assigned to CC
        } else {
            currentIdx = 0
        }
    }
    
    return (
        <div className="w-full py-2 bg-slate-55 rounded-xl border border-slate-100 p-2 sm:p-3">
            <div className="flex items-center justify-between relative">
                {stages.map((stage, idx) => {
                    const Icon = stage.icon
                    const isCompleted = idx < currentIdx
                    const isActive = idx === currentIdx
                    const isUpcoming = idx > currentIdx

                    return (
                        <div key={stage.key} className="flex flex-col items-center flex-1 relative z-10">
                            {/* Connector Line */}
                            {idx > 0 && (
                                <div 
                                    className={`absolute top-4 -left-1/2 right-1/2 h-0.5 -translate-y-1/2 z-[-1] transition-all duration-300 ${
                                        idx <= currentIdx ? "bg-emerald-500" : "bg-slate-200"
                                    }`}
                                />
                            )}
                            
                            {/* Node */}
                            <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                                    isCompleted 
                                        ? "bg-emerald-50 border-emerald-500 text-emerald-500 shadow-sm shadow-emerald-100" 
                                        : isActive 
                                        ? "bg-red-50 border-[#E31E24] text-[#E31E24] shadow-md shadow-red-100 animate-pulse scale-105" 
                                        : "bg-white border-slate-200 text-slate-400"
                                }`}
                            >
                                {isCompleted ? (
                                    <Check className="w-4 h-4 stroke-[3]" />
                                ) : (
                                    <Icon className="w-4 h-4" />
                                )}
                            </div>

                            {/* Label */}
                            <span 
                                className={`text-[9px] font-black uppercase tracking-wider mt-1.5 text-center hidden sm:block ${
                                    isActive 
                                        ? "text-[#E31E24]" 
                                        : isCompleted 
                                        ? "text-emerald-600" 
                                        : "text-slate-400"
                                }`}
                            >
                                {stage.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
