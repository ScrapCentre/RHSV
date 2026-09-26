"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, Phone, Headphones, ShieldCheck, FileText, Users, Star, ChevronRight, Quote, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

export default function ReviewSection() {
  const t = useTranslations("HomePage")
  const params = useParams()
  const isHindi = params?.locale === "hi"
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const faqs = [
    {
      questionEn: "1. Is vehicle scrapping mandatory in India?",
      questionHi: "1. क्या भारत में वाहन स्क्रैपिंग अनिवार्य है?",
      answerEn: "Vehicle scrapping is not mandatory for every vehicle in India. However, vehicles that are no longer eligible for continued use under applicable rules may need to be scrapped or deregistered. The vehicle scrappage policy India framework covers requirements related to vehicle age, fitness and registration.",
      answerHi: "भारत में हर वाहन के लिए वाहन स्क्रैपिंग अनिवार्य नहीं है। हालांकि, लागू नियमों के तहत जो वाहन अब आगे उपयोग के पात्र नहीं हैं, उन्हें स्क्रैप या डी-रजिस्टर्ड करने की आवश्यकता हो सकती है। भारत वाहन स्क्रैपेज नीति ढांचा वाहन की आयु, फिटनेस और पंजीकरण से संबंधित आवश्यकताओं को कवर करता है।",
    },
    {
      questionEn: "2. How much can I get for scrapping my vehicle?",
      questionHi: "2. मुझे अपना वाहन स्क्रैप करने पर कितना पैसा मिल सकता है?",
      answerEn: "The amount depends on the vehicle type, weight, condition and applicable scrap rates. Your vehicle scrap price may also vary based on eligible benefits and current valuation factors. A vehicle-specific valuation can give you a more accurate estimate before you proceed with scrapping.",
      answerHi: "राशि वाहन के प्रकार, वजन, स्थिति और लागू स्क्रैप दरों पर निर्भर करती है। आपकी गाड़ी का स्क्रैप मूल्य पात्र लाभों और वर्तमान मूल्यांकन कारकों के आधार पर भी भिन्न हो सकता है। स्क्रैपिंग के साथ आगे बढ़ने से पहले एक वाहन-विशिष्ट मूल्यांकन आपको अधिक सटीक अनुमान दे सकता है।",
    },
    {
      questionEn: "3. What documents do I need to scrap my car or bike?",
      questionHi: "3. अपनी कार या बाइक को स्क्रैप करने के लिए मुझे किन दस्तावेजों की आवश्यकता है?",
      answerEn: "You generally need the vehicle's Registration Certificate (RC) and the registered owner's ID proof. PUC and insurance copies may also be required if available. A financier NOC may be needed for a hypothecated vehicle. Check the required vehicle scrapping documents before pickup.",
      answerHi: "सामान्य तौर पर आपको वाहन का पंजीकरण प्रमाणपत्र (RC) और पंजीकृत मालिक के पहचान पत्र की आवश्यकता होती है। यदि उपलब्ध हो तो PUC और बीमा की प्रतियां भी आवश्यक हो सकती हैं। हाइपोथिकेटेड वाहन के लिए फाइनेंसर NOC की आवश्यकता हो सकती है। पिकअप से पहले आवश्यक वाहन स्क्रैपिंग दस्तावेजों की जांच करें।",
    },
    {
      questionEn: "4. Do you scrap two-wheelers, buses and trucks too?",
      questionHi: "4. क्या आप दोपहिया वाहन, बसें और ट्रक भी स्क्रैप करते हैं?",
      answerEn: "Yes, ScrapCentre accepts eligible two-wheelers, buses, trucks, auto-rickshaws, commercial vehicles, EVs and other vehicle types. Requirements can vary by category under the vehicle scrapping policy India framework. The vehicle's eligibility can be checked before starting the authorised scrapping process.",
      answerHi: "हां, स्क्रैपसेंटर पात्र दोपहिया वाहनों, बसों, ट्रकों, ऑटो-रिक्शा, वाणिज्यिक वाहनों, ईवी और अन्य वाहन प्रकारों को स्वीकार करता है। भारत वाहन स्क्रैपेज नीति ढांचे के तहत श्रेणी के अनुसार आवश्यकताएं भिन्न हो सकती हैं। अधिकृत स्क्रैपिंग प्रक्रिया शुरू करने से पहले वाहन की पात्रता की जांच की जा सकती है।",
    },
    {
      questionEn: "5. Is the pickup really free?",
      questionHi: "5. क्या पिकअप वास्तव में मुफ्त है?",
      answerEn: "Yes, free car pickup for scrapping is available from eligible service locations, subject to applicable terms and service availability. This allows owners to arrange vehicle collection instead of taking an end of life vehicle to the facility themselves. Pickup support may also be available for non-running vehicles.",
      answerHi: "हां, लागू शर्तों और सेवा उपलब्धता के अधीन, पात्र सेवा स्थानों से स्क्रैपिंग के लिए मुफ्त कार पिकअप उपलब्ध है। यह मालिकों को जीवन के अंतिम चरण वाले वाहन को स्वयं सुविधा तक ले जाने के बजाय वाहन संग्रह की व्यवस्था करने की अनुमति देता है। ना चलने वाले वाहनों के लिए भी पिकअप सहायता उपलब्ध हो सकती है।",
    },
    {
      questionEn: "6. What is a Certificate of Deposit (COD)?",
      questionHi: "6. जमा प्रमाण पत्र (COD) क्या है?",
      answerEn: "A Certificate of Deposit (COD) is issued when a vehicle is deposited with an authorised RVSF for scrapping. It confirms that the vehicle has entered the authorised scrapping process and supports its permanent deregistration. It is an important document when completing end of life vehicle recycling through an authorised facility.",
      answerHi: "जब किसी वाहन को स्क्रैपिंग के लिए अधिकृत RVSF में जमा किया जाता है तो जमा प्रमाण पत्र (COD) जारी किया जाता है। यह पुष्टि करता है कि वाहन ने अधिकृत स्क्रैपिंग प्रक्रिया में प्रवेश किया है और इसके स्थायी डी-रजिस्ट्रेशन का समर्थन करता है। अधिकृत सुविधा के माध्यम से वाहन रीसाइक्लिंग पूरा करते समय यह एक महत्वपूर्ण दस्तावेज है।",
    },
    {
      questionEn: "7. Can I scrap a vehicle without RC or insurance?",
      questionHi: "7. क्या मैं बिना RC या बीमा के वाहन स्क्रैप कर सकता हूं?",
      answerEn: "A vehicle may still be eligible for scrapping if the RC or insurance document is unavailable, but the required verification and supporting documents should be confirmed first. Missing documents may affect the process. For doorstep car scrapping, share your available vehicle and ownership details to check the requirements.",
      answerHi: "यदि RC या बीमा दस्तावेज अनुपलब्ध है तो भी वाहन स्क्रैपिंग के लिए पात्र हो सकता है, लेकिन आवश्यक सत्यापन और सहायक दस्तावेजों की पहले पुष्टि की जानी चाहिए। दस्तावेज गायब होने से प्रक्रिया प्रभावित हो सकती है। डोरस्टेप कार स्क्रैपिंग के लिए, आवश्यकताओं की जांच के लिए अपने उपलब्ध वाहन और स्वामित्व विवरण साझा करें।",
    },
    {
      questionEn: "8. How long does the whole process take?",
      questionHi: "8. पूरी प्रक्रिया में कितना समय लगता है?",
      answerEn: "The timeline depends on document verification, vehicle pickup, inspection and processing at the authorised facility. ELV recycling and deregistration follow the applicable process after the vehicle is received and verified. ScrapCentre can provide an estimated timeline after reviewing your vehicle details, location and documents.",
      answerHi: "समय सीमा दस्तावेज सत्यापन, वाहन पिकअप, निरीक्षण और अधिकृत सुविधा पर प्रसंस्करण पर निर्भर करती है। वाहन प्राप्त होने और सत्यापित होने के बाद प्रक्रिया का पालन किया जाता है। आपके वाहन विवरण, स्थान और दस्तावेजों की समीक्षा करने के बाद स्क्रैपसेंटर एक अनुमानित समय सीमा प्रदान कर सकता है।",
    },
  ]

  const reviews = [1, 2, 3, 4].map((i) => ({
    id: i,
    name:    t(`reviews.testimonials.${i}.name`),
    content: t(`reviews.testimonials.${i}.content`),
    car:     t(`reviews.testimonials.${i}.car`),
    image:   [`/frontpage/pic2.jpg`, `/frontpage/pic3.png`, `/frontpage/pic1.jpg`, `/frontpage/pic1.jpg`][i - 1],
    rating: 5,
  }))

  const features = [
    { icon: Headphones, key: "support" },
    { icon: ShieldCheck, key: "secure" },
    { icon: FileText,   key: "transparent" },
    { icon: Users,      key: "expert" },
  ] as const

  const nextReview = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % reviews.length)
  }, [reviews.length])

  const prevReview = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }, [reviews.length])

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(nextReview, 5000)
    return () => clearInterval(timer)
  }, [nextReview])

  return (
    <section id="faq" className="pt-20 pb-10 bg-white overflow-hidden relative">
      {/* Abstract Background Shapes */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-50 -mr-48 pointer-events-none"></div>
      <div className="absolute bottom-40 left-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-30 -ml-32 pointer-events-none"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Testimonials Carousel - Redesigned to match image */}
        <div className="mb-20 relative px-4 md:px-12">
          {/* Decorative Dot Patterns */}
          <div className="absolute top-0 left-0 -translate-x-6 -translate-y-6 opacity-20 pointer-events-none hidden md:block">
            <div className="grid grid-cols-5 gap-2">
              {[...Array(25)].map((_, i) => <div key={i} className="w-1 h-1 bg-[#E31E24] rounded-full"></div>)}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 translate-x-6 translate-y-6 opacity-20 pointer-events-none hidden md:block">
            <div className="grid grid-cols-5 gap-2">
              {[...Array(25)].map((_, i) => <div key={i} className="w-1 h-1 bg-[#E31E24] rounded-full"></div>)}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <span className="text-[#E31E24] font-bold uppercase tracking-[0.3em] text-[10px] mb-3 block">
                {t("reviews.tagline")}
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                {t("reviews.heading").split(" ").slice(0, -2).join(" ")}{" "}
                <span className="text-[#E31E24]">{t("reviews.heading").split(" ").slice(-2).join(" ")}</span>
              </h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                {t("reviews.description")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
               {/* Star Rating Card */}
               <div className="bg-white border border-slate-100 p-4 px-8 rounded-2xl shadow-xl shadow-slate-200/40 flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full border-2 border-[#E31E24] flex items-center justify-center text-[#E31E24]">
                    <Star size={24} fill="currentColor" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900 leading-none mb-1">4.9/5</div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t("reviews.ratingLabel")}</div>
                  </div>
               </div>

               {/* Google Rating */}
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center p-2 border border-slate-100">
                    <svg viewBox="0 0 24 24" className="w-full h-full"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("reviews.googleRating")}</div>
                    <div className="flex gap-0.5 items-center">
                      {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-[#E31E24] text-[#E31E24]" />)}
                      <span className="ml-2 text-[10px] font-bold text-slate-500">{t("reviews.googleReviewCount")}</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="relative">
            {/* Navigation Arrows - Side Aligned */}
            <button 
              onClick={prevReview} 
              className="hidden md:flex absolute left-0 top-1/2 -translate-x-4 md:-translate-x-12 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-slate-100 shadow-xl items-center justify-center text-slate-400 hover:text-[#E31E24] hover:border-[#E31E24] transition-all z-20"
            >
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <button 
              onClick={nextReview} 
              className="hidden md:flex absolute right-0 top-1/2 translate-x-4 md:translate-x-12 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-slate-100 shadow-xl items-center justify-center text-slate-400 hover:text-[#E31E24] hover:border-[#E31E24] transition-all z-20"
            >
              <ChevronRight size={24} />
            </button>

            <div className="py-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                {[0, 1, 2].map((idx) => {
                  const reviewIdx = (activeIndex + idx) % reviews.length
                  const review = reviews[reviewIdx]
                  const isCenter = idx === 1
                  const showActive = isMobile ? (idx === 0) : isCenter

                  return (
                    <motion.div
                      key={idx}
                      layout
                      animate={{ 
                        opacity: showActive ? 1 : 0.4, 
                        scale: showActive ? (isMobile ? 1 : 1.05) : 0.9,
                      }}
                      transition={{ 
                        duration: 0.6, 
                        ease: "easeInOut" 
                      }}
                      className={`bg-white p-8 md:p-10 rounded-[2.5rem] border-2 flex flex-col h-full relative group transition-all duration-500
                        ${idx > 0 ? 'hidden md:flex' : 'flex'}
                        ${isCenter ? 'md:shadow-[0_20px_50px_rgba(227,30,36,0.12)] md:border-[#E31E24]/10 md:z-10' : 'shadow-sm border-slate-100 z-0'}`}
                    >
                      {/* Big Quote Icon */}
                      <div className={`${isCenter ? 'text-[#E31E24]' : 'text-slate-200'} mb-4 transition-colors duration-300`}>
                        <Quote size={32} fill="currentColor" className="opacity-100" />
                      </div>

                      {/* Red Stars */}
                      <div className="flex gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className="fill-[#E31E24] text-[#E31E24]" />
                        ))}
                      </div>

                      <p className="text-slate-600 font-medium mb-10 flex-grow text-[13px] leading-relaxed">
                        {review.content}
                      </p>

                      {/* Divider */}
                      <div className="w-full h-[1px] bg-slate-100 mb-8"></div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-lg bg-slate-100 flex items-center justify-center text-[#E31E24] font-black text-lg uppercase relative">
                            {review.image ? (
                              <Image 
                                src={review.image} 
                                alt={review.name} 
                                fill 
                                className="object-cover"
                              />
                            ) : (
                              review.name[0]
                            )}
                          </div>
                          <div>
                            <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-900 leading-tight mb-0.5">{review.name}</h4>
                            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">{t("reviews.sold")} <span className="text-[#E31E24]">{review.car.split(' ').slice(0, 2).join(' ')}</span></p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1 text-[#E31E24] bg-red-50 px-2 py-1 rounded-full">
                             <CheckCircle2 size={10} fill="currentColor" className="text-white" />
                             <span className="text-[7px] font-black uppercase tracking-widest">{t("reviews.verifiedCustomer")}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-3 mt-12">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`transition-all duration-500 rounded-full h-2 ${activeIndex === i ? 'w-10 bg-[#E31E24] shadow-lg shadow-red-500/20' : 'w-2 bg-slate-200 hover:bg-slate-300'}`}
              />
            ))}
          </div>
        </div>

        {/* Support & FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left Column: FAQ */}
          <div>
            <div className="mb-8">
              <span className="text-[#E31E24] font-bold uppercase tracking-[0.2em] text-[10px] mb-2 block">
                Frequently Asked <span className="inline-block w-6 h-[1px] bg-[#E31E24] align-middle ml-2"></span>
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                Everything owners ask before scrapping
              </h2>
              <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed max-w-md">
                Find clear answers to common questions about vehicle scrapping in India.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className={`border rounded-xl transition-all duration-300 ${openFaq === index ? 'border-red-100 bg-red-50/30' : 'border-slate-100 bg-white'}`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${openFaq === index ? 'bg-[#E31E24] text-white' : 'bg-red-50 text-[#E31E24]'}`}>
                        {openFaq === index ? <Minus size={14} /> : <Plus size={14} />}
                      </div>
                      <span className="text-xs font-bold tracking-wide text-slate-900 leading-snug">
                        {isHindi ? faq.questionHi : faq.questionEn}
                      </span>
                    </div>
                    <div className={`transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                      <ChevronRight size={16} className="text-slate-400 shrink-0 ml-2" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-10 pb-5 text-slate-600 text-xs md:text-sm leading-relaxed font-normal">
                          {isHindi ? faq.answerHi : faq.answerEn}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Replacement Image & Features */}
          <div className="flex flex-col gap-8">
            <div className="relative flex items-start justify-center pt-2">
              <Image 
                src="/faqimg.png" 
                alt="FAQ Support Image" 
                width={600} 
                height={400} 
                className="w-full h-auto object-contain rounded-[2rem]"
              />
            </div>

            {/* Features Grid - 2 cols on mobile, 4 cols on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {features.map((feature, i) => (
                <div key={i} className="bg-white border border-slate-100 p-2 py-7 min-h-[130px] rounded-xl hover:bg-red-50 hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all group flex flex-col items-center text-center justify-center">
                  <div className="w-10 h-10 rounded-lg bg-[#E31E24] flex items-center justify-center text-white mb-3 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                    <feature.icon size={20} />
                  </div>
                  <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-tight leading-none mb-1">
                    {t(`faq.supportFeatures.${feature.key}.title`).split(' ')[0]}
                  </h4>
                  <p className="text-slate-500 text-[9px] font-medium leading-tight">
                    {t(`faq.supportFeatures.${feature.key}.desc`).split(' ').slice(0, 3).join(' ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
