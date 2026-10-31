import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { getAlternates } from "@/lib/seo/getAlternates"
import AgraScrappingClient from "@/components/AgraScrappingClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  const isHindi = typedLocale === "hi"
  const alternates = getAlternates(typedLocale, "/vehicle-scrapping-services-agra")

  const title = isHindi
    ? "आगरा में वाहन स्क्रैपिंग सेवाएं — अधिकृत RVSF, मुफ्त डोरस्टेप पिकअप | ScrapCentre"
    : "Vehicle Scrapping Services in Agra — Authorised RVSF, Free Doorstep Pickup | ScrapCentre"
  const description = isHindi
    ? "आगरा में अधिकृत वाहन स्क्रैपिंग सेवाएं। पुरानी कार, बाइक, ट्रक, बस और ऑटो के लिए मुफ्त डोरस्टेप पिकअप, सरकारी जमा प्रमाणपत्र (CoD) और आरसी रद्दीकरण सहायता।"
    : "Authorised vehicle scrapping services in Agra. Free doorstep pickup, government Certificate of Deposit (CoD), RC cancellation support and instant valuation for cars, bikes, trucks, buses & autos."

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
          alt: "ScrapCentre Agra Vehicle Scrapping Services",
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

export default async function VehicleScrappingServicesAgraPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  setRequestLocale(typedLocale)

  const isHindi = typedLocale === "hi"
  const pageUrl = `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/vehicle-scrapping-services-agra`
  const homeUrl = `https://www.scrapcentre.com${isHindi ? "/hi" : "/"}`

  // 1. WebPage Schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: isHindi
      ? "आगरा में वाहन स्क्रैपिंग सेवाएं | ScrapCentre"
      : "Vehicle Scrapping Services in Agra | ScrapCentre",
    description: isHindi
      ? "आगरा में आधिकारिक अधिकृत वाहन स्क्रैपिंग सेवाएं। परिवहन पोर्टल से तुरंत जमा प्रमाणपत्र (CoD) और मुफ्त डोरस्टेप पिकअप।"
      : "Official authorized vehicle scrapping services in Agra. Instant Certificate of Deposit (CoD) via Parivahan and free doorstep pickup.",
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
        name: isHindi ? "आगरा वाहन स्क्रैपिंग" : "Vehicle Scrapping Services Agra",
        item: pageUrl,
      },
    ],
  }

  // 3. LocalBusiness / AutomotiveBusiness Schema for RVSF serving Agra
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["AutomotiveBusiness", "LocalBusiness"],
    "@id": `${pageUrl}#localbusiness`,
    name: "ScrapCentre - Registered Vehicle Scrapping Facility Agra Service",
    url: pageUrl,
    telephone: "+91-9839447733",
    email: "contact@scrapcentre.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "26-A & B, Block-E, Panki, Kalpi Road",
      addressLocality: "Kanpur (Serving Agra)",
      addressRegion: "Uttar Pradesh",
      postalCode: "208020",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "27.1767",
      longitude: "78.0081",
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
      ? "आगरा में वाहन स्क्रैपिंग सेवाएं | ScrapCentre"
      : "Vehicle Scrapping Services in Agra by ScrapCentre",
    serviceType: isHindi
      ? "वाहन स्क्रैपिंग, RVSF जमा प्रमाणपत्र (CoD) और UP-80 RC रद्दीकरण सहायता"
      : "Vehicle scrapping, RVSF Certificate of Deposit (CoD) issuance and UP-80 RC cancellation support",
    description: isHindi
      ? "आगरा में अधिकृत RVSF प्रक्रिया के तहत अपनी गाड़ी को कानूनी रूप से स्क्रैप करें और सर्वोत्तम मूल्य, मुफ्त डोरस्टेप पिकअप और सरकारी CoD प्राप्त करें।"
      : "Scrap your vehicle legally in Agra through an authorised RVSF and get the best value, free doorstep pickup and official Certificate of Deposit (CoD).",
    url: pageUrl,
    provider: { "@id": `${pageUrl}#localbusiness` },
    areaServed: [
      { "@type": "City", name: "Agra" },
      { "@type": "AdministrativeArea", name: "Agra District" },
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
          ? "मैं आगरा में अपना वाहन कहाँ स्क्रैप कर सकता हूँ?"
          : "Where can I scrap my vehicle in Agra?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "स्क्रैपसेंटर आगरा के वाहन मालिकों को मुफ्त डोरस्टेप पिकअप के साथ सेवा प्रदान करता है। वाहनों का प्रसंस्करण 26-A & B, ब्लॉक-E, पनकी, कालपी रोड, कानपुर स्थित हमारे अधिकृत RVSF में किया जाता है।"
            : "ScrapCentre serves Agra vehicle owners with free doorstep pickup. Vehicles are processed at our authorised RVSF at 26-A & B, Block-E, Panki, Kalpi Road, Kanpur. To get started with a vehicle scrapping center in Agra, share your vehicle number through our website or WhatsApp.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "क्या स्क्रैपसेंटर आगरा में अधिकृत वाहन स्क्रैपिंग सुविधा है?"
          : "Is ScrapCentre an authorised vehicle scrapping facility in Agra?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "हाँ, स्क्रैपसेंटर एक RTO-अधिकृत पंजीकृत वाहन स्क्रैपिंग सुविधा (RVSF) संचालित करता है जो जमा प्रमाणपत्र (CoD) जारी करता है। आगरा में सरकार द्वारा अधिकृत RVSF सेवाओं के लिए, शहर से एकत्र किए गए वाहनों को कानपुर में हमारी अधिकृत सुविधा में प्रोसेस किया जाता है।"
            : "Yes, ScrapCentre operates an RTO-authorised Registered Vehicle Scrapping Facility (RVSF) that issues a Certificate of Deposit (CoD). For government-authorised RVSF services in Agra, vehicles collected from the city are processed at our authorised facility in Kanpur.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "पिकअप के लिए आप आगरा के कौन से क्षेत्रों को कवर करते हैं?"
          : "Which areas of Agra do you cover for pickup?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "हम सिकंदरा, कमला नगर, संजय प्लेस, ताजगंज, दयालबाग, खंदारी, हरी पर्वत, फतेहाबाद रोड, सदर बाजार, राजा की मंडी, लोहा मंडी और जीवनी मंडी सहित पूरे आगरा में पिकअप की व्यवस्था करते हैं।"
            : "We arrange pickup across Agra, including Sikandra, Kamla Nagar, Sanjay Place, Tajganj, Dayalbagh, Khandari, Hari Parvat, Fatehabad Road, Sadar Bazaar, Raja Ki Mandi, Loha Mandi and Jeoni Mandi. For vehicle scrapping services in Sikandra, Agra, or an unlisted locality, message us on WhatsApp to check availability.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "क्या आप आगरा में ट्रकों, बसों और अन्य वाणिज्यिक वाहनों को स्क्रैप करते हैं?"
          : "Do you scrap trucks, buses and other commercial vehicles in Agra?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "हाँ, हम पुराने, क्षतिग्रस्त और जीवन समाप्त हो चुके ट्रकों, बसों और पात्र वाणिज्यिक वाहनों के लिए पूछताछ स्वीकार करते हैं। आगरा में ट्रक स्क्रैपिंग और बस स्क्रैपिंग में गैर-चालू वाहनों के लिए टोइंग सहायता शामिल है।"
            : "Yes, we accept enquiries for old, damaged and end-of-life trucks, buses and eligible commercial vehicles. Truck scrapping and bus scrapping in Agra may include towing support for vehicles that cannot run. Share your vehicle details so we can check eligibility.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "क्या मैं आगरा में ऑटो-रिक्शा या ई-रिक्शा स्क्रैप कर सकता हूँ?"
          : "Can I scrap an auto-rickshaw or e-rickshaw in Agra?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "हाँ, पुराने या अनफिट ऑटो-रिक्शा और ई-रिक्शा अधिकृत स्क्रैपिंग के लिए पात्र हो सकते हैं। पात्रता की जांच करने और अगले चरणों को समझने के लिए वाहन विवरण के साथ संपर्क करें।"
            : "Yes, old or unfit auto-rickshaws and e-rickshaws may qualify for authorised scrapping. For auto rickshaw scrapping in Agra or e-rickshaw scrapping in Agra, contact us with the vehicle details so our team can check eligibility and explain the next steps.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "आगरा में अपने वाहन को स्क्रैप करने पर मुझे कितना मिलेगा?"
          : "How much will I get for scrapping my vehicle in Agra?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "आगरा में आपके वाहन का स्क्रैप मूल्य उसके प्रकार, वजन, आयु, स्थिति, पूर्णता और वर्तमान स्क्रैप धातु दरों पर निर्भर करता है। स्क्रैपसेंटर एक मुफ्त, बिना किसी दायित्व के वाहन मूल्यांकन प्रदान करता है।"
            : "Your vehicle scrap price in Agra depends on its type, weight, age, condition, completeness and current scrap metal rates. ScrapCentre offers a free, no-obligation vehicle valuation, so you can understand the estimated value before deciding whether to proceed.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "आगरा में मेरे वाहन के लिए आरसी रद्दीकरण कौन संभालता है?"
          : "Who handles RC cancellation for my vehicle in Agra?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "स्क्रैपसेंटर स्क्रैपिंग प्रक्रिया के हिस्से के रूप में आगरा में कागजी कार्रवाई और वाहन पंजीकरण रद्दीकरण में आपका मार्गदर्शन करता है।"
            : "ScrapCentre guides you through the paperwork and vehicle registration cancellation in Agra as part of the scrapping process. Our team will explain which documents you need to provide and help you understand the steps required for RC cancellation.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "क्या कार और बाइक मालिकों के लिए अलग जानकारी उपलब्ध है?"
          : "Is there separate information for car and bike owners?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "हाँ। हमारे पास आगरा में चार पहिया वाहन स्क्रैपिंग और दोपहिया वाहन स्क्रैपिंग की प्रक्रिया की व्याख्या करने वाले समर्पित पेज हैं। दोनों अधिकृत RVSF प्रक्रिया को कवर करते हैं।"
            : "Yes. We have dedicated pages explaining the process for four-wheeler scrapping in Agra and two-wheeler scrapping in Agra. Both cover the authorised RVSF process, with information specific to each vehicle category.",
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
      ? "आगरा में वाहन स्क्रैपिंग कैसे काम करता है"
      : "How Vehicle Scrapping Works in Agra",
    description: isHindi
      ? "आगरा में अपने वाहन को स्क्रैप करने और जमा प्रमाणपत्र प्राप्त करने की 4-चरणीय सरल प्रक्रिया।"
      : "Simple 4-stage process to scrap an end-of-life vehicle in Agra and receive your Certificate of Deposit.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: isHindi ? "अपना नंबर और इलाका साझा करें" : "Share Your Number & Locality",
        text: isHindi
          ? "वेबसाइट या व्हाट्सएप के माध्यम से वाहन पंजीकरण नंबर और आगरा में स्थान साझा करें।"
          : "Share your vehicle registration number and location in Agra through our website or WhatsApp.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: isHindi ? "मुफ्त डोरस्टेप पिकअप" : "Free Doorstep Pickup",
        text: isHindi
          ? "स्क्रैपिंग की पुष्टि होने के बाद, हम आपके स्थान से मुफ्त डोरस्टेप पिकअप की व्यवस्था करते हैं।"
          : "Once scrapping is confirmed, we arrange free doorstep pickup from your location in Agra.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: isHindi ? "दस्तावेज और आरसी रद्दीकरण" : "Documents & RC Cancellation",
        text: isHindi
          ? "कागजी कार्रवाई और आरसी रद्दीकरण सहायता के लिए आवश्यक दस्तावेज जमा करें।"
          : "Keep the required documents ready and receive guidance on paperwork and RC cancellation.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: isHindi ? "भुगतान और जमा प्रमाणपत्र (CoD)" : "Payment & Certificate of Deposit (CoD)",
        text: isHindi
          ? "अधिकृत RVSF में वाहन प्रसंस्करण के बाद लागू भुगतान और डिजिटल CoD प्राप्त करें।"
          : "After processing at our authorised RVSF, receive instant payment and an official Certificate of Deposit (CoD).",
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
      <AgraScrappingClient />
    </>
  )
}
