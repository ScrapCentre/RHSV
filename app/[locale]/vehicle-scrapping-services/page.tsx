import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { getAlternates } from "@/lib/seo/getAlternates"
import VehicleScrappingServicesClient from "@/components/VehicleScrappingServicesClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  const isHindi = typedLocale === "hi"
  const alternates = getAlternates(typedLocale, "/vehicle-scrapping-services")

  const title = isHindi
    ? "भारत में वाहन स्क्रैपिंग सेवाएं | ScrapCentre"
    : "Vehicle Scrapping Services in India | ScrapCentre"
  const description = isHindi
    ? "RVSF-प्रमाणित जमा, मुफ्त डोरस्टेप पिकअप और सर्वोत्तम स्क्रैप मूल्य के साथ पेशेवर वाहन स्क्रैपिंग सेवाएं। आज ही स्क्रैपसेंटर के साथ अपनी वाहन स्क्रैपिंग बुक करें!"
    : "Professional vehicle scrapping services with RVSF-certified deposit, free doorstep pickup, and best scrap value. Book your vehicle scrapping with ScrapCentre today!"

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      locale: isHindi ? "hi_IN" : "en_IN",
      siteName: "ScrapCentre",
      type: "website",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: "ScrapCentre Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"],
    },
  }
}

export default async function VehicleScrappingServicesLocalePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  setRequestLocale(typedLocale)

  const isHindi = typedLocale === "hi"
  const pageUrl = `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/vehicle-scrapping-services`
  const homeUrl = `https://www.scrapcentre.com${isHindi ? "/hi" : "/"}`

  // 1. WebPage Schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    "url": pageUrl,
    "name": isHindi ? "भारत में वाहन स्क्रैपिंग सेवाएं | ScrapCentre" : "Vehicle Scrapping Services in India | ScrapCentre",
    "description": isHindi
      ? "RVSF-प्रमाणित जमा, मुफ्त डोरस्टेप पिकअप और सर्वोत्तम स्क्रैप मूल्य के साथ पेशेवर वाहन स्क्रैपिंग सेवाएं।"
      : "Professional vehicle scrapping services with RVSF-certified deposit, free doorstep pickup, and best scrap value.",
    "isPartOf": { "@id": "https://www.scrapcentre.com/#website" },
    "about": { "@id": `${pageUrl}#service` },
    "publisher": { "@id": "https://www.scrapcentre.com/#organization" },
    "breadcrumb": { "@id": `${pageUrl}#breadcrumb` },
    "mainEntity": { "@id": `${pageUrl}#service` },
    "inLanguage": isHindi ? "hi-IN" : "en-IN",
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": "https://www.scrapcentre.com/logo.png",
    },
  }

  // 2. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": isHindi ? "मुख्य पृष्ठ" : "Home",
        "item": homeUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": isHindi ? "वाहन स्क्रैपिंग सेवाएं" : "Vehicle Scrapping Services",
        "item": pageUrl,
      },
    ],
  }

  // 3. Service Schema (with OfferCatalog, Audience, AggregateRating & Reviews)
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    "name": isHindi ? "वाहन स्क्रैपिंग सेवाएं | ScrapCentre" : "Vehicle Scrapping Services by ScrapCentre",
    "serviceType": isHindi
      ? "वाहन स्क्रैपिंग, RVSF जमा प्रमाणपत्र (COD) और आरसी डी-रजिस्ट्रेशन सहायता"
      : "Vehicle scrapping, RVSF Certificate of Deposit (COD) issuance and RC cancellation support",
    "description": isHindi
      ? "अधिकृत RVSF में कानूनी रूप से अपने वाहन को स्क्रैप करें और सर्वोत्तम मूल्य, मुफ्त पिकअप और परेशानी मुक्त सहायता प्राप्त करें।"
      : "Scrap your vehicle legally at an authorised RVSF and get the best value, free doorstep pickup and hassle-free support. Available for individual owners and businesses across car, bike, bus, truck and other vehicle types.",
    "url": pageUrl,
    "provider": { "@id": "https://www.scrapcentre.com/#organization" },
    "areaServed": [
      { "@type": "City", "name": "Kanpur" },
      { "@type": "City", "name": "Etawah" },
      { "@type": "City", "name": "Auraiya" },
    ],
    "audience": {
      "@type": "Audience",
      "audienceType": isHindi ? "व्यक्तिगत वाहन मालिक और व्यवसाय" : "Individual vehicle owners and businesses",
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "ScrapCentre Vehicle Scrapping Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "url": `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/quote?type=car`,
          "itemOffered": {
            "@type": "Service",
            "name": isHindi ? "कार स्क्रैपिंग" : "Car Scrapping",
            "description": isHindi
              ? "मूल्यांकन, पिकअप और दस्तावेज़ सहायता के साथ अधिकृत प्रक्रिया के माध्यम से पुरानी, क्षतिग्रस्त या जीवन समाप्त कारों को स्क्रैप करें।"
              : "Scrap old, damaged or end-of-life cars through an authorised process, with valuation, pickup and documentation support.",
            "provider": { "@id": "https://www.scrapcentre.com/#organization" },
          },
        },
        {
          "@type": "Offer",
          "url": `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/quote?type=bike`,
          "itemOffered": {
            "@type": "Service",
            "name": isHindi ? "बाइक स्क्रैपिंग" : "Bike Scrapping",
            "description": isHindi
              ? "उचित स्क्रैपिंग प्रक्रिया के माध्यम से अपनी पुरानी या अयोग्य बाइक को स्क्रैप करें।"
              : "Scrap your old or unfit bike through a proper scrapping process, with support from vehicle valuation and pickup to the required documentation.",
            "provider": { "@id": "https://www.scrapcentre.com/#organization" },
          },
        },
        {
          "@type": "Offer",
          "url": `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/quote?type=bus`,
          "itemOffered": {
            "@type": "Service",
            "name": isHindi ? "बस स्क्रैपिंग" : "Bus Scrapping",
            "description": isHindi
              ? "पुराने या अयोग्य बसों को अधिकृत वाहन स्क्रैपिंग सुविधा के माध्यम से संसाधित किया जा सकता है।"
              : "Old or unfit buses can be processed through an authorised vehicle scrapping facility, with support for collection and the required scrapping formalities.",
            "provider": { "@id": "https://www.scrapcentre.com/#organization" },
          },
        },
        {
          "@type": "Offer",
          "url": `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/quote?type=truck`,
          "itemOffered": {
            "@type": "Service",
            "name": isHindi ? "ट्रक स्क्रैपिंग" : "Truck Scrapping",
            "description": isHindi
              ? "दस्तावेजी प्रक्रिया के माध्यम से पुराने, क्षतिग्रस्त या जीवन समाप्त ट्रक को स्क्रैप करें।"
              : "Scrap an old, damaged or end-of-life truck through a documented process, with valuation, pickup and scrapping support.",
            "provider": { "@id": "https://www.scrapcentre.com/#organization" },
          },
        },
        {
          "@type": "Offer",
          "url": `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/quote?type=auto`,
          "itemOffered": {
            "@type": "Service",
            "name": isHindi ? "ऑटो-रिक्शा स्क्रैपिंग" : "Auto-Rickshaw Scrapping",
            "description": isHindi
              ? "पिकअप, दस्तावेज़ीकरण और वाहन डी-रजिस्ट्रेशन के लिए सहायता के साथ ऑटो-रिक्शा स्क्रैप करें।"
              : "Scrap an old or unfit auto-rickshaw through an authorised process with support for pickup, documentation and vehicle deregistration.",
            "provider": { "@id": "https://www.scrapcentre.com/#organization" },
          },
        },
        {
          "@type": "Offer",
          "url": `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/quote?type=fleet`,
          "itemOffered": {
            "@type": "Service",
            "name": isHindi ? "वाणिज्यिक वाहन स्क्रैपिंग" : "Commercial Vehicle Scrapping",
            "description": isHindi
              ? "योग्य वाणिज्यिक वाहन जिन्होंने अपना उपयोगी जीवन पूरा कर लिया है, उनके लिए अधिकृत स्क्रैपिंग।"
              : "Eligible commercial vehicles that have reached the end of their usable life, with valuation, collection and scrapping formalities support.",
            "provider": { "@id": "https://www.scrapcentre.com/#organization" },
          },
        },
        {
          "@type": "Offer",
          "url": `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/quote?type=ev`,
          "itemOffered": {
            "@type": "Service",
            "name": isHindi ? "इलेक्ट्रिक वाहन (EV) स्क्रैपिंग" : "Electric Vehicle (EV) Scrapping",
            "description": isHindi
              ? "पुराने, क्षतिग्रस्त या जीवन समाप्त EVs को उपयुक्त अधिकृत स्क्रैपिंग मार्ग के माध्यम से संसाधित किया जाता है।"
              : "Old, damaged or end-of-life EVs processed through the appropriate authorised scrapping and recycling route.",
            "provider": { "@id": "https://www.scrapcentre.com/#organization" },
          },
        },
        {
          "@type": "Offer",
          "url": `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/quote?type=agri`,
          "itemOffered": {
            "@type": "Service",
            "name": isHindi ? "औद्योगिक और कृषि वाहन स्क्रैपिंग" : "Industrial & Agricultural Vehicle Scrapping",
            "description": isHindi
              ? "पुराने, क्षतिग्रस्त या उपयोग में न आने वाले औद्योगिक और कृषि वाहनों को स्क्रैप करें।"
              : "Scrap eligible industrial and agricultural vehicles that are old, damaged or no longer in use, with support through the required scrapping process.",
            "provider": { "@id": "https://www.scrapcentre.com/#organization" },
          },
        },
      ],
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "15000",
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5",
        },
        "author": {
          "@type": "Person",
          "name": "Amit Patel",
        },
        "reviewBody": "The process was quick, transparent and I got the best value for my old car. Highly recommended!",
      },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5",
        },
        "author": {
          "@type": "Person",
          "name": "Neha Sharma",
        },
        "reviewBody": "Very professional team and hassle-free documentation. Payment was done instantly. Great experience!",
      },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5",
        },
        "author": {
          "@type": "Person",
          "name": "Rohit Verma",
        },
        "reviewBody": "I compared many platforms but got the best price here. Super smooth and trustworthy service.",
      },
    ],
  }

  // 4. FAQPage Schema (All 8 FAQs matching exact requested JSON-LD)
  const faqList = isHindi
    ? [
        {
          question: "क्या भारत में वाहन स्क्रैपिंग अनिवार्य है?",
          answer: "भारत में हर वाहन के लिए वाहन स्क्रैपिंग अनिवार्य नहीं है। हालांकि, लागू नियमों के तहत जो वाहन निरंतर उपयोग के लिए योग्य नहीं हैं, उन्हें स्क्रैप या डी-रजिस्टर करने की आवश्यकता हो सकती है। वाहन स्क्रैपेज नीति भारत ढांचा वाहन की आयु, फिटनेस और पंजीकरण से संबंधित आवश्यकताओं को कवर करता है।",
        },
        {
          question: "मुझे अपना वाहन स्क्रैप करने पर कितना मिलेगा?",
          answer: "राशि वाहन के प्रकार, वजन, स्थिति और लागू स्क्रैप दरों पर निर्भर करती है। आपका वाहन स्क्रैप मूल्य पात्र लाभों और वर्तमान मूल्यांकन कारकों के आधार पर भी भिन्न हो सकता है। वाहन-विशिष्ट मूल्यांकन आपको स्क्रैपिंग के साथ आगे बढ़ने से पहले एक अधिक सटीक अनुमान दे सकता है।",
        },
        {
          question: "मुझे अपनी कार या बाइक को स्क्रैप करने के लिए किन दस्तावेजों की आवश्यकता है?",
          answer: "आपको आमतौर पर वाहन का पंजीकरण प्रमाणपत्र (RC) और पंजीकृत मालिक का पहचान प्रमाण चाहिए। यदि उपलब्ध हो तो PUC और बीमा प्रतियां भी आवश्यक हो सकती हैं। दृष्टिबंधक वाहन के लिए फाइनेंसर NOC की आवश्यकता हो सकती है। पिकअप से पहले आवश्यक वाहन स्क्रैपिंग दस्तावेजों की जांच करें।",
        },
        {
          question: "क्या आप दोपहिया, बस और ट्रक भी स्क्रैप करते हैं?",
          answer: "हाँ, स्क्रैपसेंटर योग्य दोपहिया, बस, ट्रक, ऑटो-रिक्शा, वाणिज्यिक वाहन, ईवी और अन्य वाहन प्रकारों को स्वीकार करता है। वाहन स्क्रैपेज नीति भारत ढांचे के तहत आवश्यकताएं श्रेणी के अनुसार भिन्न हो सकती हैं। अधिकृत स्क्रैपिंग प्रक्रिया शुरू करने से पहले वाहन की पात्रता की जांच की जा सकती है।",
        },
        {
          question: "क्या पिकअप वास्तव में मुफ्त है?",
          answer: "हाँ, लागू शर्तों और सेवा उपलब्धता के अधीन, पात्र सेवा स्थानों से स्क्रैपिंग के लिए मुफ्त कार पिकअप उपलब्ध है। यह मालिकों को स्वयं सुविधा के लिए एंड ऑफ लाइफ वाहन ले जाने के बजाय वाहन संग्रह की व्यवस्था करने की अनुमति देता है। गैर-चालू वाहनों के लिए पिकअप सहायता भी उपलब्ध हो सकती है।",
        },
        {
          question: "जमा प्रमाणपत्र (COD) क्या है?",
          answer: "एक जमा प्रमाणपत्र (COD) तब जारी किया जाता है जब स्क्रैपिंग के लिए किसी अधिकृत RVSF के पास वाहन जमा किया जाता है। यह पुष्टि करता है कि वाहन ने अधिकृत स्क्रैपिंग प्रक्रिया में प्रवेश किया है और इसके स्थायी डी-रजिस्ट्रेशन का समर्थन करता है। अधिकृत सुविधा के माध्यम से एंड ऑफ लाइफ वाहन रीसाइक्लिंग पूरा करते समय यह एक महत्वपूर्ण दस्तावेज है।",
        },
        {
          question: "क्या मैं RC या बीमा के बिना वाहन स्क्रैप कर सकता हूँ?",
          answer: "यदि RC या बीमा दस्तावेज़ अनुपलब्ध है तो भी वाहन स्क्रैपिंग के लिए योग्य हो सकता है, लेकिन आवश्यक सत्यापन और सहायक दस्तावेजों की पुष्टि पहले की जानी चाहिए। गायब दस्तावेज़ प्रक्रिया को प्रभावित कर सकते हैं। डोरस्टेप कार स्क्रैपिंग के लिए, आवश्यकताओं की जांच के लिए अपने उपलब्ध वाहन और स्वामित्व विवरण साझा करें।",
        },
        {
          question: "पूरी प्रक्रिया में कितना समय लगता है?",
          answer: "समय सीमा दस्तावेज सत्यापन, वाहन पिकअप, निरीक्षण और अधिकृत सुविधा में प्रसंस्करण पर निर्भर करती है। वाहन प्राप्त होने और सत्यापित होने के बाद ELV रीसाइक्लिंग और डी-रजिस्ट्रेशन लागू प्रक्रिया का पालन करते हैं। स्क्रैपसेंटर आपके वाहन विवरण, स्थान और दस्तावेजों की समीक्षा के बाद एक अनुमानित समय सीमा प्रदान कर सकता है।",
        },
      ]
    : [
        {
          question: "Is vehicle scrapping mandatory in India?",
          answer: "Vehicle scrapping is not mandatory for every vehicle in India. However, vehicles that are no longer eligible for continued use under applicable rules may need to be scrapped or deregistered. The vehicle scrappage policy India framework covers requirements related to vehicle age, fitness and registration.",
        },
        {
          question: "How much can I get for scrapping my vehicle?",
          answer: "The amount depends on the vehicle type, weight, condition and applicable scrap rates. Your vehicle scrap price may also vary based on eligible benefits and current valuation factors. A vehicle-specific valuation can give you a more accurate estimate before you proceed with scrapping.",
        },
        {
          question: "What documents do I need to scrap my car or bike?",
          answer: "You generally need the vehicle's Registration Certificate (RC) and the registered owner's ID proof. PUC and insurance copies may also be required if available. A financier NOC may be needed for a hypothecated vehicle. Check the required vehicle scrapping documents before pickup.",
        },
        {
          question: "Do you scrap two-wheelers, buses and trucks too?",
          answer: "Yes, ScrapCentre accepts eligible two-wheelers, buses, trucks, auto-rickshaws, commercial vehicles, EVs and other vehicle types. Requirements can vary by category under the vehicle scrapping policy India framework. The vehicle's eligibility can be checked before starting the authorised scrapping process.",
        },
        {
          question: "Is the pickup really free?",
          answer: "Yes, free car pickup for scrapping is available from eligible service locations, subject to applicable terms and service availability. This allows owners to arrange vehicle collection instead of taking an end of life vehicle to the facility themselves. Pickup support may also be available for non-running vehicles.",
        },
        {
          question: "What is a Certificate of Deposit (COD)?",
          answer: "A Certificate of Deposit (COD) is issued when a vehicle is deposited with an authorised RVSF for scrapping. It confirms that the vehicle has entered the authorised scrapping process and supports its permanent deregistration. It is an important document when completing end of life vehicle recycling through an authorised facility.",
        },
        {
          question: "Can I scrap a vehicle without RC or insurance?",
          answer: "A vehicle may still be eligible for scrapping if the RC or insurance document is unavailable, but the required verification and supporting documents should be confirmed first. Missing documents may affect the process. For doorstep car scrapping, share your available vehicle and ownership details to check the requirements.",
        },
        {
          question: "How long does the whole process take?",
          answer: "The timeline depends on document verification, vehicle pickup, inspection and processing at the authorised facility. ELV recycling and deregistration follow the applicable process after the vehicle is received and verified. ScrapCentre can provide an estimated timeline after reviewing your vehicle details, location and documents.",
        },
      ]

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    "mainEntity": faqList.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  }

  // 5. HowTo Schema (4-step process with anchors step-1..step-4)
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${pageUrl}#howto`,
    "name": isHindi
      ? "वाहन स्क्रैपिंग कैसे काम करता है — कोट से जमा प्रमाणपत्र तक"
      : "How Vehicle Scrapping Works — From Quote to Certificate of Deposit",
    "description": isHindi
      ? "मूल्यांकन प्राप्त करने से लेकर अपना जमा प्रमाणपत्र प्राप्त करने तक, वाहन स्क्रैपिंग प्रक्रिया को सरल बनाने के लिए डिज़ाइन किया गया है।"
      : "The vehicle scrapping process is designed to make scrapping an old or end-of-life vehicle simple, from getting a valuation to receiving your Certificate of Deposit.",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": isHindi ? "अपना वाहन विवरण साझा करें" : "Share Your Vehicle Details",
        "text": isHindi
          ? "अपने वाहन के लिए अनुमान प्राप्त करने के लिए अपना वाहन नंबर और बुनियादी विवरण प्रदान करें।"
          : "Provide your vehicle number and basic details to receive an estimate for your vehicle.",
        "url": `${pageUrl}#step-1`,
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": isHindi ? "मुफ्त डोरस्टेप पिकअप प्राप्त करें" : "Get Free Doorstep Pickup",
        "text": isHindi
          ? "एक बार स्क्रैपिंग की पुष्टि होने के बाद, हम मुफ्त डोरस्टेप पिकअप की व्यवस्था करते हैं। गैर-चालू स्थिति में वाहनों के लिए टोइंग सहायता उपलब्ध है।"
          : "Once the scrapping is confirmed, we arrange free doorstep pickup. Towing support is available for vehicles that are not in running condition.",
        "url": `${pageUrl}#step-2`,
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": isHindi ? "दस्तावेजीकरण और RC रद्दीकरण पूरा करें" : "Complete Documentation & RC Cancellation",
        "text": isHindi
          ? "कार स्क्रैपिंग प्रक्रिया के हिस्से के रूप में आवश्यक दस्तावेज जमा करें और आवश्यक कागजी कार्रवाई और आरसी रद्दीकरण के साथ सहायता प्राप्त करें।"
          : "Submit the required documents and get support with the necessary paperwork and RC cancellation as part of the car scrapping process.",
        "url": `${pageUrl}#step-3`,
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": isHindi ? "भुगतान और जमा प्रमाणपत्र प्राप्त करें" : "Receive Payment & Certificate of Deposit",
        "text": isHindi
          ? "एक बार जब वाहन को अधिकृत RVSF में संसाधित किया जाता है, तो आपको लागू भुगतान और जमा प्रमाणपत्र (COD) प्राप्त होता है।"
          : "Once the vehicle is processed at the authorised RVSF, you receive the applicable payment and Certificate of Deposit (COD).",
        "url": `${pageUrl}#step-4`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <VehicleScrappingServicesClient />
    </>
  )
}
