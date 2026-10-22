"use client"

import React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Bike,
  ShieldCheck,
  Truck,
  FileText,
  Car,
  MapPin,
  Calendar,
  Key,
  Link2,
  IndianRupee,
} from "lucide-react"
import VehicleCategoryTemplate, {
  VehicleCategoryPageConfig,
} from "./VehicleCategoryTemplate"

interface TwoWheelerKanpurClientProps {
  isHindi?: boolean
}

export default function TwoWheelerKanpurClient({ isHindi: isHindiProp }: TwoWheelerKanpurClientProps) {
  const params = useParams()
  const isHindi = isHindiProp !== undefined ? isHindiProp : params?.locale === "hi"

  const twoWheelerKanpurConfig: VehicleCategoryPageConfig = {
    hero: {
      bgImage: "/Locationimg/twowheeler.png",
      categoryBadge: {
        en: "Two-Wheeler Scrapping Services Kanpur",
        hi: "टू-व्हीलर स्क्रैपिंग सेवाएं कानपुर",
      },
      h1Line1: {
        en: "Two-Wheeler Scrapping in Kanpur —",
        hi: "कानपुर में टू-व्हीलर स्क्रैपिंग —",
      },
      h1Line2: {
        en: "Bike & Scooter, Free Doorstep Pickup",
        hi: "बाइक और स्कूटर, मुफ्त डोरस्टेप पिकअप",
      },
      supportingText: {
        en: "Give your old bike or scooter a proper end-of-life process without having to take it to the facility yourself. Our two wheeler scrapping in Kanpur offers free valuation, doorstep pickup, and paperwork support, including a Certificate of Deposit and RC cancellation assistance through an authorised RVSF.",
        hi: "अपनी पुरानी बाइक या स्कूटर को खुद सुविधा केंद्र तक ले जाए बिना एक उचित जीवन-समाप्ति प्रक्रिया दें। कानपुर में हमारी टू-व्हीलर स्क्रैपिंग एक अधिकृत RVSF के माध्यम से मुफ्त मूल्यांकन, डोरस्टेप पिकअप और कागजी कार्रवाई सहायता प्रदान करती है, जिसमें जमा प्रमाणपत्र (COD) और आरसी रद्दीकरण सहायता शामिल है।",
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
        en: "Scrap My Bike",
        hi: "मेरी बाइक स्क्रैप करें",
      },
      valuationLink: "/know-your-valuation?type=two-wheeler",
      advantageCards: [
        {
          num: "01",
          icon: ShieldCheck,
          title: { en: "Authorised RVSF", hi: "अधिकृत RVSF" },
          desc: {
            en: "Panki facility registered under MoRTH guidelines with certified eco-friendly dismantling and official UP-78 RTO cancellation.",
            hi: "MoRTH दिशानिर्देशों के तहत पंजीकृत पनकी सुविधा, पर्यावरण-अनुकूल निष्कासन और आधिकारिक UP-78 आरसी रद्दीकरण के साथ।",
          },
        },
        {
          num: "02",
          icon: Truck,
          title: { en: "Free Doorstep Pickup", hi: "मुफ्त डोरस्टेप पिकअप" },
          desc: {
            en: "Zero-cost doorstep bike collection and towing across all 12 Kanpur postal zones, scheduled at your convenience.",
            hi: "सभी 12 कानपुर क्षेत्रों में शून्य लागत पर डोरस्टेप बाइक पिकअप और टोइंग, आपकी सुविधानुसार तय समय पर।",
          },
        },
        {
          num: "03",
          icon: FileText,
          title: { en: "Instant COD Issued", hi: "तुरंत COD जारी" },
          desc: {
            en: "Official deposit certificate issued via Parivahan for road tax waivers and up to 5% discount on your new two-wheeler.",
            hi: "नए दोपहिया वाहन पर रोड टैक्स छूट और 5% तक की छूट के लिए परिवहन पोर्टल के माध्यम से आधिकारिक जमा प्रमाणपत्र।",
          },
        },
      ],
    },
    intro: {
      overline: {
        en: "BIKE & SCOOTER SCRAPPING",
        hi: "BIKE & SCOOTER SCRAPPING",
      },
      h2Part1: {
        en: "Scrap Your Old Bike or Scooter in Kanpur —",
        hi: "Scrap Your Old Bike or Scooter in Kanpur —",
      },
      h2Highlight: {
        en: "Simple, Authorised, Paperwork Handled",
        hi: "Simple, Authorised, Paperwork Handled",
      },
      paragraphs: [
        {
          en: "If you’re wondering where to scrap a bike in Kanpur, ScrapCentre handles the process for old, unfit or damaged motorcycles, scooters and mopeds. Our bike and scooter scrapping service in Kanpur includes valuation, pickup and paperwork through an authorised two wheeler RVSF Kanpur facility. We also support owners looking for old bike scrapping in Kanpur or motorcycle scrapping in Kanpur.",
          hi: "यदि आप सोच रहे हैं कि कानपुर में अपनी पुरानी बाइक कहाँ स्क्रैप करें, तो ScrapCentre पुरानी, अनफिट या क्षतिग्रस्त मोटरसाइकिलों, स्कूटरों और मोपेड के लिए पूरी प्रक्रिया संभालता है। कानपुर में हमारी टू-व्हीलर स्क्रैपिंग सेवा में एक अधिकृत RVSF सुविधा के माध्यम से मूल्यांकन, पिकअप और कागजी कार्रवाई शामिल है। हम कानपुर में पुरानी बाइक स्क्रैपिंग या मोटरसाइकिल स्क्रैपिंग की तलाश कर रहे मालिकों की भी पूरी सहायता करते हैं।",
        },
        {
          en: (
            <>
              You don’t need to bring your two-wheeler to the facility. We arrange free doorstep pickup for running and non-running bikes and scooters, with towing support where needed. For other vehicle types, explore our{" "}
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
              आपको अपने दोपहिया वाहन को स्क्रैप सुविधा तक लाने की आवश्यकता नहीं है। हम चालू और गैर-चालू दोनों तरह की बाइकों और स्कूटरों के लिए मुफ्त डोरस्टेप पिकअप की व्यवस्था करते हैं। अन्य वाहन श्रेणियों के लिए, कानपुर में हमारी{" "}
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
          en: "TWO-WHEELERS AT A GLANCE",
          hi: "TWO-WHEELERS AT A GLANCE",
        },
        liveStatus: {
          en: "Live Hub",
          hi: "Live Hub",
        },
        subtitle: {
          en: "Authorised RVSF facility & fast local dispatch across Kanpur",
          hi: "Authorised RVSF facility & fast local dispatch across Kanpur",
        },
        weScrap: {
          label: { en: "WE SCRAP", hi: "WE SCRAP" },
          value: {
            en: "Bikes, scooters, motorcycles, mopeds and electric two-wheelers",
            hi: "Bikes, scooters, motorcycles, mopeds and electric two-wheelers",
          },
        },
        pickup: {
          label: { en: "PICKUP", hi: "PICKUP" },
          value: {
            en: "Free doorstep pickup — slot confirmed on WhatsApp",
            hi: "Free doorstep pickup — slot confirmed on WhatsApp",
          },
          freeBadge: { en: "100% Free", hi: "100% Free" },
        },
        contact: {
          label: { en: "CALL OR WHATSAPP", hi: "CALL OR WHATSAPP" },
          phoneDisplay: "+91-9839447733",
          phoneTel: "+919839447733",
          whatsappUrl: "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20want%20to%20scrap%20my%20bike/scooter%20in%20Kanpur.",
        },
        facility: {
          label: { en: "VISIT US", hi: "VISIT US" },
          address: "26-A & B, Block-E, Panki, Kalpi Road, Kanpur, Uttar Pradesh 208020",
        },
      },
    },
    popularModels: {
      badge: {
        en: "POPULAR TWO-WHEELERS IN INDIA",
        hi: "POPULAR TWO-WHEELERS IN INDIA",
      },
      h2Part1: {
        en: "India's Most Popular Two-Wheelers —",
        hi: "India's Most Popular Two-Wheelers —",
      },
      h2Highlight: {
        en: "Own an Older One? Check Eligibility",
        hi: "Own an Older One? Check Eligibility",
      },
      introText: {
        en: "Hero Splendor, Honda Activa, Honda Shine, TVS Jupiter and Bajaj Pulsar are among the most popular two-wheelers in India. If you own an older model, share its registration number for a free eligibility check. We can guide you on old scooter scrapping in Kanpur and old motorcycle scrap in Kanpur.",
        hi: "हीरो स्प्लेंडर, होंडा एक्टिवा, होंडा शाइन, टीवीएस जुपिटर और बजाज पल्सर भारत में सबसे लोकप्रिय दोपहिया वाहनों में से हैं। यदि आपके पास कोई पुराना मॉडल है, तो मुफ्त पात्रता जांच के लिए उसका पंजीकरण नंबर साझा करें। हम कानपुर में पुराने स्कूटर स्क्रैपिंग और पुरानी मोटरसाइकिल स्क्रैप पर आपका मार्गदर्शन कर सकते हैं।",
      },
      tableHeaders: {
        col1: { en: "POPULAR TWO-WHEELER", hi: "POPULAR TWO-WHEELER" },
        col2: { en: "TYPE", hi: "TYPE" },
      },
      models: [
        { name: "Hero Splendor", type: "Commuter motorcycle" },
        { name: "Honda Activa", type: "Scooter" },
        { name: "Honda Shine", type: "Commuter motorcycle" },
        { name: "TVS Jupiter", type: "Scooter" },
        { name: "Bajaj Pulsar", type: "Performance motorcycle" },
      ],
      disclaimer: {
        en: "Brand and model names belong to their respective owners and are used for reference only. ScrapCentre is not affiliated with these manufacturers.",
        hi: "Brand and model names belong to their respective owners and are used for reference only. ScrapCentre is not affiliated with these manufacturers.",
      },
      questionsTitle: {
        en: "Popular two-wheeler questions",
        hi: "Popular two-wheeler questions",
      },
      questions: [
        {
          qEn: "Can I scrap my Hero Splendor in Kanpur?",
          qHi: "क्या मैं कानपुर में अपनी हीरो स्प्लेंडर स्क्रैप कर सकता हूँ?",
          aEn: "Yes, your Hero Splendor may be eligible for scrapping. We check eligibility based on the bike’s details, not just its model name. Share your registration number to get a free valuation.",
          aHi: "हाँ, आपकी हीरो स्प्लेंडर स्क्रैपिंग के लिए पात्र हो सकती है। हम केवल मॉडल नाम के आधार पर नहीं, बल्कि बाइक के विवरण के आधार पर पात्रता की जांच करते हैं। मुफ्त मूल्यांकन प्राप्त करने के लिए अपना पंजीकरण नंबर साझा करें।",
        },
        {
          qEn: "Can I scrap my Honda Activa in Kanpur?",
          qHi: "क्या मैं कानपुर में अपना होंडा एक्टिवा स्क्रैप कर सकता हूँ?",
          aEn: "Yes, you can check your Honda Activa’s eligibility by sharing its registration number with us. The assessment depends on the scooter’s details, and we offer a free valuation.",
          aHi: "हाँ, आप अपना पंजीकरण नंबर हमारे साथ साझा करके अपने होंडा एक्टिवा की पात्रता की जांच कर सकते हैं। मूल्यांकन स्कूटर के विवरण पर निर्भर करता है, और हम मुफ्त मूल्यांकन प्रदान करते हैं।",
        },
        {
          qEn: "Can I scrap my Honda Shine in Kanpur?",
          qHi: "क्या मैं कानपुर में अपना होंडा शाइन स्क्रैप कर सकता हूँ?",
          aEn: "Yes, your Honda Shine can be assessed for scrapping based on its vehicle details. Share the registration number with our team to check eligibility and get a free valuation.",
          aHi: "हाँ, आपके होंडा शाइन का वाहन विवरण के आधार पर स्क्रैपिंग के लिए मूल्यांकन किया जा सकता है। पात्रता जांचने और मुफ्त मूल्यांकन प्राप्त करने के लिए हमारी टीम के साथ पंजीकरण नंबर साझा करें।",
        },
        {
          qEn: "Can I scrap my TVS Jupiter in Kanpur?",
          qHi: "क्या मैं कानपुर में अपना टीवीएस जुपिटर स्क्रैप कर सकता हूँ?",
          aEn: "Yes, you can request an eligibility check for your TVS Jupiter. We assess the scooter using its details rather than the model name alone. Share its registration number for a free valuation.",
          aHi: "हाँ, आप अपने टीवीएस जुपिटर के लिए पात्रता जांच का अनुरोध कर सकते हैं। हम केवल मॉडल नाम के बजाय उसके विवरण का उपयोग करके स्कूटर का मूल्यांकन करते हैं। मुफ्त मूल्यांकन के लिए इसका पंजीकरण नंबर साझा करें।",
        },
        {
          qEn: "Can I scrap my Bajaj Pulsar in Kanpur?",
          qHi: "क्या मैं कानपुर में अपना बजाज पल्सर स्क्रैप कर सकता हूँ?",
          aEn: "Yes, you can check whether your Bajaj Pulsar is eligible for scrapping by sharing its registration number. Eligibility depends on the vehicle details, and our team can provide a free valuation.",
          aHi: "हाँ, आप अपना पंजीकरण नंबर साझा करके जांच सकते हैं कि क्या आपका बजाज पल्सर स्क्रैपिंग के लिए पात्र है। पात्रता वाहन के विवरण पर निर्भर करती है, और हमारी टीम मुफ्त मूल्यांकन प्रदान कर सकती है।",
        },
      ],
    },
    redBanner: {
      title: {
        en: "Check Bike & Scooter Pickup in Kanpur",
        hi: "Check Bike & Scooter Pickup in Kanpur",
      },
      subtitle: {
        en: "Average pickup scheduled within 24 hours",
        hi: "Average pickup scheduled within 24 hours",
      },
      ctaText: {
        en: "Check on WhatsApp",
        hi: "Check on WhatsApp",
      },
      ctaUrl: "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20want%20to%20check%20bike/scooter%20pickup%20availability%20in%20Kanpur.",
    },
    process: {
      badge: {
        en: "— PICKUP TO COD",
        hi: "— PICKUP TO COD",
      },
      h2Part1: {
        en: "How Bike & Scooter Scrapping Works in Kanpur —",
        hi: "How Bike & Scooter Scrapping Works in Kanpur —",
      },
      h2Highlight: {
        en: "From Your Home to Your Certificate of Deposit",
        hi: "From Your Home to Your Certificate of Deposit",
      },
      introText: {
        en: (
          <>
            Scrapping your two-wheeler involves four clear stages, from sharing its details to receiving your Certificate of Deposit. For more details, read our{" "}
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
            आपके दोपहिया वाहन को स्क्रैप करने में विवरण साझा करने से लेकर जमा प्रमाणपत्र (COD) प्राप्त करने तक चार स्पष्ट चरण शामिल हैं। अधिक जानकारी के लिए, हमारी{" "}
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
          badge: { en: "FROM HOME", hi: "घर से शुरू" },
          title: { en: "Share Your Bike Number", hi: "अपनी बाइक का नंबर साझा करें" },
          desc: {
            en: "To understand how to scrap a bike in Kanpur, enter your bike or scooter registration number on our website or WhatsApp. Share your Kanpur locality to receive a valuation estimate and confirm your pickup slot on WhatsApp.",
            hi: "कानपुर में बाइक स्क्रैप करने का तरीका समझने के लिए, हमारी वेबसाइट या व्हाट्सएप पर अपनी बाइक या स्कूटर पंजीकरण नंबर दर्ज करें। मूल्यांकन अनुमान प्राप्त करने और स्लॉट की पुष्टि करने के लिए अपना इलाका साझा करें।",
          },
          footerStep: "STEP 01",
        },
        {
          num: "02",
          icon: Truck,
          badge: { en: "PICKUP", hi: "पिकअप" },
          title: { en: "Free Doorstep Pickup", hi: "मुफ्त डोरस्टेप पिकअप" },
          desc: {
            en: "Once your pickup slot is confirmed, we collect your bike or scooter from your doorstep at no cost. Our team also arranges towing support if it cannot be ridden, making motorcycle scrap pickup in Kanpur convenient.",
            hi: "एक बार पिकअप स्लॉट की पुष्टि हो जाने पर, हम आपकी बाइक या स्कूटर को आपके दरवाजे से बिना किसी शुल्क के एकत्र करते हैं। यदि इसे चलाया नहीं जा सकता है तो हमारी टीम टोइंग सहायता भी प्रदान करती है।",
          },
          footerStep: "STEP 02",
        },
        {
          num: "03",
          icon: FileText,
          badge: { en: "PAPERWORK", hi: "कागजी कार्रवाई" },
          title: { en: "Documents & RC Cancellation", hi: "दस्तावेज और RC रद्दीकरण" },
          desc: {
            en: "Hand over the required documents so our team can assist with the necessary paperwork and RC cancellation. Whether you need damaged bike or unfit bike scrapping in Kanpur, we guide you through the documentation process.",
            hi: "आवश्यक दस्तावेज सौंपें ताकि हमारी टीम आवश्यक कागजी कार्रवाई और आरसी रद्दीकरण में सहायता कर सके। चाहे आपको क्षतिग्रस्त बाइक या अनफिट बाइक स्क्रैपिंग की आवश्यकता हो, हम आपका मार्गदर्शन करते हैं।",
          },
          footerStep: "STEP 03",
        },
        {
          num: "04",
          icon: ShieldCheck,
          badge: { en: "AUTHORISED RVSF", hi: "अधिकृत RVSF" },
          title: { en: "Payment & Certificate of Deposit", hi: "भुगतान और जमा प्रमाणपत्र" },
          desc: {
            en: "After your two-wheeler is processed at the authorised RVSF, you receive the applicable payment and a Certificate of Deposit (COD). This certificate records the scrapping process and serves as proof of deposit.",
            hi: "अधिकृत RVSF में आपके दोपहिया वाहन की प्रोसेसिंग के बाद, आपको लागू भुगतान और जमा प्रमाणपत्र (COD) प्राप्त होता है। यह प्रमाणपत्र स्क्रैपिंग प्रक्रिया को रिकॉर्ड करता है और प्रमाण के रूप में कार्य करता है।",
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
        en: "Bike Scrapping Documents in Kanpur —",
        hi: "Bike Scrapping Documents in Kanpur —",
      },
      h2Highlight: {
        en: "Keep These Papers Ready",
        hi: "Keep These Papers Ready",
      },
      introText: {
        en: "Keep your bike scrapping documents ready before the pickup. The usual paperwork includes your Registration Certificate (RC) and owner ID proof. Our team will guide you through the required documents and assist with RC cancellation.",
        hi: "पिकअप से पहले अपने बाइक स्क्रैपिंग दस्तावेज तैयार रखें। सामान्य कागजी कार्रवाई में आपका पंजीकरण प्रमाणपत्र (RC) और मालिक का पहचान प्रमाण शामिल होता है। हमारी टीम आवश्यक दस्तावेजों के माध्यम से आपका मार्गदर्शन करेगी और आरसी रद्दीकरण में सहायता करेगी।",
      },
      leftCard1: {
        title: {
          en: "Not sure which papers apply?",
          hi: "निश्चित नहीं हैं कि कौन से कागजात लागू होते हैं?",
        },
        text: {
          en: "Share your bike or scooter registration number with us on WhatsApp. We’ll confirm which documents you need, as additional paperwork may be required depending on the ownership status.",
          hi: "व्हाट्सएप पर अपनी बाइक या स्कूटर का पंजीकरण नंबर हमारे साथ साझा करें। हम पुष्टि करेंगे कि आपको किन दस्तावेजों की आवश्यकता है, क्योंकि स्वामित्व स्थिति के आधार पर अतिरिक्त कागजी कार्रवाई की आवश्यकता हो सकती है।",
        },
      },
      leftCard2: {
        title: {
          en: "Need the full list?",
          hi: "Need the full list?",
        },
        guideText: "The national guide explains each document in detail:",
        linkText: "vehicle scrapping documents required in India",
        linkHref: "/vehicle-scrapping-services",
      },
      helpCard: {
        badge: { en: "CHECKLIST", hi: "CHECKLIST" },
        title: {
          en: "Documents for a bike or scooter",
          hi: "Documents for a bike or scooter",
        },
        points: [
          {
            en: "Registration Certificate (RC) of the two-wheeler",
            hi: "Registration Certificate (RC) of the two-wheeler",
          },
          {
            en: "ID proof of the registered owner",
            hi: "ID proof of the registered owner",
          },
          {
            en: "Insurance copy and PUC certificate, if available",
            hi: "Insurance copy and PUC certificate, if available",
          },
          {
            en: "Financier NOC, if the two-wheeler is on a loan (hypothecated)",
            hi: "Financier NOC, if the two-wheeler is on a loan (hypothecated)",
          },
        ],
        ctaText: {
          en: "Get the Checklist on WhatsApp",
          hi: "Get the Checklist on WhatsApp",
        },
        whatsappUrl: "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20please%20send%20me%20the%20bike%20scrapping%20documents%20checklist%20for%20Kanpur.",
      },
    },
    scrapValue: {
      badge: {
        en: "— VALUATION",
        hi: "— VALUATION",
      },
      h2Part1: {
        en: "Bike & Scooter Scrap Value in Kanpur —",
        hi: "Bike & Scooter Scrap Value in Kanpur —",
      },
      h2Highlight: {
        en: "What Decides Your Quote?",
        hi: "What Decides Your Quote?",
      },
      introText: {
        en: "The bike scrap price in Kanpur owners receive depends on several factors, not a fixed rate. We assess each two-wheeler individually to estimate its bike scrap value in Kanpur or scooter scrap price in Kanpur, based on its type, condition, completeness, documents and prevailing scrap metal rates.",
        hi: "कानपुर में बाइक मालिकों को मिलने वाला बाइक स्क्रैप मूल्य कई कारकों पर निर्भर करता है, कोई निश्चित दर नहीं होती। हम इसके प्रकार, स्थिति, पूर्णता, दस्तावेजों और प्रचलित स्क्रैप धातु दरों के आधार पर कानपुर में इसके बाइक स्क्रैप मूल्य या कानपुर में स्कूटर स्क्रैप मूल्य का अनुमान लगाने के लिए प्रत्येक दोपहिया वाहन का व्यक्तिगत रूप से आकलन करते हैं।",
      },
      tableHeaders: {
        factor: { en: "FACTOR", hi: "FACTOR" },
        check: { en: "WHAT WE LOOK AT", hi: "WHAT WE LOOK AT" },
        impact: { en: "HOW IT AFFECTS YOUR QUOTE", hi: "HOW IT AFFECTS YOUR QUOTE" },
      },
      factors: [
        {
          factor: { en: "Bike type & weight", hi: "Bike type & weight" },
          icon: Bike,
          check: {
            en: "Motorcycle, scooter or moped, and its weight",
            hi: "Motorcycle, scooter or moped, and its weight",
          },
          impact: {
            en: "Heavier two-wheelers generally have more recoverable material",
            hi: "Heavier two-wheelers generally have more recoverable material",
          },
        },
        {
          factor: { en: "Make, model & year", hi: "Make, model & year" },
          icon: Calendar,
          check: {
            en: "Which bike or scooter it is, its variant and year of manufacture",
            hi: "Which bike or scooter it is, its variant and year of manufacture",
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
            en: "Engine, wheels and body parts present; battery for electric models",
            hi: "Engine, wheels and body parts present; battery for electric models",
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
        en: "Scrapping Something Other Than a Two-Wheeler? —",
        hi: "Scrapping Something Other Than a Two-Wheeler? —",
      },
      h2Highlight: {
        en: "Explore Our Kanpur Pages",
        hi: "Explore Our Kanpur Pages",
      },
      cards: [
        {
          icon: Car,
          title: { en: "Four-Wheeler Scrapping", hi: "फोर-व्हीलर स्क्रैपिंग" },
          desc: {
            en: "Own a car, SUV or hatchback? Visit our dedicated four-wheeler scrapping page for details on pickup, paperwork and valuation.",
            hi: "क्या आपके पास कार, एसयूवी या हैचबैक है? पिकअप, कागजी कार्रवाई और मूल्यांकन के विवरण के लिए हमारे समर्पित फोर-व्हीलर स्क्रैपिंग पेज पर जाएं।",
          },
          linkText: { en: "Car Scrapping in Kanpur", hi: "कानपुर में कार स्क्रैपिंग" },
          href: "/four-wheeler-scrapping-kanpur",
        },
        {
          icon: Truck,
          title: { en: "Trucks, Buses & More", hi: "ट्रक, बसें और अधिक" },
          desc: {
            en: "Our vehicle scrapping services in Kanpur also cover trucks, buses, autos, tractors, commercial vehicles and fleets.",
            hi: "कानपुर में हमारी वाहन स्क्रैपिंग सेवाएं ट्रकों, बसों, ऑटो, ट्रैक्टरों, वाणिज्यिक वाहनों और फ्लीट को भी कवर करती हैं।",
          },
          linkText: { en: "Vehicle Scrapping in Kanpur", hi: "कानपुर में वाहन स्क्रैपिंग" },
          href: "/vehicle-scrapping-services-kanpur",
        },
        {
          icon: MapPin,
          title: { en: "Pickup Areas in Kanpur", hi: "कानपुर में पिकअप क्षेत्र" },
          desc: {
            en: "Check the pickup areas in Kanpur to see where we arrange collection and how to reach our facility.",
            hi: "कानपुर में पिकअप क्षेत्र देखें कि हम कहाँ संग्रह की व्यवस्था करते हैं और हमारी सुविधा तक कैसे पहुँचें।",
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
        en: "Bike & Scooter Scrapping in Kanpur —",
        hi: "Bike & Scooter Scrapping in Kanpur —",
      },
      h2Highlight: {
        en: "Questions Riders Ask",
        hi: "Questions Riders Ask",
      },
      subtitle: {
        textBeforeLink: {
          en: "Quick answers for two-wheeler owners in Kanpur. For general questions on scrapping rules in India, see the",
          hi: "Quick answers for two-wheeler owners in Kanpur. For general questions on scrapping rules in India, see the",
        },
        linkText: {
          en: "main FAQ",
          hi: "main FAQ",
        },
        linkHref: "/#faq",
      },
      items: [
        {
          qEn: "Where can I scrap my bike or scooter in Kanpur?",
          qHi: "कानपुर में मैं अपनी बाइक या स्कूटर कहाँ स्क्रैप कर सकता हूँ?",
          aEn: "You can scrap your two-wheeler through our authorised RVSF facility in Panki, Kalpi Road, Kanpur. If you're searching for where to scrap a bike in Kanpur, share your registration number on our website or WhatsApp to get a free valuation and check eligibility.",
          aHi: "आप अपने दोपहिया वाहन को पनकी, कालपी रोड, कानपुर स्थित हमारी अधिकृत RVSF सुविधा के माध्यम से स्क्रैप कर सकते हैं। यदि आप खोज रहे हैं कि कानपुर में बाइक कहाँ स्क्रैप करें, तो मुफ्त मूल्यांकन प्राप्त करने और पात्रता जांचने के लिए हमारी वेबसाइट या व्हाट्सएप पर अपना पंजीकरण नंबर साझा करें।",
        },
        {
          qEn: "Do I need to bring my bike to you, or do you pick it up?",
          qHi: "क्या मुझे अपनी बाइक आपके पास लानी होगी, या आप इसे पिक करते हैं?",
          aEn: "You don't need to bring your two-wheeler to the facility. Our free bike pickup in Kanpur collects bikes and scooters from your doorstep, with the pickup slot confirmed on WhatsApp. If your bike cannot be ridden, we also provide towing support through our bike scrap pickup in Kanpur.",
          aHi: "आपको अपने दोपहिया वाहन को सुविधा केंद्र तक लाने की आवश्यकता नहीं है। कानपुर में हमारा मुफ्त बाइक पिकअप आपके दरवाजे से बाइक और स्कूटर एकत्र करता है, जिसका पिकअप स्लॉट व्हाट्सएप पर पुष्टि होता है। यदि आपकी बाइक चलाई नहीं जा सकती है, तो हम टोइंग सहायता भी प्रदान करते हैं।",
        },
        {
          qEn: "Can I scrap a non-running or accident-damaged bike in Kanpur?",
          qHi: "क्या मैं कानपुर में गैर-चालू या दुर्घटनाग्रस्त बाइक को स्क्रैप कर सकता हूँ?",
          aEn: "Yes, old, non-running and accident-damaged two-wheelers can be assessed for eligibility. Whether you need accidental bike scrapping in Kanpur or damaged bike scrapping in Kanpur, share your registration number and vehicle details so our team can guide you through the next steps.",
          aHi: "हाँ, पुरानी, गैर-चालू और दुर्घटनाग्रस्त दोपहिया वाहनों की पात्रता का मूल्यांकन किया जा सकता है। चाहे आपको कानपुर में एक्सीडेंटल बाइक स्क्रैपिंग की आवश्यकता हो या डैमेज्ड बाइक स्क्रैपिंग की, अपना पंजीकरण नंबर और वाहन विवरण साझा करें ताकि हमारी टीम आपका मार्गदर्शन कर सके।",
        },
        {
          qEn: "Which documents are needed to scrap a bike in Kanpur?",
          qHi: "कानपुर में बाइक स्क्रैप करने के लिए किन दस्तावेजों की आवश्यकता होती है?",
          aEn: "The usual bike scrapping documents in Kanpur owners need include the Registration Certificate (RC), owner ID proof, an insurance copy and a PUC certificate, if available. If the bike is under a loan, a financier NOC may be required. Additional documents may depend on the ownership status.",
          aHi: "कानपुर में बाइक स्क्रैपिंग के लिए आवश्यक सामान्य दस्तावेजों में पंजीकरण प्रमाणपत्र (RC), मालिक का पहचान प्रमाण, बीमा प्रति और पीयूसी प्रमाणपत्र (यदि उपलब्ध हो) शामिल हैं। यदि बाइक लोन पर है, तो फाइनेंसर एनओसी की आवश्यकता हो सकती है। स्वामित्व स्थिति के आधार पर अतिरिक्त दस्तावेज आवश्यक हो सकते हैं।",
        },
        {
          qEn: "How much will I get for scrapping my bike or scooter in Kanpur?",
          qHi: "कानपुर में अपनी बाइक या स्कूटर को स्क्रैप करने पर मुझे कितना मिलेगा?",
          aEn: "Your bike scrapping price in Kanpur depends on factors such as the two-wheeler's type, weight, age, condition, completeness and prevailing scrap metal rates. The bike scrap value Kanpur team provides is based on a free valuation of your specific bike or scooter, rather than a fixed price.",
          aHi: "कानपुर में आपका बाइक स्क्रैप मूल्य दोपहिया वाहन के प्रकार, वजन, आयु, स्थिति, पूर्णता और प्रचलित स्क्रैप धातु दरों जैसे कारकों पर निर्भर करता है। हमारी टीम एक निश्चित मूल्य के बजाय आपकी विशिष्ट बाइक या स्कूटर के मुफ्त मूल्यांकन के आधार पर मूल्य प्रदान करती है।",
        },
        {
          qEn: "Do I get a Certificate of Deposit for my bike or scooter?",
          qHi: "क्या मुझे अपनी बाइक या स्कूटर के लिए जमा प्रमाणपत्र (COD) मिलता है?",
          aEn: "Yes. Once your two-wheeler is processed through the authorised scrapping process, a Certificate of Deposit (COD) is issued. It serves as a record of the vehicle's deposit for scrapping. Our team can also assist with the related paperwork and RC cancellation process.",
          aHi: "हाँ। एक बार जब आपका दोपहिया वाहन अधिकृत स्क्रैपिंग प्रक्रिया से गुजरता है, तो एक जमा प्रमाणपत्र (COD) जारी किया जाता है। यह स्क्रैपिंग के लिए वाहन जमा करने के रिकॉर्ड के रूप में कार्य करता है। हमारी टीम संबंधित कागजी कार्रवाई और आरसी रद्दीकरण में भी सहायता कर सकती है।",
        },
        {
          qEn: "Can I scrap an electric scooter or e-bike in Kanpur?",
          qHi: "क्या मैं कानपुर में इलेक्ट्रिक स्कूटर या ई-बाइक स्क्रैप कर सकता हूँ?",
          aEn: "Yes, electric two-wheelers can be assessed for eligibility through the appropriate authorised scrapping process. If you need electric scooter scrapping, electric bike scrapping or EV two-wheeler scrapping in Kanpur, contact our team with your vehicle details to confirm the applicable process.",
          aHi: "हाँ, उचित अधिकृत स्क्रैपिंग प्रक्रिया के माध्यम से इलेक्ट्रिक दोपहिया वाहनों की पात्रता का मूल्यांकन किया जा सकता है। यदि आपको कानपुर में इलेक्ट्रिक स्कूटर या ईवी टू-व्हीलर स्क्रैपिंग की आवश्यकता है, तो लागू प्रक्रिया की पुष्टि करने के लिए अपने वाहन विवरण के साथ हमारी टीम से संपर्क करें।",
        },
        {
          qEn: "Can I scrap a popular model such as a Splendor, Activa or Pulsar?",
          qHi: "क्या मैं स्प्लेंडर, एक्टिवा या पल्सर जैसे लोकप्रिय मॉडल को स्क्रैप कर सकता हूँ?",
          aEn: "Yes, you can request an eligibility check for models such as the Hero Splendor, Honda Activa or Bajaj Pulsar. Eligibility depends on the vehicle's details, not just its model name. Share the registration number to receive a free valuation and find out the next steps.",
          aHi: "हाँ, आप हीरो स्प्लेंडर, होंडा एक्टिवा या बजाज पल्सर जैसे मॉडलों के लिए पात्रता जांच का अनुरोध कर सकते हैं। पात्रता केवल मॉडल के नाम पर नहीं, बल्कि वाहन के विवरण पर निर्भर करती है। मुफ्त मूल्यांकन प्राप्त करने और अगले कदम जानने के लिए पंजीकरण नंबर साझा करें।",
        },
      ],
      helpCard: {
        title: {
          en: "Still Have Questions?",
          hi: "Still Have Questions?",
        },
        subtitle: {
          en: "Our team is happy to help. Call or message us anytime.",
          hi: "Our team is happy to help. Call or message us anytime.",
        },
        phoneDisplay: "+91-9839447733",
        phoneTel: "+919839447733",
        whatsappUrl: "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20have%20a%20question%20about%20bike%20scrapping%20in%20Kanpur.",
      },
    },
    bottomCta: {
      badge: {
        en: "✦ FAST & FREE DOORSTEP PICKUP",
        hi: "✦ FAST & FREE DOORSTEP PICKUP",
      },
      h2: {
        en: "Book Your Bike or Scooter Pickup in Kanpur",
        hi: "Book Your Bike or Scooter Pickup in Kanpur",
      },
      supportingIntro: {
        en: "Ready to scrap your old bike or scooter?",
        hi: "Ready to scrap your old bike or scooter?",
      },
      supportingDesc: {
        en: "Get a free valuation, doorstep pickup, and official Certificate of Deposit (COD) through Kanpur's registered RVSF.",
        hi: "Get a free valuation, doorstep pickup, and official Certificate of Deposit (COD) through Kanpur's registered RVSF.",
      },
      trustBadges: [
        { icon: ShieldCheck, text: { en: "Authorised RVSF process", hi: "Authorised RVSF process" } },
        { icon: Truck, text: { en: "Free doorstep pickup", hi: "Free doorstep pickup" } },
        { icon: IndianRupee, text: { en: "Instant payment", hi: "Instant payment" } },
      ],
      formBadge: {
        en: "INSTANT VALUATION",
        hi: "INSTANT VALUATION",
      },
      formTitle: {
        en: "Get Your Free Two-Wheeler Valuation",
        hi: "Get Your Free Two-Wheeler Valuation",
      },
      formSubtitle: {
        en: "Enter your bike or scooter registration number for an instant quote.",
        hi: "Enter your bike or scooter registration number for an instant quote.",
      },
      hideVehicleInput: true,
      ctaButtonText: {
        en: "Get Free Valuation",
        hi: "Get Free Valuation",
      },
      whatsappButtonText: {
        en: "Inquire on WhatsApp",
        hi: "Inquire on WhatsApp",
      },
      guaranteeText: {
        en: "✓ 100% Free · No obligation · Pickup confirmed on WhatsApp",
        hi: "✓ 100% Free · No obligation · Pickup confirmed on WhatsApp",
      },
    },
    phoneConfig: {
      phoneDisplay: "+91-9839447733",
      phoneTel: "+919839447733",
      whatsappUrl: "https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20have%20a%20two-wheeler%20to%20scrap%20in%20Kanpur.",
      facilityAddress: "26-A & B, Block-E, Panki, Kalpi Road, Kanpur - 208020",
    },
  }

  return <VehicleCategoryTemplate isHindi={isHindi} config={twoWheelerKanpurConfig} />
}
