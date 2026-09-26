"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function VehicleScrappingServicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Vehicle Scrapping Services Page Error:", error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl text-center"
      >
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#E31E24]">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Something went wrong
        </h2>

        <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
          We encountered an issue loading the Vehicle Scrapping Services page. Please try refreshing or return to the home page.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 bg-[#E31E24] hover:bg-[#c8191e] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-xl text-sm transition-all hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
