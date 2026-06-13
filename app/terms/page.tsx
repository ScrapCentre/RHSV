"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
    FileText, Shield, AlertCircle, ArrowLeft, BookOpen, UserCheck, 
    Briefcase, CheckCircle2, Ban, CreditCard, Scroll, Lock, AlertTriangle, Scale 
} from "lucide-react"
import Link from "next/link"

const SECTIONS = [
    { id: "acceptance", num: "01", title: "Acceptance of Terms", icon: FileText, color: "indigo" },
    { id: "definitions", num: "02", title: "Definitions", icon: BookOpen, color: "emerald" },
    { id: "registration", num: "03", title: "User Registration", icon: UserCheck, color: "orange" },
    { id: "services", num: "04", title: "Company Services", icon: Briefcase, color: "rose" },
    { id: "obligations", num: "05", title: "User Obligations", icon: CheckCircle2, color: "blue" },
    { id: "use-disclaimers", num: "06", title: "Website Use & Disclaimers", icon: AlertCircle, color: "amber" },
    { id: "privacy", num: "07", title: "Data Privacy & Security", icon: Shield, color: "teal" },
    { id: "suspension-termination", num: "08", title: "Account Suspension / Termination", icon: Ban, color: "violet" },
    { id: "payments-refunds", num: "09", title: "Payments & Refunds", icon: CreditCard, color: "cyan" },
    { id: "provision-disclaimers", num: "10", title: "Provision of Services", icon: Scroll, color: "fuchsia" },
    { id: "intellectual-property", num: "11", title: "Intellectual Property", icon: Lock, color: "pink" },
    { id: "limitation-liability", num: "12", title: "Limitation of Liability", icon: AlertTriangle, color: "purple" },
    { id: "indemnification", num: "13", title: "Indemnification", icon: Shield, color: "sky" },
    { id: "dispute-resolution", num: "14", title: "Dispute Resolution", icon: Scale, color: "emerald" },
    { id: "governing-law", num: "15", title: "Governing Law", icon: Scroll, color: "indigo" },
    { id: "modifications", num: "16", title: "Modifications", icon: FileText, color: "rose" }
]

