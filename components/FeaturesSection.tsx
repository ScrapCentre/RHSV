"use client"

import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { Shield, Zap, Truck, BadgeCheck, Leaf, Coins, ChevronDown, ArrowRight } from "lucide-react"
import { useState } from "react"

export default function FeaturesSection() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const features = [
    {
      id: 1,
      icon: Shield,
      title: "100% Secure",
      summary: "Enterprise-grade security.",
      description: "Advanced encryption and secure payment gateways ensure your data and financial transactions are protected.",
    },
    {
      id: 2,
      icon: Zap,
      title: "Instant Payment",
      summary: "Paid instantly via bank/UPI.",
      description: "Experience the fastest payment processing. Money is transferred directly to your bank account instantly.",
    },
    {
      id: 3,
      icon: Truck,
      title: "Free Pickup",
      summary: "Doorstep pickup at no cost.",
      description: "We come to your registered address with a tow truck to pick up the vehicle, completely free of charge.",
    },
    {
      id: 4,
      icon: BadgeCheck,
      title: "RTO Handling",
      summary: "We handle all paperwork.",
      description: "We take care of all RTO formalities, de-registration, and documentation required to legally scrap your vehicle.",
    },
    {
      id: 5,
      icon: Leaf,
      title: "Eco-Friendly",
      summary: "Responsible scrapping.",
      description: "We follow strict environmental guidelines. Hazardous fluids are drained safely and parts are recycled.",
    },
    {
      id: 6,
      icon: Coins,
      title: "Best Price",
      summary: "Highest value guaranteed.",
      description: "Our AI pricing algorithm analyzes real-time market data to offer you the most competitive price.",
    },
  ]

  return (
    <section
      className="py-24 relative overflow-hidden text-white"
      style={{
        backgroundColor: "#0E192D", // Navy Blue (Slate-900)
        backgroundImage: `
          linear-gradient(-90deg, transparent calc(5em - 3px), rgba(16, 185, 129, 0.05) calc(5em - 3px + 1px), rgba(16, 185, 129, 0.05) 5em),
          linear-gradient(0deg, transparent calc(5em - 3px), rgba(16, 185, 129, 0.05) calc(5em - 3px + 1px), rgba(16, 185, 129, 0.05) 5em)
        `,
        backgroundSize: "5em 5em",
      }}
    >
      {/* Background Texture/Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0E192D] via-[#0E192D]/95 to-[#0E192D] pointer-events-none z-0"></div>

      {/* Animated Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            y: [0, -50, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear" as const
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 50, 0],
            rotate: [0, -360],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear" as const
          }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl opacity-50"
        />
        <motion.div
          animate={{
            x: [0, 100, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut" as const
          }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Centered Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" as const }}
        >
            <span className="text-emerald-400 font-bold uppercase tracking-[0.2em] mb-3 block text-sm">
            Why Choose ScrapCenter
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
            Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Features</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            Experience a hassle-free car scrapping process with our exclusive services designed for your absolute convenience and trust.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">

          {/* Left Column: Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -50 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] as any }}
            className="relative lg:col-span-2"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/10 border border-slate-700/50">
              <img
                src="/frontpage/features.jpg"
                alt="ScrapCenter Features"
                className="w-full h-[450px] object-cover transform hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Decorative Elements around image */}
            <div className="absolute -z-10 top-10 -left-10 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -z-10 -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-700"></div>
          </motion.div>


          {/* Right Column: Cards */}
          <div className="lg:col-span-3">
            <LayoutGroup>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature, index) => {
                  const isExpanded = expandedId === feature.id
                  const IconComponent = feature.icon

                  return (
                    <motion.div
                      key={feature.id}
                      layout
                      initial={{ rotateY: 90, opacity: 0 }}
                      whileInView={{ rotateY: 0, opacity: 1 }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{
                        layout: { duration: 0.3, type: "spring" },
                        duration: 0.5,
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 30,
                        damping: 15,
                        mass: 1.2
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : feature.id)}
                      className={`relative group cursor-pointer perspective-1000 ${isExpanded ? 'col-span-2 lg:col-span-3 z-20' : 'col-span-1 z-10'}`}
                      style={{ width: '100%', maxWidth: isExpanded ? '100%' : '240px' }}
                    >
                      {/* 
                                NEON GLOW CARD IMPLEMENTATION 
                                Adapted from user snippet to Tailwind
                            */}
                      <div className={`
                                relative bg-white rounded-xl flex flex-col justify-end p-5 gap-3 text-slate-900
                                transition-all duration-300 border border-slate-100 shadow-xl
                                ${isExpanded ? 'min-h-[260px]' : 'h-[200px]'}
                            `}>
                        {/* Glowing Border/Backdrop (Before) */}
                        <div className={`
                                    absolute inset-0 -left-[3px] m-auto w-[calc(100%+6px)] h-[calc(100%+6px)] rounded-[14px]
                                    bg-gradient-to-br from-emerald-400 to-teal-400
                                    -z-10 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
                                    ${isExpanded ? 'rotate-0 opacity-100' : 'group-hover:rotate-[-3deg] group-hover:scale-x-[1.03] group-hover:scale-y-[1.03]'}
                                    opacity-0 group-hover:opacity-100
                                `}></div>

                        {/* Always visible dim border for non-hover state */}
                        <div className="absolute inset-0 rounded-xl border border-slate-100 group-hover:border-transparent transition-colors duration-300 pointer-events-none"></div>

                        {/* Blurred Glow (After) */}
                        <div className={`
                                    absolute inset-0 -z-20 transform scale-[0.90] blur-[15px]
                                    bg-gradient-to-br from-emerald-400 to-teal-400
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                `}></div>


                        {/* Content */}
                        <div className="flex flex-col h-full relative z-10">
                          <div className="mb-auto pt-1">
                            <div className="p-2.5 bg-slate-50 w-fit rounded-lg mb-3 text-emerald-600 group-hover:text-white group-hover:bg-emerald-500 transition-colors border border-slate-100 group-hover:border-emerald-500/30">
                              <IconComponent size={24} />
                            </div>
                          </div>

                          <motion.h3 layout className="text-lg font-bold capitalize mb-1 text-slate-900 mb-2">
                            {feature.title}
                          </motion.h3>

                          <motion.p layout className="text-xs text-slate-500 mb-1 font-medium line-clamp-2">
                            {feature.summary}
                          </motion.p>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-slate-600 text-base leading-relaxed border-t border-slate-100 pt-4 mt-4 font-normal"
                              >
                                {feature.description}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {!isExpanded && (
                            <div className="mt-2 text-[10px] font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                              Read More <ArrowRight size={12} />
                            </div>
                          )}

                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </LayoutGroup>
          </div>
        </div>
      </div>
    </section>
  )
}

