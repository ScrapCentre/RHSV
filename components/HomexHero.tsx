"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { Construction, Recycle, ArrowRight, ChevronLeft, ChevronRight, FileCheck, Receipt, ClipboardCheck, Zap, Search, PhoneCall, Wallet } from "lucide-react"
import Link from "next/link"

const slides = [
    {
        id: 1,
        title: "India's First Digital RVSF Experience",
        titleHighlight: "RVSF Experience",
        subtitle: "The ultimate doorstep scrap collection experience.",
        image: "/homes1.png",
        icon: Construction,
        color: "from-emerald-500 to-teal-400"
    },
    {
        id: 2,
        isStepsSlide: true,
        title: "3 steps to get your vehicle valuation",
        subtitle: "A simple and transparent process for you.",
        image: "/slide2.webp",
        color: "from-blue-500 to-indigo-400"
    },
    {
        id: 3,
        title: "Our Certification And Authorization",
        titleHighlight: "Certification And Authorization",
        subtitle: "Trusted, government-authorized vehicle scrapping partner.",
        image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=2000",
        video: "/bghome.mp4",
        icon: Recycle,
        color: "from-emerald-400 to-teal-300"
    }
]

export default function HomexHero() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [mounted, setMounted] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const stats = [
        { icon: FileCheck, value: "Certificate", label: "of Deposit" },
        { icon: Receipt, value: "25%", label: "Road Tax Rebate" },
        { icon: ClipboardCheck, value: "Registration", label: "Fee Waiver" },
        { icon: Zap, value: "Tax Deduction", label: "on EV" },
    ]

    useEffect(() => {
        setMounted(true)
    }, [])

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
        setIsPaused(false)
    }, [])

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
        setIsPaused(false)
    }, [])

    // Auto-advance: pauses on hover and when the browser tab is hidden
    useEffect(() => {
        const durations = [10000, 15000, 10000]

        const start = () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            if (isPaused || document.hidden) return
            timerRef.current = setTimeout(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length)
            }, durations[currentSlide])
        }

        start()

        // Pause / resume when tab visibility changes
        const onVisibilityChange = () => {
            if (document.hidden) {
                if (timerRef.current) clearTimeout(timerRef.current)
            } else {
                start()
            }
        }
        document.addEventListener('visibilitychange', onVisibilityChange)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            document.removeEventListener('visibilitychange', onVisibilityChange)
        }
    }, [isPaused, currentSlide])

    const textVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
    }

    return (
        <div className="h-[90vh] sm:h-[85vh] md:h-screen flex flex-col bg-[#0A0F1C] font-sans selection:bg-emerald-500/30 overflow-hidden">
            {/* Hero Section Container */}
            <div className="relative flex-1 min-h-[400px] overflow-hidden">
                {/* Floating Particles */}
                <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                    {mounted && [...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute bg-emerald-400/30 rounded-full"
                            initial={{
                                x: Math.random() * 100 + "vw",
                                y: Math.random() * 100 + "vh",
                                scale: Math.random() * 0.5 + 0.5,
                                opacity: Math.random() * 0.5 + 0.2
                            }}
                            animate={{
                                y: [null, Math.random() * -100],
                                opacity: [null, 0]
                            }}
                            transition={{
                                duration: Math.random() * 10 + 10,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            style={{
                                width: Math.random() * 4 + 2 + "px",
                                height: Math.random() * 4 + 2 + "px",
                            }}
                        />
                    ))}
                </div>

                {/* Background Gradient Blobs */}
                <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                </div>

                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                        key={currentSlide}
                        className="absolute inset-0 w-full h-full"
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    >
                        {/* Background Image/Video */}
                        <div className="absolute inset-0">
                            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-slate-950/90 z-10" />
                            {(slides[currentSlide] as any).video ? (
                                <video
                                    key={(slides[currentSlide] as any).video}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                >
                                    <source src={(slides[currentSlide] as any).video} type="video/mp4" />
                                </video>
                            ) : (
                                <img
                                    src={slides[currentSlide].image}
                                    alt="Slide Background"
                                    className="w-full h-full object-cover transition-all duration-1000"
                                />
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Content Layer */}
                <div className={`relative z-20 w-full h-full flex flex-col items-center px-4 sm:px-6 md:px-12 text-center pointer-events-none ${slides[currentSlide].id === 3
                    ? 'justify-center sm:justify-start sm:pt-28 md:pt-32 lg:pt-36'
                    : 'justify-center pt-16 sm:pt-20 md:pt-24'
                    }`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            className={`w-full max-w-7xl mx-auto flex flex-col items-center pointer-events-auto ${(slides[currentSlide] as any).isStepsSlide ? '' : 'space-y-2 sm:space-y-5 md:space-y-8 max-w-5xl'}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -40, filter: "blur(12px)", scale: 0.95 }}
                            transition={{ duration: 0.7, ease: "easeInOut" }}
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            {!(slides[currentSlide] as any).isStepsSlide ? (
                                <>
                                    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
                                        <motion.h1
                                            initial="hidden"
                                            animate="visible"
                                            exit={{ opacity: 0, y: -20 }}
                                            variants={textVariants}
                                            transition={{ delay: 0.2 }}
                                            className={`font-bold text-white tracking-tight leading-[1.05] drop-shadow-2xl ${slides[currentSlide].id === 3 ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl whitespace-nowrap' : 'text-3xl sm:text-4xl md:text-6xl lg:text-7xl'}`}
                                        >
                                            {slides[currentSlide].title.replace((slides[currentSlide] as any).titleHighlight || '', '')}
                                            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${slides[currentSlide].color} filter drop-shadow-sm`}>
                                                {(slides[currentSlide] as any).titleHighlight}
                                            </span>
                                        </motion.h1>

                                        <motion.p
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ delay: 0.5, duration: 0.8 }}
                                            className="block text-sm sm:text-lg md:text-xl lg:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed tracking-wide drop-shadow-lg"
                                        >
                                            {slides[currentSlide].subtitle}
                                        </motion.p>
                                    </div>

                                    {slides[currentSlide].id === 1 && (
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -20, opacity: 0 }}
                                            transition={{ delay: 0.7, duration: 0.5 }}
                                            className="pt-8"
                                        >
                                            <Link href="/quote" className="px-7 sm:px-10 py-3 sm:py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-base sm:text-lg transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 group">
                                                <span className="tracking-wide">Get Free Quote</span>
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </motion.div>
                                    )}

                                    {/* Certification Images — Slide 3 only */}
                                    {slides[currentSlide].id === 3 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 24 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 20, filter: "blur(10px)", scale: 0.9 }}
                                            transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                                            className="pt-2 sm:pt-3 md:pt-4 lg:pt-6 w-full mx-auto"
                                        >
                                            {/* Label */}
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className="text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] mb-2 sm:mb-4 text-center"
                                            >
                                                ✦ Verified &amp; Authorized ✦
                                            </motion.p>

                                            {/* Glass Frame */}
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.96 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                                                className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 md:gap-6 lg:gap-10 px-3 sm:px-6 md:px-10 lg:px-16 py-1 sm:py-2 md:py-3 lg:py-5 rounded-2xl w-full mx-auto"
                                                style={{
                                                    background: 'rgba(255,255,255,0.12)',
                                                    backdropFilter: 'blur(24px)',
                                                    WebkitBackdropFilter: 'blur(24px)',
                                                    border: '1px solid rgba(255,255,255,0.18)',
                                                    boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
                                                }}
                                            >
                                                {["/C1.png", "/C3.png", "/C2.png", "/C4.png", "/C5.png"].map((src, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 16 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.55 + idx * 0.1, duration: 0.45, ease: "easeOut" }}
                                                        className="flex items-center justify-center w-[30%] xs:w-[28%] sm:w-auto sm:flex-1"
                                                    >
                                                        <img
                                                            src={src}
                                                            alt={`Certification ${idx + 1}`}
                                                            className={`object-contain ${idx === 1 || idx === 3
                                                                ? 'w-[70px] h-[70px] sm:w-[120px] sm:h-[120px] md:w-[200px] md:h-[200px] lg:max-w-[200px] lg:h-44'
                                                                : 'w-[55px] h-[55px] sm:w-[90px] sm:h-[90px] md:w-[150px] md:h-[150px] lg:max-w-[130px] lg:h-28'
                                                                }`}
                                                            draggable={false}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </>
                            ) : (
                                <div className="w-full flex flex-col items-center px-4">

                                    {/* White Frame Card */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.94, y: 40 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                                        className="w-full max-w-3xl mx-auto rounded-3xl px-4 sm:px-6 md:px-6 lg:px-6 py-3 sm:py-4 md:py-4 lg:py-4"
                                        style={{
                                            background: 'rgba(0,0,0,0.15)',
                                            backdropFilter: 'blur(28px)',
                                            WebkitBackdropFilter: 'blur(28px)',
                                            boxShadow: 'none',
                                            border: 'none',
                                        }}
                                    >
                                        {/* Heading */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15, duration: 0.5 }}
                                            className="text-center mb-3 sm:mb-5 md:mb-5 lg:mb-8"
                                        >
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/15 text-emerald-300 text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.2em] sm:tracking-[0.25em] mb-2 sm:mb-3 border border-white/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                Simple Process
                                            </span>
                                            <h2 className="text-lg sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
                                                Three Steps to{" "}
                                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                                                    Seal the Deal
                                                </span>
                                            </h2>
                                        </motion.div>

                                        {/* Divider — hidden on mobile */}
                                        <motion.div
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                                            className="hidden sm:block h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent mb-3 md:mb-4 lg:mb-6 origin-center"
                                        />

                                        {/* Steps — horizontal rows on mobile, vertical cards on md+ */}
                                        <div className="relative flex flex-col md:flex-row items-stretch gap-2 sm:gap-3 md:gap-0">

                                            {/* Dashed connector line (md+ only) */}
                                            <motion.div
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: 1 }}
                                                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                                                className="hidden md:block absolute top-[44px] lg:top-[54px] left-[calc(16.66%+28px)] right-[calc(16.66%+28px)] h-0 border-t-2 border-dashed border-emerald-300 z-0 origin-left"
                                            />

                                            {[
                                                {
                                                    num: "01",
                                                    title: "Submit Details",
                                                    desc: "Fill in your vehicle info online and get your estimated scrap value instantly.",
                                                    icon: Search,
                                                    delay: 0.25,
                                                },
                                                {
                                                    num: "02",
                                                    title: "Get a Call",
                                                    desc: "An expert executive calls you to assist and guide through the full process.",
                                                    icon: PhoneCall,
                                                    delay: 0.4,
                                                },
                                                {
                                                    num: "03",
                                                    title: "Get Paid",
                                                    desc: "Receive instant payment and enjoy all legal benefits of scrapping.",
                                                    icon: Wallet,
                                                    delay: 0.55,
                                                },
                                            ].map((step, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 36, scale: 0.92 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    transition={{
                                                        duration: 0.6,
                                                        type: "spring",
                                                        stiffness: 140,
                                                        damping: 18
                                                    }}
                                                    whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                                                    className={`relative flex-1 group cursor-default
                                                        flex flex-row items-center gap-4 px-3 py-3 rounded-2xl
                                                        md:flex-col md:items-center md:text-center md:gap-0 md:px-3 lg:px-5 md:py-1 lg:py-2 md:rounded-none md:bg-transparent
                                                        ${idx < 2 ? 'border-b border-white/10 md:border-b-0' : ''}
                                                    `}
                                                >
                                                    {/* Icon Circle */}
                                                    <div className="relative z-10 shrink-0 md:mb-2 lg:mb-5">
                                                        <motion.div
                                                            initial={{ scale: 0, rotate: -20 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                            transition={{ delay: step.delay + 0.15, type: "spring", stiffness: 200, damping: 15 }}
                                                            className="w-10 h-10 sm:w-14 sm:h-14 md:w-[80px] md:h-[80px] lg:w-[90px] lg:h-[90px] rounded-full flex items-center justify-center"
                                                            style={{
                                                                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                                                                border: '2.5px solid #6ee7b7',
                                                                boxShadow: '0 8px 32px rgba(16,185,129,0.18), inset 0 1px 3px rgba(255,255,255,0.8)'
                                                            }}
                                                        >
                                                            <motion.div
                                                                animate={{ y: [0, -5, 0] }}
                                                                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: idx * 0.9 }}
                                                            >
                                                                <step.icon className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-9 lg:h-9 text-emerald-600" strokeWidth={1.6} />
                                                            </motion.div>
                                                        </motion.div>

                                                        {/* Step number badge */}
                                                        <motion.div
                                                            initial={{ scale: 0, y: -10 }}
                                                            animate={{ scale: 1, y: 0 }}
                                                            transition={{ delay: step.delay + 0.35, type: "spring", stiffness: 300, damping: 16 }}
                                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-9 lg:h-9 rounded-full flex items-center justify-center font-black text-[8px] sm:text-[10px] md:text-xs lg:text-sm text-white shadow-lg"
                                                            style={{
                                                                background: 'linear-gradient(135deg, #10b981, #0d9488)',
                                                                boxShadow: '0 4px 14px rgba(16,185,129,0.5)'
                                                            }}
                                                        >
                                                            {step.num}
                                                        </motion.div>
                                                    </div>

                                                    {/* Text — left-aligned on mobile, centered on md+ */}
                                                    <div className="flex flex-col items-start md:items-center text-left md:text-center">
                                                        <motion.h4
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: step.delay + 0.3, duration: 0.4 }}
                                                            className="text-white font-black text-xs sm:text-sm md:text-sm lg:text-lg xl:text-xl mb-0.5 md:mb-1 lg:mb-2 tracking-tight"
                                                        >
                                                            {step.title}
                                                        </motion.h4>

                                                        <motion.p
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: step.delay + 0.45, duration: 0.4 }}
                                                            className="text-white/65 text-[10px] sm:text-xs leading-relaxed font-medium md:max-w-[140px] lg:max-w-[175px]"
                                                        >
                                                            {step.desc}
                                                        </motion.p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>


                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Arrows */}
                <div className="absolute bottom-4 sm:bottom-8 md:bottom-12 right-4 sm:right-8 md:right-12 z-30 flex gap-3 sm:gap-4">
                    <button
                        onClick={prevSlide}
                        className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-emerald-500/80 transition-all duration-300 hover:scale-110 active:scale-95 group"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-emerald-500/80 transition-all duration-300 hover:scale-110 active:scale-95 group"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="relative z-30 bg-white py-8 sm:py-8 md:py-8 border-t border-gray-100">
                <div className="container mx-auto px-2 sm:px-4 md:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 sm:gap-5 md:gap-12">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.21, 1.02, 0.73, 1] }}
                                className={`flex items-center justify-start md:justify-center gap-3 md:gap-4 px-4 py-3 sm:py-4 md:px-6
                                    ${index % 2 === 0 ? 'border-r border-gray-100 md:border-r-0' : ''}
                                    ${index < 2 ? 'border-b border-gray-100 md:border-b-0' : ''}
                                    ${index !== stats.length - 1 ? 'md:border-r md:border-gray-200' : 'md:border-r-0'}
                                `}
                            >
                                <motion.div
                                    className="text-black shrink-0"
                                    initial={{ scale: 0, rotate: -25 }}
                                    whileInView={{ scale: 1, rotate: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: index * 0.1 + 0.3 }}
                                >
                                    <stat.icon className="w-5 h-5 md:w-8 md:h-8" />
                                </motion.div>
                                <div className="flex flex-col items-start text-left">
                                    <div className="overflow-hidden">
                                        <motion.h3
                                            initial={{ y: "100%" }}
                                            whileInView={{ y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6, delay: index * 0.1 + 0.4, ease: "easeOut" }}
                                            className="text-sm md:text-xl font-black text-emerald-600 font-['Helvetica_Neue'] tracking-tight uppercase leading-none"
                                        >
                                            {stat.value}
                                        </motion.h3>
                                    </div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: index * 0.1 + 0.6 }}
                                        className="text-emerald-500/70 text-[9px] md:text-[10px] font-black uppercase font-['Helvetica_Neue'] tracking-wider leading-tight mt-0.5"
                                    >
                                        {stat.label}
                                    </motion.p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    )
}
