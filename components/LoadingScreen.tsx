"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Exactly matches the 1.8-second duration of the site opening effect
    const timer = setTimeout(() => {
      setVisible(false)
      if (onComplete) onComplete()
    }, 1800)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 bg-white flex items-center justify-center z-[100]"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="text-center"
          >
            <motion.img
              src="/logo.png"
              alt="Logo"
              className="h-32 md:h-56 mx-auto mb-6"
              initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "backOut" }}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-2xl md:text-4xl font-bold tracking-tight font-sans"
            >
              <span className="text-[#E31E24]">Scrap</span>
              <span className="text-black">Centre.com</span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
