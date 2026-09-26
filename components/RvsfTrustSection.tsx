"use client"

import { motion } from "framer-motion"
import { Check, X, ShieldCheck, AlertTriangle } from "lucide-react"
import { useParams } from "next/navigation"

export default function RvsfTrustSection() {
  const params = useParams()
  const isHindi = params?.locale === "hi"

  const authorizedBenefits = [
    isHindi
      ? "पंजीकृत सुविधा के माध्यम से अधिकृत वाहन स्क्रैपिंग"
      : "Authorised vehicle scrapping through a registered facility",
    isHindi
      ? "स्क्रैपिंग प्रक्रिया के लिए उचित दस्तावेज़ीकरण"
      : "Proper documentation for the scrapping process",
    isHindi
      ? "स्क्रैपिंग और इसके स्थायी डी-रजिस्ट्रेशन के लिए वाहन जमा किए जाने के प्रमाण के रूप में जमा प्रमाणपत्र (COD)"
      : "Certificate of Deposit (COD) as proof of the vehicle being deposited for scrapping and its permanent deregistration",
    isHindi
      ? "RC रद्दीकरण और संबंधित औपचारिकताओं के साथ सहायता"
      : "Support with RC cancellation and related formalities",
    isHindi
      ? "वाहन का अधिकृत डिस्मेंटलिंग और रीसाइक्लिंग"
      : "Authorised dismantling and recycling of the vehicle",
    isHindi
      ? "लागू स्क्रैपिंग लाभों पर बेहतर दृश्यता"
      : "Better visibility on applicable scrapping benefits",
  ]

  const unauthorizedRisks = [
    isHindi
      ? "कोई गारंटी नहीं कि आपका वाहन किसी पंजीकृत वाहन स्क्रैपिंग सुविधा तक पहुंचेगा"
      : "No assurance that your vehicle reaches a registered vehicle scrapping facility",
    isHindi
      ? "अधूरा या अस्पष्ट स्क्रैपिंग दस्तावेज़ीकरण"
      : "Incomplete or unclear scrapping documentation",
    isHindi
      ? "अधिकृत प्रक्रिया के माध्यम से कोई वैध वाहन स्क्रैपिंग प्रमाणपत्र नहीं"
      : "No valid vehicle scrapping certificate through the authorised process",
    isHindi
      ? "उचित वाहन डी-रजिस्ट्रेशन की पुष्टि करने में कठिनाई"
      : "Difficulty confirming proper vehicle deregistration",
    isHindi
      ? "वाहन के अनौपचारिक डिस्मेंटलिंग या रीसाइक्लिंग चैनलों में जाने का जोखिम"
      : "Risk of the vehicle entering informal dismantling or recycling channels",
    isHindi
      ? "अधिकृत स्क्रैपिंग से जुड़े लाभों का संभावित नुकसान"
      : "Possible loss of benefits linked to authorised scrapping",
  ]

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-white text-slate-900 overflow-hidden">
      {/* Background Subtle Accent Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-12 text-left max-w-3xl"
        >
          {/* Category Tag */}
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] mb-3 border border-black shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E31E24] animate-pulse" />
            {isHindi ? "RVSF प्राधिकरण" : "RVSF AUTHORISATION"}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            {isHindi ? (
              <>
                RVSF प्राधिकरण क्यों महत्वपूर्ण है — <span className="text-[#E31E24]">भारत की सबसे बड़ी क्षमता वाली RVSF</span>
              </>
            ) : (
              <>
                Why RVSF Authorisation Matters — <span className="text-[#E31E24]">India's Largest Capacity RVSF Explained</span>
              </>
            )}
          </h2>

          {/* Subtitle */}
          <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
            {isHindi
              ? "एक RVSF (पंजीकृत वाहन स्क्रैपिंग सुविधा) एक अधिकृत सुविधा है जहाँ एंड-ऑफ-लाइफ वाहनों को एक दस्तावेज स्क्रैपिंग और रीसाइक्लिंग प्रक्रिया के माध्यम से संसाधित किया जाता है। एक अधिकृत वाहन स्क्रैपिंग सुविधा को चुनने से आपको वाहन सौंपने से लेकर डी-रजिस्ट्रेशन तक एक स्पष्ट, अधिक संरचित मार्ग मिलता है।"
              : "An RVSF (Registered Vehicle Scrapping Facility) is an authorised facility where end-of-life vehicles are processed through a documented scrapping and recycling process. Choosing an authorised vehicle scrapping facility gives you a clearer, more structured route from vehicle handover to deregistration."}
          </p>
        </motion.div>

        {/* 2 Comparison Cards Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Card: Authorised RVSF Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -4 }}
            className="bg-white border-2 border-emerald-100 hover:border-emerald-500 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Header Pill & Title */}
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  {isHindi ? "सरकार द्वारा अधिकृत" : "Government Authorised"}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-6 tracking-tight group-hover:text-emerald-700 transition-colors">
                {isHindi ? "अधिकृत RVSF आपको क्या देता है" : "What an Authorised RVSF Gives You"}
              </h3>

              {/* Benefits Checklist */}
              <ul className="space-y-4">
                {authorizedBenefits.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-slate-700 text-xs sm:text-sm font-semibold leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right Card: Unauthorised Scrapper Risks */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -4 }}
            className="bg-white border-2 border-red-100 hover:border-[#E31E24] rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Header Pill & Title */}
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#E31E24] text-xs font-bold uppercase tracking-wider border border-red-200">
                  <AlertTriangle size={14} className="text-[#E31E24]" />
                  {isHindi ? "अनधिकृत डीलर के जोखिम" : "Unauthorised Dealer Risks"}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-6 tracking-tight group-hover:text-[#E31E24] transition-colors">
                {isHindi ? "अनधिकृत डीलर के साथ आपको क्या जोखिम है" : "What You Risk with an Unauthorised Dealer"}
              </h3>

              {/* Risks Cross List */}
              <ul className="space-y-4">
                {unauthorizedRisks.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 text-[#E31E24] flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
                      <X size={14} strokeWidth={3} />
                    </div>
                    <span className="text-slate-700 text-xs sm:text-sm font-semibold leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Certificate of Deposit (COD) Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 md:mt-10 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden text-left"
        >
          {/* Subtle Ambient Red Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E31E24]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E31E24]" />
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                {isHindi ? "जमा प्रमाणपत्र" : "CERTIFICATE OF DEPOSIT"}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-3">
              {isHindi ? "जमा प्रमाणपत्र (COD) क्या है?" : "What Is a Certificate of Deposit (COD)?"}
            </h3>

            <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed mb-3">
              {isHindi
                ? "एक जमा प्रमाणपत्र (COD) तब जारी किया जाता है जब स्क्रैपिंग के लिए किसी अधिकृत RVSF में वाहन जमा किया जाता है। यह स्क्रैपिंग प्रक्रिया में एक महत्वपूर्ण रिकॉर्ड है और स्थायी डी-रजिस्ट्रेशन के प्रमाण के रूप में कार्य करता है।"
                : "A Certificate of Deposit (COD) is issued when a vehicle is deposited at an authorised RVSF for scrapping. It is an important record in the scrapping process and serves as proof of permanent deregistration."}
            </p>

            <p className="text-slate-400 text-xs sm:text-sm font-normal leading-relaxed">
              {isHindi
                ? "कार स्क्रैपिंग प्रमाणपत्र की तलाश कर रहे मालिकों के लिए, जारी किए गए सटीक दस्तावेज़ की पुष्टि वाहन और लागू स्क्रैपिंग प्रक्रिया के आधार पर की जानी चाहिए।"
                : "For owners looking for a car scrapping certificate, the exact document issued should be confirmed based on the vehicle and the applicable scrapping process."}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
