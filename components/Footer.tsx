"use client"

import { motion } from "framer-motion"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowUp, ChevronRight, ShieldCheck, Leaf, BadgeCheck, Headphones, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-white pt-4 relative overflow-hidden">
      {/* 1. Back to Top Strip */}
      <div className="container mx-auto px-6 mb-12 relative">
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[#E31E24] z-0"></div>
        <div className="flex justify-center relative z-10">
          <button
            onClick={scrollToTop}
            className="group flex items-center gap-4 bg-white px-8 py-2 transition-all active:scale-95"
          >
            <motion.div 
              whileHover={{ y: -3, scale: 1.1 }}
              className="w-10 h-10 rounded-full border border-slate-100 bg-white shadow-md flex items-center justify-center text-[#E31E24] group-hover:border-[#E31E24]/30 group-hover:shadow-red-500/10 transition-all"
            >
              <ArrowUp size={18} strokeWidth={2.5} className="drop-shadow-[0_2px_2px_rgba(227,30,36,0.2)]" />
            </motion.div>
            <span className="text-slate-700 font-bold text-sm whitespace-nowrap">Back to top</span>
          </button>
        </div>
      </div>

      {/* 2. Main Footer Content */}
      <div className="container mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-4">
              <Image src="/logo.png" alt="ScrapCentre Logo" width={60} height={60} className="h-14 w-auto object-contain" />
              <h2 className="text-2xl font-semibold tracking-tight">
                <span className="text-[#E31E24]">Scrap</span>
                <span className="text-slate-900">Centre</span>
              </h2>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
              Your trusted partner for responsible vehicle recycling. We turn your old vehicles into cash while protecting the environment.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <Link key={i} href="#" className="w-11 h-11 rounded-xl bg-red-50/50 text-[#E31E24] flex items-center justify-center hover:bg-[#E31E24] hover:text-white transition-all hover:-translate-y-1">
                  <Icon size={20} />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-6 relative">
              Services
              <span className="block w-8 h-[2px] bg-[#E31E24] mt-2"></span>
            </h3>
            <ul className="space-y-4">
              {['Sell Your Car', 'Buy Used Parts', 'Instant Valuation'].map((item, i) => (
                <li key={i}>
                  <Link href="#" className="text-slate-500 text-[11px] font-bold uppercase tracking-wide hover:text-[#E31E24] transition-all flex items-center gap-2 group">
                    <ChevronRight size={12} className="text-[#E31E24] transition-transform group-hover:translate-x-1" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-6 relative">
              Company
              <span className="block w-8 h-[2px] bg-[#E31E24] mt-2"></span>
            </h3>
            <ul className="space-y-4">
              {['About Us', 'Contact Support', 'Privacy Policy', 'Terms & Conditions'].map((item, i) => (
                <li key={i}>
                  <Link href="#" className="text-slate-500 text-[11px] font-bold uppercase tracking-wide hover:text-[#E31E24] transition-all flex items-center gap-2 group">
                    <ChevronRight size={12} className="text-[#E31E24] transition-transform group-hover:translate-x-1" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-6 relative">
              Quick Links
              <span className="block w-8 h-[2px] bg-[#E31E24] mt-2"></span>
            </h3>
            <ul className="space-y-4">
              {['How It Works', 'FAQs', 'Blog', 'Sitemap'].map((item, i) => (
                <li key={i}>
                  <Link href="#" className="text-slate-500 text-[11px] font-bold uppercase tracking-wide hover:text-[#E31E24] transition-all flex items-center gap-2 group">
                    <ChevronRight size={12} className="text-[#E31E24] transition-transform group-hover:translate-x-1" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-6 relative">
              Contact Us
              <span className="block w-8 h-[2px] bg-[#E31E24] mt-2"></span>
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#E31E24] shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider mb-0.5">Visit Us</div>
                  <div className="text-slate-500 text-xs font-bold">21-E, Block Panki, Kanpur, 208020</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#E31E24] shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider mb-0.5">Call Us</div>
                  <div className="text-slate-500 text-xs font-bold">+91-9839447733</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#E31E24] shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider mb-0.5">Email Us</div>
                  <div className="text-slate-500 text-xs font-bold">contact@scrapcentre.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Trust Banner Card */}
      <div className="container mx-auto px-6 mb-10">
        <div className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[2rem] p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: 'Trusted & Secure', desc: 'We ensure safe and secure transactions for everyone.' },
              { icon: Leaf, title: 'Eco Friendly', desc: 'Committed to a cleaner and greener environment.' },
              { icon: BadgeCheck, title: 'Best Value', desc: 'Get the best price for your old vehicles.' },
              { icon: Headphones, title: 'Customer Support', desc: "We're here to help you anytime, anywhere." },
            ].map((feature, i) => (
              <div key={i} className={`flex items-center gap-5 ${i !== 3 ? 'lg:border-r border-slate-100 lg:pr-8' : ''}`}>
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-[#E31E24] shrink-0">
                  <feature.icon size={28} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">{feature.title}</div>
                  <div className="text-slate-400 text-[11px] font-medium leading-relaxed">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Copyright Bar - Replaced with Image */}
      <div className="w-full relative z-10 overflow-hidden bg-[#E31E24]">
        <Image 
          src="/footerbouttom.png" 
          alt="Footer Bottom Bar" 
          width={1920} 
          height={150} 
          className="w-full h-auto"
        />
      </div>
    </footer >
  )
}
