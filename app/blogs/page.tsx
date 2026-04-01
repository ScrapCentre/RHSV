"use client"

import { motion } from "framer-motion"
import { Calendar, User, ArrowRight, Tag, BookOpen, Clock, ChevronRight, Search } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Image from "next/image"

export default function BlogsPage() {
    const blogs = [
        {
            id: 1,
            title: "The Future of Vehicle Scrapping in India",
            excerpt: "How the new vehicle scrappage policy is transforming the automotive industry and promoting sustainability across the nation.",
            date: "Feb 5, 2026",
            author: "Rahul Sharma",
            category: "Policy",
            readTime: "5 min read",
            image: "/blog-1.jpg",
        },
        {
            id: 2,
            title: "Understanding the Green Tax Benefits",
            excerpt: "Unlock financial incentives for scrapping your old vehicle. A comprehensive guide to tax rebates and discounts on new cars.",
            date: "Jan 28, 2026",
            author: "Priya Singh",
            category: "Finance",
            readTime: "4 min read",
            image: "/blog-2.jpg",
        },
        {
            id: 3,
            title: "Top 5 Signals Your Car Needs Scrapping",
            excerpt: "Is your car costing more to repair than it's worth? Check these 5 critical signs that indicate it's time to say goodbye.",
            date: "Jan 15, 2026",
            author: "Amit Patel",
            category: "Maintenance",
            readTime: "3 min read",
            image: "/blog-3.jpg",
        },
        {
            id: 4,
            title: "How AutoScrap Recycles 99% of Materials",
            excerpt: "An inside look at our advanced recycling facility where we responsibly extract metals, fluids, and plastics for reuse.",
            date: "Dec 10, 2025",
            author: "Vikram Malhotra",
            category: "Technology",
            readTime: "6 min read",
            image: "/blog-4.jpg",
        },
        {
            id: 5,
            title: "Electric Vehicles Disposal: Challenges & Solutions",
            excerpt: "Safely recycling EV batteries is crucial for the environment. Learn how we handle high-voltage components safely.",
            date: "Nov 22, 2025",
            author: "Neha Gupta",
            category: "EVs",
            readTime: "7 min read",
            image: "/blog-5.jpg",
        },
        {
            id: 6,
            title: "Simplified Guide to Deregistration Process",
            excerpt: "Navigating RTO paperwork can be tricky. We simplify the steps to get your Certificate of Deposit (CD) hassle-free.",
            date: "Oct 05, 2025",
            author: "Sanjay Kumar",
            category: "Guide",
            readTime: "5 min read",
            image: "/blog-6.jpg",
        },
    ]

    return (
        <div className="min-h-screen bg-[#0E192D] font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
            <Navbar />

            {/* Header Section */}
            <section className="pt-32 pb-20 px-4 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="container mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-sm font-semibold mb-6 backdrop-blur-sm"
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>Knowledge Hub</span>
                        </motion.div>

                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                            Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Insights</span> & News
                        </h1>

                        <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            Stay updated with the latest trends in vehicle scrapping, government policies, and eco-friendly practices.
                        </p>

                        {/* Search Bar Placeholder */}
                        <div className="mt-10 max-w-md mx-auto relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative flex items-center bg-[#0E192D] border border-white/10 rounded-full p-2 shadow-xl">
                                <Search className="w-5 h-5 text-slate-400 ml-4" />
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 px-4 py-2"
                                />
                                <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-full font-medium transition-colors">
                                    Search
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-16 px-4 relative z-10">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog, index) => (
                            <motion.div
                                key={blog.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-emerald-500/50 hover:bg-white/[0.07] transition-all duration-300 group flex flex-col h-full"
                            >
                                {/* Image Placeholder */}
                                <div className="relative h-60 bg-slate-800/50 overflow-hidden">
                                    {/* In a real app, use next/image here. Using a placeholder div for now. */}
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-[#0E192D]/50 group-hover:scale-105 transition-transform duration-700">
                                        <div className="text-center">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2">
                                                <BookOpen className="w-8 h-8 text-white/20" />
                                            </div>
                                            <span className="text-sm font-medium opacity-60">Article Image</span>
                                        </div>
                                    </div>

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E192D] to-transparent opacity-60"></div>

                                    <div className="absolute top-4 left-4 bg-[#0E192D]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 shadow-lg">
                                        <Tag className="w-3 h-3" /> {blog.category}
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="flex items-center justify-between text-xs text-slate-400 mb-6 font-medium">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5">
                                                <Calendar className="w-3.5 h-3.5 text-emerald-500" /> {blog.date}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-emerald-500" /> {blog.readTime}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl md:text-2xl font-bold text-slate-100 mb-4 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight">
                                        {blog.title}
                                    </h3>

                                    <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                        {blog.excerpt}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                                <User className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <span className="text-sm text-slate-300 font-medium">{blog.author}</span>
                                        </div>

                                        <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-[#0E192D] transition-all duration-300 border border-white/10 group-hover:border-emerald-500">
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-emerald-600 hover:border-emerald-500 transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2 mx-auto group">
                            Load More Articles
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

        </div>
    )
}

