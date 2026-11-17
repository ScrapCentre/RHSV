import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { getAlternates } from "@/lib/seo/getAlternates"
import EtawahScrappingClient from "@/components/EtawahScrappingClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  const isHindi = typedLocale === "hi"
  const alternates = getAlternates(typedLocale, "/vehicle-scrapping-services-etawah")

  const title = isHindi
    ? "इटावा में वाहन स्क्रैपिंग सेवाएं — अधिकृत RVSF, मुफ्त डोरस्टेप पिकअप | ScrapCentre"
    : "Vehicle Scrapping Services in Etawah | ScrapCentre"
  const description = isHindi
    ? "इटावा में अधिकृत वाहन स्क्रैपिंग सेवाएं। पुरानी कार, बाइक, ट्रक, बस और ऑटो के लिए मुफ्त डोरस्टेप पिकअप, सरकारी जमा प्रमाणपत्र (CoD) और आरसी रद्दीकरण सहायता।"
    : "Looking for vehicle scrapping services in Etawah? Get free vehicle valuation, free doorstep pickup, RC cancellation assistance and an official Certificate of Deposit through ScrapCentre’s authorised RVSF."

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
          alt: "ScrapCentre Etawah Vehicle Scrapping Services",
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

export default async function VehicleScrappingServicesEtawahPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  setRequestLocale(typedLocale)

  const isHindi = typedLocale === "hi"
  const pageUrl = `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/vehicle-scrapping-services-etawah`
  const homeUrl = `https://www.scrapcentre.com${isHindi ? "/hi" : "/"}`

  // 1. WebPage Schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: isHindi
      ? "इटावा में वाहन स्क्रैपिंग सेवाएं | ScrapCentre"
      : "Vehicle Scrapping Services in Etawah | ScrapCentre",
    description: isHindi
      ? "इटावा में आधिकारिक अधिकृत वाहन स्क्रैपिंग सेवाएं। परिवहन पोर्टल से तुरंत जमा प्रमाणपत्र (CoD) और मुफ्त डोरस्टेप पिकअप।"
      : "Official authorized vehicle scrapping services in Etawah. Instant Certificate of Deposit (CoD) via Parivahan, RC cancellation and free doorstep pickup.",
    isPartOf: { "@id": "https://www.scrapcentre.com/#website" },
    about: { "@id": `${pageUrl}#service` },
    publisher: { "@id": "https://www.scrapcentre.com/#organization" },
    inLanguage: isHindi ? "hi-IN" : "en-IN",
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: "https://www.scrapcentre.com/logo.png",
    },
  }

  // 2. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isHindi ? "मुख्य पृष्ठ" : "Home",
        item: homeUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isHindi ? "इटावा वाहन स्क्रैपिंग" : "Vehicle Scrapping Services Etawah",
        item: pageUrl,
      },
    ],
  }

  // 3. LocalBusiness / AutomotiveBusiness Schema for RVSF serving Etawah
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["AutomotiveBusiness", "LocalBusiness"],
    "@id": `${pageUrl}#localbusiness`,
    name: "ScrapCentre - Registered Vehicle Scrapping Facility Etawah Service",
    url: pageUrl,
    telephone: "+91-9839447733",
    email: "contact@scrapcentre.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "26-A & B, Block-E, Panki, Kalpi Road",
      addressLocality: "Kanpur (Serving Etawah)",
      addressRegion: "Uttar Pradesh",
      postalCode: "208020",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "26.7769",
      longitude: "79.0223",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    priceRange: "₹₹",
  }

  // 4. Service Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: isHindi
      ? "इटावा में वाहन स्क्रैपिंग सेवाएं | ScrapCentre"
      : "Vehicle Scrapping Services in Etawah by ScrapCentre",
    serviceType: isHindi
      ? "वाहन स्क्रैपिंग, RVSF जमा प्रमाणपत्र (CoD) और UP-75 RC रद्दीकरण सहायता"
      : "Vehicle scrapping, RVSF Certificate of Deposit (CoD) issuance and UP-75 RC cancellation support",
    description: isHindi
      ? "इटावा में अधिकृत RVSF प्रक्रिया के तहत अपनी गाड़ी को कानूनी रूप से स्क्रैप करें और सर्वोत्तम मूल्य, मुफ्त डोरस्टेप पिकअप और सरकारी CoD प्राप्त करें।"
      : "Scrap your vehicle legally in Etawah through an authorised RVSF and get the best value, free doorstep pickup and official Certificate of Deposit (CoD).",
    url: pageUrl,
    provider: { "@id": `${pageUrl}#localbusiness` },
    areaServed: [
      { "@type": "City", name: "Etawah" },
      { "@type": "AdministrativeArea", name: "Etawah District" },
      { "@type": "AdministrativeArea", name: "Uttar Pradesh" },
    ],
  }

  // 5. FAQ Schema (Exact 8 FAQs from user prompt)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: isHindi
          ? "मैं इटावा में वाहन स्क्रैपिंग की व्यवस्था कैसे करूँ?"
          : "How do I arrange vehicle scrapping in Etawah?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "शुरुआत करने के लिए स्क्रैपसेंटर की वेबसाइट या व्हाट्सएप के माध्यम से अपना वाहन पंजीकरण नंबर साझा करें। स्क्रैपसेंटर इटावा से मुफ्त डोरस्टेप पिकअप प्रदान करता है और 26-A & B, ब्लॉक-E, पनकी, कालपी रोड, कानपुर में अपने अधिकृत RVSF में एकत्र किए गए वाहनों को संसाधित करता है।"
            : "Share your vehicle registration number through ScrapCentre's website or WhatsApp to get started. ScrapCentre offers free doorstep pickup from Etawah and processes collected vehicles at its authorised RVSF at 26-A & B, Block-E, Panki, Kalpi Road, Kanpur.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "क्या इटावा में वाहन मालिकों के लिए कोई अधिकृत RVSF सेवा उपलब्ध है?"
          : "Is there an authorised RVSF service available for vehicle owners in Etawah?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "हाँ। स्क्रैपसेंटर एक RTO-अधिकृत पंजीकृत वाहन स्क्रैपिंग सुविधा (RVSF) है जो इटावा में सेवा प्रदान करती है। हम कानपुर में अपनी अधिकृत सुविधा में शहर से एकत्र किए गए वाहनों को संसाधित करते हैं, जहां पात्र वाहनों को अनुमोदित प्रक्रिया के माध्यम से स्क्रैपिंग के बाद जमा प्रमाणपत्र (CoD) प्राप्त होता है।"
            : "Yes. ScrapCentre is an RTO-authorised Registered Vehicle Scrapping Facility (RVSF) serving Etawah. We process vehicles collected from the city at our authorised facility in Kanpur, where eligible vehicles receive a Certificate of Deposit after scrapping through the approved process.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "इटावा में वाहन पिकअप के लिए कौन से क्षेत्र कवर किए गए हैं?"
          : "Which areas in Etawah are covered for vehicle pickup?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "स्क्रैपसेंटर भरथना, जसवंतनगर, सैफई, बकेवर, इटावा सिटी, लखना, एकडिल, चकरनगर, ताखा, महेवा, बसरेहर और सरसई नावर में पिकअप की व्यवस्था करता है। भरथना, इटावा में वाहन स्क्रैपिंग सेवाओं के लिए, या यहाँ सूचीबद्ध नहीं किए गए किसी भी इलाके के लिए, पिकअप उपलब्धता की जांच के लिए व्हाट्सएप पर हमसे संपर्क करें।"
            : "ScrapCentre arranges pickup across Bharthana, Jaswantnagar, Saifai, Bakewar, Etawah City, Lakhna, Ekdil, Chakarnagar, Takha, Mahewa, Basrehar and Sarsai Nawar. For vehicle scrapping services in Bharthana, Etawah, or any locality not listed here, contact us on WhatsApp to check pickup availability.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "मैं स्क्रैपिंग के लिए किस प्रकार के ट्रक और वाणिज्यिक वाहन भेज सकता हूँ?"
          : "What types of trucks and commercial vehicles can I send for scrapping?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "स्क्रैपसेंटर पुराने, क्षतिग्रस्त या अनुपयोगी ट्रकों, बसों और पात्र वाणिज्यिक वाहनों के लिए पूछताछ स्वीकार करता है। यदि कोई वाहन अब नहीं चल रहा है, तो टोइंग सहायता पर चर्चा की जा सकती है। इटावा में ट्रक स्क्रैपिंग, बस स्क्रैपिंग या वाणिज्यिक बेड़े की आवश्यकताओं की पात्रता की जांच के लिए इसका विवरण साझा करें।"
            : "ScrapCentre accepts enquiries for old, damaged or end-of-life trucks, buses and eligible commercial vehicles. If a vehicle is no longer running, towing support can be discussed. Share its details to check eligibility for truck scrapping, bus scrapping in Etawah or commercial fleet requirements.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "क्या आपकी सेवाओं के तहत ऑटो-रिक्शा और ई-रिक्शा शामिल हैं?"
          : "Are auto-rickshaws and e-rickshaws covered under your services?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "हाँ, पात्र पुराने या अनफिट ऑटो-रिक्शा और ई-रिक्शा को उपयुक्त अधिकृत मार्ग के माध्यम से संसाधित किया जा सकता है। इटावा में ऑटो रिक्शा स्क्रैपिंग या ई-रिक्शा स्क्रैपिंग के लिए, पात्रता की पुष्टि करने के लिए हमारी टीम के साथ वाहन विवरण साझा करें।"
            : "Yes, eligible old or unfit auto-rickshaws and e-rickshaws can be processed through the appropriate authorised route. For auto rickshaw scrapping or e rickshaw scrapping in Etawah, share the vehicle details with our team to confirm eligibility.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "पुराने वाहन के लिए दी जाने वाली राशि कैसे तय की जाती है?"
          : "How is the amount offered for an old vehicle decided?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "कोट वाहन की श्रेणी, वजन, आयु, वर्तमान स्थिति, पूर्णता और प्रचलित स्क्रैप धातु दरों पर निर्भर करता है। आप निर्णय लेने से पहले किसी भी दायित्व के बिना इटावा में मुफ्त वाहन मूल्यांकन का अनुरोध कर सकते हैं। इन कारकों का आकलन करने के बाद इटावा में वाहन स्क्रैप मूल्य निर्धारित किया जाएगा।"
            : "The quote depends on the vehicle's category, weight, age, present condition, completeness and prevailing scrap metal rates. You can request a free vehicle valuation in Etawah without any obligation before deciding. The vehicle scrap price in Etawah will be determined after assessing these factors.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "मुझे आरसी रद्दीकरण में क्या सहायता मिलेगी?"
          : "What assistance will I receive with RC cancellation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "स्क्रैपसेंटर वाहन मालिकों को आवश्यक कागजी कार्रवाई तैयार करने और इटावा में वाहन पंजीकरण रद्दीकरण में शामिल चरणों को समझने में मदद करता है। टीम पुष्टि करेगी कि आपके वाहन और स्वामित्व विवरण के आधार पर कौन से दस्तावेज आवश्यक हैं, जिसमें इटावा में वाहन स्क्रैपिंग आरसी से संबंधित आवश्यकताएं शामिल हैं।"
            : "ScrapCentre helps vehicle owners prepare the required paperwork and understand the steps involved in vehicle registration cancellation in Etawah. The team will confirm which documents are needed based on your vehicle and ownership details, including requirements related to vehicle scrapping RC in Etawah.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "कार और दोपहिया वाहन मालिक प्रासंगिक स्क्रैपिंग विवरण कहाँ पा सकते हैं?"
          : "Where can car and two-wheeler owners find the relevant scrapping details?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "प्रत्येक श्रेणी के लिए प्रक्रिया को समझाने वाले अलग-अलग पृष्ठ स्क्रैपसेंटर के पास हैं। वाहन-विशिष्ट जानकारी के लिए चार पहिया स्क्रैपिंग पेज या दोपहिया स्क्रैपिंग पेज पर जाएं। दोनों अधिकृत RVSF प्रक्रिया का पालन करते हैं।"
            : "ScrapCentre has separate pages explaining the process for each category. Visit the four-wheeler scrapping page or the two-wheeler scrapping page for vehicle-specific information. Both follow the authorised RVSF process.",
        },
      },
    ],
  }

  // 6. HowTo Schema
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${pageUrl}#howto`,
    name: isHindi
      ? "इटावा में वाहन स्क्रैपिंग कैसे काम करता है: चार चरणों की प्रक्रिया"
      : "How the Vehicle Scrapping Process Works in Etawah: A Four-Step Process",
    description: isHindi
      ? "इटावा में अपने वाहन को स्क्रैप करने और जमा प्रमाणपत्र प्राप्त करने की 4-चरणीय सरल प्रक्रिया।"
      : "Scrapping your vehicle in Etawah involves four key stages, from the first enquiry to the final Certificate of Deposit.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: isHindi ? "अपना नंबर और इलाका साझा करें" : "Share Your Number & Locality",
        text: isHindi
          ? "शुरुआत करने के लिए, हमारी वेबसाइट या व्हाट्सएप के माध्यम से अपना वाहन पंजीकरण नंबर और इटावा का इलाका साझा करें।"
          : "Start by sharing your vehicle registration number and Etawah locality through our website or WhatsApp.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: isHindi ? "मुफ्त डोरस्टेप पिकअप" : "Free Doorstep Pickup",
        text: isHindi
          ? "एक बार स्क्रैपिंग की पुष्टि हो जाने के बाद, स्क्रैपसेंटर बिना किसी शुल्क के आपके दरवाजे से पिकअप की व्यवस्था करता है।"
          : "Once scrapping is confirmed, ScrapCentre arranges collection from your doorstep at no cost in Etawah.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: isHindi ? "दस्तावेज और आरसी रद्दीकरण" : "Documents & RC Cancellation",
        text: isHindi
          ? "जमा करने के लिए आवश्यक स्वामित्व और वाहन दस्तावेज तैयार रखें। स्क्रैपसेंटर कागजी कार्रवाई और आरसी रद्दीकरण औपचारिकताओं में सहायता करता है।"
          : "Keep the required ownership and vehicle documents ready. ScrapCentre assists with paperwork and guides you through RC cancellation.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: isHindi ? "भुगतान और जमा प्रमाणपत्र" : "Payment & Certificate of Deposit",
        text: isHindi
          ? "अधिकृत RVSF में वाहन के संसाधित होने के बाद, लागू भुगतान किया जाता है और जमा प्रमाणपत्र (CoD) जारी किया जाता है।"
          : "After the vehicle is processed at the authorised RVSF, the applicable payment is made and a Certificate of Deposit is issued.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
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
      <EtawahScrappingClient />
    </>
  )
}

