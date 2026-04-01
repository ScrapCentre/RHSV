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
import DashboardOverview from "@/components/admin/DashboardOverview"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
    const session = await getServerSession(authOptions)

    // Role Check
    if (!session || (session.user as any).role !== "admin") {
        redirect("/")
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
            buyRes
        ] = await Promise.all([
            B2BRegistration.countDocuments({ status: 'pending' }),
            B2BPartner.countDocuments(),
            Valuation.countDocuments(),
            SellVehicle.countDocuments(),
            ExchangeVehicle.countDocuments(),
            BuyVehicle.countDocuments()
        ])

        b2bPending = b2bPendingCount
        b2bApproved = b2bPartnerCount
        b2bTotal = b2bPartnerCount + b2bPending // Active Partners + Pending Requests
        b2bCount = b2bPending // For the "New" badge

        quoteCount = quoteRes
        sellCount = sellRes
        exchangeCount = exchangeRes
        buyCount = buyRes

        // Market Feed Fetching
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
            ...latestQuotes.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                return {
                    ...plainItem,
                    type: 'quote',
                    customerName: item.contact?.name || "N/A",
                    customerPhone: item.contact?.phone || "N/A",
                    vehicleInfo: `${item.year} ${item.brand} ${item.model} (${item.vehicleType})`
                };
            }),
            ...latestSells.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                return {
                    ...plainItem,
                    type: 'sell',
                    customerName: item.name || "N/A",
                    customerPhone: item.phone || "N/A",
                    vehicleInfo: `${item.registrationYear} ${item.customBrand || item.brand} ${item.customModel || item.model}`
                };
            }),
            ...latestExchanges.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                return {
                    ...plainItem,
                    type: 'exchange',
                    customerName: item.customerName || "N/A",
                    customerPhone: item.customerPhone || "N/A",
                    vehicleInfo: `Old: ${item.oldVehicleBrand} ${item.oldVehicleModel} -> New: ${item.newVehicleBrand}`
                };
            }),
            ...latestBuys.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                return {
                    ...plainItem,
                    type: 'buy',
                    customerName: item.customerName || "N/A",
                    customerPhone: item.customerPhone || "N/A",
                    vehicleInfo: `Looking for: ${item.customBrand || item.vehicleBrand} ${item.customModel || item.vehicleModel}`
                };
            })
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

        // Calculate Total Metrics
        totalRequests = quoteCount + sellCount + exchangeCount + buyCount

        // Calculate Total Approved
        const [
            approvedQuotes,
            approvedSells,
            approvedExchanges,
            approvedBuys
        ] = await Promise.all([
            Valuation.countDocuments({ status: 'approved' }),
            SellVehicle.countDocuments({ status: 'approved' }),
            ExchangeVehicle.countDocuments({ status: 'approved' }),
            BuyVehicle.countDocuments({ status: 'approved' })
        ])
        totalApproved = approvedQuotes + approvedSells + approvedExchanges + approvedBuys

        // Calculate Total Tons (from Valuation collection)
        // Note: fetch only vehicleWeight field to minimize data transfer
        const valuationsWithWeight = await Valuation.find({}, { vehicleWeight: 1 }).lean()
        let totalTons = 0
        valuationsWithWeight.forEach((v: any) => {
            if (v.vehicleWeight) {
                // simple parsing for "1500 kg", "1.5 tons", etc.
                const weightStr = v.vehicleWeight.toLowerCase().replace(/,/g, '')
                const num = parseFloat(weightStr)
                if (!isNaN(num)) {
                    if (weightStr.includes('kg')) {
                        totalTons += num / 1000
                    } else if (weightStr.includes('ton')) {
                        totalTons += num
                    } else {
                        // Default assuming kg if no unit, or just add raw number if it seems small? 
                        // Safer to assume kg if > 10, tons if < 10? 
                        // For now, let's assume raw numbers are KG if > 50, otherwise Tons.
                        if (num > 50) totalTons += num / 1000
                        else totalTons += num
                    }
                }
            }
        })

        // Format to 1 decimal place
        formattedTotalTons = totalTons.toFixed(1)


        // --- Real-time Chart Data Fetching ---

        // 1. Monthly Growth (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Start of the 6th month ago
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyAggregation = [
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            }
        ];

        const [monthlyQuotes, monthlySells, monthlyExchanges, monthlyBuys] = await Promise.all([
            Valuation.aggregate(monthlyAggregation),
            SellVehicle.aggregate(monthlyAggregation),
            ExchangeVehicle.aggregate(monthlyAggregation),
            BuyVehicle.aggregate(monthlyAggregation)
        ]);

        const combinedMonthlyData = [...monthlyQuotes, ...monthlySells, ...monthlyExchanges, ...monthlyBuys];

        const monthlyTotals: { [key: string]: number } = {};

        // Initialize last 6 months with 0
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            monthlyTotals[key] = 0;
        }

        // Sum up all collections
        combinedMonthlyData.forEach(item => {
            const key = `${item._id.year}-${item._id.month}`;
            if (monthlyTotals[key] !== undefined) {
                monthlyTotals[key] += item.count;
            }
        });

        formattedMonthlyGrowth = Object.entries(monthlyTotals).map(([key, value]) => {
            const [year, month] = key.split('-');
            return {
                name: monthNames[parseInt(month) - 1],
                value: value
            };
        });


        // 2. Weekly Activity (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const dailyAggregation = [
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                        dayOfWeek: { $dayOfWeek: "$createdAt" } // 1 (Sunday) - 7 (Saturday)
                    },
                    count: { $sum: 1 }
                }
            }
        ];

        const [dailyQuotes, dailySells, dailyExchanges, dailyBuys, dailyPartners, dailyRegistrations] = await Promise.all([
            Valuation.aggregate(dailyAggregation),
            SellVehicle.aggregate(dailyAggregation),
            ExchangeVehicle.aggregate(dailyAggregation),
            BuyVehicle.aggregate(dailyAggregation),
            B2BPartner.aggregate(dailyAggregation),
            B2BRegistration.aggregate(dailyAggregation)
        ]);

        const combinedDailyRequests = [...dailyQuotes, ...dailySells, ...dailyExchanges, ...dailyBuys];
        const combinedDailyPartners = [...dailyPartners, ...dailyRegistrations];

        const dailyTotals: { [key: string]: { requests: number, partners: number, dayOfWeek: number } } = {};
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            dailyTotals[key] = { requests: 0, partners: 0, dayOfWeek: d.getDay() + 1 }; // JS getDay is 0-6 (Sun-Sat), Mongo dayOfWeek is 1-7
        }

        combinedDailyRequests.forEach(item => {
            const key = `${item._id.year}-${item._id.month}-${item._id.day}`;
            if (dailyTotals[key] !== undefined) {
                dailyTotals[key].requests += item.count;
            }
        });

        combinedDailyPartners.forEach(item => {
            const key = `${item._id.year}-${item._id.month}-${item._id.day}`;
            if (dailyTotals[key] !== undefined) {
                dailyTotals[key].partners += item.count;
            }
        });

        formattedWeeklyActivity = Object.entries(dailyTotals).map(([key, data]) => ({
            name: dayNames[data.dayOfWeek - 1],
            requests: data.requests,
            partners: data.partners
        }));

    } catch (error) {
        console.error("Error fetching admin dashboard data:", error)
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

