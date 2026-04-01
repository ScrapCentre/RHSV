"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import {
  Target,
  Users,
  Lightbulb,
  TrendingUp,
  Award,
  Globe,
  ArrowRight,
  CheckCircle2,
  Banknote,
  Recycle,
  Car,
  Truck,
  Bike
} from "lucide-react"
import Link from "next/link"
import FAQSection from "@/components/FAQSection"
import GrowWithUs from "@/components/GrowWithUs"



export default function AboutPage() {
  const [mounted, setMounted] = useState(false)
  const [ctaHovered, setCtaHovered] = useState(false)
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

  if (!mounted) return null

  const stats = [
    { label: "Years Experience", value: 10, suffix: "+" },
    { label: "Happy Clients", value: 500, suffix: "+" },
    { label: "Projects Done", value: 1.2, suffix: "k+" }, // decimal for 1.2k
    { label: "Team Members", value: 50, suffix: "+" },
  ]

  const Counter = ({ value, suffix, decimals = 0 }: { value: number, suffix: string, decimals?: number }) => {
    const { scrollYProgress } = useScroll() // Just to hook into framer motion context if needed, but essentially we want InView
    const [count, setCount] = useState(0)

    useEffect(() => {
      // Simple counter effect
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16); // 60fps

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 16);

      return () => clearInterval(timer);
    }, [value]);

    // Using framer-motion for smooth counting would be better
    // Let's use a simpler approach compatible with the existing imports.
    return (
      <span>
        {count.toFixed(decimals)}
        {suffix}
      </span>
    )
  }

  // Re-implementing Counter properly using framer-motion useSpring for smoothness
  function NumberCounter({ value, suffix, decimals = 0 }: { value: number, suffix: string, decimals?: number }) {
    const { scrollYProgress } = useScroll(); // Dummy usage
    const spring = useSpring(0, { bounce: 0, duration: 2000 });
    const opacity = useTransform(spring, [0, value], [0.5, 1]); // Subtle opacity effect
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      spring.set(value);
    }, [spring, value]);

    useEffect(() => {
      return spring.on("change", (latest) => {
        setDisplayValue(latest);
      });
    }, [spring]);

    return (
      <motion.span style={{ opacity }}>
        {displayValue.toFixed(decimals)}
        {suffix}
      </motion.span>
    )
  }

  const features = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To revolutionize the scraping industry with transparent, efficient, and eco-friendly solutions.",
    },
    {
      icon: Lightbulb,
      title: "Our Vision",
      description: "Becoming the global standard for sustainable vehicle recycling and material recovery.",
    },
    {
      icon: TrendingUp,
      title: "Our Growth",
      description: "Consistently expanding our network to serve more regions and businesses every year.",
    },
    {
      icon: Globe, // Added extra feature for balance
      title: "Global Reach",
      description: "Connecting markets and resources across borders for a seamless recycling ecosystem.",
    },
  ]

  // Use only first 3 for grid if needed, or adjust grid to 4. Keeping 3 as per original design or updating to 4?
  // Original had 3. Let's stick to 3 or make it a grid of 2x2. The original code had 3.
  // I will keep the original 3 features to avoid layout issues, but update styles.
  const displayFeatures = features.slice(0, 3);


  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative flex-grow flex items-center justify-center overflow-hidden pb-10">
          {/* Background Image & Overlay */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-slate-950/90 z-10"></div> {/* Enhanced Gradient Overlay */}
            <img
              src="/about/aboutmain.png"
              alt="About Background"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {[...Array(20)].map((_, i) => (
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

          {/* Background Gradients - Reduced opacity for blend */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-900/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-900/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-20 w-[600px] h-[600px] bg-emerald-900/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pt-20">
            <motion.div
              style={{ opacity, scale }}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0E192D]/50 border border-slate-700 text-emerald-400 font-medium text-sm mb-8 mt-16 backdrop-blur-sm"
              >
                <Globe className="w-4 h-4" />
                <span>Global Leaders in Vehicle Scrapping</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8"
              >
                Driving the Future of <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-[length:200%_auto] animate-shimmer">
                  Sustainable Recycling
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-12 max-w-2xl mx-auto"
              >
                We transform end-of-life vehicles into valuable resources, powering a greener tomorrow through innovation and integrity.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/quote" className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
                  Get Free Valuation
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </motion.div>
          </div>


        </section>

        {/* Stats Section */}
        <section id="learn-more" className="py-6 bg-white border-y border-gray-100 mt-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-1 flex justify-center items-center">
                    <NumberCounter value={stat.value} suffix={stat.suffix} decimals={stat.label.includes("Projects") ? 1 : 0} />
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium uppercase tracking-wide">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Intro/Story Section */}
      {/* Intro/Story Section */}
      {/* Intro/Story Section */}
      <section className="py-20 md:py-32 relative overflow-hidden bg-[#020617] text-white">
        {/* Decorative Background Elements - Green Shine Effect */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2 animate-pulse delay-700"></div>

        {/* Texture Overlay */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>

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
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-3xl transform rotate-3 scale-105 blur-lg"></div>
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-emerald-900/20 group">
                <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay group-hover:bg-transparent transition-all duration-500"></div>
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
                className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 bg-black/90 p-5 rounded-2xl shadow-2xl border border-white/10 max-w-[280px] hidden sm:block"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white leading-tight">Govt. Authorized</div>
                    <div className="text-xs text-emerald-400/80">RVSF Facility</div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
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
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 tracking-wide uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Our Mission
              </motion.div>

              <motion.h2
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="text-3xl md:text-5xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight"
              >
                Refining the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-cyan-400">Scrapping Experience</span>
              </motion.h2>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-6 text-xl text-slate-400 leading-relaxed mb-10">
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
                <div className="group p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform group-hover:bg-emerald-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1 text-base group-hover:text-slate-900">Legal Assurance</h4>
                      <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-600">Guaranteed de-registration and legal immunity.</p>
                    </div>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="group p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform group-hover:bg-emerald-100">
                      <Banknote className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1 text-base group-hover:text-slate-900">Best Value</h4>
                      <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-600">Algorithmic pricing based on metal index.</p>
                    </div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="group p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform group-hover:bg-emerald-100">
                      <Recycle className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1 text-base group-hover:text-slate-900">0% Waste Policy</h4>
                      <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-600">Every component is recycled or reused.</p>
                    </div>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="group p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform group-hover:bg-emerald-100">
                      <TrendingUp className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1 text-base group-hover:text-slate-900">Tax Benefits</h4>
                      <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-600">Get road tax rebates on your next vehicle.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* CSS Animation for Gradient */}
        <style jsx>{`
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
        `}</style>
      </section>

      {/* Values/Features */}
      <section className="py-16 bg-white relative overflow-hidden border-t border-slate-100">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-50 rounded-full blur-[120px]"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold mb-4 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Ethos
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">Core Values</span>
            </h2>
            <p className="text-slate-600 text-lg">Principles that drive our every action and decision.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Our Mission",
                description: "To revolutionize the scraping industry with transparent, efficient, and eco-friendly solutions.",
                icon: Target
              },
              {
                title: "Our Vision",
                description: "Becoming the global standard for sustainable vehicle recycling and material recovery.",
                icon: Globe
              },
              {
                title: "Our Growth",
                description: "Consistently expanding our network to serve more regions and businesses every year.",
                icon: TrendingUp
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative bg-[#020617] border border-slate-800 p-8 rounded-3xl shadow-lg shadow-black/50 hover:bg-white hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 overflow-hidden"
              >
                {/* Gradient Border Hover Effect - Adjusted for white bg */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:rotate-6 transition-all duration-300">
                    <feature.icon className="w-8 h-8 text-emerald-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-slate-900 transition-colors">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed group-hover:text-slate-600 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Free Valuation */}
      <section
        className="py-12 relative overflow-hidden transition-colors duration-500"
        style={{ backgroundColor: ctaHovered ? "#ffffff" : "#0E192D" }}
      >
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            onMouseEnter={() => setCtaHovered(true)}
            onMouseLeave={() => setCtaHovered(false)}
            className="rounded-[2.5rem] p-8 md:p-12 border relative overflow-hidden shadow-2xl max-w-6xl mx-auto md:flex md:items-center md:justify-between md:gap-12 transition-colors duration-500"
            style={{ backgroundColor: ctaHovered ? "#0E192D" : "#ffffff", borderColor: ctaHovered ? "#1e293b" : "#e2e8f0" }}
          >
            {/* Falling Icons Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {ctaIcons.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ y: -100, x: item.left, opacity: 0 }}
                  animate={{
                    y: ["-20%", "120%"], // Fall through the entire card
                    opacity: [0, 0.4, 0] // Increased visibility
                  }}
                  transition={{
                    duration: item.duration,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: item.delay,
                    ease: "linear",
                  }}
                  className="absolute text-white"
                  style={{ left: item.left }}
                >
                  <item.Icon size={item.size} strokeWidth={1.5} />
                </motion.div>
              ))}
            </div>
            {/* Left Content */}
            <div className="flex-1 text-center md:text-left mb-8 md:mb-0 relative z-10">
              {/* Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-bold mb-6 tracking-wide uppercase text-xs transition-colors duration-500 ${ctaHovered ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-100 border-emerald-200 text-emerald-700"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Free Service
              </div>

              <h2 className={`text-3xl md:text-5xl font-bold mb-4 leading-tight transition-colors duration-500 ${ctaHovered ? "text-white" : "text-slate-900"}`}>
                Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Free</span> Valuation
                <br /> Of Your Car
              </h2>

              <p className={`text-lg max-w-2xl leading-relaxed mx-auto md:mx-0 transition-colors duration-500 ${ctaHovered ? "text-slate-400" : "text-slate-600"}`}>
                Instantly check the current market scrap value of your vehicle with our AI-powered tool.
              </p>
            </div>

            {/* Right Action */}
            <div className="md:shrink-0 text-center relative z-10">
              <Link href="/quote">
                <button className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-300 bg-emerald-600 rounded-full hover:bg-emerald-700 hover:scale-105 active:scale-95 shadow-lg shadow-emerald-600/20 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Check For Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <FAQSection variant="green" />
      <GrowWithUs variant="green" />
    </div>
  )
}

