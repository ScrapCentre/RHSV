import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import B2BPickup from "@/models/B2BPickup"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"
import { 
    Construction, 
    Home, 
    LogOut, 
    Truck, 
    Clock, 
    CheckCircle, 
    Package, 
    AlertTriangle, 
    FileText, 
    Sparkles, 
    ChevronRight,
    ArrowUpRight,
    User,
    Phone
} from "lucide-react"
import Link from "next/link"
import ScrapCentreActionBtn from "@/components/ScrapCentreActionBtn"

export const dynamic = "force-dynamic"

export default async function ScrapCentreDashboard() {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "scrapcentre") {
        redirect("/scrapcentre")
    }

    await connectToDatabase()

    // 1. Fetch all B2B Pickups
    const pickups = await B2BPickup.find().sort({ createdAt: -1 }).lean()

    const activePickups = pickups.filter(p => p.status === 'accepted' || p.status === 'scheduled' || p.status === 'picked_up')
    const completedPickups = pickups.filter(p => p.status === 'completed' || p.status === 'car_scrapped')

    // 2. Fetch approved requests from all collections
    const [
        approvedQuotes,
        approvedSells,
        approvedExchanges,
        approvedBuys,
        approvedWizards
    ] = await Promise.all([
        Valuation.find({ status: { $in: ['approved', 'pickup_scheduled', 'reached_collection_centre', 'car_scrapped'] } }).sort({ createdAt: -1 }).lean(),
        SellVehicle.find({ status: { $in: ['approved', 'pickup_scheduled', 'reached_collection_centre', 'car_scrapped'] } }).sort({ createdAt: -1 }).lean(),
        ExchangeVehicle.find({ status: { $in: ['approved', 'pickup_scheduled', 'reached_collection_centre', 'car_scrapped'] } }).sort({ createdAt: -1 }).lean(),
        BuyVehicle.find({ status: { $in: ['approved', 'pickup_scheduled', 'reached_collection_centre', 'car_scrapped'] } }).sort({ createdAt: -1 }).lean(),
        WizardLead.find({ status: { $in: ['approved', 'pickup_scheduled', 'reached_collection_centre', 'car_scrapped'] } }).sort({ createdAt: -1 }).lean(),
    ])

    const allApproved = [
        ...approvedQuotes.map((item: any) => ({
            ...JSON.parse(JSON.stringify(item)),
            type: 'quote',
            typeName: 'Free Quote',
            customerName: item.contact?.name || "N/A",
            customerPhone: item.contact?.phone || "N/A",
            vehicleInfo: `${item.year || 'N/A'} ${item.brand || 'Unknown'} ${item.model || ''}`,
            color: 'blue'
        })),
        ...approvedSells.map((item: any) => ({
            ...JSON.parse(JSON.stringify(item)),
            type: 'sell',
            typeName: 'Sell',
            customerName: item.name || "N/A",
            customerPhone: item.phone || "N/A",
            vehicleInfo: `${item.registrationYear || 'N/A'} ${item.brand || 'Unknown'} ${item.model || ''}`,
            color: 'green'
        })),
        ...approvedExchanges.map((item: any) => ({
            ...JSON.parse(JSON.stringify(item)),
            type: 'exchange',
            typeName: 'Exchange',
            customerName: item.customerName || "N/A",
            customerPhone: item.customerPhone || "N/A",
            vehicleInfo: `Exchange: ${item.oldVehicleBrand || ''} -> ${item.newVehicleBrand || ''}`,
            color: 'purple'
        })),
        ...approvedBuys.map((item: any) => ({
            ...JSON.parse(JSON.stringify(item)),
            type: 'buy',
            typeName: 'Buy',
            customerName: item.customerName || "N/A",
            customerPhone: item.customerPhone || "N/A",
            vehicleInfo: `Buying: ${item.vehicleBrand || ''} ${item.vehicleModel || ''}`,
            color: 'orange'
        })),
        ...approvedWizards.map((item: any) => {
            const plain = JSON.parse(JSON.stringify(item));
            const serviceType = plain.serviceType || plain.type || "wizard";
            let linkType = serviceType;
            let typeName = 'Scrap';
            let color = 'blue';
            if (serviceType === "scrap") {
                linkType = "quote";
                typeName = 'Scrap';
                color = 'blue';
            }
            if (serviceType === "wizard-sell" || serviceType === "sell") {
                linkType = "sell";
                typeName = 'Sell';
                color = 'green';
            }
            if (serviceType === "wizard-buy" || serviceType === "buy") {
                linkType = "buy";
                typeName = 'Buy';
                color = 'orange';
            }
            
            let vehicleInfo = "N/A";
            if (serviceType === "buy" || serviceType === "wizard-buy") {
                vehicleInfo = `Buying: ${plain.desiredCompany || plain.vehicleBrand || ''} ${plain.desiredModel || plain.vehicleModel || ''}`;
            } else {
                vehicleInfo = `${plain.year || plain.registrationYear || 'N/A'} ${plain.brand || plain.desiredCompany || 'Unknown'} ${plain.model || plain.desiredModel || ''}`;
            }

            return {
                ...plain,
                type: linkType,
                typeName: typeName,
                originalType: serviceType,
                customerName: plain.name || plain.customerName || "N/A",
                customerPhone: plain.phone || plain.customerPhone || "N/A",
                vehicleInfo: vehicleInfo.trim(),
                color: color
            }
        })
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative overflow-hidden">
            {/* Background Ambient Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none -z-10" />

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

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-12">
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Truck className="w-16 h-16 text-blue-400" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">Total Network Pickups</p>
                        <p className="text-4xl font-black text-white">{pickups.length}</p>
                    </div>
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)] hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Clock className="w-16 h-16 text-yellow-400" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">Active / In Progress</p>
                        <p className="text-4xl font-black text-yellow-400">{activePickups.length}</p>
                    </div>
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle className="w-16 h-16 text-emerald-400" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">Completed Arrivals</p>
                        <p className="text-4xl font-black text-emerald-400">{completedPickups.length}</p>
                    </div>
                </div>

                {/* 1. Approved Requests Feed Section */}
                <div className="bg-[#0E192D] rounded-2xl border border-slate-800 overflow-hidden shadow-sm relative">
                    <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                        <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            Approved Requests Feed
                        </h2>
                    </div>

                    {/* Desktop View (Table) */}
                    <div className="hidden md:block overflow-hidden">
                        <table className="w-full text-left text-sm table-fixed">
                            <thead className="bg-slate-900/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-800">
                                <tr>
                                    <th className="px-3 py-3 w-[12%]">Type</th>
                                    <th className="px-3 py-3 w-[18%]">Principal Entity</th>
                                    <th className="px-3 py-3 w-[25%]">Vehicle Info</th>
                                    <th className="px-3 py-3 w-[15%]">Status</th>
                                    <th className="px-3 py-3 w-[15%]">Approved On</th>
                                    <th className="px-3 py-3 w-[15%] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {allApproved.map((item: any, index: number) => {
                                    // Find matching pickup in case b2bPickupId wasn't populated or persisted
                                    const matchingPickup = pickups.find(p => p.leadId === item._id.toString())
                                    const resolvedPickupId = matchingPickup?._id?.toString() || item.b2bPickupId?.toString()

                                    return (
                                        <tr key={`${item.type}-${item._id}`} className={`transition-all duration-300 group hover:scale-[1.01] hover:shadow-lg relative z-0 hover:z-10 cursor-default ${index % 2 === 0 ? 'bg-[#0E192D]' : 'bg-slate-800/40'} hover:bg-slate-800/70`}>
                                            <td className="px-3 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>
                                                    {item.typeName}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex flex-col overflow-hidden w-full">
                                                    <span className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{item.customerName}</span>
                                                    <span className="text-[10px] font-medium text-white/40 truncate">{item.customerPhone}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-[13px] font-medium text-white/70 truncate">
                                                {item.vehicleInfo}
                                            </td>
                                            <td className="px-3 py-3">
                                                {item.status === 'pickup_scheduled' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                        Pickup Scheduled
                                                    </span>
                                                ) : item.status === 'reached_collection_centre' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                        Picked Up Successfully
                                                    </span>
                                                ) : item.status === 'car_scrapped' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">
                                                        Scrapped Successfully
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        Approved
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-[11px] font-medium text-white/40 truncate">
                                                {new Date(item.updatedAt || item.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <div className="flex justify-end">
                                                    {item.status === 'reached_collection_centre' && resolvedPickupId && (
                                                        <ScrapCentreActionBtn 
                                                            pickupId={resolvedPickupId} 
                                                            currentStatus="picked_up" 
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {allApproved.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-3 py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                                            No approved requests identified
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View (Cards) */}
                    <div className="md:hidden p-4 space-y-4 bg-slate-900/20">
                        {allApproved.length === 0 ? (
                            <div className="px-6 py-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest bg-[#0E192D] rounded-xl border border-slate-800">
                                No approved requests identified
                            </div>
                        ) : (
                            allApproved.map((item: any, index: number) => {
                                const matchingPickup = pickups.find(p => p.leadId === item._id.toString())
                                const resolvedPickupId = matchingPickup?._id?.toString() || item.b2bPickupId?.toString()

                                return (
                                    <div key={`${item.type}-${item._id}`} className={`rounded-xl border border-slate-800 shadow-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-slate-700 active:scale-[0.98] ${index % 2 === 0 ? 'bg-[#0E192D]' : 'bg-slate-800/40'}`}>
                                        <div className="p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                                    {item.typeName}
                                                </span>
                                                <p className="text-[11px] text-white/40 font-medium">
                                                    {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Details</p>
                                                <p className="text-sm font-bold text-white leading-snug line-clamp-2">
                                                    {item.vehicleInfo}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                                                <div className="flex flex-col">
                                                    <p className="text-[13px] font-bold text-white">{item.customerName}</p>
                                                    <p className="text-[10px] font-mono text-white/40">{item.customerPhone}</p>
                                                </div>
                                                <div>
                                                    {item.status === 'pickup_scheduled' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                            Pickup Scheduled
                                                        </span>
                                                    ) : item.status === 'reached_collection_centre' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                            Picked Up Successfully
                                                        </span>
                                                    ) : item.status === 'car_scrapped' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">
                                                            Scrapped Successfully
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                            Approved
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {item.status === 'reached_collection_centre' && resolvedPickupId && (
                                                <div className="pt-2 border-t border-slate-800/50 flex justify-end">
                                                    <ScrapCentreActionBtn 
                                                        pickupId={resolvedPickupId} 
                                                        currentStatus="picked_up" 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* 2. Network Pickups Log Section */}
                <div className="bg-[#0E192D] rounded-2xl border border-slate-800 overflow-hidden shadow-sm relative">
                    <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                        <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            Network Pickups log
                        </h2>
                    </div>
                    
                    {/* Desktop View (Table) */}
                    <div className="hidden md:block overflow-hidden">
                        <table className="w-full text-left text-sm table-fixed">
                            <thead className="bg-slate-900/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-800">
                                <tr>
                                    <th className="px-3 py-3 w-[15%]">Status</th>
                                    <th className="px-3 py-3 w-[20%]">B2B Partner</th>
                                    <th className="px-3 py-3 w-[25%]">Lead Info</th>
                                    <th className="px-3 py-3 w-[15%]">Location</th>
                                    <th className="px-3 py-3 w-[10%]">Date</th>
                                    <th className="px-3 py-3 w-[15%] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {pickups.map((pickup: any, index: number) => (
                                    <tr key={pickup._id.toString()} className={`transition-all duration-300 group hover:scale-[1.01] hover:shadow-lg relative z-0 hover:z-10 cursor-default ${index % 2 === 0 ? 'bg-[#0E192D]' : 'bg-slate-800/40'} hover:bg-slate-800/70`}>
                                        <td className="px-3 py-3">
                                            {pickup.status === 'accepted' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 max-w-full truncate">
                                                    <Truck className="w-3 h-3 shrink-0" /> <span className="truncate">Scheduled</span>
                                                </span>
                                            ) : pickup.status === 'picked_up' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 max-w-full truncate">
                                                    <Package className="w-3 h-3 shrink-0" /> <span className="truncate">Picked Up</span>
                                                </span>
                                            ) : pickup.status === 'car_scrapped' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 max-w-full truncate">
                                                    <AlertTriangle className="w-3 h-3 shrink-0" /> <span className="truncate">Scrapped Successfully</span>
                                                </span>
                                            ) : pickup.status === 'completed' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 max-w-full truncate">
                                                    <CheckCircle className="w-3 h-3 shrink-0" /> <span className="truncate">Arrived</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-slate-800 text-gray-300 border border-slate-700 max-w-full truncate">
                                                    <span className="truncate">{pickup.status}</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex flex-col overflow-hidden w-full">
                                                <span className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{pickup.partnerName}</span>
                                                <span className="text-[10px] font-medium text-white/40 truncate">{pickup.partnerId}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-[13px] font-medium text-white/70 truncate">
                                            {pickup.leadType.toUpperCase()} - {pickup.vehicleInfo}
                                        </td>
                                        <td className="px-3 py-3 text-[12px] font-medium text-white/60 truncate">
                                            {pickup.city}, {pickup.state}
                                        </td>
                                        <td className="px-3 py-3 text-[11px] font-medium text-white/40 truncate">
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
                                        <td colSpan={6} className="px-3 py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                                            No pickups in the network yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View (Cards) */}
                    <div className="md:hidden p-4 space-y-4 bg-slate-900/20">
                        {pickups.length === 0 ? (
                            <div className="px-6 py-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest bg-[#0E192D] rounded-xl border border-slate-800">
                                No pickups in the network yet
                            </div>
                        ) : (
                            pickups.map((pickup: any, index: number) => (
                                <div key={pickup._id.toString()} className={`rounded-xl border border-slate-800 shadow-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-slate-700 active:scale-[0.98] ${index % 2 === 0 ? 'bg-[#0E192D]' : 'bg-slate-800/40'}`}>
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            {pickup.status === 'accepted' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    Scheduled
                                                </span>
                                            ) : pickup.status === 'picked_up' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                    Picked Up
                                                </span>
                                            ) : pickup.status === 'car_scrapped' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                                                    Scrapped Successfully
                                                </span>
                                            ) : pickup.status === 'completed' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    Arrived
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-gray-300 border border-slate-700">
                                                    {pickup.status}
                                                </span>
                                            )}
                                            <p className="text-[11px] text-white/40 font-medium">
                                                {new Date(pickup.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Lead Info</p>
                                            <p className="text-sm font-bold text-white leading-snug line-clamp-2">
                                                {pickup.leadType.toUpperCase()} - {pickup.vehicleInfo}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                                            <div className="flex flex-col">
                                                <p className="text-[13px] font-bold text-white">{pickup.partnerName}</p>
                                                <p className="text-[10px] font-mono text-white/40">{pickup.city}, {pickup.state}</p>
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
            </main>
        </div>
    )
}
