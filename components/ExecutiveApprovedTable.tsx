"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import StatusSidebar from "./StatusSidebar"

export default function ExecutiveApprovedTable({ data }: { data: any[] }) {
    const [selectedLead, setSelectedLead] = useState<any | null>(null)

    return (
        <>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-black/40 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20 border-b border-gray-100 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-4">Classification</th>
                                <th className="px-6 py-4">Principal Entity</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">Approval Date</th>
                                <th className="px-6 py-4">B2B Status</th>
                                <th className="px-6 py-4 text-right">Analytical View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {data.map((item: any) => (
                                <tr 
                                    key={item._id} 
                                    onClick={() => setSelectedLead(item)}
                                    className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white">{item.customerName}</span>
                                            <span className="text-[10px] font-medium text-gray-500 dark:text-white/40">{item.customerPhone || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[11px] font-medium text-gray-500 dark:text-white/40 uppercase tracking-widest">
                                        {item.vehicleInfo}
                                    </td>
                                    <td className="px-6 py-4 text-[11px] font-medium text-gray-500 dark:text-white/40">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.status === 'pickup_scheduled' ? (
                                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                Pickup Scheduled
                                            </span>
                                        ) : item.status === 'reached_collection_centre' ? (
                                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                                Picked Up Successfully
                                            </span>
                                        ) : item.status === 'car_scrapped' ? (
                                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                                Car Scrapped Successfully
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                Approved
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link 
                                            href={`/executive/valuations/${item.type}/${item._id}`} 
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all border border-transparent dark:border-white/10 hover:dark:border-white/20"
                                        >
                                            Access File <ArrowUpRight className="w-3 h-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-white/20 text-xs font-bold uppercase tracking-widest">
                                        No approved portfolio entries identified
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <StatusSidebar 
                isOpen={!!selectedLead}
                onClose={() => setSelectedLead(null)}
                lead={selectedLead}
            />
        </>
    )
}
