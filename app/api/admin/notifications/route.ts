import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import Contact from "@/models/Contact"
import B2BRegistration from "@/models/B2BRegistration"
import BulkOutsourcing from "@/models/BulkOutsourcing"
import WizardLead from "@/models/WizardLead"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()

        // Fetch latest new/pending requests from relevant models, including the stepper WizardLeads
        const [
            exchangeRequests,
            buyRequests,
            contactRequests,
            b2bRegistrations,
            bulkOutsourcing,
            wizardLeads
        ] = await Promise.all([
            ExchangeVehicle.find({ status: "pending" }).sort({ createdAt: -1 }).limit(5).lean(),
            BuyVehicle.find({ status: "pending" }).sort({ createdAt: -1 }).limit(5).lean(),
            Contact.find({ status: "new" }).sort({ createdAt: -1 }).limit(10).lean(),
            B2BRegistration.find({ status: "pending" }).sort({ createdAt: -1 }).limit(5).lean(),
            BulkOutsourcing.find({ status: "pending" }).sort({ createdAt: -1 }).limit(5).lean(),
            WizardLead.find({ status: "pending" }).sort({ createdAt: -1 }).limit(10).lean()
        ])

        // Format and combine notifications
        const notifications: any[] = [

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
            })),
            ...wizardLeads.map((wl: any) => {
                let type: string = "valuation"
                let title: string = "New Stepper Lead"
                let description: string = `${wl.brand || ""} ${wl.model || ""} (${wl.year || "N/A"})`
                let href: string = `/admin/valuations/quote/${wl._id}?highlight=true`

                if (wl.category === "scrap_and_buy") {
                    type = "valuation"
                    title = "New Scrap & Buy Request"
                    href = `/admin/valuations/scrap-buy/${wl._id}?highlight=true`

                } else if (wl.serviceType === "buy") {
                    type = "buy"
                    title = "New Buy Inquiry"
                    description = `${wl.desiredCompany || ""} ${wl.desiredModel || ""}`
                    href = `/admin/valuations/buy/${wl._id}?highlight=true`
                } else if (wl.serviceType === "scrap" && wl.category === "scrap_only") {
                    type = "valuation"
                    title = "New Quote Request"
                    href = `/admin/valuations/quote/${wl._id}?highlight=true`
                }

                return {
                    id: wl._id,
                    type,
                    title,
                    description: description.trim() || `From ${wl.name}`,
                    createdAt: wl.createdAt,
                    href
                }
            })
        ]

        // Deduplicate notifications by id to prevent any potential legacy vs modern duplicates
        const uniqueNotifications: any[] = [];
        const seenIds = new Set<string>();
        for (const notif of notifications) {
            const notifIdStr = notif.id.toString();
            if (!seenIds.has(notifIdStr)) {
                seenIds.add(notifIdStr);
                uniqueNotifications.push(notif);
            }
        }

        // Sort by most recent
        uniqueNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        return NextResponse.json(uniqueNotifications.slice(0, 20))
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
