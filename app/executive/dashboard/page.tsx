import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"
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
    let timelineItems: any[] = []
    const stats = {
        totalApproved: 0,
        totalLeadVolume: 0
    }

    try {
        await connectToDatabase()

        // 1. Fetch Full Market Feed
        const [
            allExchanges,
            allBuys,
            allWizardLeads
        ] = await Promise.all([
            ExchangeVehicle.find().sort({ createdAt: -1 }).limit(10).lean(),
            BuyVehicle.find().sort({ createdAt: -1 }).limit(10).lean(),
            WizardLead.find().sort({ createdAt: -1 }).limit(10).lean(),
        ])

        marketFeed = [

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
            })),
            ...allWizardLeads.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                let vehicleInfoStr = "";
                if (item.serviceType === "buy") {
                    vehicleInfoStr = `Looking for: ${item.desiredCompany || ''} ${item.desiredModel || ''}`;
                } else if (item.serviceType === "scrap" && item.category === "scrap_and_buy") {
                    vehicleInfoStr = `Scrap: ${item.brand || ''} ${item.model || ''} | Buy: ${item.desiredCompany || ''} ${item.desiredModel || ''}`;
                } else {
                    vehicleInfoStr = `${item.year || ''} ${item.brand || ''} ${item.model || ''}`;
                }
                let resolvedType: string;
                if (item.serviceType === 'scrap' && item.category === 'scrap_and_buy') {
                    resolvedType = 'scrap-buy';
                } else if (item.serviceType === 'scrap') {
                    resolvedType = 'quote';
                } else {
                    resolvedType = item.serviceType;
                }
                return {
                    ...plainItem,
                    type: resolvedType,
                    customerName: item.name || "N/A",
                    customerPhone: item.phone || "N/A",
                    vehicleInfo: vehicleInfoStr
                };
            })
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 15)



        // 2. Stats
        const [
            countExchanges,
            countBuys,
            countWizard
        ] = await Promise.all([
            ExchangeVehicle.countDocuments({ status: 'approved' }),
            BuyVehicle.countDocuments({ status: 'approved' }),
            WizardLead.countDocuments({ status: 'approved' }),
        ])

        stats.totalApproved = countExchanges + countBuys + countWizard
        stats.totalLeadVolume = await Promise.all([
            ExchangeVehicle.countDocuments(),
            BuyVehicle.countDocuments(),
            WizardLead.countDocuments()
        ]).then(counts => counts.reduce((a, b) => a + b, 0))

        // 3. Activity Timeline
        // Combine recent submissions and status changes
        const [
            recentB2B
        ] = await Promise.all([
            B2BRegistration.find().sort({ createdAt: -1 }).limit(5).lean()
        ])

        timelineItems = [
            ...recentB2B.map((item: any) => ({
                action: "Partner Registration",
                description: `${item.businessName} applied for B2B partnership.`,
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
            timelineItems={timelineItems}
            stats={stats}
        />
    )
}
