"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Car,
  Bike,
  Bus,
  Truck,
  Building2,
  Zap,
  Tractor,
  Plus,
  ArrowRight,
} from "lucide-react"

export default function VehicleCategoriesSection() {
  const params = useParams()
  const isHindi = params?.locale === "hi"

  const whatsappUrl =
    "https://wa.me/919839447733?text=Hi%2C%20I%20have%20a%20vehicle%20category%20query"

  const categories = [
    {
      title: isHindi ? "कार" : "Car",
      description: isHindi
        ? "हमारी कार स्क्रैपिंग सुविधा सेवा मालिकों को अधिकृत प्रक्रिया के माध्यम से पुरानी, क्षतिग्रस्त या एंड-ऑफ-लाइफ कारों को स्क्रैप करने में मदद करती है, जिसमें मूल्य निर्धारण, पिकअप और दस्तावेज़ीकरण सहायता शामिल है।"
        : "Our car scrapping facility service helps owners scrap old, damaged or end-of-life cars through an authorised process, with valuation, pickup and documentation support.",
      cta: isHindi ? "मेरी कार स्क्रैप करें" : "Scrap My Car",
      href: "/quote?type=car",
      icon: Car,
    },
    {
      title: isHindi ? "बाइक" : "Bike",
      description: isHindi
        ? "उचित स्क्रैपिंग प्रक्रिया के माध्यम से अपनी पुरानी या अयोग्य बाइक को स्क्रैप करें, वाहन मूल्यांकन और पिकअप से लेकर आवश्यक दस्तावेज़ीकरण तक सहायता के साथ।"
        : "Scrap your old or unfit bike through a proper scrapping process, with support from vehicle valuation and pickup to the required documentation.",
      cta: isHindi ? "मेरी बाइक स्क्रैप करें" : "Scrap My Bike",
      href: "/quote?type=bike",
      icon: Bike,
    },
    {
      title: isHindi ? "बस" : "Bus",
      description: isHindi
        ? "पुरानी या अयोग्य बसों को एक अधिकृत वाहन स्क्रैपिंग सुविधा के माध्यम से संसाधित किया जा सकता है, जिसमें संग्रह और आवश्यक स्क्रैपिंग औपचारिकताओं के लिए सहायता शामिल है।"
        : "Old or unfit buses can be processed through an authorised vehicle scrapping facility, with support for collection and the required scrapping formalities.",
      cta: isHindi ? "मेरी बस स्क्रैप करें" : "Scrap My Bus",
      href: "/quote?type=bus",
      icon: Bus,
    },
    {
      title: isHindi ? "ट्रक" : "Truck",
      description: isHindi
        ? "एक दस्तावेज प्रक्रिया के माध्यम से पुराने, क्षतिग्रस्त या एंड-ऑफ-लाइफ ट्रक को स्क्रैप करें, जिसमें मूल्यांकन, पिकअप और स्क्रैपिंग सहायता शामिल है।"
        : "Scrap an old, damaged or end-of-life truck through a documented process, with valuation, pickup and scrapping support.",
      cta: isHindi ? "मेरा ट्रक स्क्रैप करें" : "Scrap My Truck",
      href: "/quote?type=truck",
      icon: Truck,
    },
    {
      title: isHindi ? "ऑटो-रिक्शा" : "Auto-Rickshaw",
      description: isHindi
        ? "अधिकृत प्रक्रिया के माध्यम से पुराने या अयोग्य ऑटो-रिक्शा को स्क्रैप करें और पिकअप, दस्तावेज़ीकरण और वाहन डी-रजिस्ट्रेशन सहायता प्राप्त करें।"
        : "Scrap an old or unfit auto-rickshaw through an authorised process and get support with pickup, documentation and vehicle deregistration.",
      cta: isHindi ? "मेरा ऑटो-रिक्शा स्क्रैप करें" : "Scrap My Auto-Rickshaw",
      href: "/quote?type=auto",
      icon: Car,
    },
    {
      title: isHindi ? "वाणिज्यिक वाहन" : "Commercial Vehicles",
      description: isHindi
        ? "हम पात्र वाणिज्यिक वाहनों को संभालते हैं जो अपने उपयोगी जीवन के अंत तक पहुंच गए हैं, जिससे मालिकों को मूल्यांकन, संग्रह और स्क्रैपिंग औपचारिकताओं का प्रबंधन करने में मदद मिलती है।"
        : "We handle eligible commercial vehicles that have reached the end of their usable life, helping owners manage valuation, collection and scrapping formalities.",
      cta: isHindi ? "वाणिज्यिक वाहन स्क्रैप करें" : "Scrap My Commercial Vehicle",
      href: "/quote?type=fleet",
      icon: Building2,
    },
    {
      title: isHindi ? "इलेक्ट्रिक वाहन" : "Electric Vehicles",
      description: isHindi
        ? "पुराने, क्षतिग्रस्त या एंड-ऑफ-लाइफ ईवी को उचित अधिकृत स्क्रैपिंग और रीसाइक्लिंग मार्ग के माध्यम से संसाधित किया जा सकता है।"
        : "Old, damaged or end-of-life EVs can be processed through the appropriate authorised scrapping and recycling route.",
      cta: isHindi ? "मेरा EV स्क्रैप करें" : "Scrap My EV",
      href: "/quote?type=ev",
      icon: Zap,
    },
    {
      title: isHindi ? "औद्योगिक और कृषि वाहन" : "Industrial & Agricultural Vehicles",
      description: isHindi
        ? "पात्र औद्योगिक और कृषि वाहनों को स्क्रैप करें जो पुराने, क्षतिग्रस्त या अब उपयोग में नहीं हैं, आवश्यक स्क्रैपिंग प्रक्रिया के माध्यम से सहायता प्राप्त करें।"
        : "Scrap eligible industrial and agricultural vehicles that are old, damaged or no longer in use, with support through the required scrapping process.",
      cta: isHindi ? "औद्योगिक/कृषि वाहन स्क्रैप करें" : "Scrap My Industrial/Agri Vehicle",
      href: "/quote?type=agri",
      icon: Tractor,
    },
    {
      title: isHindi ? "अन्य वाहन" : "Other Vehicles",
      description: isHindi
        ? "यदि आपके पास ऐसा वाहन है जो ऊपर दी गई श्रेणियों में फिट नहीं बैठता है, तो अधिकृत स्क्रैपिंग के लिए इसकी पात्रता की जांच के लिए हमसे संपर्क करें।"
        : "If you have a vehicle that does not fit the categories above, contact us to check its eligibility for authorised scrapping.",
      cta: isHindi ? "मेरा वाहन स्क्रैप करें" : "Scrap My Vehicle",
      href: whatsappUrl,
      isExternal: true,
      icon: Plus,
    },
  ]

  // Staggered Scroll Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.94,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  }

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  }

  return (
    <section className="relative py-12 sm:py-16 bg-white text-black overflow-hidden">
      {/* Background Red Ambient Accents */}
      <div className="absolute top-1/3 -left-16 w-64 h-64 bg-[#E31E24]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-16 w-72 h-72 bg-[#E31E24]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid line background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Animated Top Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="mb-8 sm:mb-10 text-left"
        >
          {/* Category Tag */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2 border border-black shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#E31E24] animate-pulse" />
            {isHindi ? "कवरेज" : "COVERAGE"}
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-black tracking-tight leading-tight mb-3">
            {isHindi ? (
              <>
                हर वाहन प्रकार के लिए वाहन स्क्रैपिंग सेवाएं — <span className="text-[#E31E24]">कार, बाइक, बस, ट्रक और अधिक</span>
              </>
            ) : (
              <>
                Vehicle Scrapping Services for Every Vehicle Type — <span className="text-[#E31E24]">Car, Bike, Bus, Truck & More</span>
              </>
            )}
          </h2>

          {/* Description Paragraph */}
          <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed font-medium">
            {isHindi
              ? "स्क्रैपसेंटर विभिन्न श्रेणियों में पुराने, क्षतिग्रस्त और एंड-ऑफ-लाइफ वाहनों के लिए वाहन स्क्रैपिंग सेवाएं प्रदान करता है। पुरानी कार स्क्रैपिंग से लेकर वाणिज्यिक और औद्योगिक वाहनों तक, आप हमारे RVSF के माध्यम से मूल्यांकन, पिकअप और अधिकृत स्क्रैपिंग सहायता प्राप्त कर सकते हैं।"
              : "ScrapCentre offers vehicle scrapping services for old, damaged and end-of-life vehicles across different categories. From old car scrapping to commercial and industrial vehicles, you can get valuation, pickup and authorised scrapping support through our RVSF."}
          </p>
        </motion.div>

        {/* Compact 3x3 Animated Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {categories.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="group relative bg-white border border-black/10 hover:border-[#E31E24] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-[0_12px_28px_-8px_rgba(227,30,36,0.22)] transition-all duration-300"
              >
                {/* Red Top Accent Line on Hover */}
                <div className="absolute top-0 left-4 right-4 h-[2.5px] bg-[#E31E24] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />

                <div>
                  {/* Compact Icon Container */}
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-black text-white flex items-center justify-center mb-3.5 group-hover:bg-[#E31E24] group-hover:rotate-6 transition-all duration-300 shadow-sm">
                    <Icon size={20} strokeWidth={2.2} className="transition-transform group-hover:scale-110" />
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-black text-black group-hover:text-[#E31E24] transition-colors mb-1 tracking-tight">
                    {item.title}
                  </h3>

                  {/* Subtext */}
                  <p className="text-black/75 text-xs sm:text-sm font-medium leading-normal mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Compact CTA Link */}
                <div className="pt-3 border-t border-black/5 group-hover:border-[#E31E24]/20 transition-colors">
                  {item.isExternal ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-black font-extrabold text-xs sm:text-sm group-hover:text-[#E31E24] transition-colors"
                    >
                      <span>{item.cta}</span>
                      <ArrowRight size={14} className="text-[#E31E24] group-hover:translate-x-1.5 transition-transform duration-300" />
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 text-black font-extrabold text-xs sm:text-sm group-hover:text-[#E31E24] transition-colors"
                    >
                      <span>{item.cta}</span>
                      <ArrowRight size={14} className="text-[#E31E24] group-hover:translate-x-1.5 transition-transform duration-300" />
                    </Link>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Junk Car Scrapping Footer Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-3xl"
        >
          <p>
            {isHindi
              ? "कबाड़ कार स्क्रैपिंग की तलाश कर रहे हैं? स्क्रैपसेंटर आपकी गाड़ी की पात्रता जांचने और अधिकृत स्क्रैपिंग प्रक्रिया में आपका मार्गदर्शन करने में मदद कर सकता है।"
              : "Looking for junk car scrapping? ScrapCentre can help you check your vehicle's eligibility and guide you through the authorised scrapping process."}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
