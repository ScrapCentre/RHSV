"use client"

import React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Car,
  ShieldCheck,
  Truck,
  FileText,
  Bike,
  MapPin,
  Calendar,
  Key,
  Link2,
  IndianRupee,
} from "lucide-react"
import VehicleCategoryTemplate, {
  VehicleCategoryPageConfig,
} from "./VehicleCategoryTemplate"

interface FourWheelerKanpurClientProps {
  isHindi?: boolean
}

export default function FourWheelerKanpurClient({ isHindi: isHindiProp }: FourWheelerKanpurClientProps) {
  const params = useParams()
  const isHindi = isHindiProp !== undefined ? isHindiProp : params?.locale === "hi"

  const fourWheelerKanpurConfig: VehicleCategoryPageConfig = {
    hero: {
      bgImage: "/Locationimg/fourwheeler.png",
      categoryBadge: {
        en: "Kanpur · Four-Wheeler Scrapping",
        hi: "कानपुर · फोर-व्हीलर स्क्रैपिंग",
      },
      categoryBadgeIcon: MapPin,
      h1Line1: {
        en: "Car Scrapping in Kanpur —",
        hi: "कानपुर में कार स्क्रैपिंग —",
      },
      h1Line2: {
        en: "Four-Wheeler Scrapping, Free Doorstep Pickup",
        hi: "फोर-व्हीलर स्क्रैपिंग, मुफ्त डोरस्टेप पिकअप",
      },
      supportingText: {
        en: "Scrap an old, damaged or end-of-life car, SUV or hatchback in Kanpur through an authorised RVSF; free valuation; free doorstep pickup; Certificate of Deposit; RC cancellation and paperwork support.",
        hi: "कानपुर में एक अधिकृत RVSF के माध्यम से पुरानी, क्षतिग्रस्त या जीवन-समाप्त कार, एसयूवी या हैचबैक को स्क्रैप करें; मुफ्त मूल्यांकन; मुफ्त डोरस्टेप पिकअप; जमा प्रमाणपत्र (COD); आरसी रद्दीकरण और कागजी कार्रवाई सहायता।",
      },
      trustBadges: [
        { en: "RTO Authorised RVSF", hi: "RTO अधिकृत RVSF" },
        { en: "Instant COD Issued", hi: "तुरंत COD जारी" },
        { en: "Free Doorstep Pickup", hi: "मुफ्त डोरस्टेप पिकअप" },
        { en: "RC Cancellation Support", hi: "RC रद्दीकरण सहायता" },
      ],
      primaryCtaText: {
        en: "Get Free Valuation",
        hi: "मुफ्त मूल्यांकन प्राप्त करें",
      },
      secondaryCtaText: {
        en: "Scrap My Car",
        hi: "मेरी कार स्क्रैप करें",
      },
      valuationLink: "/know-your-valuation?type=four-wheeler",
      advantageCards: [
        {
          num: "01",
          icon: ShieldCheck,
          title: { en: "Authorised RVSF", hi: "अधिकृत RVSF" },
          desc: {
            en: "Panki, Kanpur facility registered under MoRTH guidelines with certified eco-friendly dismantling and official UP-78 RTO cancellation.",
            hi: "MoRTH दिशानिर्देशों के तहत पंजीकृत पनकी, कानपुर सुविधा, पर्यावरण-अनुकूल निष्कासन और आधिकारिक UP-78 आरसी रद्दीकरण के साथ।",
          },
        },
        {
          num: "02",
          icon: Truck,
          title: { en: "Free Doorstep Pickup", hi: "मुफ्त डोरस्टेप पिकअप" },
          desc: {
            en: "Zero-cost hydraulic flatbed car collection and towing across all Kanpur postal zones, scheduled at your convenience.",
            hi: "सभी कानपुर क्षेत्रों में शून्य लागत पर हाइड्रोलिक फ्लैटबेड कार पिकअप और टोइंग, आपकी सुविधानुसार तय समय पर।",
          },
        },
        {
          num: "03",
          icon: FileText,
          title: { en: "Instant COD Issued", hi: "तुरंत COD जारी" },
          desc: {
            en: "Official deposit certificate issued via Parivahan for road tax waivers of up to 25% and discount on your new vehicle purchase.",
            hi: "नई कार खरीद पर 25% तक रोड टैक्स छूट और निर्माता छूट के लिए परिवहन पोर्टल के माध्यम से आधिकारिक जमा प्रमाणपत्र।",
          },
        },
      ],
    },
    intro: {
      overline: {
        en: "CAR & FOUR-WHEELER SCRAPPING",
        hi: "CAR & FOUR-WHEELER SCRAPPING",
      },
      h2Part1: {
        en: "Scrap Your Old Car in Kanpur —",
        hi: "कानपुर में अपनी पुरानी कार स्क्रैप करें —",
      },
      h2Highlight: {
        en: "Authorised, Hassle-Free, Paperwork Handled",
        hi: "अधिकृत, परेशानी मुक्त, कागजी कार्रवाई संभाली गई",
      },
      paragraphs: [
        {
          en: "If you are wondering where to scrap a car in Kanpur, ScrapCentre handles hatchbacks, sedans, SUVs and MPVs, as well as old, unfit and damaged cars. As an authorized car scrapping company and government-approved car scrapping center in Kanpur, we take care of valuation, pickup and paperwork in one place through our authorised RVSF for old car scrapping in Kanpur.",
          hi: "यदि आप सोच रहे हैं कि कानपुर में अपनी कार कहाँ स्क्रैप करें, तो ScrapCentre हैचबैक, सेडान, एसयूवी और एमपीवी के साथ-साथ पुरानी, अनफिट और क्षतिग्रस्त कारों को संभालता है। कानपुर में एक अधिकृत कार स्क्रैपिंग कंपनी और पंजीकृत कार स्क्रैपिंग सेंटर के रूप में, हम अधिकृत RVSF के माध्यम से मूल्यांकन, पिकअप और कागजी कार्रवाई सभी एक ही स्थान पर संभालते हैं।",
        },
        {
          en: (
            <>
              Running or parked for years: we provide free doorstep pickup from your home or society across Kanpur. For other vehicle types, explore our{" "}
              <Link
                href="/vehicle-scrapping-services-kanpur"
                className="text-[#E31E24] hover:underline font-semibold"
              >
                vehicle scrapping services in Kanpur
              </Link>
              .
            </>
          ),
          hi: (
            <>
              चाहे वाहन चालू हो या वर्षों से खड़ा हो: हम पूरे कानपुर में आपके घर या सोसाइटी से मुफ्त डोरस्टेप पिकअप प्रदान करते हैं। अन्य वाहन श्रेणियों के लिए, कानपुर में हमारी{" "}
              <Link
                href="/vehicle-scrapping-services-kanpur"
                className="text-[#E31E24] hover:underline font-semibold"
              >
                वाहन स्क्रैपिंग सेवाएं
              </Link>{" "}
              देखें।
            </>
          ),
        },
      ],
      atAGlance: {
        headerBadge: {
          en: "CARS AT A GLANCE",
          hi: "CARS AT A GLANCE",
        },
        liveStatus: {
          en: "Live Hub",
          hi: "Live Hub",
        },
        subtitle: {
          en: "Authorised RVSF facility & fast local dispatch across Kanpur",
          hi: "अधिकृत RVSF सुविधा और पूरे कानपुर में त्वरित स्थानीय डिस्पैच",
        },
        weScrap: {
          icon: Car,
          label: { en: "WE SCRAP", hi: "हम स्क्रैप करते हैं" },
          value: {
            en: "Hatchbacks, sedans, SUVs, MPVs and other four-wheelers",
            hi: "हैचबैक, सेडान, एसयूवी, एमपीवी और अन्य फोर-व्हीलर",
          },
        },
        pickup: {
          label: { en: "PICKUP", hi: "पिकअप" },
          value: {
            en: "Free doorstep pickup — slot confirmed on WhatsApp",
            hi: "मुफ्त डोरस्टेप पिकअप — स्लॉट व्हाट्सएप पर कन्फर्म",
          },
          freeBadge: { en: "100% Free", hi: "100% मुफ्त" },
        },
        contact: {
          label: { en: "CALL OR WHATSAPP", hi: "कॉल या व्हाट्सएप" },
          phoneDisplay: "+91-9839447733",
          phoneTel: "+919839447733",
          whatsappUrl: "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20want%20to%20scrap%20my%20car/four-wheeler%20in%20Kanpur.",
        },
        facility: {
          label: { en: "VISIT US", hi: "हमसे मिलें" },
          address: "26-A & B, Block-E, Panki, Kalpi Road, Kanpur, Uttar Pradesh 208020",
        },
      },
    },
    popularModels: {
      badge: {
        en: "POPULAR CARS IN INDIA",
        hi: "POPULAR CARS IN INDIA",
      },
      itemIcon: Car,
      h2Part1: {
        en: "India's Most Popular Cars —",
        hi: "भारत की सबसे लोकप्रिय कारें —",
      },
      h2Highlight: {
        en: "Own an Older One? Check Eligibility",
        hi: "पुरानी कार है? पात्रता जांचें",
      },
      introText: {
        en: "Maruti Wagon R, Swift, Dzire, Baleno and Hyundai Creta are among the most popular cars in India. If you own an older model, share your registration number with us for a free eligibility check. Our team assists with old car scrap in Kanpur, hatchback scrapping in Kanpur, sedan scrapping in Kanpur, and old SUV scrapping in Kanpur.",
        hi: "मारुति वैगन आर, स्विफ्ट, डिजायर, बलेनो और हुंडई क्रेटा भारत में सबसे लोकप्रिय कारों में से हैं। यदि आपके पास कोई पुराना मॉडल है, तो मुफ्त पात्रता जांच के लिए हमारे साथ अपना पंजीकरण नंबर साझा करें। हमारी टीम कानपुर में पुरानी कार स्क्रैप, हैचबैक स्क्रैपिंग, सेडान स्क्रैपिंग और पुरानी एसयूवी स्क्रैपिंग में सहायता करती है।",
      },
      tableHeaders: {
        col1: { en: "POPULAR CAR", hi: "POPULAR CAR" },
        col2: { en: "BODY TYPE", hi: "BODY TYPE" },
      },
      models: [
        { name: "Maruti Dzire", type: "Sedan" },
        { name: "Tata Nexon", type: "SUV" },
        { name: "Hyundai Creta", type: "SUV" },
        { name: "Maruti Ertiga", type: "MPV" },
        { name: "Maruti Swift", type: "Hatchback" },
        { name: "Tata Punch", type: "SUV" },
        { name: "Maruti Wagon R", type: "Hatchback" },
        { name: "Maruti Brezza", type: "SUV" },
        { name: "Mahindra Scorpio", type: "SUV" },
        { name: "Maruti Baleno", type: "Hatchback" },
      ],
      disclaimer: {
        en: "Brand and model names belong to their respective owners and are used for reference only. ScrapCentre is not affiliated with these manufacturers.",
        hi: "Brand and model names belong to their respective owners and are used for reference only. ScrapCentre is not affiliated with these manufacturers.",
      },
      questionsTitle: {
        en: "Popular car questions",
        hi: "Popular car questions",
      },
      questions: [
        {
          qEn: "Can I scrap my Maruti Dzire in Kanpur?",
          qHi: "क्या मैं कानपुर में अपनी मारुति डिजायर स्क्रैप कर सकता हूँ?",
          aEn: "Yes, your Maruti Dzire may be eligible for scrapping. Eligibility is checked from the vehicle details, not the model name. Share your registration number to get a free valuation and doorstep towing support.",
          aHi: "हाँ, आपकी मारुति डिजायर स्क्रैपिंग के लिए पात्र हो सकती है। पात्रता मॉडल नाम के बजाय वाहन के विवरण से जांची जाती है। मुफ्त मूल्यांकन और डोरस्टेप टोइंग के लिए अपना पंजीकरण नंबर साझा करें।",
        },
        {
          qEn: "Can I scrap my Tata Nexon in Kanpur?",
          qHi: "क्या मैं कानपुर में अपनी टाटा नेक्सन स्क्रैप कर सकता हूँ?",
          aEn: "Yes, you can check whether your Tata Nexon is eligible for scrapping. Eligibility is determined from the vehicle’s specific details rather than the model name alone. Share your car number to receive a free valuation.",
          aHi: "हाँ, आप जांच सकते हैं कि आपकी टाटा नेक्सन स्क्रैपिंग के लिए पात्र है या नहीं। पात्रता केवल मॉडल नाम के बजाय वाहन के विवरण से निर्धारित होती है। मुफ्त मूल्यांकन प्राप्त करने के लिए अपना पंजीकरण नंबर साझा करें।",
        },
        {
          qEn: "Can I scrap my Hyundai Creta in Kanpur?",
          qHi: "क्या मैं कानपुर में अपनी हुंडई क्रेटा स्क्रैप कर सकता हूँ?",
          aEn: "Yes, your Hyundai Creta can be assessed for scrapping based on its vehicle details. We check eligibility individually, not simply by model name. Share your car number for a free valuation and Certificate of Deposit.",
          aHi: "हाँ, आपकी हुंडई क्रेटा का वाहन विवरण के आधार पर मूल्यांकन किया जा सकता है। हम केवल मॉडल नाम के बजाय व्यक्तिगत रूप से पात्रता की जांच करते हैं। मुफ्त मूल्यांकन और जमा प्रमाणपत्र (COD) के लिए अपना नंबर साझा करें।",
        },
        {
          qEn: "Can I scrap my Maruti Ertiga in Kanpur?",
          qHi: "क्या मैं कानपुर में अपनी मारुति अर्टिगा स्क्रैप कर सकता हूँ?",
          aEn: "Yes, you can check your Maruti Ertiga’s eligibility for scrapping by sharing its registration number with us. Assessment depends on the vehicle records rather than the model name, and we provide a free valuation.",
          aHi: "हाँ, आप हमारे साथ पंजीकरण नंबर साझा करके अपनी मारुति अर्टिगा की पात्रता जांच सकते हैं। मूल्यांकन मॉडल नाम के बजाय वाहन रिकॉर्ड पर निर्भर करता है, और हम मुफ्त मूल्यांकन प्रदान करते हैं।",
        },
        {
          qEn: "Can I scrap my Maruti Swift in Kanpur?",
          qHi: "क्या मैं कानपुर में अपनी मारुति स्विफ्ट स्क्रैप कर सकता हूँ?",
          aEn: "Yes, your Maruti Swift may be eligible for scrapping. Our team assesses eligibility using the car's official registration details, not just its model name. Share your vehicle number for a free valuation and doorstep pickup.",
          aHi: "हाँ, आपकी मारुति स्विफ्ट स्क्रैपिंग के लिए पात्र हो सकती है। हमारी टीम केवल मॉडल नाम के बजाय आधिकारिक पंजीकरण विवरण का उपयोग करके पात्रता का आकलन करती है। मुफ्त मूल्यांकन और डोरस्टेप पिकअप के लिए अपना नंबर साझा करें।",
        },
        {
          qEn: "Can I scrap my Tata Punch in Kanpur?",
          qHi: "क्या मैं कानपुर में अपनी टाटा पंच स्क्रैप कर सकता हूँ?",
          aEn: "Yes, you can request an eligibility check for your Tata Punch. We evaluate vehicles based on their specific documentation rather than the model name alone. Share your car registration number to get a free valuation quote.",
          aHi: "हाँ, आप अपने टाटा पंच के लिए पात्रता जांच का अनुरोध कर सकते हैं। हम केवल मॉडल नाम के बजाय विशिष्ट दस्तावेजों के आधार पर वाहनों का मूल्यांकन करते हैं। मुफ्त मूल्यांकन कोट के लिए अपना नंबर साझा करें।",
        },
        {
          qEn: "Can I scrap my Maruti Wagon R in Kanpur?",
          qHi: "क्या मैं कानपुर में अपनी मारुति वैगन आर स्क्रैप कर सकता हूँ?",
          aEn: "Yes, your Maruti Wagon R can be checked for scrapping eligibility. Assessment depends on the vehicle's specific details, not just its model name. Share your car number with us to receive a free valuation and pickup assistance.",
          aHi: "हाँ, आपकी मारुति वैगन आर की स्क्रैपिंग पात्रता की जांच की जा सकती है। मूल्यांकन केवल मॉडल नाम के बजाय वाहन के विशिष्ट विवरण पर निर्भर करता है। मुफ्त मूल्यांकन और पिकअप सहायता के लिए अपना नंबर साझा करें।",
        },
        {
          qEn: "Can I scrap my Maruti Brezza in Kanpur?",
          qHi: "क्या मैं कानपुर में अपनी मारुति ब्रेज़ा स्क्रैप कर सकता हूँ?",
          aEn: "Yes, you can check whether your Maruti Brezza is eligible for scrapping. Eligibility is confirmed using the vehicle’s official records rather than its model name. Share your car number for a free valuation and Certificate of Deposit.",
          aHi: "हाँ, आप जांच सकते हैं कि आपकी मारुति ब्रेज़ा स्क्रैपिंग के लिए पात्र है या नहीं। पात्रता मॉडल नाम के बजाय वाहन के आधिकारिक रिकॉर्ड का उपयोग करके तय की जाती है। मुफ्त मूल्यांकन के लिए अपना नंबर साझा करें।",
        },
        {
          qEn: "Can I scrap my Mahindra Scorpio in Kanpur?",
          qHi: "क्या मैं कानपुर में अपनी महिंद्रा स्कॉर्पियो स्क्रैप कर सकता हूँ?",
          aEn: "Yes, your Mahindra Scorpio may be eligible for scrapping. We assess eligibility based on the vehicle’s kerb weight and registration details, not solely the model name. Share your car number to receive a free valuation.",
          aHi: "हाँ, आपकी महिंद्रा स्कॉर्पियो स्क्रैपिंग के लिए पात्र हो सकती है। हम केवल मॉडल नाम के बजाय वाहन के कर्ब वजन और पंजीकरण विवरण के आधार पर पात्रता का आकलन करते हैं। मुफ्त मूल्यांकन के लिए अपना नंबर साझा करें।",
        },
        {
          qEn: "Can I scrap my Maruti Baleno in Kanpur?",
          qHi: "क्या मैं कानपुर में अपनी मारुति बलेनो स्क्रैप कर सकता हूँ?",
          aEn: "Yes, you can check your Maruti Baleno’s eligibility for scrapping. We verify vehicle details rather than relying on the model name alone. Share your registration number with our team for a free valuation and RC cancellation support.",
          aHi: "हाँ, आप अपनी मारुति बलेनो की स्क्रैपिंग पात्रता की जांच कर सकते हैं। हम केवल मॉडल नाम पर भरोसा करने के बजाय वाहन विवरण सत्यापित करते हैं। मुफ्त मूल्यांकन और आरसी रद्दीकरण सहायता के लिए अपना नंबर साझा करें।",
        },
      ],
    },
    redBanner: {
      title: {
        en: "Check Car & Four-Wheeler Pickup in Kanpur",
        hi: "कानपुर में कार और फोर-व्हीलर पिकअप जांचें",
      },
      subtitle: {
        en: "Average flatbed pickup scheduled within 24 hours",
        hi: "औसत फ्लैटबेड पिकअप 24 घंटे के भीतर निर्धारित",
      },
      ctaText: {
        en: "Check on WhatsApp",
        hi: "व्हाट्सएप पर जांचें",
      },
      ctaUrl: "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20want%20to%20check%20car/four-wheeler%20pickup%20availability%20in%20Kanpur.",
    },
    process: {
      badge: {
        en: "— PICKUP TO COD",
        hi: "— PICKUP TO COD",
      },
      h2Part1: {
        en: "How Car Scrapping Works in Kanpur —",
        hi: "कानपुर में कार स्क्रैपिंग कैसे काम करती है —",
      },
      h2Highlight: {
        en: "From Your Parking Spot to Your Certificate of Deposit",
        hi: "आपकी पार्किंग से आपके जमा प्रमाणपत्र तक",
      },
      introText: {
        en: (
          <>
            Scrapping your car involves four clear stages, from sharing its details to receiving your Certificate of Deposit. For comprehensive guidelines, read our{" "}
            <Link
              href="/vehicle-scrapping-services"
              className="text-[#E31E24] hover:underline font-semibold"
            >
              vehicle scrapping guide
            </Link>
            .
          </>
        ),
        hi: (
          <>
            आपकी कार को स्क्रैप करने में विवरण साझा करने से लेकर जमा प्रमाणपत्र प्राप्त करने तक चार चरण शामिल हैं। अधिक जानकारी के लिए, हमारी{" "}
            <Link
              href="/vehicle-scrapping-services"
              className="text-[#E31E24] hover:underline font-semibold"
            >
              वाहन स्क्रैपिंग गाइड
            </Link>{" "}
            पढ़ें।
          </>
        ),
      },
      steps: [
        {
          num: "01",
          icon: MapPin,
          badge: { en: "AT YOUR PARKING", hi: "आपकी पार्किंग पर" },
          title: { en: "Share Your Car Number", hi: "अपनी कार का नंबर साझा करें" },
          desc: {
            en: "To learn how to scrap a car in Kanpur, enter your car number on our website or WhatsApp with your Kanpur locality for a free valuation estimate and slot confirmation.",
            hi: "कानपुर में कार स्क्रैप करने का तरीका जानने के लिए, मुफ्त मूल्यांकन और स्लॉट की पुष्टि के लिए हमारे पोर्टल या व्हाट्सएप पर अपने इलाके के साथ कार नंबर साझा करें।",
          },
          footerStep: "STEP 01",
        },
        {
          num: "02",
          icon: Truck,
          badge: { en: "PICKUP", hi: "पिकअप" },
          title: { en: "Free Doorstep Pickup", hi: "मुफ्त डोरस्टेप पिकअप" },
          desc: {
            en: "Our doorstep car scrapping Kanpur team provides free pickup from your home. We arrange dedicated car towing for scrapping Kanpur including non running car pickup Kanpur if it cannot be driven.",
            hi: "हमारी टीम आपके घर से मुफ्त पिकअप प्रदान करती है। यदि कार चलाई नहीं जा सकती है, तो हम गैर-चालू वाहनों के लिए समर्पित कार टोइंग सहायता भी प्रदान करते हैं।",
          },
          footerStep: "STEP 02",
        },
        {
          num: "03",
          icon: FileText,
          badge: { en: "PAPERWORK", hi: "कागजी कार्रवाई" },
          title: { en: "Documents & RC Cancellation", hi: "दस्तावेज़ और RC रद्दीकरण" },
          desc: {
            en: "Hand over the required vehicle documents so our team can handle the paperwork and RC cancellation. We manage complete documentation for accidental car scrap Kanpur and unfit car scrapping Kanpur.",
            hi: "आवश्यक वाहन दस्तावेज सौंपें ताकि हमारी टीम कागजी कार्रवाई और आरसी रद्दीकरण संभाल सके। हम कानपुर में दुर्घटनाग्रस्त और अनफिट कारों के लिए संपूर्ण दस्तावेज़ीकरण प्रक्रिया संभालते हैं।",
          },
          footerStep: "STEP 03",
        },
        {
          num: "04",
          icon: ShieldCheck,
          badge: { en: "AUTHORISED RVSF", hi: "अधिकृत RVSF" },
          title: { en: "Payment & Certificate of Deposit", hi: "भुगतान और जमा प्रमाणपत्र" },
          desc: {
            en: "After processing at the authorised RVSF in Kanpur, you receive the applicable scrap payment and your official government Certificate of Deposit (COD).",
            hi: "कानपुर में अधिकृत RVSF में प्रोसेसिंग के बाद, आपको लागू स्क्रैप भुगतान और आधिकारिक सरकारी जमा प्रमाणपत्र (COD) प्राप्त होता है।",
          },
          footerStep: "STEP 04",
        },
      ],
    },
    documents: {
      overline: {
        en: "PAPERWORK",
        hi: "PAPERWORK",
      },
      h2Part1: {
        en: "Car Scrapping Documents in Kanpur —",
        hi: "कानपुर में कार स्क्रैपिंग दस्तावेज़ —",
      },
      h2Highlight: {
        en: "RC, ID Proof & Loan NOC Checklist",
        hi: "आरसी, आईडी प्रूफ और लोन एनओसी चेकलिस्ट",
      },
      introText: {
        en: "Only a few basic car scrapping documents in Kanpur are needed; keep them ready while our team supports car rc cancellation in Kanpur and complete car deregistration in Kanpur.",
        hi: "कानपुर में कार स्क्रैपिंग के लिए केवल कुछ बुनियादी दस्तावेजों की आवश्यकता होती है; उन्हें तैयार रखें, जबकि हमारी टीम आरसी रद्दीकरण और पूरी प्रक्रिया में सहायता करती है।",
      },
      leftCard1: {
        icon: IndianRupee,
        title: {
          en: "Car under a bank loan?",
          hi: "क्या कार बैंक लोन पर है?",
        },
        text: {
          en: "For hypothecated car scrapping in Kanpur, a car under loan needs a Financier NOC. Tell us the lender and our team will guide you before you start.",
          hi: "हाइपोथेकेटेड कार स्क्रैपिंग के लिए फाइनेंसर एनओसी की आवश्यकता होती है। अपने ऋणदाता का नाम बताएं और हमारी टीम शुरू करने से पहले आपका मार्गदर्शन करेगी।",
        },
      },
      leftCardExtra: {
        icon: FileText,
        title: {
          en: "Car RC cancellation",
          hi: "कार आरसी रद्दीकरण",
        },
        text: {
          en: "Car rc cancellation in Kanpur is part of the scrapping process. Share your car number and we confirm what is needed to issue your car scrapping certificate in Kanpur.",
          hi: "कानपुर में आरसी रद्दीकरण स्क्रैपिंग प्रक्रिया का एक हिस्सा है। कार नंबर साझा करें और हम पुष्टि करेंगे कि स्क्रैपिंग प्रमाणपत्र प्राप्त करने के लिए क्या आवश्यक है।",
        },
      },
      leftCard2: {
        icon: FileText,
        title: {
          en: "Complete document list",
          hi: "दस्तावेजों की पूरी सूची",
        },
        guideText: "Every document is explained in our guide to",
        linkText: "vehicle scrapping documents required in India",
        linkHref: "/vehicle-scrapping-services",
      },
      helpCard: {
        badge: { en: "CHECKLIST", hi: "CHECKLIST" },
        title: {
          en: "Documents for a car",
          hi: "कार के लिए दस्तावेज़",
        },
        points: [
          {
            en: "Registration Certificate (RC) of the car",
            hi: "कार का पंजीकरण प्रमाणपत्र (RC)",
          },
          {
            en: "ID proof of the registered owner",
            hi: "पंजीकृत वाहन मालिक का आईडी प्रूफ",
          },
          {
            en: "Insurance copy and PUC certificate, if available",
            hi: "बीमा प्रति और पीयूसी प्रमाणपत्र, यदि उपलब्ध हो",
          },
          {
            en: "Financier NOC, if the car is hypothecated",
            hi: "फाइनेंसर एनओसी, यदि कार हाइपोथेकेटेड (लोन पर) है",
          },
        ],
        ctaText: {
          en: "Get the Checklist on WhatsApp",
          hi: "व्हाट्सएप पर चेकलिस्ट प्राप्त करें",
        },
        whatsappUrl: "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20please%20send%20me%20the%20car%20scrapping%20documents%20checklist%20for%20Kanpur.",
      },
    },
    scrapValue: {
      badge: {
        en: "— VALUATION",
        hi: "— VALUATION",
      },
      h2Part1: {
        en: "Car Scrap Price in Kanpur —",
        hi: "कानपुर में कार स्क्रैप मूल्य —",
      },
      h2Highlight: {
        en: "What Decides Your Car's Scrap Value",
        hi: "आपकी कार का स्क्रैप मूल्य क्या तय करता है",
      },
      introText: {
        en: "Every car is valued individually through our free car valuation Kanpur. The six factors below determine your car scrap price in Kanpur, car scrap value Kanpur, and transparent car scrapping valuation Kanpur.",
        hi: "प्रत्येक कार का व्यक्तिगत रूप से मूल्यांकन किया जाता है। नीचे दिए गए छह कारक कानपुर में आपकी कार की स्क्रैप कीमत और पारदर्शी कार स्क्रैप मूल्य निर्धारित करते हैं।",
      },
      tableHeaders: {
        factor: { en: "FACTOR", hi: "FACTOR" },
        check: { en: "WHAT WE LOOK AT", hi: "WHAT WE LOOK AT" },
        impact: { en: "HOW IT AFFECTS YOUR QUOTE", hi: "HOW IT AFFECTS YOUR QUOTE" },
      },
      factors: [
        {
          factor: { en: "Car type & weight", hi: "Car type & weight" },
          icon: Car,
          check: {
            en: "Hatchback, sedan, SUV or MPV, and its kerb weight",
            hi: "Hatchback, sedan, SUV or MPV, and its kerb weight",
          },
          impact: {
            en: "Heavier cars generally have more recoverable material",
            hi: "Heavier cars generally have more recoverable material",
          },
        },
        {
          factor: { en: "Make, model & year", hi: "Make, model & year" },
          icon: Calendar,
          check: {
            en: "Which car it is, its variant and year of manufacture",
            hi: "Which car it is, its variant and year of manufacture",
          },
          impact: {
            en: "Affects the valuation and the benefits you may be eligible for",
            hi: "Affects the valuation and the benefits you may be eligible for",
          },
        },
        {
          factor: { en: "Condition", hi: "Condition" },
          icon: Key,
          check: {
            en: "Running, non-running or accident-damaged",
            hi: "Running, non-running or accident-damaged",
          },
          impact: {
            en: "Condition affects how much can be recovered",
            hi: "Condition affects how much can be recovered",
          },
        },
        {
          factor: { en: "Completeness", hi: "Completeness" },
          icon: Link2,
          check: {
            en: "Engine, battery, tyres and body panels present",
            hi: "Engine, battery, tyres and body panels present",
          },
          impact: {
            en: "Missing major parts can reduce the quote",
            hi: "Missing major parts can reduce the quote",
          },
        },
        {
          factor: { en: "Metal & market rates", hi: "Metal & market rates" },
          icon: IndianRupee,
          check: {
            en: "Prevailing steel, aluminium and other scrap rates",
            hi: "Prevailing steel, aluminium and other scrap rates",
          },
          impact: {
            en: "These rates change over time",
            hi: "These rates change over time",
          },
        },
        {
          factor: { en: "Documents", hi: "Documents" },
          icon: FileText,
          check: {
            en: "RC, ID proof and financier NOC, where applicable",
            hi: "RC, ID proof and financier NOC, where applicable",
          },
          impact: {
            en: "Complete papers keep the process smooth",
            hi: "Complete papers keep the process smooth",
          },
        },
      ],
      note: {
        en: "Note: Scrapping benefits and incentives are subject to prevailing RVSF policies and vehicle category.",
        hi: "Note: Scrapping benefits and incentives are subject to prevailing RVSF policies and vehicle category.",
      },
    },
    relatedPages: {
      badge: {
        en: "MORE IN KANPUR",
        hi: "MORE IN KANPUR",
      },
      h2Part1: {
        en: "Scrapping Something Other Than a Car? —",
        hi: "कार के अलावा कुछ और स्क्रैप करना चाहते हैं? —",
      },
      h2Highlight: {
        en: "Explore Our Kanpur Pages",
        hi: "हमारे कानपुर पेज देखें",
      },
      cards: [
        {
          icon: Bike,
          title: { en: "Two-Wheeler Scrapping", hi: "टू-व्हीलर स्क्रैपिंग" },
          desc: {
            en: "Bikes, scooters and motorcycle owners can read the dedicated two-wheeler page for pickup, paperwork and valuation across all Kanpur localities.",
            hi: "बाइक, स्कूटर और मोटरसाइकिल मालिक सभी कानपुर इलाकों में पिकअप, कागजी कार्रवाई और मूल्यांकन के लिए समर्पित टू-व्हीलर पेज देख सकते हैं।",
          },
          linkText: { en: "Bike Scrapping in Kanpur", hi: "कानपुर में बाइक स्क्रैपिंग" },
          href: "/two-wheeler-scrapping-kanpur",
        },
        {
          icon: Truck,
          title: { en: "Trucks, Buses & More", hi: "ट्रक, बसें और अन्य" },
          desc: {
            en: "Trucks, buses, autos, tractors, commercial vehicles and fleets are covered on the Kanpur vehicle scrapping page for authorised scrapping and pickup.",
            hi: "ट्रक, बसें, ऑटो, ट्रैक्टर, वाणिज्यिक वाहन और फ्लीट अधिकृत स्क्रैपिंग और पिकअप के लिए कानपुर वाहन स्क्रैपिंग पेज पर कवर किए गए हैं।",
          },
          linkText: { en: "Vehicle Scrapping in Kanpur", hi: "कानपुर में वाहन स्क्रैपिंग" },
          href: "/vehicle-scrapping-services-kanpur",
        },
        {
          icon: MapPin,
          title: { en: "Pickup Areas in Kanpur", hi: "कानपुर में पिकअप क्षेत्र" },
          desc: {
            en: "See the Kanpur localities where free vehicle pickup is arranged and how to reach the facility.",
            hi: "देखें कि किन कानपुर इलाकों में मुफ्त वाहन पिकअप की व्यवस्था है और सुविधा केंद्र तक कैसे पहुँचें।",
          },
          linkText: { en: "View Pickup Areas", hi: "पिकअप क्षेत्र देखें" },
          href: "/vehicle-scrapping-services-kanpur",
        },
      ],
    },
    faqs: {
      overline: {
        en: "FREQUENTLY ASKED",
        hi: "FREQUENTLY ASKED",
      },
      h2Part1: {
        en: "Car Scrapping in Kanpur —",
        hi: "कानपुर में कार स्क्रैपिंग —",
      },
      h2Highlight: {
        en: "Questions Car Owners Ask",
        hi: "कार मालिकों के सामान्य प्रश्न",
      },
      subtitle: {
        textBeforeLink: {
          en: "Quick answers for car owners in Kanpur. For rules that apply across India, see the",
          hi: "कानपुर में कार मालिकों के लिए त्वरित उत्तर। पूरे भारत में लागू होने वाले नियमों के लिए हमारी",
        },
        linkText: {
          en: "main FAQ",
          hi: "मुख्य FAQ",
        },
        linkHref: "/#faq",
      },
      items: [
        {
          qEn: "Where can I scrap my car in Kanpur?",
          qHi: "मैं कानपुर में अपनी कार कहाँ स्क्रैप कर सकता हूँ?",
          aEn: "If you are wondering where to scrap a car in Kanpur, our authorised RVSF facility is located in Panki on Kalpi Road. We provide car scrapping Kanpur with free doorstep pickup from your home or housing society. Simply share your car number online or on WhatsApp to begin.",
          aHi: "यदि आप सोच रहे हैं कि कानपुर में कार कहाँ स्क्रैप करें, तो हमारी अधिकृत RVSF सुविधा कालपी रोड पर पनकी में स्थित है। हम आपके घर या सोसायटी से मुफ्त डोरस्टेप पिकअप के साथ कानपुर में कार स्क्रैपिंग प्रदान करते हैं। शुरू करने के लिए बस अपना कार नंबर ऑनलाइन या व्हाट्सएप पर साझा करें।",
        },
        {
          qEn: "Which documents are needed to scrap a car in Kanpur?",
          qHi: "कानपुर में कार स्क्रैप करने के लिए किन दस्तावेजों की आवश्यकता होती है?",
          aEn: "Essential car scrapping documents Kanpur include the original Registration Certificate (RC), owner ID proof, plus insurance copy and PUC if available. If hypothecated, a Financier NOC is required. Our team assists with car rc cancellation Kanpur, and additional paperwork may be requested depending on vehicle ownership status.",
          aHi: "कानपुर में कार स्क्रैपिंग के लिए आवश्यक दस्तावेजों में मूल पंजीकरण प्रमाणपत्र (RC), मालिक का आईडी प्रूफ, बीमा प्रति और पीयूसी (यदि उपलब्ध हो) शामिल हैं। यदि कार लोन पर है, तो फाइनेंसर एनओसी आवश्यक है। हमारी टीम आरसी रद्दीकरण में सहायता करती है, और स्वामित्व की स्थिति के आधार पर अतिरिक्त कागजात मांगे जा सकते हैं।",
        },
        {
          qEn: "Can I scrap a car that still has a bank loan?",
          qHi: "क्या मैं ऐसी कार स्क्रैप कर सकता हूँ जिस पर अभी भी बैंक लोन है?",
          aEn: "Yes, but for hypothecated car scrapping Kanpur, a formal Financier NOC (No Objection Certificate) from your lending bank is mandatory before scrapping can proceed. Once the loan is cleared, our team offers step-by-step guidance on the next steps, document submission, and completing the official vehicle deregistration.",
          aHi: "हाँ, लेकिन हाइपोथेकेटेड कार स्क्रैपिंग के लिए, स्क्रैपिंग आगे बढ़ने से पहले आपके बैंक से एक औपचारिक फाइनेंसर एनओसी अनिवार्य है। लोन चुकाए जाने के बाद, हमारी टीम अगले चरणों, दस्तावेज़ जमा करने और आधिकारिक वाहन रद्दीकरण को पूरा करने पर चरण-दर-चरण मार्गदर्शन प्रदान करती है।",
        },
        {
          qEn: "Can you pick up a non-running or accident-damaged car in Kanpur?",
          qHi: "क्या आप कानपुर में गैर-चालू या दुर्घटनाग्रस्त कार को उठा सकते हैं?",
          aEn: "Yes, we provide non running car pickup Kanpur and specialized car towing for scrapping Kanpur if your vehicle cannot be driven due to mechanical failure or accident damage. Please share your car's location and condition details with our team to check towing support eligibility across Kanpur.",
          aHi: "हाँ, यदि यांत्रिक खराबी या दुर्घटना क्षति के कारण आपका वाहन नहीं चलाया जा सकता है, तो हम गैर-चालू कार पिकअप और स्क्रैपिंग के लिए समर्पित टोइंग सहायता प्रदान करते हैं। पूरे कानपुर में टोइंग सहायता पात्रता की जांच करने के लिए कृपया हमारी टीम के साथ अपनी कार का स्थान और स्थिति विवरण साझा करें।",
        },
        {
          qEn: "How much will I get for scrapping my car in Kanpur?",
          qHi: "कानपुर में अपनी कार स्क्रैप करने पर मुझे कितना पैसा मिलेगा?",
          aEn: "Your car scrap price Kanpur depends on several key factors, including vehicle type, unladen weight, age, condition, completeness of major components, and prevailing scrap metal rates. We offer a transparent free car valuation Kanpur—simply share your registration details online or on WhatsApp to receive your individualized quote.",
          aHi: "कानपुर में आपकी कार की स्क्रैप कीमत कई प्रमुख कारकों पर निर्भर करती है, जिसमें वाहन का प्रकार, वजन, आयु, स्थिति, प्रमुख घटकों की पूर्णता और प्रचलित स्क्रैप धातु दरें शामिल हैं। हम एक पारदर्शी मुफ्त कार मूल्यांकन प्रदान करते हैं—अपना व्यक्तिगत कोट प्राप्त करने के लिए बस अपना पंजीकरण विवरण साझा करें।",
        },
        {
          qEn: "Does the model or size of my car change its scrap value?",
          qHi: "क्या मेरी कार का मॉडल या आकार इसके स्क्रैप मूल्य को बदलता है?",
          aEn: "Yes, it can. The make, model, kerb weight, and manufacturing year play a substantial role in determining your car scrap value Kanpur. Larger vehicles naturally have more recoverable metal, while vehicle condition and the completeness of internal assemblies also directly influence the final scrap valuation. No flat rates apply.",
          aHi: "हाँ, ऐसा हो सकता है। मेक, मॉडल, कर्ब वजन और निर्माण वर्ष आपकी कार के स्क्रैप मूल्य को निर्धारित करने में महत्वपूर्ण भूमिका निभाते हैं। बड़े वाहनों में स्वाभाविक रूप से अधिक धातु होती है, जबकि वाहन की स्थिति और आंतरिक घटकों की पूर्णता भी अंतिम मूल्यांकन को प्रभावित करती है।",
        },
        {
          qEn: "Can I scrap a popular model such as a Dzire, Creta or Wagon R?",
          qHi: "क्या मैं डिजायर, क्रेटा या वैगन आर जैसे लोकप्रिय मॉडल को स्क्रैप कर सकता हूँ?",
          aEn: "Yes, any car model can be scrapped. Scrapping eligibility does not depend on the model name itself, but on the vehicle’s age, fitness status, and registration records. Whether you own a Dzire, Creta, Wagon R or another car, share your car number to receive a free valuation.",
          aHi: "हाँ, किसी भी कार मॉडल को स्क्रैप किया जा सकता है। स्क्रैपिंग पात्रता मॉडल के नाम पर निर्भर नहीं करती है, बल्कि वाहन की आयु, फिटनेस स्थिति और पंजीकरण रिकॉर्ड पर निर्भर करती है। चाहे आपके पास डिजायर, क्रेटा, वैगन आर या कोई अन्य कार हो, मुफ्त मूल्यांकन प्राप्त करने के लिए अपना कार नंबर साझा करें।",
        },
        {
          qEn: "Can I scrap an electric car in Kanpur?",
          qHi: "क्या मैं कानपुर में इलेक्ट्रिक कार स्क्रैप कर सकता हूँ?",
          aEn: "Yes, electric car scrapping Kanpur is supported through the appropriate authorised scrapping and recycling route. Battery disposal and high-voltage components require strict environmental protocols managed under RVSF standards. Share your electric vehicle details and location with our Kanpur team to learn more and arrange compliant processing.",
          aHi: "हाँ, कानपुर में इलेक्ट्रिक कार स्क्रैपिंग उपयुक्त अधिकृत स्क्रैपिंग और रीसाइक्लिंग मार्ग के माध्यम से समर्थित है। बैटरी निपटान और उच्च-वोल्टेज घटकों के लिए RVSF मानकों के तहत प्रबंधित सख्त पर्यावरण प्रोटोकॉल की आवश्यकता होती है। अधिक जानने और प्रक्रिया व्यवस्थित करने के लिए विवरण साझा करें।",
        },
      ],
      helpCard: {
        title: {
          en: "Still Have Questions?",
          hi: "Still Have Questions?",
        },
        subtitle: {
          en: "Our Kanpur team is happy to help. Call or message us anytime.",
          hi: "Our Kanpur team is happy to help. Call or message us anytime.",
        },
        phoneDisplay: "+91-9839447733",
        phoneTel: "+919839447733",
        whatsappUrl: "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20have%20a%20question%20about%20car%20scrapping%20in%20Kanpur.",
      },
    },
    bottomCta: {
      badge: {
        en: "✦ FAST & FREE VALUATION",
        hi: "✦ FAST & FREE VALUATION",
      },
      h2: {
        en: "Book Your Car Pickup in Kanpur with ScrapCentre",
        hi: "ScrapCentre के साथ कानपुर में अपनी कार पिकअप बुक करें",
      },
      supportingDesc: {
        en: "Get a free valuation, free doorstep pickup across Kanpur, and an official Certificate of Deposit for your car through an authorised RVSF.",
        hi: "एक अधिकृत RVSF के माध्यम से मुफ्त मूल्यांकन, कानपुर में मुफ्त डोरस्टेप पिकअप और अपनी कार के लिए आधिकारिक जमा प्रमाणपत्र प्राप्त करें।",
      },
      trustBadges: [
        { icon: ShieldCheck, text: { en: "Authorised RVSF process", hi: "अधिकृत RVSF प्रक्रिया" } },
        { icon: Truck, text: { en: "Free doorstep pickup", hi: "मुफ्त डोरस्टेप पिकअप" } },
        { icon: IndianRupee, text: { en: "Instant payment", hi: "तत्काल भुगतान" } },
      ],
      formBadge: {
        en: "INSTANT VALUATION",
        hi: "INSTANT VALUATION",
      },
      formTitle: {
        en: "Get Your Free Car Valuation",
        hi: "अपनी कार का मुफ्त मूल्यांकन प्राप्त करें",
      },
      formSubtitle: {
        en: "Enter your car or four-wheeler registration number for an instant quote.",
        hi: "त्वरित कोट के लिए अपनी कार का पंजीकरण नंबर दर्ज करें।",
      },
      hideVehicleInput: true,
      ctaButtonText: {
        en: "Get Free Valuation",
        hi: "मुफ्त मूल्यांकन प्राप्त करें",
      },
      whatsappButtonText: {
        en: "Inquire on WhatsApp",
        hi: "व्हाट्सएप पर संपर्क करें",
      },
      guaranteeText: {
        en: "✓ 100% Free · No obligation · Pickup confirmed on WhatsApp",
        hi: "✓ 100% मुफ्त · कोई बाध्यता नहीं · व्हाट्सएप पर पुष्टि",
      },
    },
    phoneConfig: {
      phoneDisplay: "+91-9839447733",
      phoneTel: "+919839447733",
      whatsappUrl: "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20have%20a%20car/four-wheeler%20to%20scrap%20in%20Kanpur.",
      facilityAddress: "26-A & B, Block-E, Panki, Kalpi Road, Kanpur - 208020",
    },
  }

  return <VehicleCategoryTemplate isHindi={isHindi} config={fourWheelerKanpurConfig} />
}
