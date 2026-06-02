"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion"
import { Plus_Jakarta_Sans } from "next/font/google"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})
import {
  Users,
  TrendingUp,
  Award,
  Globe,
  ArrowRight,
  CheckCircle2,
  Banknote,
  Recycle,
  Car,
  Truck,
  Bike,
  Plus,
  Minus,
  Headphones,
  ShieldCheck,
  FileText,
  ChevronRight,
  Leaf,
  ThumbsUp,
  Shield,
  Coins,
  Settings,
  Gift,
  RefreshCw,
  Percent
} from "lucide-react"
import Link from "next/link"
import GrowWithUs from "@/components/GrowWithUs"
import LoadingScreen from "@/components/LoadingScreen"

export default function AboutPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ctaHovered, setCtaHovered] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9])

  // State for falling icons animation in CTA
  const [ctaIcons, setCtaIcons] = useState<{ id: number; Icon: any; left: string; delay: number; duration: number; size: number }[]>([]);

  useEffect(() => {
    setCtaIcons(Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      Icon: i % 3 === 0 ? Car : i % 3 === 1 ? Truck : Bike,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5, // Faster than footer for more energy
      size: 40 + Math.random() * 30,
    })));
  }, []);

  const scrollToMore = () => {
    const element = document.getElementById("learn-more")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />
  }

  if (!mounted) return null


  return (
    <div className={`min-h-screen bg-slate-950 text-white selection:bg-red-500/30 selection:text-red-200 overflow-x-hidden ${plusJakartaSans.className}`}>


      {/* Hero Section */}
      <section className={`relative w-full bg-white text-slate-950 overflow-hidden mt-16 md:mt-20 pt-16 pb-12 min-h-[500px] md:min-h-[550px] flex items-center ${plusJakartaSans.className}`}>
        {/* Full-bleed Background Image */}
        <div className="absolute inset-0 w-full h-full z-0">
          <img
            src="/about/abouthero.png"
            alt="About ScrapCentre Background"
            className="w-full h-full object-cover object-[right_35%]"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column (Content) - Beautiful responsive widths */}
            <div className="lg:col-span-8 space-y-6 md:space-y-8">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight">
                  Why Choose <br className="hidden sm:block" />
                  <span className="text-[#E31E24]">Scrap</span>
                  <span className="text-slate-900">Centre</span>
                  <span className="text-slate-500">.com?</span>
                </h1>
              </div>

              <p className="text-slate-500 text-sm md:text-base max-w-2xl font-medium leading-relaxed">
                We bring you exclusive benefits that make your experience simple, valuable and rewarding.
              </p>

              {/* Responsive Stats Row - Clean Grid on Mobile, Flex on Desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 max-w-2xl">
                {/* Stat 1 */}
                <div className="flex items-center gap-3 bg-white/40 backdrop-blur-sm sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-white/20 sm:border-0 shadow-sm sm:shadow-none">
                  <div className="w-12 h-12 rounded-full border border-red-100 bg-white flex items-center justify-center text-red-600 shadow-sm shrink-0">
                    <ThumbsUp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-red-600 leading-none">500+</div>
                    <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Happy Clients</div>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="flex items-center gap-3 bg-white/40 backdrop-blur-sm sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-white/20 sm:border-0 shadow-sm sm:shadow-none">
                  <div className="w-12 h-12 rounded-full border border-red-100 bg-white flex items-center justify-center text-red-600 shadow-sm shrink-0">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-red-600 leading-none">10+</div>
                    <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Years Experience</div>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="flex items-center gap-3 bg-white/40 backdrop-blur-sm sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-white/20 sm:border-0 shadow-sm sm:shadow-none">
                  <div className="w-12 h-12 rounded-full border border-red-100 bg-white flex items-center justify-center text-red-600 shadow-sm shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-red-600 leading-none">1.2k+</div>
                    <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Projects Done</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Floating Panel (5 items) - Fully Responsive Grid & Dividers with premium hover animations */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mt-24 sm:mt-28 bg-white shadow-2xl shadow-slate-200/80 border border-slate-100 rounded-[2.5rem] p-4 sm:py-5 sm:px-6 translate-y-10 relative z-30"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 sm:gap-5 md:gap-1 divide-y sm:divide-y-0 md:divide-x divide-slate-100">
              
              {/* Item 1 */}
              <motion.div 
                whileHover={{ scale: 1.05, y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="flex flex-col items-center text-center p-3 sm:py-2 sm:px-1 group/card rounded-2xl transition-all duration-300 hover:bg-gradient-to-b hover:from-white hover:to-red-50/20 hover:shadow-xl hover:shadow-red-500/5 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-3 border border-red-100 shadow-sm group-hover/card:scale-110 group-hover/card:bg-[#E31E24] group-hover/card:text-white group-hover/card:ring-4 group-hover/card:ring-red-100/50 transition-all duration-300">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-705 leading-snug group-hover/card:text-[#E31E24] transition-colors duration-300">
                  Best Value for <br className="hidden sm:block" /> Your Vehicle
                </h3>
              </motion.div>

              {/* Item 2 */}
              <motion.div 
                whileHover={{ scale: 1.05, y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="flex flex-col items-center text-center p-3 sm:py-2 sm:px-1 pt-4 sm:pt-2 group/card rounded-2xl transition-all duration-300 hover:bg-gradient-to-b hover:from-white hover:to-red-50/20 hover:shadow-xl hover:shadow-red-500/5 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-3 border border-red-100 shadow-sm group-hover/card:scale-110 group-hover/card:bg-[#E31E24] group-hover/card:text-white group-hover/card:ring-4 group-hover/card:ring-red-100/50 transition-all duration-300">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-705 leading-snug group-hover/card:text-[#E31E24] transition-colors duration-300">
                  Instant COD <br className="hidden sm:block" /> Issuance
                </h3>
              </motion.div>

              {/* Item 3 */}
              <motion.div 
                whileHover={{ scale: 1.05, y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="flex flex-col items-center text-center p-3 sm:py-2 sm:px-1 pt-4 sm:pt-2 md:pl-1 group/card rounded-2xl transition-all duration-300 hover:bg-gradient-to-b hover:from-white hover:to-red-50/20 hover:shadow-xl hover:shadow-red-500/5 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-3 border border-red-100 shadow-sm group-hover/card:scale-110 group-hover/card:bg-[#E31E24] group-hover/card:text-white group-hover/card:ring-4 group-hover/card:ring-red-100/50 transition-all duration-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-705 leading-snug group-hover/card:text-[#E31E24] transition-colors duration-300">
                  Trusted by Thousands <br className="hidden sm:block" /> Across India
                </h3>
              </motion.div>

              {/* Item 4 */}
              <motion.div 
                whileHover={{ scale: 1.05, y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="flex flex-col items-center text-center p-3 sm:py-2 sm:px-1 pt-4 sm:pt-2 md:pl-1 group/card rounded-2xl transition-all duration-300 hover:bg-gradient-to-b hover:from-white hover:to-red-50/20 hover:shadow-xl hover:shadow-red-500/5 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-3 border border-red-100 shadow-sm group-hover/card:scale-110 group-hover/card:bg-[#E31E24] group-hover/card:text-white group-hover/card:ring-4 group-hover/card:ring-red-100/50 transition-all duration-300">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-705 leading-snug group-hover/card:text-[#E31E24] transition-colors duration-300">
                  Best Discounts on <br className="hidden sm:block" /> Insurance & Finance
                </h3>
              </motion.div>

              {/* Item 5 */}
              <motion.div 
                whileHover={{ scale: 1.05, y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="flex flex-col items-center text-center p-3 sm:py-2 sm:px-1 pt-4 sm:pt-2 md:pl-1 group/card rounded-2xl transition-all duration-300 hover:bg-gradient-to-b hover:from-white hover:to-red-50/20 hover:shadow-xl hover:shadow-red-500/5 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-3 border border-red-100 shadow-sm group-hover/card:scale-110 group-hover/card:bg-[#E31E24] group-hover/card:text-white group-hover/card:ring-4 group-hover/card:ring-red-100/50 transition-all duration-300">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-705 leading-snug group-hover/card:text-[#E31E24] transition-colors duration-300">
                  Driving a Greener <br className="hidden sm:block" /> Tomorrow
                </h3>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* Intro/Story Section */}
      {/* Intro/Story Section */}
      {/* Intro/Story Section */}
      {/* Intro/Story Section */}
      {/* Intro/Story Section */}
      {/* Intro/Story Section */}
      <section className={`py-20 md:py-32 relative overflow-hidden bg-white text-slate-800 border-y border-slate-100 ${plusJakartaSans.className}`}>
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-500/3 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2 opacity-30"></div>

        {/* Texture Overlay */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">

            {/* Left Content: Image */}
            <motion.div
              initial={{ opacity: 0, x: -50, rotateY: 90 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ amount: 0.5 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative perspective-1000 order-2 lg:order-1"
            >
              {/* Image Container with Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#E31E24]/10 to-transparent rounded-3xl transform rotate-3 scale-105 blur-lg"></div>
              <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-xl group">
                <div className="absolute inset-0 bg-[#E31E24]/5 mix-blend-overlay group-hover:bg-transparent transition-all duration-500"></div>
                <img
                  src="/about-team.png"
                  alt="Team Meeting"
                  className="w-full h-auto object-cover transform transition-transform duration-700 hover:scale-105"
                />
              </div>

              {/* Start Certification Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 bg-white p-5 rounded-2xl shadow-xl border border-slate-200/80 max-w-[280px] hidden sm:block"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 leading-tight">Govt. Authorized</div>
                    <div className="text-xs text-red-500/90 font-semibold">RVSF Facility</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Fully compliant with Vehicle Scrappage Policy 2021. Certificate of Deposit (CD) issued instantly.
                </p>
              </motion.div>
            </motion.div>

            {/* Right Content: Text & Features */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ amount: 0.2 }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15 }
                }
              }}
              className="relative order-1 lg:order-2"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-150 text-[#E31E24] text-xs font-bold mb-6 tracking-wide uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Our Mission
              </motion.div>

              <motion.h2
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="text-3xl md:text-5xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight animate-gradient-move"
              >
                Refining the <br />
                <span className="text-[#E31E24]">Scrapping Experience</span>
              </motion.h2>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-6 text-sm sm:text-base text-slate-600 leading-relaxed mb-10 font-semibold">
                <p>
                  We’re not just a scrapyard; we’re a technology-driven recycling hub. We transform the complex, unorganized process of vehicle scrapping into a seamless, transparent, and rewarding experience for every car owner.
                </p>
                <p>
                  Sustainability drives our innovation. By integrating smart logistics and eco-friendly dismantling processes, we ensure maximum material recovery while minimizing environmental impact. Our goal is to create a circular economy where every end-of-life vehicle contributes to a greener future.
                </p>
              </motion.div>

              {/* Feature Grid */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {/* Feature 1 */}
                <div className="group p-4 bg-slate-50 border border-slate-150/80 rounded-xl hover:bg-white hover:border-red-500/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform group-hover:bg-red-50">
                      <CheckCircle2 className="w-4 h-4 text-red-500 group-hover:text-red-650" />
                    </div>
                    <div>
                      <h4 className="text-slate-800 font-bold mb-1 text-base group-hover:text-[#E31E24]">Legal Assurance</h4>
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed group-hover:text-slate-600">Guaranteed de-registration and legal immunity.</p>
                    </div>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="group p-4 bg-slate-50 border border-slate-150/80 rounded-xl hover:bg-white hover:border-red-500/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform group-hover:bg-red-50">
                      <Banknote className="w-4 h-4 text-red-500 group-hover:text-red-650" />
                    </div>
                    <div>
                      <h4 className="text-slate-800 font-bold mb-1 text-base group-hover:text-[#E31E24]">Best Value</h4>
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed group-hover:text-slate-600">Algorithmic pricing based on metal index.</p>
                    </div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="group p-4 bg-slate-50 border border-slate-150/80 rounded-xl hover:bg-white hover:border-red-500/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform group-hover:bg-red-50">
                      <Recycle className="w-4 h-4 text-red-500 group-hover:text-red-650" />
                    </div>
                    <div>
                      <h4 className="text-slate-800 font-bold mb-1 text-base group-hover:text-[#E31E24]">0% Waste Policy</h4>
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed group-hover:text-slate-600">Every component is recycled or reused.</p>
                    </div>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="group p-4 bg-slate-50 border border-slate-150/80 rounded-xl hover:bg-white hover:border-red-500/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform group-hover:bg-red-50">
                      <TrendingUp className="w-4 h-4 text-red-500 group-hover:text-red-650" />
                    </div>
                    <div>
                      <h4 className="text-slate-800 font-bold mb-1 text-base group-hover:text-[#E31E24]">Tax Benefits</h4>
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed group-hover:text-slate-600">Get road tax rebates on your next vehicle.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* CSS Animation for Gradient */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes gradient-move {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-move {
            animation: gradient-move 15s ease infinite;
          }
          .perspective-1000 {
            perspective: 1000px;
          }
        ` }} />
      </section>

      {/* Values/Features Redesign */}
      <section className="py-20 md:py-28 bg-[#FAFAFA] text-slate-900 relative overflow-hidden border-t border-slate-100">
        {/* Core Values Background Image Backdrop - Only visible on desktop to avoid vertical scaling distortion on stacked mobile layouts */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none hidden lg:block">
          <img
            src="/about/core.png"
            alt="Core Values Background"
            className="w-full h-full object-cover object-center opacity-80 md:opacity-[0.88] transition-opacity duration-300"
          />
        </div>
        {/* Decorative Grid Lines Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header section styled exactly like the provided image */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-[#E31E24] text-xs font-bold tracking-wider uppercase shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E31E24] animate-pulse"></span>
              Ethos &amp; Values
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Why Choose <span className="text-[#E31E24]">ScrapCentre.com?</span>
            </h2>
            
            <p className="text-slate-600 text-xs md:text-sm font-extrabold tracking-widest uppercase">
              Smart Choices. Better Value. Greener Tomorrow.
            </p>
          </div>

          {/* Main Values Circular Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto relative z-10">
            
            {/* Left Column: 2 Cards (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Card 1 */}
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white border border-slate-100 hover:border-red-500/20 p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group flex items-start gap-4 md:gap-5"
              >
                <div className="absolute top-0 right-0 h-full w-1 bg-[#E31E24] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 text-[#E31E24] flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:bg-[#E31E24] group-hover:text-white group-hover:rotate-6">
                  <Percent className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Best Value for Your Vehicle</h3>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">Get the maximum value with fast and secure payments.</p>
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white border border-slate-100 hover:border-red-500/20 p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group flex items-start gap-4 md:gap-5"
              >
                <div className="absolute top-0 right-0 h-full w-1 bg-[#E31E24] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 text-[#E31E24] flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:bg-[#E31E24] group-hover:text-white group-hover:rotate-6">
                  <FileText className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Instant COD Issuance</h3>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">Get your Certificate of Deposit instantly, hassle-free.</p>
                </div>
              </motion.div>
            </div>

            {/* Center Column: Centerpiece illustration on mobile, clean spacer on desktop (lg:col-span-4) */}
            <div className="lg:col-span-4 flex items-center justify-center py-6 lg:py-0 relative">
              {/* Foreground graphic visible only on mobile/tablet screens */}
              <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-square flex items-center justify-center lg:hidden relative z-10 pointer-events-none">
                <img
                  src="/about/core.png"
                  alt="ScrapCentre Core Showcase"
                  className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(227,30,36,0.12)]"
                />
              </div>
              {/* Clean spacer on desktop so the background image backdrop shows through perfectly */}
              <div className="hidden lg:block w-full min-h-[360px] pointer-events-none" />
            </div>

            {/* Right Column: 2 Cards (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Card 3 */}
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white border border-slate-100 hover:border-red-500/20 p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group flex items-start gap-4 md:gap-5"
              >
                <div className="absolute top-0 left-0 h-full w-1 bg-[#E31E24] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 text-[#E31E24] flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:bg-[#E31E24] group-hover:text-white group-hover:rotate-6">
                  <ShieldCheck className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Trusted &amp; Reliable</h3>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">OEM benefits, insurance discounts and more assured advantages.</p>
                </div>
              </motion.div>

              {/* Card 4 */}
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white border border-slate-100 hover:border-red-500/20 p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group flex items-start gap-4 md:gap-5"
              >
                <div className="absolute top-0 left-0 h-full w-1 bg-[#E31E24] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 text-[#E31E24] flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:bg-[#E31E24] group-hover:text-white group-hover:rotate-6">
                  <Coins className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Smart Savings Everywhere</h3>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">Special discounts on finance (Green Loans), insurance &amp; more.</p>
                </div>
              </motion.div>
            </div>
            
          </div>

          {/* Bottom Grid: 5 Items in Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="mt-8 sm:mt-12 -translate-y-8 sm:-translate-y-12 lg:-translate-y-16 relative z-20 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[2rem] p-6 sm:p-8 max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              {/* Item 1 */}
              <div className="flex flex-col items-center text-center p-2 group cursor-default">
                <div className="w-11 h-11 rounded-full bg-red-50 border border-red-100 text-[#E31E24] flex items-center justify-center mb-3.5 transition-transform group-hover:scale-110 shadow-sm">
                  <Car className="w-5 h-5" />
                </div>
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-snug mb-1">Discounts on New Car</h4>
                <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">Extra benefits at partner dealerships.</p>
              </div>

              {/* Item 2 */}
              <div className="flex flex-col items-center text-center p-2 pt-4 md:pt-2 group cursor-default">
                <div className="w-11 h-11 rounded-full bg-red-50 border border-red-100 text-[#E31E24] flex items-center justify-center mb-3.5 transition-transform group-hover:scale-110 shadow-sm">
                  <Settings className="w-5 h-5" />
                </div>
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-snug mb-1">Quality Spare Parts</h4>
                <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">Refurbished &amp; new spare parts at low prices.</p>
              </div>

              {/* Item 3 */}
              <div className="flex flex-col items-center text-center p-2 pt-4 md:pt-2 group cursor-default">
                <div className="w-11 h-11 rounded-full bg-red-50 border border-red-100 text-[#E31E24] flex items-center justify-center mb-3.5 transition-transform group-hover:scale-110 shadow-sm">
                  <Gift className="w-5 h-5" />
                </div>
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-snug mb-1">Exciting Gifts</h4>
                <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">Attractive &amp; assured complimentary gifts.</p>
              </div>

              {/* Item 4 */}
              <div className="flex flex-col items-center text-center p-2 pt-4 md:pt-2 group cursor-default">
                <div className="w-11 h-11 rounded-full bg-red-50 border border-red-100 text-[#E31E24] flex items-center justify-center mb-3.5 transition-transform group-hover:scale-110 shadow-sm">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-snug mb-1">Buy &amp; Sell Confidence</h4>
                <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">Vehicle buying &amp; selling facility with COD.</p>
              </div>

              {/* Item 5 */}
              <div className="flex flex-col items-center text-center p-2 pt-4 md:pt-2 group cursor-default">
                <div className="w-11 h-11 rounded-full bg-red-50 border border-red-100 text-[#E31E24] flex items-center justify-center mb-3.5 transition-transform group-hover:scale-110 shadow-sm">
                  <Leaf className="w-5 h-5" />
                </div>
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-snug mb-1">Go Green EV</h4>
                <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">Convert your vehicle into EV at affordable cost.</p>
              </div>

            </div>
          </motion.div>

          {/* Premium Call to Action Bottom Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 sm:mt-6 -translate-y-8 sm:-translate-y-12 lg:-translate-y-16 relative z-20 bg-gradient-to-r from-[#E31E24] via-red-600 to-rose-600 rounded-[1.75rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-red-500/10 max-w-6xl mx-auto"
          >
            <div className="flex items-center gap-4 text-white text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-inner hidden sm:flex">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-black uppercase tracking-tight leading-tight mb-1">
                  More Value. More Benefits. Better for You &amp; the Planet.
                </h3>
                <p className="text-[11px] md:text-xs text-white/80 font-medium max-w-2xl leading-relaxed">
                  Join thousands of smart vehicle owners who trust ScrapCentre.com for best value, benefits and a greener future.
                </p>
              </div>
            </div>
            
            <Link href="/#services" className="shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3.5 bg-white text-[#E31E24] font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg flex items-center gap-2 group/btn"
              >
                Get Started Today
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>

        </div>
      </section>

      {/* CTA Section - Free Valuation (Compact Red/White Theme) */}
      <section
        className="py-12 relative overflow-hidden transition-colors duration-500 bg-slate-50"
      >
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-red-500/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="rounded-[2rem] p-6 md:p-10 border border-slate-100 bg-white relative overflow-hidden shadow-xl max-w-5xl mx-auto md:flex md:items-center md:justify-between md:gap-10 group"
          >
            {/* Falling Icons Background (Red) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {ctaIcons.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ y: -100, x: item.left, opacity: 0 }}
                  animate={{
                    y: ["-20%", "120%"],
                    opacity: [0, 0.2, 0]
                  }}
                  transition={{
                    duration: item.duration,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: item.delay,
                    ease: "linear",
                  }}
                  className="absolute text-red-500/5"
                  style={{ left: item.left }}
                >
                  <item.Icon size={item.size} strokeWidth={1.5} />
                </motion.div>
              ))}
            </div>
            
            {/* Left Content */}
            <div className="flex-1 text-center md:text-left mb-6 md:mb-0 relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-red-50 border-red-100 text-red-600 font-bold mb-4 tracking-wider uppercase text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                Free Service
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-4 leading-[0.95] tracking-tight uppercase">
                Get <span className="text-red-600">Free</span> Valuation
                <br /> <span className="text-slate-400">Of Your Car</span>
              </h2>

              <p className="text-base md:text-lg font-medium text-slate-500 max-w-2xl leading-snug mx-auto md:mx-0">
                Instantly check the current market scrap value of your vehicle with our AI-powered tool.
              </p>
            </div>

            {/* Right Action */}
            <div className="md:shrink-0 text-center relative z-10">
              <Link href="/#services">
                <button className="c-button--gooey group/btn relative inline-flex items-center justify-center px-8 py-3.5 text-base font-black text-white transition-all duration-300 bg-red-600 rounded-xl hover:bg-red-700 hover:scale-105 active:scale-95 shadow-lg shadow-red-600/30 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Check For Free
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                  <div className="c-button__blobs">
                    <div />
                    <div />
                    <div />
                  </div>
                </button>
              </Link>
            </div>
          </motion.div>
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
      </section>

      {/* Support & FAQ Grid (Exact 1:1 Match from Homepage) */}
      <section className="pt-20 pb-10 bg-white overflow-hidden relative">
        {/* Abstract Background Shapes */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-50 -mr-48 pointer-events-none"></div>
        <div className="absolute bottom-40 left-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-30 -ml-32 pointer-events-none"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Left Column: FAQ */}
            <div>
              <div className="mb-8">
                <span className="text-[#E31E24] font-bold uppercase tracking-[0.2em] text-[10px] mb-2 block">
                  Support <span className="inline-block w-6 h-[1px] bg-[#E31E24] align-middle ml-2"></span>
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                  Everything You <br />
                  Need to <span className="text-[#E31E24]">Know</span>
                </h2>
                <p className="text-slate-500 text-base font-medium leading-relaxed max-w-md">
                  Find answers to common questions about our services, processes, and policies.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    question: "How does the vehicle scrapping process work?",
                    answer: "It's simple! Get a quote, schedule a free pickup, we collect your vehicle, complete the paperwork, and make instant payment."
                  },
                  {
                    question: "How do I get a quote for my vehicle?",
                    answer: "You can get an instant quote by entering your vehicle registration number on our homepage or by calling our support team."
                  },
                  {
                    question: "Do you offer free vehicle pickup?",
                    answer: "Yes, we provide free doorstep pickup for all vehicles being scrapped through our authorized centers."
                  },
                  {
                    question: "What documents are required for scrapping my vehicle?",
                    answer: "Typically, you'll need the RC (Registration Certificate), ID proof, and bank details. We handle all RTO documentation for you."
                  },
                  {
                    question: "How will I receive my payment?",
                    answer: "Payments are made instantly via Bank Transfer or UPI once the vehicle is collected and documents are verified."
                  },
                  {
                    question: "Can I sell a vehicle without RC or insurance?",
                    answer: "We require basic documentation to verify ownership. Please contact our support team to discuss specific cases."
                  }
                ].map((faq, index) => (
                  <div 
                    key={index}
                    className={`border rounded-xl transition-all duration-300 ${openFaq === index ? 'border-red-100 bg-red-50/30' : 'border-slate-100 bg-white'}`}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${openFaq === index ? 'bg-[#E31E24] text-white' : 'bg-red-50 text-[#E31E24]'}`}>
                          {openFaq === index ? <Minus size={14} /> : <Plus size={14} />}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900 leading-tight">{faq.question}</span>
                      </div>
                      <div className={`transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                        <ChevronRight size={16} className="text-slate-400" />
                      </div>
                    </button>
                    <AnimatePresence>
                      {openFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-10 pb-5 text-slate-500 text-xs leading-relaxed">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <button className="px-6 py-3 border-2 border-[#E31E24]/20 rounded-xl text-[#E31E24] font-bold uppercase tracking-wider text-[10px] hover:bg-[#E31E24] hover:text-white transition-all flex items-center gap-2 group">
                  View All FAQs
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Column: Replacement Image & Features */}
            <div className="flex flex-col gap-8">
              <div className="relative flex items-start justify-center pt-2">
                <Image 
                  src="/faqimg.png" 
                  alt="FAQ Support Image" 
                  width={600} 
                  height={400} 
                  className="w-full h-auto object-contain rounded-[2rem]"
                />
              </div>

              {/* Features Grid - Now in one line under the image */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: Headphones, title: "24/7 Support", desc: "We're here to help you anytime." },
                  { icon: ShieldCheck, title: "Secure & Safe", desc: "Your data and privacy are safe with us." },
                  { icon: FileText, title: "Transparent Process", desc: "Clear and simple process at every step." },
                  { icon: Users, title: "Expert Team", desc: "Experienced professionals at your service." }
                ].map((feature, i) => (
                  <div key={i} className="bg-white border border-slate-100 p-2 py-7 min-h-[130px] rounded-xl hover:bg-red-50 hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all group flex flex-col items-center text-center justify-center">
                    <div className="w-10 h-10 rounded-lg bg-[#E31E24] flex items-center justify-center text-white mb-3 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                      <feature.icon size={20} />
                    </div>
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-tight leading-none mb-1">{feature.title.split(' ')[0]}</h4>
                    <p className="text-slate-500 text-[9px] font-medium leading-tight">{feature.desc.split(' ').slice(0,3).join(' ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <GrowWithUs />
    </div>
  )
}

