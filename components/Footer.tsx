"use client"

import { motion } from "framer-motion"
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ChevronUp,
  ShieldCheck,
  Leaf,
  BadgeCheck,
  Headphones,
  FileText,
  Car,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"

export default function Footer() {
  const params = useParams()
  const isHindi = params?.locale === "hi"

  const localizedHref = (path: string) =>
    isHindi ? `/hi${path === "/" ? "" : path}` : path

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // 1. Column Navigation Data
  const footerColumns = [
    {
      title: isHindi ? "सेवाएं (Services)" : "Services",
      links: [
        { label: isHindi ? "तुरंत मूल्यांकन (Instant Valuation)" : "Instant Valuation", href: "/know-your-valuation" },
        { label: isHindi ? "वाहन स्क्रैपिंग सेवाएं" : "Vehicle Scrapping Services", href: "/vehicle-scrapping-services" },
        { label: isHindi ? "कार स्क्रैपिंग" : "Car Scrapping", href: "/four-wheeler-scrapping-kanpur" },
        { label: isHindi ? "बाइक और टू-व्हीलर स्क्रैपिंग" : "Two-Wheeler Scrapping", href: "/two-wheeler-scrapping-kanpur" },
      ],
    },
    {
      title: isHindi ? "वाहन श्रेणियां" : "Vehicle Types",
      links: [
        { label: isHindi ? "फोर-व्हीलर स्क्रैपिंग" : "Four-Wheeler Scrapping", href: "/four-wheeler-scrapping-kanpur" },
        { label: isHindi ? "टू-व्हीलर स्क्रैपिंग" : "Two-Wheeler Scrapping", href: "/two-wheeler-scrapping-kanpur" },
        { label: isHindi ? "ट्रक व मिनी ट्रक स्क्रैपिंग" : "Truck & Commercial Scrap", href: "/know-your-valuation" },
        { label: isHindi ? "बस व स्कूल बस स्क्रैपिंग" : "Bus & Fleet Scrapping", href: "/know-your-valuation" },
        { label: isHindi ? "ऑटो व ई-रिक्शा स्क्रैपिंग" : "Auto & E-Rickshaw Scrap", href: "/know-your-valuation" },
      ],
    },
    {
      title: isHindi ? "कंपनी" : "Company",
      links: [
        { label: isHindi ? "हमारे बारे में (About Us)" : "About ScrapCentre", href: "/about" },
        { label: isHindi ? "यह कैसे काम करता है" : "How It Works", href: "/vehicle-scrapping-services#how-it-works" },
        { label: isHindi ? "ब्लॉग और गाइड" : "Blog & Guides", href: "/blog" },
        { label: isHindi ? "संपर्क सहायता" : "Contact Support", href: "/contact" },
      ],
    },
    {
      title: isHindi ? "त्वरित सहायता" : "Quick Help",
      links: [
        { label: isHindi ? "अक्सर पूछे जाने वाले प्रश्न" : "Scrapping FAQs", href: "/#faq" },
        { label: isHindi ? "दस्तावेज चेकलिस्ट" : "Required Documents", href: "/vehicle-scrapping-services" },
        { label: isHindi ? "स्क्रैप मूल्य कारक" : "Scrap Price Factors", href: "/vehicle-scrapping-services" },
        { label: isHindi ? "डोरस्टेप पिकअप" : "Doorstep Collection", href: "/vehicle-scrapping-services" },
        { label: isHindi ? "पार्टनर बनें" : "Partner With Us", href: "/contact" },
      ],
    },
    {
      title: isHindi ? "संपर्क केंद्र" : "Contact Desk",
      isContact: true,
      contacts: [
        {
          icon: Phone,
          label: "Helpline",
          value: "+91-9839447733",
          href: "tel:+919839447733",
        },
        {
          icon: Mail,
          label: "Official Email",
          value: "contact@scrapcentre.com",
          href: "mailto:contact@scrapcentre.com",
        },
        {
          icon: MapPin,
          label: "Registered RVSF",
          value: "26-A & B, Block-E, Panki, Kalpi Road, Kanpur - 208020",
          href: "/vehicle-scrapping-services-kanpur",
        },
      ],
    },
  ]

  // 2. City Location Links (New dedicated section from user request)
  const locationLinks = [
    {
      name: isHindi ? "कानपुर वाहन स्क्रैपिंग" : "Vehicle Scrapping Kanpur",
      href: "/vehicle-scrapping-services-kanpur",
    },
    {
      name: isHindi ? "लखनऊ वाहन स्क्रैपिंग" : "Vehicle Scrapping Lucknow",
      href: "/vehicle-scrapping-services-lucknow",
    },
    {
      name: isHindi ? "आगरा वाहन स्क्रैपिंग" : "Vehicle Scrapping Agra",
      href: "/vehicle-scrapping-services-agra",
    },
    {
      name: isHindi ? "कन्नौज वाहन स्क्रैपिंग" : "Vehicle Scrapping Kannauj",
      href: "/vehicle-scrapping-services-kannauj",
    },
    {
      name: isHindi ? "कानपुर फोर-व्हीलर स्क्रैपिंग" : "Four-Wheeler Scrapping Kanpur",
      href: "/four-wheeler-scrapping-kanpur",
    },
    {
      name: isHindi ? "कानपुर टू-व्हीलर स्क्रैपिंग" : "Two-Wheeler Scrapping Kanpur",
      href: "/two-wheeler-scrapping-kanpur",
    },
    {
      name: isHindi ? "इटावा वाहन स्क्रैपिंग" : "Vehicle Scrapping Etawah",
      href: "/vehicle-scrapping-services",
    },
    {
      name: isHindi ? "औरैया वाहन स्क्रैपिंग" : "Vehicle Scrapping Auraiya",
      href: "/vehicle-scrapping-services",
    },
    {
      name: isHindi ? "मैनपुरी वाहन स्क्रैपिंग" : "Vehicle Scrapping Mainpuri",
      href: "/vehicle-scrapping-services",
    },
    {
      name: isHindi ? "फिरोजाबाद वाहन स्क्रैपिंग" : "Vehicle Scrapping Firozabad",
      href: "/vehicle-scrapping-services",
    },
    {
      name: isHindi ? "फर्रुखाबाद वाहन स्क्रैपिंग" : "Vehicle Scrapping Farrukhabad",
      href: "/vehicle-scrapping-services",
    },
    {
      name: isHindi ? "भारत में वाहन स्क्रैपिंग सेवाएं" : "Vehicle Scrapping Services India",
      href: "/vehicle-scrapping-services",
    },
  ]

  return (
    <footer className="bg-white text-slate-900 border-t border-slate-200/90 relative overflow-hidden">
      {/* Top Red Brand Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#E31E24] via-rose-500 to-[#E31E24]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* ─────────────────────────────────────────────────────────────
            1. TOP ROW: BRAND LOGO (LEFT) & SOCIAL LINKS (RIGHT)
        ───────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 py-7 border-b border-slate-100">
          {/* Logo & Brand Tagline */}
          <Link href={localizedHref("/")} className="flex items-center gap-3.5 group">
            <Image
              src="/logo.png"
              alt="ScrapCentre Logo"
              width={48}
              height={48}
              className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="text-left">
              <div className="text-xl sm:text-2xl font-black tracking-tight leading-none">
                <span className="text-[#E31E24]">Scrap</span>
                <span className="text-slate-900">Centre</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mt-1">
                Authorised RVSF • Government Registered
              </span>
            </div>
          </Link>

          {/* Social Media Icons */}
          <div className="flex items-center gap-2.5">
            {[
              {
                icon: Instagram,
                href: "https://www.instagram.com/scrapcentre_official/",
                label: "Instagram",
              },
              {
                // Modern X / Twitter icon SVG
                customIcon: (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                ),
                href: "https://twitter.com/scrapcentre",
                label: "X (Twitter)",
              },
              {
                icon: Linkedin,
                href: "https://www.linkedin.com/company/scrapcentre/",
                label: "LinkedIn",
              },
              {
                icon: Facebook,
                href: "https://www.facebook.com/ScrapCentreOfficial",
                label: "Facebook",
              },
              {
                icon: Youtube,
                href: "https://www.youtube.com/@scrapcentre",
                label: "YouTube",
              },
            ].map((s, idx) => {
              const IconComp = s.icon
              return (
                <a
                  key={idx}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-slate-50 hover:bg-[#E31E24] text-slate-600 hover:text-white border border-slate-200/70 hover:border-[#E31E24] flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 shadow-2xs"
                >
                  {IconComp ? <IconComp className="w-4 h-4" /> : s.customIcon}
                </a>
              )
            })}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. MAIN COLUMNS GRID (Matches Mahindra Lifespaces Structure)
        ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 py-10 sm:py-12 text-left">
          {footerColumns.map((col, idx) => (
            <div key={idx} className="space-y-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-red-500/20 pb-2">
                {col.title}
              </h3>

              {col.isContact ? (
                <div className="space-y-3 text-xs">
                  {col.contacts?.map((c, i) => {
                    const Icon = c.icon
                    return (
                      <div key={i} className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Icon className="w-3 h-3 text-[#E31E24]" />
                          <span>{c.label}</span>
                        </div>
                        {c.href.startsWith("http") || c.href.startsWith("tel:") || c.href.startsWith("mailto:") ? (
                          <a
                            href={c.href}
                            className="text-xs font-bold text-slate-700 hover:text-[#E31E24] transition-colors block leading-snug break-words"
                          >
                            {c.value}
                          </a>
                        ) : (
                          <Link
                            href={localizedHref(c.href)}
                            className="text-xs font-bold text-slate-700 hover:text-[#E31E24] transition-colors block leading-snug break-words"
                          >
                            {c.value}
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {col.links?.map((link, i) => (
                    <li key={i}>
                      <Link
                        href={localizedHref(link.href)}
                        className="text-xs text-slate-600 hover:text-[#E31E24] transition-colors duration-150 block leading-snug font-medium hover:translate-x-0.5 transform"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. NEW LOCATION SECTION: CITY SCRAPPING SERVICES
               (Direct redirection to Kanpur, Lucknow, Agra, Kannauj, etc.)
        ───────────────────────────────────────────────────────────── */}
        <div className="pt-6 pb-8 border-t border-slate-100 text-left">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {isHindi ? "हमारे सेवा क्षेत्र एवं शहर (Locations We Serve)" : "Locations We Serve"}
            </h4>
          </div>

          <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
            {isHindi
              ? "अधिकृत RVSF सुविधा, मुफ्त डोरस्टेप पिकअप और सरकारी जमा प्रमाणपत्र (CoD) के लिए अपने शहर पर क्लिक करें:"
              : "Click your city for authorised RVSF pickup, free doorstep valuation and official Certificate of Deposit (CoD):"}
          </p>

          {/* Horizontal inline links with pipes (|) matching reference layout */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-xs text-slate-600">
            {locationLinks.map((loc, idx) => (
              <span key={idx} className="inline-flex items-center gap-2.5">
                <Link
                  href={localizedHref(loc.href)}
                  className="font-semibold text-slate-700 hover:text-[#E31E24] hover:underline decoration-red-300 underline-offset-4 transition-colors"
                >
                  {loc.name}
                </Link>
                {idx < locationLinks.length - 1 && (
                  <span className="text-slate-300 select-none">|</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. FULL-WIDTH RED BOTTOM SECTION: BACK TO TOP + COPYRIGHT & LEGAL BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full bg-[#E31E24] text-white pt-7 pb-5 px-4 sm:px-6 lg:px-8 border-t-2 border-[#b81419] shadow-inner">
        <div className="container mx-auto max-w-7xl flex flex-col items-center justify-center gap-4">
          {/* Centered Back to Top Caret Button */}
          <div className="flex flex-col items-center justify-center gap-1.5">
            <motion.button
              onClick={scrollToTop}
              whileHover={{ y: -3, scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              aria-label="Back to top"
              className="w-11 h-11 rounded-xl bg-white text-[#E31E24] hover:bg-red-50 hover:shadow-lg flex items-center justify-center shadow-md transition-all cursor-pointer group"
            >
              <ChevronUp className="w-5 h-5 stroke-[3] group-hover:scale-110 transition-transform" />
            </motion.button>
            <span className="text-[11px] font-black text-white/95 uppercase tracking-widest">
              Back to Top
            </span>
          </div>

          {/* Clean White Divider Line */}
          <div className="w-full h-px bg-white/20 my-1" />

          {/* Copyright & Legal Links Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full text-xs text-white/95 text-center sm:text-left">
            <div className="leading-relaxed">
              © {new Date().getFullYear()}{" "}
              <span className="font-black text-white">ScrapCentre.com</span>. All rights reserved.
              RTO & MoRTH Authorised Registered Vehicle Scrapping Facility.
            </div>

            <div className="flex items-center gap-3 sm:gap-4 text-white/95 font-semibold text-[11px] sm:text-xs">
              <Link href={localizedHref("/terms")} className="hover:text-white hover:underline transition-colors">
                Terms & Conditions
              </Link>
              <span className="text-white/60">•</span>
              <Link href={localizedHref("/contact")} className="hover:text-white hover:underline transition-colors">
                Privacy & Support
              </Link>
              <span className="text-white/60">•</span>
              <Link href={localizedHref("/about")} className="hover:text-white hover:underline transition-colors">
                About Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
