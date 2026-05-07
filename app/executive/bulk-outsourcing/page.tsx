import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import BulkOutsourcing from "@/models/BulkOutsourcing"
import { Database, ChevronLeft, ArrowUpRight, Search } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ExecutiveBulkOutsourcing() {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "executive") {
        redirect("/executive")
    }

    await connectToDatabase()
    
    const submissions = await BulkOutsourcing.find().sort({ createdAt: -1 }).lean()
    const formattedSubmissions = JSON.parse(JSON.stringify(submissions))

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/executive/dashboard" className="p-2 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded-xl transition-all border border-transparent hover:border-black dark:hover:border-white">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight uppercase">
                            <Database className="w-8 h-8" />
                            Bulk Outsourcing
                        </h1>
                        <p className="text-gray-500 dark:text-white/40 mt-1 font-medium italic text-sm">Oversight of large-scale vehicle data acquisition from B2B partners.</p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20 border-b border-gray-100 dark:border-white/10">
                            <tr>
                                <th className="px-6 py-4">Partner Entity</th>
                                <th className="px-6 py-4">Payload Volume</th>
                                <th className="px-6 py-4">Submission Date</th>
                                <th className="px-6 py-4">Operational Status</th>
                                <th className="px-6 py-4 text-right">Analytical View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {formattedSubmissions.map((item: any) => (
                                <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white">{item.partnerName}</span>
                                            <span className="text-[10px] font-medium text-gray-500 dark:text-white/40">{item.partnerEmail}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-black text-gray-900 dark:text-white text-xs">
                                        {item.entries?.length || 0} VEHICLES
                                    </td>
                                    <td className="px-6 py-4 text-[11px] font-medium text-gray-500 dark:text-white/40">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                            item.status === 'approved' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/executive/bulk-outsourcing/${item._id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all">
                                            Examine <ArrowUpRight className="w-3 h-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {formattedSubmissions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 dark:text-white/20 text-xs font-bold uppercase tracking-widest">
                                        No bulk operations currently under observation
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
