"use client"

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    AreaChart,
    Area
} from "recharts"
import { motion } from "framer-motion"

interface DashboardChartsProps {
    valuationCounts: {
        quote: number
        sell: number
        exchange: number
        buy: number
    }
    b2bStats: {
        total: number
        pending: number
        approved: number
    }
    monthlyGrowthData: { name: string, value: number }[]
    activityData: { name: string, requests: number, partners: number }[]
}

export default function DashboardCharts({ valuationCounts, b2bStats, monthlyGrowthData, activityData }: DashboardChartsProps) {
    // Chart 1: Service Distribution
    const serviceData = [
        { name: "Free Quote", value: valuationCounts.quote, color: "#3b82f6" }, // Blue
        { name: "Sell Vehicle", value: valuationCounts.sell, color: "#22c55e" }, // Green
        { name: "Exchange", value: valuationCounts.exchange, color: "#a855f7" }, // Purple
        { name: "Buy Vehicle", value: valuationCounts.buy, color: "#f97316" }, // Orange
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

            {/* Chart 1: Service Distribution */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] as any }}
                className="bg-white dark:bg-[#0E192D] p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col transition-colors duration-300"
            >
                <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-6">Service Distribution</h3>
                <div className="h-[250px] w-full [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={serviceData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                style={{ outline: 'none' }}
                            >
                                {serviceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} style={{ outline: 'none' }} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                itemStyle={{ color: "#1e293b", fontWeight: "600" }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Chart 2: Monthly Growth */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] as any }}
                className="bg-white dark:bg-[#0E192D] p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col transition-colors duration-300"
            >
                <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-6">Monthly Growth</h3>
                <div className="h-[250px] w-full [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                itemStyle={{ color: "#1e293b", fontWeight: "600" }}
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Chart 3: Weekly Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] as any }}
                className="bg-white dark:bg-[#0E192D] p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col transition-colors duration-300"
            >
                <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-6">Weekly Activity Activity</h3>
                <div className="h-[250px] w-full [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData}>
                            <defs>
                                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="requests"
                                stroke="#059669"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRequests)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Analytics Report Button — full width below charts */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.215, 0.61, 0.355, 1] as any }}
                className="col-span-1 md:col-span-2 lg:col-span-3"
            >
                <a
                    href="https://lookerstudio.google.com/embed/reporting/f57410b3-d8fb-4599-ab16-f8d4f3626314/page/1M"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center gap-4 w-full py-5 px-8 rounded-2xl font-bold text-lg text-white tracking-wide shadow-lg transition-all duration-300 hover:scale-[1.015] hover:shadow-emerald-500/30 active:scale-[0.985]"
                    style={{
                        background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)',
                        boxShadow: '0 4px 24px rgba(5,150,105,0.25)',
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 shrink-0 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Customer Journey &amp; Conversion Analytics Report</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 opacity-75 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </motion.div>

        </div>
    )
}
