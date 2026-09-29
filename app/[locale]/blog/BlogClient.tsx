"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"
import { BLOG_POSTS } from "@/lib/blogData"
import { ArrowLeft, Calendar, ChevronRight } from "lucide-react"

export default function BlogClient() {
  const params = useParams()
  const locale = (params?.locale as string) || "en"
  const isHindi = locale === "hi"

  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const loaderTimeout = setTimeout(() => setShowLoader(false), 1200)
    return () => clearTimeout(loaderTimeout)
  }, [])

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-900">
      {/* Brand Loading Screen Animation */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" as const }}
            className="fixed inset-0 bg-[#FFFFFF] flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "backOut" as const }}
              className="text-center"
            >
              <motion.img
                src="/logo.png"
                alt="ScrapCentre Logo"
                className="h-32 md:h-56 mx-auto mb-6"
                initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "backOut" as const }}
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-2xl md:text-4xl font-bold tracking-tight"
              >
                <span className="text-[#E31E24]">Scrap</span>
                <span className="text-black">Centre.com</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showLoader && (
        <div className="py-10 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl">
            
            {/* Navigation / Back Link */}
            <div className="mb-6">
              <Link
                href={isHindi ? "/hi" : "/"}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#E31E24] transition-colors"
              >
                <ArrowLeft size={16} />
                <span>{isHindi ? "मुख्य पृष्ठ पर वापस जाएं" : "Back to Home"}</span>
              </Link>
            </div>

            {/* Section Header */}
            <div className="mb-8 sm:mb-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#4EA759] tracking-tight">
                {isHindi ? "सभी ब्लॉग (All Blogs)" : "All Blogs"}
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-2 font-medium">
                {isHindi
                  ? "वाहन स्क्रैपिंग, आरवीएसएफ नीतियों और जमा प्रमाणपत्र (COD) लाभों पर नवीनतम जानकारी।"
                  : "Latest guides, policies, and Certificate of Deposit (CoD) benefits for vehicle scrapping in India."}
              </p>
            </div>

            {/* Blog Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {BLOG_POSTS.map((post) => {
                const blogUrl = `/${locale}/blog/${post.slug}`
                return (
                  <Link
                    key={post.id}
                    href={blogUrl}
                    className="block"
                  >
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-stretch cursor-pointer group h-full"
                    >
                      {/* Left Side: Cover Image */}
                      <div className="relative w-full sm:w-44 h-48 sm:h-auto shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Right Side: Title, Excerpt & Read More Button */}
                      <div className="flex flex-col justify-between flex-1">
                        <div>
                          {/* Meta info */}
                          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {post.date}
                            </span>
                          </div>

                          {/* Title */}
                          <h2 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2 leading-snug mb-2 group-hover:text-[#4EA759] transition-colors">
                            {post.title}
                          </h2>

                          {/* Excerpt */}
                          <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed font-normal mb-4">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Read More Button */}
                        <div>
                          <span className="inline-flex items-center gap-2 bg-[#4EA759] hover:bg-[#418d4a] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200">
                            <span>{isHindi ? "और पढ़ें (Read More)" : "Read More"}</span>
                            <ChevronRight size={16} />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
