"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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

export default function EtawahScrappingClient() {
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

  // City Hero Config for Etawah
  const cityHeroConfig = {
    titleEn: "Vehicle Scrapping Services in Etawah",
    titleSubEn: "— Free Pickup & Authorised RVSF Services",
    titleHi: "इटावा में वाहन स्क्रैपिंग सेवाएं",
    titleSubHi: "— मुफ्त पिकअप और अधिकृत RVSF सेवाएं",
    descriptionEn:
      "Have an old, damaged or unused vehicle? Vehicle scrapping services in Etawah include free valuation, doorstep pickup, authorised processing, a Certificate of Deposit and assistance with RC cancellation and paperwork.",
    descriptionHi:
      "क्या आपके पास पुराना, क्षतिग्रस्त या अनुपयोगी वाहन है? इटावा में वाहन स्क्रैपिंग सेवाओं में मुफ्त मूल्यांकन, डोरस्टेप पिकअप, अधिकृत प्रसंस्करण, जमा प्रमाणपत्र (CoD) और आरसी रद्दीकरण व कागजी कार्रवाई में सहायता शामिल है।",
    trustBadges: [
      { en: "RTO Authorised RVSF", hi: "RTO अधिकृत RVSF" },
      { en: "Instant COD Issued", hi: "तुरंत COD जारी" },
      { en: "Free Doorstep Pickup", hi: "मुफ्त डोरस्टेप पिकअप" },
      { en: "RC Cancellation Support", hi: "RC रद्दीकरण सहायता" },
    ],
    phoneTel: "+919839447733",
    phoneDisplay: "+91-9839447733",
    whatsappUrl:
      "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20have%20a%20vehicle%20to%20scrap%20in%20Etawah.",
    facilityLocation: "26-A & B, Block-E, Panki, Kalpi Road, Kanpur - 208020 (Serving Etawah)",
  }

  // 1. Vehicle Categories (Exact 9 from Kanpur component architecture)
  const vehicleCategories = [
    {
      id: "cars",
      num: "01",
      icon: Car,
      title: isHindi ? "कारें (Cars)" : "Cars",
      badge: isHindi ? "लोकप्रिय" : "Popular",
      desc: isHindi
        ? "क्या आपके पास कार, हैचबैक, सेडान या एसयूवी है? सुरक्षित डी-पॉल्यूशन, सटीक धातु वजन और सरकारी जमा प्रमाणपत्र (CoD) के साथ अधिकृत कार स्क्रैपिंग।"
        : "Scrap your private or commercial cars, hatchbacks, sedans, and SUVs legally with transparent kerb weight valuation, authorized depollution, and official Certificate of Deposit.",
      linkText: isHindi ? "मेरी कार स्क्रैप करें" : "Scrap My Car",
      href: "/four-wheeler-scrapping-kanpur",
      isExternal: false,
    },
    {
      id: "bikes",
      num: "02",
      icon: Bike,
      title: isHindi ? "बाइक और टू-व्हीलर" : "Two-Wheelers",
      badge: isHindi ? "2-व्हीलर" : "2-Wheeler",
      desc: isHindi
        ? "मोटरसाइकिल, स्कूटर और मोपेड। समाप्त आरसी, गैर-चालू या दुर्घटनाग्रस्त बाइक को उचित चेसिस कटिंग और यूपी-75 आरसी रद्दीकरण सहायता के साथ स्क्रैप किया जाता है।"
        : "Motorcycles, scooters, and mopeds scrapped with proper chassis cutting and UP-75 RC cancellation support for road tax benefit and legal de-registration.",
      linkText: isHindi ? "मेरी बाइक स्क्रैप करें" : "Scrap My Bike",
      href: "/two-wheeler-scrapping-kanpur",
      isExternal: false,
    },
    {
      id: "trucks",
      num: "03",
      icon: Truck,
      title: isHindi ? "ट्रक और मिनी ट्रक" : "Truck & Mini Truck",
      badge: isHindi ? "हैवी ड्यूटी" : "Heavy Duty",
      desc: isHindi
        ? "इटावा में ट्रक स्क्रैपिंग पुराने, क्षतिग्रस्त और अनुपयोगी मालवाहक वाहनों को कवर करती है। चाहे आपको इटावा में ट्रक स्क्रैपिंग या मिनी ट्रक स्क्रैपिंग की आवश्यकता हो, न चलने वाले वाहनों के लिए टोइंग सहायता उपलब्ध है।"
        : "Truck scrapping in Etawah covers old, damaged and end-of-life goods carriers. Whether you need truck scrapping or mini truck scrapping in Etawah, towing support is available for vehicles that cannot run.",
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
        ? "चाहे वह स्कूल बस हो या कोई अन्य यात्री वाहन जो अब उपयोग के लिए उपयुक्त नहीं है, स्क्रैपसेंटर इटावा में बस स्क्रैपिंग के लिए संग्रह और आवश्यक औपचारिकताओं में सहायता करता है।"
        : "Whether it is a school bus or another passenger vehicle that is no longer fit for use, ScrapCentre assists with collection and the required formalities for bus scrapping in Etawah.",
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
        ? "इटावा में ऑटो रिक्शा स्क्रैपिंग के लिए, मालिक पिकअप और दस्तावेज़ीकरण सहायता के बारे में पूछताछ कर सकते हैं। यह सेवा उचित प्रक्रिया के माध्यम से पात्र टेम्पो, तिपहिया और ई-रिक्शा को भी कवर करती है।"
        : "For auto rickshaw scrapping in Etawah, owners can enquire about pickup and documentation support. The service also covers eligible tempos, three-wheelers and e-rickshaws through the appropriate process, including e rickshaw scrapping Etawah.",
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
        ? "जो ट्रैक्टर क्षतिग्रस्त, अप्रयुक्त या कृषि कार्य के लिए अनुपयुक्त हो गए हैं, उन्हें स्क्रैपिंग के लिए माना जा सकता है। इटावा में ट्रैक्टर स्क्रैपिंग में पात्र कृषि वाहनों के लिए आवश्यक औपचारिकताओं में सहायता शामिल है।"
        : "Tractors that have become damaged, unused or unsuitable for agricultural work can be considered for scrapping. Tractor scrapping in Etawah includes assistance with the required formalities for eligible agricultural vehicles.",
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
        ? "इटावा में वाणिज्यिक वाहन स्क्रैपिंग उन पात्र वाहनों को कवर करती है जो अपने कामकाजी जीवन के अंत तक पहुंच चुके हैं। व्यवसाय इटावा में फ्लीट वाहन स्क्रैपिंग के बारे में पूछताछ कर सकते हैं।"
        : "Commercial vehicle scrapping in Etawah covers eligible vehicles that have reached the end of their working life. Businesses can enquire about fleet vehicle scrapping in Etawah; government, police, defence and ambulance vehicles require an eligibility check.",
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
        ? "इटावा में ईवी स्क्रैपिंग पात्र इलेक्ट्रिक वाहनों के लिए उपयुक्त अधिकृत प्रक्रिया का पालन करती है। यदि आपके पास कोई पुराना या क्षतिग्रस्त ईवी है, तो इटावा में इलेक्ट्रिक वाहन स्क्रैपिंग की आवश्यकताओं की जांच के लिए स्क्रैपसेंटर से संपर्क करें।"
        : "EV scrapping in Etawah follows the appropriate authorised process for eligible electric vehicles. If you own an old or damaged EV, contact ScrapCentre to check the requirements for electric vehicle scrapping in Etawah.",
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
        ? "निश्चित नहीं हैं कि आपका वाहन योग्य है या नहीं? हमें इसका विवरण भेजें, और हमारी टीम इसकी पात्रता की जांच करेगी और अगले कदम समझाएगी।"
        : "Not sure whether your vehicle qualifies? Send us its details, and our team will check its eligibility and explain the next steps.",
      linkText: isHindi ? "व्हाट्सएप पर पूछें" : "Ask on WhatsApp",
      href: "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20have%20a%20vehicle%20to%20scrap%20in%20Etawah.",
      isExternal: true,
    },
  ]

  // 2. 4-Step Scrapping Process (Exact text from prompt)
  const processSteps = [
    {
      num: "01",
      icon: MapPin,
      badge: "AT YOUR DOORSTEP",
      title: isHindi ? "अपना नंबर और इलाका साझा करें" : "Share Your Number & Locality",
      desc: "Start by sharing your vehicle registration number and Etawah locality through our website or WhatsApp. You'll receive a valuation estimate, followed by pickup-slot confirmation on WhatsApp for vehicle scrapping home service in Etawah.",
      descHi:
        "शुरुआत करने के लिए, हमारी वेबसाइट या व्हाट्सएप के माध्यम से अपना वाहन पंजीकरण नंबर और इटावा का इलाका साझा करें। आपको एक मूल्यांकन अनुमान प्राप्त होगा, जिसके बाद इटावा में वाहन स्क्रैपिंग होम सर्विस के लिए व्हाट्सएप पर पिकअप स्लॉट की पुष्टि होगी।",
      footerStep: "STEP 01",
    },
    {
      num: "02",
      icon: Truck,
      badge: "FREE PICKUP",
      title: isHindi ? "मुफ्त डोरस्टेप पिकअप" : "Free Doorstep Pickup",
      desc: "Once scrapping is confirmed, ScrapCentre arranges collection from your doorstep at no cost. If the vehicle cannot be driven, towing support can be arranged as part of the damaged vehicle pickup in Etawah.",
      descHi:
        "एक बार स्क्रैपिंग की पुष्टि हो जाने के बाद, स्क्रैपसेंटर बिना किसी शुल्क के आपके दरवाजे से पिकअप की व्यवस्था करता है। यदि वाहन चलाया नहीं जा सकता है, तो इटावा में क्षतिग्रस्त वाहन पिकअप के भाग के रूप में टोइंग सहायता की व्यवस्था की जा सकती है।",
      footerStep: "STEP 02",
    },
    {
      num: "03",
      icon: FileText,
      badge: "PAPERWORK",
      title: isHindi ? "दस्तावेज और आरसी रद्दीकरण" : "Documents & RC Cancellation",
      desc: "Keep the required ownership and vehicle documents ready for submission. ScrapCentre assists with the necessary vehicle scrapping paperwork in Etawah and guides you through the RC cancellation formalities.",
      descHi:
        "जमा करने के लिए आवश्यक स्वामित्व और वाहन दस्तावेज तैयार रखें। स्क्रैपसेंटर इटावा में आवश्यक वाहन स्क्रैपिंग कागजी कार्रवाई में सहायता करता है और आरसी रद्दीकरण औपचारिकताओं में आपका मार्गदर्शन करता है।",
      footerStep: "STEP 03",
    },
    {
      num: "04",
      icon: ShieldCheck,
      badge: "AUTHORISED RVSF",
      title: isHindi ? "भुगतान और जमा प्रमाणपत्र" : "Payment & Certificate of Deposit",
      desc: "After the vehicle is processed at the authorised RVSF, the applicable payment is made and a Certificate of Deposit is issued, completing the process of certificate of deposit in Etawah.",
      descHi:
        "अधिकृत RVSF में वाहन के संसाधित होने के बाद, लागू भुगतान किया जाता है और जमा प्रमाणपत्र (CoD) जारी किया जाता है, जिससे इटावा में जमा प्रमाणपत्र की प्रक्रिया पूरी होती है।",
      footerStep: "STEP 04",
    },
  ]

  // 3. Value Factors Table (Exact 6 factors from prompt)
  const valueFactors = [
    {
      factor: "Vehicle Type",
      factorHi: "वाहन का प्रकार",
      icon: Car,
      whatWeCheck: "Vehicle category, chassis structure & engine capacity",
      whatWeCheckHi: "वाहन श्रेणी, चेसिस संरचना और इंजन क्षमता",
      howItAffects: "Trucks, buses, tractors and other vehicle categories have different material compositions and valuation requirements.",
      howItAffectsHi: "ट्रकों, बसों, ट्रैक्टरों और अन्य वाहन श्रेणियों में विभिन्न सामग्री संरचनाएं और मूल्यांकन आवश्यकताएं होती हैं।",
    },
    {
      factor: "Vehicle Weight",
      factorHi: "वाहन का वजन",
      icon: Scale,
      whatWeCheck: "Overall unladen weight & kerb tonnage",
      whatWeCheckHi: "कुल खाली वजन और कर्ब टन भार",
      howItAffects: "The overall weight of the vehicle helps determine the quantity of recoverable material.",
      howItAffectsHi: "वाहन का कुल वजन उपलब्ध स्क्रैप सामग्री की मात्रा निर्धारित करने में मदद करता है।",
    },
    {
      factor: "Vehicle Age",
      factorHi: "वाहन की आयु",
      icon: Calendar,
      whatWeCheck: "Manufacturing year, registration tenure & fitness expiry",
      whatWeCheckHi: "निर्माण वर्ष, पंजीकरण अवधि और फिटनेस समाप्ति",
      howItAffects: "How long the vehicle has been in use can influence its condition and remaining material value.",
      howItAffectsHi: "वाहन कितने समय से उपयोग में है, यह इसकी स्थिति और शेष सामग्री मूल्य को प्रभावित कर सकता है।",
    },
    {
      factor: "Vehicle Condition",
      factorHi: "वाहन की स्थिति",
      icon: Key,
      whatWeCheck: "Damage level, corrosion, rust and drivetrain state",
      whatWeCheckHi: "क्षति स्तर, जंग, क्षरण और ड्राइवट्रेन स्थिति",
      howItAffects: "The extent of damage, rust and wear can affect the final assessment.",
      howItAffectsHi: "क्षति, जंग और टूट-फूट की सीमा अंतिम मूल्यांकन को प्रभावित कर सकती है।",
    },
    {
      factor: "Completeness of the Vehicle",
      factorHi: "वाहन की पूर्णता",
      icon: Link2,
      whatWeCheck: "Presence of engine, gearbox, battery, catalytic converter & tyres",
      whatWeCheckHi: "इंजन, गियरबॉक्स, बैटरी, कैटेलिटिक कनवर्टर और टायर की उपस्थिति",
      howItAffects: "Whether major components and parts are present is considered during valuation.",
      howItAffectsHi: "मूल्यांकन के दौरान यह विचार किया जाता है कि क्या प्रमुख घटक और पुर्जे मौजूद हैं।",
    },
    {
      factor: "Current Scrap Metal Rates",
      factorHi: "वर्तमान स्क्रैप धातु दरें",
      icon: IndianRupee,
      whatWeCheck: "Prevailing market rates for ferrous & non-ferrous metals",
      whatWeCheckHi: "लौह और अलौह धातुओं के लिए प्रचलित बाजार दरें",
      howItAffects: "Prevailing market rates for different metals influence the value of the materials recovered.",
      howItAffectsHi: "विभिन्न धातुओं के लिए प्रचलित बाजार दरें बरामद सामग्रियों के मूल्य को प्रभावित करती हैं।",
    },
  ]

  // 4. Etawah Localities (Exact 12 from prompt)
  const etawahAreas = [
    "Bharthana",
    "Jaswantnagar",
    "Saifai",
    "Bakewar",
    "Etawah City",
    "Lakhna",
    "Ekdil",
    "Chakarnagar",
    "Takha",
    "Mahewa",
    "Basrehar",
    "Sarsai Nawar",
  ]

  // 5. FAQs (Exact 8 from prompt)
  const faqItems = [
    {
      q: "How do I arrange vehicle scrapping in Etawah?",
      qHi: "मैं इटावा में वाहन स्क्रैपिंग की व्यवस्था कैसे करूँ?",
      a: "Share your vehicle registration number through ScrapCentre's website or WhatsApp to get started. ScrapCentre offers free doorstep pickup from Etawah and processes collected vehicles at its authorised RVSF at 26-A & B, Block-E, Panki, Kalpi Road, Kanpur.",
      aHi: "शुरुआत करने के लिए स्क्रैपसेंटर की वेबसाइट या व्हाट्सएप के माध्यम से अपना वाहन पंजीकरण नंबर साझा करें। स्क्रैपसेंटर इटावा से मुफ्त डोरस्टेप पिकअप प्रदान करता है और 26-A & B, ब्लॉक-E, पनकी, कालपी रोड, कानपुर में अपने अधिकृत RVSF में एकत्र किए गए वाहनों को संसाधित करता है।",
    },
    {
      q: "Is there an authorised RVSF service available for vehicle owners in Etawah?",
      qHi: "क्या इटावा में वाहन मालिकों के लिए कोई अधिकृत RVSF सेवा उपलब्ध है?",
      a: "Yes. ScrapCentre is an RTO-authorised Registered Vehicle Scrapping Facility (RVSF) serving Etawah. We process vehicles collected from the city at our authorised facility in Kanpur, where eligible vehicles receive a Certificate of Deposit after scrapping through the approved process.",
      aHi: "हाँ। स्क्रैपसेंटर एक RTO-अधिकृत पंजीकृत वाहन स्क्रैपिंग सुविधा (RVSF) है जो इटावा में सेवा प्रदान करती है। हम कानपुर में अपनी अधिकृत सुविधा में शहर से एकत्र किए गए वाहनों को संसाधित करते हैं, जहां पात्र वाहनों को अनुमोदित प्रक्रिया के माध्यम से स्क्रैपिंग के बाद जमा प्रमाणपत्र (CoD) प्राप्त होता है।",
    },
    {
      q: "Which areas in Etawah are covered for vehicle pickup?",
      qHi: "इटावा में वाहन पिकअप के लिए कौन से क्षेत्र कवर किए गए हैं?",
      a: "ScrapCentre arranges pickup across Bharthana, Jaswantnagar, Saifai, Bakewar, Etawah City, Lakhna, Ekdil, Chakarnagar, Takha, Mahewa, Basrehar and Sarsai Nawar. For vehicle scrapping services in Bharthana, Etawah, or any locality not listed here, contact us on WhatsApp to check pickup availability.",
      aHi: "स्क्रैपसेंटर भरथना, जसवंतनगर, सैफई, बकेवर, इटावा सिटी, लखना, एकडिल, चकरनगर, ताखा, महेवा, बसरेहर और सरसई नावर में पिकअप की व्यवस्था करता है। भरथना, इटावा में वाहन स्क्रैपिंग सेवाओं के लिए, या यहाँ सूचीबद्ध नहीं किए गए किसी भी इलाके के लिए, पिकअप उपलब्धता की जांच के लिए व्हाट्सएप पर हमसे संपर्क करें।",
    },
    {
      q: "What types of trucks and commercial vehicles can I send for scrapping?",
      qHi: "मैं स्क्रैपिंग के लिए किस प्रकार के ट्रक और वाणिज्यिक वाहन भेज सकता हूँ?",
      a: "ScrapCentre accepts enquiries for old, damaged or end-of-life trucks, buses and eligible commercial vehicles. If a vehicle is no longer running, towing support can be discussed. Share its details to check eligibility for truck scrapping, bus scrapping in Etawah or commercial fleet requirements.",
      aHi: "स्क्रैपसेंटर पुराने, क्षतिग्रस्त या अनुपयोगी ट्रकों, बसों और पात्र वाणिज्यिक वाहनों के लिए पूछताछ स्वीकार करता है। यदि कोई वाहन अब नहीं चल रहा है, तो टोइंग सहायता पर चर्चा की जा सकती है। इटावा में ट्रक स्क्रैपिंग, बस स्क्रैपिंग या वाणिज्यिक बेड़े की आवश्यकताओं की पात्रता की जांच के लिए इसका विवरण साझा करें।",
    },
    {
      q: "Are auto-rickshaws and e-rickshaws covered under your services?",
      qHi: "क्या आपकी सेवाओं के तहत ऑटो-रिक्शा और ई-रिक्शा शामिल हैं?",
      a: "Yes, eligible old or unfit auto-rickshaws and e-rickshaws can be processed through the appropriate authorised route. For auto rickshaw scrapping or e rickshaw scrapping in Etawah, share the vehicle details with our team to confirm eligibility.",
      aHi: "हाँ, पात्र पुराने या अनफिट ऑटो-रिक्शा और ई-रिक्शा को उपयुक्त अधिकृत मार्ग के माध्यम से संसाधित किया जा सकता है। इटावा में ऑटो रिक्शा स्क्रैपिंग या ई-रिक्शा स्क्रैपिंग के लिए, पात्रता की पुष्टि करने के लिए हमारी टीम के साथ वाहन विवरण साझा करें।",
    },
    {
      q: "How is the amount offered for an old vehicle decided?",
      qHi: "पुराने वाहन के लिए दी जाने वाली राशि कैसे तय की जाती है?",
      a: "The quote depends on the vehicle's category, weight, age, present condition, completeness and prevailing scrap metal rates. You can request a free vehicle valuation in Etawah without any obligation before deciding. The vehicle scrap price in Etawah will be determined after assessing these factors.",
      aHi: "कोट वाहन की श्रेणी, वजन, आयु, वर्तमान स्थिति, पूर्णता और प्रचलित स्क्रैप धातु दरों पर निर्भर करता है। आप निर्णय लेने से पहले किसी भी दायित्व के बिना इटावा में मुफ्त वाहन मूल्यांकन का अनुरोध कर सकते हैं। इन कारकों का आकलन करने के बाद इटावा में वाहन स्क्रैप मूल्य निर्धारित किया जाएगा।",
    },
    {
      q: "What assistance will I receive with RC cancellation?",
      qHi: "मुझे आरसी रद्दीकरण में क्या सहायता मिलेगी?",
      a: "ScrapCentre helps vehicle owners prepare the required paperwork and understand the steps involved in vehicle registration cancellation in Etawah. The team will confirm which documents are needed based on your vehicle and ownership details, including requirements related to vehicle scrapping RC in Etawah.",
      aHi: "स्क्रैपसेंटर वाहन मालिकों को आवश्यक कागजी कार्रवाई तैयार करने और इटावा में वाहन पंजीकरण रद्दीकरण में शामिल चरणों को समझने में मदद करता है। टीम पुष्टि करेगी कि आपके वाहन और स्वामित्व विवरण के आधार पर कौन से दस्तावेज आवश्यक हैं, जिसमें इटावा में वाहन स्क्रैपिंग आरसी से संबंधित आवश्यकताएं शामिल हैं।",
    },
    {
      q: "Where can car and two-wheeler owners find the relevant scrapping details?",
      qHi: "कार और दोपहिया वाहन मालिक प्रासंगिक स्क्रैपिंग विवरण कहाँ पा सकते हैं?",
      a: "ScrapCentre has separate pages explaining the process for each category. Visit the four-wheeler scrapping page or the two-wheeler scrapping page for vehicle-specific information. Both follow the authorised RVSF process.",
      aHi: "प्रत्येक श्रेणी के लिए प्रक्रिया को समझाने वाले अलग-अलग पृष्ठ स्क्रैपसेंटर के पास हैं। वाहन-विशिष्ट जानकारी के लिए चार पहिया स्क्रैपिंग पेज या दोपहिया स्क्रैपिंग पेज पर जाएं। दोनों अधिकृत RVSF प्रक्रिया का पालन करते हैं।",
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
          SECTION 1: HERO SECTION (Exact Kanpur Design)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full pt-24 sm:pt-28 md:pt-28 lg:pt-16 pb-8 sm:pb-10 lg:pb-12 bg-white overflow-hidden border-b border-slate-100">
        {/* Kanpur Hero Background Car Image */}
        <div
          className="absolute inset-0 pointer-events-none bg-no-repeat bg-right-top bg-contain z-0 hidden sm:block"
          style={{ backgroundImage: "url('/Locationimg/kanpurbg.png')" }}
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
              <span>{isHindi ? "वाहन स्क्रैपिंग सेवाएं इटावा" : "Vehicle Scrapping Services Etawah"}</span>
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
                  ? "प्रमाणित स्क्रैपिंग के साथ MoRTH दिशानिर्देशों के तहत पंजीकृत अधिकृत RVSF सुविधा"
                  : "MoRTH registered authorised RVSF facility processing Etawah vehicles with certified scrapping",
              },
              {
                num: "02",
                icon: Truck,
                title: isHindi ? "मुफ्त डोरस्टेप पिकअप" : "Free Doorstep Pickup",
                desc: isHindi
                  ? "भरथना, जसवंतनगर और सैफई सहित सभी इटावा इलाकों में डोरस्टेप टोइंग और फ्लैटबेड कलेक्शन"
                  : "Doorstep towing and flatbed collection across all Etawah tehsils including Bharthana & Jaswantnagar",
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
                        <div className="text-sm font-black text-slate-900">Chat with Etawah Specialist</div>
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
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ display: "none" }}>
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
          SECTION 2: INTRO SECTION (Exact Kanpur Design)
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
              {/* Category Pill Tag with Pulsing Dot */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
                <span>SCRAPPING IN ETAWAH</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-2xl sm:text-3xl lg:text-[27px] xl:text-[31px] font-black text-slate-900 tracking-tight leading-[1.25]">
                {isHindi
                  ? "इटावा में अधिकृत वाहन स्क्रैपिंग"
                  : "Authorised Vehicle Scrapping in Etawah"} <br className="hidden sm:inline" />
                <span className="text-[#E31E24]">
                  {isHindi
                    ? "— पिकअप से प्रमाणन तक एक स्पष्ट प्रक्रिया"
                    : "— A Clear Process from Pickup to Certification"}
                </span>
              </h2>

              {/* Introduction Paragraphs */}
              <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                <p>
                  {isHindi
                    ? "इटावा से होकर गुजरने वाले NH-19 और जिले से शुरू होने वाले बुंदेलखंड एक्सप्रेसवे के साथ, पुराने वाहनों को रिटायर करने के मामले में वाहन मालिकों की अलग-अलग जरूरतें होती हैं। स्क्रैपसेंटर इटावा में एक वाहन स्क्रैपिंग कंपनी (vehicle scrapping company in Etawah) है जो वाहन संग्रह की व्यवस्था करती है और कानपुर में अपनी अधिकृत सुविधा में पात्र वाहनों को संसाधित करती है। एक RVSF (पंजीकृत वाहन स्क्रैपिंग सुविधा) स्वीकृत प्रक्रियाओं का पालन करता है और स्क्रैपिंग के बाद जमा प्रमाणपत्र जारी करता है।"
                    : "With NH-19 passing through Etawah and the Bundelkhand Expressway beginning in the district, vehicle owners have different needs when it comes to retiring old vehicles. ScrapCentre is a vehicle scrapping company in Etawah that arranges vehicle collection and processes eligible vehicles at its authorised facility in Kanpur. An RVSF (Registered Vehicle Scrapping Facility) follows approved procedures and issues a Certificate of Deposit after scrapping."}
                </p>
                <p>
                  {isHindi ? (
                    <>
                      मुफ्त वाहन मूल्यांकन से लेकर डोरस्टेप पिकअप और आरसी रद्दीकरण सहायता तक, स्क्रैपसेंटर इटावा की सेवा करने वाले सरकार द्वारा अधिकृत RVSF के माध्यम से आवश्यक कदमों को एक साथ लाता है। यह प्रक्रिया वाहन निराकरण और दस्तावेज़ीकरण के लिए अधिकृत प्रक्रियाओं का पालन करती है। श्रेणी-विशिष्ट जानकारी के लिए, इटावा में हमारे{" "}
                      <Link
                        href="/hi/four-wheeler-scrapping-kanpur"
                        className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                      >
                        चार पहिया स्क्रैपिंग
                      </Link>{" "}
                      और{" "}
                      <Link
                        href="/hi/two-wheeler-scrapping-kanpur"
                        className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                      >
                        दोपहिया स्क्रैपिंग
                      </Link>{" "}
                      पेजों पर जाएं, या भारत में हमारी संपूर्ण{" "}
                      <Link
                        href="/hi/vehicle-scrapping-services"
                        className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                      >
                        वाहन स्क्रैपिंग सेवाएं
                      </Link>{" "}
                      देखें।
                    </>
                  ) : (
                    <>
                      From a free vehicle valuation to doorstep pickup and RC cancellation assistance, ScrapCentre brings the essential steps together through a government authorised RVSF serving Etawah. The process follows authorised procedures for vehicle dismantling and documentation. For category-specific information, visit our{" "}
                      <Link
                        href="/four-wheeler-scrapping-kanpur"
                        className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                      >
                        four-wheeler scrapping
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/two-wheeler-scrapping-kanpur"
                        className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                      >
                        two-wheeler scrapping
                      </Link>{" "}
                      pages, or explore our complete{" "}
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
                      ? "निजी और वाणिज्यिक वाहनों के लिए यूपी-75 आरसी रद्दीकरण सहायता"
                      : "UP-75 RC cancellation & doorstep towing support"}
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
                      ? "यदि आरसी या बीमा गुम है तो भी पूर्ण कानूनी मार्गदर्शन"
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

            {/* Right Card: ETAWAH AT A GLANCE (Exact Command Center Design from Kanpur) */}
            <div className="lg:col-span-5 pt-2 lg:pt-0">
              <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden relative transition-all duration-300 hover:shadow-2xl hover:border-slate-300 text-left">
                {/* Sleek top brand accent line */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#E31E24] via-rose-500 to-[#E31E24]" />

                {/* Card Dark Header with live hub ping */}
                <div className="bg-slate-950 text-white p-5 sm:p-6 relative overflow-hidden text-left">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-black uppercase tracking-[0.16em] text-white">
                        ETAWAH AT A GLANCE
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      Live Hub
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    Authorised RVSF facility & fast local dispatch serving Etawah
                  </p>
                </div>

                {/* 4 Details Rows divided by divide-y */}
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
                          26-A & B, Block-E, Panki, Kalpi Road, Kanpur - 208020
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Serving Etawah with free doorstep collection & towing
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DOORSTEP PICKUP */}
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
                          Free doorstep towing & flatbed collection across all Etawah areas
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
                        <div className="flex items-center gap-3">
                          <a
                            href="tel:+919839447733"
                            className="text-xs font-bold text-slate-900 hover:text-[#E31E24] transition-colors"
                          >
                            +91-9839447733
                          </a>
                          <span className="text-slate-300">|</span>
                          <a
                            href={cityHeroConfig.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-emerald-600 hover:underline"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OFFICIAL EMAIL */}
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
                    <div className="text-xs font-black text-slate-900 leading-tight">Need Help in Etawah?</div>
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
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: VEHICLES WE SCRAP IN ETAWAH (Exact Kanpur Card Architecture)
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
        variants={sectionVariants}
        className="py-14 sm:py-20 bg-slate-50/60 text-slate-900 border-b border-slate-100 relative"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Section Header */}
          <div className="text-left mb-8 sm:mb-12 max-w-6xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
              <span>VEHICLES WE SCRAP IN ETAWAH</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[30px] xl:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              <span className="block">Truck, Bus, Auto, Tractor & Commercial Vehicle Scrapping in Etawah</span>
              <span className="text-[#E31E24] block">— Every Vehicle Type, One Authorised RVSF</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {isHindi
                ? "स्क्रैपसेंटर मूल्यांकन, डोरस्टेप पिकअप और अधिकृत प्रसंस्करण के साथ माल वाहक और ट्रैक्टर से लेकर बसों और इलेक्ट्रिक वाहनों तक विभिन्न वाहन श्रेणियों को संभालता है। कार और बाइक के मालिक नीचे हमारे समर्पित लिंक देख सकते हैं।"
                : "ScrapCentre handles different vehicle categories, from goods carriers and tractors to buses and electric vehicles, with valuation, doorstep pickup and authorised processing. Car and bike owners can explore their dedicated pages below."}
            </p>
          </div>

          {/* 3 x 3 Responsive Grid (Exact Kanpur Card Architecture) */}
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
                        <span className="text-slate-300 font-black text-sm select-none">
                          {v.num}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#E31E24] leading-snug mb-2 transition-colors">
                      {v.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed mb-6">
                      {v.desc}
                    </p>
                  </div>

                  {/* Bottom Action Link */}
                  {v.isExternal ? (
                    <a
                      href={v.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between w-full pt-3 border-t border-slate-100 text-xs font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors"
                    >
                      <span>{v.linkText}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  ) : (
                    <Link
                      href={v.href}
                      className="inline-flex items-center justify-between w-full pt-3 border-t border-slate-100 text-xs font-bold text-slate-700 group-hover:text-[#E31E24] transition-colors"
                    >
                      <span>{v.linkText}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: 4-STEP SCRAPPING PROCESS (Exact Kanpur Design)
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        variants={sectionVariants}
        className="py-12 sm:py-16 bg-white text-slate-900 border-b border-slate-100 relative"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Section Header */}
          <div className="text-left mb-8 sm:mb-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
              <span>PICKUP TO COD • 4 SIMPLE STEPS</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              How Vehicle Scrapping Works in Etawah <br className="hidden sm:inline" />
              <span className="text-[#E31E24]">— From Your Doorstep to Your Certificate of Deposit</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {isHindi ? (
                <>
                  स्क्रैपसेंटर पहली पूछताछ से लेकर अंतिम प्रमाणन तक वाहन मालिकों को चार चरणों में मार्गदर्शन करता है। पूरी प्रक्रिया के लिए हमारी{" "}
                  <Link href="/hi/vehicle-scrapping-services" className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4">
                    वाहन स्क्रैपिंग गाइड
                  </Link>{" "}
                  देखें।
                </>
              ) : (
                <>
                  ScrapCentre guides vehicle owners through four stages, from the first enquiry to final certification. Read our{" "}
                  <Link href="/vehicle-scrapping-services" className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4">
                    vehicle scrapping guide
                  </Link>{" "}
                  for the complete process.
                </>
              )}
            </p>
          </div>

          {/* 4 Compact Cards Grid (Exact Kanpur Design) */}
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
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: DOCUMENTS & RC CANCELLATION (Exact Kanpur Design)
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
              Getting Your Documents Ready for Vehicle Scrapping in Etawah <br className="hidden sm:inline" />
              <span className="text-[#E31E24]">— What to Keep Ready</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {isHindi
                ? "अपना वाहन सौंपने से पहले उसके बुनियादी दस्तावेज संभाल कर रखें। स्क्रैपसेंटर इटावा में आवश्यक वाहन स्क्रैपिंग दस्तावेजों और वाहन पंजीकरण रद्दीकरण प्रक्रिया में सहायता करता है।"
                : "Before handing over your vehicle, keep its basic documents handy. ScrapCentre assists with the required vehicle scrapping documents in Etawah and the vehicle registration cancellation process."}
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
                        विशिष्ट वाहन श्रेणी के लिए दस्तावेज़ मार्गदर्शन चाहिए? हमारे समर्पित{" "}
                        <Link href="/hi/four-wheeler-scrapping-kanpur" className="text-[#E31E24] font-bold underline decoration-red-300 underline-offset-4">
                          चार पहिया
                        </Link>{" "}
                        और{" "}
                        <Link href="/hi/two-wheeler-scrapping-kanpur" className="text-[#E31E24] font-bold underline decoration-red-300 underline-offset-4">
                          दोपहिया
                        </Link>{" "}
                        पेजों पर प्रासंगिक कागजी कार्रवाई विवरण प्राप्त करें।
                      </>
                    ) : (
                      <>
                        Need document guidance for a specific vehicle category? Find the relevant paperwork details on our dedicated{" "}
                        <Link href="/four-wheeler-scrapping-kanpur" className="text-[#E31E24] font-bold underline decoration-red-300 underline-offset-4">
                          four-wheeler
                        </Link>{" "}
                        and{" "}
                        <Link href="/two-wheeler-scrapping-kanpur" className="text-[#E31E24] font-bold underline decoration-red-300 underline-offset-4">
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
                      ? "क्या आपके पास अपने आरसी या बीमा के कागजात नहीं हैं? अपने मामले पर चर्चा करने के लिए स्क्रैपसेंटर से संपर्क करें। वाहन श्रेणी और स्वामित्व की स्थिति के आधार पर, इटावा में वाहन स्क्रैपिंग आरसी के लिए अतिरिक्त दस्तावेजों की आवश्यकता हो सकती है।"
                      : "Don't have your RC or insurance papers? Contact ScrapCentre to discuss your case. Depending on the vehicle category and ownership status, additional documents may be required for vehicle scrapping RC in Etawah."}
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
                        यह समझने के लिए कि आपको कौन से कागजात तैयार रखने की आवश्यकता है और दस्तावेज़ीकरण प्रक्रिया कैसे काम करती है, हमारी{" "}
                        <Link
                          href="/hi/vehicle-scrapping-services"
                          className="text-[#E31E24] font-bold underline decoration-red-300 underline-offset-4 hover:text-red-700"
                        >
                          वाहन स्क्रैपिंग दस्तावेज चेकलिस्ट
                        </Link>{" "}
                        देखें।
                      </>
                    ) : (
                      <>
                        Explore our{" "}
                        <Link
                          href="/vehicle-scrapping-services"
                          className="text-[#E31E24] font-bold underline decoration-red-300 underline-offset-4 hover:text-red-700"
                        >
                          vehicle scrapping documents checklist
                        </Link>{" "}
                        to understand which papers you need to keep ready and how the documentation process works.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card: Dark Checklist Card (Exact Kanpur Design) */}
            <div className="lg:col-span-5">
              <div className="bg-slate-950 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full">
                <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-[#E31E24] via-rose-500 to-[#E31E24]" />
                <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#E31E24] text-white text-[10px] font-black uppercase tracking-wider">
                      CHECKLIST
                    </span>
                    <span className="text-xs font-bold text-slate-400">RVSF Etawah</span>
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
                  href="https://wa.me/919839447733?text=Hello%20ScrapCentre,%20please%20send%20me%20the%20vehicle%20scrapping%20documents%20checklist%20for%20Etawah."
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
          SECTION 6: VALUATION FACTORS (Exact Kanpur Table Design)
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
              Six Things That Shape Your Vehicle's Scrap Value in Etawah <br className="hidden sm:inline" />
              <span className="text-[#E31E24]">— Six Factors, Explained</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {isHindi
                ? "इटावा में अपने वाहन के स्क्रैप मूल्य के बारे में सोच रहे हैं? प्रत्येक वाहन को छह प्रमुख कारकों के आधार पर इटावा में व्यक्तिगत वाहन स्क्रैपिंग मूल्यांकन प्राप्त होता है। बिना किसी दायित्व के इटावा में एक मुफ्त वाहन मूल्यांकन प्राप्त करें।"
                : "Wondering about your vehicle scrap price in Etawah? Every vehicle receives an individual vehicle scrapping valuation in Etawah, based on six key factors. Get a free vehicle valuation in Etawah with no obligation."}
            </p>
          </div>

          {/* Responsive Valuation Factors Table (Exact Kanpur Table) */}
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
                      {isHindi ? "इसका क्या अर्थ है" : "WHAT IT MEANS"}
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
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: SERVICE AREAS ACROSS ETAWAH (Exact Kanpur Design)
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
                <span>WHERE WE OPERATE • ETAWAH HUBS</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25]">
                Vehicle Scrapping Across Etawah <br className="hidden sm:inline" />
                <span className="text-[#E31E24]">— Pickup Areas We Cover</span>
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {isHindi ? (
                  <>
                    स्क्रैपसेंटर पूरे इटावा में वाहन पिकअप की व्यवस्था करता है, जिसमें भरथना इटावा और जसवंतनगर इटावा में वाहन स्क्रैपिंग सेवाएं शामिल हैं। यदि आपका इलाका नीचे सूचीबद्ध नहीं है, तो पिकअप उपलब्धता की जांच के लिए हमें{" "}
                    <a
                      href="https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20want%20to%20check%20vehicle%20pickup%20availability%20in%20my%20area%20in%20Etawah."
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
                    ScrapCentre arranges vehicle pickup across Etawah, including vehicle scrapping services Bharthana Etawah and Jaswantnagar Etawah. If your locality isn't listed below, send us a{" "}
                    <a
                      href="https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20want%20to%20check%20vehicle%20pickup%20availability%20in%20my%20area%20in%20Etawah."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E31E24] hover:underline font-bold"
                    >
                      WhatsApp
                    </a>{" "}
                    message to check pickup availability.
                  </>
                )}
              </p>

              <div>
                <div className="text-slate-500 text-[11px] font-black uppercase tracking-wider flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#E31E24]"></span>
                  <span>12 ACTIVE ETAWAH PICKUP ZONES</span>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {etawahAreas.map((area, idx) => (
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
                Outside Etawah? See all service areas on our{" "}
                <Link
                  href="/vehicle-scrapping-services"
                  className="text-[#E31E24] font-bold underline decoration-red-300 underline-offset-4 hover:text-red-700"
                >
                  vehicle scrapping services
                </Link>{" "}
                page.
              </p>
            </div>

            {/* Right Facility Card: Serving Etawah from Authorised RVSF */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-7 text-left relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-slate-300">
                <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-[#E31E24] via-rose-500 to-[#E31E24]" />

                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-base sm:text-lg font-black text-slate-900">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E31E24] flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>Serving Etawah Vehicle Owners</span>
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
                      26-A & B, Block-E, Panki, Kalpi Road, Kanpur - 208020
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Serving Etawah with free doorstep collection & towing
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
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8: ETAWAH FAQS (Exact Kanpur Accordion & Help Card)
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
              Etawah Vehicle Scrapping <br className="hidden sm:inline" />
              <span className="text-[#E31E24]">— Questions Owners Ask</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {isHindi
                ? "त्वरित, स्थानीय उत्तर। भारत में स्क्रैपिंग नियमों के सामान्य प्रश्नों के लिए मुख्य अक्सर पूछे जाने वाले प्रश्न देखें।"
                : "Quick, local answers. For general questions about scrapping rules in India, see our main FAQ."}
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
                  <span>Live Etawah Support</span>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#E31E24] flex items-center justify-center mx-auto mb-4 shadow-xs">
                  <Headphones className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-1.5">
                  Still Have Questions?
                </h3>

                <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed mb-6">
                  Our Etawah team is happy to help. Call or WhatsApp us anytime for instant guidance.
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
                    href={cityHeroConfig.whatsappUrl}
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
          SECTION 9: BOTTOM RED CTA BANNER (Exact Kanpur Design)
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
              {/* Left Details */}
              <div className="lg:col-span-7 space-y-4 text-left">
                {/* Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  <span>✦ FAST & FREE VALUATION</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  Your Old Vehicle’s Next Step Starts Here
                </h2>

                {/* Final CTA Supporting Text */}
                <div className="space-y-1 text-white/90 text-sm sm:text-base leading-relaxed max-w-xl">
                  <p className="font-bold text-white">
                    {isHindi ? "अपने पुराने वाहन को स्क्रैप करने के लिए तैयार हैं?" : "Ready to scrap your old vehicle in Etawah?"}
                  </p>
                  <p>
                    {isHindi
                      ? "मुफ्त मूल्यांकन प्राप्त करें, मुफ्त डोरस्टेप पिकअप की व्यवस्था करें और एक RVSF के माध्यम से अधिकृत स्क्रैपिंग पूरी करें। प्रक्रिया पूरी होने के बाद अपना जमा प्रमाणपत्र प्राप्त करें।"
                      : "Get a free valuation, arrange free doorstep pickup and complete authorised scrapping through an RVSF. Receive your Certificate of Deposit once the process is complete."}
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
                    Calculate your vehicle scrap value in just 60 seconds with our official Etawah valuation tool.
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
                      href={cityHeroConfig.whatsappUrl}
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

