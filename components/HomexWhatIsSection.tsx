import { motion } from "framer-motion"
import { ShieldCheck, AlertTriangle, FileX, Recycle, CheckCircle2 } from "lucide-react"
import { useParams } from "next/navigation"

export default function HomexWhatIsSection() {
  const params = useParams()
  const isHindi = params?.locale === "hi"

  const scrappingCriteria = [
    {
      icon: ShieldCheck,
      text: isHindi
        ? "यह अपनी श्रेणी और उपयोग को नियंत्रित करने वाले नियमों के तहत लागू आयु सीमा तक पहुंचता है।"
        : "It reaches the applicable age limit under the rules governing its category and use.",
    },
    {
      icon: FileX,
      text: isHindi
        ? "यह आवश्यक फिटनेस परीक्षण में विफल रहता है और अब निरंतर उपयोग के लिए फिट नहीं माना जाता है।"
        : "It fails a required fitness test and is no longer considered fit for continued use.",
    },
    {
      icon: AlertTriangle,
      text: isHindi
        ? "इसमें गंभीर दुर्घटना क्षति या इसके निरंतर उपयोग को प्रभावित करने वाली अन्य परिस्थितियां हैं, जिनमें समाप्त हो चुके पंजीकरण से जुड़े मामले शामिल हैं।"
        : "It has severe accident damage or other circumstances affecting its continued use, including cases involving lapsed registration that require regulatory assessment.",
    },
  ]

  const headerVariants = {
    hidden: { opacity: 0, y: 35, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    },
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="relative py-8 md:py-12 lg:py-16 bg-transparent overflow-hidden"
    >
      {/* Background Image */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.05 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" as const }}
        className="absolute inset-0 bg-contain lg:bg-cover bg-right-top bg-no-repeat opacity-100 pointer-events-none transition-all duration-300"
        style={{ backgroundImage: `url('/whatis.png')` }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Main 2-Column Grid starting from Header level */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Header, Subtitle & Descriptive Paragraphs */}
          <motion.div
            variants={headerVariants}
            className="lg:col-span-7 text-left space-y-6"
          >
            {/* Category Tagline */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="h-[2px] w-6 bg-[#E31E24]"></span>
                <span className="text-[#E31E24] font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em]">
                  {isHindi ? "वाहन स्क्रैपिंग कैसे काम करता है" : "HOW VEHICLE SCRAPPING WORKS"}
                </span>
                <span className="h-[2px] w-6 bg-[#E31E24]"></span>
              </div>

              {/* Main Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.15] mb-4 tracking-tight">
                {isHindi ? (
                  <>
                    वाहन स्क्रैपिंग <span className="text-[#E31E24]">क्या है?</span>
                  </>
                ) : (
                  <>
                    What Is <span className="text-[#E31E24]">Vehicle Scrapping?</span>
                  </>
                )}
              </h2>

              {/* Subtitle / Paragraph */}
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed font-medium">
                {isHindi ? (
                  <>
                    वाहन स्क्रैपिंग सरकारी पंजीकृत वाहन स्क्रैपिंग सुविधा (RVSF) में किसी भी पुरानी कार का{" "}
                    <strong className="text-[#E31E24] font-bold">
                      कानूनी, स्थायी डी-रजिस्ट्रेशन और डिस्मेंटलिंग
                    </strong>{" "}
                    है, जो वाहन के मलबे और सामग्री मूल्य के बदले जमा प्रमाणपत्र (COD) जारी करती है।
                  </>
                ) : (
                  <>
                    Vehicle scrapping is the{" "}
                    <strong className="text-[#E31E24] font-bold">
                      legal, permanent deregistration and dismantling
                    </strong>{" "}
                    of an end-of-life vehicle at a government-authorised Registered Vehicle Scrapping Facility (RVSF), which issues a Certificate of Deposit (COD) in exchange for the vehicle's material and salvage value.
                  </>
                )}
              </p>
            </div>

            {/* Descriptive Points Card */}
            <div className="bg-white/90 backdrop-blur-md border border-slate-100 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed font-normal">
              <p className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#E31E24] shrink-0 mt-0.5" />
                <span>
                  {isHindi
                    ? "यह एक पुराने या अनुपयुक्त वाहन के लिए कानूनी निपटान का मार्ग प्रदान करता है जब वह निरंतर उपयोग के लिए उपयुक्त नहीं रह जाता है।"
                    : "It provides a legal route for car disposal when an old or unfit car is no longer suitable for continued use."}
                </span>
              </p>
              <p className="flex items-start gap-3">
                <Recycle className="w-5 h-5 text-[#E31E24] shrink-0 mt-0.5" />
                <span>
                  {isHindi
                    ? "अन्य एंड-ऑफ-लाइफ वाहनों के लिए, यह प्रक्रिया अधिकृत डिस्मंतलिंग और रीसाइक्लिंग के माध्यम से जिम्मेदार वाहन निपटान का समर्थन करती है।"
                    : "For other end-of-life vehicles, the process supports responsible vehicle disposal through authorised dismantling and recycling."}
                </span>
              </p>
              <p className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#E31E24] shrink-0 mt-0.5" />
                <span>
                  {isHindi
                    ? "पुनर्प्राप्त सामग्री कार रीसाइक्लिंग प्रक्रिया में प्रवेश कर सकती है, जिससे नए कच्चे माल की आवश्यकता को कम करने में मदद मिलती है। वाहन निपटान से अनौपचारिक हैंडलिंग में छोड़े जाने के बजाय स्क्रैप किए गए वाहनों से उपयोगी धातुओं और अन्य सामग्रियों को पुनर्प्राप्त करने की अनुमति मिलती है।"
                    : "The recovered materials can then enter the car recycling process, helping reduce the need for new raw materials. Vehicle disposal also allows usable metals and other materials to be recovered from scrapped vehicles instead of being left to informal handling."}
                </span>
              </p>
            </div>
          </motion.div>

          {/* Right Column: Scrapping Consideration Criteria Card aligned with Heading Top */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700/50"
          >
            <h3 className="text-base sm:text-lg font-bold mb-5 flex items-center gap-2 text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E31E24]" />
              {isHindi ? "वाहन को स्क्रैपिंग के लिए कब विचार किया जा सकता है:" : "A vehicle may be considered for scrapping when:"}
            </h3>

            <div className="space-y-4">
              {scrappingCriteria.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="flex items-start gap-3.5 bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl transition-all hover:border-red-500/40">
                    <div className="w-8 h-8 rounded-lg bg-[#E31E24]/20 border border-[#E31E24]/30 flex items-center justify-center text-[#E31E24] shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-[#E31E24]" />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                      {item.text}
                    </p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