export default function TermsPage() {
    const [activeSection, setActiveSection] = useState("acceptance")

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: "-20% 0px -60% 0px",
            threshold: 0
        }

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id)
                }
            })
        }

        const observer = new IntersectionObserver(observerCallback, observerOptions)
        
        SECTIONS.forEach((sec) => {
            const el = document.getElementById(sec.id)
            if (el) observer.observe(el)
        })

        return () => {
            observer.disconnect()
        }
    }, [])

    const handleScrollTo = (id: string) => {
        const el = document.getElementById(id)
        if (el) {
            const offset = 120 // Space for header
            const bodyRect = document.body.getBoundingClientRect().top
            const elementRect = el.getBoundingClientRect().top
            const elementPosition = elementRect - bodyRect
            const offsetPosition = elementPosition - offset

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            })
            setActiveSection(id)
        }
    }

    // Helper to return badge color classes based on color name
    const getBadgeColors = (color: string) => {
        switch (color) {
            case "indigo": return "bg-indigo-50 text-indigo-600 border-indigo-100"
            case "emerald": return "bg-emerald-50 text-emerald-600 border-emerald-100"
            case "orange": return "bg-orange-50 text-orange-600 border-orange-100"
            case "rose": return "bg-rose-50 text-rose-600 border-rose-100"
            case "blue": return "bg-blue-50 text-blue-600 border-blue-100"
            case "amber": return "bg-amber-50 text-amber-600 border-amber-100"
            case "teal": return "bg-teal-50 text-teal-600 border-teal-100"
            case "violet": return "bg-violet-50 text-violet-600 border-violet-100"
            case "cyan": return "bg-cyan-50 text-cyan-600 border-cyan-100"
            case "fuchsia": return "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100"
            case "pink": return "bg-pink-50 text-pink-600 border-pink-100"
            case "purple": return "bg-purple-50 text-purple-600 border-purple-100"
            case "sky": return "bg-sky-50 text-sky-600 border-sky-100"
            default: return "bg-slate-50 text-slate-600 border-slate-100"
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-[#E31E24]/10 selection:text-[#E31E24]">
            {/* Background Header Decor */}
            <div className="absolute top-0 left-0 w-full h-[520px] bg-gradient-to-b from-[#0E192D] to-slate-50 z-0"></div>
            <div className="absolute top-20 right-20 w-96 h-96 bg-[#E31E24]/5 rounded-full blur-3xl pointer-events-none z-0"></div>

            <div className="container mx-auto px-4 py-12 relative z-10 pt-32 xl:pl-24">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors group text-sm font-semibold">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.1 }}
                            className="w-16 h-16 bg-[#E31E24]/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/10"
                        >
                            <FileText className="w-8 h-8 text-[#E31E24]" />
                        </motion.div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Terms of Use</h1>
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                            Welcome to Scrap Centre. Please review these Terms and Conditions carefully. They govern your access, registrations, and use of our vehicle valuation, recycling, and disposal services.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                        {/* Left Sidebar Table of Contents (Sticky on Large Screens) */}
                        <div className="hidden lg:block lg:col-span-1 sticky top-32 max-h-[calc(100vh-160px)] overflow-y-auto pr-2 scrollbar-thin">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 pl-3">Table of Contents</h3>
                            <div className="space-y-1">
                                {SECTIONS.map((sec) => {
                                    const isActive = activeSection === sec.id
                                    return (
                                        <button
                                            key={sec.id}
                                            onClick={() => handleScrollTo(sec.id)}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-3 ${
                                                isActive
                                                    ? "bg-white text-[#E31E24] shadow-md shadow-slate-200/50"
                                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                            }`}
                                        >
                                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                                                isActive ? "bg-[#E31E24]/10 text-[#E31E24]" : "bg-slate-800 text-slate-500"
                                            }`}>
                                                {sec.num}
                                            </span>
                                            <span className="truncate">{sec.title}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Right Content Column */}
                        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 p-6 sm:p-10 md:p-12 space-y-12">
                            
                            {/* Section 1 */}
                            <section id="acceptance" className="scroll-mt-32 space-y-4">
                                <h2 className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-black text-slate-800 border-b border-slate-100 pb-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${getBadgeColors("indigo")}`}>
                                        01
                                    </span>
                                    Acceptance of Terms
                                </h2>
                                <div className="space-y-3.5 text-slate-600 leading-relaxed text-sm sm:text-base">
                                    <p>
                                        <strong>1.1.</strong> Welcome to Scrap Centre or any associated services provided by Scrap Centre (the &ldquo;Company&rdquo;) through its website <Link href="https://www.scrapcentre.com/" className="text-[#E31E24] font-semibold hover:underline">https://www.scrapcentre.com/</Link> (hereinafter referred to as the &ldquo;Platform&rdquo; or &ldquo;Website&rdquo;). These Terms and Conditions (&ldquo;Terms&rdquo;) set forth the legal agreement between the user of the Platform (&ldquo;You&rdquo;, &ldquo;Your&rdquo;, &ldquo;User&rdquo;, or &ldquo;Client&rdquo;) and the Company (&ldquo;We&rdquo;, &ldquo;Us&rdquo;, or &ldquo;Our&rdquo;) governing Your access to and use of the Platform and the services made available therein, including but not limited to vehicle valuation, vehicle scrapping and recycling requests, end-of-life vehicle (ELV) management, vehicle collection coordination, documentation assistance, regulatory facilitation, customer support, and related services (collectively referred to as &ldquo;Services&rdquo;).
                                    </p>
                                    <p>
                                        <strong>1.2.</strong> By accessing or using the Platform, submitting enquiries, creating an account, requesting Services, or otherwise interacting with the Platform, You agree to comply with these Terms and our associated policies, including the Privacy Policy and any other policies, guidelines, notices, or instructions published on the Platform from time to time.
                                    </p>
                                    <p>
                                        <strong>1.3.</strong> If You do not agree to these Terms or any part thereof, You must immediately discontinue access to and use of the Platform and refrain from availing any Services. Your continued access to or use of the Platform shall constitute Your acceptance of these Terms, including any amendments made thereto.
                                    </p>
                                    <p>
                                        <strong>1.4.</strong> The Company reserves the sole and absolute right, at its discretion, to modify, update, amend, or replace any portion of these Terms or associated Policies at any time without prior notice. Such modifications shall become effective upon publication on the Platform and shall be incorporated herein by reference. It is Your responsibility to review these Terms periodically. By continuing to access or use the Platform following such modifications, You agree to be bound by the revised Terms. Further, by using the Platform or availing the Services, You consent to receive communications from the Company or its authorised representatives regarding Service Requests, account activities, transactions, documentation requirements, regulatory updates, and other service-related matters.
                                    </p>
                                </div>
                            </section>

                            {/* Section 2 */}
                            <section id="definitions" className="scroll-mt-32 space-y-4">
                                <h2 className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-black text-slate-800 border-b border-slate-100 pb-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${getBadgeColors("emerald")}`}>
                                        02
                                    </span>
                                    Definitions
                                </h2>
                                <div className="space-y-3.5 text-slate-600 leading-relaxed text-sm sm:text-base">
                                    <p>
                                        <strong>2.1.</strong> For the purposes of these Terms, the following terms shall have the meanings set forth below:
                                    </p>
                                    <ul className="space-y-3 pl-4 list-none text-slate-600">
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <strong>2.1.1 &ldquo;User&rdquo;:</strong> means any person or entity accessing, browsing, registering on, or using the Website, including vehicle owners, authorised representatives, prospective customers, and any person submitting Service Requests through the Platform.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <strong>2.1.2 &ldquo;Content&rdquo;:</strong> means and includes all text, graphics, images, photographs, logos, trademarks, service descriptions, valuation tools, databases, software, website interfaces, audio-visual material, and other materials made available on the Platform.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <strong>2.1.3 &ldquo;Third Parties&rdquo;:</strong> means and refers to any individuals, businesses, service providers, governmental authorities, authorised vehicle scrapping facilities, recyclers, dismantlers, logistics providers, technology providers, payment processors, verification agencies, or external websites that are not directly owned or controlled by the Company.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <strong>2.1.4 &ldquo;Services&rdquo;:</strong> means the services offered, facilitated, or made available through the Platform, including vehicle valuation, vehicle scrapping and recycling services, end-of-life vehicle management, vehicle collection coordination, documentation assistance, compliance support, and other related services.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <strong>2.1.5 &ldquo;Service Request&rdquo;:</strong> means any enquiry, request, application, booking, valuation request, vehicle scrapping request, vehicle collection request, document submission, or other service-related request submitted by a User through the Platform.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <strong>2.1.6 &ldquo;Vehicle Information&rdquo;:</strong> means any information relating to a vehicle provided by a User through the Platform, including registration details, ownership information, make, model, year of manufacture, condition, photographs, location, and supporting documentation.
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section id="registration" className="scroll-mt-32 space-y-4">
                                <h2 className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-black text-slate-800 border-b border-slate-100 pb-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${getBadgeColors("orange")}`}>
                                        03
                                    </span>
                                    User Registration
                                </h2>
                                <div className="space-y-3.5 text-slate-600 leading-relaxed text-sm sm:text-base">
                                    <p>
                                        <strong>3.1.</strong> Users may be required to provide accurate, current, and complete information while creating an account, submitting a Service Request, uploading documents, or otherwise using certain features of the Platform, and shall ensure that such information remains accurate and up to date.
                                    </p>
                                    <p>
                                        <strong>3.2.</strong> Users are solely responsible for maintaining the confidentiality of their account credentials and for all activities undertaken through their account on the Platform.
                                    </p>
                                    <p>
                                        <strong>3.3.</strong> Users shall promptly notify the Company of any unauthorised use of their account, suspected security breach, or misuse by any third party. The Company shall not be liable for any loss or damage arising from the User's failure to safeguard account credentials or provide timely notification of such unauthorised access.
                                    </p>
                                    <p>
                                        <strong>3.4.</strong> The Company reserves the right to suspend, restrict, or terminate access to any account that contains inaccurate, misleading, incomplete, fraudulent, or unauthorised information, or where the Company reasonably believes that the account is being used in violation of these Terms or applicable law.
                                    </p>
                                </div>
                            </section>

                            {/* Section 4 */}
                            <section id="services" className="scroll-mt-32 space-y-4">
                                <h2 className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-black text-slate-800 border-b border-slate-100 pb-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${getBadgeColors("rose")}`}>
                                        04
                                    </span>
                                    Company Services
                                </h2>
                                <div className="space-y-3.5 text-slate-600 leading-relaxed text-sm sm:text-base">
                                    <p>
                                        <strong>4.1. Scope of Services:</strong> The Company operates a technology-enabled platform that facilitates vehicle scrapping, recycling, and end-of-life vehicle (ELV) management services through a network of authorised vehicle scrapping facilities, recyclers, dismantlers, logistics partners, and other service providers. The Platform enables Users to submit vehicle details, obtain vehicle valuations, initiate scrapping requests, schedule vehicle collection, access documentation assistance, and avail other related services. The Company’s Services are intended to streamline the vehicle disposal process, promote environmentally responsible recycling practices, and assist Users in complying with applicable legal and regulatory requirements relating to vehicle scrapping and disposal.
                                    </p>
                                    <p>
                                        <strong>4.2.</strong> The Platform provides the following Services:
                                    </p>
                                    <ul className="space-y-3 pl-4 list-none">
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                                            <strong>4.2.1. Vehicle Valuation Services:</strong> Enabling Users to submit Vehicle Information and receive indicative vehicle valuation estimates through the Platform, subject to verification, inspection, market conditions, vehicle condition, regulatory requirements, and other relevant factors.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                                            <strong>4.2.2. Vehicle Scrapping and Recycling Facilitation:</strong> Facilitating requests for vehicle scrapping, dismantling, recycling, and disposal through authorised service providers, subject to document verification, eligibility requirements, operational feasibility, and applicable laws.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                                            <strong>4.2.3. Vehicle Collection and Logistics Coordination:</strong> Assisting Users with vehicle pickup, transportation, and collection arrangements through authorised logistics or service partners, subject to location availability, operational constraints, and scheduling requirements.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                                            <strong>4.2.4. Documentation and Compliance Assistance:</strong> Facilitating processes relating to documentation review, ownership verification, scrapping-related formalities, regulatory submissions, and other compliance-related requirements associated with the Services.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                                            <strong>4.2.5. Digital Platform and Customer Support Services:</strong> Providing Users with access to account management features, service request tracking, customer support, informational resources, and other functionalities made available through the Platform.
                                        </li>
                                    </ul>
                                    <p>
                                        <strong>4.3. Service Availability:</strong> The Company reserves the right to modify, suspend, restrict, or discontinue any aspect of the Platform or Services at any time without prior notice to the User, including but not limited to valuation tools, service coverage areas, service offerings, eligibility criteria, partner networks, documentation requirements, Platform features, operational processes, or other functionalities, where necessary for business, operational, technical, legal, regulatory, or service-improvement purposes.
                                    </p>
                                </div>
                            </section>

                            {/* Section 5 */}
                            <section id="obligations" className="scroll-mt-32 space-y-4">
                                <h2 className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-black text-slate-800 border-b border-slate-100 pb-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${getBadgeColors("blue")}`}>
                                        05
                                    </span>
                                    User Obligations
                                </h2>
                                <div className="space-y-3.5 text-slate-600 leading-relaxed text-sm sm:text-base">
                                    <p>
                                        <strong>5.1. Expectations from the Users:</strong> To maintain a secure, lawful, and efficient commercial environment on the Platform, all Users are obligated to:
                                    </p>
                                    <ul className="space-y-2.5 pl-4 list-none mb-4">
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <strong>5.1.1.</strong> Use the Platform in a lawful, responsible, and bona fide manner.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <strong>5.1.2.</strong> Provide accurate, complete, and up-to-date information, documents, and Vehicle Information when using the Services.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <strong>5.1.3.</strong> Ensure that they have the necessary rights, authority, and ownership to submit Vehicle Information, documentation, and Service Requests through the Platform.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <strong>5.1.4.</strong> Maintain the confidentiality of their account credentials and promptly notify the Company of any unauthorised access or security breach.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <strong>5.1.5.</strong> Cooperate with reasonable requests for information, documentation, verification, or clarification required for the provision of Services.
                                        </li>
                                    </ul>
                                    <p>
                                        <strong>5.2. Prohibition to Users:</strong> To protect the integrity of the Platform and Services, Users are prohibited from:
                                    </p>
                                    <ul className="space-y-2.5 pl-4 list-none">
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-red-500 rounded-sm" />
                                            <strong>5.2.1.</strong> Submit false, inaccurate, misleading, fraudulent, or forged information or documents.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-red-500 rounded-sm" />
                                            <strong>5.2.2.</strong> Use the platform for any unlawful, fraudulent, or unauthorised purpose.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-red-500 rounded-sm" />
                                            <strong>5.2.3.</strong> Interfere with, disrupt, compromise, or attempt to gain unauthorised access to the platform, its systems, accounts, or data.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-red-500 rounded-sm" />
                                            <strong>5.2.4.</strong> Copy, reproduce, distribute, modify, reverse engineer, or otherwise exploit any content except as expressly permitted by law or the company.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-red-500 rounded-sm" />
                                            <strong>5.2.5.</strong> Impersonate any person, misrepresent ownership of a vehicle, or otherwise misuse the services.
                                        </li>
                                    </ul>
                                    <p>
                                        <strong>5.3.</strong> The Company reserves the right to investigate any suspected violation of these Terms and may suspend, restrict, terminate, or refuse access to the Platform or Services, reject Service Requests, remove content, or take any other action deemed necessary to protect the Platform, its Users, or its business interests.
                                    </p>
                                </div>
                            </section>

                            {/* Section 6 */}
                            <section id="use-disclaimers" className="scroll-mt-32 space-y-4">
                                <h2 className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-black text-slate-800 border-b border-slate-100 pb-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${getBadgeColors("amber")}`}>
                                        06
                                    </span>
                                    Website Use, Interactions, and Disclaimers
                                </h2>
                                <div className="space-y-3.5 text-slate-600 leading-relaxed text-sm sm:text-base">
                                    <p>
                                        <strong>6.1.</strong> The Platform is provided for informational and service facilitation purposes only and enables Users to access information relating to vehicle valuation, vehicle scrapping, recycling, collection, documentation assistance, and related Services.
                                    </p>
                                    <p>
                                        <strong>6.2.</strong> Any valuation, estimate, information, or indication provided through the Platform is for informational purposes only and does not constitute a binding offer, guarantee, professional advice, or commitment by the Company. Final valuations, eligibility, service availability, and transaction terms may vary based on inspection findings, documentation, operational considerations, market conditions, and applicable legal requirements.
                                    </p>
                                    <p>
                                        <strong>6.3.</strong> Users are solely responsible for:
                                    </p>
                                    <ul className="space-y-2 pl-4 list-none mb-3">
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            <strong>6.3.1.</strong> the accuracy, legality, and completeness of all information and documents submitted through the Platform.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            <strong>6.3.2.</strong> independently evaluating the suitability of any Services before proceeding with a transaction.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            <strong>6.3.3.</strong> ensuring that the vehicle and related documentation comply with applicable legal and regulatory requirements.
                                        </li>
                                    </ul>
                                    <p>
                                        <strong>6.4.</strong> The Platform may contain links, integrations, or references to Third Parties. The Company does not control, endorse, verify, or assume responsibility for any third-party content, services, websites, acts, omissions, or representations and shall not be liable for any loss arising from a User's interaction with such Third Parties.
                                    </p>
                                    <p>
                                        <strong>6.5.</strong> Users acknowledge and agree that:
                                    </p>
                                    <ul className="space-y-2 pl-4 list-none">
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            <strong>6.5.1.</strong> service availability may vary based on location, vehicle condition, documentation status, partner availability, and operational constraints.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            <strong>6.5.2.</strong> vehicle valuations and service outcomes may change following inspection, verification, or assessment by the relevant service provider.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            <strong>6.5.3.</strong> delays or disruptions may occur due to circumstances beyond the Company's reasonable control, including actions of Third Parties, regulatory authorities, technical failures, or force majeure events.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            <strong>6.5.4.</strong> the Company does not guarantee that the Platform will be uninterrupted, error-free, secure, or available at all times.
                                        </li>
                                    </ul>
                                    <p>
                                        <strong>6.6.</strong> Users shall not upload, transmit, or submit any unlawful, harmful, misleading, infringing, malicious, or unauthorised content through the Platform.
                                    </p>
                                    <p>
                                        <strong>6.7.</strong> The Company may monitor usage of the Platform for security, operational, compliance, and fraud-prevention purposes and reserves the right to review user activity, restrict access, reject Service Requests, remove content, or report suspected unlawful activity to the appropriate authorities where required.
                                    </p>
                                </div>
                            </section>

                            {/* Section 7 */}
                            <section id="privacy" className="scroll-mt-32 space-y-4">
                                <h2 className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-black text-slate-800 border-b border-slate-100 pb-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${getBadgeColors("teal")}`}>
                                        07
                                    </span>
                                    Data Privacy & Security
                                </h2>
                                <div className="space-y-3.5 text-slate-600 leading-relaxed text-sm sm:text-base">
                                    <p>
                                        <strong>7.1.</strong> All User data collection, processing, and storage practices comply with the provisions of the Information Technology Act, 2000, and the Digital Personal Data Protection Act, 2023. The Company’s practices for handling and protecting User information are set out in the separate Privacy Policy, which forms part of these Terms and Conditions by reference.
                                    </p>
                                    <p>
                                        <strong>7.2.</strong> The Company may collect, use, process, store, and share User information to facilitate the Services, verify information and documentation, manage Service Requests, process transactions, provide customer support, improve Platform functionality, prevent fraud, and comply with applicable legal, regulatory, and operational requirements.
                                    </p>
                                    <p>
                                        <strong>7.3.</strong> Users acknowledge and consent to the Company's collection and use of non-personal, anonymised, aggregated, or statistical information relating to Platform usage, service interactions, and user activity for analytics, service enhancement, business operations, and other lawful purposes.
                                    </p>
                                    <p>
                                        <strong>7.4.</strong> Subject to applicable laws, Users may exercise their rights relating to access, correction, updating, deletion, or withdrawal of consent in respect of their Personal Data in accordance with the procedure set out in the Privacy Policy. Users acknowledge that withdrawal of consent or deletion of certain information may affect the availability or provision of Services.
                                    </p>
                                    <p>
                                        <strong>7.5.</strong> The Company implements reasonable technical, organisational, and administrative safeguards to protect User information from unauthorised access, disclosure, alteration, misuse, or loss. However, no electronic transmission or storage system can be guaranteed to be completely secure, and the Company does not warrant absolute security of any information transmitted through the Platform.
                                    </p>
                                    <p>
                                        <strong>7.6.</strong> The Company may share information with authorised service providers, business partners, payment processors, technology providers, verification agencies, logistics partners, regulatory authorities, or other third parties where necessary for the provision of Services, compliance with legal obligations, fraud prevention, or protection of the Company's legitimate interests.
                                    </p>
                                    <p>
                                        <strong>7.7.</strong> In the event of a data security incident, the Company shall take such measures as it considers appropriate under the circumstances and shall provide notifications where required under applicable law.
                                    </p>
                                </div>
                            </section>

                            {/* Section 8 */}
                            <section id="suspension-termination" className="scroll-mt-32 space-y-4">
                                <h2 className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-black text-slate-800 border-b border-slate-100 pb-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${getBadgeColors("violet")}`}>
                                        08
                                    </span>
                                    Account Suspension/Termination
                                </h2>
                                <div className="space-y-3.5 text-slate-600 leading-relaxed text-sm sm:text-base">
                                    <p>
                                        <strong>8.1. Grounds for Suspension or Termination:</strong> The Company reserves the right to suspend, restrict, or terminate a User's account, access to the Platform, or availability of Services at its sole discretion where:
                                    </p>
                                    <ul className="space-y-2 pl-4 list-none mb-4">
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
                                            <strong>8.1.1.</strong> the User breaches these Terms, any applicable Policies, or applicable law.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
                                            <strong>8.1.2.</strong> the User provides false, inaccurate, misleading, fraudulent, or incomplete information or documentation.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
                                            <strong>8.1.3.</strong> the User engages in fraudulent, abusive, unlawful, or suspicious activity, including misuse of the Platform or Services.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
                                            <strong>8.1.4.</strong> the Company is unable to verify information, documentation, vehicle ownership, or the User's authority to avail the Services.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
                                            <strong>8.1.5.</strong> such action is necessary to protect the security, integrity, operation, or reputation of the Platform, the Company, its service providers, or other Users.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
                                            <strong>8.1.6.</strong> the Company is required to do so pursuant to legal, regulatory, or governmental requirements.
                                        </li>
                                    </ul>
                                    <p>
                                        <strong>8.2. Consequences of Suspension or Termination:</strong>
                                    </p>
                                    <ul className="space-y-2 pl-4 list-none mb-3">
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
                                            <strong>8.2.1.</strong> the User's access to the Platform or certain Services may be immediately restricted or revoked.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
                                            <strong>8.2.2.</strong> the Company may reject, cancel, suspend, or discontinue any pending Service Requests or transactions.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
                                            <strong>8.2.3.</strong> the Company shall not be liable for any loss, cost, expense, or consequence arising from such suspension or termination, except as required under applicable law.
                                        </li>
                                    </ul>
                                    <p>
                                        <strong>8.3.</strong> Termination or suspension of an account shall not affect any rights, obligations, liabilities, or remedies that accrued prior to such suspension or termination.
                                    </p>
                                    <p>
                                        <strong>8.4.</strong> The Company may retain User information, records, communications, transaction details, and Service Request history following suspension or termination in accordance with applicable laws, regulatory requirements, and the Privacy Policy.
                                    </p>
                                    <p>
                                        <strong>8.5.</strong> Users may request access to or deletion of their Personal Data in accordance with the Privacy Policy, subject to any applicable legal, regulatory, operational, or record-retention requirements.
                                    </p>
                                </div>
                            </section>

                            {/* Section 9 */}
                            <section id="payments-refunds" className="scroll-mt-32 space-y-4">
                                <h2 className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-black text-slate-800 border-b border-slate-100 pb-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${getBadgeColors("cyan")}`}>
                                        09
                                    </span>
                                    Payments and Refunds
                                </h2>
                                <div className="space-y-3.5 text-slate-600 leading-relaxed text-sm sm:text-base">
                                    <p>
                                        <strong>9.1.</strong> Where any fees, charges, deposits, service fees, transportation charges, or other amounts are payable in connection with the Services, such amounts shall be communicated to the User through the Platform, quotations, invoices, or other written communication.
                                    </p>
                                    <p>
                                        <strong>9.2.</strong> Users shall make all payments in accordance with the applicable payment terms communicated by the Company or the relevant service provider. The Company reserves the right to suspend or withhold Services until payment obligations have been fulfilled.
                                    </p>
                                    <p>
                                        <strong>9.3.</strong> Payments may be processed through authorised third-party payment service providers, and Users agree to comply with the applicable terms, conditions, and policies of such providers.
                                    </p>
                                    <p>
                                        <strong>9.4.</strong> Any refunds, adjustments, cancellations, or payment reversals shall be subject to the Company's applicable policies, the nature of the Services, contractual commitments with service providers, and applicable law.
                                    </p>
                                    <p>
                                        <strong>9.5.</strong> The Company reserves the right to reject, suspend, or cancel any Service Request in the event of payment failures, chargebacks, disputed transactions, suspected fraud, or non-compliance with payment obligations.
                                    </p>
                                    <p>
                                        <strong>9.6.</strong> All applicable taxes, duties, levies, governmental charges, or statutory fees shall be borne by the User unless expressly stated otherwise.
                                    </p>
                                </div>
                            </section>

                            {/* Section 10 */}
                            <section id="provision-disclaimers" className="scroll-mt-32 space-y-4">
                                <h2 className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-black text-slate-800 border-b border-slate-100 pb-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${getBadgeColors("fuchsia")}`}>
                                        10
                                    </span>
                                    Provision of Services and Disclaimers
                                </h2>
                                <div className="space-y-3.5 text-slate-600 leading-relaxed text-sm sm:text-base">
                                    <p>
                                        <strong>10.1.</strong> The Company shall use reasonable efforts to facilitate the Services through the Platform; however, all valuations, timelines, collection schedules, service availability, processing periods, and other estimates are indicative only and shall not constitute a guarantee or binding commitment.
                                    </p>
                                    <p>
                                        <strong>10.2.</strong> The Company shall not be liable for any delay, interruption, suspension, modification, or inability to provide the Services arising from:
                                    </p>
                                    <ul className="space-y-2 pl-4 list-none mb-4">
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
                                            <strong>10.2.1.</strong> inaccurate, incomplete, misleading, or outdated information, documents, or Vehicle Information provided by the User.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
                                            <strong>10.2.2.</strong> failure of the User to provide required approvals, documentation, verifications, or cooperation necessary for the Services.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
                                            <strong>10.2.3.</strong> technical failures, system outages, maintenance activities, cybersecurity incidents, or disruptions affecting the Platform or related systems.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
                                            <strong>10.2.4.</strong> changes in vehicle condition, ownership records, documentation status, inspection findings, regulatory requirements, or eligibility criteria.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
                                            <strong>10.2.5.</strong> acts, omissions, delays, or failures of Third Parties, including authorised vehicle scrapping facilities, recyclers, logistics providers, payment processors, verification agencies, or governmental authorities.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
                                            <strong>10.2.6.</strong> any force majeure event or circumstance beyond the reasonable control of the Company.
                                        </li>
                                    </ul>
                                    <p>
                                        <strong>10.3.</strong> The Company does not warrant or guarantee:
                                    </p>
                                    <ul className="space-y-2 pl-4 list-none mb-3">
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
                                            <strong>10.3.1.</strong> that every vehicle submitted through the Platform will qualify for the Services.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
                                            <strong>10.3.2.</strong> that a Service Request will be accepted, approved, completed, or processed within any specific timeframe.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
                                            <strong>10.3.3.</strong> that the Platform or Services will be available uninterrupted, error-free, or free from technical issues at all times.
                                        </li>
                                    </ul>
                                    <p>
                                        <strong>10.4.</strong> The User acknowledges that final pricing, valuations, service eligibility, collection arrangements, and transaction outcomes may be subject to inspection, verification, documentation review, operational feasibility, market conditions, and applicable legal or regulatory requirements.
                                    </p>
                                </div>
                            </section>

                            {/* Section 11 */}
                            <section id="intellectual-property" className="scroll-mt-32 space-y-4">
                                <h2 className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-black text-slate-800 border-b border-slate-100 pb-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${getBadgeColors("pink")}`}>
                                        11
                                    </span>
                                    Intellectual Property
                                </h2>
                                <div className="space-y-3.5 text-slate-600 leading-relaxed text-sm sm:text-base">
                                    <p>
                                        <strong>11.1.</strong> All rights, title, and interest in and to the Platform, including its Content, software, databases, trademarks, logos, trade names, designs, website layout, graphics, text, valuation tools, and other materials made available through the Platform, are owned by or licensed to the Company and are protected under applicable intellectual property laws.
                                    </p>
                                    <p>
                                        <strong>11.2.</strong> Subject to these Terms, the Company grants Users a limited, non-exclusive, non-transferable, and revocable right to access and use the Platform solely for its intended purposes.
                                    </p>
                                    <p>
                                        <strong>11.3.</strong> Users shall not, without the Company's prior written consent, reproduce, copy, modify, distribute, publish, commercially exploit, reverse engineer, scrape, extract data from, or otherwise use any part of the Platform or its Content except as expressly permitted by law.
                                    </p>
                                    <p>
                                        <strong>11.4.</strong> Nothing contained in these Terms shall be construed as granting any intellectual property rights to the User other than the limited right to access and use the Platform in accordance with these Terms.
                                    </p>
                                </div>
                            </section>

                            {/* Section 12 */}
                            <section id="limitation-liability" className="scroll-mt-32 space-y-4">
                                <h2 className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-black text-slate-800 border-b border-slate-100 pb-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${getBadgeColors("purple")}`}>
                                        12
                                    </span>
                                    Limitation of Liability
                                </h2>
                                <div className="space-y-3.5 text-slate-600 leading-relaxed text-sm sm:text-base">
                                    <p>
                                        <strong>12.1.</strong> To the maximum extent permitted under applicable law, the Company shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, including loss of profits, revenue, business opportunity, goodwill, data, or anticipated savings, arising out of or in connection with the use of, inability to use, or reliance upon the Platform or Services.
                                    </p>
                                    <p>
                                        <strong>12.2.</strong> Without limiting the foregoing, the Company shall not be responsible for:
                                    </p>
                                    <ul className="space-y-2 pl-4 list-none mb-3">
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-purple-500" />
                                            <strong>12.2.1.</strong> any decisions, actions, or outcomes based on information, estimates, valuations, or content made available through the Platform.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-purple-500" />
                                            <strong>12.2.2.</strong> any delays, disruptions, service failures, or inaccuracies attributable to Users, Third Parties, service providers, regulatory authorities, or circumstances beyond the Company's reasonable control.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-purple-500" />
                                            <strong>12.2.3.</strong> any interruption, unavailability, technical malfunction, security incident, or failure of the Platform.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-purple-500" />
                                            <strong>12.2.4.</strong> any act, omission, or service deficiency of any authorised vehicle scrapping facility, recycler, transporter, payment processor, verification agency, or other Third Party.
                                        </li>
                                    </ul>
                                    <p>
                                        <strong>12.3.</strong> The Platform and Services are provided on an "as is" and "as available" basis. The Company makes no representation or warranty, express or implied, regarding the accuracy, reliability, completeness, availability, or suitability of the Platform or Services.
                                    </p>
                                    <p>
                                        <strong>12.4.</strong> To the extent liability cannot be excluded under applicable law, the aggregate liability of the Company arising out of or relating to the Platform or Services shall not exceed the amount actually paid by the User to the Company in connection with the specific Service giving rise to the claim.
                                    </p>
                                </div>
                            </section>

                            {/* Section 13 */}
                            <section id="indemnification" className="scroll-mt-32 space-y-4">
                                <h2 className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-black text-slate-800 border-b border-slate-100 pb-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${getBadgeColors("sky")}`}>
                                        13
                                    </span>
                                    Indemnification
                                </h2>
                                <div className="space-y-3.5 text-slate-600 leading-relaxed text-sm sm:text-base">
                                    <p>
                                        <strong>13.1.</strong> The User agrees to indemnify, defend, and hold harmless the Company, its affiliates, directors, officers, employees, representatives, agents, service providers, and business partners from and against any claims, actions, demands, losses, damages, liabilities, costs, or expenses (including reasonable legal fees) arising out of or relating to:
                                    </p>
                                    <ul className="space-y-2 pl-4 list-none mb-3">
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-sky-500" />
                                            <strong>13.1.1.</strong> the User's breach of these Terms, the Privacy Policy, or applicable law.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-sky-500" />
                                            <strong>13.1.2.</strong> the User's misuse of the Platform or Services.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-sky-500" />
                                            <strong>13.1.3.</strong> any false, inaccurate, misleading, fraudulent, or unauthorised information, documentation, or Vehicle Information submitted by the User.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-sky-500" />
                                            <strong>13.1.4.</strong> any dispute relating to vehicle ownership, authority to dispose of a vehicle, regulatory compliance, or rights in respect of a vehicle submitted through the Platform.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-sky-500" />
                                            <strong>13.1.5.</strong> the infringement of any third-party rights by the User.
                                        </li>
                                    </ul>
                                    <p>
                                        <strong>13.2.</strong> The obligations under this Clause shall survive suspension, termination, or expiry of these Terms.
                                    </p>
                                </div>
                            </section>

                            {/* Section 14 */}
                            <section id="dispute-resolution" className="scroll-mt-32 space-y-4">
                                <h2 className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-black text-slate-800 border-b border-slate-100 pb-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${getBadgeColors("emerald")}`}>
                                        14
                                    </span>
                                    Dispute Resolution
                                </h2>
                                <div className="space-y-3.5 text-slate-600 leading-relaxed text-sm sm:text-base">
                                    <p>
                                        <strong>14.1. Resolution of Concerns:</strong> In the event of any dispute, claim, grievance, or controversy arising out of or in connection with the Platform, Services, Service Requests, transactions, or these Terms, the User shall first notify the Company in writing and the Parties shall endeavour to resolve the matter amicably through good-faith discussions.
                                    </p>
                                    <p>
                                        <strong>14.2.</strong> If the dispute is not resolved within thirty (30) days from the date of such notice, it shall be referred to and finally resolved by arbitration in accordance with the Arbitration and Conciliation Act, 1996, as amended from time to time.
                                    </p>
                                    <p>
                                        <strong>14.3.</strong> The arbitration shall be conducted by a sole arbitrator appointed by the Company. The seat and venue of arbitration shall be Kanpur, Uttar Pradesh, India. The arbitration proceedings shall be conducted in English.
                                    </p>
                                    <p>
                                        <strong>14.4.</strong> The arbitral award shall be final and binding upon the Parties.
                                    </p>
                                    <p>
                                        <strong>14.5.</strong> Nothing in this Clause shall prevent the Company from seeking interim, injunctive, or equitable relief from any court of competent jurisdiction.
                                    </p>
                                    <p>
                                        <strong>14.6.</strong> Subject to this Clause, the courts at Kanpur, Uttar Pradesh, India shall have exclusive jurisdiction over all matters arising out of or relating to these Terms.
                                    </p>
                                </div>
                            </section>

                            {/* Section 15 */}
                            <section id="governing-law" className="scroll-mt-32 space-y-4">
                                <h2 className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-black text-slate-800 border-b border-slate-100 pb-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${getBadgeColors("indigo")}`}>
                                        15
                                    </span>
                                    Governing Law
                                </h2>
                                <div className="space-y-3.5 text-slate-600 leading-relaxed text-sm sm:text-base">
                                    <p>
                                        <strong>15.1.</strong> These Terms shall be governed by and construed in accordance with the laws of India.
                                    </p>
                                </div>
                            </section>

                            {/* Section 16 */}
                            <section id="modifications" className="scroll-mt-32 space-y-4">
                                <h2 className="flex items-center gap-3 text-lg sm:text-xl md:text-2xl font-black text-slate-800 border-b border-slate-100 pb-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${getBadgeColors("rose")}`}>
                                        16
                                    </span>
                                    Modifications
                                </h2>
                                <div className="space-y-3.5 text-slate-600 leading-relaxed text-sm sm:text-base">
                                    <p>
                                        <strong>16.1. Right to Amend Terms:</strong> The Company reserves the right to revise, amend, update, or modify these Terms at any time to reflect changes in the Platform, Services, or applicable laws.
                                    </p>
                                    <p>
                                        <strong>16.2. Notification of Changes:</strong> The Company may, but is not obligated to, notify Users of material changes through:
                                    </p>
                                    <ul className="space-y-2 pl-4 list-none mb-3">
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                                            <strong>16.2.1.</strong> The Platform notifications.
                                        </li>
                                        <li className="relative pl-6">
                                            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                                            <strong>16.2.2.</strong> Emails sent to the registered email address provided by the User.
                                        </li>
                                    </ul>
                                    <p>
                                        <strong>16.3. User Acceptance of Changes:</strong> Continued use of the Company or Services following such notifications constitutes acceptance of the updated Terms and Conditions. Users are encouraged to regularly review the Terms to stay informed about their rights and obligations.
                                    </p>
                                    <p>
                                        <strong>16.4. Effective Date of Changes:</strong> Unless otherwise specified, all modifications shall become effective immediately upon being updated or published on the Platform and shall apply to all ongoing and future use of the Services.
                                    </p>
                                    <p className="mt-6 font-bold text-slate-700 bg-slate-50 p-4 border border-slate-100 rounded-2xl text-xs sm:text-sm">
                                        Your use of this Website constitutes your acceptance of these Terms and Conditions in full. If you disagree with any part, please do not use the Website.
                                    </p>
                                </div>
                            </section>

                            {/* Privacy Policy Callout Card */}
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#E31E24]/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
                                <Shield className="w-6 h-6 text-[#E31E24] shrink-0 mt-1" />
                                <div className="relative z-10">
                                    <h4 className="font-bold text-slate-800 mb-1 text-sm sm:text-base">Privacy Policy</h4>
                                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                        Your privacy is extremely important to us. Please review our <Link href="/privacy" className="text-[#E31E24] font-semibold hover:underline">Privacy Policy</Link> to understand how we securely collect, process, and protect your information.
                                    </p>
                                </div>
                            </div>

                            {/* Footer timestamp */}
                            <div className="pt-8 border-t border-slate-100 text-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                Last updated: June 2026
                            </div>

                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
