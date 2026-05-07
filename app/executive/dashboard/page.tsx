import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next-auth/next"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import BulkOutsourcing from "@/models/BulkOutsourcing"
import B2BRegistration from "@/models/B2BRegistration"
import ExecutiveDashboardOverview from "@/components/executive/ExecutiveDashboardOverview"

export const dynamic = "force-dynamic"

export default async function ExecutiveDashboardPage() {
    const session = await getServerSession(authOptions)

    // Role Check
    if (!session || (session.user as any).role !== "executive") {
        redirect("/executive")
    }

    let marketFeed: any[] = []
    let outsourcingFeed: any[] = []
    let timelineItems: any[] = []
    let stats = {
        totalApproved: 0,
        totalOutsourcing: 0,
        totalLeadVolume: 0
    }

    try {
        await connectToDatabase()

        // 1. Fetch Full Market Feed
        const [
            allQuotes,
            allSells,
            allExchanges,
            allBuys
        ] = await Promise.all([
            Valuation.find().sort({ createdAt: -1 }).limit(10).lean(),
            SellVehicle.find().sort({ createdAt: -1 }).limit(10).lean(),
            ExchangeVehicle.find().sort({ createdAt: -1 }).limit(10).lean(),
            BuyVehicle.find().sort({ createdAt: -1 }).limit(10).lean(),
        ])

        marketFeed = [
            ...allQuotes.map((item: any) => ({
                ...JSON.parse(JSON.stringify(item)),
                type: 'quote',
                customerName: item.contact?.name || "N/A",
                customerPhone: item.contact?.phone || "N/A",
                vehicleInfo: `${item.year} ${item.brand} ${item.model}`
            })),
            ...allSells.map((item: any) => ({
                ...JSON.parse(JSON.stringify(item)),
                type: 'sell',
                customerName: item.name || "N/A",
                customerPhone: item.phone || "N/A",
                vehicleInfo: `${item.registrationYear} ${item.brand} ${item.model}`
            })),
            ...allExchanges.map((item: any) => ({
                ...JSON.parse(JSON.stringify(item)),
                type: 'exchange',
                customerName: item.customerName || "N/A",
                customerPhone: item.customerPhone || "N/A",
                vehicleInfo: `Exchange: ${item.oldVehicleBrand} -> ${item.newVehicleBrand}`
            })),
            ...allBuys.map((item: any) => ({
                ...JSON.parse(JSON.stringify(item)),
                type: 'buy',
                customerName: item.customerName || "N/A",
                customerPhone: item.customerPhone || "N/A",
                vehicleInfo: `Buying: ${item.vehicleBrand} ${item.vehicleModel}`
            }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)

        // 2. Fetch Outsourcing Feed
        const outsourcingRes = await BulkOutsourcing.find().sort({ createdAt: -1 }).limit(10).lean()
        outsourcingFeed = JSON.parse(JSON.stringify(outsourcingRes))

        // 3. Stats
        const [
            countQuotes,
            countSells,
            countExchanges,
            countBuys,
            countOutsourcing
        ] = await Promise.all([
            Valuation.countDocuments({ status: 'approved' }),
            SellVehicle.countDocuments({ status: 'approved' }),
            ExchangeVehicle.countDocuments({ status: 'approved' }),
            BuyVehicle.countDocuments({ status: 'approved' }),
            BulkOutsourcing.countDocuments()
        ])

        stats.totalApproved = countQuotes + countSells + countExchanges + countBuys
        stats.totalOutsourcing = countOutsourcing
        stats.totalLeadVolume = await Promise.all([
            Valuation.countDocuments(),
            SellVehicle.countDocuments(),
            ExchangeVehicle.countDocuments(),
            BuyVehicle.countDocuments()
        ]).then(counts => counts.reduce((a, b) => a + b, 0))

        // 4. Activity Timeline
        // Combine recent submissions and status changes
        const [
            recentQuotes,
            recentB2B,
            recentOutsourcing
        ] = await Promise.all([
            Valuation.find().sort({ createdAt: -1 }).limit(5).lean(),
            B2BRegistration.find().sort({ createdAt: -1 }).limit(5).lean(),
            BulkOutsourcing.find().sort({ createdAt: -1 }).limit(5).lean()
        ])

        timelineItems = [
            ...recentQuotes.map((item: any) => ({
                action: "New Valuation Request",
                description: `${item.contact?.name || 'A customer'} requested a quote for a ${item.brand} ${item.model}.`,
                timestamp: item.createdAt
            })),
            ...recentB2B.map((item: any) => ({
                action: "Partner Registration",
                description: `${item.businessName} applied for B2B partnership.`,
                timestamp: item.createdAt
            })),
            ...recentOutsourcing.map((item: any) => ({
                action: "Bulk Outsourcing",
                description: `${item.partnerName} submitted a bulk data set of ${item.entries?.length || 0} vehicles.`,
                timestamp: item.createdAt
            }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15)

    } catch (error: any) {
        console.error("Error fetching executive dashboard data:", error)
        // If it's a critical error (like DB connection), we want to show the error page
        if (error.message?.includes('connect') || error.name === 'MongooseError') {
            throw new Error("Critical System Failure: Unable to establish secure link to database.")
        }
    }

    return (
        <ExecutiveDashboardOverview
            marketFeed={marketFeed}
            outsourcingFeed={outsourcingFeed}
            timelineItems={timelineItems}
            stats={stats}
        />
    )
}
