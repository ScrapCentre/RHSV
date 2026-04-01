"use client"

import { motion, AnimatePresence, useInView } from "framer-motion"
import { Star, Quote, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"

export default function ReviewSection() {
    const [activeIndex, setActiveIndex] = useState(0)
    const sectionRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(sectionRef, { once: false, amount: 0.2 })

    const reviews = [
        {
            id: 1,
            name: "Rajesh Kumar",
            role: "Sold Maruti Alto",
            text: "Best price for my old Alto. The process was incredibly smooth and the team was very professional. Highly recommended!",
            rating: 5,
            image: "/frontpage/pic1.jpg"
        },
        {
            id: 2,
            name: "Priya Singh",
            role: "Sold Honda City",
            text: "They picked up my car in just 2 hours! I didn't have to worry about any paperwork. Amazing service and instant payment.",
            rating: 5,
            image: "/frontpage/pic3.png"
        },
        {
            id: 3,
            name: "Amit Patel",
            role: "Sold Hyundai i10",
            text: "Hassle-free documentation and great customer support. The valuation tool is very accurate. Satisfied with the deal.",
            rating: 5,
            image: "/frontpage/pic2.jpg"
        },
        {
            id: 4,
            name: "Sneha Reddy",
            role: "Sold Toyota Innova",
            text: "Instant payment and polite staff. They utilized eco-friendly scrapping methods which was important to me. Great job!",
            rating: 5,
            image: "/frontpage/pic4.avif"
        },
    ]

    const nextReview = () => {
        setActiveIndex((prev) => (prev + 1) % reviews.length)
    }

    const prevReview = () => {
        setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
    }

    useEffect(() => {
        const interval = setInterval(nextReview, 5000) // Auto slide every 5 seconds
        return () => clearInterval(interval)
    }, [])

    return (
        <section className="py-24 bg-white relative overflow-hidden" ref={sectionRef}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#10b981 1px, transparent 1px)`,
                    backgroundSize: '32px 32px'
                }}
            ></div>

            <motion.div
                animate={isInView ? { rotateY: 0, opacity: 1 } : { rotateY: 90, opacity: 0 }}
                initial={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] as any }}
                style={{ perspective: "1400px" }}
                className="container mx-auto px-6 relative z-10"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Column: Reviews Slider */}
                    <div className="order-2 lg:order-1 relative">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 0.8, ease: "easeOut" as const }}
                            className="mb-12"
                        >
                            <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm mb-3 block">
                                Testimonials
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                                What Our <span className="text-emerald-600">Customers Say</span>
                            </h2>
                            <p className="text-slate-600 text-lg max-w-lg">
                                Trusted by thousands of vehicle owners across India. Reliability and transparency are our core values.
                            </p>
                        </motion.div>

                        <div className="relative min-h-[400px]" style={{ perspective: "1200px" }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    initial={{ rotateY: 90, opacity: 0 }}
                                    animate={{ rotateY: 0, opacity: 1 }}
                                    exit={{ rotateY: -90, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] as any }}
                                    style={{ transformStyle: "preserve-3d" }}
                                    className="absolute inset-0"
                                >
                                    <div className="bg-[#0E192D] p-10 rounded-3xl shadow-xl border border-emerald-900/30 relative h-full flex flex-col justify-between">
                                        <Quote className="absolute top-8 right-8 w-16 h-16 text-emerald-800 fill-current transform rotate-180" />

                                        <div>
                                            <div className="flex gap-1 mb-6 text-emerald-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-5 h-5 ${i < reviews[activeIndex].rating ? 'fill-current' : 'text-slate-300'}`}
                                                    />
                                                ))}
                                            </div>

                                            <p className="text-slate-200 text-xl leading-relaxed mb-8 font-medium">
                                                "{reviews[activeIndex].text}"
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-5">
                                            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-100 shadow-sm">
                                                <Image
                                                    src={reviews[activeIndex].image}
                                                    alt={reviews[activeIndex].name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg">{reviews[activeIndex].name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-emerald-600 font-medium">{reviews[activeIndex].role}</p>
                                                    <BadgeCheck className="w-4 h-4 text-emerald-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Navigation Controls */}
                        <div className="flex items-center gap-4 mt-8">
                            <button
                                onClick={prevReview}
                                className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-600 hover:text-white transition-all shadow-sm active:scale-95 text-slate-600"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <div className="flex gap-2">
                                {reviews.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveIndex(idx)}
                                        className={`w-3 h-3 rounded-full transition-all ${idx === activeIndex ? "bg-emerald-600 w-8" : "bg-slate-300 hover:bg-slate-400"
                                            }`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={nextReview}
                                className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-600 hover:text-white transition-all shadow-sm active:scale-95 text-slate-600"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Image */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1] as any
                        }}
                        className="order-1 lg:order-2 relative h-[300px] lg:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/10 group perspective-1000"
                    >
                        <Image
                            src="/frontpage/wcsf.png"
                            alt="Happy Customers"
                            fill
                            className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0E192D]/60 to-transparent opacity-60"></div>

                        {/* Floating Badge */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: false }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6 bg-[#0E192D] backdrop-blur-sm p-3 lg:p-4 rounded-xl shadow-lg max-w-[150px] lg:max-w-[200px] border-l-2 lg:border-l-4 border-emerald-500"
                        >
                            <p className="text-xl lg:text-2xl font-black text-white mb-0.5">15k+</p>
                            <p className="text-slate-300 text-xs lg:text-sm font-medium leading-snug">Happy customers served across India</p>
                        </motion.div>
                    </motion.div>

                </div>
            </motion.div>
        </section>
    )
}

