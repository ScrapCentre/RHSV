"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Bike, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  Truck, 
  FileText, 
  Phone, 
  MessageCircle, 
  MapPin, 
  IndianRupee 
} from "lucide-react"

interface TwoWheelerKanpurComingSoonProps {
  isHindi: boolean
}

export default function TwoWheelerKanpurComingSoonClient({ isHindi }: TwoWheelerKanpurComingSoonProps) {
  const whatsappUrl = `https://wa.me/919839447733?text=${encodeURIComponent(
    isHindi 
      ? "नमस्ते ScrapCentre, मुझे कानपुर में टू-व्हीलर / बाइक स्क्रैपिंग के बारे में जानकारी चाहिए।" 
      : "Hello ScrapCentre, I would like to inquire about two-wheeler / bike scrapping in Kanpur."
  )}`

  const upcomingFeatures = [
    {
      icon: ShieldCheck,
      titleEn: "Authorised RVSF Process",
      titleHi: "अधिकृत RVSF स्क्रैपिंग प्रक्रिया",
      descEn: "100% legal, MoRTH-approved scrapping that officially removes your vehicle from active transport registers.",
      descHi: "100% कानूनी, MoRTH-स्वीकृत स्क्रैपिंग जो आपके वाहन को आधिकारिक रूप से सक्रिय रजिस्टर से हटाती है।",
    },
    {
      icon: FileText,
      titleEn: "Instant COD Certificate",
      titleHi: "त्वरित जमा प्रमाणपत्र (COD)",
      descEn: "Receive official Certificate of Deposit on the Parivahan portal for road tax waivers and new purchase discounts.",
      descHi: "परिवहन पोर्टल पर आधिकारिक COD प्राप्त करें, जिससे नए वाहन पर रोड टैक्स छूट और OEM लाभ मिलते हैं।",
    },
    {
      icon: Truck,
      titleEn: "Free Doorstep Bike Pickup",
      titleHi: "मुफ्त डोरस्टेप बाइक पिकअप",
      descEn: "Safe and convenient doorstep pickup across all Kanpur localities, residential sectors, and industrial hubs.",
      descHi: "कानपुर के सभी मोहल्लों, आवासीय कॉलोनियों और औद्योगिक क्षेत्रों में घर बैठे मुफ्त पिकअप सुविधा।",
    },
    {
      icon: IndianRupee,
      titleEn: "Fair & Transparent Value",
      titleHi: "सर्वोत्तम और पारदर्शी मूल्य",
      descEn: "Competitive scrap metal rate calculation based on weight, recoverable components, and current market metal prices.",
      descHi: "वजन, उपयोगी पुर्जों और चालू धातु बाजार दरों के आधार पर निष्पक्ष और पारदर्शी स्क्रैप मूल्यांकन।",
    },
  ]

  const kanpurAreas = [
    "Kakadeo", "Panki", "Civil Lines", "Kidwai Nagar", "Govind Nagar", 
    "Swaroop Nagar", "Kalyanpur", "Jajmau", "Barra", "Sharda Nagar",
    "Chakeri", "Fazalganj", "Naubasta", "Ratan Lal Nagar"
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO COMING SOON SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full pt-28 sm:pt-32 md:pt-36 lg:pt-32 pb-16 sm:pb-20 bg-gradient-to-b from-slate-50/80 via-white to-white overflow-hidden border-b border-slate-100">
        
        {/* Soft Ambient Light Effects */}
        <div className="absolute -left-20 top-16 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute -right-20 top-20 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-red-50/20 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10 text-center">
          
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-[#E31E24] text-xs font-black uppercase tracking-wider mb-6 shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
            <Clock className="w-3.5 h-3.5" />
            <span>
              {isHindi ? "कानपुर सर्विस हब • जल्द आ रहा है" : "KANPUR SERVICE HUB • LAUNCHING SOON"}
            </span>
          </motion.div>

          {/* Icon Glow Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-red-500 to-[#E31E24] text-white flex items-center justify-center shadow-xl shadow-red-500/20"
          >
            <Bike className="w-8 h-8 sm:w-10 sm:h-10" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.2] mb-4 max-w-3xl mx-auto"
          >
            <span>
              {isHindi ? "कानपुर में टू-व्हीलर स्क्रैपिंग सेवाएं" : "Two-Wheeler Scrapping in Kanpur"}
            </span>
            <span className="block text-[#E31E24] mt-2">
              {isHindi ? "— बाइक और स्कूटर स्क्रैप, जल्द उपलब्ध" : "— Bike & Scooter Scrapping, Coming Soon"}
            </span>
          </motion.h1>

          {/* Subheading / Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-600 text-sm sm:text-base md:text-lg font-normal leading-relaxed mb-8 max-w-2xl mx-auto"
          >
            {isHindi
              ? "हम कानपुर में मोटरसाइकल, स्कूटर और मोपेड के लिए अधिकृत RVSF वाहन स्क्रैपिंग सुविधा शुरू कर रहे हैं। जल्द ही आप अपनी पुरानी या अनुपयोगी बाइक को कानूनी रूप से स्क्रैप करा सकेंगे, मुफ्त डोरस्टेप पिकअप और तत्काल जमा प्रमाणपत्र (COD) के साथ।"
              : "We are preparing our government-authorised RVSF infrastructure in Kanpur to support motorcycles, scooters, and mopeds. Soon you will be able to scrap your old or unfit 2-wheelers 100% legally with free doorstep pickup and instant COD certificate issuance."}
          </motion.p>

          {/* Quick Trust Points */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-8 sm:mb-10 text-xs sm:text-sm font-semibold text-slate-700"
          >
            <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>{isHindi ? "RTO अधिकृत RVSF" : "RTO Authorised RVSF"}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>{isHindi ? "परिवहन COD प्रमाणपत्र" : "Parivahan COD Certificate"}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>{isHindi ? "कानूनी RC रद्दीकरण सहायता" : "Complete RC Cancellation"}</span>
            </div>
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 max-w-md mx-auto"
          >
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#25D366] text-white font-extrabold text-sm sm:text-base shadow-md shadow-emerald-500/20 hover:bg-[#20ba59] transition-all hover:scale-[1.02] cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{isHindi ? "लॉन्च अपडेट के लिए व्हाट्सएप करें" : "Get Notified on WhatsApp"}</span>
            </a>

            <Link
              href="/vehicle-scrapping-services-kanpur"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm sm:text-base hover:bg-slate-800 transition-all hover:scale-[1.02]"
            >
              <span>{isHindi ? "कार / चार पहिया स्क्रैपिंग" : "Car Scrapping Live"}</span>
              <ArrowRight className="w-4 h-4 text-red-400" />
            </Link>
          </motion.div>

          {/* Informational Callout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-500 bg-slate-100/70 px-4 py-2 rounded-xl"
          >
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {isHindi
                ? "कार, वैन या वाणिज्यिक वाहन स्क्रैप करना है? हमारी 4-पहिया स्क्रैपिंग सेवाएं कानपुर में पहले से लाइव हैं।"
                : "Looking to scrap a car, van, or commercial vehicle today? Our 4-wheeler scrapping in Kanpur is fully operational."}
            </span>
          </motion.div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: UPCOMING SERVICE HIGHLIGHTS (4 CARDS)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#E31E24]">
              {isHindi ? "आगामी सुविधाएं" : "WHAT TO EXPECT"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {isHindi 
                ? "कानपुर में टू-व्हीलर स्क्रैपिंग से आपको क्या मिलेगा" 
                : "What Our Kanpur 2-Wheeler Scrapping Will Offer"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {upcomingFeatures.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={i}
                  className="bg-slate-50 hover:bg-white border border-slate-200/90 hover:border-red-300 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5 group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E31E24] group-hover:bg-[#E31E24] group-hover:text-white transition-colors flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 mb-2">
                      {isHindi ? f.titleHi : f.titleEn}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      {isHindi ? f.descHi : f.descEn}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: KANPUR COVERAGE AREAS PREVIEW
      ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-slate-50/70 border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold mb-4 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-[#E31E24]" />
            <span>{isHindi ? "पूरे कानपुर में कवरेज" : "KANPUR WIDE PICKUP COVERAGE"}</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-3">
            {isHindi 
              ? "कानपुर के सभी प्रमुख इलाकों में मुफ्त बाइक पिकअप" 
              : "Doorstep Pickup Across All Major Kanpur Localities"}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto mb-8">
            {isHindi
              ? "हमारी अधिकृत RVSF लॉजिस्टिक्स टीम कानपुर के प्रत्येक पिन कोड में टू-व्हीलर पिकअप सहायता प्रदान करेगी।"
              : "Our authorised RVSF vehicle carrier network will serve bike owners across every pin code in Kanpur."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-3xl mx-auto">
            {kanpurAreas.map((area, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 text-slate-800 text-xs sm:text-sm font-semibold shadow-2xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E31E24]" />
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: PRE-REGISTER / ENQUIRY BANNER
      ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white p-6 sm:p-10 shadow-xl border border-slate-800 text-center sm:text-left">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#E31E24]">
                  {isHindi ? "अग्रिम पूछताछ" : "EARLY INQUIRY"}
                </span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {isHindi 
                    ? "क्या आपके पास कानपुर में पुरानी बाइक या स्कूटर है?" 
                    : "Have an Old Bike or Scooter in Kanpur?"}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg">
                  {isHindi
                    ? "हमारे विशेषज्ञों से व्हाट्सएप पर संपर्क करें और टू-व्हीलर स्क्रैपिंग शुरू होने पर प्राथमिकता सूची में शामिल हों।"
                    : "Connect with our support team on WhatsApp to pre-register and be first in line when two-wheeler pickups commence."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white font-black text-xs sm:text-sm shadow-md hover:bg-[#20ba59] transition-all w-full sm:w-auto cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isHindi ? "व्हाट्सएप संपर्क" : "WhatsApp Inquiry"}</span>
                </a>

                <a
                  href="tel:+919839447733"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/15 transition-all w-full sm:w-auto"
                >
                  <Phone className="w-4 h-4" />
                  <span>+91 98394 47733</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
