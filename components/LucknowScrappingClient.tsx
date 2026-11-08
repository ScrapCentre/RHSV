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

export default function LucknowScrappingClient() {
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

  // City Hero Config for Lucknow
  const cityHeroConfig = {
    titleEn: "Vehicle Scrapping Services in Lucknow",
    titleSubEn: "— Authorised RVSF, Free Doorstep Pickup",
    titleHi: "लखनऊ में वाहन स्क्रैपिंग सेवाएं",
    titleSubHi: "— अधिकृत RVSF, मुफ्त डोरस्टेप पिकअप",
    descriptionEn:
      "An unused or damaged vehicle need not remain a burden. With vehicle scrapping services in Lucknow, ScrapCentre offers free valuation, doorstep pickup, RC cancellation assistance and a Certificate of Deposit through an authorised RVSF.",
    descriptionHi:
      "अप्रयुक्त या क्षतिग्रस्त वाहन अब कोई बोझ नहीं रहेगा। लखनऊ में वाहन स्क्रैपिंग सेवाओं के साथ, स्क्रैपसेंटर मुफ्त मूल्यांकन, डोरस्टेप पिकअप, आरसी रद्दीकरण सहायता और अधिकृत RVSF के माध्यम से जमा प्रमाणपत्र (CoD) प्रदान करता है।",
    trustBadges: [
      { en: "RTO Authorised RVSF", hi: "RTO अधिकृत RVSF" },
      { en: "Instant COD Issued", hi: "तुरंत COD जारी" },
      { en: "Free Doorstep Pickup", hi: "मुफ्त डोरस्टेप पिकअप" },
      { en: "RC Cancellation Support", hi: "RC रद्दीकरण सहायता" },
    ],
    phoneTel: "+919839447733",
    phoneDisplay: "+91-9839447733",
    whatsappUrl:
      "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20have%20a%20vehicle%20to%20scrap%20in%20Lucknow.",
    facilityLocation: "26-A & B, Block-E, Panki, Kalpi Road, Kanpur - 208020 (Serving Lucknow)",
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
        : "Hatchbacks, sedans, SUVs, and luxury vehicles. We offer maximum scrap metal value based on kerb weight and salvageable parts, with authorized de-pollution and official CoD.",
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
        ? "मोटरसाइकिल, स्कूटर और मोपेड। समाप्त आरसी, गैर-चालू या दुर्घटनाग्रस्त बाइक को उचित चेसिस कटिंग और यूपी-32 आरसी रद्दीकरण सहायता के साथ स्क्रैप किया जाता है।"
        : "Motorcycles, scooters, and mopeds. Expired RC, non-running, or accidental bikes scrapped with proper chassis cutting and UP-32 RC cancellation support.",
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
        ? "चाहे वह मालवाहक वाहन हो या मिनी ट्रक, लखनऊ में हमारी ट्रक स्क्रैपिंग सेवा पुराने, क्षतिग्रस्त और अंतिम-जीवन वाहनों को कवर करती है। न चलने वाले वाहनों के लिए टोइंग सहायता भी उपलब्ध है।"
        : "Whether it is a goods carrier or a mini truck, our truck scrapping in Lucknow covers old, damaged and end-of-life vehicles. Towing support is also available for vehicles that cannot run.",
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
        ? "पुरानी बसें जो अब उपयोग के लिए उपयुक्त नहीं हैं, अधिकृत स्क्रैपिंग के लिए एकत्र की जा सकती हैं। लखनऊ में हमारी बस स्क्रैपिंग में स्कूल बसें भी शामिल हैं, जिसमें पिकअप और आवश्यक औपचारिकताओं के लिए सहायता दी जाती है।"
        : "Old buses that are no longer fit for use can be collected for authorised scrapping. Our bus scrapping in Lucknow also covers school buses, with assistance for collection and the required formalities.",
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
        ? "टेम्पो और तिपहिया से लेकर ई-रिक्शा तक, हम पिकअप, दस्तावेज़ीकरण और डी-रजिस्ट्रेशन में सहायता करते हैं। लखनऊ में ऑटो रिक्शा स्क्रैपिंग और ई-रिक्शा स्क्रैपिंग सहायता के लिए संपर्क करें।"
        : "From tempos and three-wheelers to e-rickshaws, we assist with pickup, documentation and deregistration. Get in touch for auto rickshaw scrapping in Lucknow and support with e rickshaw scrapping in Lucknow.",
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
        ? "अप्रयुक्त या क्षतिग्रस्त कृषि वाहनों को भी उचित निपटान की आवश्यकता होती है। लखनऊ में हमारी ट्रैक्टर स्क्रैपिंग सेवा मालिकों को पूरी प्रक्रिया में मदद करती है, जिसमें पात्र कृषि वाहन स्क्रैपिंग शामिल है।"
        : "Unused or damaged farm vehicles need a proper route for disposal too. Our tractor scrapping in Lucknow service helps owners with the process, including eligible agricultural vehicle scrapping in Lucknow.",
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
        ? "व्यवसाय अपने वाहनों के उपयोगी जीवन समाप्त होने पर लखनऊ में फ्लीट वाहन स्क्रैपिंग के लिए संपर्क कर सकते हैं। सरकारी, पुलिस, रक्षा या एम्बुलेंस वाहनों के लिए, लखनऊ में वाणिज्यिक वाहन स्क्रैपिंग के साथ आगे बढ़ने से पहले कृपया हमारी टीम के साथ पात्रता की जांच करें।"
        : "Businesses can contact us about fleet vehicle scrapping in Lucknow when their vehicles reach the end of their usable life. For government, police, defence or ambulance vehicles, please check eligibility with our team before proceeding with commercial vehicle scrapping in Lucknow.",
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
        ? "क्या आपके पास कोई इलेक्ट्रिक वाहन है जो क्षतिग्रस्त, अनुपयोगी या जीवन के अंत पर है? लखनऊ में ईवी स्क्रैपिंग और पात्र ई-रिक्शा सहित इलेक्ट्रिक वाहन स्क्रैपिंग के अधिकृत मार्ग के बारे में हमसे पूछें।"
        : "Have an electric vehicle that is damaged, unused or at the end of its life? Ask us about EV scrapping Lucknow and the appropriate authorised route for electric vehicle scrapping in Lucknow, including eligible e-rickshaws.",
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
        ? "सुनिश्चित नहीं हैं कि आपका वाहन किस श्रेणी में आता है? हमारी टीम से संपर्क करें और हम जांच करेंगे कि क्या यह अधिकृत स्क्रैपिंग के लिए पात्र है।"
        : "Not sure which category your vehicle falls under? Contact our team and we'll check whether it is eligible for authorised scrapping.",
      linkText: isHindi ? "व्हाट्सएप पर पूछें" : "Ask on WhatsApp",
      href: "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20have%20a%20vehicle%20to%20scrap%20in%20Lucknow.",
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
      desc: "Start by sharing your vehicle registration number and pickup locality in Lucknow through our website or WhatsApp. We’ll provide a valuation estimate and confirm your pickup slot on WhatsApp for vehicle scrapping home service Lucknow.",
      descHi:
        "हमारी वेबसाइट या व्हाट्सएप के माध्यम से लखनऊ में अपना वाहन पंजीकरण नंबर और पिकअप इलाका साझा करके शुरुआत करें। हम एक मूल्यांकन अनुमान प्रदान करेंगे और लखनऊ में वाहन स्क्रैपिंग होम सर्विस के लिए व्हाट्सएप पर आपके पिकअप स्लॉट की पुष्टि करेंगे।",
      footerStep: "STEP 01",
    },
    {
      num: "02",
      icon: Truck,
      badge: isHindi ? "मुफ्त पिकअप" : "FREE PICKUP",
      title: isHindi ? "मुफ्त डोरस्टेप पिकअप" : "Free Doorstep Pickup",
      desc: "Once scrapping is confirmed, we arrange free collection from your location. If the vehicle cannot be driven, towing support can be arranged as part of our vehicle collection service in Lucknow.",
      descHi:
        "एक बार स्क्रैपिंग की पुष्टि हो जाने पर, हम आपके स्थान से मुफ्त पिकअप की व्यवस्था करते हैं। यदि वाहन चलाया नहीं जा सकता है, तो लखनऊ में हमारी वाहन संग्रह सेवा के भाग के रूप में टोइंग सहायता की व्यवस्था की जा सकती है।",
      footerStep: "STEP 02",
    },
    {
      num: "03",
      icon: FileText,
      badge: isHindi ? "कागजी कार्रवाई" : "PAPERWORK",
      title: isHindi ? "दस्तावेज और आरसी रद्दीकरण" : "Documents & RC Cancellation",
      desc: "Hand over the required documents so our team can guide you through the necessary formalities. We also assist with vehicle scrapping paperwork Lucknow, including the RC cancellation process.",
      descHi:
        "आवश्यक दस्तावेज सौंपें ताकि हमारी टीम आवश्यक औपचारिकताओं में आपका मार्गदर्शन कर सके। हम लखनऊ में आरसी रद्दीकरण प्रक्रिया सहित वाहन स्क्रैपिंग कागजी कार्रवाई में भी सहायता करते हैं।",
      footerStep: "STEP 03",
    },
    {
      num: "04",
      icon: ShieldCheck,
      badge: isHindi ? "अधिकृत RVSF" : "AUTHORISED RVSF",
      title: isHindi ? "भुगतान और जमा प्रमाणपत्र" : "Payment & Certificate of Deposit",
      desc: "Once your vehicle has been processed at the authorised RVSF, the applicable payment is made and a Certificate of Deposit in Lucknow is issued as official confirmation of scrapping.",
      descHi:
        "एक बार जब आपके वाहन को अधिकृत RVSF में प्रोसेस कर दिया जाता है, तो लागू भुगतान किया जाता है और स्क्रैपिंग की आधिकारिक पुष्टि के रूप में लखनऊ में जमा प्रमाणपत्र (CoD) जारी किया जाता है।",
      footerStep: "STEP 04",
    },
  ]

  // 3. Value Factors Table (Exact 6 factors from prompt)
  const valueFactors = [
    {
      factor: "Vehicle category and weight",
      factorHi: "वाहन श्रेणी और वजन",
      icon: Car,
      whatWeCheck: "The type of vehicle and its overall weight",
      whatWeCheckHi: "वाहन का प्रकार और उसका कुल वजन",
      howItAffects: "The type of vehicle and its overall weight influence its scrap value.",
      howItAffectsHi: "वाहन का प्रकार और उसका कुल वजन इसके स्क्रैप मूल्य को प्रभावित करते हैं।",
    },
    {
      factor: "Make, model and manufacturing year",
      factorHi: "मेक, मॉडल और निर्माण वर्ष",
      icon: Calendar,
      whatWeCheck: "The vehicle’s make, model and manufacturing year",
      whatWeCheckHi: "वाहन का मेक, मॉडल और निर्माण वर्ष",
      howItAffects: "The vehicle’s make, model and year help establish its specifications and age.",
      howItAffectsHi: "वाहन का मेक, मॉडल और वर्ष इसके विनिर्देशों और आयु को स्थापित करने में मदद करते हैं।",
    },
    {
      factor: "Current condition",
      factorHi: "वर्तमान स्थिति",
      icon: Key,
      whatWeCheck: "Physical condition and extent of damage",
      whatWeCheckHi: "भौतिक स्थिति और क्षति की सीमा",
      howItAffects: "Its physical condition and the extent of damage are considered during valuation.",
      howItAffectsHi: "मूल्यांकन के दौरान इसकी भौतिक स्थिति और क्षति की सीमा पर विचार किया जाता है।",
    },
    {
      factor: "Parts and completeness",
      factorHi: "पुर्जे और पूर्णता",
      icon: Link2,
      whatWeCheck: "Presence of major components like engine, battery, catalytic converter",
      whatWeCheckHi: "इंजन, बैटरी, कैटेलिटिक कनवर्टर जैसे प्रमुख घटकों की उपस्थिति",
      howItAffects: "Whether major components and parts are present can affect the assessment.",
      howItAffectsHi: "क्या प्रमुख घटक और पुर्जे मौजूद हैं, यह मूल्यांकन को प्रभावित कर सकता है।",
    },
    {
      factor: "Prevailing scrap-metal rates",
      factorHi: "प्रचलित स्क्रैप धातु दरें",
      icon: IndianRupee,
      whatWeCheck: "Current market rates for recovered iron, steel, aluminium and copper",
      whatWeCheckHi: "पुनर्प्राप्त लोहा, स्टील, एल्युमीनियम और तांबे के लिए वर्तमान बाजार दरें",
      howItAffects: "Market rates for the metals recovered from the vehicle can influence the quote.",
      howItAffectsHi: "वाहन से पुनर्प्राप्त धातुओं की बाजार दरें उद्धरण को प्रभावित कर सकती हैं।",
    },
    {
      factor: "Documents and ownership details",
      factorHi: "दस्तावेज और स्वामित्व विवरण",
      icon: FileText,
      whatWeCheck: "Available vehicle documents and ownership verification",
      whatWeCheckHi: "उपलब्ध वाहन दस्तावेज और स्वामित्व सत्यापन",
      howItAffects: "Available documents and clear ownership details help verify the vehicle for processing.",
      howItAffectsHi: "उपलब्ध दस्तावेज और स्पष्ट स्वामित्व विवरण प्रसंस्करण के लिए वाहन को सत्यापित करने में मदद करते हैं।",
    },
  ]

  // 4. Lucknow Localities (Exact 12 from prompt)
  const lucknowAreas = [
    "Alambagh",
    "Amausi",
    "Chinhat",
    "Gomti Nagar",
    "Aliganj",
    "Indira Nagar",
    "Mahanagar",
    "Jankipuram",
    "Rajajipuram",
    "Vrindavan Yojna",
    "Ashiyana",
    "Hazratganj",
  ]

  // 5. FAQs (Exact 8 from prompt)
  const faqItems = [
    {
      q: "Where does ScrapCentre process vehicles collected from Lucknow?",
      qHi: "स्क्रैपसेंटर लखनऊ से एकत्र किए गए वाहनों को कहाँ प्रोसेस करता है?",
      a: "ScrapCentre serves as an authorised vehicle scrapping center in Lucknow, with free doorstep pickup across the city. Collected vehicles are processed at our authorised RVSF at 26-A & B, Block-E, Panki, Kalpi Road, Kanpur. Share your vehicle number online or through WhatsApp to get started.",
      aHi: "स्क्रैपसेंटर लखनऊ में एक अधिकृत वाहन स्क्रैपिंग केंद्र के रूप में कार्य करता है, जिसमें पूरे शहर में मुफ्त डोरस्टेप पिकअप शामिल है। एकत्र किए गए वाहनों को 26-A & B, ब्लॉक-E, पनकी, कालपी रोड, कानपुर स्थित हमारे अधिकृत RVSF में प्रोसेस किया जाता है। शुरुआत करने के लिए अपना वाहन नंबर ऑनलाइन या व्हाट्सएप पर साझा करें।",
    },
    {
      q: "Does ScrapCentre have government authorisation for vehicle scrapping?",
      qHi: "क्या स्क्रैपसेंटर के पास वाहन स्क्रैपिंग के लिए सरकारी प्राधिकरण है?",
      a: "Yes. ScrapCentre operates an RTO-authorised RVSF that processes eligible vehicles and issues a Certificate of Deposit (CoD). For government authorized RVSF Lucknow services, vehicles collected from Lucknow are taken to our authorised facility in Kanpur for processing.",
      aHi: "हाँ। स्क्रैपसेंटर एक RTO-अधिकृत RVSF संचालित करता है जो पात्र वाहनों को संसाधित करता है और जमा प्रमाणपत्र (CoD) जारी करता है। सरकार द्वारा अधिकृत RVSF लखनऊ सेवाओं के लिए, लखनऊ से एकत्र किए गए वाहनों को प्रसंस्करण के लिए कानपुर में हमारी अधिकृत सुविधा में ले जाया जाता है।",
    },
    {
      q: "Can you arrange vehicle pickup in my part of Lucknow?",
      qHi: "क्या आप लखनऊ के मेरे इलाके में वाहन पिकअप की व्यवस्था कर सकते हैं?",
      a: "We cover several parts of the city, including Alambagh, Amausi, Chinhat, Gomti Nagar, Aliganj, Indira Nagar, Mahanagar, Jankipuram, Rajajipuram, Vrindavan Yojna, Ashiyana and Hazratganj. If you're looking for vehicle scrapping services in Alambagh, Lucknow or another area not listed, message us to check availability.",
      aHi: "हम आलमबाग, अमौसी, चिनहट, गोमती नगर, अलीगंज, इंदिरा नगर, महानगर, जानकीपुरम, राजाजीपुरम, वृंदावन योजना, आशियाना और हज़रतगंज सहित शहर के कई हिस्सों को कवर करते हैं। यदि आप आलमबाग, लखनऊ या किसी अन्य गैर-सूचीबद्ध क्षेत्र में वाहन स्क्रैपिंग सेवाओं की तलाश कर रहे हैं, तो उपलब्धता की जांच के लिए हमें संदेश भेजें।",
    },
    {
      q: "Are trucks, buses and commercial vehicles accepted for scrapping?",
      qHi: "क्या स्क्रैपिंग के लिए ट्रक, बस और वाणिज्यिक वाहन स्वीकार किए जाते हैं?",
      a: "Yes. We handle eligible old, damaged and end-of-life trucks, buses and commercial vehicles. Our truck scrapping and bus scrapping in Lucknow services also include towing support for vehicles that cannot run. Contact us with the vehicle details to check eligibility for commercial vehicle scrapping in Lucknow.",
      aHi: "हाँ। हम पात्र पुराने, क्षतिग्रस्त और अंतिम-जीवन ट्रकों, बसों और वाणिज्यिक वाहनों को संभालते हैं। लखनऊ में हमारी ट्रक स्क्रैपिंग और बस स्क्रैपिंग सेवाओं में न चलने वाले वाहनों के लिए टोइंग सहायता भी शामिल है। लखनऊ में वाणिज्यिक वाहन स्क्रैपिंग की पात्रता जांचने के लिए वाहन विवरण के साथ हमसे संपर्क करें।",
    },
    {
      q: "What is the process for scrapping an auto-rickshaw or e-rickshaw?",
      qHi: "ऑटो-रिक्शा या ई-रिक्शा स्क्रैप करने की क्या प्रक्रिया है?",
      a: "Old or unfit auto-rickshaws and e-rickshaws may be processed through the appropriate authorised route. If you need auto rickshaw scrapping or e rickshaw scrapping in Lucknow, share your vehicle details with our team so we can check its eligibility.",
      aHi: "पुराने या अनफिट ऑटो-रिक्शा और ई-रिक्शा को उपयुक्त अधिकृत मार्ग से प्रोसेस किया जा सकता है। यदि आपको लखनऊ में ऑटो रिक्शा स्क्रैपिंग या ई-रिक्शा स्क्रैपिंग की आवश्यकता है, तो हमारी टीम के साथ अपने वाहन का विवरण साझा करें ताकि हम इसकी पात्रता की जांच कर सकें।",
    },
    {
      q: "What factors affect the scrap value of a vehicle in Lucknow?",
      qHi: "लखनऊ में किसी वाहन के स्क्रैप मूल्य को कौन से कारक प्रभावित करते हैं?",
      a: "The vehicle scrap price in Lucknow depends on the vehicle's category, weight, age, condition, completeness and prevailing scrap-metal rates. You can request a free vehicle valuation in Lucknow from ScrapCentre without any obligation to proceed.",
      aHi: "लखनऊ में वाहन स्क्रैप मूल्य वाहन की श्रेणी, वजन, आयु, स्थिति, पूर्णता और प्रचलित स्क्रैप-धातु दरों पर निर्भर करता है। आप आगे बढ़ने के किसी भी दायित्व के बिना स्क्रैपसेंटर से लखनऊ में मुफ्त वाहन मूल्यांकन का अनुरोध कर सकते हैं।",
    },
    {
      q: "Will ScrapCentre help with my vehicle's RC cancellation?",
      qHi: "क्या स्क्रैपसेंटर मेरे वाहन के आरसी रद्दीकरण में मदद करेगा?",
      a: "Yes. Our team guides you through the required paperwork and supports vehicle registration cancellation in Lucknow as part of the scrapping process. We also explain the vehicle scrapping RC requirements and confirm which documents you need to provide.",
      aHi: "हाँ। हमारी टीम आवश्यक कागजी कार्रवाई में आपका मार्गदर्शन करती है और स्क्रैपिंग प्रक्रिया के भाग के रूप में लखनऊ में वाहन पंजीकरण रद्दीकरण का समर्थन करती है। हम वाहन स्क्रैपिंग आरसी आवश्यकताओं की भी व्याख्या करते हैं और पुष्टि करते हैं कि आपको कौन से दस्तावेज प्रदान करने की आवश्यकता है।",
    },
    {
      q: "Where can car and bike owners find the relevant scrapping details?",
      qHi: "कार और बाइक मालिक प्रासंगिक स्क्रैपिंग विवरण कहाँ पा सकते हैं?",
      a: "We have separate pages explaining the process for each category. Owners can visit our four-wheeler scrapping page or two-wheeler scrapping page for category-specific information. Both follow the authorised RVSF process.",
      aHi: "हमारे पास प्रत्येक श्रेणी के लिए प्रक्रिया की व्याख्या करने वाले अलग-अलग पृष्ठ हैं। मालिक श्रेणी-विशिष्ट जानकारी के लिए हमारे चार पहिया स्क्रैपिंग पेज या दोपहिया स्क्रैपिंग पेज पर जा सकते हैं। दोनों अधिकृत RVSF प्रक्रिया का पालन करते हैं।",
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
        {/* Kanpur Hero Background Car Image (from public/Locationimg/kanpurbg.png) */}
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
              <span>{isHindi ? "वाहन स्क्रैपिंग सेवाएं लखनऊ" : "Vehicle Scrapping Services Lucknow"}</span>
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
                  : "MoRTH registered authorised RVSF facility processing Lucknow vehicles with certified scrapping",
              },
              {
                num: "02",
                icon: Truck,
                title: isHindi ? "मुफ्त डोरस्टेप पिकअप" : "Free Doorstep Pickup",
                desc: isHindi
                  ? "आलमबाग और गोमती नगर सहित पूरे लखनऊ में डोरस्टेप टोइंग और सुरक्षित कलेक्शन"
                  : "Doorstep towing and flatbed collection across all Lucknow localities including Alambagh & Gomti Nagar",
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
                      <p className="text-xs text-slate-500 font-medium">Lucknow pickup & paperwork support</p>
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
                        <div className="text-sm font-black text-slate-900">Chat with Lucknow Specialist</div>
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
          SECTION 2: AUTHORISED VEHICLE SCRAPPING IN LUCKNOW (Exact Kanpur Layout)
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
              {/* Category Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
                <span>SCRAPPING IN LUCKNOW</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-2xl sm:text-3xl lg:text-[27px] xl:text-[31px] font-black text-slate-900 tracking-tight leading-[1.25]">
                {isHindi
                  ? "लखनऊ में सभी वाहन प्रकारों के लिए अधिकृत वाहन स्क्रैपिंग सेवाएं"
                  : "Authorised Vehicle Scrapping Services in Lucknow for All Vehicle Types"} <br className="hidden sm:inline" />
                <span className="text-[#E31E24]">
                  {isHindi
                    ? "— वाहन स्क्रैपिंग, मालिकों के लिए आसान"
                    : "— Vehicle Scrapping in Lucknow, Made Simple for Owners"}
                </span>
              </h2>

              {/* Introduction Paragraphs */}
              <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                <p>
                  {isHindi
                    ? "स्क्रैपसेंटर लखनऊ में एक अधिकृत वाहन स्क्रैपिंग कंपनी (authorised vehicle scrapping company in Lucknow) के माध्यम से व्यक्तियों और व्यवसायों को उनके पुराने, क्षतिग्रस्त, या जीवन समाप्त वाहनों को स्क्रैप करने में मदद करता है। हम पूरे शहर से वाहन एकत्र करते हैं और उन्हें कानपुर में हमारे अधिकृत RVSF में प्रोसेस करते हैं। एक पंजीकृत वाहन स्क्रैपिंग सुविधा (registered vehicle scrapping facility Lucknow) एक सरकार द्वारा अनुमोदित केंद्र है जो जीवन के अंत वाले वाहनों को संसाधित करता है और जमा प्रमाणपत्र (CoD) जारी करता है। चूँकि लखनऊ एक बड़ी राज्य की राजधानी है, हमारी पिकअप सेवा इसकी सभी आवासीय और व्यावसायिक कॉलोनियों को कवर करती है।"
                    : "ScrapCentre helps individuals and businesses scrap their old, damaged, or end-of-life vehicles through an authorised vehicle scrapping company in Lucknow. We collect vehicles from across the city and process them at our authorised RVSF in Kanpur. A registered vehicle scrapping facility is a government-approved centre that processes end-of-life vehicles and issues a Certificate of Deposit (CoD). As Lucknow is a large state capital, our pickup service covers its residential and commercial colonies."}
                </p>
                <p>
                  {isHindi ? (
                    <>
                      लखनऊ में अधिकृत वाहन स्क्रैपिंग (authorised vehicle scrapping in Lucknow) के साथ, आप एक ही सेवा के माध्यम से मुफ्त वाहन मूल्यांकन, मुफ्त डोरस्टेप पिकअप और आरसी रद्दीकरण में सहायता प्राप्त कर सकते हैं। वाहनों को लखनऊ में अधिकृत RVSF प्रक्रिया के तहत संसाधित किया जाता है। अधिक जानकारी के लिए, हमारे{" "}
                      <Link
                        href="/hi/vehicle-scrapping-services"
                        className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                      >
                        भारत में वाहन स्क्रैपिंग सेवाएं
                      </Link>{" "}
                      पेज पर जाएं। कार या बाइक स्क्रैप करने के इच्छुक मालिक लखनऊ में हमारे समर्पित चार पहिया और दोपहिया स्क्रैपिंग पेज देख सकते हैं।
                    </>
                  ) : (
                    <>
                      With authorised vehicle scrapping in Lucknow, you can get a free vehicle valuation, free doorstep pickup, and support with RC cancellation through one service. Vehicles are processed through a government-authorized RVSF in Lucknow. For more details, visit our{" "}
                      <Link
                        href="/vehicle-scrapping-services"
                        className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                      >
                        vehicle scrapping services
                      </Link>{" "}
                      in India page. Owners looking to scrap cars or bikes can visit our dedicated four-wheeler scrapping and two-wheeler scrapping in Lucknow pages.
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
                      ? "निजी और व्यावसायिक वाहनों के लिए यूपी-32 आरसी रद्दीकरण सहायता"
                      : "UP-32 RC cancellation & doorstep towing support"}
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

            {/* Right Card: Facility Info & Quick Contact (Exact Kanpur Design) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 overflow-hidden text-left">
                <div className="h-1.5 w-full bg-gradient-to-r from-[#E31E24] via-rose-500 to-[#E31E24]" />

                <div className="p-5 sm:p-6 bg-slate-900 text-white">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#E31E24] text-white text-[10px] font-black uppercase tracking-wider mb-2">
                    AUTHORISED RVSF
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Serving Lucknow Vehicle Owners
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Free doorstep pickup from Lucknow & processing at our authorised Kanpur RVSF
                  </p>
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  {/* FACILITY ADDRESS */}
                  <div className="p-3.5 hover:bg-slate-50/70 rounded-2xl transition-colors">
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                          FACILITY ADDRESS
                        </div>
                        <div className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug">
                          26-A & B, Block-E, Panki, Kalpi Road, Kanpur - 208020
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Serving Lucknow with free doorstep collection & towing
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
                              href={cityHeroConfig.whatsappUrl}
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
                    <div className="text-xs font-black text-slate-900 leading-tight">Need Help in Lucknow?</div>
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
          SECTION 3: VEHICLE TYPES (Exact Kanpur 3x3 Grid with special other)
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
              <span>VEHICLE TYPES WE COLLECT IN LUCKNOW</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[30px] xl:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              <span className="block">
                {isHindi
                  ? "लखनऊ में अधिकृत स्क्रैपिंग के लिए हम जो वाहन प्रकार एकत्र करते हैं"
                  : "Vehicle Types We Collect for Authorised Scrapping in Lucknow"}
              </span>
              <span className="text-[#E31E24] block">
                {isHindi ? "— सभी वाहन श्रेणियों के लिए" : "— Every Vehicle Type, One Team"}
              </span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {isHindi
                ? "हम माल वाहकों और सार्वजनिक परिवहन से लेकर कृषि, वाणिज्यिक और इलेक्ट्रिक वाहनों तक विभिन्न प्रकार के वाहनों को संभालते हैं। प्रत्येक पात्र वाहन को मूल्यांकन, पिकअप सहायता और एक अधिकृत RVSF के माध्यम से प्रसंस्करण प्राप्त होता है। कार और बाइक के मालिक नीचे उनके समर्पित सेवा पृष्ठों पर जा सकते हैं।"
                : "We handle a range of vehicles, from goods carriers and public transport to agricultural, commercial and electric vehicles. Each eligible vehicle gets a valuation, pickup support and processing through an authorised RVSF. Car and bike owners can visit their dedicated service pages below."}
            </p>
          </div>

          {/* 3 x 3 Responsive Grid */}
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
                  className={`group relative bg-white rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 overflow-hidden text-left ${
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
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: RED NOTIFICATION BAR (Exact Kanpur Design)
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
                Check Lucknow Pickup Availability
              </h3>
              <p className="text-xs sm:text-sm text-red-100 font-normal">
                Average pickup scheduled within 24 hours across all Lucknow residential & commercial zones
              </p>
            </div>

            <a
              href={cityHeroConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black hover:bg-slate-900 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <span>Check on WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: 4-STEP SCRAPPING PROCESS (Exact Kanpur Design)
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
              <span>PICKUP TO COD • 4 SIMPLE STAGES</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              {isHindi
                ? "लखनऊ में अपने वाहन को कैसे स्क्रैप करें: चार चरणों की प्रक्रिया"
                : "How to Scrap Your Vehicle in Lucknow: A Four-Step Process"}{" "}
              <br className="hidden sm:inline" />
              <span className="text-[#E31E24]">
                {isHindi
                  ? "— पहली पूछताछ से लेकर अंतिम प्रमाण पत्र तक"
                  : "— From Enquiry to Final Certificate of Deposit"}
              </span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {isHindi ? (
                <>
                  अपने वाहन को स्क्रैप करने में पहली पूछताछ से लेकर अंतिम प्रमाण पत्र तक चार प्रमुख चरण शामिल हैं। हमारी टीम प्रत्येक चरण में आपका मार्गदर्शन करती है। व्यापक अवलोकन के लिए हमारी{" "}
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
                  Scrapping your vehicle involves four key stages, from the first enquiry to the final certificate. Our team guides you through each step. Read our{" "}
                  <Link
                    href="/vehicle-scrapping-services"
                    className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                  >
                    vehicle scrapping guide
                  </Link>{" "}
                  for a broader overview.
                </>
              )}
            </p>
          </div>

          {/* 4 Compact Cards Grid */}
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
                  className="group relative bg-white border border-slate-200/80 hover:border-[#E31E24] rounded-2xl p-4 sm:p-4.5 lg:p-5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:shadow-red-500/8 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden text-left"
                >
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
          SECTION 6: DOCUMENTS & RC CANCELLATION (Exact Kanpur Design with Dark Checklist Card)
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
              {isHindi
                ? "लखनऊ में वाहन स्क्रैपिंग के लिए तैयार रखने योग्य दस्तावेज"
                : "Documents to Keep Ready for Vehicle Scrapping in Lucknow"}{" "}
              <br className="hidden sm:inline" />
              <span className="text-[#E31E24]">
                {isHindi ? "— आरसी रद्दीकरण और कागजी कार्रवाई" : "— Clear Documentation, Hassle-Free Transfer"}
              </span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {isHindi
                ? "अपने वाहन को सौंपने से पहले, लखनऊ में बुनियादी वाहन स्क्रैपिंग दस्तावेज तैयार रखें। हमारी टीम स्क्रैपिंग प्रक्रिया के हिस्से के रूप में आवश्यक कागजी कार्रवाई और लखनऊ में वाहन पंजीकरण रद्दीकरण में मदद करती है।"
                : "Before handing over your vehicle, keep the basic vehicle scrapping documents in Lucknow ready. Our team helps with the required paperwork and vehicle registration cancellation in Lucknow as part of the scrapping process."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            {/* Left 3 Guidance Cards */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-4">
              {/* Card 1: Car or bike? */}
              <div className="group relative bg-white border border-slate-200/80 hover:border-[#E31E24] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-xl hover:shadow-red-500/8 transition-all duration-300 hover:-translate-y-1 flex items-start gap-4 overflow-hidden text-left">
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
                        श्रेणी-विशिष्ट दस्तावेज़ आवश्यकताओं के लिए, हमारे{" "}
                        <Link
                          href="/hi/know-your-valuation"
                          className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                        >
                          चार पहिया (फोर-व्हीलर)
                        </Link>{" "}
                        और{" "}
                        <Link
                          href="/hi/know-your-valuation"
                          className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                        >
                          दोपहिया (टू-व्हीलर)
                        </Link>{" "}
                        स्क्रैपिंग गाइड देखें।
                      </>
                    ) : (
                      <>
                        For category-specific document requirements, refer to our guides for{" "}
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

              {/* Card 2: RC or insurance missing? */}
              <div className="group relative bg-white border border-slate-200/80 hover:border-[#E31E24] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-xl hover:shadow-red-500/8 transition-all duration-300 hover:-translate-y-1 flex items-start gap-4 overflow-hidden text-left">
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
                        दस्तावेजों का गायब होना यह नहीं दर्शाता कि आपको रुक जाना चाहिए। विकल्पों की जांच के लिए हमसे संपर्क करें; स्वामित्व और वाहन श्रेणी के आधार पर अतिरिक्त दस्तावेजों की आवश्यकता हो सकती है। हमारी टीम से वाहन स्क्रैपिंग आरसी लखनऊ के बारे में पूछें।
                      </>
                    ) : (
                      <>
                        Missing paperwork does not mean you should stop here. Contact us to check the options; additional documents may be needed based on ownership and vehicle category. Ask our team about vehicle scrapping RC Lucknow.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Card 3: Need the full checklist? */}
              <div className="group relative bg-white border border-slate-200/80 hover:border-[#E31E24] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-xl hover:shadow-red-500/8 transition-all duration-300 hover:-translate-y-1 flex items-start gap-4 overflow-hidden text-left">
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
                        अपने वाहन के लिए आवश्यक दस्तावेजों में सहायता के लिए व्हाट्सएप पर हमारी टीम से संपर्क करें।
                      </>
                    ) : (
                      <>
                        Get in touch with our team on WhatsApp for help with the documents required for your vehicle.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card: Dark Checklist Card (Exact Kanpur Design) */}
            <div className="lg:col-span-5">
              <div className="bg-slate-950 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full text-left">
                <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-[#E31E24] via-rose-500 to-[#E31E24]" />
                <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#E31E24] text-white text-[10px] font-black uppercase tracking-wider">
                      CHECKLIST
                    </span>
                    <span className="text-xs font-bold text-slate-400">RVSF Lucknow</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white mb-6 tracking-tight">
                    Basic documents to keep ready
                  </h3>

                  <ul className="space-y-3.5 mb-8 text-left">
                    {[
                      "Registration Certificate (RC) / Original Smart Card",
                      "ID & address proof of the registered owner (Aadhaar / PAN)",
                      "Cancelled cheque or bank account details for direct payment",
                      "Financier NOC / Form 35 (if vehicle has active loan)",
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
                  href={cityHeroConfig.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all w-full cursor-pointer"
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
          SECTION 7: WHAT DETERMINES YOUR VEHICLE'S SCRAP VALUE IN LUCKNOW? (Exact Kanpur Table Design)
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
              {isHindi
                ? "लखनऊ में आपके वाहन का स्क्रैप मूल्य क्या निर्धारित करता है?"
                : "What Determines Your Vehicle’s Scrap Value in Lucknow?"}{" "}
              <br className="hidden sm:inline" />
              <span className="text-[#E31E24]">
                {isHindi ? "— 6 मुख्य मूल्यांकन कारक" : "— Six Factors, Explained"}
              </span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
              {isHindi ? (
                <>
                  एक वाहन का कोट उसकी आयु या वजन से कहीं अधिक पर निर्भर करता है। ये छह कारक लखनऊ में वाहन स्क्रैप मूल्य (vehicle scrap price in Lucknow) निर्धारित करने में मदद करते हैं, जिसके विवरण के आधार पर{" "}
                  <Link
                    href="/hi/know-your-valuation"
                    className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                  >
                    वाहन स्क्रैपिंग मूल्यांकन
                  </Link>{" "}
                  किया जाता है।
                </>
              ) : (
                <>
                  A vehicle’s quote depends on more than its age or weight. These six factors help determine the vehicle scrap price in Lucknow, with a{" "}
                  <Link
                    href="/know-your-valuation"
                    className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                  >
                    vehicle scrapping valuation
                  </Link>{" "}
                  based on its individual details.
                </>
              )}
            </p>
          </div>

          {/* Responsive Valuation Factors Table (Exact Kanpur Structure) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-700 font-black text-[10px] sm:text-xs uppercase tracking-wider">
                    <th className="py-3 px-3 sm:py-4 sm:px-6 w-[28%] sm:w-[25%]">
                      {isHindi ? "मूल्यांकन कारक (Valuation Factor)" : "VALUATION FACTOR"}
                    </th>
                    <th className="py-3 px-2.5 sm:py-4 sm:px-6 w-[34%] sm:w-[35%]">
                      {isHindi ? "हम क्या जांचते हैं" : "WHAT WE CHECK"}
                    </th>
                    <th className="py-3 px-2.5 sm:py-4 sm:px-6 w-[38%] sm:w-[40%]">
                      {isHindi ? "इसका क्या अर्थ है (What it means)" : "WHAT IT MEANS"}
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
              {isHindi
                ? "यह समझने के लिए कि आपका वाहन क्या मूल्य का हो सकता है, स्क्रैपसेंटर से लखनऊ में मुफ्त वाहन मूल्यांकन प्राप्त करें।"
                : "Get a free vehicle valuation in Lucknow from ScrapCentre to understand what your vehicle may be worth."}
            </span>
          </div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8: DOORSTEP VEHICLE PICKUP ACROSS LUCKNOW (Exact Kanpur Layout: Pills + Facility Card)
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
                <span>WHERE WE OPERATE • LUCKNOW HUBS</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25]">
                {isHindi
                  ? "पूरे लखनऊ में डोरस्टेप वाहन पिकअप"
                  : "Doorstep Vehicle Pickup Across Lucknow"}{" "}
                <br className="hidden sm:inline" />
                <span className="text-[#E31E24]">
                  {isHindi ? "— आलमबाग, अमौसी, गोमती नगर और अन्य" : "— Alambagh, Amausi, Gomti Nagar & More"}
                </span>
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {isHindi ? (
                  <>
                    <Link
                      href="/"
                      className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                    >
                      स्क्रैपसेंटर
                    </Link>{" "}
                    आलमबाग और अमौसी सहित नीचे सूचीबद्ध अन्य इलाकों को कवर करते हुए पूरे लखनऊ में वाहन पिकअप की व्यवस्था करता है। क्या आप आलमबाग, या अमौसी, लखनऊ में वाहन स्क्रैपिंग सेवाओं की तलाश कर रहे हैं? यदि आपका क्षेत्र नीचे सूचीबद्ध नहीं है, तो पिकअप उपलब्धता की जांच के लिए बस हमें{" "}
                    <a
                      href={cityHeroConfig.whatsappUrl}
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
                    <Link
                      href="/"
                      className="text-[#E31E24] hover:underline font-bold decoration-red-300 underline-offset-4"
                    >
                      ScrapCentre
                    </Link>{" "}
                    arranges vehicle pickup across Lucknow, covering areas such as Alambagh and Amausi, along with the other localities listed below. Looking for vehicle scrapping services in Alambagh, or Amausi, Lucknow? If your area isn’t listed below, message us on{" "}
                    <a
                      href={cityHeroConfig.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E31E24] hover:underline font-bold"
                    >
                      WhatsApp
                    </a>{" "}
                    to check pickup availability.
                  </>
                )}
              </p>

              <div>
                <div className="text-slate-500 text-[11px] font-black uppercase tracking-wider flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#E31E24]"></span>
                  <span>12 ACTIVE LUCKNOW PICKUP ZONES</span>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {lucknowAreas.map((area, idx) => (
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
                Outside Lucknow? See all service areas on our{" "}
                <Link
                  href="/vehicle-scrapping-services"
                  className="text-[#E31E24] font-bold underline decoration-red-300 underline-offset-4 hover:text-red-700"
                >
                  vehicle scrapping services
                </Link>{" "}
                page.
              </p>
            </div>

            {/* Right Facility Card: Visit us / Serving Lucknow (Exact Kanpur Design) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-7 text-left relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-slate-300">
                <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-[#E31E24] via-rose-500 to-[#E31E24]" />

                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-base sm:text-lg font-black text-slate-900">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E31E24] flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>Authorised RVSF Location</span>
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
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Serving Lucknow with free doorstep collection & towing
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
          SECTION 9: FAQS (Exact Kanpur 2-Column Layout with Sticky Help Card)
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
              {isHindi
                ? "लखनऊ वाहन स्क्रैपिंग: अक्सर पूछे जाने वाले प्रश्न"
                : "Lucknow Vehicle Scrapping: Frequently Asked Questions"}{" "}
              <br className="hidden sm:inline" />
              <span className="text-[#E31E24]">
                {isHindi ? "— आपके सभी सवालों के स्पष्ट जवाब" : "— Questions Owners Ask"}
              </span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {isHindi
                ? "त्वरित, स्थानीय उत्तर। स्क्रैपिंग प्रक्रिया और कागजी कार्रवाई के संबंध में अक्सर पूछे जाने वाले प्रश्न।"
                : "Quick, local answers. For general questions about scrapping rules in Lucknow, see the answers below."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left FAQs Accordion (Single-Open by Default, Exact Kanpur Styling) */}
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

            {/* Right Help Card: Still Have Questions? (Exact Kanpur Sticky Card) */}
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
                  <span>Live Lucknow Support</span>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#E31E24] flex items-center justify-center mx-auto mb-4 shadow-xs">
                  <Headphones className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-1.5">
                  Still Have Questions?
                </h3>

                <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed mb-6">
                  Our team is happy to help with your Lucknow vehicle scrapping. Call or WhatsApp us anytime for instant guidance.
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
          SECTION 10: BOTTOM RED CTA BANNER WITH RIGHT WHITE BOX (Exact Kanpur Design)
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
                  {isHindi
                    ? "क्या आप अपने पुराने वाहन को एक नई दिशा देने के लिए तैयार हैं?"
                    : "Ready to Give Your Old Vehicle a New Direction?"}
                </h2>

                {/* Final CTA Supporting Text */}
                <div className="space-y-1 text-white/90 text-sm sm:text-base leading-relaxed max-w-xl">
                  <p className="font-bold text-white">
                    {isHindi ? "आज ही लखनऊ में अपनी वाहन स्क्रैपिंग यात्रा शुरू करें।" : "Start your vehicle scrapping journey in Lucknow today."}
                  </p>
                  <p>
                    {isHindi
                      ? "स्क्रैपसेंटर के अधिकृत RVSF के माध्यम से मुफ्त मूल्यांकन, मुफ्त डोरस्टेप पिकअप और अपना जमा प्रमाणपत्र (CoD) प्राप्त करें।"
                      : "Get a free valuation, free doorstep pickup and your Certificate of Deposit through ScrapCentre’s authorised RVSF."}
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

              {/* Right Quick Valuation Box (Exact Kanpur Design) */}
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
                    Calculate your vehicle scrap value in just 60 seconds with our official Lucknow valuation tool.
                  </p>

                  <div className="space-y-3">
                    <Link
                      href="/know-your-valuation"
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-[#E31E24] hover:bg-[#C5161C] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-500/25 transition-all active:scale-95 text-center cursor-pointer"
                    >
                      <span>Get Free Valuation</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <a
                      href={cityHeroConfig.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-95 text-center cursor-pointer"
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
