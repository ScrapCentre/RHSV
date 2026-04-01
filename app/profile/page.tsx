import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import B2BRegistration from "@/models/B2BRegistration"
import B2BPartner from "@/models/B2BPartner"
import Setting from "@/models/Setting"
import { User, Package, Clock, Calendar, CheckCircle, Car, Building2, AlertCircle, RefreshCw, ShoppingCart, Tag } from "lucide-react"
import Link from "next/link"
import UserRequestList from "@/components/UserRequestList"
import mongoose from "mongoose"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    // Check for Partner Role
    if ((session.user as any).role === "partner") {
        redirect("/b2b") // Redirect partners to their dedicated marketplace
    }

    // Standard User Logic
    await connectToDatabase()
    const userId = (session.user as any).id

    let allRequests: any[] = []
    let registration: any = null
    let partner: any = null
    let error: boolean = false

    try {
        // Fetch all types of requests for this user
        // Using $or to match userId as either String or ObjectId for maximum compatibility
        const query = {
            $or: [
                { userId: userId },
                { userId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null }
            ].filter(q => q.userId !== null)
        }

        const [valuations, sellRequests, exchangeRequests, buyRequests, latestRegistration, existingPartner, scrapSetting] = await Promise.all([
            Valuation.find(query).sort({ createdAt: -1 }),
            SellVehicle.find(query).sort({ createdAt: -1 }),
            ExchangeVehicle.find(query).sort({ createdAt: -1 }),
            BuyVehicle.find(query).sort({ createdAt: -1 }),
            B2BRegistration.findOne({ userId }).sort({ createdAt: -1 }),
            B2BPartner.findOne({ originalUserId: userId }),
            Setting.findOne({ key: "scrapPricePerKg" })
        ])

        const scrapPricePerKg = scrapSetting ? scrapSetting.value : 25

        // Merge and add types for identification
        allRequests = [
            ...valuations.map(v => {
                const obj = v.toObject()
                // Backfill estimatedValue if missing
                if (obj.estimatedValue == null && obj.vehicleWeight) {
                    const weightInTons = parseFloat(obj.vehicleWeight) || 0
                    obj.estimatedValue = weightInTons * 1000 * scrapPricePerKg
                }
                return { ...obj, type: 'valuation' }
            }),
            ...sellRequests.map(s => ({ ...s.toObject(), type: 'sell' })),
            ...exchangeRequests.map(e => ({ ...e.toObject(), type: 'exchange' })),
            ...buyRequests.map(b => ({ ...b.toObject(), type: 'buy' })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        registration = latestRegistration
        partner = existingPartner
    } catch (e) {
        console.error("Profile Data Fetch Error:", e)
        error = true
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-32 pb-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header specifically matching Admin Dashboard style */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            My Profile
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your requests and account settings.</p>
                    </div>
                </div>
                {error ? (
                    <div className="bg-[#0E192D] rounded-2xl p-12 shadow-md shadow-black/20 border border-red-900/30 text-center space-y-6">
                        <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mx-auto">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Oops! Something went wrong</h1>
                            <p className="text-gray-400 mt-2">We couldn't load your profile information. Please try refreshing the page.</p>
                        </div>
                        <Link
                            href="/profile"
                            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                        >
                            <RefreshCw className="mr-2 h-5 w-5" /> Retry Now
                        </Link>
                    </div>
                ) : (
                    <>

                        {/* User Card - Refined to match Admin Cards */}
                        <div className="bg-white dark:bg-[#0E192D] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-6 transition-all">
                            <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-500">
                                <User className="w-10 h-10" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{session.user?.name === "Novalytix Admin" ? "Admin" : session.user?.name}</h1>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">{session.user?.email}</p>
                                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-slate-700 uppercase tracking-wide">
                                    {allRequests.length} Total Requests
                                </div>
                            </div>
                        </div>

                        {/* B2B Status Section - Refined */}
                        <div className="bg-white dark:bg-[#0E192D] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 space-y-6 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-500">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">B2B Partner Status</h2>
                                </div>
                            </div>

                            {partner ? (
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white dark:bg-green-900/20 rounded-lg shadow-sm">
                                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-green-900 dark:text-green-400">Verified Partner</p>
                                            <p className="text-sm text-green-700 dark:text-green-300">{partner.businessName} (ID: {partner.userId})</p>
                                        </div>
                                    </div>
                                </div>
                            ) : registration ? (
                                <div className={`p-4 rounded-xl border flex items-center justify-between ${registration.status === 'pending'
                                        ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/30'
                                        : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white dark:bg-slate-900/40 rounded-lg shadow-sm">
                                            {registration.status === 'pending' ? (
                                                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`font-bold capitalize ${registration.status === 'pending' ? 'text-yellow-900 dark:text-yellow-400' : 'text-red-900 dark:text-red-400'
                                                }`}>Registration {registration.status}</p>
                                            {registration.status === 'pending' && (
                                                <p className="text-sm text-yellow-700 dark:text-yellow-300">We'll notify you once our team reviews your application.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>) : (
                                <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">Want to become a B2B partner and access our marketplace?</p>
                                    <Link
                                        href="/b2b-register"
                                        className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5"
                                    >
                                        Register Now
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* History */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-500">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Request History</h2>
                            </div>

                            {allRequests.length === 0 ? (
                                <div className="bg-[#0E192D] rounded-xl p-8 text-center border border-dashed border-slate-700">
                                    <Package className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                    <p className="text-gray-400">You haven't submitted any requests yet.</p>
                                    <Link href="/" className="inline-block mt-4 text-orange-500 font-semibold hover:text-orange-400 hover:underline">
                                        Get Started
                                    </Link>
                                </div>
                            ) : (
                                <UserRequestList requests={JSON.parse(JSON.stringify(allRequests))} />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

