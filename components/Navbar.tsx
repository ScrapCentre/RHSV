"use client"
import { useEffect, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { Menu, X, Phone, ChevronDown, Sparkles, User, LogOut, LayoutDashboard, Car, RefreshCw, ShoppingCart, BookOpen, FileText, Home, ArrowRight } from "lucide-react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import Link from "next/link" // Import Link for navigation
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
gsap.registerPlugin(ScrollTrigger)

// Animation variants for staggered dropdown items
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: { opacity: 0, transition: { staggerChildren: 0.04, staggerDirection: -1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0, 0, 0.2, 1] as any } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.15 } },
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const displayName = session?.user?.name === "Novalytix Admin" ? "Admin" : session?.user?.name;

  // Close menus when route changes
  useEffect(() => {
    setIsOpen(false)
    setIsMegaMenuOpen(false)
  }, [pathname])

  const navItems = [
    { name: "Home", href: "/", hasDropdown: false },
    { name: "About Us", href: "/about", hasDropdown: false },
    { name: "Services", href: "#", hasDropdown: true },
    { name: "Resources", href: "#", hasDropdown: true },
    { name: "Contact Us", href: "/contact", hasDropdown: false },
  ]

  const servicesDropdown = [
    { name: "Sell Old Vehicle", href: "/services/sell-vehicle", icon: Car, description: "Get the best price for your old vehicle" },
    { name: "Exchange Vehicle", href: "/services/exchange-vehicle", icon: RefreshCw, description: "Exchange your old vehicle for a new one" },
    { name: "Buy New Vehicle", href: "/services/buy-vehicle", icon: ShoppingCart, description: "Explore our range of quality vehicles" },
  ]

  const resourcesDropdown = [
    { name: "Blogs", href: "/blogs", icon: BookOpen, description: "Latest industry news and updates" },
    { name: "Guides", href: "/guide", icon: FileText, description: "Step-by-step guides for vehicle scrapping" },
  ]

  useEffect(() => {
    // Faster initial navbar animation
    gsap.fromTo(".navbar", { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.3, ease: "power3.out" })

    // Logo icon animation with scale and rotation
    gsap.fromTo(
      ".logo-icon",
      { scale: 0, rotation: -180, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 0.7, delay: 0.4, ease: "back.out(1.7)" },
    )



    // Faster nav items stagger animation
    gsap.fromTo(
      ".nav-item",
      { y: -30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        delay: 0.4,
        ease: "power2.out",
      },
    )

    // Faster CTA button animation
    gsap.fromTo(
      ".cta-button",
      { scale: 0, rotation: 360 },
      { scale: 1, rotation: 0, duration: 0.5, delay: 0.6, ease: "elastic.out(1, 0.5)" },
    )

    // Scroll-based navbar background and visibility
    ScrollTrigger.create({
      start: "top -10",
      end: 99999,
      onUpdate: (self) => {
        const currentScrollY = self.scroll()

        // Handle navbar background
        if (currentScrollY > 10) {
          setIsScrolled(true)
        } else {
          setIsScrolled(false)
        }

        // Handle sticky behavior: Hide Bottom Row on scroll down, Show on scroll up
        const direction = self.direction // 1 = down, -1 = up

        if (direction === 1 && currentScrollY > 100) {
          // Scroll down past threshold -> Hide Bottom Row
          gsap.to(".bottom-row", {
            height: 0,
            opacity: 0,
            paddingTop: 0,
            paddingBottom: 0,
            duration: 0.3,
            ease: "power2.out",
            overflow: "hidden",
          })
        } else if (direction === -1 || currentScrollY <= 10) {
          // Scroll up or at top -> Show Bottom Row
          gsap.to(".bottom-row", {
            height: "auto",
            opacity: 1,
            paddingTop: "0.5rem", // py-2
            paddingBottom: "0.5rem", // py-2
            duration: 0.3,
            ease: "power2.out",
            overflow: "visible",
          })
        }
      },
    })

    // Faster floating animation for logo
    gsap.to(".logo-icon", {
      y: -3,
      duration: 1.5,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  const handleNavClick = (href: string) => {
    setIsOpen(false)
    setIsMegaMenuOpen(false)

    if (href === "/") {
      router.push("/")
    } else if (href.startsWith("#")) {
      if (window.location.pathname === "/") {
        const element = document.querySelector(href)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      } else {
        router.push("/" + href)
      }
    } else {
      router.push(href)
    }
  }

  // Disable scroll when Mega Menu is open
  useEffect(() => {
    if (isMegaMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMegaMenuOpen])

  const isTransparent = (pathname === "/homex" || pathname === "/") && !isScrolled

  return (
    <nav
      className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isTransparent
        ? "bg-transparent shadow-none"
        : isScrolled
          ? "bg-[#cccccc] shadow-lg shadow-emerald-600/5"
          : "bg-[#cccccc] shadow-sm"
        }`}
    >
      <div className="container mx-auto px-6">
        {/* Desktop Layout - 2 Rows */}
        <div className="hidden lg:flex flex-col w-full">

          {/* Top Row: Quote - Logo - User */}
          <div className="top-row flex items-center justify-between py-2 px-6">

            {/* Left: Get Free Quote Button */}
            <div className="w-1/3 flex justify-start">
              <motion.div
                className="cta-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/quote" passHref>
                  <Button className="relative overflow-hidden bg-[#0E192D] hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-emerald-900/20 transition-all duration-300 group text-xs whitespace-nowrap font-['Helvetica_Neue'] tracking-wide">
                    <span className="relative z-10 flex items-center gap-2">
                      Get Free Quote
                      <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Center: Logo */}
            <div className="w-1/3 flex justify-center">
              <div className="logo flex items-center cursor-pointer" onClick={() => handleNavClick("/")}>
                <motion.div
                  className="logo-icon"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Image
                    src="/logo.png"
                    alt="ScrapCenter India Logo"
                    width={150}
                    height={60}
                    className="h-10 w-auto sm:h-12 object-contain"
                  />
                </motion.div>
              </div>
            </div>

            {/* Right: User / Login */}
            <div className="w-1/3 flex justify-end">
              {session ? (
                <div className="relative group">
                  <button className={`flex items-center gap-2 font-medium transition-colors ${isTransparent ? "text-white hover:text-emerald-300" : "text-gray-600 hover:text-emerald-700"}`}>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                      <span className="text-emerald-700 font-bold text-sm">{(displayName || "U")[0]}</span>
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className={`text-xs font-bold leading-tight ${isTransparent ? "text-white" : "text-slate-900"}`}>{displayName}</p>
                      <p className={`text-[10px] ${isTransparent ? "text-emerald-100" : "text-slate-500"}`}>View Profile</p>
                    </div>
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </button>
                  {/* User Dropdown */}
                  <div className="absolute top-full right-0 mt-2 bg-[#cccccc] border border-gray-100 rounded-lg shadow-xl py-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out z-50">
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                    </div>
                    {(session.user as any).role === "admin" && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    {(session.user as any).role !== "admin" && (
                      <>
                        {(session.user as any).role !== "partner" && (
                          <Link href="/partner-register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Partner Login
                          </Link>
                        )}
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          {(session.user as any).role === "partner" ? "Partner Dashboard" : "Profile"}
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" className={`font-bold text-sm px-4 transition-colors ${isTransparent ? "text-white hover:text-emerald-300 hover:bg-white/10" : "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50"}`}>
                      Login
                    </Button>
                  </Link>
                  <Link href="/partner-register">
                    <Button variant="ghost" className={`font-bold text-sm px-4 transition-colors ${isTransparent ? "text-white hover:text-emerald-300 hover:bg-white/10" : "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50"}`}>
                      Partner Login
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: Navigation Links Only */}
          <div className="bottom-row flex items-center justify-center py-2 px-6">
            <div className="flex justify-center gap-16 xl:gap-24">
              {navItems.map((item) => (
                <div
                  key={item.name}
                  className="relative group flex items-center"
                >
                  <button
                    className={`nav-item relative transition-colors duration-200 font-medium flex items-center gap-1 py-3 font-['Helvetica_Neue'] whitespace-nowrap tracking-wide text-sm ${isTransparent ? "text-white hover:text-emerald-300" : "text-gray-600 hover:text-emerald-700"}`}
                    onClick={() => {
                      if (item.hasDropdown) {
                        setIsMegaMenuOpen(!isMegaMenuOpen)
                      } else {
                        handleNavClick(item.href)
                      }
                    }}
                  >
                    <span className="relative font-bold uppercase text-sm">
                      {item.name}
                      <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isTransparent ? "bg-white" : "bg-[#0E192D]"}`}></span>
                    </span>
                    {item.hasDropdown && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-300 ${isMegaMenuOpen && (item.name === "Services" || item.name === "Resources") ? "rotate-180 text-emerald-600" : ""}`}
                      />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Mobile Navigation Header (simplified) */}
        <div className={`lg:hidden flex items-center justify-between w-full h-16 px-4 py-2 border-b transition-colors duration-300 ${isTransparent ? "bg-transparent border-white/20" : "bg-[#cccccc] border-gray-100"}`}>
          <div className="logo flex items-center cursor-pointer space-x-2" onClick={() => handleNavClick("/")}>
            <motion.div
              className="logo-icon"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            >
              <Image
                src="/logo.png"
                alt="ScrapCenter India Logo"
                width={120}
                height={48}
                className="h-9 w-auto sm:h-10 object-contain"
              />
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`transition-colors z-50 p-2 ${isTransparent ? "text-white hover:text-emerald-300" : "text-gray-700 hover:text-emerald-600"}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.3 }}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {
          isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" as const }}
              className="lg:hidden overflow-hidden absolute top-full left-0 right-0 h-screen bg-[#cccccc] z-50"
            >
              <div className="py-4 px-4 h-full overflow-y-auto pb-20">
                {navItems.map((item) => (
                  <div key={item.name} className="border-b border-gray-50 last:border-0">
                    <button
                      className="block w-full text-left px-4 py-4 text-gray-800 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200 rounded-lg flex items-center justify-between font-bold text-lg"
                      onClick={() => {
                        if (item.hasDropdown) {
                          if (item.name === "Services") {
                            setIsServicesOpen(!isServicesOpen)
                          } else {
                            setIsResourcesOpen(!isResourcesOpen)
                          }
                        } else {
                          handleNavClick(item.href)
                          setIsOpen(false)
                        }
                      }}
                    >
                      <span className="uppercase tracking-wider text-sm">{item.name}</span>
                      {item.hasDropdown && (
                        <motion.div
                          animate={{
                            rotate:
                              item.name === "Services" ? (isServicesOpen ? 180 : 0) : isResourcesOpen ? 180 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      )}
                    </button>

                    {/* Mobile Services Dropdown */}
                    <AnimatePresence>
                      {item.name === "Services" && item.hasDropdown && isServicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" as const }}
                          className="bg-[#cccccc] overflow-hidden"
                        >
                          <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                            {servicesDropdown.map((dropdownItem) => (
                              <motion.div key={dropdownItem.name} variants={itemVariants}>
                                <Link
                                  href={dropdownItem.href}
                                  onClick={() => {
                                    setIsOpen(false)
                                    setIsServicesOpen(false)
                                  }}
                                  className="flex items-center gap-4 w-full text-left px-6 py-4 text-gray-600 font-medium hover:text-emerald-700 transition-all duration-200 text-sm border-b border-gray-100 last:border-0 pl-8"
                                >
                                  <div className="bg-white p-2 rounded-md shadow-sm">
                                    <dropdownItem.icon className="w-4 h-4 text-emerald-600" />
                                  </div>
                                  {dropdownItem.name}
                                </Link>
                              </motion.div>
                            ))}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Mobile Resources Dropdown */}
                    <AnimatePresence>
                      {item.name === "Resources" && item.hasDropdown && isResourcesOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" as const }}
                          className="bg-[#cccccc] overflow-hidden"
                        >
                          <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                            {resourcesDropdown.map((dropdownItem) => (
                              <motion.div key={dropdownItem.name} variants={itemVariants}>
                                <Link
                                  href={dropdownItem.href}
                                  onClick={() => {
                                    setIsOpen(false)
                                    setIsResourcesOpen(false)
                                  }}
                                  className="flex items-center gap-4 w-full text-left px-6 py-4 text-gray-600 font-medium hover:text-emerald-700 transition-all duration-200 text-sm border-b border-gray-100 last:border-0 pl-8"
                                >
                                  <div className="bg-white p-2 rounded-md shadow-sm">
                                    <dropdownItem.icon className="w-4 h-4 text-emerald-600" />
                                  </div>
                                  {dropdownItem.name}
                                </Link>
                              </motion.div>
                            ))}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                <div className="mt-8 px-2 space-y-4">
                  <Link href="/quote" passHref className="block">
                    <Button
                      className="w-full bg-[#0E192D] hover:bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-900/25 transition-all duration-300 group text-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="flex items-center justify-center gap-2">
                        Get Free Quote
                        <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </Link>

                  {session ? (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                          {(displayName || "U")[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{displayName}</p>
                          <p className="text-xs text-gray-500">{session.user?.email}</p>
                        </div>
                      </div>

                      {(session.user as any).role === "admin" && (
                        <Link href="/admin">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 mb-2 h-12 text-base font-medium"
                            onClick={() => setIsOpen(false)}
                          >
                            <LayoutDashboard className="w-5 h-5 mr-3" /> Admin Dashboard
                          </Button>
                        </Link>
                      )}

                      {(session.user as any).role !== "admin" && (
                        <>
                          {(session.user as any).role !== "partner" && (
                            <Link href="/partner-register">
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 mb-2 h-12 text-base font-medium"
                                onClick={() => setIsOpen(false)}
                              >
                                <User className="w-5 h-5 mr-3" /> Partner Login
                              </Button>
                            </Link>
                          )}
                          <Link href="/profile">
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 mb-2 h-12 text-base font-medium"
                              onClick={() => setIsOpen(false)}
                            >
                              <User className="w-5 h-5 mr-3" /> {(session.user as any).role === "partner" ? "Partner Dashboard" : "Profile"}
                            </Button>
                          </Link>
                        </>
                      )}

                      <Button
                        variant="ghost"
                        className="w-full text-red-600 hover:bg-red-50 justify-start h-12 text-base font-medium"
                        onClick={() => signOut({ callbackUrl: "/" })}
                      >
                        <LogOut className="w-5 h-5 mr-3" /> Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Link href="/login" className="block">
                        <Button
                          variant="outline"
                          className="w-full justify-center text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 border-gray-200 h-12 text-sm font-bold px-2"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="w-4 h-4 mr-1 sm:mr-2" /> Login
                        </Button>
                      </Link>
                      <Link href="/partner-register" className="block">
                        <Button
                          variant="outline"
                          className="w-full justify-center text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 border-gray-200 h-12 text-sm font-bold px-2"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="w-4 h-4 mr-1 sm:mr-2" /> Partner Login
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        }
      </AnimatePresence>

      {/* Unified Mega Menu */}
      <AnimatePresence>
        {isMegaMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeInOut" as const }}
            className="absolute top-full left-0 w-full h-screen bg-[#cccccc] shadow-2xl z-40"
          >
            <div className="container mx-auto px-6 py-12">
              <div className="grid grid-cols-2 gap-12 max-w-4xl mx-auto">
                {/* Services Column */}
                <div className="col-span-1 pr-12">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-lg bg-emerald-100/50 text-emerald-700">
                      <Car className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Our Services</h3>
                  </div>
                  <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                    {servicesDropdown.map((dropdownItem) => (
                      <motion.div key={dropdownItem.name} variants={itemVariants}>
                        <Link
                          href={dropdownItem.href}
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-4 w-full text-left px-4 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group/link"
                        >
                          <div className="p-2 rounded-lg bg-gray-100 text-gray-500 group-hover/link:bg-emerald-600 group-hover/link:text-white transition-colors">
                            <dropdownItem.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-gray-700 group-hover/link:text-emerald-700 transition-colors">
                              {dropdownItem.name}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                              {dropdownItem.description}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Resources Column */}
                <div className="col-span-1 pl-4">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-lg bg-emerald-100/50 text-emerald-700">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Resources</h3>
                  </div>
                  <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                    {resourcesDropdown.map((dropdownItem) => (
                      <motion.div key={dropdownItem.name} variants={itemVariants}>
                        <Link
                          href={dropdownItem.href}
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-4 w-full text-left px-4 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group/link"
                        >
                          <div className="p-2 rounded-lg bg-gray-100 text-gray-500 group-hover/link:bg-emerald-600 group-hover/link:text-white transition-colors">
                            <dropdownItem.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-gray-700 group-hover/link:text-emerald-700 transition-colors">
                              {dropdownItem.name}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                              {dropdownItem.description}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Close Menu Button */}
              <div className="flex justify-center mt-12 pb-12">
                <button
                  onClick={() => setIsMegaMenuOpen(false)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 transition-all duration-200 font-medium group"
                >
                  <X className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
                  <span>Close Menu</span>
                </button>
              </div>
            </div>
            {/* Bottom Border Gradient Removed */}
          </motion.div>
        )}
      </AnimatePresence>

    </nav>
  )
}

