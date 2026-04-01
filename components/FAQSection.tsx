"use client"

import { motion } from "framer-motion"
import { ArrowRight, Recycle, ShoppingCart, Banknote, Repeat } from "lucide-react"
import Link from "next/link"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQSection({ variant = "red" }: { variant?: "red" | "green" }) {
    const isRed = variant === "red";

    // Define color classes based on variant
    const textPrimary = isRed ? "text-red-600" : "text-emerald-500";
    const textHover = isRed ? "hover:text-red-600" : "hover:text-emerald-500";
    const textHoverDark = isRed ? "hover:text-red-700" : "hover:text-emerald-600";
    const bgPrimary = isRed ? "bg-red-600" : "bg-emerald-600";
    const bgHover = isRed ? "hover:bg-red-700" : "hover:bg-emerald-700";
    const borderPrimary = isRed ? "border-red-100" : "border-emerald-500/20";
    const shadowPrimary = isRed ? "shadow-red-600/30" : "shadow-emerald-600/30";
    const shadowHover = isRed ? "hover:shadow-red-600/40" : "hover:shadow-emerald-600/40";
    const bgBadge = isRed ? "bg-green-100" : "bg-yellow-400/20";
    const textBadge = isRed ? "text-green-600" : "text-yellow-400";

    // Background blobs colors
    const blob1 = isRed ? "bg-red-100/40" : "bg-emerald-500/10";
    const blob2 = isRed ? "bg-red-50/40" : "bg-yellow-500/10";
    const sectionBg = isRed ? "bg-[#FFFDF5]" : "bg-[#0E192D]";
    const headingText = isRed ? "text-gray-900" : "text-white";
    const subText = isRed ? "text-gray-600" : "text-gray-400";
    const accordionText = isRed ? "text-gray-800" : "text-gray-200";
    const accordionContentText = isRed ? "text-gray-600" : "text-gray-400";

    const faqs = [
        {
            id: "item-1",
            question: "Process of scrapping my vehicle?",
            answer: "Get the best scrap value for your old car with instant payment and free pickup. We ensure eco-friendly recycling and provide an official Certificate of Deposit.",
            link: "/guide#scrapping"
        },
        {
            id: "item-2",
            question: "Process of buying a used vehicle?",
            answer: "Choose from our wide range of quality verified refurbished cars. Enjoy transparent pricing, warranty benefits, and hassle-free documentation transfer.",
            link: "/guide#buying"
        },
        {
            id: "item-3",
            question: "Process of selling my vehicle?",
            answer: "Sell your car in minutes at the best market price. We offer free home inspection, instant bank transfer, and handle all the paperwork for you.",
            link: "/guide#selling"
        },
        {
            id: "item-4",
            question: "Process of exchanging my vehicle?",
            answer: "Upgrade to a better car by exchanging your old one. Get a great exchange bonus and pay only the difference amount for your new ride.",
            link: "/guide#exchange"
        },
    ]

    return (
        <section className={`py-24 relative overflow-hidden ${sectionBg}`}>
            {/* Background Decorative Elements */}
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${blob1} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none`}></div>
            <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] ${blob2} rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none`}></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left Column: Content & Accordion */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, amount: 0.2 }}
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 } }
                            }}
                            className="mb-10"
                        >
                            <motion.span
                                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                transition={{ duration: 0.5 }}
                                className={`${textPrimary} font-bold uppercase tracking-wider text-sm mb-2 block`}
                            >
                                Support
                            </motion.span>
                            <motion.h2
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                transition={{ duration: 0.6 }}
                                className={`text-3xl md:text-5xl font-black ${headingText} mb-6 tracking-tight leading-tight`}
                            >
                                Everything You Need to <span className={isRed ? textPrimary : "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-emerald-400"}>Know</span>
                            </motion.h2>
                            <motion.p
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                transition={{ duration: 0.6 }}
                                className={`text-lg ${subText}`}
                            >
                                Common questions about our services and processes.
                            </motion.p>
                        </motion.div>

                        <Accordion type="single" collapsible className="w-full mb-10">
                            {faqs.map((faq, index) => (
                                <motion.div
                                    key={faq.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.2 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                >
                                    <AccordionItem value={faq.id} className={borderPrimary}>
                                        <AccordionTrigger className={`text-lg font-bold ${accordionText} ${textHover} hover:no-underline py-5 text-left`}>
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className={`${accordionContentText} leading-relaxed text-base pb-6`}>
                                            {faq.answer}
                                            <div className="mt-4">
                                                <Link
                                                    href={faq.link}
                                                    className={`inline-flex items-center gap-2 text-sm font-bold ${textPrimary} ${textHoverDark} hover:underline`}
                                                >
                                                    Explore detailed steps
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </motion.div>
                            ))}
                        </Accordion>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.2 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <Link
                                href="/guide"
                                className={`inline-flex items-center gap-3 px-8 py-4 ${bgPrimary} text-white rounded-full font-bold shadow-lg ${shadowPrimary} ${bgHover} ${shadowHover} hover:-translate-y-1 transition-all duration-300`}
                            >
                                <span>Check All Steps</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Right Column: Image */}
                    <motion.div
                        initial={{ rotateY: 90, opacity: 0 }}
                        whileInView={{ rotateY: 0, opacity: 1 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 0.9, ease: [0.2, 0.65, 0.3, 0.9] as any }}
                        className="relative perspective-1000"
                        style={{ perspective: "1200px" }}
                    >
                        <div className={`relative rounded-3xl overflow-hidden shadow-2xl shadow-gray-900/20 border-4 border-white`}>
                            <img
                                src="/frontpage/faq.png"
                                alt="FAQ Illustration"
                                className="w-full h-auto object-cover"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent mix-blend-overlay pointer-events-none"></div>
                        </div>

                        {/* Floating Decorative Badge */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 hidden md:block"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${bgBadge} rounded-full flex items-center justify-center ${textBadge}`}>
                                    <span className="font-bold text-lg">24</span>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Support</div>
                                    <div className="font-bold text-gray-900">24/7 Assistance</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                </div>

            </div>
        </section>
    )
}

