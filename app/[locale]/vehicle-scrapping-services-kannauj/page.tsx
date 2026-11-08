import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { getAlternates } from "@/lib/seo/getAlternates"
import KannaujScrappingClient from "@/components/KannaujScrappingClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  const isHindi = typedLocale === "hi"
  const alternates = getAlternates(typedLocale, "/vehicle-scrapping-services-kannauj")

  const title = isHindi
    ? "कन्नौज में वाहन स्क्रैपिंग सेवाएं — अधिकृत RVSF, मुफ्त डोरस्टेप पिकअप | ScrapCentre"
    : "Vehicle Scrapping Services in Kannauj | ScrapCentre"
  const description = isHindi
    ? "कन्नौज में अधिकृत वाहन स्क्रैपिंग सेवाएं। पुरानी कार, बाइक, ट्रक, बस और ऑटो के लिए मुफ्त डोरस्टेप पिकअप, सरकारी जमा प्रमाणपत्र (CoD) और आरसी रद्दीकरण सहायता।"
    : "Looking for vehicle scrapping services in Kannauj? Get free vehicle valuation, free doorstep pickup, RC cancellation assistance and an official Certificate of Deposit through ScrapCentre’s authorised RVSF."

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
          alt: "ScrapCentre Kannauj Vehicle Scrapping Services",
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

export default async function VehicleScrappingServicesKannaujPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  setRequestLocale(typedLocale)

  const isHindi = typedLocale === "hi"
  const pageUrl = `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/vehicle-scrapping-services-kannauj`
  const homeUrl = `https://www.scrapcentre.com${isHindi ? "/hi" : "/"}`

  // 1. WebPage Schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: isHindi
      ? "कन्नौज में वाहन स्क्रैपिंग सेवाएं | ScrapCentre"
      : "Vehicle Scrapping Services in Kannauj | ScrapCentre",
    description: isHindi
      ? "कन्नौज में आधिकारिक अधिकृत वाहन स्क्रैपिंग सेवाएं। परिवहन पोर्टल से तुरंत जमा प्रमाणपत्र (CoD) और मुफ्त डोरस्टेप पिकअप।"
      : "Official authorized vehicle scrapping services in Kannauj. Instant Certificate of Deposit (CoD) via Parivahan, RC cancellation and free doorstep pickup.",
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
        name: isHindi ? "कन्नौज वाहन स्क्रैपिंग" : "Vehicle Scrapping Services Kannauj",
        item: pageUrl,
      },
    ],
  }

  // 3. LocalBusiness / AutomotiveBusiness Schema for RVSF serving Kannauj
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["AutomotiveBusiness", "LocalBusiness"],
    "@id": `${pageUrl}#localbusiness`,
    name: "ScrapCentre - Registered Vehicle Scrapping Facility Kannauj Service",
    url: pageUrl,
    telephone: "+91-9839447733",
    email: "contact@scrapcentre.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "26-A & B, Block-E, Panki, Kalpi Road",
      addressLocality: "Kanpur (Serving Kannauj)",
      addressRegion: "Uttar Pradesh",
      postalCode: "208020",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "27.0547",
      longitude: "79.9197",
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
      ? "कन्नौज में वाहन स्क्रैपिंग सेवाएं | ScrapCentre"
      : "Vehicle Scrapping Services in Kannauj by ScrapCentre",
    serviceType: isHindi
      ? "वाहन स्क्रैपिंग, RVSF जमा प्रमाणपत्र (CoD) और UP-74 RC रद्दीकरण सहायता"
      : "Vehicle scrapping, RVSF Certificate of Deposit (CoD) issuance and UP-74 RC cancellation support",
    description: isHindi
      ? "कन्नौज में अधिकृत RVSF प्रक्रिया के तहत अपनी गाड़ी को कानूनी रूप से स्क्रैप करें और सर्वोत्तम मूल्य, मुफ्त डोरस्टेप पिकअप और सरकारी CoD प्राप्त करें।"
      : "Scrap your vehicle legally in Kannauj through an authorised RVSF and get the best value, free doorstep pickup and official Certificate of Deposit (CoD).",
    url: pageUrl,
    provider: { "@id": `${pageUrl}#localbusiness` },
    areaServed: [
      { "@type": "City", name: "Kannauj" },
      { "@type": "AdministrativeArea", name: "Kannauj District" },
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
          ? "मैं कन्नौज में अपना वाहन कहाँ स्क्रैप कर सकता हूँ?"
          : "Where can I scrap my vehicle in Kannauj?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "स्क्रैपसेंटर कन्नौज में एक अधिकृत वाहन स्क्रैपिंग केंद्र के रूप में कार्य करता है, जिसमें मुफ्त डोरस्टेप पिकअप शामिल है। एकत्र किए गए वाहनों को 26-A & B, ब्लॉक-E, पनकी, कालपी रोड, कानपुर स्थित इसके अधिकृत RVSF में प्रोसेस किया जाता है। शुरुआत करने के लिए अपना वाहन नंबर ऑनलाइन या व्हाट्सएप पर साझा करें।"
            : "ScrapCentre serves Kannauj as an authorised vehicle scrapping center in Kannauj, with free doorstep pickup. Collected vehicles are processed at its authorised RVSF at 26-A & B, Block-E, Panki, Kalpi Road, Kanpur. Share your vehicle number online or through WhatsApp to get started.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "क्या स्क्रैपसेंटर कन्नौज में एक अधिकृत वाहन स्क्रैपिंग सुविधा है?"
          : "Is ScrapCentre an authorised vehicle scrapping facility in Kannauj?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "हाँ। स्क्रैपसेंटर एक RTO-अधिकृत RVSF संचालित करता है जो प्रसंस्करण के बाद जमा प्रमाणपत्र (CoD) जारी करता है। कन्नौज में सरकार द्वारा अधिकृत RVSF सेवाओं के लिए, वाहनों को स्थानीय रूप से एकत्र किया जाता है और कानपुर में अधिकृत सुविधा में ले जाया जाता है।"
            : "Yes. ScrapCentre operates an RTO-authorised RVSF that issues a Certificate of Deposit after processing. For government authorized RVSF services in Kannauj, vehicles are collected locally and taken to the authorised facility in Kanpur.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "आप पिकअप के लिए कन्नौज के किन क्षेत्रों को कवर करते हैं?"
          : "Which areas of Kannauj do you cover for pickup?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "तिर्वा, छिबरामऊ, गुरसहायगंज, सौरिख, कन्नौज सिटी, समधन, तालग्राम, सिकंदरपुर, उमर्दा, हसेरन, ठठिया और मुदवारागंज में पिकअप की व्यवस्था की जा सकती है। इसमें तिर्वा, कन्नौज में वाहन स्क्रैपिंग सेवाएं शामिल हैं। यदि आपका इलाका सूचीबद्ध नहीं है, तो उपलब्धता की जांच के लिए हमें संदेश भेजें।"
            : "Pickup can be arranged in Tirwa, Chhibramau, Gursahaiganj, Saurikh, Kannauj City, Samdhan, Talgram, Sikandarpur, Umarda, Haseran, Thatia and Mudwaraganj. This includes vehicle scrapping services in Tirwa, Kannauj. If your locality isn't listed, message us to check availability.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "क्या आप कन्नौज में ट्रक, बस और अन्य वाणिज्यिक वाहनों को स्क्रैप करते हैं?"
          : "Do you scrap trucks, buses and other commercial vehicles in Kannauj?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "हाँ। स्क्रैपसेंटर पुराने, क्षतिग्रस्त और जीवन समाप्त ट्रकों, बसों और अन्य वाणिज्यिक वाहनों के लिए पूछताछ स्वीकार करता है। चाहे आपको कन्नौज में ट्रक स्क्रैपिंग या बस स्क्रैपिंग की आवश्यकता हो, न चलने वाले वाहनों के लिए टोइंग सहायता उपलब्ध है। कन्नौज में वाणिज्यिक वाहन स्क्रैपिंग की पात्रता जांचने के लिए वाहन विवरण साझा करें।"
            : "Yes. ScrapCentre accepts enquiries for old, damaged and end-of-life trucks, buses and other commercial vehicles. Whether you need truck scrapping or bus scrapping in Kannauj, towing support is available for non-running vehicles. Share the vehicle details to check eligibility for commercial vehicle scrapping in Kannauj.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "क्या मैं कन्नौज में ऑटो-रिक्शा या ई-रिक्शा स्क्रैप कर सकता हूँ?"
          : "Can I scrap an auto-rickshaw or e-rickshaw in Kannauj?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "हाँ। पुराने या अनफिट ऑटो-रिक्शा और ई-रिक्शा का मूल्यांकन उपयुक्त अधिकृत स्क्रैपिंग मार्ग के लिए किया जा सकता है। कन्नौज में ऑटो रिक्शा स्क्रैपिंग या ई-रिक्शा स्क्रैपिंग की पात्रता जांचने के लिए अपने वाहन विवरण के साथ स्क्रैपसेंटर से संपर्क करें।"
            : "Yes. Old or unfit auto-rickshaws and e-rickshaws can be assessed for the appropriate authorised scrapping route. Contact ScrapCentre with your vehicle details to check eligibility for auto rickshaw scrapping or e rickshaw scrapping in Kannauj.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "कन्नौज में अपना वाहन स्क्रैप करने पर मुझे कितना मिलेगा?"
          : "How much will I get for scrapping my vehicle in Kannauj?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "प्रत्येक वाहन के लिए कन्नौज में कोई एक निश्चित वाहन स्क्रैप मूल्य नहीं है। उद्धरण इसके प्रकार, वजन, आयु, स्थिति, लापता पुर्जों और प्रचलित स्क्रैप धातु दरों पर निर्भर करता है। आप आगे बढ़ने के किसी दायित्व के बिना कन्नौज में मुफ्त वाहन मूल्यांकन का अनुरोध कर सकते हैं।"
            : "There isn't one fixed vehicle scrap price in Kannauj for every vehicle. The quote depends on its type, weight, age, condition, missing parts and prevailing scrap metal rates. You can request a free vehicle valuation in Kannauj with no obligation to proceed.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "कन्नौज में मेरे वाहन के आरसी रद्दीकरण को कौन संभालता है?"
          : "Who handles RC cancellation for my vehicle in Kannauj?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "स्क्रैपसेंटर अधिकृत स्क्रैपिंग प्रक्रिया के भाग के रूप में कन्नौज में कागजी कार्रवाई और वाहन पंजीकरण रद्दीकरण में सहायता करता है। टीम बताएगी कि पंजीकृत मालिक से कौन से दस्तावेज चाहिए और कन्नौज में वाहन स्क्रैपिंग आरसी औपचारिकताओं में आपका मार्गदर्शन करेगी।"
            : "ScrapCentre assists with the paperwork and vehicle registration cancellation in Kannauj as part of the authorised scrapping process. The team will explain which documents are needed from the registered owner and guide you through the vehicle scrapping RC in Kannauj formalities.",
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
            ? "हाँ। कार मालिक चार पहिया स्क्रैपिंग पेज देख सकते हैं, जबकि बाइक और स्कूटर मालिक दोपहिया स्क्रैपिंग पेज पर जा सकते हैं। दोनों अधिकृत RVSF प्रक्रिया के तहत प्रासंगिक वाहन-विशिष्ट विवरण की व्याख्या करते हैं।"
            : "Yes. Car owners can refer to the four-wheeler scrapping page, while bike and scooter owners can visit the two-wheeler scrapping page. Both explain the relevant vehicle-specific details under the authorised RVSF process.",
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
      ? "कन्नौज में वाहन स्क्रैपिंग कैसे काम करता है: चार चरणों की प्रक्रिया"
      : "How the Vehicle Scrapping Process Works in Kannauj: A Four-Step Process",
    description: isHindi
      ? "कन्नौज में अपने वाहन को स्क्रैप करने और जमा प्रमाणपत्र प्राप्त करने की 4-चरणीय सरल प्रक्रिया।"
      : "Scrapping your vehicle involves four key stages, from the first enquiry to the final Certificate of Deposit.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: isHindi ? "अपना नंबर और इलाका साझा करें" : "Share Your Number & Locality",
        text: isHindi
          ? "शुरुआत करने के लिए, हमारी वेबसाइट या व्हाट्सएप के माध्यम से कन्नौज में अपना वाहन पंजीकरण नंबर और पिकअप स्थान भेजें।"
          : "To begin, send us your vehicle registration number and pickup location in Kannauj through our website or WhatsApp.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: isHindi ? "मुफ्त डोरस्टेप पिकअप" : "Free Doorstep Pickup",
        text: isHindi
          ? "स्क्रैपिंग की पुष्टि होने के बाद हम न चलने वाले वाहनों के लिए टोइंग सहायता के साथ मुफ्त डोरस्टेप संग्रह का आयोजन करते हैं।"
          : "Once scrapping is confirmed, we organise free doorstep collection, with towing support for vehicles that cannot be driven in Kannauj.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: isHindi ? "दस्तावेज और आरसी रद्दीकरण" : "Documents & RC Cancellation",
        text: isHindi
          ? "एक बार संग्रह की व्यवस्था हो जाने के बाद, औपचारिकताओं के साथ आगे बढ़ने के लिए आवश्यक दस्तावेज जमा करें।"
          : "Once collection is arranged, submit the required documents to move ahead with the formalities and RC cancellation in Kannauj.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: isHindi ? "भुगतान और जमा प्रमाणपत्र" : "Payment & Certificate of Deposit",
        text: isHindi
          ? "अधिकृत RVSF में वाहन के संसाधित होने के बाद, आप लागू भुगतान प्राप्त करते हैं और कन्नौज में जमा प्रमाणपत्र प्राप्त करते हैं।"
          : "After the vehicle is processed at the authorised RVSF, you receive the applicable payment and a Certificate of Deposit in Kannauj.",
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
      <KannaujScrappingClient />
    </>
  )
}
