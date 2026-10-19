"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Caveat } from "next/font/google"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Check,
  CheckCircle2,
  ArrowRight,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Mail,
  ExternalLink,
  ShieldCheck,
  FileText,
  Truck,
  Car,
  Bike,
  Bus,
  Settings,
  HelpCircle,
  ChevronDown,
  Recycle,
  Leaf,
  AlertTriangle,
  Star,
  Building2,
  HardHat,
  Scale,
  Zap,
  ClipboardList,
  Banknote,
  Fuel,
  Disc,
  BatteryCharging,
  TrendingUp,
  Headphones,
  Wrench,
  Search,
  Calendar,
  Key,
  Link2,
  IndianRupee
} from "lucide-react"

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
})

export default function KanpurScrappingClient() {
  const params = useParams()
  const isHindi = params?.locale === "hi"

  // FAQ state (only 1 open by default, single open accordion)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => (prev === idx ? null : idx))
  }

  // Quick form state
  const [vehicleNo, setVehicleNo] = useState("")
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("all")
  const [showTeamModal, setShowTeamModal] = useState<boolean>(false)

  // Auto-rotating highlight for 3 Key Advantage cards
  const [activeAdvantageIndex, setActiveAdvantageIndex] = useState<number>(0)
  const [isAdvantageHovered, setIsAdvantageHovered] = useState<boolean>(false)

  useEffect(() => {
    if (isAdvantageHovered) return
    const timer = setInterval(() => {
      setActiveAdvantageIndex((prev) => (prev + 1) % 3)
    }, 2800)
    return () => clearInterval(timer)
  }, [isAdvantageHovered])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicleNo) {
      window.location.href = `/know-your-valuation${selectedVehicleType !== "all" ? `?type=${selectedVehicleType}` : ""}`
      return
    }
    setFormSubmitted(true)
    setTimeout(() => {
      window.location.href = `/know-your-valuation?vehicle=${encodeURIComponent(vehicleNo)}${selectedVehicleType !== "all" ? `&type=${selectedVehicleType}` : ""}`
    }, 600)
  }

  // 1. Vehicle Categories (Exact 9 from screenshot)
  const vehicleCategories = [
    {
      title: "Cars",
      icon: Car,
      desc: "Hatchbacks, sedans, SUVs, and luxury vehicles. We offer maximum scrap metal value based on kerb weight and salvageable parts.",
      tag: "Private & Commercial Cars",
      link: "/know-your-valuation",
    },
    {
      title: "Two-Wheelers",
      icon: Bike,
      desc: "Motorcycles, scooters, and mopeds. Expired RC, non-running, or accidental bikes scrapped with proper chassis cutting.",
      tag: "UP-78 RC Cancellation",
      link: "/two-wheeler-scrapping-kanpur",
    },
    {
      title: "Commercial Trucks",
      icon: Truck,
      desc: "LCV, MCV, HCV, and heavy trailers. Panki weighbridge-certified weight measurement with transparent per-kg scrap metal payout.",
      tag: "Fleet Scrapping Available",
      link: "/know-your-valuation",
    },
    {
      title: "Buses",
      icon: Bus,
      desc: "School buses, staff buses, tourist coaches, and UPSRTC route buses scrapped in full compliance with state transport norms.",
      tag: "Fitness Expired Buses",
      link: "/know-your-valuation",
    },
    {
      title: "Auto-Rickshaws",
      icon: Zap,
      desc: "3-wheeler CNG, petrol, and diesel passenger autos and cargo loaders. Safe CNG tank degassing and certified dismantling.",
      tag: "CNG Tank Degassing",
      link: "/know-your-valuation",
    },
    {
      title: "Tractors & Farm Vehicles",
      icon: Settings,
      desc: "Agricultural tractors, harvesters, and farm machinery from Kanpur Nagar and Kanpur Dehat farming belts.",
      tag: "Heavy Metal Weight Value",
      link: "/know-your-valuation",
    },
    {
      title: "Construction Machinery",
      icon: HardHat,
      desc: "JCBs, cranes, road rollers, excavators, and earth-moving equipment scrapped on-site or at our Panki facility.",
      tag: "Heavy Machinery Scrapping",
      link: "/know-your-valuation",
    },
    {
      title: "Fleet Scrapping",
      icon: Building2,
      desc: "Corporate fleets, logistics operators, government department auctions, and corporate write-offs handled seamlessly.",
      tag: "GST Invoicing & Tenders",
      link: "/contact",
    },
    {
      title: "Accidental Vehicles",
      icon: AlertTriangle,
      desc: "Total loss, burnt, flood-damaged, and non-drivable vehicles picked up with specialized flatbed cranes and hydraulic winches.",
      tag: "Total Loss & Insurance Scrap",
      link: "/know-your-valuation",
    },
  ]

  // 2. 4-Step Scrapping Process
  const processSteps = [
    {
      num: "01",
      icon: MapPin,
      badge: "AT YOUR DOORSTEP",
      title: "Share Your Number & Locality",
      desc: "Share your vehicle number and Kanpur locality through our website or WhatsApp. We’ll provide a valuation estimate and confirm your pickup slot on WhatsApp for our vehicle scrapping home service in Kanpur.",
      descHi: "हमारी वेबसाइट या व्हाट्सएप के माध्यम से अपना वाहन नंबर और कानपुर का इलाका साझा करें। हम मूल्यांकन अनुमान प्रदान करेंगे और कानपुर में हमारी होम सेवा के लिए पिकअप स्लॉट की पुष्टि करेंगे।",
      footerStep: "STEP 01",
    },
    {
      num: "02",
      icon: Truck,
      badge: "PICKUP",
      title: "Free Doorstep Pickup",
      desc: "Once scrapping is confirmed, we arrange free doorstep pickup at your location. If your vehicle isn’t running, we can also provide towing support for damaged vehicle pickup in Kanpur.",
      descHi: "स्क्रैपिंग की पुष्टि होने के बाद, हम आपके स्थान पर मुफ्त डोरस्टेप पिकअप की व्यवस्था करते हैं। यदि आपका वाहन चालू नहीं है, तो हम टोइंग सहायता भी प्रदान कर सकते हैं।",
      footerStep: "STEP 02",
    },
    {
      num: "03",
      icon: FileText,
      badge: "PAPERWORK",
      title: "Documents & RC Cancellation",
      desc: "Submit the required documents, and our team will guide you through the paperwork and RC cancellation process, making vehicle scrapping paperwork in Kanpur easier to manage.",
      descHi: "आवश्यक दस्तावेज जमा करें, और हमारी टीम कागजी कार्रवाई और आरसी रद्दीकरण प्रक्रिया में आपका मार्गदर्शन करेगी।",
      footerStep: "STEP 03",
    },
    {
      num: "04",
      icon: ShieldCheck,
      badge: "AUTHORISED RVSF",
      title: "Payment & Certificate of Deposit",
      desc: "Once your vehicle is processed at our authorised RVSF, you’ll receive the applicable payment and a Certificate of Deposit in Kanpur as proof of scrapping.",
      descHi: "एक बार जब आपका वाहन हमारे अधिकृत RVSF में प्रोसेस हो जाता है, तो आपको लागू भुगतान और स्क्रैपिंग के प्रमाण के रूप में जमा प्रमाणपत्र (COD) प्राप्त होगा।",
      footerStep: "STEP 04",
    },
  ]

  // 3. Document Checklist (Exact text from screenshot)
  const docList = [
    {
      num: "1",
      title: "Registration Certificate (Original RC)",
      tagText: "Original RC (smart card or paper RC). If lost, copy of police complaint (NCR) is accepted.",
    },
    {
      num: "2",
      title: "Registered Owner ID & Address Proof",
      tagText: "Self-attested copy of Aadhaar Card, PAN Card, or Passport matching the RC owner's name.",
    },
    {
      num: "3",
      title: "Cancelled Cheque / Bank Details",
      tagText: "Bank account details or cancelled cheque in owner's name for direct online bank transfer.",
    },
    {
      num: "4",
      title: "Financier NOC (if vehicle has active loan)",
      tagText: "Bank clearance certificate / Form 35 if the vehicle had a hypothecation or active loan.",
    },
  ]

  // 4. Value Factors Table
  const valueFactors = [
    {
      factor: "Vehicle type and weight",
      factorHi: "वाहन का प्रकार और वजन",
      icon: Car,
      whatWeCheck: "The type of vehicle and its overall weight",
      whatWeCheckHi: "वाहन का प्रकार और उसका कुल वजन",
      howItAffects: "The vehicle’s weight helps determine the amount of recoverable material.",
      howItAffectsHi: "वाहन का वजन पुनर्चक्रण योग्य सामग्री की मात्रा निर्धारित करने में मदद करता है।",
    },
    {
      factor: "Make, model and age",
      factorHi: "मेक, मॉडल और आयु",
      icon: Calendar,
      whatWeCheck: "The vehicle’s brand, model and manufacturing year",
      whatWeCheckHi: "वाहन का ब्रांड, मॉडल और निर्माण वर्ष",
      howItAffects: "These details help us assess the vehicle for valuation and applicable benefits.",
      howItAffectsHi: "ये विवरण हमें मूल्यांकन और लागू लाभों के लिए वाहन का आकलन करने में मदद करते हैं।",
    },
    {
      factor: "Condition",
      factorHi: "स्थिति",
      icon: Key,
      whatWeCheck: "Whether the vehicle is running, damaged or accident-affected",
      whatWeCheckHi: "वाहन चालू है, क्षतिग्रस्त है या दुर्घटनाग्रस्त है",
      howItAffects: "Its current condition can affect the estimated scrap value.",
      howItAffectsHi: "इसकी वर्तमान स्थिति अनुमानित स्क्रैप मूल्य को प्रभावित कर सकती है।",
    },
    {
      factor: "Completeness",
      factorHi: "पूर्णता",
      icon: Link2,
      whatWeCheck: "Whether key parts, such as the engine, battery, tyres and body panels, are present",
      whatWeCheckHi: "क्या प्रमुख हिस्से, जैसे इंजन, बैटरी, टायर और बॉडी पैनल मौजूद हैं",
      howItAffects: "Missing major parts may lower the valuation.",
      howItAffectsHi: "प्रमुख हिस्सों के गायब होने से मूल्यांकन कम हो सकता है।",
    },
    {
      factor: "Metal and market rates",
      factorHi: "धातु और बाजार दरें",
      icon: IndianRupee,
      whatWeCheck: "Current rates for steel, aluminium and other metals",
      whatWeCheckHi: "स्टील, एल्युमीनियम और अन्य धातुओं की वर्तमान दरें",
      howItAffects: "Changes in metal prices can affect the amount quoted.",
      howItAffectsHi: "धातु की कीमतों में बदलाव उद्धृत राशि को प्रभावित कर सकता है।",
    },
    {
      factor: "Documents",
      factorHi: "दस्तावेज़",
      icon: FileText,
      whatWeCheck: "RC, owner ID proof and financier NOC, if applicable",
      whatWeCheckHi: "आरसी, मालिक का पहचान पत्र और फाइनेंसर एनओसी (यदि लागू हो)",
      howItAffects: "Having the required documents ready can help avoid delays in the process.",
      howItAffectsHi: "आवश्यक दस्तावेज तैयार रखने से प्रक्रिया में देरी से बचने में मदद मिल सकती है।",
    },
  ]

  // 5. Kanpur Localities (Exact 12 from screenshot)
  const kanpurAreas = [
    "Panki",
    "Kalpi Road",
    "Jajmau",
    "Kakadeo",
    "Kidwai Nagar",
    "Govind Nagar",
    "Naubasta",
    "Barra",
    "Chakeri",
    "Dada Nagar",
    "Fazalganj",
    "Kalyanpur",
  ]

  // City Hero Config for Kanpur (Reusable across city pages)
  const cityHeroConfig = {
    descriptionEn: "Have an old or damaged vehicle you no longer use? Our vehicle scrapping services in Kanpur offer free valuation, doorstep pickup, and support with RC cancellation and paperwork through an authorised RVSF.",
    descriptionHi: "क्या आपके पास कोई पुराना या क्षतिग्रस्त वाहन है जिसका आप अब उपयोग नहीं करते हैं? कानपुर में हमारी वाहन स्क्रैपिंग सेवाएं एक अधिकृत RVSF के माध्यम से मुफ्त मूल्यांकन, डोरस्टेप पिकअप, और आरसी रद्दीकरण और कागजी कार्रवाई में सहायता प्रदान करती हैं।",
    trustBadges: [
      { en: "RTO Authorised RVSF", hi: "RTO अधिकृत RVSF" },
      { en: "Instant COD Issued", hi: "तुरंत COD जारी" },
      { en: "Free Doorstep Pickup", hi: "मुफ्त डोरस्टेप पिकअप" },
      { en: "RC Cancellation Support", hi: "RC रद्दीकरण सहायता" },
    ],
    phoneTel: "+919839447733",
    phoneDisplay: "+91-9839447733",
    whatsappUrl: "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20have%20a%20vehicle%20to%20scrap%20in%20Kanpur.",
    facilityLocation: "26-A & B, Block-E, Panki, Kalpi Road, Kanpur - 208020",
  }

  // 6. FAQs
  const faqItems: Array<{ q: string; qHi: string; a: string; aHi: string; ansRender?: (isHindi: boolean) => React.ReactNode }> = [
    {
      q: "Where can I scrap my vehicle in Kanpur?",
      qHi: "मैं कानपुर में अपना वाहन कहाँ स्क्रैप कर सकता हूँ?",
      a: "You can scrap your vehicle at our authorised RVSF in Panki, on Kalpi Road, Kanpur. To get started, share your vehicle number through our website or WhatsApp. We’ll provide a valuation estimate and arrange free doorstep pickup. Our vehicle scrapping center in Kanpur supports you through the process.",
      aHi: "आप कानपुर के कालपी रोड, पनकी में हमारे अधिकृत RVSF में अपना वाहन स्क्रैप कर सकते हैं। शुरू करने के लिए, हमारी वेबसाइट या व्हाट्सएप के माध्यम से अपना वाहन नंबर साझा करें। हम मूल्यांकन अनुमान प्रदान करेंगे और मुफ्त डोरस्टेप पिकअप की व्यवस्था करेंगे। कानपुर में हमारा वाहन स्क्रैपिंग केंद्र इस प्रक्रिया में आपका समर्थन करता है।",
    },
    {
      q: "Is ScrapCentre an authorised vehicle scrapping facility in Kanpur?",
      qHi: "क्या स्क्रैपसेंटर कानपुर में अधिकृत वाहन स्क्रैपिंग सुविधा है?",
      a: "Yes, we operate as an RTO-authorised RVSF in Kanpur and issue a Certificate of Deposit (COD) after scrapping. As a government authorized RVSF in Kanpur, we follow the authorised vehicle scrapping process.",
      aHi: "हाँ, हम कानपुर में RTO-अधिकृत RVSF के रूप में काम करते हैं और स्क्रैपिंग के बाद जमा प्रमाणपत्र (COD) जारी करते हैं। कानपुर में सरकार द्वारा अधिकृत RVSF के रूप में, हम अधिकृत वाहन स्क्रैपिंग प्रक्रिया का पालन करते हैं।",
    },
    {
      q: "Which areas of Kanpur do you cover for pickup?",
      qHi: "पिकअप के लिए आप कानपुर के कौन से क्षेत्रों को कवर करते हैं?",
      a: "We provide pickup across Kanpur, including Panki, Kalpi Road, Jajmau, Kakadeo, Kidwai Nagar, Govind Nagar, Naubasta, Barra, Chakeri, Dada Nagar, Fazalganj and Kalyanpur. If your locality isn’t listed, message us on WhatsApp to check availability for vehicle scrapping services in Panki, Kanpur and other areas.",
      aHi: "हम कानपुर भर में पिकअप प्रदान करते हैं, जिसमें पनकी, कालपी रोड, जाजमऊ, काकादेव, किदवई नगर, गोविंद नगर, नौबस्ता, बर्रा, चकेरी, दादा नगर, फजलगंज और कल्याणपुर शामिल हैं। यदि आपका इलाका सूचीबद्ध नहीं है, तो कानपुर और अन्य क्षेत्रों में उपलब्धता जांचने के लिए हमें व्हाट्सएप पर संदेश भेजें।",
    },
    {
      q: "Do you scrap trucks, buses and other commercial vehicles in Kanpur?",
      qHi: "क्या आप कानपुर में ट्रकों, बसों और अन्य वाणिज्यिक वाहनों को स्क्रैप करते हैं?",
      a: "Yes, we handle old, damaged and end-of-life trucks, buses and eligible commercial vehicles. Our services for truck and bus scrapping in Kanpur include support for vehicles that are no longer running. Share your vehicle details so we can check eligibility and explain the next steps for commercial vehicle scrapping in Kanpur.",
      aHi: "हाँ, हम पुराने, क्षतिग्रस्त और जीवन समाप्त हो चुके ट्रकों, बसों और पात्र वाणिज्यिक वाहनों को संभालते हैं। कानपुर में ट्रक और बस स्क्रैपिंग के लिए हमारी सेवाओं में उन वाहनों के लिए सहायता शामिल है जो अब चालू स्थिति में नहीं हैं। वाणिज्यिक वाहन स्क्रैपिंग के अगले चरणों को समझने के लिए अपने वाहन विवरण साझा करें।",
    },
    {
      q: "Can I scrap an auto-rickshaw or e-rickshaw in Kanpur?",
      qHi: "क्या मैं कानपुर में ऑटो-रिक्शा या ई-रिक्शा स्क्रैप कर सकता हूँ?",
      a: "Yes, old or unfit auto-rickshaws and e-rickshaws may be eligible for scrapping through the appropriate authorised process. Contact us with your vehicle details so we can check eligibility for auto rickshaw scrapping in Kanpur or e rickshaw scrapping in Kanpur.",
      aHi: "हाँ, पुराने या अनफिट ऑटो-रिक्शा और ई-रिक्शा उचित अधिकृत प्रक्रिया के माध्यम से स्क्रैपिंग के लिए पात्र हो सकते हैं। कानपुर में ऑटो रिक्शा स्क्रैपिंग या ई रिक्शा स्क्रैपिंग की पात्रता जांचने के लिए अपने वाहन विवरण के साथ हमसे संपर्क करें।",
    },
    {
      q: "How much will I get for scrapping my vehicle in Kanpur?",
      qHi: "कानपुर में अपने वाहन को स्क्रैप करने पर मुझे कितना मिलेगा?",
      a: "The scrap value depends on the vehicle category, weight, condition, and prevailing scrap metal prices in Kanpur. Share your vehicle details for an instant transparent valuation.",
      aHi: "स्क्रैप मूल्य वाहन की श्रेणी, वजन, स्थिति और कानपुर में प्रचलित स्क्रैप धातु की कीमतों पर निर्भर करता है। तत्काल पारदर्शी मूल्यांकन के लिए अपने वाहन का विवरण साझा करें।",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO SECTION (Matching Reference Design: Left-Aligned, Pure White, Card Grid)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full pt-24 sm:pt-28 md:pt-28 lg:pt-16 pb-8 sm:pb-10 lg:pb-12 bg-white overflow-hidden border-b border-slate-100">

        {/* Kanpur Hero Background Car Image (from public/locationimg/kanpurbg.png) */}
        <div
          className="absolute inset-0 pointer-events-none bg-no-repeat bg-right-top bg-contain z-0 hidden sm:block"
          style={{ backgroundImage: "url('/locationimg/kanpurbg.png')" }}
        />

        {/* Soft Ambient Light Effects (Subtle organic light accents, matching reference) */}
        <div className="absolute -left-24 top-8 w-96 h-96 bg-red-100/30 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute -right-24 top-16 w-96 h-96 bg-emerald-50/40 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute top-0 left-1/3 w-96 h-64 bg-red-50/20 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">

          {/* Top Half: Left-Aligned Content Area (Leaves right area open for user's bg car image) */}
          <div className="max-w-2xl sm:max-w-3xl lg:max-w-4xl text-left pt-4 sm:pt-5 lg:pt-6">

            {/* 1. Main Headline (H1) - Left Aligned, Exact 2-Line Rhythm Matching Reference */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-2 sm:mt-0 text-2xl sm:text-3xl lg:text-[2.25rem] xl:text-[2.5rem] font-black text-slate-900 tracking-tight leading-[1.2] mb-3.5 sm:mb-4 text-left"
            >
              <span className="block">Vehicle Scrapping Services in Kanpur</span>
              <span className="block text-[#E31E24] mt-2 sm:mt-2.5">
                — Authorised RVSF, Free Doorstep Pickup
              </span>
            </motion.h1>

            {/* 2. Supporting Text */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-slate-600 text-sm sm:text-base lg:text-[17px] font-normal leading-relaxed mb-5 sm:mb-6 max-w-2xl text-left"
            >
              {isHindi ? cityHeroConfig.descriptionHi : cityHeroConfig.descriptionEn}
            </motion.p>

            {/* 3. Four Trust Badges in Left-Aligned Row */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap items-center justify-start gap-2 sm:gap-2.5 mb-6 sm:mb-7"
            >
              {cityHeroConfig.trustBadges.map((b, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 sm:gap-2 bg-white border border-red-200/80 hover:border-red-300 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
                >
                  <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-100 text-[#E31E24] flex items-center justify-center text-[9px] sm:text-[10px] font-black shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span>{isHindi ? b.hi : b.en}</span>
                </div>
              ))}
            </motion.div>

            {/* 4. Dual Primary CTA Action Row - Left-Aligned */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 sm:gap-3.5 mb-6 sm:mb-7 lg:mb-8"
            >
              {/* CTA 1: Get Free Valuation (Gooey hover effect identical to Login button) */}
              <Link
                href="/know-your-valuation"
                className="c-button--gooey inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-[#E31E24] text-white border-2 border-[#E31E24] font-extrabold text-xs sm:text-sm lg:text-base tracking-wide shadow-md shadow-red-500/20 relative overflow-hidden cursor-pointer w-full sm:w-auto min-w-[190px]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>{isHindi ? "मुफ्त मूल्यांकन प्राप्त करें" : "Get Free Valuation"}</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
                <div className="c-button__blobs">
                  <div />
                  <div />
                  <div />
                </div>
              </Link>

              {/* CTA 2: Talk to Our Team */}
              <button
                type="button"
                onClick={() => setShowTeamModal(true)}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-white border border-slate-300 hover:border-[#E31E24] hover:bg-red-50/50 text-slate-800 hover:text-[#E31E24] font-bold text-xs sm:text-sm lg:text-base tracking-wide shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer w-full sm:w-auto min-w-[190px]"
              >
                <Phone className="w-4 h-4 text-[#E31E24]" />
                <span>{isHindi ? "हमारी टीम से बात करें" : "Talk to Our Team"}</span>
              </button>
            </motion.div>

          </div>

          {/* Clean Horizontal Divider Line - Shifted up */}
          <div className="w-full border-t border-slate-100 mb-5 sm:mb-6 lg:mb-7" />

          {/* 5. Three Key Advantage Cards - Sequentially Auto-Highlighted */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 w-full"
            onMouseEnter={() => setIsAdvantageHovered(true)}
            onMouseLeave={() => setIsAdvantageHovered(false)}
          >
            {[
              {
                num: "01",
                icon: ShieldCheck,
                title: isHindi ? "अधिकृत RVSF" : "Authorised RVSF",
                desc: isHindi
                  ? "प्रमाणित स्क्रैपिंग के साथ MoRTH दिशानिर्देशों के तहत पंजीकृत पनकी सुविधा"
                  : "Panki facility registered under MoRTH guidelines with certified scrapping",
              },
              {
                num: "02",
                icon: Truck,
                title: isHindi ? "मुफ्त डोरस्टेप पिकअप" : "Free Doorstep Pickup",
                desc: isHindi
                  ? "सभी कानपुर पिन कोड में डोरस्टेप टोइंग और फ्लैटबेड कलेक्शन"
                  : "Doorstep towing and flatbed collection across all Kanpur pin codes",
              },
              {
                num: "03",
                icon: FileText,
                title: isHindi ? "तुरंत COD जारी" : "Instant COD Issued",
                desc: isHindi
                  ? "रोड टैक्स छूट और नई कार खरीद छूट के लिए आधिकारिक जमा प्रमाणपत्र"
                  : "Official deposit certificate for road tax rebates and new car purchase discounts",
              },
            ].map((card, idx) => {
              const isActive = activeAdvantageIndex === idx
              const IconComp = card.icon
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveAdvantageIndex(idx)}
                  className={`relative bg-white rounded-2xl p-4 sm:p-5 lg:p-6 text-left transition-all duration-500 ease-out cursor-pointer overflow-hidden ${
                    isActive
                      ? "border border-[#E31E24] shadow-xl shadow-red-500/10 -translate-y-1 sm:-translate-y-1.5 ring-1 ring-[#E31E24]/20"
                      : "border border-slate-200/80 shadow-xs hover:border-[#E31E24]/60 translate-y-0"
                  }`}
                >
                  {/* Glowing top line accent for active card */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#E31E24] to-transparent transition-opacity duration-500 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  <div className="flex items-start justify-between mb-3.5 sm:mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all duration-500 ${
                        isActive
                          ? "bg-[#E31E24] text-white shadow-md shadow-red-500/25 scale-105"
                          : "bg-red-50 text-[#E31E24]"
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span
                      className={`font-black text-lg sm:text-xl transition-colors duration-500 select-none ${
                        isActive ? "text-red-300" : "text-slate-300"
                      }`}
                    >
                      {card.num}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight mb-1.5">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] lg:text-sm text-slate-500 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              )
            })}
          </div>

        </div>

        {/* Team Contact Modal (Site colors, instant action) */}
        <AnimatePresence>
          {showTeamModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setShowTeamModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-red-100 text-left relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center font-bold">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        {isHindi ? "हमारी टीम से संपर्क करें" : "Talk to Our Team"}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Direct dispatch & paperwork support</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTeamModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  {/* Option 1: Direct Phone */}
                  <a
                    href={`tel:${cityHeroConfig.phoneTel}`}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-red-50/60 hover:bg-red-50 border border-red-100 text-slate-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#E31E24] text-white flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Direct Hotline</div>
                        <div className="text-sm font-black text-slate-900">{cityHeroConfig.phoneDisplay}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#E31E24]">Call Now →</span>
                  </a>

                  {/* Option 2: WhatsApp Chat */}
                  <a
                    href={cityHeroConfig.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-red-50/40 border border-slate-200 hover:border-red-200 text-slate-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                        <MessageCircle className="w-4 h-4 text-[#E31E24]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Dispatch</div>
                        <div className="text-sm font-black text-slate-900">Chat with Kanpur Specialist</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">Open Chat →</span>
                  </a>

                  {/* Option 3: Facility Address */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E31E24]" />
                      <span>Authorised RVSF Location</span>
                    </div>
                    <div className="font-semibold text-slate-800 leading-snug">
                      {cityHeroConfig.facilityLocation}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SVG Filter for Gooey Button Effect */}
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

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: AUTHORISED VEHICLE SCRAPPING IN KANPUR (REDESIGNED)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-gradient-to-b from-white via-slate-50/40 to-white text-slate-900 border-b border-slate-100 relative overflow-hidden">
        {/* Soft background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-50/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-100/60 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Category Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
                <span>SCRAPPING IN KANPUR</span>
              </div>

              {/* Main Headline with balanced breaks */}
              <h2 className="text-2xl sm:text-3xl lg:text-[27px] xl:text-[31px] font-black text-slate-900 tracking-tight leading-[1.25]">
                Authorised Vehicle Scrapping in Kanpur <br className="hidden sm:inline" />
                <span className="text-[#E31E24]">— Handled Locally, Done Legally</span>
              </h2>

              {/* Introduction Paragraphs */}
              <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                <p>
                  {isHindi
                    ? "हम कानपुर में एक अधिकृत वाहन स्क्रैपिंग कंपनी हैं, जो व्यक्तियों और व्यवसायों को एक अधिकृत प्रक्रिया के माध्यम से अपने वाहनों को स्क्रैप करने में मदद करती है। कानपुर में हमारी पंजीकृत वाहन स्क्रैपिंग सुविधा (RVSF) स्क्रैपिंग के बाद जमा प्रमाणपत्र (COD) जारी करती है। चाहे आपके पास निजी वाहन, ट्रक, बस या ई-रिक्शा हो, हमारी टीम प्रक्रिया में आपका मार्गदर्शन कर सकती है और आवश्यक कदमों में मदद कर सकती है।"
                    : "We are an authorised vehicle scrapping company in Kanpur, helping individuals and businesses scrap their vehicles through an authorised process. Our registered vehicle scrapping facility in Kanpur issues a Certificate of Deposit (COD) after scrapping. Whether you have a private vehicle, truck, bus or e-rickshaw, our team can guide you through the process and help with the required steps."}
                </p>
                <p>
                  {isHindi ? (
                    <>
                      हमारे सरकारी अधिकृत RVSF कानपुर में, आप मुफ्त मूल्यांकन, मुफ्त डोरस्टेप पिकअप और कागजी कार्रवाई व आरसी रद्दीकरण में सहायता प्राप्त कर सकते हैं। हम कानपुर में विभिन्न प्रकार के वाहनों के लिए समर्पित सेवाओं के साथ वाहन स्क्रैपिंग भी प्रदान करते हैं। कार और बाइक मालिक हमारे कानपुर के{" "}
                      <Link href="/hi/four-wheeler-scrapping-kanpur" className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4">
                        फोर-व्हीलर
                      </Link>{" "}
                      और{" "}
                      <Link href="/hi/two-wheeler-scrapping-kanpur" className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4">
                        टू-व्हीलर
                      </Link>{" "}
                      स्क्रैपिंग पेजों पर विवरण पा सकते हैं।
                    </>
                  ) : (
                    <>
                      At our government-authorized RVSF in Kanpur, you can get a free valuation, free doorstep pickup and support with paperwork and RC cancellation. We also provide vehicle scrapping in Kanpur, with dedicated services for different vehicle types. Car and bike owners can find details on our{" "}
                      <Link href="/four-wheeler-scrapping-kanpur" className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4">
                        four-wheeler
                      </Link>{" "}
                      and{" "}
                      <Link href="/two-wheeler-scrapping-kanpur" className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4">
                        two-wheeler
                      </Link>{" "}
                      scrapping pages in Kanpur.
                    </>
                  )}
                </p>
              </div>

              {/* 3 Quick Value Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/70 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-slate-900 leading-tight">MoRTH Certified</div>
                    <div className="text-[11px] text-slate-500">Panki RVSF Facility</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/70 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-slate-900 leading-tight">Official COD Issued</div>
                    <div className="text-[11px] text-slate-500">Tax Rebate Eligible</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/70 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-slate-900 leading-tight">Zero Towing Fee</div>
                    <div className="text-[11px] text-slate-500">All 12 Kanpur Zones</div>
                  </div>
                </div>
              </div>



            </div>

            {/* Right Card: KANPUR AT A GLANCE (Command Center Design) */}
            <div className="lg:col-span-5 pt-2 lg:pt-0">
              <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden relative transition-all duration-300 hover:shadow-2xl hover:border-slate-300">
                {/* Sleek top brand accent line */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#E31E24] via-rose-500 to-[#E31E24]" />

                {/* Card Dark Header */}
                <div className="bg-slate-950 text-white p-5 sm:p-6 relative overflow-hidden text-left">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-black uppercase tracking-[0.16em] text-white">
                        KANPUR AT A GLANCE
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      Live Hub
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    Authorised RVSF facility & fast local dispatch across Kanpur
                  </p>
                </div>

                {/* 4 Details Rows */}
                <div className="divide-y divide-slate-100 p-3 sm:p-4 text-left">

                  {/* VISIT US */}
                  <div className="p-3.5 hover:bg-slate-50/70 rounded-2xl transition-colors">
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            VISIT US • RVSF FACILITY
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 leading-relaxed">
                          26-A & B, Block-E, Panki, Kalpi Road, Kanpur, Uttar Pradesh 208020
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PICKUP */}
                  <div className="p-3.5 hover:bg-slate-50/70 rounded-2xl transition-colors">
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0 mt-0.5">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            DOORSTEP PICKUP
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            100% Free
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 leading-snug">
                          Free doorstep towing & flatbed collection across all Kanpur pin codes
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Pickup slot confirmed immediately on WhatsApp
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CALL OR WHATSAPP */}
                  <div className="p-3.5 hover:bg-slate-50/70 rounded-2xl transition-colors">
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0 mt-0.5">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                          CALL OR WHATSAPP
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <a
                            href="tel:+919839447733"
                            className="text-sm font-black text-slate-900 hover:text-[#E31E24] tracking-tight transition-colors"
                          >
                            +91-9839447733
                          </a>
                          <div className="flex items-center gap-1.5">
                            <a
                              href="tel:+919839447733"
                              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-[#E31E24] text-[11px] font-bold transition-colors"
                            >
                              Call
                            </a>
                            <a
                              href="https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20have%20a%20vehicle%20to%20scrap%20in%20Kanpur."
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors"
                            >
                              WhatsApp
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="p-3.5 hover:bg-slate-50/70 rounded-2xl transition-colors">
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0 mt-0.5">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                          OFFICIAL EMAIL
                        </div>
                        <a
                          href="mailto:contact@scrapcentre.com"
                          className="text-xs font-bold text-slate-900 hover:text-[#E31E24] transition-colors block truncate"
                        >
                          contact@scrapcentre.com
                        </a>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Bottom Quick Contact Action */}
                <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 text-left flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-black text-slate-900 leading-tight">Need Help in Kanpur?</div>
                    <div className="text-[11px] text-slate-500">Talk to our local RVSF specialist</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTeamModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#E31E24] hover:bg-[#c9181e] text-white text-xs font-black shadow-md shadow-red-500/20 transition-all hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
                  >
                    Contact Team
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: VEHICLES WE SCRAP IN KANPUR (REDESIGNED & RESPONSIVE)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-slate-50/60 text-slate-900 border-b border-slate-100 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

          {/* Section Header */}
          <div className="text-left mb-8 sm:mb-12 max-w-4xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
              <span>VEHICLES WE SCRAP IN KANPUR</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              Truck, Bus, Auto, Tractor & Commercial Vehicle Scrapping in Kanpur <br className="hidden sm:inline" />
              <span className="text-[#E31E24]">— Every Vehicle Type, One Team</span>
            </h2>

            {/* Section Intro */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {isHindi
                ? "हम ट्रकों, बसों, ऑटो, ट्रैक्टरों, व्यावसायिक वाहनों और ईवी के लिए कानपुर में वाहन स्क्रैपिंग संभालते हैं। हमारे RVSF के माध्यम से मुफ्त मूल्यांकन, डोरस्टेप पिकअप और अधिकृत स्क्रैपिंग सहायता प्राप्त करें।"
                : "We handle vehicle scrapping in Kanpur for trucks, buses, autos, tractors, commercial vehicles and EVs. Get a free valuation, doorstep pickup and authorised scrapping support through our RVSF."}
            </p>
          </div>

          {/* 3 x 3 Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {[
              {
                id: "cars",
                num: "01",
                icon: Car,
                title: isHindi ? "कारें (Cars)" : "Cars",
                badge: isHindi ? "लोकप्रिय" : "Popular",
                desc: isHindi
                  ? "क्या आपके पास कार, एसयूवी या हैचबैक है? कार मालिकों के लिए हमारा समर्पित पेज पिकअप, कागजी कार्रवाई और मूल्यांकन को विस्तार से कवर करता है।"
                  : "Own a car, SUV or hatchback? Our dedicated page for car owners covers pickup, paperwork and valuation in detail.",
                linkText: isHindi ? "कानपुर में फोर-व्हीलर स्क्रैपिंग" : "Four-Wheeler Scrapping in Kanpur",
                href: isHindi ? "/hi/four-wheeler-scrapping-kanpur" : "/four-wheeler-scrapping-kanpur",
                isExternal: false,
              },
              {
                id: "bikes",
                num: "02",
                icon: Bike,
                title: isHindi ? "बाइक और स्कूटर" : "Bikes & Scooters",
                badge: isHindi ? "2-व्हीलर" : "2-Wheeler",
                desc: isHindi
                  ? "क्या आपके पास बाइक, स्कूटर या मोटरसाइकिल है? दोपहिया मालिकों के लिए हमारा समर्पित पेज पिकअप, दस्तावेजों और मूल्यांकन के बारे में बताता है।"
                  : "Own a bike, scooter or motorcycle? Our dedicated page for two-wheeler owners explains pickup, documents and valuation.",
                linkText: isHindi ? "कानपुर में टू-व्हीलर स्क्रैपिंग" : "Two-Wheeler Scrapping in Kanpur",
                href: isHindi ? "/hi/two-wheeler-scrapping-kanpur" : "/two-wheeler-scrapping-kanpur",
                isExternal: false,
              },
              {
                id: "trucks",
                num: "03",
                icon: Truck,
                title: isHindi ? "ट्रक और मिनी ट्रक" : "Truck & Mini Truck",
                badge: isHindi ? "हैवी ड्यूटी" : "Heavy Duty",
                desc: isHindi
                  ? "पुराने, क्षतिग्रस्त या जीवन समाप्त हो चुके मालवाहक वाहनों के लिए कानपुर में ट्रक स्क्रैपिंग। हम उन ट्रकों के लिए टोइंग सहायता भी प्रदान करते हैं जो चालू स्थिति में नहीं हैं।"
                  : "Truck scrapping in Kanpur for old, damaged or end-of-life goods vehicles. We also provide towing support for trucks that are no longer running.",
                linkText: isHindi ? "मेरा ट्रक स्क्रैप करें" : "Scrap My Truck",
                href: "/know-your-valuation",
                isExternal: false,
              },
              {
                id: "buses",
                num: "04",
                icon: Bus,
                title: isHindi ? "बस (Bus)" : "Bus",
                badge: isHindi ? "कमर्शियल" : "Commercial",
                desc: isHindi
                  ? "हम अधिकृत स्क्रैपिंग के लिए स्कूल बसों सहित पुरानी या अनफिट बसों को एकत्र करते हैं। हम कानपुर में बस स्क्रैपिंग का समर्थन करते हैं और आवश्यक औपचारिकताओं को संभालते हैं।"
                  : "We collect old or unfit buses, including school buses, for authorised scrapping. We support bus scrapping in Kanpur and handle the required formalities.",
                linkText: isHindi ? "मेरी बस स्क्रैप करें" : "Scrap My Bus",
                href: "/know-your-valuation",
                isExternal: false,
              },
              {
                id: "auto",
                num: "05",
                icon: Car,
                title: isHindi ? "ऑटो और ई-रिक्शा" : "Auto & E-Rickshaw",
                badge: isHindi ? "3-व्हीलर" : "3-Wheeler",
                desc: isHindi
                  ? "ऑटो और टेम्पो से लेकर ई-रिक्शा और तिपहिया वाहनों तक, हम कानपुर में ऑटो रिक्शा स्क्रैपिंग के लिए पिकअप, दस्तावेज़ीकरण और डी-पंजीकरण सहायता प्रदान करते हैं।"
                  : "From autos and tempos to e-rickshaws and three-wheelers, we provide pickup, documentation and deregistration support for auto rickshaw scrapping in Kanpur.",
                linkText: isHindi ? "मेरा ऑटो स्क्रैप करें" : "Scrap My Auto",
                href: "/know-your-valuation",
                isExternal: false,
              },
              {
                id: "tractor",
                num: "06",
                icon: Wrench,
                title: isHindi ? "ट्रैक्टर और कृषि वाहन" : "Tractor & Agri Vehicles",
                badge: isHindi ? "कृषि वाहन" : "Agriculture",
                desc: isHindi
                  ? "अब पुराने या क्षतिग्रस्त ट्रैक्टर का उपयोग नहीं कर रहे हैं? कानपुर में हमारी ट्रैक्टर स्क्रैपिंग आपको ट्रैक्टर और कृषि वाहनों को स्क्रैप करने के लिए आवश्यक चरणों को समझने में मदद करती है।"
                  : "No longer using an old or damaged tractor? Our tractor scrapping in Kanpur helps you understand the steps required to scrap tractors and agricultural vehicles.",
                linkText: isHindi ? "मेरा कृषि वाहन स्क्रैप करें" : "Scrap My Agri Vehicle",
                href: "/know-your-valuation",
                isExternal: false,
              },
              {
                id: "commercial",
                num: "07",
                icon: Building2,
                title: isHindi ? "कमर्शियल वाहन और बेड़े" : "Commercial Vehicles & Fleets",
                badge: isHindi ? "फ्लीट" : "Fleet Support",
                desc: isHindi
                  ? "पात्र जीवन-समाप्त वाहनों और बेड़े के लिए कानपुर में वाणिज्यिक वाहन स्क्रैपिंग। सरकारी, पुलिस, रक्षा या एम्बुलेंस वाहनों की पात्रता जांचने के लिए हमसे संपर्क करें।"
                  : "Commercial vehicle scrapping in Kanpur for eligible end-of-life vehicles and fleets. Contact us to check eligibility for government, police, defence or ambulance vehicles.",
                linkText: isHindi ? "कमर्शियल वाहन स्क्रैप करें" : "Scrap My Commercial Vehicle",
                href: "/know-your-valuation",
                isExternal: false,
              },
              {
                id: "ev",
                num: "08",
                icon: Zap,
                title: isHindi ? "इलेक्ट्रिक वाहन (EVs)" : "Electric Vehicles",
                badge: isHindi ? "ग्रीन" : "Green Scrap",
                desc: isHindi
                  ? "ई-रिक्शा सहित पुराने, क्षतिग्रस्त या जीवन समाप्त हो चुके इलेक्ट्रिक वाहनों के लिए कानपुर में ईवी स्क्रैपिंग। पात्रता और अधिकृत स्क्रैपिंग प्रक्रिया की जांच के लिए हमसे संपर्क करें।"
                  : "EV scrapping in Kanpur for old, damaged or end-of-life electric vehicles, including e-rickshaws. Contact us to check eligibility and the authorised scrapping process.",
                linkText: isHindi ? "मेरा EV स्क्रैप करें" : "Scrap My EV",
                href: "/know-your-valuation",
                isExternal: false,
              },
              {
                id: "other",
                num: "09",
                icon: HelpCircle,
                title: isHindi ? "कुछ और? (Something Else?)" : "Something Else?",
                badge: isHindi ? "कस्टम" : "Direct Support",
                desc: isHindi
                  ? "क्या आपकी गाड़ी का प्रकार सूची में नहीं दिख रहा है? हमसे संपर्क करें, और हम जांचेंगे कि क्या यह अधिकृत स्क्रैपिंग के लिए पात्र है।"
                  : "Don't see your vehicle type listed? Contact us, and we'll check whether it is eligible for authorised scrapping.",
                linkText: isHindi ? "व्हाट्सएप पर पूछें" : "Ask on WhatsApp",
                href: "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20have%20a%20vehicle%20to%20scrap%20in%20Kanpur.",
                isExternal: true,
              },
            ].map((v) => {
              const IconComp = v.icon
              const isSpecial = v.id === "other"
              return (
                <div
                  key={v.id}
                  className={`group relative bg-white rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 overflow-hidden ${
                    isSpecial
                      ? "border border-emerald-200/90 hover:border-emerald-500 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10"
                      : "border border-slate-200/90 hover:border-[#E31E24] shadow-xs hover:shadow-xl hover:shadow-red-500/8"
                  }`}
                >
                  {/* Glowing Top Accent Line on Hover */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
                      isSpecial
                        ? "bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                        : "bg-gradient-to-r from-transparent via-[#E31E24] to-transparent"
                    }`}
                  />

                  <div>
                    {/* Top Row: Icon + Badge + Number */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isSpecial
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-[#25D366] group-hover:text-white group-hover:border-[#25D366] group-hover:shadow-md group-hover:shadow-emerald-500/25"
                            : "bg-slate-50 text-slate-800 border border-slate-200/80 group-hover:bg-[#E31E24] group-hover:text-white group-hover:border-[#E31E24] group-hover:shadow-md group-hover:shadow-red-500/25"
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border transition-colors ${
                            isSpecial
                              ? "bg-emerald-50/70 border-emerald-100 text-emerald-700 group-hover:bg-emerald-100"
                              : "bg-slate-50 border-slate-100 text-slate-500 group-hover:border-red-100 group-hover:bg-red-50 group-hover:text-[#E31E24]"
                          }`}
                        >
                          {v.badge}
                        </span>
                        <span
                          className={`font-black text-sm select-none transition-colors ${
                            isSpecial
                              ? "text-slate-300 group-hover:text-emerald-300"
                              : "text-slate-300 group-hover:text-red-300"
                          }`}
                        >
                          {v.num}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className={`text-base sm:text-lg font-black text-slate-900 transition-colors mb-2 leading-snug ${
                        isSpecial ? "group-hover:text-emerald-700" : "group-hover:text-[#E31E24]"
                      }`}
                    >
                      {v.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed mb-5">
                      {v.desc}
                    </p>
                  </div>

                  {/* Bottom Action Link */}
                  {v.isExternal ? (
                    <a
                      href={v.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black transition-colors ${
                        isSpecial
                          ? "text-slate-800 group-hover:text-emerald-600"
                          : "text-slate-900 group-hover:text-[#E31E24]"
                      }`}
                    >
                      <span className="truncate">{v.linkText}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-1 transition-transform" />
                    </a>
                  ) : (
                    <Link
                      href={v.href}
                      className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-slate-900 group-hover:text-[#E31E24] transition-colors"
                    >
                      <span className="truncate">{v.linkText}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: RED NOTIFICATION BAR
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#E31E24] text-white py-5 sm:py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1 text-white">
                Check Kanpur Pickup Availability
              </h3>
              <p className="text-xs sm:text-sm text-red-100 font-normal">
                Average pickup scheduled within 24 hours
              </p>
            </div>

            <a
              href="https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20want%20to%20check%20Kanpur%20pickup%20availability."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black hover:bg-slate-900 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-md active:scale-95 transition-all shrink-0"
            >
              <span>Check on WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: 4-STEP SCRAPPING PROCESS (REDESIGNED & COMPACT)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white text-slate-900 border-b border-slate-100 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

          {/* Section Header */}
          <div className="text-left mb-8 sm:mb-10 max-w-4xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
              <span>PICKUP TO COD • 4 SIMPLE STEPS</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              How Vehicle Scrapping Works in Kanpur <br className="hidden sm:inline" />
              <span className="text-[#E31E24]">— From Your Doorstep to Your Certificate of Deposit</span>
            </h2>

            {/* Process Intro */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {isHindi ? (
                <>
                  हमारी कानपुर टीम मूल्यांकन और पिकअप से लेकर कागजी कार्रवाई और आपके जमा प्रमाणपत्र (COD) तक चार सरल चरणों में आपका मार्गदर्शन करती है। पूरी प्रक्रिया के लिए हमारी{" "}
                  <Link href="/hi/vehicle-scrapping-services" className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4">
                    वाहन स्क्रैपिंग गाइड
                  </Link>{" "}
                  देखें।
                </>
              ) : (
                <>
                  Our Kanpur team guides you through four simple steps, from valuation and pickup to paperwork and your Certificate of Deposit. See our{" "}
                  <Link href="/vehicle-scrapping-services" className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4">
                    vehicle scrapping guide
                  </Link>{" "}
                  for the full process.
                </>
              )}
            </p>
          </div>

          {/* 4 Compact Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-4.5">
            {processSteps.map((step, idx) => {
              const Icon = step.icon
              return (
                <div
                  key={idx}
                  className="group relative bg-white border border-slate-200/80 hover:border-[#E31E24] rounded-2xl p-4 sm:p-4.5 lg:p-5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:shadow-red-500/8 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
                >
                  {/* Glowing Top Accent Line on Hover */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E31E24] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    {/* Top Row: Red Number & Modern Icon */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl sm:text-2xl font-black text-[#E31E24] tracking-tight">
                        {step.num}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 flex items-center justify-center group-hover:bg-[#E31E24] group-hover:text-white group-hover:border-[#E31E24] group-hover:shadow-md group-hover:shadow-red-500/20 transition-all duration-300">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Step Stage Badge */}
                    <div className="inline-block px-2 py-0.5 rounded-md bg-red-50/80 border border-red-100 text-[#E31E24] text-[9.5px] font-black uppercase tracking-wider mb-2.5">
                      {step.badge}
                    </div>

                    {/* Card Title */}
                    <h3 className="text-sm sm:text-[15px] font-black text-slate-900 group-hover:text-[#E31E24] leading-snug mb-2 transition-colors">
                      {step.title}
                    </h3>

                    {/* Card Description */}
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">
                      {isHindi ? step.descHi : step.desc}
                    </p>
                  </div>

                  {/* Footer Row */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-[#E31E24] transition-colors">
                    <span>{step.footerStep}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E31E24] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: DOCUMENTS & RC CANCELLATION (REDESIGNED)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-slate-50/60 text-slate-900 border-b border-slate-100 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

          <div className="text-left mb-8 sm:mb-12 max-w-4xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
              <span>PAPERWORK & COMPLIANCE</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              Documents & RC Cancellation in Kanpur <br className="hidden sm:inline" />
              <span className="text-[#E31E24]">— What to Keep Ready for Scrapping</span>
            </h2>

            {/* Paperwork Intro */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {isHindi
                ? "प्रक्रिया को सुचारू रूप से आगे बढ़ाने में मदद के लिए कानपुर में अपने वाहन स्क्रैपिंग दस्तावेज तैयार रखें। हमारी टीम कानपुर में कागजी कार्रवाई और वाहन पंजीकरण रद्दीकरण में सहायता करती है।"
                : "Keep your vehicle scrapping documents in Kanpur ready to help the process move smoothly. Our team supports the paperwork and vehicle registration cancellation in Kanpur."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">

            {/* Left 3 Cards */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-4">

              {/* Card 1: Car or bike? */}
              <div className="group relative bg-white border border-slate-200/80 hover:border-[#E31E24] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-xl hover:shadow-red-500/8 transition-all duration-300 hover:-translate-y-1 flex items-start gap-4 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E31E24] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 group-hover:bg-[#E31E24] group-hover:text-white group-hover:border-[#E31E24] flex items-center justify-center shrink-0 transition-all duration-300">
                  <Car className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#E31E24] transition-colors mb-1.5">
                    Car or bike?
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                    {isHindi ? (
                      <>
                        कार या बाइक के लिए दस्तावेज़ मार्गदर्शन चाहिए? हमारे{" "}
                        <Link href="/hi/four-wheeler-scrapping-kanpur" className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4">
                          फोर-व्हीलर
                        </Link>{" "}
                        और{" "}
                        <Link href="/hi/two-wheeler-scrapping-kanpur" className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4">
                          टू-व्हीलर
                        </Link>{" "}
                        पेजों पर वाहन-विशिष्ट विवरण प्राप्त करें।
                      </>
                    ) : (
                      <>
                        Need document guidance for a car or bike? Find vehicle-specific details on our{" "}
                        <Link href="/four-wheeler-scrapping-kanpur" className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4">
                          four-wheeler
                        </Link>{" "}
                        and{" "}
                        <Link href="/two-wheeler-scrapping-kanpur" className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4">
                          two-wheeler
                        </Link>{" "}
                        pages.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Card 2: RC or insurance missing? */}
              <div className="group relative bg-white border border-slate-200/80 hover:border-[#E31E24] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-xl hover:shadow-red-500/8 transition-all duration-300 hover:-translate-y-1 flex items-start gap-4 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E31E24] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 group-hover:bg-[#E31E24] group-hover:text-white group-hover:border-[#E31E24] flex items-center justify-center shrink-0 transition-all duration-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#E31E24] transition-colors mb-1.5">
                    RC or insurance missing?
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                    {isHindi
                      ? "क्या आपकी आरसी या बीमा प्रति गायब है? अगले कदमों की जांच के लिए हमसे संपर्क करें। आपके वाहन के प्रकार और स्वामित्व की स्थिति के आधार पर अतिरिक्त दस्तावेजों की आवश्यकता हो सकती है, इसलिए कानपुर में वाहन स्क्रैपिंग आरसी आवश्यकताएं भिन्न हो सकती हैं।"
                      : "Missing your RC or insurance copy? Contact us to check the next steps. Additional documents may be needed depending on your vehicle type and ownership status, so vehicle scrapping RC in Kanpur requirements can vary."}
                  </p>
                </div>
              </div>

              {/* Card 3: Need the full checklist? */}
              <div className="group relative bg-white border border-slate-200/80 hover:border-[#E31E24] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-xl hover:shadow-red-500/8 transition-all duration-300 hover:-translate-y-1 flex items-start gap-4 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E31E24] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 group-hover:bg-[#E31E24] group-hover:text-white group-hover:border-[#E31E24] flex items-center justify-center shrink-0 transition-all duration-300">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#E31E24] transition-colors mb-1.5">
                    {isHindi ? "पूरी चेकलिस्ट चाहिए?" : "Need the full checklist?"}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                    {isHindi ? (
                      <>
                        आपको आवश्यक कागजी कार्रवाई के स्पष्ट विवरण के लिए{" "}
                        <Link
                          href="/hi/vehicle-scrapping-services"
                          className="text-[#E31E24] font-bold underline decoration-red-300 underline-offset-4 hover:text-red-700"
                        >
                          भारत में वाहन स्क्रैपिंग के लिए आवश्यक दस्तावेज
                        </Link>{" "}
                        के हमारे गाइड को देखें।
                      </>
                    ) : (
                      <>
                        Explore our guide to{" "}
                        <Link
                          href="/vehicle-scrapping-services"
                          className="text-[#E31E24] font-bold underline decoration-red-300 underline-offset-4 hover:text-red-700"
                        >
                          documents required for vehicle scrapping in India
                        </Link>{" "}
                        for a clear breakdown of the paperwork you may need.
                      </>
                    )}
                  </p>
                </div>
              </div>

            </div>

            {/* Right Card: Dark Checklist Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-950 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full">
                <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-[#E31E24] via-rose-500 to-[#E31E24]" />
                <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#E31E24] text-white text-[10px] font-black uppercase tracking-wider">
                      CHECKLIST
                    </span>
                    <span className="text-xs font-bold text-slate-400">RVSF Kanpur</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white mb-6 tracking-tight">
                    Basic documents to keep ready
                  </h3>

                  <ul className="space-y-3.5 mb-8 text-left">
                    {[
                      "Registration Certificate (RC)",
                      "ID proof of the registered owner",
                      "Insurance copy and PUC certificate, if available",
                      "Financier NOC, if the vehicle is hypothecated",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/40">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href="https://wa.me/919839447733?text=Hello%20ScrapCentre,%20please%20send%20me%20the%20vehicle%20scrapping%20documents%20checklist%20for%20Kanpur."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all w-full"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Get the Checklist on WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: WHAT DECIDES SCRAP VALUE IN KANPUR (FACTORS)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-white text-slate-900 border-b border-slate-100 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

          <div className="text-left mb-8 sm:mb-12 max-w-4xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
              <span>TRANSPARENT VALUATION</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              What Decides Your Vehicle Scrap Value in Kanpur? <br className="hidden sm:inline" />
              <span className="text-[#E31E24]">— Six Factors, Explained</span>
            </h2>

            {/* Scrap Value Intro */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {isHindi
                ? "प्रत्येक वाहन का स्क्रैप मूल्य अलग होता है। कानपुर में हमारा वाहन स्क्रैपिंग मूल्यांकन आपके उद्धरण का अनुमान लगाने के लिए छह प्रमुख कारकों पर विचार करता है। आपका वाहन कितने का हो सकता है, यह समझने के लिए कानपुर में मुफ्त वाहन मूल्यांकन प्राप्त करें।"
                : "Every vehicle has a different scrap value. Our vehicle scrapping valuation in Kanpur considers six key factors to estimate your quote. Get a free vehicle valuation in Kanpur to understand what your vehicle may be worth."}
            </p>
          </div>

          {/* Responsive Valuation Factors Table */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-700 font-black text-[10px] sm:text-xs uppercase tracking-wider">
                    <th className="py-3 px-3 sm:py-4 sm:px-6 w-[28%] sm:w-[25%]">
                      {isHindi ? "कारक" : "FACTOR"}
                    </th>
                    <th className="py-3 px-2.5 sm:py-4 sm:px-6 w-[34%] sm:w-[35%]">
                      {isHindi ? "हम क्या जांचते हैं" : "WHAT WE CHECK"}
                    </th>
                    <th className="py-3 px-2.5 sm:py-4 sm:px-6 w-[38%] sm:w-[40%]">
                      {isHindi ? "यह आपके कोट को कैसे प्रभावित करता है" : "HOW IT AFFECTS YOUR QUOTE"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {valueFactors.map((row, idx) => {
                    const Icon = row.icon
                    return (
                      <tr key={idx} className="hover:bg-red-50/30 transition-colors group">
                        <td className="py-3 px-3 sm:py-4 sm:px-6 font-bold text-slate-900 align-top sm:align-middle">
                          <div className="flex items-center gap-0 sm:gap-3">
                            <div className="hidden sm:flex w-8 h-8 rounded-lg bg-red-50 text-[#E31E24] group-hover:bg-[#E31E24] group-hover:text-white transition-colors items-center justify-center shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight sm:leading-normal">
                              {isHindi ? row.factorHi : row.factor}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2.5 sm:py-4 sm:px-6 text-slate-600 text-[11px] sm:text-[13px] leading-snug sm:leading-relaxed align-top sm:align-middle">
                          {isHindi ? row.whatWeCheckHi : row.whatWeCheck}
                        </td>
                        <td className="py-3 px-2.5 sm:py-4 sm:px-6 text-slate-600 text-[11px] sm:text-[13px] leading-snug sm:leading-relaxed font-medium align-top sm:align-middle">
                          {isHindi ? row.howItAffectsHi : row.howItAffects}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-xs text-left">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Note: Scrapping benefits and incentives are subject to prevailing RVSF policies and vehicle category.</span>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8: VEHICLE SCRAPPING ACROSS KANPUR LOCALITIES
      ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-slate-50/60 text-slate-900 border-b border-slate-100 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Left Localities */}
            <div className="lg:col-span-7 space-y-5 text-left">
              {/* Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
                <span>WHERE WE OPERATE • KANPUR HUBS</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25]">
                Vehicle Scrapping Across Kanpur <br className="hidden sm:inline" />
                <span className="text-[#E31E24]">— Panki, Kalpi Road, Jajmau, Kakadeo & More</span>
              </h2>

              {/* Service Areas Intro */}
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {isHindi ? (
                  <>
                    हम कानपुर भर में वाहन पिकअप की पेशकश करते हैं, जिसमें पनकी और जाजमऊ के साथ-साथ अन्य नजदीकी इलाके शामिल हैं। यदि आपका क्षेत्र नीचे सूचीबद्ध नहीं है, तो अपने स्थान के लिए पिकअप उपलब्धता की जांच करने के लिए हमें{" "}
                    <a
                      href="https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20want%20to%20check%20vehicle%20pickup%20availability%20in%20my%20area%20in%20Kanpur."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E31E24] hover:underline font-bold"
                    >
                      व्हाट्सएप
                    </a>{" "}
                    पर संदेश भेजें।
                  </>
                ) : (
                  <>
                    We offer vehicle pickup across Kanpur, including Panki and Jajmau, along with other nearby localities. If your area isn’t listed below, message us on{" "}
                    <a
                      href="https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20want%20to%20check%20vehicle%20pickup%20availability%20in%20my%20area%20in%20Kanpur."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E31E24] hover:underline font-bold"
                    >
                      WhatsApp
                    </a>{" "}
                    to check pickup availability for your location.
                  </>
                )}
              </p>

              <div>
                <div className="text-slate-500 text-[11px] font-black uppercase tracking-wider flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#E31E24]"></span>
                  <span>12 ACTIVE KANPUR PICKUP ZONES</span>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {kanpurAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-slate-200/90 hover:border-[#E31E24] hover:text-[#E31E24] text-slate-800 text-xs font-bold px-3.5 py-1.5 rounded-full inline-flex items-center gap-2 shadow-xs transition-all cursor-default"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E31E24]/60"></span>
                      <span>{area}</span>
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-slate-500 text-xs pt-1">
                Outside Kanpur? See all service areas on our{" "}
                <Link
                  href="/vehicle-scrapping-services"
                  className="text-[#E31E24] font-bold underline decoration-red-300 underline-offset-4 hover:text-red-700"
                >
                  vehicle scrapping services
                </Link>{" "}
                page.
              </p>
            </div>

            {/* Right Facility Card: Visit us in Kanpur */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-7 text-left relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-slate-300">
                <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-[#E31E24] via-rose-500 to-[#E31E24]" />

                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-base sm:text-lg font-black text-slate-900">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E31E24] flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>Visit us in Kanpur</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    Open Mon - Sat
                  </span>
                </div>

                <div className="divide-y divide-slate-100 space-y-3.5">
                  <div className="pt-2">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      FACILITY ADDRESS
                    </div>
                    <div className="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug">
                      26-A & B, Block-E, Panki, Kalpi Road, Kanpur, Uttar Pradesh 208020
                    </div>
                  </div>

                  <div className="pt-3.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      DIRECT CALL / WHATSAPP
                    </div>
                    <a
                      href="tel:+919839447733"
                      className="text-xs sm:text-sm font-black text-slate-900 hover:text-[#E31E24] transition-colors block"
                    >
                      +91-9839447733
                    </a>
                  </div>

                  <div className="pt-3.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      OFFICIAL EMAIL
                    </div>
                    <a
                      href="mailto:contact@scrapcentre.com"
                      className="text-xs sm:text-[13px] font-bold text-slate-800 hover:text-[#E31E24] transition-colors block"
                    >
                      contact@scrapcentre.com
                    </a>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 9: KANPUR VEHICLE SCRAPPING FAQs (REDESIGNED)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-white text-slate-900 border-b border-slate-100 relative overflow-hidden">
        {/* Soft Ambient Light Effects */}
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-red-50/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-50 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">

          <div className="text-left mb-8 sm:mb-12 max-w-4xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              Kanpur Vehicle Scrapping <br className="hidden sm:inline" />
              <span className="text-[#E31E24]">— Questions Owners Ask</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {isHindi
                ? "त्वरित, स्थानीय उत्तर। भारत में स्क्रैपिंग नियमों के सामान्य प्रश्नों के लिए मुख्य अक्सर पूछे जाने वाले प्रश्न देखें।"
                : "Quick, local answers. For general questions about scrapping rules in India, see the main FAQ."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left FAQs Accordion (Single-Open by Default) */}
            <div className="lg:col-span-8 space-y-3">
              {faqItems.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl transition-all duration-300 relative overflow-hidden bg-white ${
                      isOpen
                        ? "border border-[#E31E24] shadow-lg shadow-red-500/8 ring-1 ring-[#E31E24]/20"
                        : "border border-slate-200/80 shadow-xs hover:border-[#E31E24]/50 hover:shadow-md"
                    }`}
                  >
                    {/* Glowing Top Line Accent for Open FAQ */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E31E24] to-transparent transition-opacity duration-300 ${
                        isOpen ? "opacity-100" : "opacity-0"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 text-left cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3 sm:gap-3.5">
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black shrink-0 transition-all duration-300 ${
                            isOpen
                              ? "bg-[#E31E24] text-white shadow-md shadow-red-500/30 scale-105"
                              : "bg-red-50 text-[#E31E24] group-hover:bg-[#E31E24] group-hover:text-white"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span
                          className={`text-sm sm:text-[15px] font-bold leading-snug transition-colors duration-200 ${
                            isOpen ? "text-[#E31E24] font-black" : "text-slate-900 group-hover:text-[#E31E24]"
                          }`}
                        >
                          {isHindi ? faq.qHi : faq.q}
                        </span>
                      </div>

                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isOpen
                            ? "bg-red-50 text-[#E31E24] rotate-180"
                            : "bg-slate-100 text-slate-500 group-hover:bg-red-50 group-hover:text-[#E31E24]"
                        }`}
                      >
                        <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
                            <div className="pt-3.5 border-t border-slate-100 text-slate-600 text-xs sm:text-sm leading-relaxed text-left pl-0 sm:pl-11 font-normal">
                              {faq.ansRender ? faq.ansRender(isHindi) : (isHindi ? faq.aHi : faq.a)}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            {/* Right Help Card: Still Have Questions? */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
                <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-[#E31E24] via-rose-500 to-[#E31E24]" />
                <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

                {/* Support Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold mb-5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Live Kanpur Support</span>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#E31E24] flex items-center justify-center mx-auto mb-4 shadow-xs">
                  <Headphones className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-1.5">
                  Still Have Questions?
                </h3>

                <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed mb-6">
                  Our Kanpur team is happy to help. Call or WhatsApp us anytime for instant guidance.
                </p>

                <div className="space-y-2.5">
                  <a
                    href="tel:+919839447733"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#E31E24] hover:bg-[#c9181e] text-white text-xs sm:text-sm font-bold py-3.5 px-4 rounded-xl shadow-md shadow-red-500/20 active:scale-95 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call +91-9839447733</span>
                  </a>

                  <a
                    href="https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20have%20a%20question%20about%20vehicle%20scrapping%20in%20Kanpur."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-bold py-3.5 px-4 rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Us</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 10: BOTTOM RED CTA BANNER
      ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white text-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="bg-[#E31E24] text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

              {/* Left Details */}
              <div className="lg:col-span-7 space-y-4 text-left">
                {/* Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  <span>✦ FAST & FREE VALUATION</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  Book Your Kanpur Vehicle <br className="hidden sm:block" />
                  Pickup with ScrapCentre
                </h2>

                {/* Final CTA Supporting Text */}
                <div className="space-y-1 text-white/90 text-sm sm:text-base leading-relaxed max-w-xl">
                  <p className="font-bold text-white">
                    {isHindi ? "अपने पुराने वाहन को स्क्रैप करने के लिए तैयार हैं?" : "Ready to scrap your old vehicle?"}
                  </p>
                  <p>
                    {isHindi
                      ? "कानपुर में हमारे अधिकृत RVSF के माध्यम से मुफ्त वाहन मूल्यांकन, मुफ्त डोरस्टेप पिकअप और जमा प्रमाणपत्र (COD) प्राप्त करें।"
                      : "Get a free vehicle valuation, free doorstep pickup and a Certificate of Deposit (COD) through our authorised RVSF in Kanpur."}
                  </p>
                </div>

                {/* 3 Badges */}
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <div className="bg-black/25 border border-white/10 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 text-white">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    <span>Authorised RVSF process</span>
                  </div>
                  <div className="bg-black/25 border border-white/10 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 text-white">
                    <Truck className="w-3.5 h-3.5 text-white" />
                    <span>Free doorstep pickup</span>
                  </div>
                  <div className="bg-black/25 border border-white/10 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 text-white">
                    <IndianRupee className="w-3.5 h-3.5 text-white" />
                    <span>Instant payment</span>
                  </div>
                </div>
              </div>

              {/* Right Quick Valuation Box */}
              <div className="lg:col-span-5">
                <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-[10px] font-black uppercase tracking-wider mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E31E24] animate-pulse" />
                    <span>INSTANT CALCULATION</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 tracking-tight">
                    Get Your Free Vehicle Valuation
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
                    Calculate your vehicle scrap value in just 60 seconds with our official Kanpur valuation tool.
                  </p>

                  <div className="space-y-3">
                    <Link
                      href="/know-your-valuation"
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-[#E31E24] hover:bg-[#C5161C] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-500/25 transition-all active:scale-95 text-center"
                    >
                      <span>Get Free Valuation</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <a
                      href="https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20want%20to%20get%20a%20free%20vehicle%20valuation%20in%20Kanpur."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-95 text-center"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      <span>Inquire on WhatsApp</span>
                    </a>
                  </div>

                  <p className="text-center text-[11px] text-slate-400 font-medium mt-4">
                    ✓ 100% Free · No obligation · Pickup confirmed on WhatsApp
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
