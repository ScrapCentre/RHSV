"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Star, ShieldCheck, Zap, Award, Smartphone, Car, ArrowRight, Percent, FileCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { Plus_Jakarta_Sans } from "next/font/google"


const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
})

const normalizeFuelType = (fuel?: string): string => {
    if (!fuel) return "";
    const cleanFuel = fuel.trim().toUpperCase();
    const fuels: string[] = [];
    if (cleanFuel.includes("PETROL")) fuels.push("Petrol");
    if (cleanFuel.includes("DIESEL")) fuels.push("Diesel");
    if (cleanFuel.includes("CNG") || cleanFuel.includes("LPG")) fuels.push("CNG");
    if (cleanFuel.includes("ELECTRIC") || cleanFuel.includes("EV")) fuels.push("Electric");
    if (cleanFuel.includes("HYBRID")) fuels.push("Hybrid");
    
    if (fuels.length > 0) return fuels.join(", ");
    return fuel.charAt(0).toUpperCase() + fuel.slice(1).toLowerCase();
};

export default function HomexHero() {
    const [vehicleNumber, setVehicleNumber] = useState("")
    const router = useRouter()

    const [isFetching, setIsFetching] = useState(false)
    const [isRed, setIsRed] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setIsRed(prev => !prev)
        }, 1000)
        return () => clearInterval(interval)
    }, [])

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
                    fuel: normalizeFuelType(data.fuel_type)
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
            text: "Discount on registration fees for new vehicles.", 
            icon: Percent,
        },
        { 
            text: "Instant Certificate of Deposit (COD) issuance.", 
            icon: FileCheck,
        },
        { 
            text: "Exclusive OEM (Original Equipment Manufacturer) benefits.", 
            icon: ShieldCheck,
        },
        { 
            text: "Best-value vehicle buying & selling with COD support.", 
            icon: Car,
        },
        { 
            text: "Affordable facility to convert your vehicle to an EV.", 
            icon: Zap,
        }
    ]

    return (
        <div className="relative w-full min-h-screen overflow-x-hidden flex flex-col">
            {/* SVG Gooey Filter */}
            <svg className="absolute" style={{ width: 0, height: 0 }}>
                <defs>
                    <filter id="goo-hero">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                        <feBlend in="SourceGraphic" in2="goo" />
                    </filter>
                </defs>
            </svg>
            {/* Full Screen Background Image */}
            <div className="absolute inset-0 z-0 bg-white">
                {/* Mobile BG */}
                <img 
                    src="/mobileres.png" 
                    alt="Scrapping Facility Background Mobile" 
                    className="w-full h-full object-cover md:hidden pointer-events-none"
                />
                {/* Desktop BG */}
                <img 
                    src="/herobg.png" 
                    alt="Scrapping Facility Background" 
                    className="w-full h-full object-cover hidden md:block pointer-events-none"
                />
            </div>

            <div className="relative z-20 container mx-auto px-6 lg:pl-24 flex-1 flex flex-col items-center lg:items-start justify-center pt-20 sm:pt-24 pb-8 lg:pt-20 lg:pb-0">
                {/* Content Area - Aligned to Left */}
                <div className="max-w-4xl lg:text-left text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[4rem] 2xl:text-[5rem] font-bebas font-bold text-[#1A1A1A] leading-[0.95] mb-4 xl:mb-6 tracking-[0.03em] uppercase"
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

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-base sm:text-lg md:text-xl font-light text-slate-500 tracking-wide mb-4"
                    >
                        Restore Health Medicare Pvt Ltd
                    </motion.div>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-slate-600 text-base sm:text-lg font-medium mb-4 xl:mb-8 max-w-lg lg:mx-0 mx-auto"
                    >
                        Environmentally responsible scrapping with maximum value for your vehicle.
                    </motion.p>

                    {/* Main Input Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className={`${plusJakartaSans.className} w-full max-w-[28rem]`}
                    >
                        <div className="bg-white/95 p-2 sm:p-2.5 rounded-xl border border-[#E31E24]/20 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:border-[#E31E24]/40 hover:shadow-[0_15px_40px_rgba(227,30,36,0.08)] transition-all duration-300">
                            <form onSubmit={handleFetchData} className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <div className="w-full sm:flex-1 flex items-center pl-2 pr-1 gap-2.5 py-1 sm:py-0">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-slate-50 shrink-0 border border-slate-100">
                                        <img src="/herologo.png" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" alt="Registration Logo" />
                                    </div>
                                    <div className="flex flex-col items-start overflow-hidden w-full">
                                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Enter Registration Number</span>
                                        <input
                                            type="text"
                                            placeholder="E.g. DL1CAB1234"
                                            value={vehicleNumber}
                                            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                                            className="w-full bg-transparent text-slate-800 font-bold text-sm sm:text-base focus:outline-none uppercase tracking-[0.08em] placeholder:text-xs sm:placeholder:text-sm placeholder:text-slate-300 placeholder:font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isFetching}
                                    className="c-button--gooey w-full sm:w-auto h-10 px-4 sm:px-5 bg-[#E31E24] text-white font-bold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-red-500/10 active:scale-[0.98] disabled:opacity-70"
                                    style={{ filter: 'none' }}
                                >
                                    <span className="relative z-10 flex items-center gap-1.5">
                                        {isFetching ? "Fetching..." : "GET VALUATION"}
                                        {!isFetching && <ArrowRight className="w-3.5 h-3.5 transition-transform" />}
                                    </span>
                                    <div className="c-button__blobs" style={{ filter: 'url(#goo-hero)' }}>
                                        <div />
                                        <div />
                                        <div />
                                    </div>
                                </button>
                            </form>
                        </div>

                        {/* Buy a new vehicle link */}
                        <button
                            type="button"
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent('hero-buy-click'))
                                const servicesEl = document.getElementById('services')
                                if (servicesEl) servicesEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }}
                            className="mt-3 w-full flex items-center justify-center lg:justify-start gap-1 pl-0 lg:pl-8 group"
                        >
                            <span className={`text-[12px] font-semibold transition-colors duration-500 underline underline-offset-2 group-hover:text-[#E31E24] ${isRed ? 'text-[#E31E24]' : 'text-slate-500'}`}>
                                Want to buy a new vehicle?
                            </span>
                            <ChevronRight className={`w-3.5 h-3.5 transition-all duration-500 group-hover:translate-x-0.5 group-hover:text-[#E31E24] ${isRed ? 'text-[#E31E24]' : 'text-slate-300'}`} />
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Benefits Bar */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`${plusJakartaSans.className} relative z-30 w-full max-w-[1400px] mx-auto px-4 sm:px-6 mt-4 sm:mt-6 lg:mt-8 mb-6 sm:mb-10 lg:mb-12`}
            >
                <div className="bg-white shadow-xl shadow-slate-200/60 border border-slate-100/90 rounded-[2rem] py-4 px-4 sm:py-5 sm:px-6 lg:py-6 lg:px-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-2">
                        {features.map((feature, idx) => (
                            <motion.div 
                                key={idx}
                                whileHover={{ scale: 1.05, y: -4 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                className="flex flex-col items-center text-center px-2 py-3 sm:py-4 group/card rounded-2xl transition-all duration-300 hover:bg-red-50/30 cursor-pointer"
                            >
                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-red-50 flex items-center justify-center text-[#E31E24] mb-2.5 border border-red-100 shadow-sm group-hover/card:scale-110 group-hover/card:bg-[#E31E24] group-hover/card:text-white group-hover/card:ring-4 group-hover/card:ring-red-100/50 transition-all duration-300">
                                    <feature.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <p className="text-[11px] sm:text-xs lg:text-[13px] font-semibold text-slate-700 leading-snug group-hover/card:text-[#E31E24] transition-colors duration-300 max-w-[160px]">
                                    {feature.text}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

