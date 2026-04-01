"use client"

import type React from "react"
import { motion, useInView } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { useRef } from "react"

interface ServicesCardProps {
    title: string
    description: string
    image: string
    onClick: () => void
    delay?: number
}

const ServicesCard: React.FC<ServicesCardProps> = ({ title, description, image, onClick, delay = 0 }) => {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: false, amount: 0.3 })

    return (
        <motion.div
            ref={ref}
            animate={isInView
                ? { rotateY: 0, opacity: 1 }
                : { rotateY: 90, opacity: 0 }
            }
            initial={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.8, delay: isInView ? delay : 0, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="group perspective-1000 w-full perspective-origin-center"
            onClick={onClick}
        >
            <div className="relative w-full h-[400px] bg-[#0E192D] hover:bg-white rounded-[30px] border border-slate-800 group-hover:border-emerald-400/50 shadow-[10px_10px_30px_rgba(0,0,0,0.3)] transition-all duration-500 hover:shadow-[0_20px_40px_rgba(16,185,129,0.2)] hover:-translate-y-2 hover:cursor-pointer overflow-hidden flex flex-col">

                {/* Image Section */}
                <div className="relative w-full h-[55%] rounded-t-[30px] overflow-hidden bg-slate-800">
                    <Image
                        src={image || "/placeholder.svg"}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                    />


                    {/* Tag */}
                    <div className="absolute top-4 left-4 bg-[#0E192D] px-3 py-1 rounded-full border border-emerald-500/30 shadow-sm">
                        <span className="text-xs font-bold text-emerald-400 tracking-wide uppercase">Core Service</span>
                    </div>
                </div>

                {/* Text Section */}
                <div className="p-6 flex flex-col justify-between h-[45%] bg-[#0E192D] group-hover:bg-white relative transition-colors duration-500">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white group-hover:text-[#0E192D] font-sans mb-2 transition-colors duration-300 line-clamp-1 tracking-wide">{title}</h3>
                        <p className="text-sm text-slate-200 group-hover:text-slate-600 font-sans leading-relaxed line-clamp-2 transition-colors duration-300">{description}</p>
                    </div>

                    {/* Action Area */}
                    <div className="relative z-10 mt-auto flex items-center justify-between pt-4 border-t border-slate-700 group-hover:border-emerald-400/40 transition-colors duration-300">
                        <span className="text-sm font-semibold text-emerald-400 group-hover:text-emerald-600 transition-colors duration-300 font-sans uppercase tracking-wider text-xs">Explore Now</span>
                        <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-emerald-600 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:rotate-[-45deg]">
                            <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:text-white transition-colors duration-300" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default ServicesCard

