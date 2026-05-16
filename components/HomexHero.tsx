"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Star, ShieldCheck, Zap, Award, Smartphone, Car, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomexHero() {
    const [vehicleNumber, setVehicleNumber] = useState("")
    const router = useRouter()

    const [isFetching, setIsFetching] = useState(false)

    const handleFetchData = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!vehicleNumber || vehicleNumber.trim().length < 4) return
        
        setIsFetching(true)
        
        try {
            // Demo fallback for local testing
            let vehicleInfo: any = null;
            if (vehicleNumber.includes("1234") || vehicleNumber.includes("TEST")) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                vehicleInfo = {
                    regNo: vehicleNumber,
                    brand: "Maruti Suzuki",
                    model: "Swift VXI",
                    year: "2018",
                    weight: "1250",
                    fuel: "Petrol"
                };
            } else {
                const response = await fetch('/api/vehicle-lookup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_number: vehicleNumber }),
                });
                const rawData = await response.json();
                if (!response.ok) throw new Error(rawData.error || 'Failed to fetch vehicle details');
                const data = rawData?.data?.client_id ? rawData.data : rawData;
                vehicleInfo = {
                    regNo: vehicleNumber,
                    brand: data.maker_description || data.maker_name || data.maker || data.rc_maker || "",
                    model: data.model_description || data.model_name || data.maker_model || data.model || data.rc_model || data.rc_model_name || "",
                    year: data.registration_date ? data.registration_date.split('-')[0] : data.manufacturing_year || "",
                    weight: data.vehicle_weight || data.unladen_weight || "",
                    fuel: data.fuel_type || ""
                };
            }

            // Dispatch event to wizard with fetched data
            window.dispatchEvent(new CustomEvent('hero-vehicle-data', { detail: vehicleInfo }));
            
            // Smooth scroll to services section
            const servicesEl = document.getElementById('services');
            if (servicesEl) {
                servicesEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (err: any) {
            // On error, still scroll down but with just the reg number
            window.dispatchEvent(new CustomEvent('hero-vehicle-data', { detail: {
                regNo: vehicleNumber,
                brand: "", model: "", year: "", weight: "", fuel: ""
            }}));
            const servicesEl = document.getElementById('services');
            if (servicesEl) {
                servicesEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } finally {
            setIsFetching(false)
        }
    }

    const features = [
        { 
            title: "Best Value", 
            text: "Get the maximum value for your vehicle", 
            icon: Award,
        },
        { 
            title: "OEM Benefits", 
            text: "Genuine & trusted OEM partnerships", 
            icon: ShieldCheck,
        },
        { 
            title: "COD Support", 
            text: "Dedicated support at every step", 
            icon: Smartphone,
        },
        { 
            title: "Fast Process", 
            text: "Quick & hassle-free scrapping process", 
            icon: Zap,
        }
    ]

    return (
        <div className="relative w-full min-h-screen overflow-hidden flex flex-col">
            {/* Full Screen Background Image */}
            <div className="absolute inset-0 z-0 bg-white">
                {/* Mobile BG */}
                <img 
                    src="/mobileres.png" 
                    alt="Scrapping Facility Background Mobile" 
                    className="w-full h-full object-cover lg:hidden pointer-events-none"
                />
                {/* Desktop BG */}
                <img 
                    src="/herobg.png" 
                    alt="Scrapping Facility Background" 
                    className="w-full h-full object-fill hidden lg:block pointer-events-none"
                />
            </div>

            <div className="relative z-20 container mx-auto px-6 lg:pl-24 flex-1 flex flex-col items-center lg:items-start justify-center pt-28 pb-12 lg:pt-24 lg:pb-0">
                {/* Content Area - Aligned to Left */}
                <div className="max-w-4xl lg:text-left text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-bebas font-bold text-[#1A1A1A] leading-[0.95] mb-6 tracking-[0.03em] uppercase"
                    >
                        <span className="text-[#E31E24]">India&apos;s</span> largest <br />
                        capacity <span className="relative inline-block">
                            <span className="text-[#E31E24]">RVSF</span>
                            <motion.div 
                                className="absolute -bottom-1 left-0 h-1 md:h-1.5 bg-[#E31E24] rounded-full"
                                animate={{ 
                                    width: ["0%", "100%", "0%"] 
                                }}
                                transition={{ 
                                    duration: 3, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-slate-600 text-base sm:text-lg font-medium mb-8 max-w-lg lg:mx-0 mx-auto"
                    >
                        Environmentally responsible scrapping with maximum value for your vehicle.
                    </motion.p>

                    {/* Main Input Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="w-full max-w-2xl"
                    >
                        <div className="bg-white p-2 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-[#E31E24]/40 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)]">
                            <form onSubmit={handleFetchData} className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
                                <div className="flex-1 flex items-center px-2 sm:px-4 gap-3 sm:gap-5">
                                    <div className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl sm:rounded-2xl shrink-0">
                                        <img src="/herologo.png" className="w-12 h-12 sm:w-18 sm:h-18 object-contain" alt="Registration Logo" />
                                    </div>
                                    <div className="flex flex-col items-start overflow-hidden w-full">
                                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5 sm:mb-1">Enter Registration Number</span>
                                        <input
                                            type="text"
                                            placeholder="E.g. DL1CAB1234"
                                            value={vehicleNumber}
                                            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                                            className="w-full bg-transparent text-[#1A1A1A] font-bold text-lg sm:text-2xl focus:outline-none uppercase tracking-[0.1em] sm:tracking-[0.15em] placeholder:text-sm sm:placeholder:text-base placeholder:text-slate-300 placeholder:font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="hidden sm:block w-px h-12 bg-slate-100 mx-2" />
                                <button
                                    type="submit"
                                    disabled={isFetching}
                                    className="c-button--gooey h-14 sm:h-16 px-8 sm:px-12 bg-[#E31E24] text-white font-bold text-sm rounded-xl sm:rounded-[1.25rem] transition-all flex items-center justify-center gap-3 sm:gap-4 group shrink-0 shadow-xl shadow-red-500/20 disabled:opacity-70"
                                >
                                    <span className="relative z-10 flex items-center gap-3 sm:gap-4">
                                        {isFetching ? "Fetching..." : "FETCH DATA"}
                                        {!isFetching && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />}
                                    </span>
                                    <div className="c-button__blobs">
                                        <div />
                                        <div />
                                        <div />
                                    </div>
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Benefits Bar */}
            <div className="relative z-20 w-full max-w-[1450px] mx-auto px-4 sm:px-6 pb-6 sm:pb-10 mt-auto">
                <div className="bg-white/95 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-10 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.12)] border-2 border-[#E31E24]/40">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row items-center justify-between gap-6 sm:gap-10 lg:gap-0">
                        {features.map((feature, idx) => (
                            <React.Fragment key={idx}>
                                <div className="flex items-center gap-4 sm:gap-6 group flex-1 justify-start lg:px-8">
                                    <div className="flex-shrink-0 w-14 h-14 sm:w-[72px] sm:h-[72px] flex items-center justify-center rounded-xl sm:rounded-2xl bg-slate-50 text-[#E31E24] transition-all duration-300 group-hover:bg-[#E31E24] group-hover:text-white group-hover:scale-110 shadow-sm border border-slate-100">
                                        <feature.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[#1A1A1A] font-bold text-sm sm:text-[17px] uppercase tracking-widest mb-0.5 sm:mb-1">
                                            {feature.title}
                                        </span>
                                        <span className="text-slate-500 text-xs sm:text-[14px] font-medium leading-relaxed max-w-[220px]">
                                            {feature.text}
                                        </span>
                                    </div>
                                </div>
                                {idx !== features.length - 1 && (
                                    <div className="hidden lg:block w-px h-10 bg-slate-200/60" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* SVG Filter for Gooey Effect */}
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ display: 'none' }}>
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                        <feBlend in="SourceGraphic" in2="goo" />
                    </filter>
                </defs>
            </svg>


        </div>
    )
}

