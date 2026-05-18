import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import B2BRegistration from "@/models/B2BRegistration"
import B2BPartner from "@/models/B2BPartner"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"
import DashboardOverview from "@/components/admin/DashboardOverview"
import AdminLoginForm from "@/components/admin/AdminLoginForm"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
    const session = await getServerSession(authOptions)

    // Role Check
    if (!session || (session.user as any).role !== "admin") {
        return <AdminLoginForm />
    }

    // Fetch Data for Charts & Cards
    let b2bCount = 0
    let b2bTotal = 0
    let b2bPending = 0
    let b2bApproved = 0

    let quoteCount = 0
    let sellCount = 0
    let exchangeCount = 0
    let buyCount = 0
    let marketFeed: any[] = []
    let totalRequests = 0
    let totalApproved = 0
    let formattedTotalTons = "0.0"

    let formattedMonthlyGrowth: { name: string, value: number }[] = []
    let formattedWeeklyActivity: { name: string, requests: number, partners: number }[] = []

    try {
        await connectToDatabase()

        // Parallel Fetching for Performance
        const [
            b2bPendingCount,
            b2bPartnerCount,
            quoteRes,
            sellRes,
            exchangeRes,
            buyRes,
            wizardLeadsAll
        ] = await Promise.all([
            B2BRegistration.countDocuments({ status: 'pending' }),
            B2BPartner.countDocuments(),
            Valuation.countDocuments(),
            SellVehicle.countDocuments(),
            ExchangeVehicle.countDocuments(),
            BuyVehicle.countDocuments(),
            WizardLead.find().lean() // Fetch all for better analysis if not too many, otherwise aggregate
        ])

        b2bPending = b2bPendingCount
        b2bApproved = b2bPartnerCount
        b2bTotal = b2bPartnerCount + b2bPending 
        b2bCount = b2bPending 

        // Initial counts from dedicated collections
        quoteCount = quoteRes
        sellCount = sellRes
        exchangeCount = exchangeRes
        buyCount = buyRes

        // Add WizardLeads to counts based on their serviceType/category
        wizardLeadsAll.forEach((lead: any) => {
            if (lead.serviceType === 'scrap') {
                if (lead.category === 'scrap_and_buy') {
                    // This is a special case, maybe count as both or separate? 
                    // Let's count as Scrap (Free Quote) for now as it's the primary intent
                    quoteCount++
                } else {
                    quoteCount++
                }
            } else if (lead.serviceType === 'sell') {
                sellCount++
            } else if (lead.serviceType === 'buy') {
                buyCount++
            }
        })

        // Market Feed Fetching (Keep existing logic but use the fetched wizardLeadsAll for the slice)
        const latestWizardLeads = [...wizardLeadsAll]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);

        const [
            latestQuotes,
            latestSells,
            latestExchanges,
            latestBuys
        ] = await Promise.all([
            Valuation.find().sort({ createdAt: -1 }).limit(5).lean(),
            SellVehicle.find().sort({ createdAt: -1 }).limit(5).lean(),
            ExchangeVehicle.find().sort({ createdAt: -1 }).limit(5).lean(),
            BuyVehicle.find().sort({ createdAt: -1 }).limit(5).lean(),
        ])

        marketFeed = [
            ...latestQuotes.map((item: any) => ({ ...JSON.parse(JSON.stringify(item)), type: 'quote', customerName: item.contact?.name || "N/A", customerPhone: item.contact?.phone || "N/A", vehicleInfo: `${item.year} ${item.brand} ${item.model} (${item.vehicleType})` })),
            ...latestSells.map((item: any) => ({ ...JSON.parse(JSON.stringify(item)), type: 'sell', customerName: item.name || "N/A", customerPhone: item.phone || "N/A", vehicleInfo: `${item.registrationYear} ${item.customBrand || item.brand} ${item.customModel || item.model}` })),
            ...latestExchanges.map((item: any) => ({ ...JSON.parse(JSON.stringify(item)), type: 'exchange', customerName: item.customerName || "N/A", customerPhone: item.customerPhone || "N/A", vehicleInfo: `Old: ${item.oldVehicleBrand} ${item.oldVehicleModel} -> New: ${item.newVehicleBrand}` })),
            ...latestBuys.map((item: any) => ({ ...JSON.parse(JSON.stringify(item)), type: 'buy', customerName: item.customerName || "N/A", customerPhone: item.customerPhone || "N/A", vehicleInfo: `Looking for: ${item.customBrand || item.vehicleBrand} ${item.customModel || item.vehicleModel}` })),
            ...latestWizardLeads.map((item: any) => {
                let vehicleInfoStr = item.serviceType === "buy" ? `Looking for: ${item.desiredCompany || ''} ${item.desiredModel || ''}` : 
                                   (item.serviceType === "scrap" && item.category === "scrap_and_buy") ? `Scrap: ${item.brand || ''} ${item.model || ''} | Buy: ${item.desiredCompany || ''} ${item.desiredModel || ''}` :
                                   `${item.year || ''} ${item.brand || ''} ${item.model || ''}`;
                
                let resolvedType = (item.serviceType === 'scrap' && item.category === 'scrap_and_buy') ? 'scrap-buy' : 
                                  (item.serviceType === 'scrap') ? 'quote' : item.serviceType;

                return { ...JSON.parse(JSON.stringify(item)), type: resolvedType, customerName: item.name || "N/A", customerPhone: item.phone || "N/A", vehicleInfo: vehicleInfoStr };
            })
        ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 15);

        totalRequests = quoteCount + sellCount + exchangeCount + buyCount

        // Total Approved logic (simplified for clarity)
        const [appQ, appS, appE, appB, appW] = await Promise.all([
            Valuation.countDocuments({ status: 'approved' }),
            SellVehicle.countDocuments({ status: 'approved' }),
            ExchangeVehicle.countDocuments({ status: 'approved' }),
            BuyVehicle.countDocuments({ status: 'approved' }),
            WizardLead.countDocuments({ status: 'approved' })
        ])
        totalApproved = appQ + appS + appE + appB + appW

        // Total Tons calculation
        const valuationsWithWeight = await Valuation.find({}, { vehicleWeight: 1 }).lean()
        let totalTons = 0
        valuationsWithWeight.forEach((v: any) => {
            if (v.vehicleWeight) {
                const weightStr = v.vehicleWeight.toLowerCase().replace(/,/g, '')
                const num = parseFloat(weightStr)
                if (!isNaN(num)) {
                    if (weightStr.includes('kg')) totalTons += num / 1000
                    else if (weightStr.includes('ton')) totalTons += num
                    else if (num > 50) totalTons += num / 1000
                    else totalTons += num
                }
            }
        })
        formattedTotalTons = totalTons.toFixed(1)

        // --- Improved Chart Data Aggregation ---
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyAggregation = [
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } }
        ];

        const [mQ, mS, mE, mB, mW] = await Promise.all([
            Valuation.aggregate(monthlyAggregation),
            SellVehicle.aggregate(monthlyAggregation),
            ExchangeVehicle.aggregate(monthlyAggregation),
            BuyVehicle.aggregate(monthlyAggregation),
            WizardLead.aggregate(monthlyAggregation)
        ]);

        const monthlyTotals: { [key: string]: number } = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            monthlyTotals[`${d.getFullYear()}-${d.getMonth() + 1}`] = 0;
        }

        [...mQ, ...mS, ...mE, ...mB, ...mW].forEach(item => {
            const key = `${item._id.year}-${item._id.month}`;
            if (monthlyTotals[key] !== undefined) monthlyTotals[key] += item.count;
        });

        formattedMonthlyGrowth = Object.entries(monthlyTotals).map(([key, value]) => ({
            name: monthNames[parseInt(key.split('-')[1]) - 1],
            value: value
        }));

        // Weekly Activity (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const dailyAggregation = [
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" }, dayOfWeek: { $dayOfWeek: "$createdAt" } }, count: { $sum: 1 } } }
        ];

        const [dQ, dS, dE, dB, dP, dR, dW] = await Promise.all([
            Valuation.aggregate(dailyAggregation),
            SellVehicle.aggregate(dailyAggregation),
            ExchangeVehicle.aggregate(dailyAggregation),
            BuyVehicle.aggregate(dailyAggregation),
            B2BPartner.aggregate(dailyAggregation),
            B2BRegistration.aggregate(dailyAggregation),
            WizardLead.aggregate(dailyAggregation)
        ]);

        const dailyTotals: { [key: string]: { requests: number, partners: number, dayOfWeek: number } } = {};
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dailyTotals[`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`] = { requests: 0, partners: 0, dayOfWeek: d.getDay() + 1 };
        }

        [...dQ, ...dS, ...dE, ...dB, ...dW].forEach(item => {
            const key = `${item._id.year}-${item._id.month}-${item._id.day}`;
            if (dailyTotals[key] !== undefined) dailyTotals[key].requests += item.count;
        });

        [...dP, ...dR].forEach(item => {
            const key = `${item._id.year}-${item._id.month}-${item._id.day}`;
            if (dailyTotals[key] !== undefined) dailyTotals[key].partners += item.count;
        });

        formattedWeeklyActivity = Object.entries(dailyTotals).map(([key, data]) => ({
            name: dayNames[data.dayOfWeek - 1],
            requests: data.requests,
            partners: data.partners
        }));

    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        throw error;
    }

    return (
        <DashboardOverview
            totalRequests={totalRequests}
            formattedTotalTons={formattedTotalTons}
            b2bTotal={b2bTotal}
            totalApproved={totalApproved}
            marketFeed={marketFeed}
            valuationCounts={{
                quote: quoteCount,
                sell: sellCount,
                exchange: exchangeCount,
                buy: buyCount
            }}
            b2bStats={{
                total: b2bTotal,
                pending: b2bPending,
                approved: b2bApproved
            }}
            monthlyGrowthData={formattedMonthlyGrowth}
            activityData={formattedWeeklyActivity}
        />
    )
}

