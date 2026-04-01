"use client"

import { useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Smartphone,
  Monitor,
  Palette,
  Target,
  Zap,
  ShoppingCart,
  Home,
  Building,
  Heart,
  Car,
  MapPin,
  Briefcase,
  Wrench,
  Camera,
  Plane,
  Settings,
  Cake,
  Film,
  ChevronDown,
} from "lucide-react"
import { motion } from "framer-motion"
import CommonCTASection from "@/components/CommonCTASection"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"

gsap.registerPlugin(ScrollTrigger)

export default function AndroidAppDevelopmentPage() {
  useEffect(() => {
    // Hero section animations
    gsap.fromTo(".hero-content", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" })

    gsap.fromTo(
      ".hero-image",
      { opacity: 0, scale: 0.8, rotation: 10 },
      { opacity: 1, scale: 1, rotation: 0, duration: 1.2, delay: 0.3, ease: "back.out(1.7)" },
    )

    // Stagger animation for cards
    gsap.fromTo(
      ".feature-card",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 80%",
        },
      },
    )

    // Platform icons animation
    gsap.fromTo(
      ".platform-icon",
      { opacity: 0, scale: 0 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".platforms-section",
          start: "top 80%",
        },
      },
    )

    // Areas of work grid animation
    gsap.fromTo(
      ".work-area-card",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".work-areas-section",
          start: "top 80%",
        },
      },
    )
  }, [])

  const workAreas = [
    { name: "E-Commerce", icon: ShoppingCart, color: "from-green-500 to-emerald-500" },
    { name: "Home Decor", icon: Home, color: "from-green-600 to-green-400" },
    { name: "Hotels & Restaurants", icon: Building, color: "from-emerald-500 to-green-500" },
    { name: "Health", icon: Heart, color: "from-green-400 to-emerald-400" },
    { name: "Automotive", icon: Car, color: "from-gray-600 to-green-600" },
    { name: "Placement", icon: MapPin, color: "from-green-500 to-emerald-500" },
    { name: "Retail", icon: Briefcase, color: "from-emerald-600 to-green-600" },
    { name: "Investment", icon: Target, color: "from-green-400 to-emerald-400" },
    { name: "Real Estate", icon: Building, color: "from-green-500 to-emerald-500" },
    { name: "Equipments", icon: Wrench, color: "from-gray-500 to-green-500" },
    { name: "Action", icon: Camera, color: "from-green-600 to-emerald-600" },
    { name: "Tour & Travels", icon: Plane, color: "from-emerald-500 to-green-500" },
    { name: "Machinery", icon: Settings, color: "from-gray-600 to-green-600" },
    { name: "Bakery", icon: Cake, color: "from-green-400 to-emerald-400" },
    { name: "Entertainment", icon: Film, color: "from-emerald-600 to-green-600" },
  ]

  const faqs = [
    {
      question: "Why should one choose Riveyra Infotech Private Limited for Android App Development?",
      answer:
        "We have 8+ years of experience in mobile app development with a proven track record of delivering high-quality Android applications. Our team uses the latest technologies and follows industry best practices to ensure your app stands out in the market.",
    },
    {
      question: "What types of Android apps do we develop?",
      answer:
        "We develop various types of Android apps including native apps, hybrid apps, e-commerce apps, social media apps, business apps, gaming apps, and enterprise solutions tailored to your specific business needs.",
    },
    {
      question: "How do you ensure the security of the apps you develop?",
      answer:
        "We implement multiple security layers including data encryption, secure API integration, authentication protocols, and regular security audits. We follow OWASP guidelines and industry security standards to protect user data and app integrity.",
    },
    {
      question: "How can I get started with Android app development with your company?",
      answer:
        "Simply contact us through our website or call us directly. We'll schedule a consultation to understand your requirements, provide a detailed proposal, and guide you through our development process from concept to deployment.",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
     

      {/* Breadcrumb */}
      <div className="pt-20 sm:pt-24 pb-4 sm:pb-8 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
            <span>Home</span>
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 rotate-[-90deg]" />
            <span className="text-green-400">Android App Development</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-10 sm:py-16 lg:py-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-emerald-900/20 to-black/40"></div>
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-20 sm:w-32 h-20 sm:h-32 bg-green-500/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-24 sm:w-40 h-24 sm:h-40 bg-emerald-500/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>

        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="hero-content order-2 lg:order-1">
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Android App
                </span>
                <br />
                <span className="text-white">Development</span>
              </motion.h1>

              <motion.p
                className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                App development, shortform of application development, refers to the process of creating applications
                for mobile devices, desktop computers, and web browsers. It involves designing, coding, testing, and
                maintaining software to meet specific user needs and solve particular problems.
              </motion.p>

              <motion.p
                className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                App development is a multidisciplinary field that involves designers, developers, project managers, and
                quality assurance teams. If you are looking for services like mobile app development, android app
                development etc collaborate and invest with best in Kanpur Riveyra Infotech Private Limited.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link href="/contact">
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold text-base sm:text-lg shadow-lg shadow-green-500/25 w-full sm:w-auto">
                    More Details
                  </Button>
                </Link>
              </motion.div>
            </div>

            <div className="hero-image flex justify-center order-1 lg:order-2">
              <motion.div
                className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <img
                  src="/images/dropdown/mobile-app.png"
                  alt="Android App Development"
                  className="w-full h-auto object-contain"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Various Aspects Section */}
      <section className="features-section py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Various Aspects
          </motion.h2>

          <div className="space-y-8 sm:space-y-12">
            {/* Mobile App Development */}
            <Card className="feature-card bg-gradient-to-br from-gray-900/50 to-black/50 border border-green-500/30 overflow-hidden">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-green-400 mb-3 sm:mb-4">
                      Mobile App Development
                    </h3>
                    <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                      Mobile app development focuses on creating software applications for smartphones and tablets.
                      These apps can run on popular operating systems such as iOS (Apple) and Android (Google). Mobile
                      app development can be further categorized into native, hybrid, and web app development, each with
                      its own set of tools and technologies.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-48 sm:w-64 h-60 sm:h-80 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-green-500/20">
                        <Smartphone className="w-20 sm:w-32 h-20 sm:h-32 text-green-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Desktop and Web App Development */}
            <Card className="feature-card bg-gradient-to-br from-gray-900/50 to-black/50 border border-emerald-500/30 overflow-hidden">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                  <div className="order-2 lg:order-1 flex justify-center">
                    <div className="relative">
                      <div className="w-60 sm:w-80 h-48 sm:h-60 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center border border-emerald-500/20">
                        <Monitor className="w-20 sm:w-32 h-20 sm:h-32 text-emerald-400" />
                      </div>
                    </div>
                  </div>
                  <div className="order-1 lg:order-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-emerald-400 mb-3 sm:mb-4">
                      Desktop and Web App Development
                    </h3>
                    <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                      Back-end developers focus on the server-side of web development. They work on the server,
                      databases, and the logic that powers the website. Programming languages like PHP, Python, Ruby,
                      and Node.js are commonly used for back-end development. Back-end developers also handle database
                      management, API development, and server operations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Leading Company Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-br from-gray-900/30 to-black/30">
        <div className="container mx-auto text-center">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Leading Mobile App Development Company in Kanpur
          </motion.h2>

          <motion.p
            className="text-sm sm:text-base text-gray-400 mb-8 sm:mb-12 max-w-4xl mx-auto px-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Looking for smart ideas for the small screen? We can bake a mobile app idea for you. Orchestrate its
            Technical Ingredients Put in Creativity & Intuitiveness, and Finally Launch it with a Lot of Buzz!
          </motion.p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 h-full hover:border-green-400/50 transition-all duration-300">
                <CardContent className="p-4 sm:p-6 text-center">
                  <Palette className="w-10 sm:w-12 h-10 sm:h-12 text-green-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold text-green-400 mb-2">Stunning UI/UX Design</h3>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 border border-emerald-500/30 h-full hover:border-emerald-400/50 transition-all duration-300">
                <CardContent className="p-4 sm:p-6 text-center">
                  <Target className="w-10 sm:w-12 h-10 sm:h-12 text-emerald-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold text-emerald-400 mb-2">Robust Mobile App Strategy</h3>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="feature-card sm:col-span-2 lg:col-span-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 h-full hover:border-green-400/50 transition-all duration-300">
                <CardContent className="p-4 sm:p-6 text-center">
                  <Zap className="w-10 sm:w-12 h-10 sm:h-12 text-green-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold text-green-400 mb-2">Highly Optimization</h3>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="platforms-section py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Best Design & Development Company in Kanpur
          </motion.h2>

          <motion.p
            className="text-green-400 text-base sm:text-lg mb-8 sm:mb-12 font-semibold"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            WE WORK ACROSS ALL MOBILE
          </motion.p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 max-w-4xl mx-auto">
            <motion.div
              className="platform-icon text-center"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-10 sm:w-12 h-10 sm:h-12 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-green-400">ANDROID</h3>
            </motion.div>

            <motion.div
              className="platform-icon text-center"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-10 sm:w-12 h-10 sm:h-12 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-400">IOS</h3>
            </motion.div>

            <motion.div
              className="platform-icon text-center sm:col-span-2 lg:col-span-1"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 hover:scale-110 transition-transform duration-300">
                <Monitor className="w-10 sm:w-12 h-10 sm:h-12 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-green-400">WINDOWS</h3>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Areas of Work Section */}
      <section className="work-areas-section py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-br from-gray-900/30 to-black/30">
        <div className="container mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Areas of Work
          </motion.h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {workAreas.map((area, index) => (
              <motion.div
                key={area.name}
                className="work-area-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 h-full group cursor-pointer">
                  <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                    <div
                      className={`w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-gradient-to-r ${area.color} rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <area.icon className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-white" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-300 group-hover:text-white transition-colors duration-300">
                      {area.name}
                    </h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            FAQ's
          </motion.h2>

          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-sm px-3 py-1 rounded-full w-fit">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">{faq.question}</h3>
                        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CommonCTASection />

    
    </div>
  )
}

