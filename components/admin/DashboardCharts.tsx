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
        { name: "Buy New", value: valuationCounts.buy, color: "#f97316" }, // Orange
        { name: "Scrap & Buy", value: valuationCounts.exchange, color: "#a855f7" }, // Purple
        { name: "Scrap", value: valuationCounts.quote, color: "#3b82f6" }, // Blue
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">

            {/* Chart 1: Service Distribution */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.215, 0.61, 0.355, 1] as any }}
                className="bg-white dark:bg-[#0E192D] p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col transition-colors duration-300"
            >
                <h3 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Service Distribution</h3>
                <div className="h-[180px] w-full [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={serviceData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={4}
                                dataKey="value"
                                minAngle={15}
                                style={{ outline: 'none' }}
                            >
                                {serviceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} style={{ outline: 'none' }} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgb(0 0 0 / 0.05)", fontSize: "11px" }}
                                itemStyle={{ color: "#1e293b", fontWeight: "600" }}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                height={24} 
                                iconType="circle"
                                iconSize={7}
                                formatter={(value, entry: any) => (
                                    <span className="font-bold text-[9px] uppercase tracking-wider" style={{ color: entry.color }}>
                                        {value} ({entry.payload.value})
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Chart 2: Monthly Growth */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05, ease: [0.215, 0.61, 0.355, 1] as any }}
                className="bg-white dark:bg-[#0E192D] p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col transition-colors duration-300"
            >
                <h3 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Monthly Growth</h3>
                <div className="h-[180px] w-full [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={5} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgb(0 0 0 / 0.05)", fontSize: "11px" }}
                                itemStyle={{ color: "#1e293b", fontWeight: "600" }}
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[3, 3, 0, 0]} barSize={22} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Chart 3: Weekly Activity */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] as any }}
                className="bg-white dark:bg-[#0E192D] p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col transition-colors duration-300"
            >
                <h3 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Weekly Activity</h3>
                <div className="h-[180px] w-full [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData}>
                            <defs>
                                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={5} />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgb(0 0 0 / 0.05)", fontSize: "11px" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="requests"
                                stroke="#059669"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorRequests)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Analytics Report Button — full width below charts */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15, ease: [0.215, 0.61, 0.355, 1] as any }}
                className="col-span-1 md:col-span-2 lg:col-span-3"
            >
                <a
                    href="https://lookerstudio.google.com/embed/reporting/f57410b3-d8fb-4599-ab16-f8d4f3626314/page/1M"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center gap-2 w-full py-2.5 px-6 rounded-lg font-bold text-xs text-white tracking-wider shadow shadow-emerald-600/10 transition-all duration-300 hover:scale-[1.008] active:scale-[0.992]"
                    style={{
                        background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)',
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Customer Journey &amp; Conversion Analytics Report</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0 opacity-75 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </motion.div>

        </div>
    )
}
