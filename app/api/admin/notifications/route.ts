import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import Contact from "@/models/Contact"
import B2BRegistration from "@/models/B2BRegistration"
import BulkOutsourcing from "@/models/BulkOutsourcing"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()

        // Fetch latest new/pending requests from relevant models
        const [
            valuations,
            sellRequests,
            exchangeRequests,
            buyRequests,
            contactRequests,
            b2bRegistrations,
            bulkOutsourcing
        ] = await Promise.all([
            Valuation.find({ status: "pending" }).sort({ createdAt: -1 }).limit(5).lean(),
            SellVehicle.find({ status: "pending" }).sort({ createdAt: -1 }).limit(5).lean(),
            ExchangeVehicle.find({ status: "pending" }).sort({ createdAt: -1 }).limit(5).lean(),
            BuyVehicle.find({ status: "pending" }).sort({ createdAt: -1 }).limit(5).lean(),
            Contact.find({ status: "new" }).sort({ createdAt: -1 }).limit(10).lean(),
            B2BRegistration.find({ status: "pending" }).sort({ createdAt: -1 }).limit(5).lean(),
            BulkOutsourcing.find({ status: "pending" }).sort({ createdAt: -1 }).limit(5).lean()
        ])

        // Format and combine notifications
        const notifications: any[] = [
            ...valuations.map((v: any) => ({
                id: v._id,
                type: "valuation",
                title: "New Quote Request",
                description: `${v.brand} ${v.model} (${v.year})`,
                createdAt: v.createdAt,
                href: `/admin/valuations/quote/${v._id}?highlight=true`
            })),
            ...sellRequests.map((s: any) => ({
                id: s._id,
                type: "sell",
                title: "New Sell Request",
                description: `${s.brand} ${s.model}`,
                createdAt: s.createdAt,
                href: `/admin/valuations/sell/${s._id}?highlight=true`
            })),
            ...exchangeRequests.map((e: any) => ({
                id: e._id,
                type: "exchange",
                title: "New Exchange Request",
                description: `${e.oldVehicleBrand} to ${e.newVehicleBrand}`,
                createdAt: e.createdAt,
                href: `/admin/valuations/exchange/${e._id}?highlight=true`
            })),
            ...buyRequests.map((b: any) => ({
                id: b._id,
                type: "buy",
                title: "New Buy Inquiry",
                description: `${b.vehicleBrand} ${b.vehicleModel}`,
                createdAt: b.createdAt,
                href: `/admin/valuations/buy/${b._id}?highlight=true`
            })),
            ...contactRequests.map((c: any) => ({
                id: c._id,
                type: "contact",
                title: "New Contact Request",
                description: `From ${c.name}: ${c.subject}`,
                createdAt: c.createdAt,
                href: `/admin/contact?id=${c._id}&highlight=true`
            })),
            ...b2bRegistrations.map((b2b: any) => ({
                id: b2b._id,
                type: "b2b_registration",
                title: "New B2B Partner Request",
                description: `From ${b2b.name} (${b2b.city}, ${b2b.state})`,
                createdAt: b2b.createdAt,
                href: `/admin/partners?id=${b2b._id}&highlight=true`
            })),
            ...bulkOutsourcing.map((bulk: any) => ({
                id: bulk._id,
                type: "b2b_bulk",
                title: "New B2B Bulk Data Request",
                description: `From ${bulk.partnerName} (${bulk.entries?.length || 0} entries)`,
                createdAt: bulk.createdAt,
                href: `/admin/bulk-outsourcing/${bulk._id}?highlight=true`
            }))
        ]

        // Sort by most recent
        notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        return NextResponse.json(notifications.slice(0, 20))
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
