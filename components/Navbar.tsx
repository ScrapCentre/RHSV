"use client"
import { useEffect, useState, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { Menu, X, Phone, ChevronDown, User, LogOut, LayoutDashboard, Car, RefreshCw, ShoppingCart, BookOpen, Construction } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import Link from "next/link" // Import Link for navigation
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
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
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
    { name: "Free Valuation", href: "#services" },
    { name: "Resources", href: "#", hasDropdown: true },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  const resourcesDropdown = [
    { name: "Blogs", href: "/blogs", icon: BookOpen, description: "Latest industry news and updates" },
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


    // Floating animation for logo
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

  // Handle scroll visibility (hide on scroll down, show on scroll up)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Don't hide if any menu is open
      if (isOpen || isMegaMenuOpen) {
        setIsVisible(true)
        lastScrollY.current = currentScrollY
        return
      }

      // Hide when scrolling down past 50px, show when scrolling up
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      
      // Update isScrolled for background changes
      if (currentScrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isOpen, isMegaMenuOpen])

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
      className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out hover:bg-white hover:shadow-md ${
        isTransparent ? "bg-transparent" : "bg-white shadow-md"
      } ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-6">
        {/* Desktop Layout - Single Row */}
        <div className="hidden lg:flex items-center py-2">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer mr-48" onClick={() => handleNavClick("/")}>
            <Image 
              src="/logo.png" 
              alt="ScrapCentre Logo" 
              width={240} 
              height={60} 
              className="h-16 w-auto"
              priority
            />
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold tracking-tight flex items-baseline">
                <span className="text-[#E31E24]">Scrap</span>
                <span className="text-slate-900">Centre</span>
                <span className="text-slate-900 text-lg font-semibold">.com</span>
              </h1>
            </div>
          </div>

          {/* Navigation Links - Shifted Left */}
          <div 
            className="flex items-center gap-8 xl:gap-10 h-full flex-1"
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            {navItems.map((item) => (
              <button
                key={item.name}
                onMouseEnter={() => {
                  if (item.hasDropdown) {
                    setIsMegaMenuOpen(true)
                  }
                }}
                onClick={() => {
                  if (item.hasDropdown) {
                    setIsMegaMenuOpen(!isMegaMenuOpen)
                  } else {
                    handleNavClick(item.href)
                  }
                }}
                className={`text-sm font-medium uppercase tracking-wide transition-all duration-200 flex items-center gap-1.5 h-full py-6
                  ${(item.hasDropdown && isMegaMenuOpen) || pathname === item.href 
                    ? "text-[#E31E24]" 
                    : "text-black hover:text-[#E31E24]"
                  }`}
              >
                {item.name}
                {item.hasDropdown && (
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                )}
              </button>
            ))}
          </div>

          {/* Right Side: Login */}
          <div className="flex items-center gap-6 xl:gap-8 ml-auto mr-24">
            {session ? (
              <div className="relative group">
                <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-all duration-300 group/btn border border-transparent hover:border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center border border-red-200 shadow-sm group-hover/btn:scale-110 transition-transform duration-300">
                    <span className="text-red-700 font-bold text-xs">{(displayName || "U")[0]}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover/btn:text-[#E31E24] transition-colors hidden xl:block">
                    {displayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-[#E31E24] group-hover/btn:rotate-180 transition-all duration-300" />
                </button>
                {/* User Dropdown */}
                <div className="absolute top-full right-0 mt-2 bg-white border border-slate-100 rounded-lg shadow-xl py-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out z-50">
                  <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-sm font-semibold text-slate-900 truncate">{displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
                  </div>
                  {(session.user as any).role === "admin" && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-700">Admin Dashboard</Link>
                  )}
                  <Link href="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-red-50">Profile</Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign out</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick("/login")}
                className="c-button--gooey px-8 py-2.5 bg-[#E31E24] text-white border-2 border-[#E31E24] rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-red-500/20 relative overflow-hidden"
              >
                <span className="relative z-10">Login / Sign up</span>
                <div className="c-button__blobs">
                  <div />
                  <div />
                  <div />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Header */}
        <div className={`lg:hidden flex items-center justify-between w-full h-20 px-4 transition-colors duration-300 ${isTransparent ? "bg-transparent" : "bg-white border-b"}`}>
          <div className="logo flex items-center cursor-pointer gap-2" onClick={() => handleNavClick("/")}>
            <Image 
              src="/logo.png" 
              alt="ScrapCentre Logo" 
              width={180} 
              height={45} 
              className="h-14 w-auto"
            />
            <h1 className="text-lg font-semibold flex items-baseline">
              <span className="text-[#E31E24]">Scrap</span>
              <span className="text-slate-900">Centre</span>
            </h1>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="transition-colors z-50 p-2 text-gray-700 hover:text-[#E31E24]"
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
              className="lg:hidden overflow-hidden absolute top-full left-0 right-0 h-screen bg-white/98 backdrop-blur-md z-50"
            >
              <div className="py-4 px-4 h-full overflow-y-auto pb-20">
                {navItems.map((item) => (
                  <div key={item.name} className="border-b border-gray-50 last:border-0">
                    <button
                      className="block w-full text-left px-4 py-4 text-gray-800 hover:text-[#E31E24] hover:bg-red-50 transition-all duration-200 rounded-lg flex items-center justify-between font-semibold text-lg"
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



                    {/* Mobile Resources Dropdown */}
                    <AnimatePresence>
                      {item.name === "Resources" && item.hasDropdown && isResourcesOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" as const }}
                          className="bg-slate-50/50 overflow-hidden"
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
                                  className="flex items-center gap-4 w-full text-left px-6 py-4 text-gray-600 font-medium hover:text-[#E31E24] transition-all duration-200 text-sm border-b border-gray-100 last:border-0 pl-8"
                                >
                                  <div className="bg-white p-2 rounded-md shadow-sm">
                                    <dropdownItem.icon className="w-4 h-4 text-[#E31E24]" />
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

                  {session ? (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-700 font-semibold border border-red-100">
                          {(displayName || "U")[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{displayName}</p>
                          <p className="text-xs text-gray-500">{session.user?.email}</p>
                        </div>
                      </div>

                      {(session.user as any).role === "admin" && (
                        <Link href="/admin">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-gray-700 hover:text-[#E31E24] hover:bg-red-50 mb-2 h-12 text-base font-medium"
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
                                className="w-full justify-start text-gray-700 hover:text-[#E31E24] hover:bg-red-50 mb-2 h-12 text-base font-medium"
                                onClick={() => setIsOpen(false)}
                              >
                                <User className="w-5 h-5 mr-3" /> Partner Login
                              </Button>
                            </Link>
                          )}
                          <Link href="/profile">
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-gray-700 hover:text-[#E31E24] hover:bg-red-50 mb-2 h-12 text-base font-medium"
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
                        <button
                          className="c-button--gooey w-full flex items-center justify-center bg-[#E31E24] text-white rounded-xl h-11 text-sm font-bold uppercase tracking-wider shadow-lg shadow-red-500/20 transition-all relative overflow-hidden"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="relative z-10 flex items-center">
                            <User className="w-4 h-4 mr-2" /> Login
                          </span>
                          <div className="c-button__blobs">
                            <div />
                            <div />
                            <div />
                          </div>
                        </button>
                      </Link>
                      <Link href="/partner-register" className="block">
                        <Button
                          variant="outline"
                          className="w-full justify-center text-gray-700 hover:text-[#E31E24] hover:bg-red-50 border-gray-200 h-12 text-sm font-medium px-2"
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
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
            className="absolute top-full left-0 w-full h-screen bg-white/98 backdrop-blur-xl shadow-2xl z-40"
          >
            <div className="container mx-auto px-6 py-12">
              <div className="grid grid-cols-1 gap-12 max-w-md mx-auto">

                {/* Resources Column */}
                <div className="col-span-1 pl-4">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-lg bg-red-50 text-[#E31E24]">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Resources</h3>
                  </div>
                  <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                    {resourcesDropdown.map((dropdownItem) => (
                      <motion.div key={dropdownItem.name} variants={itemVariants}>
                        <Link
                          href={dropdownItem.href}
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="flex items-center gap-4 w-full text-left px-4 py-4 rounded-xl hover:bg-red-50/30 transition-all duration-200 group/link"
                        >
                          <div className="p-2 rounded-lg bg-gray-100 text-gray-500 group-hover/link:bg-[#E31E24] group-hover/link:text-white transition-colors">
                            <dropdownItem.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-base font-medium text-gray-700 group-hover/link:text-[#E31E24] transition-colors">
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
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-[#E31E24] transition-all duration-200 font-medium group"
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

