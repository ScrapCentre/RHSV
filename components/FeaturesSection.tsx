"use client"

import { motion, LayoutGroup } from "framer-motion"
import { Shield, Zap, Truck, BadgeCheck, Leaf, Coins, Smile, Car, MapPin, ShieldCheck, PlayCircle, ArrowRight, Play } from "lucide-react"

export default function FeaturesSection() {

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
      className="py-10 relative overflow-hidden text-slate-900"
      style={{
        backgroundColor: "#ffffff",
        backgroundImage: `url('/features.png')`,
        backgroundSize: "100% auto",
        backgroundPosition: "left center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "scroll"
      }}
    >
      {/* Background Pattern Removed */}
      
      {/* Animated Elements Removed */}
 
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Centered Heading at Top */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" as const }}
        >
          <span className="text-[#E31E24] font-bold uppercase tracking-[0.2em] mb-2 block text-sm">
            Why Choose ScrapCenter
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
            Premium <span className="text-[#E31E24]">Features</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Experience a hassle-free car scrapping process with our exclusive services designed for your absolute convenience and trust.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Spacer for left side to push cards right */}
          <div className="hidden lg:block lg:col-span-5"></div>

          <div className="lg:col-span-7">
            {/* Feature Cards Grid - Shifted Right */}
            <LayoutGroup>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon

                  return (
                    <motion.div
                      key={feature.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -8 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100,
                        damping: 10
                      }}
                      className="relative perspective-1000 col-span-1 group cursor-pointer"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Main Card Wrapper (Border Effect) */}
                      <div 
                        className="bg-red-100/50 p-[1.5px] transition-all duration-500 shadow-red-500/10 rounded-2xl group-hover:shadow-2xl group-hover:bg-[#FF5252]/20"
                        style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
                      >
                        <div 
                          className="relative bg-white flex flex-col items-center justify-center p-6 text-center gap-1 text-slate-900 rounded-[calc(1rem-1.5px)] h-[210px] transition-colors duration-500 group-hover:bg-red-50/30"
                          style={{ transformStyle: "preserve-3d" }}
                        >
                          {/* Number Badge (Top Left) */}
                          <div 
                            className="absolute top-6 left-6 bg-[#FF5252] text-white text-[10px] font-black px-2 py-1 z-20"
                            style={{
                              clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)",
                              transform: "translateZ(50px)"
                            }}
                          >
                            {(index + 1).toString().padStart(2, '0')}
                          </div>
                          
                          {/* Soft Rounded Icon Container - Square */}
                          <div className="relative mb-1" style={{ transform: "translateZ(40px)" }}>
                             {/* Outer glow/soft bg */}
                             <div className="w-16 h-16 bg-red-50 flex items-center justify-center text-[#FF5252] transition-transform duration-500 rounded-2xl">
                                <div className="bg-[#FF5252] p-2.5 rounded-xl text-white shadow-lg shadow-red-500/20">
                                   <IconComponent size={20} strokeWidth={2.5} />
                                </div>
                             </div>
                          </div>

                          <div className="flex flex-col items-center max-w-[90%]" style={{ transform: "translateZ(35px)" }}>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 group-hover:text-[#E31E24] transition-colors mb-2">
                              {feature.title}
                            </h3>
                            
                            {/* Subheading */}
                            <motion.p layout className="text-xs text-slate-500 mb-1 font-medium leading-relaxed">
                              {feature.summary}
                            </motion.p>

                            {/* Red Accent Line */}
                            <div className="w-8 h-[2px] bg-[#FF5252] mb-3 opacity-60"></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </LayoutGroup>
          </div>
        </div>

        {/* New Stats and CTA Section - Moved out of grid for full width */}
        <motion.div 
          className="mt-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Red Stats Banner */}
          <div className="flex-1 w-full bg-[#E31E24] rounded-xl md:rounded-2xl p-6 md:py-9 md:px-8 flex flex-wrap md:flex-nowrap justify-between items-center gap-4 md:gap-6 relative overflow-hidden shadow-2xl shadow-red-500/20">
            {/* Decorative Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
            
            {/* Stat 1 */}
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                <Smile className="text-white" size={22} />
              </div>
              <div className="shrink-0">
                <div className="text-white text-xl md:text-2xl font-black leading-none mb-1">10K+</div>
                <div className="text-white/70 text-[9px] font-bold uppercase tracking-widest">Happy Customers</div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-[1px] h-11 bg-white/20 relative z-10 shrink-0" />

            {/* Stat 2 */}
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                <Car className="text-white" size={22} />
              </div>
              <div className="shrink-0">
                <div className="text-white text-xl md:text-2xl font-black leading-none mb-1">15K+</div>
                <div className="text-white/70 text-[9px] font-bold uppercase tracking-widest">Cars Scrapped</div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-[1px] h-11 bg-white/20 relative z-10 shrink-0" />

            {/* Stat 3 */}
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                <MapPin className="text-white" size={22} />
              </div>
              <div className="shrink-0">
                <div className="text-white text-xl md:text-2xl font-black leading-none mb-1">500+</div>
                <div className="text-white/70 text-[9px] font-bold uppercase tracking-widest">Cities Covered</div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-[1px] h-11 bg-white/20 relative z-10 shrink-0" />

            {/* Stat 4 */}
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                <ShieldCheck className="text-white" size={22} />
              </div>
              <div className="shrink-0">
                <div className="text-white text-xl md:text-2xl font-black leading-none mb-1">100%</div>
                <div className="text-white/70 text-[9px] font-bold uppercase tracking-widest">Safe & Secure</div>
              </div>
            </div>
          </div>

          {/* Right Side CTA */}
          <div className="flex flex-col items-center lg:items-start gap-4 shrink-0">
            <div className="relative group">
              {/* Handwritten Indicator */}
              <div className="absolute -top-9 -left-4 lg:-left-10 flex flex-col items-center -rotate-6 pointer-events-none">
                <span className="text-[#E31E24] text-[9px] font-bold uppercase tracking-widest whitespace-nowrap italic opacity-80" style={{ fontFamily: 'var(--font-geist-sans)' }}>See how it works</span>
                <svg width="30" height="15" viewBox="0 0 40 20" fill="none" className="text-[#E31E24] opacity-60">
                  <path d="M5 5C10 15 30 15 35 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M30 7L35 10L32 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <button className="c-button--gooey bg-[#E31E24] text-white px-7 py-3.5 border-2 border-[#E31E24] rounded-xl flex items-center gap-3 font-bold uppercase tracking-wider text-sm shadow-xl shadow-red-500/30 transition-all active:scale-95 group-hover:shadow-red-500/40 relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#E31E24] relative">
                    <Play size={14} fill="currentColor" />
                    <div className="absolute inset-0 bg-white/40 rounded-full animate-ping"></div>
                  </div>
                  <span>Watch Our Process</span>
                </div>
                <div className="c-button__blobs">
                  <div />
                  <div />
                  <div />
                </div>
              </button>
            </div>

            <button className="group flex items-center gap-2 text-slate-500 hover:text-[#E31E24] transition-colors font-bold uppercase tracking-wider px-4 py-1.5 text-xs">
              <span className="border-b-2 border-transparent group-hover:border-[#E31E24] transition-all">Learn More About Us</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

