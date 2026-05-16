"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, Phone, Headphones, ShieldCheck, FileText, Users, Star, ChevronRight, Quote, CheckCircle2 } from "lucide-react"
import Image from "next/image"

export default function ReviewSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [activeIndex, setActiveIndex] = useState(0)

  const faqs = [
    {
      question: "How does the vehicle scrapping process work?",
      answer: "It's simple! Get a quote, schedule a free pickup, we collect your vehicle, complete the paperwork, and make instant payment."
    },
    {
      question: "How do I get a quote for my vehicle?",
      answer: "You can get an instant quote by entering your vehicle registration number on our homepage or by calling our support team."
    },
    {
      question: "Do you offer free vehicle pickup?",
      answer: "Yes, we provide free doorstep pickup for all vehicles being scrapped through our authorized centers."
    },
    {
      question: "What documents are required for scrapping my vehicle?",
      answer: "Typically, you'll need the RC (Registration Certificate), ID proof, and bank details. We handle all RTO documentation for you."
    },
    {
      question: "How will I receive my payment?",
      answer: "Payments are made instantly via Bank Transfer or UPI once the vehicle is collected and documents are verified."
    },
    {
      question: "Can I sell a vehicle without RC or insurance?",
      answer: "We require basic documentation to verify ownership. Please contact our support team to discuss specific cases."
    }
  ]

  const reviews = [
    {
      id: 1,
      name: "Amit Patel",
      content: "The process was quick, transparent and I got the best value for my old car. Highly recommended!",
      rating: 5,
      car: "Hyundai i10",
      image: "/frontpage/pic2.jpg"
    },
    {
      id: 2,
      name: "Neha Sharma",
      content: "Very professional team and hassle-free documentation. Payment was done instantly. Great experience!",
      rating: 5,
      car: "Maruti Swift",
      image: "/frontpage/pic3.png"
    },
    {
      id: 3,
      name: "Rohit Verma",
      content: "I compared many platforms but got the best price here. Super smooth and trustworthy service.",
      rating: 5,
      car: "Honda City",
      image: "/frontpage/pic1.jpg"
    },
    {
      id: 4,
      name: "Sandeep Singh",
      content: "Excellent service. The team was very helpful and the whole process was completed within hours.",
      rating: 5,
      car: "Toyota Innova",
      image: "/frontpage/pic1.jpg"
    }
  ]

  const features = [
    { icon: Headphones, title: "24/7 Support", desc: "We're here to help you anytime." },
    { icon: ShieldCheck, title: "Secure & Safe", desc: "Your data and privacy are safe with us." },
    { icon: FileText, title: "Transparent Process", desc: "Clear and simple process at every step." },
    { icon: Users, title: "Expert Team", desc: "Experienced professionals at your service." }
  ]

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
    <section className="pt-20 pb-10 bg-white overflow-hidden relative">
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
                Testimonials
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                What Our <span className="text-[#E31E24]">Customers</span> Say
              </h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Trusted by thousands of vehicle owners across India.<br />
                Reliability and transparency are our core values.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
               {/* Star Rating Card */}
               <div className="bg-white border border-slate-100 p-4 px-8 rounded-2xl shadow-xl shadow-slate-200/40 flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full border-2 border-[#E31E24] flex items-center justify-center text-[#E31E24]">
                    <Star size={24} fill="currentColor" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900 leading-none mb-1">4.9/5</div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">From 15K+ Reviews</div>
                  </div>
               </div>

               {/* Google Rating */}
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center p-2 border border-slate-100">
                    <svg viewBox="0 0 24 24" className="w-full h-full"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Google Rating</div>
                    <div className="flex gap-0.5 items-center">
                      {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-[#E31E24] text-[#E31E24]" />)}
                      <span className="ml-2 text-[10px] font-bold text-slate-500">4.9/5 (15,000+ reviews)</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="relative">
            {/* Navigation Arrows - Side Aligned */}
            <button 
              onClick={prevReview} 
              className="absolute left-0 top-1/2 -translate-x-4 md:-translate-x-12 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-slate-100 shadow-xl flex items-center justify-center text-slate-400 hover:text-[#E31E24] hover:border-[#E31E24] transition-all z-20"
            >
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <button 
              onClick={nextReview} 
              className="absolute right-0 top-1/2 translate-x-4 md:translate-x-12 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-slate-100 shadow-xl flex items-center justify-center text-slate-400 hover:text-[#E31E24] hover:border-[#E31E24] transition-all z-20"
            >
              <ChevronRight size={24} />
            </button>

            <div className="py-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                {[0, 1, 2].map((idx) => {
                  const reviewIdx = (activeIndex + idx) % reviews.length
                  const review = reviews[reviewIdx]
                  const isCenter = idx === 1

                  return (
                    <motion.div
                      key={idx} // Use a stable key for the position to prevent re-mounting/blinking
                      layout
                      animate={{ 
                        opacity: isCenter ? 1 : 0.4, 
                        scale: isCenter ? 1.05 : 0.9,
                      }}
                      transition={{ 
                        duration: 0.6, 
                        ease: "easeInOut" 
                      }}
                      className={`bg-white p-8 md:p-10 rounded-[2.5rem] border-2 flex flex-col h-full relative group transition-all duration-500
                        ${idx > 0 ? 'hidden md:flex' : 'flex'}
                        ${isCenter ? 'md:shadow-[0_20px_50px_rgba(227,30,36,0.12)] md:border-[#E31E24]/10 md:z-10' : 'md:shadow-sm md:border-slate-100 md:z-0'}
                        ${idx === 0 ? 'shadow-[0_20px_50px_rgba(227,30,36,0.12)] border-[#E31E24]/10 md:shadow-none md:border-slate-100' : ''}`}
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
                            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Sold <span className="text-[#E31E24]">{review.car.split(' ').slice(0, 2).join(' ')}</span></p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1 text-[#E31E24] bg-red-50 px-2 py-1 rounded-full">
                             <CheckCircle2 size={10} fill="currentColor" className="text-white" />
                             <span className="text-[7px] font-black uppercase tracking-widest">Verified Customer</span>
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
                Support <span className="inline-block w-6 h-[1px] bg-[#E31E24] align-middle ml-2"></span>
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                Everything You <br />
                Need to <span className="text-[#E31E24]">Know</span>
              </h2>
              <p className="text-slate-500 text-base font-medium leading-relaxed max-w-md">
                Find answers to common questions about our services, processes, and policies.
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
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900 leading-tight">{faq.question}</span>
                    </div>
                    <div className={`transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                      <ChevronRight size={16} className="text-slate-400" />
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
                        <div className="px-10 pb-5 text-slate-500 text-xs leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <button className="px-6 py-3 border-2 border-[#E31E24]/20 rounded-xl text-[#E31E24] font-bold uppercase tracking-wider text-[10px] hover:bg-[#E31E24] hover:text-white transition-all flex items-center gap-2 group">
                View All FAQs
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </button>
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

            {/* Features Grid - Now in one line under the image */}
            <div className="grid grid-cols-4 gap-2">
              {features.map((feature, i) => (
                <div key={i} className="bg-white border border-slate-100 p-2 py-7 min-h-[130px] rounded-xl hover:bg-red-50 hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all group flex flex-col items-center text-center justify-center">
                  <div className="w-10 h-10 rounded-lg bg-[#E31E24] flex items-center justify-center text-white mb-3 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                    <feature.icon size={20} />
                  </div>
                  <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-tight leading-none mb-1">{feature.title.split(' ')[0]}</h4>
                  <p className="text-slate-500 text-[9px] font-medium leading-tight">{feature.desc.split(' ').slice(0,3).join(' ')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
