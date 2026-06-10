import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import mongoose from "mongoose"
import B2BPickup from "@/models/B2BPickup"
import PersonalUnlockedLead from "@/models/PersonalUnlockedLead"
import { Plus_Jakarta_Sans } from "next/font/google"
import { 
    Home, 
    LogOut, 
    Truck, 
    Clock, 
    CheckCircle, 
    Package, 
    AlertTriangle, 
    FileText, 
    ChevronRight,
    ArrowUpRight,
    User,
    Phone
} from "lucide-react"
import Link from "next/link"
import ScrapCentreActionBtn from "@/components/ScrapCentreActionBtn"
import PersonalScrapCentreActionBtn from "@/components/PersonalScrapCentreActionBtn"
import StatusPipeline from "@/components/StatusPipeline"

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
})

export const dynamic = "force-dynamic"

export default async function ScrapCentreDashboard() {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "scrapcentre") {
        redirect("/scrapcentre")
    }

    await connectToDatabase()

    // Fetch all claimed personal leads to get their leadIds
    const claimedPersonalLeads = await PersonalUnlockedLead.find().select("leadId").lean()
    const claimedLeadIds = claimedPersonalLeads.map((l: any) => l.leadId)
    // 1. Fetch B2B Pickups corresponding only to personal claimed leads
    const pickups = await B2BPickup.find({ leadId: { $in: claimedLeadIds } }).sort({ createdAt: -1 }).lean()

    const personalLeads = await PersonalUnlockedLead.find({
        status: { $in: ["assigned_to_cc", "vehicle_picked_up", "scraped_successfully"] }
    }).sort({ updatedAt: -1 }).lean() as any[]

    const activePickups = pickups.filter(p => p.status === 'accepted' || p.status === 'scheduled' || p.status === 'picked_up')
    const completedPickups = pickups.filter(p => p.status === 'completed' || p.status === 'car_scrapped')

    return (
        <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col ${plusJakartaSans.className}`}>
            
            {/* Header */}
            <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-50 rounded-xl border border-red-100">
                            <Package className="w-5 h-5 text-[#E31E24]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-widest text-slate-900">ScrapCentre Hub</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Dashboard</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-[#E31E24] bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                            {session.user?.name || "Warehouse Manager"}
                        </span>
                        <Link 
                            href="/api/auth/signout?callbackUrl=/scrapcentre" 
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-[#E31E24]"
                        >
                            <LogOut className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-12">
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-[#E31E24]/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Truck className="w-16 h-16 text-[#E31E24]" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Total Network Pickups</p>
                        <p className="text-4xl font-black text-slate-900">{pickups.length}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-[#E31E24]/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Clock className="w-16 h-16 text-[#E31E24]" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Active / In Progress</p>
                        <p className="text-4xl font-black text-[#E31E24]">{activePickups.length}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-[#E31E24]/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle className="w-16 h-16 text-emerald-500" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Completed Arrivals</p>
                        <p className="text-4xl font-black text-emerald-500">{completedPickups.length}</p>
                    </div>
                </div>



                {/* 2. Network Pickups Log Section */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative">
                    <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#E31E24]" />
                            Network Pickups log
                        </h2>
                    </div>
                    
                    {/* Desktop View (Table) */}
                    <div className="hidden md:block overflow-hidden">
                        <table className="w-full text-left text-sm table-fixed">
                            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-3 py-3 w-[15%]">Status</th>
                                    <th className="px-3 py-3 w-[20%]">B2B Partner</th>
                                    <th className="px-3 py-3 w-[25%]">Lead Info</th>
                                    <th className="px-3 py-3 w-[15%]">Location</th>
                                    <th className="px-3 py-3 w-[10%]">Date</th>
                                    <th className="px-3 py-3 w-[15%] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {pickups.map((pickup: any, index: number) => (
                                    <tr key={pickup._id.toString()} className={`transition-all duration-300 group hover:scale-[1.01] hover:shadow-lg relative z-0 hover:z-10 cursor-default ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-slate-100`}>
                                        <td className="px-3 py-3">
                                            {pickup.status === 'accepted' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 max-w-full truncate">
                                                    <Truck className="w-3 h-3 shrink-0" /> <span className="truncate">Scheduled</span>
                                                </span>
                                            ) : pickup.status === 'picked_up' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-purple-50 text-purple-600 border border-purple-100 max-w-full truncate">
                                                    <Package className="w-3 h-3 shrink-0" /> <span className="truncate">Picked Up</span>
                                                </span>
                                            ) : pickup.status === 'car_scrapped' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-red-50 text-[#E31E24] border border-red-100 max-w-full truncate">
                                                    <AlertTriangle className="w-3 h-3 shrink-0" /> <span className="truncate">Scrapped</span>
                                                </span>
                                            ) : pickup.status === 'completed' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 max-w-full truncate">
                                                    <CheckCircle className="w-3 h-3 shrink-0" /> <span className="truncate">Arrived</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200 max-w-full truncate">
                                                    <span className="truncate">{pickup.status}</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex flex-col overflow-hidden w-full">
                                                <span className="font-bold text-slate-900 group-hover:text-[#E31E24] transition-colors truncate">{pickup.partnerName}</span>
                                                <span className="text-[10px] font-medium text-slate-400 truncate">{pickup.partnerId}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-[13px] font-medium text-slate-600 truncate">
                                            {pickup.leadType.toUpperCase()} - {pickup.vehicleInfo}
                                        </td>
                                        <td className="px-3 py-3 text-[12px] font-medium text-slate-505 truncate">
                                            {pickup.city}, {pickup.state}
                                        </td>
                                        <td className="px-3 py-3 text-[11px] font-medium text-slate-400 truncate">
                                            {new Date(pickup.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            <div className="flex justify-end">
                                                <ScrapCentreActionBtn pickupId={pickup._id.toString()} currentStatus={pickup.status} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pickups.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-3 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                            No pickups in the network yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View (Cards) */}
                    <div className="md:hidden p-4 space-y-4 bg-slate-50">
                        {pickups.length === 0 ? (
                            <div className="px-6 py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest bg-white rounded-xl border border-slate-200">
                                No pickups in the network yet
                            </div>
                        ) : (
                            pickups.map((pickup: any, index: number) => (
                                <div key={pickup._id.toString()} className={`rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-slate-300 active:scale-[0.98] ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            {pickup.status === 'accepted' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                                                    Scheduled
                                                </span>
                                            ) : pickup.status === 'picked_up' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-100">
                                                    Picked Up
                                                </span>
                                            ) : pickup.status === 'car_scrapped' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-50 text-[#E31E24] border border-red-100">
                                                    Scrapped
                                                </span>
                                            ) : pickup.status === 'completed' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    Arrived
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                                                    {pickup.status}
                                                </span>
                                            )}
                                            <p className="text-[11px] text-slate-400 font-medium">
                                                {new Date(pickup.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lead Info</p>
                                            <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">
                                                {pickup.leadType.toUpperCase()} - {pickup.vehicleInfo}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                            <div className="flex flex-col">
                                                <p className="text-[13px] font-bold text-slate-800">{pickup.partnerName}</p>
                                                <p className="text-[10px] font-mono text-slate-400">{pickup.city}, {pickup.state}</p>
                                            </div>
                                            <div className="flex items-center">
                                                <ScrapCentreActionBtn pickupId={pickup._id.toString()} currentStatus={pickup.status} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 3. Personal Partner Leads Section */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative">
                    <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                            <Package className="w-4 h-4 text-[#E31E24]" />
                            Personal Partner Leads Feed
                        </h2>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                            {personalLeads.length} Leads
                        </span>
                    </div>

                    <div className="p-6">
                        {personalLeads.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                No personal partner leads at assignment stage yet
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {personalLeads.map((lead: any) => (
                                    <div key={lead._id.toString()} className="border border-slate-200 hover:border-slate-350 rounded-xl p-5 flex flex-col justify-between bg-white shadow-sm hover:shadow transition-all duration-300">
                                        <div className="space-y-4">
                                            {/* Visual pipeline */}
                                            <StatusPipeline status={lead.status} />

                                            <div>
                                                <h3 className="font-extrabold text-slate-800 text-sm leading-snug">
                                                    {lead.vehicleInfo || "Vehicle Details"}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2 font-medium">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>Claimed: {new Date(lead.unlockedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {/* Customer Details */}
                                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1.5 text-xs text-slate-650">
                                                <p className="font-bold text-slate-800 pb-1 border-b border-slate-200/50 flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-[#E31E24] shrink-0" />
                                                    {lead.customerName || "Customer Info"}
                                                </p>
                                                <p className="font-medium truncate">Email: {lead.customerEmail || "N/A"}</p>
                                                <p className="font-medium">Phone: <span className="font-mono">{lead.customerPhone || "N/A"}</span></p>
                                            </div>

                                            {/* Assigned CC Info */}
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">Assigned Center</span>
                                                    <span className="text-xs font-bold text-slate-800">{lead.assignedCcName || "CC"}</span>
                                                </div>
                                                <PersonalScrapCentreActionBtn leadId={lead._id.toString()} currentStatus={lead.status} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
