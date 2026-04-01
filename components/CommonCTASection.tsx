"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import Link from "next/link"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export default function CommonCTASection() {
  const [isClient, setIsClient] = useState(false)
  const [ctaParticles, setCtaParticles] = useState<Particle[]>([])

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined") {
      const generateParticles = () => {
        const particles: Particle[] = []
        for (let i = 0; i < 30; i++) {
          particles.push({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 5 + 5,
            delay: Math.random() * 2,
          })
        }
        setCtaParticles(particles)
      }
      generateParticles()
    }
  }, [])

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-br from-blue-900 to-purple-900 overflow-hidden">
      {/* Background Glows with subtle animation */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full mix-blend-overlay blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 10, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut" as const,
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full mix-blend-overlay blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -15, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut" as const,
          delay: 1,
        }}
      />

      {/* Background Particles */}
      {isClient &&
        ctaParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white/10"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              x: [0, Math.random() * 20 - 10],
              y: [0, Math.random() * 20 - 10],
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              delay: p.delay,
              ease: "easeInOut" as const,
            }}
          />
        ))}

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          Let's Start a New Project Together
        </motion.h2>
        <motion.p
          className="text-gray-200 text-base md:text-lg mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          Ready to transform your content marketing strategy? Our team is here to help you achieve your goals.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <Link href="/contact" passHref>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black px-8 py-3 rounded-xl font-semibold shadow-lg shadow-green-500/25 relative overflow-hidden group text-sm md:text-base">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 opacity-0 group-hover:opacity-30 transition-opacity duration-200"></div>
              <span className="relative z-10 flex items-center justify-center">
                Call Us Now
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" as const }}
                >
                  →
                </motion.span>
              </span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

