"use client"

import { motion } from "framer-motion"
import { ArrowRight, Recycle, ShoppingCart, Banknote, Repeat, Sparkles } from "lucide-react"
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
    const bgSecondary = isRed ? "bg-red-50" : "bg-emerald-950/30";

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
            question: "1. Is vehicle scrapping mandatory in India?",
            answer: "Vehicle scrapping is not mandatory for every vehicle in India. However, vehicles that are no longer eligible for continued use under applicable rules may need to be scrapped or deregistered. The vehicle scrappage policy India framework covers requirements related to vehicle age, fitness and registration."
        },
        {
            id: "item-2",
            question: "2. How much can I get for scrapping my vehicle?",
            answer: "The amount depends on the vehicle type, weight, condition and applicable scrap rates. Your vehicle scrap price may also vary based on eligible benefits and current valuation factors. A vehicle-specific valuation can give you a more accurate estimate before you proceed with scrapping."
        },
        {
            id: "item-3",
            question: "3. What documents do I need to scrap my car or bike?",
            answer: "You generally need the vehicle's Registration Certificate (RC) and the registered owner's ID proof. PUC and insurance copies may also be required if available. A financier NOC may be needed for a hypothecated vehicle. Check the required vehicle scrapping documents before pickup."
        },
        {
            id: "item-4",
            question: "4. Do you scrap two-wheelers, buses and trucks too?",
            answer: "Yes, ScrapCentre accepts eligible two-wheelers, buses, trucks, auto-rickshaws, commercial vehicles, EVs and other vehicle types. Requirements can vary by category under the vehicle scrapping policy India framework. The vehicle's eligibility can be checked before starting the authorised scrapping process."
        },
        {
            id: "item-5",
            question: "5. Is the pickup really free?",
            answer: "Yes, free car pickup for scrapping is available from eligible service locations, subject to applicable terms and service availability. This allows owners to arrange vehicle collection instead of taking an end of life vehicle to the facility themselves. Pickup support may also be available for non-running vehicles."
        },
        {
            id: "item-6",
            question: "6. What is a Certificate of Deposit (COD)?",
            answer: "A Certificate of Deposit (COD) is issued when a vehicle is deposited with an authorised RVSF for scrapping. It confirms that the vehicle has entered the authorised scrapping process and supports its permanent deregistration. It is an important document when completing end of life vehicle recycling through an authorised facility."
        },
        {
            id: "item-7",
            question: "7. Can I scrap a vehicle without RC or insurance?",
            answer: "A vehicle may still be eligible for scrapping if the RC or insurance document is unavailable, but the required verification and supporting documents should be confirmed first. Missing documents may affect the process. For doorstep car scrapping, share your available vehicle and ownership details to check the requirements."
        },
        {
            id: "item-8",
            question: "8. How long does the whole process take?",
            answer: "The timeline depends on document verification, vehicle pickup, inspection and processing at the authorised facility. ELV recycling and deregistration follow the applicable process after the vehicle is received and verified. ScrapCentre can provide an estimated timeline after reviewing your vehicle details, location and documents."
        },
    ]

    return (
        <section className={`py-24 relative overflow-hidden ${sectionBg}`}>
            {/* Background Decorative Elements */}
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${blob1} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none`}></div>
            <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] ${blob2} rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none`}></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column: FAQs */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="mb-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, amount: 0.2 }}
                                transition={{ duration: 0.5 }}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border ${bgSecondary} ${borderPrimary}`}
                            >
                                <Sparkles size={14} className={textPrimary} />
                                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${textPrimary}`}>Got Questions?</span>
                            </motion.div>
                            <h2 className={`text-4xl md:text-5xl font-black ${headingText} mb-6 uppercase tracking-tight`}>
                                Frequently Asked <span className={textPrimary}>Questions</span>
                            </h2>
                            <p className="text-gray-500 text-lg max-w-xl">
                                Everything you need to know about our vehicle scrapping, buying, and selling processes.
                            </p>
                        </div>

                        <Accordion type="single" collapsible className="w-full space-y-4 mb-10">
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
                                        </AccordionContent>
                                    </AccordionItem>
                                </motion.div>
                            ))}
                        </Accordion>
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

