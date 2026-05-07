import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import B2BPickup from "@/models/B2BPickup"
import { Construction, Home, LogOut, Truck, Clock, CheckCircle, Package, AlertTriangle } from "lucide-react"
import Link from "next/link"
import ScrapCentreActionBtn from "@/components/ScrapCentreActionBtn"

export const dynamic = "force-dynamic"

export default async function ScrapCentreDashboard() {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "scrapcentre") {
        redirect("/scrapcentre")
    }

    await connectToDatabase()

    // Fetch all pickups accepted by any B2B partner
    const pickups = await B2BPickup.find().sort({ createdAt: -1 }).lean()

    const activePickups = pickups.filter(p => p.status === 'accepted' || p.status === 'scheduled')
    const completedPickups = pickups.filter(p => p.status === 'completed')

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
            {/* Header */}
            <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Package className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-widest text-white">ScrapCentre Hub</h1>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Master Dashboard</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                            {session.user?.name || "Warehouse Manager"}
                        </span>
                        <Link 
                            href="/api/auth/signout?callbackUrl=/scrapcentre" 
                            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-red-400"
                        >
                            <LogOut className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Truck className="w-16 h-16 text-blue-400" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">Total Network Pickups</p>
                        <p className="text-4xl font-black text-white">{pickups.length}</p>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Clock className="w-16 h-16 text-yellow-400" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">Active / In Progress</p>
                        <p className="text-4xl font-black text-yellow-400">{activePickups.length}</p>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle className="w-16 h-16 text-emerald-400" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">Completed Arrivals</p>
                        <p className="text-4xl font-black text-emerald-400">{completedPickups.length}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-widest text-white">Network Pickups log</h2>
                            <p className="text-xs font-medium text-white/40 mt-1">Live feed of all pickups accepted by B2B partners.</p>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-black/20 text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">B2B Partner</th>
                                    <th className="px-6 py-4">Lead Info</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4 text-right">Date Accepted</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {pickups.map((pickup: any) => (
                                    <tr key={pickup._id.toString()} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            {pickup.status === 'accepted' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    <Truck className="w-3 h-3" /> Scheduled
                                                </span>
                                            ) : pickup.status === 'picked_up' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                    <Package className="w-3 h-3" /> Picked Up
                                                </span>
                                            ) : pickup.status === 'car_scrapped' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">
                                                    <AlertTriangle className="w-3 h-3" /> Scrapped
                                                </span>
                                            ) : pickup.status === 'completed' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    <CheckCircle className="w-3 h-3" /> Arrived
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-slate-800 text-gray-300 border border-slate-700">
                                                    {pickup.status}
                                                </span>
                                            )}
                                            <ScrapCentreActionBtn pickupId={pickup._id.toString()} currentStatus={pickup.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white">{pickup.partnerName}</span>
                                                <span className="text-[10px] font-medium text-white/40">{pickup.partnerId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-emerald-400">{pickup.leadType.toUpperCase()}</span>
                                                <span className="text-[11px] font-medium text-white/60">{pickup.vehicleInfo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white/80">{pickup.city}, {pickup.state}</span>
                                                <span className="text-[10px] font-medium text-white/40">{pickup.pincode}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-[11px] font-medium text-white/40">
                                            {new Date(pickup.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {pickups.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-white/20 text-xs font-bold uppercase tracking-widest">
                                            No pickups in the network yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
