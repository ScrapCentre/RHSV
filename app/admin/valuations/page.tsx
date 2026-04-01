import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import { Shield, Clock, CheckCircle, Smartphone, MapPin, Car, Calendar, DollarSign, ChevronLeft, FileText } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ValuationsPage() {
    const session = await getServerSession(authOptions)

    // Role Check
    if (!session || (session.user as any).role !== "admin") {
        redirect("/")
    }

    let valuations = []
    let error = null

    try {
        await connectToDatabase()
        // Fetch Valuations sorted by newest
        valuations = await Valuation.find({}).sort({ createdAt: -1 })
    } catch (e) {
        console.error("Valuations Page Error:", e)
        error = "Failed to load valuation data. Please try again later."
    }

    if (error) {
        return (
            <div className="flex items-center justify-center pt-8 px-4">
                <div className="text-center space-y-4">
                    <p className="text-red-500 font-semibold">{error}</p>
                    <Link href="/admin" className="text-blue-600 hover:underline">Return to Dashboard</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header with Back Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <Link href="/admin" className="inline-flex items-center text-gray-500 hover:text-orange-600 mb-2 transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FileText className="w-8 h-8 text-orange-600" />
                        Recent Valuations
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-2">Manage all vehicle valuation requests.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-[#0E192D] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 dark:text-slate-400 font-medium">Total Requests</h3>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Car className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{valuations.length}</p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                        <span className="bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-xs font-semibold">+12%</span>
                        <span className="text-gray-400 dark:text-slate-500">vs last month</span>
                    </p>
                </div>

                <div className="bg-white dark:bg-[#0E192D] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 dark:text-slate-400 font-medium">Pending Actions</h3>
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {valuations.filter((v: any) => v.status === "pending").length}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Needs attention</p>
                </div>

                <div className="bg-white dark:bg-[#0E192D] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 dark:text-slate-400 font-medium">Completed</h3>
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {valuations.filter((v: any) => v.status === "completed").length}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Successfully processed</p>
                </div>

                <div className="bg-white dark:bg-[#0E192D] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 dark:text-slate-400 font-medium">Total Weight</h3>
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {valuations.reduce((acc: number, val: any) => acc + (parseFloat(val.vehicleWeight) || 0), 0).toFixed(1)}T
                    </p>
                    <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">processed so far</p>
                </div>
            </div>

            {/* Valuations List */}
            <div className="space-y-6">
                {valuations.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-[#0E192D] rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                        <p className="text-gray-400 dark:text-slate-500">No valuation requests found.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {valuations.map((val: any) => (
                            <div key={val._id} className="bg-white dark:bg-[#0E192D] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                                <div className="flex flex-col lg:flex-row justify-between gap-6">
                                    {/* Vehicle Details */}
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 mb-2">
                                                    {val.vehicleType}
                                                </span>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {val.brand} {val.model} <span className="text-gray-400 dark:text-slate-500 font-normal">({val.year})</span>
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mt-1">
                                                    <span className="font-mono bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-gray-700 dark:text-slate-300">{val.vehicleNumber}</span>
                                                    <span>•</span>
                                                    <span>{val.vehicleWeight} Tons</span>
                                                </div>
                                            </div>
                                            <div className="lg:hidden">
                                                {getStatusBadge(val.status)}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
                                                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-500">
                                                    <Smartphone className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{val.contact?.name}</p>
                                                    <p>{val.contact?.phone}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
                                                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-500">
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">Pincode: {val.address?.pincode}</p>
                                                    <p className="text-xs text-gray-400 dark:text-slate-500">Submitted {new Date(val.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions / Status */}
                                    <div className="flex flex-col justify-between items-end gap-4 min-w-[140px]">
                                        <div className="hidden lg:block">
                                            {getStatusBadge(val.status)}
                                        </div>
                                        <button className="w-full lg:w-auto px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function getStatusBadge(status: string) {
    switch (status) {
        case "pending":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50">
                    <Clock className="w-3.5 h-3.5" /> Pending
                </span>
            )
        case "reviewed":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                    <Calendar className="w-3.5 h-3.5" /> Reviewed
                </span>
            )
        case "completed":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-900/50">
                    <CheckCircle className="w-3.5 h-3.5" /> Completed
                </span>
            )
        default:
            return <span className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-xs">{status}</span>
    }
}

