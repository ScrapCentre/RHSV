"use client"

import React from "react"
import { motion } from "framer-motion"
import { FileText, Shield, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-900">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#0E192D] to-slate-50 z-0"></div>
            <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>

            <div className="container mx-auto px-4 py-12 relative z-10 pt-32">
                <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/10"
                        >
                            <FileText className="w-10 h-10 text-emerald-400" />
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Terms & Conditions</h1>
                        <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
                            Please read these terms carefully before using our services. They outline your rights and obligations when using AutoScrap.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-12 space-y-12">

                        {/* Section 1 */}
                        <section>
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0E192D] mb-4">
                                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-sm font-bold">01</span>
                                Introduction
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                Welcome to AutoScrap. references to "we", "us", or "our" are references to AutoScrap. By accessing or using our vehicle scrapping services, valuation tools, or website, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0E192D] mb-4">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-sm font-bold">02</span>
                                Vehicle Valuation & Scrapping
                            </h2>
                            <div className="space-y-4 text-slate-600 leading-relaxed">
                                <p>
                                    The estimated scrap value provided by our online tool is indicative. The final valuation is subject to physical inspection of the vehicle.
                                </p>
                                <ul className="list-disc pl-5 space-y-2 marker:text-emerald-500">
                                    <li>You must be the legal owner of the vehicle or authorized by the owner.</li>
                                    <li>The vehicle must be free from any major encumbrances or police cases unless disclosed.</li>
                                    <li>You agree to provide accurate information regarding the vehicle's condition.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0E192D] mb-4">
                                <span className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 text-sm font-bold">03</span>
                                Documentation & Compliance
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                For the purpose of eKYC and vehicle deregistraion, you consent to sharing your Aadhaar, RC, and other relevant documents. We are a government-authorized RVSF and ensure strict compliance with the Vehicle Scrappage Policy.
                            </p>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0E192D] mb-4">
                                <span className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 text-sm font-bold">04</span>
                                Limitation of Liability
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                In no event shall AutoScrap, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                            </p>
                        </section>

                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
                            <Shield className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-[#0E192D] mb-1">Privacy Policy</h4>
                                <p className="text-sm text-slate-500">
                                    Your privacy is important to us. Please review our <Link href="/privacy" className="text-emerald-600 font-semibold hover:underline">Privacy Policy</Link> to understand how we collect and use your information.
                                </p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 text-center text-slate-400 text-sm">
                            Last updated: February 2026
                        </div>

                    </div>
                </motion.div>
            </div>
        </div>
    )
}

