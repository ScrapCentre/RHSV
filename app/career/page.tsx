"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Code, Search, Palette, Sparkles, ArrowRight, Users } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"

gsap.registerPlugin(ScrollTrigger)

export default function CareerPage() {
  const jobOpenings = [
    {
      id: 1,
      category: "IT",
      title: "PHP Developer",
      experience: "2 - 3 Years",
      location: "Kanpur, Uttar Pradesh",
      skills: ["Development", "Backend", "Database", "API", "Web Development"],
      type: "Full Time",
      gradient: "from-blue-500 to-purple-600",
      bgGradient: "from-blue-500/10 to-purple-600/10",
    },
    {
      id: 2,
      category: "IT",
      title: "SEO Specialist",
      experience: "1 - 2 Years",
      location: "Kanpur, Uttar Pradesh",
      skills: ["SEO", "Google Analytics", "Content Marketing", "Link Building", "Digital Strategy"],
      type: "Full Time",
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-500/10 to-emerald-600/10",
    },
    {
      id: 3,
      category: "IT",
      title: "Graphic Designer",
      experience: "4 - 5 Years",
      location: "Kanpur, Uttar Pradesh",
      skills: ["Design", "Creative", "Visual", "Branding", "Print Design"],
      type: "Full Time",
      gradient: "from-pink-500 to-rose-600",
      bgGradient: "from-pink-500/10 to-rose-600/10",
    },
    {
      id: 4,
      category: "IT",
      title: "React Developer",
      experience: "2 - 3 Years",
      location: "Kanpur, Uttar Pradesh",
      skills: ["Frontend", "Web Apps", "UI Development", "Modern Web", "JavaScript"],
      type: "Full Time",
      gradient: "from-cyan-500 to-blue-600",
      bgGradient: "from-cyan-500/10 to-blue-600/10",
    },
    {
      id: 5,
      category: "IT",
      title: "Digital Marketing",
      experience: "1 - 2 Years",
      location: "Kanpur, Uttar Pradesh",
      skills: ["Social Media", "PPC", "Email Marketing", "Analytics", "Campaign Management"],
      type: "Full Time",
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-500/10 to-red-600/10",
    },
    {
      id: 6,
      category: "IT",
      title: "UI/UX Designer",
      experience: "3 - 4 Years",
      location: "Kanpur, Uttar Pradesh",
      skills: ["User Experience", "Interface Design", "Prototyping", "User Research", "Wireframing"],
      type: "Full Time",
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-500/10 to-purple-600/10",
    },
  ]

  const getJobIcon = (title: string) => {
    if (title.includes("Developer")) return Code
    if (title.includes("SEO") || title.includes("Marketing")) return Search
    if (title.includes("Designer")) return Palette
    return Code
  }

  useEffect(() => {
    // Hero section animations
    gsap.fromTo(".hero-title", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" })

    gsap.fromTo(
      ".hero-description",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: "power2.out" },
    )

    gsap.fromTo(
      ".hero-button",
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, delay: 0.7, ease: "back.out(1.7)" },
    )

    // Career image floating animation
    gsap.to(".career-image", {
      y: -15,
      duration: 3,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
    })

    // Section title animation
    gsap.fromTo(
      ".section-title",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".section-title",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      },
    )

    // Floating elements animation
    gsap.to(".floating-element", {
      y: "random(-20, 20)",
      x: "random(-10, 10)",
      rotation: "random(-15, 15)",
      duration: "random(2, 4)",
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.2,
    })
  }, [])

  const scrollToJobs = () => {
    const jobsSection = document.getElementById("current-openings")
    if (jobsSection) {
      jobsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const createApplicationUrl = (job: (typeof jobOpenings)[0]) => {
    const params = new URLSearchParams({
      job: job.title,
      experience: job.experience,
      location: job.location.split(",")[0],
      type: job.type,
    })
    return `/career/apply?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="floating-element absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="floating-element absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="floating-element absolute bottom-32 left-40 w-20 h-20 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-full blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -180, -360],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 2 }}
        />
      </div>



      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-full blur-3xl animate-pulse"></div>

          {/* Floating particles */}
          <motion.div
            className="absolute top-32 right-20 w-2 h-2 bg-green-400/40 rounded-full"
            animate={{ y: [-20, 20, -20], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            className="absolute bottom-32 left-16 w-1.5 h-1.5 bg-emerald-400/50 rounded-full"
            animate={{ y: [20, -20, 20], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content Side */}
            <div>
              <motion.h1
                className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                Career and Culture at{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  ScrapCenter India
                </span>
              </motion.h1>

              <motion.p
                className="hero-description text-gray-300 text-lg leading-relaxed mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                A great corporate culture is essential for establishing the qualities required for commercial success.
                We are a cultural-rich organization that appreciates new talents, values, practices and in spite of such
                differences we work as a team. Our great culture exemplifies positive traits that lead to improved
                performance. Our team members consistently acknowledge, appreciate, and applaud others for their
                contributions.
              </motion.p>

              <motion.div
                className="hero-button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Button
                  onClick={scrollToJobs}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black px-8 py-3 rounded-lg font-semibold shadow-lg shadow-green-500/25 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-2">
                    View Openings
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
              </motion.div>
            </div>

            {/* Image Side */}
            <div className="relative">
              <motion.div
                className="career-image relative"
                animate={{ y: [-15, 15, -15] }}
                transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <img
                  src="https://riveyrainfotech.com/images/services/thumbs-up.png"
                  alt="Career at Riveyra Infotech"
                  className="w-90 h-100 rounded-2xl shadow-2xl shadow-green-500/20"
                />

                {/* Floating decorative elements */}
                <motion.div
                  className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-20"
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
                />
                <motion.div
                  className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full opacity-30"
                  animate={{ scale: [1.2, 0.8, 1.2], rotate: [360, 180, 0] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                />
                <motion.div
                  className="absolute top-10 -left-6"
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Sparkles className="w-6 h-6 text-green-400/40" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Openings Section */}
      <section id="current-openings" className="py-20 relative">
        <div className="container mx-auto px-6">
          {/* Section Title */}
          <motion.div
            className="section-title text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4">
              CURRENT OPENINGS
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full mb-4"></div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Join our dynamic team and be part of innovative projects that shape the future of technology
            </p>
          </motion.div>

          {/* Jobs Grid */}
          <div className="jobs-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobOpenings.map((job, index) => {
              const JobIcon = getJobIcon(job.title)
              return (
                <motion.div
                  key={job.id}
                  className="job-card relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true }}
                >
                  {/* Card Background with Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${job.bgGradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-110`}
                  ></div>

                  {/* Main Card */}
                  <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 group-hover:border-transparent transition-all duration-500 overflow-hidden h-full flex flex-col">
                    {/* Animated Border */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${job.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
                    >
                      <div className="absolute inset-[2px] bg-gradient-to-br from-gray-900/90 to-black/90 rounded-2xl"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 bg-gradient-to-r ${job.gradient} rounded-xl flex items-center justify-center transition-all duration-300`}
                          >
                            <JobIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <span
                              className={`bg-gradient-to-r ${job.gradient} text-white px-3 py-1 rounded-full text-xs font-semibold`}
                            >
                              {job.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Job Title */}
                      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                        {job.title}
                      </h3>

                      {/* Job Details Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                          <Clock className="w-4 h-4 mr-2 text-blue-400" />
                          <span className="text-sm">{job.experience}</span>
                        </div>
                        <div className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                          <MapPin className="w-4 h-4 mr-2 text-green-400" />
                          <span className="text-sm">{job.location.split(",")[0]}</span>
                        </div>
                        <div className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                          <Users className="w-4 h-4 mr-2 text-purple-400" />
                          <span className="text-sm">{job.type}</span>
                        </div>
                      </div>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-2 mb-6 flex-grow min-h-[60px]">
                        {job.skills.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="bg-gray-800/60 text-gray-300 px-3 py-1.5 rounded-full text-xs border border-gray-700/60 group-hover:border-gray-600/60 group-hover:bg-gray-700/60 transition-all duration-300 whitespace-nowrap"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Apply Button */}
                      <div className="mt-auto">
                        <Link href={createApplicationUrl(job)}>
                          <Button
                            className={`w-full bg-gradient-to-r ${job.gradient} hover:shadow-lg hover:shadow-current/25 text-white font-semibold py-3 rounded-xl relative overflow-hidden group/btn transition-all duration-300`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative flex items-center justify-center gap-2">
                              Apply Now
                              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                            </span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Call to Action */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400 text-lg mb-6">
              Don't see a position that fits? We're always looking for talented individuals.
            </p>
            <Link href="/career/apply?job=General Application">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/25 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                  Send Your Resume
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>


    </div>
  )
}

