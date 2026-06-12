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

        // Fetch latest new/pending requests only from WizardLead and Contact
        const [
            contactRequests,
            wizardLeads
        ] = await Promise.all([
            Contact.find({ status: "new" }).sort({ createdAt: -1 }).limit(10).lean(),
            WizardLead.find({ status: "pending" }).sort({ createdAt: -1 }).limit(15).lean()
        ])

        // Format and combine notifications
        const notifications: any[] = [
            ...contactRequests.map((c: any) => ({
                id: c._id,
                type: "contact",
                title: "New Contact Request",
                description: `From ${c.name}: ${c.subject}`,
                createdAt: c.createdAt,
                href: `/admin/contact?id=${c._id}&highlight=true`
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
