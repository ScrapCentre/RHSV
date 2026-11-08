import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { getAlternates } from "@/lib/seo/getAlternates"
import LucknowScrappingClient from "@/components/LucknowScrappingClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  const isHindi = typedLocale === "hi"
  const alternates = getAlternates(typedLocale, "/vehicle-scrapping-services-lucknow")

  const title = isHindi
    ? "लखनऊ में वाहन स्क्रैपिंग सेवाएं — अधिकृत RVSF, मुफ्त डोरस्टेप पिकअप | ScrapCentre"
    : "Vehicle Scrapping Services in Lucknow | ScrapCentre"
  const description = isHindi
    ? "लखनऊ में अधिकृत वाहन स्क्रैपिंग सेवाएं। पुरानी कार, बाइक, ट्रक, बस और ऑटो के लिए मुफ्त डोरस्टेप पिकअप, सरकारी जमा प्रमाणपत्र (CoD) और आरसी रद्दीकरण सहायता।"
    : "Looking for vehicle scrapping services in Lucknow? Get free vehicle valuation, free doorstep pickup, RC cancellation assistance and an official Certificate of Deposit through ScrapCentre’s authorised RVSF."

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
          alt: "ScrapCentre Lucknow Vehicle Scrapping Services",
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

export default async function VehicleScrappingServicesLucknowPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  setRequestLocale(typedLocale)

  const isHindi = typedLocale === "hi"
  const pageUrl = `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/vehicle-scrapping-services-lucknow`
  const homeUrl = `https://www.scrapcentre.com${isHindi ? "/hi" : "/"}`

  // 1. WebPage Schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: isHindi
      ? "लखनऊ में वाहन स्क्रैपिंग सेवाएं | ScrapCentre"
      : "Vehicle Scrapping Services in Lucknow | ScrapCentre",
    description: isHindi
      ? "लखनऊ में आधिकारिक अधिकृत वाहन स्क्रैपिंग सेवाएं। परिवहन पोर्टल से तुरंत जमा प्रमाणपत्र (CoD) और मुफ्त डोरस्टेप पिकअप।"
      : "Official authorized vehicle scrapping services in Lucknow. Instant Certificate of Deposit (CoD) via Parivahan, RC cancellation and free doorstep pickup.",
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
        name: isHindi ? "लखनऊ वाहन स्क्रैपिंग" : "Vehicle Scrapping Services Lucknow",
        item: pageUrl,
      },
    ],
  }

  // 3. LocalBusiness / AutomotiveBusiness Schema for RVSF serving Lucknow
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["AutomotiveBusiness", "LocalBusiness"],
    "@id": `${pageUrl}#localbusiness`,
    name: "ScrapCentre - Registered Vehicle Scrapping Facility Lucknow Service",
    url: pageUrl,
    telephone: "+91-9839447733",
    email: "contact@scrapcentre.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "26-A & B, Block-E, Panki, Kalpi Road",
      addressLocality: "Kanpur (Serving Lucknow)",
      addressRegion: "Uttar Pradesh",
      postalCode: "208020",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "26.8467",
      longitude: "80.9462",
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
      ? "लखनऊ में वाहन स्क्रैपिंग सेवाएं | ScrapCentre"
      : "Vehicle Scrapping Services in Lucknow by ScrapCentre",
    serviceType: isHindi
      ? "वाहन स्क्रैपिंग, RVSF जमा प्रमाणपत्र (CoD) और UP-32 RC रद्दीकरण सहायता"
      : "Vehicle scrapping, RVSF Certificate of Deposit (CoD) issuance and UP-32 RC cancellation support",
    description: isHindi
      ? "लखनऊ में अधिकृत RVSF प्रक्रिया के तहत अपनी गाड़ी को कानूनी रूप से स्क्रैप करें और सर्वोत्तम मूल्य, मुफ्त डोरस्टेप पिकअप और सरकारी CoD प्राप्त करें।"
      : "Scrap your vehicle legally in Lucknow through an authorised RVSF and get the best value, free doorstep pickup and official Certificate of Deposit (CoD).",
    url: pageUrl,
    provider: { "@id": `${pageUrl}#localbusiness` },
    areaServed: [
      { "@type": "City", name: "Lucknow" },
      { "@type": "AdministrativeArea", name: "Lucknow District" },
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
          ? "स्क्रैपसेंटर लखनऊ से एकत्र किए गए वाहनों को कहाँ प्रोसेस करता है?"
          : "Where does ScrapCentre process vehicles collected from Lucknow?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "स्क्रैपसेंटर लखनऊ में एक अधिकृत वाहन स्क्रैपिंग केंद्र के रूप में कार्य करता है, जिसमें पूरे शहर में मुफ्त डोरस्टेप पिकअप शामिल है। एकत्र किए गए वाहनों को 26-A & B, ब्लॉक-E, पनकी, कालपी रोड, कानपुर स्थित हमारे अधिकृत RVSF में प्रोसेस किया जाता है। शुरुआत करने के लिए अपना वाहन नंबर ऑनलाइन या व्हाट्सएप पर साझा करें।"
            : "ScrapCentre serves as an authorised vehicle scrapping center in Lucknow, with free doorstep pickup across the city. Collected vehicles are processed at our authorised RVSF at 26-A & B, Block-E, Panki, Kalpi Road, Kanpur. Share your vehicle number online or through WhatsApp to get started.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "क्या स्क्रैपसेंटर के पास वाहन स्क्रैपिंग के लिए सरकारी प्राधिकरण है?"
          : "Does ScrapCentre have government authorisation for vehicle scrapping?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "हाँ। स्क्रैपसेंटर एक RTO-अधिकृत RVSF संचालित करता है जो पात्र वाहनों को संसाधित करता है और जमा प्रमाणपत्र (CoD) जारी करता है। सरकार द्वारा अधिकृत RVSF लखनऊ सेवाओं के लिए, लखनऊ से एकत्र किए गए वाहनों को प्रसंस्करण के लिए कानपुर में हमारी अधिकृत सुविधा में ले जाया जाता है।"
            : "Yes. ScrapCentre operates an RTO-authorised RVSF that processes eligible vehicles and issues a Certificate of Deposit (CoD). For government authorized RVSF Lucknow services, vehicles collected from Lucknow are taken to our authorised facility in Kanpur for processing.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "क्या आप लखनऊ के मेरे इलाके में वाहन पिकअप की व्यवस्था कर सकते हैं?"
          : "Can you arrange vehicle pickup in my part of Lucknow?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "हम आलमबाग, अमौसी, चिनहट, गोमती नगर, अलीगंज, इंदिरा नगर, महानगर, जानकीपुरम, राजाजीपुरम, वृंदावन योजना, आशियाना और हज़रतगंज सहित शहर के कई हिस्सों को कवर करते हैं। यदि आप आलमबाग, लखनऊ या किसी अन्य गैर-सूचीबद्ध क्षेत्र में वाहन स्क्रैपिंग सेवाओं की तलाश कर रहे हैं, तो उपलब्धता की जांच के लिए हमें संदेश भेजें।"
            : "We cover several parts of the city, including Alambagh, Amausi, Chinhat, Gomti Nagar, Aliganj, Indira Nagar, Mahanagar, Jankipuram, Rajajipuram, Vrindavan Yojna, Ashiyana and Hazratganj. If you're looking for vehicle scrapping services in Alambagh, Lucknow or another area not listed, message us to check availability.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "क्या स्क्रैपिंग के लिए ट्रक, बस और वाणिज्यिक वाहन स्वीकार किए जाते हैं?"
          : "Are trucks, buses and commercial vehicles accepted for scrapping?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "हाँ। हम पात्र पुराने, क्षतिग्रस्त और अंतिम-जीवन ट्रकों, बसों और वाणिज्यिक वाहनों को संभालते हैं। लखनऊ में हमारी ट्रक स्क्रैपिंग और बस स्क्रैपिंग सेवाओं में न चलने वाले वाहनों के लिए टोइंग सहायता भी शामिल है। लखनऊ में वाणिज्यिक वाहन स्क्रैपिंग की पात्रता जांचने के लिए वाहन विवरण के साथ हमसे संपर्क करें।"
            : "Yes. We handle eligible old, damaged and end-of-life trucks, buses and commercial vehicles. Our truck scrapping and bus scrapping in Lucknow services also include towing support for vehicles that cannot run. Contact us with the vehicle details to check eligibility for commercial vehicle scrapping in Lucknow.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "ऑटो-रिक्शा या ई-रिक्शा स्क्रैप करने की क्या प्रक्रिया है?"
          : "What is the process for scrapping an auto-rickshaw or e-rickshaw?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "पुराने या अनफिट ऑटो-रिक्शा और ई-रिक्शा को उपयुक्त अधिकृत मार्ग से प्रोसेस किया जा सकता है। यदि आपको लखनऊ में ऑटो रिक्शा स्क्रैपिंग या ई-रिक्शा स्क्रैपिंग की आवश्यकता है, तो हमारी टीम के साथ अपने वाहन का विवरण साझा करें ताकि हम इसकी पात्रता की जांच कर सकें।"
            : "Old or unfit auto-rickshaws and e-rickshaws may be processed through the appropriate authorised route. If you need auto rickshaw scrapping or e rickshaw scrapping in Lucknow, share your vehicle details with our team so we can check its eligibility.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "लखनऊ में किसी वाहन के स्क्रैप मूल्य को कौन से कारक प्रभावित करते हैं?"
          : "What factors affect the scrap value of a vehicle in Lucknow?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "लखनऊ में वाहन स्क्रैप मूल्य वाहन की श्रेणी, वजन, आयु, स्थिति, पूर्णता और प्रचलित स्क्रैप-धातु दरों पर निर्भर करता है। आप आगे बढ़ने के किसी भी दायित्व के बिना स्क्रैपसेंटर से लखनऊ में मुफ्त वाहन मूल्यांकन का अनुरोध कर सकते हैं।"
            : "The vehicle scrap price in Lucknow depends on the vehicle's category, weight, age, condition, completeness and prevailing scrap-metal rates. You can request a free vehicle valuation in Lucknow from ScrapCentre without any obligation to proceed.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "क्या स्क्रैपसेंटर मेरे वाहन के आरसी रद्दीकरण में मदद करेगा?"
          : "Will ScrapCentre help with my vehicle's RC cancellation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "हाँ। हमारी टीम आवश्यक कागजी कार्रवाई में आपका मार्गदर्शन करती है और स्क्रैपिंग प्रक्रिया के भाग के रूप में लखनऊ में वाहन पंजीकरण रद्दीकरण का समर्थन करती है। हम वाहन स्क्रैपिंग आरसी आवश्यकताओं की भी व्याख्या करते हैं और पुष्टि करते हैं कि आपको कौन से दस्तावेज प्रदान करने की आवश्यकता है।"
            : "Yes. Our team guides you through the required paperwork and supports vehicle registration cancellation in Lucknow as part of the scrapping process. We also explain the vehicle scrapping RC requirements and confirm which documents you need to provide.",
        },
      },
      {
        "@type": "Question",
        name: isHindi
          ? "कार और बाइक मालिक प्रासंगिक स्क्रैपिंग विवरण कहाँ पा सकते हैं?"
          : "Where can car and bike owners find the relevant scrapping details?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isHindi
            ? "हमारे पास प्रत्येक श्रेणी के लिए प्रक्रिया की व्याख्या करने वाले अलग-अलग पृष्ठ हैं। मालिक श्रेणी-विशिष्ट जानकारी के लिए हमारे चार पहिया स्क्रैपिंग पेज या दोपहिया स्क्रैपिंग पेज पर जा सकते हैं। दोनों अधिकृत RVSF प्रक्रिया का पालन करते हैं।"
            : "We have separate pages explaining the process for each category. Owners can visit our four-wheeler scrapping page or two-wheeler scrapping page for category-specific information. Both follow the authorised RVSF process.",
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
      ? "लखनऊ में वाहन स्क्रैपिंग कैसे काम करता है: चार चरणों की प्रक्रिया"
      : "How to Scrap Your Vehicle in Lucknow: A Four-Step Process",
    description: isHindi
      ? "लखनऊ में अपने वाहन को स्क्रैप करने और जमा प्रमाणपत्र प्राप्त करने की 4-चरणीय सरल प्रक्रिया।"
      : "Scrapping your vehicle involves four key stages, from the first enquiry to the final Certificate of Deposit.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: isHindi ? "अपना नंबर और इलाका साझा करें" : "Share Your Number & Locality",
        text: isHindi
          ? "हमारी वेबसाइट या व्हाट्सएप के माध्यम से लखनऊ में अपना वाहन पंजीकरण नंबर और पिकअप इलाका साझा करके शुरुआत करें।"
          : "Start by sharing your vehicle registration number and pickup locality in Lucknow through our website or WhatsApp.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: isHindi ? "मुफ्त डोरस्टेप पिकअप" : "Free Doorstep Pickup",
        text: isHindi
          ? "एक बार स्क्रैपिंग की पुष्टि हो जाने पर, हम आपके स्थान से मुफ्त पिकअप की व्यवस्था करते हैं।"
          : "Once scrapping is confirmed, we arrange free collection from your location in Lucknow.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: isHindi ? "दस्तावेज और आरसी रद्दीकरण" : "Documents & RC Cancellation",
        text: isHindi
          ? "आवश्यक दस्तावेज सौंपें ताकि हमारी टीम आवश्यक औपचारिकताओं और आरसी रद्दीकरण में आपका मार्गदर्शन कर सके।"
          : "Hand over the required documents so our team can guide you through the necessary formalities, including the RC cancellation process.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: isHindi ? "भुगतान और जमा प्रमाणपत्र" : "Payment & Certificate of Deposit",
        text: isHindi
          ? "एक बार जब आपके वाहन को अधिकृत RVSF में प्रोसेस कर दिया जाता है, तो लागू भुगतान किया जाता है और आधिकारिक CoD जारी किया जाता है।"
          : "Once your vehicle has been processed at the authorised RVSF, the applicable payment is made and a Certificate of Deposit in Lucknow is issued as official confirmation.",
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
      <LucknowScrappingClient />
    </>
  )
}

