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
  const homeUrl = `https://www.scrapcentre.com${isHindi ? "/hi" : ""}`

  // 1. WebPage Schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    "url": pageUrl,
    "name": isHindi ? "भारत में वाहन स्क्रैपिंग सेवाएं" : "Vehicle Scrapping Services in India",
    "description": isHindi
      ? "RVSF-प्रमाणित जमा, मुफ्त डोरस्टेप पिकअप और सर्वोत्तम स्क्रैप मूल्य के साथ पेशेवर वाहन स्क्रैपिंग सेवाएं।"
      : "Professional vehicle scrapping services with RVSF-certified deposit, free doorstep pickup, and best scrap value.",
    "isPartOf": { "@id": "https://www.scrapcentre.com/#website" },
    "about": { "@id": "https://www.scrapcentre.com/#organization" },
    "publisher": { "@id": "https://www.scrapcentre.com/#organization" },
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

  // 3. Service Schema (with OfferCatalog & live areaServed cities)
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    "name": isHindi ? "वाहन स्क्रैपिंग सेवाएं" : "Vehicle Scrapping Services",
    "serviceType": "Vehicle Scrapping & Recycling",
    "description": isHindi
      ? "RVSF-प्रमाणित जमा, मुफ्त डोरस्टेप पिकअप और आरसी डी-रजिस्ट्रेशन सहायता के साथ अधिकृत वाहन स्क्रैपिंग सेवाएं।"
      : "Authorised vehicle scrapping services with RVSF-certified Certificate of Deposit, free doorstep pickup, and RC deregistration assistance.",
    "provider": { "@id": "https://www.scrapcentre.com/#organization" },
    "areaServed": [
      { "@type": "City", "name": "Kanpur" },
      { "@type": "City", "name": "Etawah" },
      { "@type": "City", "name": "Auraiya" },
      { "@type": "Country", "name": "India" },
    ],
    "url": pageUrl,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "15000",
      "bestRating": "5",
      "worstRating": "1",
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Vehicle Scrapping Services Catalog",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": isHindi ? "कार स्क्रैपिंग सेवाएं" : "Car Scrapping Services",
            "description": isHindi
              ? "RVSF-प्रमाणित जमा प्रमाणपत्र और मुफ्त पिकअप के साथ कार स्क्रैपिंग सेवाएं।"
              : "Car scrapping services with RVSF-certified Certificate of Deposit and free doorstep pickup.",
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": isHindi ? "वाणिज्यिक वाहन स्क्रैपिंग" : "Commercial Vehicle Scrapping",
            "description": isHindi
              ? "ट्रक, बस और अन्य वाणिज्यिक वाहनों के लिए अधिकृत स्क्रैपिंग सेवाएं।"
              : "Authorised scrapping services for trucks, buses, and commercial vehicles.",
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": isHindi ? "टू-व्हीलर स्क्रैपिंग सेवाएं" : "Two-Wheeler Scrapping Services",
            "description": isHindi
              ? "पुराने दोपहिया और बाइक के लिए परेशानी मुक्त स्क्रैपिंग और आरसी रद्दीकरण सहायता।"
              : "Hassle-free scrapping and RC cancellation support for old two-wheelers and bikes.",
          },
        },
      ],
    },
  }

  // 4. FAQPage Schema (All 8 FAQs matching on-page text)
  const faqList = isHindi
    ? [
        {
          question: "वाहन स्क्रैपिंग प्रक्रिया कैसे काम करती है?",
          answer: "यह आसान है! कोटेशन प्राप्त करें, मुफ़्त पिकअप शेड्यूल करें, हम आपका वाहन एकत्र करते हैं, दस्तावेज़ीकरण पूरा करते हैं, और त्वरित भुगतान करते हैं।",
        },
        {
          question: "मैं अपने वाहन का मूल्यांकन कैसे प्राप्त करूं?",
          answer: "आप हमारे होमपेज पर अपना वाहन पंजीकरण नंबर दर्ज करके या हमारी सहायता टीम को कॉल करके तुरंत कोटेशन प्राप्त कर सकते हैं।",
        },
        {
          question: "क्या आप मुफ़्त वाहन पिकअप की पेशकश करते हैं?",
          answer: "हाँ, हम अपने अधिकृत केंद्रों के माध्यम से स्क्रैप किए जा रहे सभी वाहनों के लिए मुफ़्त डोरस्टेप पिकअप प्रदान करते हैं।",
        },
        {
          question: "मालिक की अनुपस्थिति में वाहन कैसे स्क्रैप करें?",
          answer: "यदि मालिक उपलब्ध नहीं है, तो अधिकृत प्रतिनिधि हस्ताक्षरित प्राधिकरण पत्र और आरटीओ सत्यापन के लिए वैध आईडी प्रमाण के साथ प्रक्रिया शुरू कर सकता है।",
        },
        {
          question: "यदि मेरे वाहन पर ऋण बकाया है तो क्या होगा?",
          answer: "आरसी रद्द करने और स्क्रैपिंग प्रक्रिया शुरू करने से पहले संबंधित फाइनेंसर या बैंक से नो ऑब्जेक्शन सर्टिफिकेट (NOC) प्राप्त करना अनिवार्य है।",
        },
        {
          question: "क्या गैर-चालू स्थिति में भी कार स्क्रैप की जा सकती है?",
          answer: "हाँ! स्क्रैपसेंटर गैर-चालू या दुर्घटनाग्रस्त वाहनों के लिए मुफ्त टोइंग और डोरस्टेप पिकअप प्रदान करता है।",
        },
        {
          question: "जमा प्रमाणपत्र (COD) प्राप्त करने में कितना समय लगता है?",
          answer: "अधिकृत RVSF सुविधा पर वाहन का निरीक्षण और सत्यापन पूरा होने के तुरंत बाद इलेक्ट्रॉनिक जमा प्रमाणपत्र (COD) जारी किया जाता है।",
        },
        {
          question: "स्क्रैपसेंटर के माध्यम से कार स्क्रैप करने के क्या फायदे हैं?",
          answer: "आपको 100% आरटीओ-अनुपालक आरवीएसएफ प्रसंस्करण, सर्वोत्तम स्क्रैप मूल्य, निःशुल्क पिकअप, तत्काल भुगतान और आधिकारिक जमा प्रमाणपत्र मिलता है।",
        },
      ]
    : [
        {
          question: "How does the vehicle scrapping process work?",
          answer: "It's simple! Get a quote, schedule a free pickup, we collect your vehicle, complete the paperwork, and make instant payment.",
        },
        {
          question: "How do I get a quote for my vehicle?",
          answer: "You can get an instant quote by entering your vehicle registration number on our homepage or by calling our support team.",
        },
        {
          question: "Do you offer free vehicle pickup?",
          answer: "Yes, we provide free doorstep pickup for all vehicles being scrapped through our authorized centers.",
        },
        {
          question: "How to scrap a car in the absence of the owner?",
          answer: "If the registered owner is unavailable, an authorized representative can initiate scrapping with a signed authorization letter and valid ID proof for RTO verification.",
        },
        {
          question: "What if there is a pending loan on my vehicle?",
          answer: "A No Objection Certificate (NOC) must be obtained from the financing bank before starting the RC cancellation and scrapping process.",
        },
        {
          question: "Can a non-running vehicle be scrapped?",
          answer: "Yes! ScrapCentre provides free towing and doorstep pickup for non-running, damaged, or accident vehicles.",
        },
        {
          question: "How long does it take to get the Certificate of Deposit (COD)?",
          answer: "The digital Certificate of Deposit (COD) is issued promptly after vehicle inspection and physical verification at the authorized RVSF.",
        },
        {
          question: "What are the benefits of scrapping through ScrapCentre?",
          answer: "You get 100% RTO-compliant RVSF processing, best scrap value, free doorstep pickup, instant payment, and official Certificate of Deposit.",
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
    "name": isHindi ? "वाहन स्क्रैपिंग प्रक्रिया" : "Vehicle Scrapping Process",
    "description": isHindi
      ? "स्क्रैपसेंटर के साथ कोटेशन प्राप्त करने से लेकर जमा प्रमाणपत्र (COD) प्राप्त करने तक 4 आसान चरणों में वाहन स्क्रैप करने की प्रक्रिया।"
      : "Step-by-step guide to scrapping your vehicle with ScrapCentre from valuation quote to Certificate of Deposit (COD).",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "url": `${pageUrl}#step-1`,
        "name": isHindi ? "अपना वाहन विवरण साझा करें" : "Share Your Vehicle Details",
        "itemListElement": [
          {
            "@type": "HowToDirection",
            "text": isHindi
              ? "अपने वाहन के लिए अनुमान प्राप्त करने के लिए अपना वाहन नंबर और बुनियादी विवरण प्रदान करें।"
              : "Provide your vehicle number and basic details to receive an estimate for your vehicle.",
          },
        ],
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "url": `${pageUrl}#step-2`,
        "name": isHindi ? "मुफ्त डोरस्टेप पिकअप प्राप्त करें" : "Get Free Doorstep Pickup",
        "itemListElement": [
          {
            "@type": "HowToDirection",
            "text": isHindi
              ? "एक बार स्क्रैपिंग की पुष्टि होने के बाद, हम मुफ्त डोरस्टेप पिकअप की व्यवस्था करते हैं।"
              : "Once the scrapping is confirmed, we arrange free doorstep pickup.",
          },
        ],
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "url": `${pageUrl}#step-3`,
        "name": isHindi ? "दस्तावेजीकरण और RC रद्दीकरण पूरा करें" : "Complete Documentation & RC Cancellation",
        "itemListElement": [
          {
            "@type": "HowToDirection",
            "text": isHindi
              ? "आवश्यक दस्तावेज जमा करें और आवश्यक कागजी कार्रवाई और आरसी रद्दीकरण के साथ सहायता प्राप्त करें।"
              : "Submit the required documents and get support with the necessary paperwork and RC cancellation.",
          },
        ],
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "url": `${pageUrl}#step-4`,
        "name": isHindi ? "भुगतान और जमा प्रमाणपत्र प्राप्त करें" : "Receive Payment & Certificate of Deposit",
        "itemListElement": [
          {
            "@type": "HowToDirection",
            "text": isHindi
              ? "एक बार जब वाहन को अधिकृत RVSF में संसाधित किया जाता है, तो आपको लागू भुगतान और जमा प्रमाणपत्र (COD) प्राप्त होता है।"
              : "Once the vehicle is processed at the authorised RVSF, you receive the applicable payment and Certificate of Deposit (COD).",
          },
        ],
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
