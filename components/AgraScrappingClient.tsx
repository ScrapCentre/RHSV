"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Caveat } from "next/font/google"
import { useParams } from "next/navigation"
import Link from "next/link"
import LoadingScreen from "@/components/LoadingScreen"
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
  IndianRupee,
} from "lucide-react"

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
})

export default function AgraScrappingClient() {
  const params = useParams()
  const isHindi = params?.locale === "hi"
  const [loading, setLoading] = useState(true)

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

  // City Hero Config for Agra
  const cityHeroConfig = {
    titleEn: "Vehicle Scrapping Services in Agra",
    titleSubEn: "— Authorised RVSF, Free Doorstep Pickup",
    titleHi: "आगरा में वाहन स्क्रैपिंग सेवाएं",
    titleSubHi: "— अधिकृत RVSF, मुफ्त डोरस्टेप पिकअप",
    descriptionEn:
      "An unused vehicle taking up space? Choose vehicle scrapping in Agra with ScrapCentre for free valuation, doorstep pickup, and authorised processing, plus a Certificate of Deposit and support with RC cancellation and paperwork.",
    descriptionHi:
      "क्या कोई अप्रयुक्त वाहन जगह घेर रहा है? मुफ्त मूल्यांकन, डोरस्टेप पिकअप, और अधिकृत प्रसंस्करण के लिए स्क्रैपसेंटर के साथ आगरा में वाहन स्क्रैपिंग चुनें, साथ ही जमा प्रमाणपत्र (CoD) और आरसी रद्दीकरण व कागजी कार्रवाई में सहायता प्राप्त करें।",
    trustBadges: [
      { en: "RTO Authorised RVSF", hi: "RTO अधिकृत RVSF" },
      { en: "Instant COD Issued", hi: "तुरंत COD जारी" },
      { en: "Free Doorstep Pickup", hi: "मुफ्त डोरस्टेप पिकअप" },
      { en: "RC Cancellation Support", hi: "RC रद्दीकरण सहायता" },
    ],
    phoneTel: "+919839447733",
    phoneDisplay: "+91-9839447733",
    whatsappUrl:
      "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20have%20a%20vehicle%20to%20scrap%20in%20Agra.",
    facilityLocation: "26-A & B, Block-E, Panki, Kalpi Road, Kanpur - 208020 (Serving Agra)",
  }

  // 1. Vehicle Categories (Exact types from prompt)
  const vehicleCategories = [
    {
      id: "cars",
      num: "01",
      icon: Car,
      title: isHindi ? "कारें (Cars)" : "Cars",
      badge: isHindi ? "लोकप्रिय" : "Popular",
      desc: isHindi
        ? "क्या आपके पास कार, हैचबैक, सेडान या एसयूवी है? सुरक्षित डी-पॉल्यूशन, सटीक धातु वजन और सरकारी जमा प्रमाणपत्र (CoD) के साथ अधिकृत कार स्क्रैपिंग।"
        : "Hatchbacks, sedans, SUVs, and luxury vehicles. We offer maximum scrap metal value based on kerb weight and salvageable parts, with authorized de-pollution and CoD.",
      linkText: isHindi ? "मेरी कार स्क्रैप करें" : "Scrap My Car",
      href: "/know-your-valuation",
      isExternal: false,
    },
    {
      id: "bikes",
      num: "02",
      icon: Bike,
      title: isHindi ? "बाइक और स्कूटर" : "Bikes & Scooters",
      badge: isHindi ? "2-व्हीलर" : "2-Wheeler",
      desc: isHindi
        ? "मोटरसाइकिल, स्कूटर और मोपेड। समाप्त आरसी, गैर-चालू या दुर्घटनाग्रस्त बाइक को उचित चेसिस कटिंग और यूपी-80 आरसी रद्दीकरण सहायता के साथ स्क्रैप किया जाता है।"
        : "Motorcycles, scooters, and mopeds. Expired RC, non-running, or accidental bikes scrapped with proper chassis cutting and UP-80 RC cancellation support.",
      linkText: isHindi ? "मेरी बाइक स्क्रैप करें" : "Scrap My Bike",
      href: "/know-your-valuation",
      isExternal: false,
    },
    {
      id: "trucks",
      num: "03",
      icon: Truck,
      title: isHindi ? "ट्रक और मिनी ट्रक" : "Truck & Mini Truck",
      badge: isHindi ? "हैवी ड्यूटी" : "Heavy Duty",
      desc: isHindi
        ? "चाहे कोई मालवाहक वाहन चलना बंद हो गया हो या अपने उपयोगी जीवन के अंत तक पहुँच गया हो, आगरा में हमारी ट्रक स्क्रैपिंग सेवा में गैर-चालू ट्रकों और मिनी ट्रकों के लिए पिकअप व्यवस्था और टोइंग सहायता शामिल है।"
        : "Whether a goods vehicle has stopped running or reached the end of its useful life, our truck scrapping in Agra service includes pickup arrangements and towing support for non-running trucks and mini-trucks.",
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
        ? "स्कूल बसों सहित पुरानी बसों को उपयोग के लिए उपयुक्त न रहने पर स्क्रैप करने की आवश्यकता हो सकती है। हम आगरा में बस स्क्रैपिंग, वाहन संग्रह और आवश्यक औपचारिकताओं की व्यवस्था करने में मालिकों की मदद करते हैं।"
        : "Old buses, including school buses, may need scrapping when they are no longer fit for use. We help owners arrange bus scrapping in Agra, vehicle collection and the required formalities.",
      linkText: isHindi ? "मेरी बस स्क्रैप करें" : "Scrap My Bus",
      href: "/know-your-valuation",
      isExternal: false,
    },
    {
      id: "auto",
      num: "05",
      icon: Zap,
      title: isHindi ? "ऑटो और ई-रिक्शा" : "Auto & E-Rickshaw",
      badge: isHindi ? "3-व्हीलर" : "3-Wheeler",
      desc: isHindi
        ? "टेम्पो, तिपहिया या ई-रिक्शा स्क्रैप करने की आवश्यकता है? आगरा में हमारी ऑटो रिक्शा स्क्रैपिंग सेवा में पिकअप व्यवस्था, दस्तावेज़ीकरण मार्गदर्शन और अधिकृत प्रक्रिया के माध्यम से डी-रजिस्ट्रेशन सहायता शामिल है।"
        : "Need to scrap a tempo, three-wheeler or e-rickshaw? Our auto rickshaw scrapping in Agra service includes pickup arrangements, documentation guidance and deregistration support through the authorised process.",
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
        ? "जब कोई ट्रैक्टर या कृषि वाहन क्षतिग्रस्त, अप्रयुक्त या काम के लिए उपयुक्त नहीं रह जाता है, तो हम आगरा में आवश्यक औपचारिकताओं सहित ट्रैक्टर स्क्रैपिंग में आपका मार्गदर्शन कर सकते हैं।"
        : "When a tractor or agricultural vehicle is damaged, unused or no longer suitable for work, we can guide you through the tractor scrapping in Agra, including the required formalities.",
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
        ? "जीवन-समाप्त वाहनों वाले व्यवसाय पात्र वाहनों और बेड़े के लिए आगरा में वाणिज्यिक वाहन स्क्रैपिंग के बारे में पूछताछ कर सकते हैं। सरकारी, पुलिस, रक्षा और एम्बुलेंस वाहन मालिकों को पात्रता जांचने के लिए हमसे संपर्क करना चाहिए।"
        : "Businesses with end-of-life vehicles can enquire about commercial vehicle scrapping in Agra for eligible vehicles and fleets. Government, police, defence and ambulance vehicle owners should contact us to check eligibility.",
      linkText: isHindi ? "कमर्शियल वाहन स्क्रैप करें" : "Scrap My Commercial Vehicle",
      href: "/know-your-valuation",
      isExternal: false,
    },
    {
      id: "ev",
      num: "08",
      icon: BatteryCharging,
      title: isHindi ? "इलेक्ट्रिक वाहन (EVs)" : "Electric Vehicles",
      badge: isHindi ? "ग्रीन स्क्रैप" : "Green Scrap",
      desc: isHindi
        ? "इलेक्ट्रिक वाहनों को भी अपने उपयोगी जीवन के अंत तक पहुँचने पर उचित अधिकृत स्क्रैपिंग मार्ग की आवश्यकता होती है। अपने वाहन की पात्रता की जांच करने के लिए आगरा में ईवी स्क्रैपिंग के बारे में हमसे संपर्क करें।"
        : "Electric vehicles also require the appropriate authorised scrapping route when they reach the end of their useful life. Contact us about EV scrapping in Agra to check eligibility for your vehicle.",
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
        ? "क्या आपके पास ऐसा वाहन है जो यहाँ सूचीबद्ध नहीं है? हमारे साथ इसके विवरण साझा करें, और हम जांच करेंगे कि क्या इसे अधिकृत स्क्रैपिंग के लिए स्वीकार किया जा सकता है।"
        : "Have a vehicle that isn't listed here? Share its details with our team, and we'll check whether it can be accepted for authorised scrapping.",
      linkText: isHindi ? "व्हाट्सएप पर पूछें" : "Ask on WhatsApp",
      href: "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20have%20a%20vehicle%20to%20scrap%20in%20Agra.",
      isExternal: true,
    },
  ]

  // 2. 4-Step Scrapping Process (Exact text from prompt)
  const processSteps = [
    {
      num: "01",
      icon: MapPin,
      badge: isHindi ? "आपके दरवाजे पर" : "AT YOUR DOORSTEP",
      title: isHindi ? "अपना नंबर और इलाका साझा करें" : "Share Your Number & Locality",
      desc: "Share your vehicle registration number and location in Agra through our website or WhatsApp. We will provide you an estimation for the valuations and confirm your pickup slot on WhatsApp.",
      descHi:
        "हमारी वेबसाइट या व्हाट्सएप के माध्यम से अपना वाहन पंजीकरण नंबर और आगरा में स्थान साझा करें। हम आपको मूल्यांकन का अनुमान प्रदान करेंगे और व्हाट्सएप पर आपके पिकअप स्लॉट की पुष्टि करेंगे।",
      footerStep: "STEP 01",
    },
    {
      num: "02",
      icon: Truck,
      badge: isHindi ? "मुफ्त पिकअप" : "FREE PICKUP",
      title: isHindi ? "मुफ्त डोरस्टेप पिकअप" : "Free Doorstep Pickup",
      desc: "Once scrapping is confirmed, we'll arrange free doorstep pickup from your location. If your vehicle isn't running, we'll discuss the towing support needed for collection.",
      descHi:
        "स्क्रैपिंग की पुष्टि होने के बाद, हम आपके स्थान से मुफ्त डोरस्टेप पिकअप की व्यवस्था करेंगे। यदि आपका वाहन चालू नहीं है, तो हम संग्रह के लिए आवश्यक टोइंग सहायता पर चर्चा करेंगे।",
      footerStep: "STEP 02",
    },
    {
      num: "03",
      icon: FileText,
      badge: isHindi ? "कागजी कार्रवाई" : "PAPERWORK",
      title: isHindi ? "दस्तावेज और आरसी रद्दीकरण" : "Documents & RC Cancellation",
      desc: "Keep the required documents ready for the next step. Our team will guide you through the vehicle scrapping paperwork in Agra and provide support with RC cancellation.",
      descHi:
        "अगले चरण के लिए आवश्यक दस्तावेज तैयार रखें। हमारी टीम आगरा में वाहन स्क्रैपिंग कागजी कार्रवाई में आपका मार्गदर्शन करेगी और आरसी रद्दीकरण में सहायता प्रदान करेगी।",
      footerStep: "STEP 03",
    },
    {
      num: "04",
      icon: ShieldCheck,
      badge: isHindi ? "अधिकृत RVSF" : "AUTHORISED RVSF",
      title: isHindi ? "भुगतान और जमा प्रमाणपत्र" : "Payment & Certificate of Deposit",
      desc: "After your vehicle is processed at our authorised RVSF, you'll receive the applicable payment and a Certificate of Deposit (CoD) as proof of scrapping.",
      descHi:
        "हमारे अधिकृत RVSF में आपके वाहन का प्रसंस्करण होने के बाद, आपको लागू भुगतान और स्क्रैपिंग के प्रमाण के रूप में जमा प्रमाणपत्र (CoD) प्राप्त होगा।",
      footerStep: "STEP 04",
    },
  ]

  // 3. Document Checklist
  const docList = [
    {
      num: "1",
      title: isHindi ? "पंजीकरण प्रमाण पत्र (मूल आरसी)" : "Registration Certificate (Original RC)",
      tagText: isHindi
        ? "मूल आरसी (स्मार्ट कार्ड या पेपर आरसी)। यदि खो गई है, तो पुलिस शिकायत (NCR) की प्रति मान्य है।"
        : "Original RC (smart card or paper RC). If lost, copy of police complaint (NCR) is accepted.",
    },
    {
      num: "2",
      title: isHindi ? "पंजीकृत मालिक का पहचान और पता प्रमाण" : "Registered Owner ID & Address Proof",
      tagText: isHindi
        ? "आरसी मालिक के नाम से मेल खाने वाला आधार कार्ड, पैन कार्ड या पासपोर्ट की स्व-सत्यापित प्रति।"
        : "Self-attested copy of Aadhaar Card, PAN Card, or Passport matching the RC owner's name.",
    },
    {
      num: "3",
      title: isHindi ? "रद्द चेक / बैंक विवरण" : "Cancelled Cheque / Bank Details",
      tagText: isHindi
        ? "मालिक के नाम पर सीधे ऑनलाइन बैंक हस्तांतरण के लिए बैंक खाता विवरण या रद्द चेक।"
        : "Bank account details or cancelled cheque in owner's name for direct online bank transfer.",
    },
    {
      num: "4",
      title: isHindi ? "फाइनेंसर एनओसी (यदि सक्रिय ऋण है)" : "Financier NOC (if vehicle has active loan)",
      tagText: isHindi
        ? "यदि वाहन पर दृष्टिबंधक या सक्रिय ऋण था, तो बैंक क्लीयरेंस प्रमाणपत्र / फॉर्म 35।"
        : "Bank clearance certificate / Form 35 if the vehicle had a hypothecation or active loan.",
    },
  ]

  // 4. Value Factors Table (Exact from prompt)
  const valueFactors = [
    {
      factor: "Vehicle category and weight",
      factorHi: "वाहन श्रेणी और वजन",
      icon: Car,
      whatWeCheck: "The type of vehicle and its overall weight",
      whatWeCheckHi: "वाहन का प्रकार और उसका कुल वजन",
      howItAffects: "Heavier vehicles may contain more recoverable material.",
      howItAffectsHi: "भारी वाहनों में अधिक पुनर्प्राप्ति योग्य सामग्री हो सकती है।",
    },
    {
      factor: "Make, model and manufacturing year",
      factorHi: "मेक, मॉडल और निर्माण वर्ष",
      icon: Calendar,
      whatWeCheck: "The vehicle's make, model and year of manufacture",
      whatWeCheckHi: "वाहन का मेक, मॉडल और निर्माण का वर्ष",
      howItAffects: "These details help us gauge the vehicle for valuation.",
      howItAffectsHi: "ये विवरण हमें मूल्यांकन के लिए वाहन का सटीक आकलन करने में मदद करते हैं।",
    },
    {
      factor: "Current condition",
      factorHi: "वर्तमान स्थिति",
      icon: Key,
      whatWeCheck: "Whether the vehicle is operational, damaged or accident-affected",
      whatWeCheckHi: "क्या वाहन चालू स्थिति में है, क्षतिग्रस्त है या दुर्घटनाग्रस्त है",
      howItAffects: "Its condition can influence the estimated scrap value.",
      howItAffectsHi: "इसकी स्थिति अनुमानित स्क्रैप मूल्य को प्रभावित कर सकती है।",
    },
    {
      factor: "Parts and completeness",
      factorHi: "पुर्जे और पूर्णता",
      icon: Link2,
      whatWeCheck: "Whether major components, including the engine, battery, tyres and body panels, are present",
      whatWeCheckHi: "क्या प्रमुख घटक, जैसे इंजन, बैटरी, टायर और बॉडी पैनल मौजूद हैं",
      howItAffects: "Missing components may affect the final quote.",
      howItAffectsHi: "गायब घटकों से अंतिम कोट प्रभावित हो सकता है।",
    },
    {
      factor: "Prevailing scrap metal rates",
      factorHi: "प्रचलित स्क्रैप धातु दरें",
      icon: IndianRupee,
      whatWeCheck: "Current rates for the relevant scrap materials",
      whatWeCheckHi: "प्रासंगिक स्क्रैप सामग्रियों की वर्तमान दरें",
      howItAffects: "Market rate changes can influence the vehicle's scrap value.",
      howItAffectsHi: "बाजार दर में बदलाव वाहन के स्क्रैप मूल्य को प्रभावित कर सकता है।",
    },
    {
      factor: "Documents and ownership details",
      factorHi: "दस्तावेज और स्वामित्व विवरण",
      icon: FileText,
      whatWeCheck: "Available vehicle documents and ownership status",
      whatWeCheckHi: "उपलब्ध वाहन दस्तावेज और स्वामित्व की स्थिति",
      howItAffects: "These details help us understand the vehicle's status and the paperwork required.",
      howItAffectsHi: "ये विवरण हमें वाहन की स्थिति और आवश्यक कागजी कार्रवाई को समझने में मदद करते हैं।",
    },
  ]

  // 5. Agra Localities (Exact from prompt)
  const agraAreas = [
    "Sikandra",
    "Kamla Nagar",
    "Sanjay Place",
    "Tajganj",
    "Dayalbagh",
    "Khandari",
    "Hari Parvat",
    "Fatehabad Road",
    "Sadar Bazaar",
    "Raja Ki Mandi",
    "Loha Mandi",
    "Jeoni Mandi",
  ]

  // 6. FAQs (Exact 8 from prompt)
  const faqItems = [
    {
      q: "Where can I scrap my vehicle in Agra?",
      qHi: "मैं आगरा में अपना वाहन कहाँ स्क्रैप कर सकता हूँ?",
      a: "ScrapCentre serves Agra vehicle owners with free doorstep pickup. Vehicles are processed at our authorised RVSF at 26-A & B, Block-E, Panki, Kalpi Road, Kanpur. To get started with a vehicle scrapping center in Agra, share your vehicle number through our website or WhatsApp.",
      aHi: "स्क्रैपसेंटर आगरा के वाहन मालिकों को मुफ्त डोरस्टेप पिकअप के साथ सेवा प्रदान करता है। वाहनों का प्रसंस्करण 26-A & B, ब्लॉक-E, पनकी, कालपी रोड, कानपुर स्थित हमारे अधिकृत RVSF में किया जाता है। आगरा में वाहन स्क्रैपिंग केंद्र के साथ शुरुआत करने के लिए, हमारी वेबसाइट या व्हाट्सएप के माध्यम से अपना वाहन नंबर साझा करें।",
    },
    {
      q: "Is ScrapCentre an authorised vehicle scrapping facility in Agra?",
      qHi: "क्या स्क्रैपसेंटर आगरा में अधिकृत वाहन स्क्रैपिंग सुविधा है?",
      a: "Yes, ScrapCentre operates an RTO-authorised Registered Vehicle Scrapping Facility (RVSF) that issues a Certificate of Deposit (CoD). For government-authorised RVSF services in Agra, vehicles collected from the city are processed at our authorised facility in Kanpur.",
      aHi: "हाँ, स्क्रैपसेंटर एक RTO-अधिकृत पंजीकृत वाहन स्क्रैपिंग सुविधा (RVSF) संचालित करता है जो जमा प्रमाणपत्र (CoD) जारी करता है। आगरा में सरकार द्वारा अधिकृत RVSF सेवाओं के लिए, शहर से एकत्र किए गए वाहनों को कानपुर में हमारी अधिकृत सुविधा में प्रोसेस किया जाता है।",
    },
    {
      q: "Which areas of Agra do you cover for pickup?",
      qHi: "पिकअप के लिए आप आगरा के कौन से क्षेत्रों को कवर करते हैं?",
      a: "We arrange pickup across Agra, including Sikandra, Kamla Nagar, Sanjay Place, Tajganj, Dayalbagh, Khandari, Hari Parvat, Fatehabad Road, Sadar Bazaar, Raja Ki Mandi, Loha Mandi and Jeoni Mandi. For vehicle scrapping services in Sikandra, Agra, or an unlisted locality, message us on WhatsApp to check availability.",
      aHi: "हम सिकंदरा, कमला नगर, संजय प्लेस, ताजगंज, दयालबाग, खंदारी, हरी पर्वत, फतेहाबाद रोड, सदर बाजार, राजा की मंडी, लोहा मंडी और जीवनी मंडी सहित पूरे आगरा में पिकअप की व्यवस्था करते हैं। सिकंदरा, आगरा में वाहन स्क्रैपिंग सेवाओं या किसी गैर-सूचीबद्ध इलाके के लिए, उपलब्धता जांचने के लिए हमें व्हाट्सएप पर संदेश भेजें।",
    },
    {
      q: "Do you scrap trucks, buses and other commercial vehicles in Agra?",
      qHi: "क्या आप आगरा में ट्रकों, बसों और अन्य वाणिज्यिक वाहनों को स्क्रैप करते हैं?",
      a: "Yes, we accept enquiries for old, damaged and end-of-life trucks, buses and eligible commercial vehicles. Truck scrapping and bus scrapping in Agra may include towing support for vehicles that cannot run. Share your vehicle details so we can check eligibility.",
      aHi: "हाँ, हम पुराने, क्षतिग्रस्त और जीवन समाप्त हो चुके ट्रकों, बसों और पात्र वाणिज्यिक वाहनों के लिए पूछताछ स्वीकार करते हैं। आगरा में ट्रक स्क्रैपिंग और बस स्क्रैपिंग में उन वाहनों के लिए टोइंग सहायता शामिल हो सकती है जो चलने में असमर्थ हैं। पात्रता जांचने के लिए अपने वाहन विवरण साझा करें।",
    },
    {
      q: "Can I scrap an auto-rickshaw or e-rickshaw in Agra?",
      qHi: "क्या मैं आगरा में ऑटो-रिक्शा या ई-रिक्शा स्क्रैप कर सकता हूँ?",
      a: "Yes, old or unfit auto-rickshaws and e-rickshaws may qualify for authorised scrapping. For auto rickshaw scrapping in Agra or e-rickshaw scrapping in Agra, contact us with the vehicle details so our team can check eligibility and explain the next steps.",
      aHi: "हाँ, पुराने या अनफिट ऑटो-रिक्शा और ई-रिक्शा अधिकृत स्क्रैपिंग के लिए पात्र हो सकते हैं। आगरा में ऑटो रिक्शा स्क्रैपिंग या ई-रिक्शा स्क्रैपिंग के लिए, वाहन के विवरण के साथ हमसे संपर्क करें ताकि हमारी टीम पात्रता की जांच कर सके और अगले कदमों की व्याख्या कर सके।",
    },
    {
      q: "How much will I get for scrapping my vehicle in Agra?",
      qHi: "आगरा में अपने वाहन को स्क्रैप करने पर मुझे कितना मिलेगा?",
      a: "Your vehicle scrap price in Agra depends on its type, weight, age, condition, completeness and current scrap metal rates. ScrapCentre offers a free, no-obligation vehicle valuation, so you can understand the estimated value before deciding whether to proceed.",
      aHi: "आगरा में आपके वाहन का स्क्रैप मूल्य उसके प्रकार, वजन, आयु, स्थिति, पूर्णता और वर्तमान स्क्रैप धातु दरों पर निर्भर करता है। स्क्रैपसेंटर एक मुफ्त, बिना किसी दायित्व के वाहन मूल्यांकन प्रदान करता है, ताकि आप आगे बढ़ने का निर्णय लेने से पहले अनुमानित मूल्य को समझ सकें।",
    },
    {
      q: "Who handles RC cancellation for my vehicle in Agra?",
      qHi: "आगरा में मेरे वाहन के लिए आरसी रद्दीकरण कौन संभालता है?",
      a: "ScrapCentre guides you through the paperwork and vehicle registration cancellation in Agra as part of the scrapping process. Our team will explain which documents you need to provide and help you understand the steps required for RC cancellation.",
      aHi: "स्क्रैपसेंटर स्क्रैपिंग प्रक्रिया के हिस्से के रूप में आगरा में कागजी कार्रवाई और वाहन पंजीकरण रद्दीकरण में आपका मार्गदर्शन करता है। हमारी टीम बताएगी कि आपको कौन से दस्तावेज प्रदान करने की आवश्यकता है और आरसी रद्दीकरण के लिए आवश्यक चरणों को समझने में आपकी सहायता करेगी।",
    },
    {
      q: "Is there separate information for car and bike owners?",
      qHi: "क्या कार और बाइक मालिकों के लिए अलग जानकारी उपलब्ध है?",
      a: "Yes. We have dedicated pages explaining the process for four-wheeler scrapping in Agra and two-wheeler scrapping in Agra. Both cover the authorised RVSF process, with information specific to each vehicle category.",
      aHi: "हाँ। हमारे पास आगरा में चार पहिया वाहन स्क्रैपिंग और दोपहिया वाहन स्क्रैपिंग की प्रक्रिया की व्याख्या करने वाले समर्पित पेज हैं। दोनों अधिकृत RVSF प्रक्रिया को कवर करते हैं, जिसमें प्रत्येक वाहन श्रेणी के लिए विशिष्ट जानकारी दी गई है।",
    },
  ]

  const sectionVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  }

  const cardFadeIn = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  }

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO SECTION (Matching Reference Design)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full pt-24 sm:pt-28 md:pt-28 lg:pt-16 pb-8 sm:pb-10 lg:pb-12 bg-white overflow-hidden border-b border-slate-100">
        {/* Agra Hero Background Image */}
        <div
          className="absolute inset-0 pointer-events-none bg-no-repeat bg-right-top bg-contain z-0 hidden sm:block"
          style={{ backgroundImage: "url('/Locationimg/agrabg.png')" }}
        />

        {/* Soft Ambient Light Effects */}
        <div className="absolute -left-24 top-8 w-96 h-96 bg-red-100/30 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute -right-24 top-16 w-96 h-96 bg-emerald-50/40 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute top-0 left-1/3 w-96 h-64 bg-red-50/20 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          {/* Top Half: Left-Aligned Content Area */}
          <div className="max-w-2xl sm:max-w-3xl lg:max-w-4xl text-left pt-4 sm:pt-5 lg:pt-6">
            {/* Top Tagline Pill */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-[#FFF0F0] border border-[#FFD6D6] text-[#E31E24] text-xs font-bold px-4 py-1.5 rounded-full shadow-xs mb-3.5 sm:mb-4"
            >
              <Leaf className="w-3.5 h-3.5 text-[#E31E24] fill-[#E31E24]" />
              <span>{isHindi ? "वाहन स्क्रैपिंग सेवाएं आगरा" : "Vehicle Scrapping Services Agra"}</span>
            </motion.div>

            {/* 1. Main Headline (H1) */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-2 sm:mt-0 text-2xl sm:text-3xl lg:text-[2.25rem] xl:text-[2.5rem] font-black text-slate-900 tracking-tight leading-[1.2] mb-3.5 sm:mb-4 text-left"
            >
              <span className="block">{isHindi ? cityHeroConfig.titleHi : cityHeroConfig.titleEn}</span>
              <span className="block text-[#E31E24] mt-2 sm:mt-2.5">
                {isHindi ? cityHeroConfig.titleSubHi : cityHeroConfig.titleSubEn}
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

            {/* 4. Dual Primary CTA Action Row */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 sm:gap-3.5 mb-6 sm:mb-7 lg:mb-8"
            >
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

          {/* Clean Horizontal Divider Line */}
          <div className="w-full border-t border-slate-100 mb-5 sm:mb-6 lg:mb-7" />

          {/* 5. Three Key Advantage Cards - Sequentially Auto-Highlighted */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
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
                  ? "कानपुर में MoRTH दिशानिर्देशों के तहत पंजीकृत अधिकृत सुविधा द्वारा प्रमाणित स्क्रैपिंग"
                  : "MoRTH registered authorised RVSF facility processing vehicles with certified scrapping",
              },
              {
                num: "02",
                icon: Truck,
                title: isHindi ? "मुफ्त डोरस्टेप पिकअप" : "Free Doorstep Pickup",
                desc: isHindi
                  ? "सिकंदरा और कमला नगर सहित पूरे आगरा में डोरस्टेप टोइंग और फ्लैटबेड कलेक्शन"
                  : "Doorstep towing and flatbed collection across all Agra localities including Sikandra",
              },
              {
                num: "03",
                icon: FileText,
                title: isHindi ? "तुरंत COD जारी" : "Instant COD Issued",
                desc: isHindi
                  ? "रोड टैक्स छूट और नए वाहन खरीद लाभ के लिए आधिकारिक जमा प्रमाणपत्र (CoD)"
                  : "Official Certificate of Deposit (CoD) for road tax rebates and new vehicle purchase discounts",
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
          </motion.div>
        </div>

        {/* Team Contact Modal */}
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
                      <p className="text-xs text-slate-500 font-medium">Agra pickup & paperwork support</p>
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
                        <div className="text-sm font-black text-slate-900">Chat with Agra Specialist</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">Open Chat →</span>
                  </a>

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
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: AUTHORISED VEHICLE SCRAPPING SERVICES IN AGRA
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        variants={sectionVariants}
        className="py-14 sm:py-20 bg-gradient-to-b from-white via-slate-50/40 to-white text-slate-900 border-b border-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-50/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-100/60 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
                <span>SCRAPPING IN AGRA</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-[27px] xl:text-[31px] font-black text-slate-900 tracking-tight leading-[1.25]">
                Authorised Vehicle Scrapping Services in Agra <br className="hidden sm:inline" />
                <span className="text-[#E31E24]">— For Individuals and Businesses</span>
              </h2>

              <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                <p>
                  {isHindi
                    ? "स्क्रैपसेंटर आगरा में व्यक्तियों और व्यवसायों को एक अधिकृत प्रक्रिया के माध्यम से पुराने, क्षतिग्रस्त वाहनों (damaged vehicle pickup Agra) को स्क्रैप करने में मदद करता है। आगरा में एक वाहन स्क्रैपिंग कंपनी (vehicle scrapping company in Agra) के रूप में, हम लोहे की फाउंड्री, चमड़ा और जूता उद्योगों, और ताज महल के आसपास पर्यटन के लिए जाने जाने वाले शहर की सेवा करते हैं। हम आगरा से वाहनों को एकत्र करते हैं और कानपुर में हमारे अधिकृत RVSF में उनका प्रसंस्करण करते हैं, जो जमा प्रमाणपत्र (CoD) जारी करता है।"
                    : "ScrapCentre helps individuals and businesses in Agra scrap old, damaged vehicle pickup Agra through an authorised process. As a vehicle scrapping company in Agra, we serve a city known for its iron foundries, leather and footwear industries, and tourism around the Taj Mahal. We collect vehicles from Agra and process them at our authorised RVSF in Kanpur, which issues a Certificate of Deposit (CoD)."}
                </p>
                <p>
                  {isHindi ? (
                    <>
                      आगरा में हमारी वाहन स्क्रैपिंग सेवाओं (vehicle scrapping services in Agra) में मुफ्त मूल्यांकन, डोरस्टेप पिकअप, आरसी रद्दीकरण सहायता और आवश्यक कागजी कार्रवाई में मदद शामिल है। हम वाहन मालिकों को पिकअप से लेकर दस्तावेज़ीकरण तक की प्रक्रिया में मार्गदर्शन करते हैं। वाहन-विशिष्ट जानकारी के लिए, हमारे{" "}
                      <Link
                        href="/hi/know-your-valuation"
                        className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                      >
                        फोर-व्हीलर स्क्रैपिंग
                      </Link>{" "}
                      और{" "}
                      <Link
                        href="/hi/know-your-valuation"
                        className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                      >
                        टू-व्हीलर स्क्रैपिंग
                      </Link>{" "}
                      पेज देखें। आप भारत में हमारी{" "}
                      <Link
                        href="/hi/vehicle-scrapping-services"
                        className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                      >
                        वाहन स्क्रैपिंग सेवाएं
                      </Link>{" "}
                      भी देख सकते हैं।
                    </>
                  ) : (
                    <>
                      Our vehicle scrapping services in Agra include free valuation, doorstep pickup, RC cancellation support and help with the required paperwork. We guide vehicle owners through the process from pickup to documentation. For vehicle-specific information, visit our four-wheeler scrapping and two-wheeler scrapping in Agra pages. You can also explore our{" "}
                      <Link
                        href="/vehicle-scrapping-services"
                        className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                      >
                        vehicle scrapping services
                      </Link>{" "}
                      in India.
                    </>
                  )}
                </p>
              </div>

              {/* 3 Guidance Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-[#E31E24]/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E31E24] flex items-center justify-center font-bold mb-2.5">
                    <Car className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 mb-1">
                    {isHindi ? "कार और बाइक स्क्रैपिंग" : "Car & Bike Scrapping"}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                    {isHindi
                      ? "निजी और वाणिज्यिक वाहनों के लिए आरसी रद्दीकरण सहायता"
                      : "UP-80 RC cancellation and doorstep towing support"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-[#E31E24]/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E31E24] flex items-center justify-center font-bold mb-2.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 mb-1">
                    {isHindi ? "दस्तावेज सहायता" : "RC & Paperwork"}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                    {isHindi
                      ? "यदि आरसी या बीमा गुम है तो भी पूर्ण मार्गदर्शन"
                      : "Guidance even if RC or insurance is misplaced"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-[#E31E24]/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E31E24] flex items-center justify-center font-bold mb-2.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 mb-1">
                    {isHindi ? "सरकारी जमा प्रमाणपत्र" : "Government CoD"}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                    {isHindi
                      ? "परिवहन पोर्टल द्वारा जारी आधिकारिक जमा प्रमाणपत्र (CoD)"
                      : "Official MoRTH Parivahan Certificate of Deposit"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card: Facility Info & Quick Contact */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 overflow-hidden text-left">
                <div className="h-1.5 w-full bg-gradient-to-r from-[#E31E24] via-rose-500 to-[#E31E24]" />

                <div className="p-5 sm:p-6 bg-slate-900 text-white">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#E31E24] text-white text-[10px] font-black uppercase tracking-wider mb-2">
                    AUTHORISED RVSF
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Serving Agra Vehicle Owners
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Free doorstep pickup from Agra & processing at our authorised Kanpur RVSF
                  </p>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                        PROCESSING FACILITY
                      </div>
                      <div className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug">
                        26-A & B, Block-E, Panki, Kalpi Road, Kanpur - 208020
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Serving Agra with free vehicle collection & towing
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0 mt-0.5">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                        DOORSTEP COLLECTION
                      </div>
                      <div className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug">
                        Free pickup across all Agra localities
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Sikandra, Kamla Nagar, Sanjay Place, Tajganj & more
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                        DIRECT DISPATCH
                      </div>
                      <a
                        href="tel:+919839447733"
                        className="text-sm font-black text-slate-900 hover:text-[#E31E24] transition-colors"
                      >
                        +91-9839447733
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-black text-slate-900">Need Help in Agra?</div>
                    <div className="text-[11px] text-slate-500">Instant pickup booking & valuation</div>
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
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: VEHICLES WE SCRAP IN AGRA
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
        variants={sectionVariants}
        className="py-14 sm:py-20 bg-slate-50/60 text-slate-900 border-b border-slate-100 relative"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-left mb-8 sm:mb-12 max-w-6xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
              <span>VEHICLES WE SCRAP IN AGRA</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[30px] xl:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              <span className="block">
                Vehicle Scrapping in Agra for Trucks, Buses, Autos, Tractors & More
              </span>
              <span className="text-[#E31E24] block">— Valuation, Pickup & Authorised Scrapping</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {isHindi
                ? "मालवाहक वाहनों और बसों से लेकर ट्रैक्टरों और इलेक्ट्रिक वाहनों तक, स्क्रैपसेंटर आगरा के मालिकों को मूल्यांकन, पिकअप और अधिकृत स्क्रैपिंग की व्यवस्था करने में मदद करता है। कार और बाइक मालिक नीचे उनके विवरण देख सकते हैं।"
                : "From goods vehicles and buses to tractors and electric vehicles, ScrapCentre helps Agra owners arrange valuation, pickup and authorised scrapping. Car and bike owners can explore their dedicated options below."}
            </p>
          </div>

          {/* 3 x 3 Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
          >
            {vehicleCategories.map((v) => {
              const IconComp = v.icon
              const isSpecial = v.id === "other"
              return (
                <motion.div
                  key={v.id}
                  variants={cardFadeIn}
                  className={`group relative bg-white rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 overflow-hidden ${
                    isSpecial
                      ? "border border-emerald-200/90 hover:border-emerald-500 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10"
                      : "border border-slate-200/90 hover:border-[#E31E24] shadow-xs hover:shadow-xl hover:shadow-red-500/8"
                  }`}
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
                      isSpecial
                        ? "bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                        : "bg-gradient-to-r from-transparent via-[#E31E24] to-transparent"
                    }`}
                  />

                  <div>
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

                    <h3
                      className={`text-base sm:text-lg font-black text-slate-900 transition-colors mb-2 leading-snug ${
                        isSpecial ? "group-hover:text-emerald-700" : "group-hover:text-[#E31E24]"
                      }`}
                    >
                      {v.title}
                    </h3>

                    <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed mb-5">
                      {v.desc}
                    </p>
                  </div>

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
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: RED NOTIFICATION BAR
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="bg-[#E31E24] text-white py-5 sm:py-6"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1 text-white">
                {isHindi ? "आगरा पिकअप उपलब्धता जांचें" : "Check Agra Pickup Availability"}
              </h3>
              <p className="text-xs sm:text-sm text-red-100 font-normal">
                {isHindi
                  ? "औसतन 24 घंटे के भीतर पिकअप निर्धारित किया जाता है"
                  : "Average pickup scheduled within 24 hours"}
              </p>
            </div>

            <a
              href="https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20want%20to%20check%20Agra%20pickup%20availability."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black hover:bg-slate-900 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-md active:scale-95 transition-all shrink-0"
            >
              <span>{isHindi ? "व्हाट्सएप पर जांचें" : "Check on WhatsApp"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: 4-STEP SCRAPPING PROCESS IN AGRA
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        variants={sectionVariants}
        className="py-12 sm:py-16 bg-white text-slate-900 border-b border-slate-100 relative"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-left mb-8 sm:mb-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
              <span>PICKUP TO COD • 4 SIMPLE STAGES</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              How Vehicle Scrapping Works in Agra <br className="hidden sm:inline" />
              <span className="text-[#E31E24]">— From Pickup to Certificate of Deposit</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {isHindi ? (
                <>
                  वाहन को स्क्रैप करने में आपके विवरण साझा करने से लेकर आपके जमा प्रमाणपत्र प्राप्त करने तक चार सरल चरण शामिल हैं। अधिक विवरण के लिए हमारी{" "}
                  <Link
                    href="/hi/vehicle-scrapping-services"
                    className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                  >
                    वाहन स्क्रैपिंग गाइड
                  </Link>{" "}
                  पढ़ें।
                </>
              ) : (
                <>
                  Scrapping a vehicle involves four simple stages, from sharing your details to receiving your Certificate of Deposit. Read our{" "}
                  <Link
                    href="/vehicle-scrapping-services"
                    className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                  >
                    vehicle scrapping guide
                  </Link>{" "}
                  for more details.
                </>
              )}
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.08 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-4.5"
          >
            {processSteps.map((step, idx) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={idx}
                  variants={cardFadeIn}
                  className="group relative bg-white border border-slate-200/80 hover:border-[#E31E24] rounded-2xl p-4 sm:p-4.5 lg:p-5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:shadow-red-500/8 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E31E24] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl sm:text-2xl font-black text-[#E31E24] tracking-tight">
                        {step.num}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 flex items-center justify-center group-hover:bg-[#E31E24] group-hover:text-white group-hover:border-[#E31E24] group-hover:shadow-md group-hover:shadow-red-500/20 transition-all duration-300">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="inline-block px-2 py-0.5 rounded-md bg-red-50/80 border border-red-100 text-[#E31E24] text-[9.5px] font-black uppercase tracking-wider mb-2.5">
                      {step.badge}
                    </div>

                    <h3 className="text-sm sm:text-[15px] font-black text-slate-900 group-hover:text-[#E31E24] leading-snug mb-2 transition-colors">
                      {step.title}
                    </h3>

                    <p className="text-slate-500 text-xs leading-relaxed mb-4">
                      {isHindi ? step.descHi : step.desc}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-[#E31E24] transition-colors">
                    <span>{step.footerStep}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E31E24] group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: PAPERWORK & RC CANCELLATION FOR AGRA
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
        className="py-14 sm:py-20 bg-slate-50/60 text-slate-900 border-b border-slate-100 relative"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-left mb-8 sm:mb-12 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
              <span>PAPERWORK & COMPLIANCE</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              Paper Work & RC Cancellation for Vehicle Scrapping in Agra <br className="hidden sm:inline" />
              <span className="text-[#E31E24]">— Clear Documentation, Hassle-Free Transfer</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {isHindi
                ? "प्रक्रिया को सुचारू रूप से आगे बढ़ाने में मदद के लिए आगरा में अपने वाहन स्क्रैपिंग दस्तावेज तैयार रखें। हमारी टीम कागजी कार्रवाई और आगरा में वाहन पंजीकरण रद्दीकरण में आपका मार्गदर्शन करती है।"
                : "Keep your vehicle scrapping documents in Agra ready to help the process move smoothly. Our team guides you through the paperwork and vehicle registration cancellation in Agra."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            {/* Left 3 Cards */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-4">
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
                        अपने वाहन के लिए विशिष्ट दस्तावेज़ आवश्यकताओं की तलाश कर रहे हैं? हमारे{" "}
                        <Link
                          href="/hi/know-your-valuation"
                          className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                        >
                          फोर-व्हीलर
                        </Link>{" "}
                        और{" "}
                        <Link
                          href="/hi/know-your-valuation"
                          className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                        >
                          टू-व्हीलर
                        </Link>{" "}
                        स्क्रैपिंग गाइड देखें।
                      </>
                    ) : (
                      <>
                        Looking for document requirements specific to your vehicle? Check our guides for{" "}
                        <Link
                          href="/know-your-valuation"
                          className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                        >
                          four-wheeler
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/know-your-valuation"
                          className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                        >
                          two-wheeler
                        </Link>{" "}
                        scrapping.
                      </>
                    )}
                  </p>
                </div>
              </div>

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
                    {isHindi ? (
                      <>
                        दस्तावेजों का गायब होना हमेशा यह नहीं दर्शाता कि आप आगे नहीं बढ़ सकते। अपने विकल्पों की जांच के लिए{" "}
                        <Link
                          href="/hi/contact"
                          className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                        >
                          हमसे संपर्क करें
                        </Link>
                        , क्योंकि वाहन के प्रकार और स्वामित्व की स्थिति के अनुसार आवश्यकताएं भिन्न हो सकती हैं।
                      </>
                    ) : (
                      <>
                        Missing documents don't always mean you cannot proceed.{" "}
                        <Link
                          href="/contact"
                          className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                        >
                          Contact us
                        </Link>{" "}
                        to check your options, as requirements may vary by vehicle type and ownership status.
                      </>
                    )}
                  </p>
                </div>
              </div>

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
                        वाहन स्क्रैपिंग की व्यवस्था करने से पहले कौन से दस्तावेज तैयार रखने हैं, यह देखने के लिए हमारी{" "}
                        <Link
                          href="/hi/vehicle-scrapping-services"
                          className="text-[#E31E24] font-bold underline decoration-red-300 underline-offset-4 hover:text-red-700"
                        >
                          वाहन स्क्रैपिंग चेकलिस्ट
                        </Link>{" "}
                        देखें।
                      </>
                    ) : (
                      <>
                        See which documents to keep ready before arranging vehicle scrapping through our comprehensive{" "}
                        <Link
                          href="/vehicle-scrapping-services"
                          className="text-[#E31E24] font-bold underline decoration-red-300 underline-offset-4 hover:text-red-700"
                        >
                          documents checklist
                        </Link>
                        .
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
                    <span className="text-xs font-bold text-slate-400">RVSF Agra Service</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white mb-6 tracking-tight">
                    Basic documents to keep ready
                  </h3>

                  <ul className="space-y-3.5 mb-8 text-left">
                    {[
                      "Registration Certificate (RC)",
                      "ID proof of the registered owner (Aadhaar / PAN)",
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
                  href="https://wa.me/919839447733?text=Hello%20ScrapCentre,%20please%20send%20me%20the%20vehicle%20scrapping%20documents%20checklist%20for%20Agra."
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
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: WHAT AFFECTS YOUR VEHICLE SCRAP PRICE IN AGRA?
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
        className="py-14 sm:py-20 bg-white text-slate-900 border-b border-slate-100 relative"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-left mb-8 sm:mb-12 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
              <span>TRANSPARENT VALUATION</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              What Affects Your Vehicle Scrap Price in Agra? <br className="hidden sm:inline" />
              <span className="text-[#E31E24]">— Six Factors We Consider During Valuation</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {isHindi
                ? "पुराने वाहन का मूल्य केवल उसकी उम्र से कहीं अधिक पर निर्भर करता है। आगरा में हमारा वाहन स्क्रैपिंग मूल्यांकन वाहन के विवरण और स्थिति के आधार पर कोट तैयार करने के लिए छह प्रमुख कारकों पर विचार करता है।"
                : "The value of an old vehicle depends on more than its age. Our vehicle scrapping valuation in Agra considers six key factors to work out a quote based on the vehicle's details and condition."}
            </p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-700 font-black text-[10px] sm:text-xs uppercase tracking-wider">
                    <th className="py-3 px-3 sm:py-4 sm:px-6 w-[28%] sm:w-[25%]">
                      {isHindi ? "कारक (FACTOR)" : "FACTOR"}
                    </th>
                    <th className="py-3 px-2.5 sm:py-4 sm:px-6 w-[34%] sm:w-[35%]">
                      {isHindi ? "हम क्या जांचते हैं (WHAT WE CHECK)" : "WHAT WE CHECK"}
                    </th>
                    <th className="py-3 px-2.5 sm:py-4 sm:px-6 w-[38%] sm:w-[40%]">
                      {isHindi ? "यह कोट को कैसे प्रभावित करता है (HOW IT AFFECTS THE QUOTE)" : "HOW IT AFFECTS THE QUOTE"}
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
            <span>
              Note: Scrap value quotations are computed based on actual physical inspection, chassis kerb weight and live metal recycling rates.
            </span>
          </div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8: AGRA VEHICLE PICKUP LOCATIONS
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
        className="py-14 sm:py-20 bg-slate-50/60 text-slate-900 border-b border-slate-100 relative"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Localities */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
                <span>WHERE WE OPERATE • AGRA HUBS</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25]">
                Agra Vehicle Pickup Locations <br className="hidden sm:inline" />
                <span className="text-[#E31E24]">— Check If We Cover Your Area</span>
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {isHindi ? (
                  <>
                    स्क्रैपसेंटर सिकंदरा और कमला नगर सहित पूरे आगरा में वाहन पिकअप की व्यवस्था करता है। क्या नीचे दी गई सूची में आपका इलाका नहीं मिल रहा है? हमें{" "}
                    <a
                      href="https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20want%20to%20check%20vehicle%20pickup%20availability%20in%20my%20area%20in%20Agra."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E31E24] hover:underline font-bold"
                    >
                      व्हाट्सएप
                    </a>{" "}
                    पर संदेश भेजें, और हम आपके क्षेत्र के लिए पिकअप उपलब्धता की जांच करेंगे।
                  </>
                ) : (
                  <>
                    ScrapCentre arranges vehicle pickup across Agra, including Sikandra and Kamla Nagar. Can't find your locality in the list below? Message us on{" "}
                    <a
                      href="https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20want%20to%20check%20vehicle%20pickup%20availability%20in%20my%20area%20in%20Agra."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E31E24] hover:underline font-bold"
                    >
                      WhatsApp
                    </a>
                    , and we'll check pickup availability for your area.
                  </>
                )}
              </p>

              <div>
                <div className="text-slate-500 text-[11px] font-black uppercase tracking-wider flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#E31E24]" />
                  <span>12 ACTIVE AGRA PICKUP ZONES</span>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {agraAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-slate-200/90 hover:border-[#E31E24] hover:text-[#E31E24] text-slate-800 text-xs font-bold px-3.5 py-1.5 rounded-full inline-flex items-center gap-2 shadow-xs transition-all cursor-default"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E31E24]/60" />
                      <span>{area}</span>
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-slate-500 text-xs pt-1">
                Outside Agra? See all service coverage zones on our{" "}
                <Link
                  href="/vehicle-scrapping-services"
                  className="text-[#E31E24] font-bold underline decoration-red-300 underline-offset-4 hover:text-red-700"
                >
                  vehicle scrapping services
                </Link>{" "}
                page.
              </p>
            </div>

            {/* Right Facility Card: Authorised RVSF Location */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-7 text-left relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-slate-300">
                <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-[#E31E24] via-rose-500 to-[#E31E24]" />

                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-base sm:text-lg font-black text-slate-900">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E31E24] flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>Authorised RVSF Processing</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    Open Mon - Sat
                  </span>
                </div>

                <div className="divide-y divide-slate-100 space-y-3.5">
                  <div className="pt-2">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      RVSF FACILITY ADDRESS
                    </div>
                    <div className="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug">
                      26-A & B, Block-E, Panki, Kalpi Road, Kanpur, Uttar Pradesh 208020
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Official MoRTH-authorised facility issuing Certificate of Deposit (CoD) for vehicles collected from Agra
                    </div>
                  </div>

                  <div className="pt-3.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      DIRECT CALL / WHATSAPP DISPATCH
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
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 9: AGRA VEHICLE SCRAPPING FAQs (8 FAQs)
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
        className="py-14 sm:py-20 bg-white text-slate-900 border-b border-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-red-50/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-50 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="text-left mb-8 sm:mb-12 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              Agra Vehicle Scrapping FAQs <br className="hidden sm:inline" />
              <span className="text-[#E31E24]">— Common Questions Agra Owners Ask</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {isHindi
                ? "त्वरित, स्थानीय उत्तर। भारत में स्क्रैपिंग नियमों के सामान्य प्रश्नों के लिए हमारी मुख्य अक्सर पूछे जाने वाले प्रश्न गाइड देखें।"
                : "Quick, local answers. For general questions about vehicle scrapping rules in India, explore our main FAQ guide."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Accordion */}
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
                              {isHindi ? faq.aHi : faq.a}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            {/* Right Help Card */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
                <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-[#E31E24] via-rose-500 to-[#E31E24]" />
                <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold mb-5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>Live Agra Support</span>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#E31E24] flex items-center justify-center mx-auto mb-4 shadow-xs">
                  <Headphones className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-1.5">
                  Still Have Questions?
                </h3>

                <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed mb-6">
                  Our Agra dispatch team is happy to help. Call or WhatsApp us anytime for instant guidance.
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
                    href="https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20have%20a%20question%20about%20vehicle%20scrapping%20in%20Agra."
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
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 10: BOTTOM RED CTA BANNER
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={sectionVariants}
        className="py-12 sm:py-16 bg-white text-slate-900"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="bg-[#E31E24] text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-4 text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  <span>✦ FAST & FREE VALUATION</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  Book Your Agra Vehicle <br className="hidden sm:block" />
                  Pickup with ScrapCentre
                </h2>

                <div className="space-y-1 text-white/90 text-sm sm:text-base leading-relaxed max-w-xl">
                  <p className="font-bold text-white">
                    {isHindi ? "अपने पुराने वाहन को स्क्रैप करने के लिए तैयार हैं?" : "Ready to scrap your old vehicle in Agra?"}
                  </p>
                  <p>
                    {isHindi
                      ? "पुरानी गाड़ी को ज़िम्मेदारी से हटाकर नई जगह बनाएं। बिना किसी बाध्यता के मूल्यांकन, अपने दरवाजे से मुफ्त संग्रह और हमारे अधिकृत RVSF के माध्यम से जमा प्रमाणपत्र (CoD) प्राप्त करें।"
                      : "Make space for what’s next by retiring your old vehicle responsibly. Get a no-obligation valuation, free collection from your doorstep and a Certificate of Deposit through our authorised RVSF."}
                  </p>
                </div>

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
                    Calculate your vehicle scrap value in just 60 seconds with our official valuation tool.
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
                      href="https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20want%20to%20get%20a%20free%20vehicle%20valuation%20in%20Agra."
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
      </motion.section>
    </div>
  )
}
