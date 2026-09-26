"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Truck, FileCheck2, Building2, CheckCircle2 } from "lucide-react"
import { useParams } from "next/navigation"

export default function WhyChooseScrapCentreSection() {
  const params = useParams()
  const locale = params?.locale === "hi" ? "hi" : "en"
  const isHindi = locale === "hi"

  const features = [
    {
      icon: ShieldCheck,
      titleEn: "Authorised RVSF Process",
      titleHi: "अधिकृत RVSF प्रक्रिया",
      descEn: "Get your vehicle processed through a registered facility with the required documentation.",
      descHi: "आवश्यक दस्तावेजों के साथ पंजीकृत सुविधा के माध्यम से अपना वाहन प्रसंस्कृत करवाएं।",
      accentColor: "border-l-4 border-l-[#E31E24]",
      iconBg: "bg-red-50 dark:bg-red-950/40 text-[#E31E24]",
    },
    {
      icon: Truck,
      titleEn: "Free Doorstep Pickup",
      titleHi: "मुफ्त डोरस्टेप पिकअप",
      descEn: "Get convenient vehicle collection from your location, including support for vehicles that are not running.",
      descHi: "अपने स्थान से सुविधाजनक वाहन संग्रह प्राप्त करें, जिसमें बिना चलने वाले वाहनों का समर्थन भी शामिल है।",
      accentColor: "border-l-4 border-l-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: FileCheck2,
      titleEn: "Clear Scrapping Support",
      titleHi: "स्पष्ट स्क्रैपिंग सहायता",
      descEn: "Get assistance with valuation, paperwork, RC cancellation and the Certificate of Deposit (COD).",
      descHi: "मूल्यांकन, कागजी कार्रवाई, आरसी रद्दीकरण और जमा प्रमाण पत्र (COD) में सहायता प्राप्त करें।",
      accentColor: "border-l-4 border-l-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    },
  ]

  return (
    <section className="bg-white dark:bg-slate-950 py-12 md:py-16 transition-colors duration-300 border-t border-slate-100 dark:border-slate-800/60">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl text-left">
        {/* Header Block */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-10 max-w-4xl"
        >
          <span className="text-[#E31E24] text-[11px] md:text-xs font-bold tracking-[0.18em] uppercase block mb-2">
            {isHindi ? "हमारा परिचय और लाभ" : "WHY CHOOSE US"}
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug mb-4">
            {isHindi
              ? "व्यवसाय और व्यक्ति स्क्रैपसेंटर क्यों चुनते हैं"
              : "Why Businesses and Individuals Choose ScrapCentre"}
          </h2>

          <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base font-medium leading-relaxed">
            {isHindi
              ? "स्क्रैपसेंटर एक कार स्क्रैपिंग कंपनी है जो व्यक्तियों और व्यवसायों को अधिकृत प्रक्रिया के माध्यम से वाहन स्क्रैपिंग प्रबंधित करने में मदद करती है। भारत में एक वाहन स्क्रैपिंग कंपनी के रूप में, हम मूल्यांकन, पिकअप, दस्तावेज और स्क्रैपिंग सहायता के साथ प्रक्रिया को आसान बनाते हैं।"
              : "ScrapCentre is a car scrapping company that helps individuals and businesses manage vehicle scrapping through an authorised process. As a vehicle scrapping company in India, we make the process easier with valuation, pickup, documentation and scrapping support."}
          </p>
        </motion.div>

        {/* Features Subheader */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 flex items-center gap-2"
        >
          <Building2 className="w-5 h-5 text-[#E31E24]" />
          <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
            {isHindi ? "स्क्रैपसेंटर क्यों चुनें?" : "Why Choose ScrapCentre?"}
          </h3>
        </motion.div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * idx }}
                whileHover={{ y: -3 }}
                className={`
                  bg-slate-50/80 dark:bg-slate-900/70
                  p-6 rounded-xl
                  border border-slate-200/80 dark:border-slate-800
                  ${feature.accentColor}
                  shadow-sm hover:shadow-md
                  transition-all duration-200
                  flex flex-col justify-between
                `}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${feature.iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-80" />
                  </div>

                  <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {isHindi ? feature.titleHi : feature.titleEn}
                  </h4>

                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {isHindi ? feature.descHi : feature.descEn}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
