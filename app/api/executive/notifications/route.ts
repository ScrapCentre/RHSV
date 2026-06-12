import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import WizardLead from "@/models/WizardLead";
import Contact from "@/models/Contact";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "executive") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        // Fetch pending WizardLeads and new Contacts
        const [wizardLeads, contactRequests] = await Promise.all([
            WizardLead.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(15).lean(),
            Contact.find({ status: 'new' }).sort({ createdAt: -1 }).limit(10).lean(),
        ]);

        const notifications = [
            ...contactRequests.map((c: any) => ({
                id: c._id,
                type: 'contact',
                title: 'New Contact Request',
                description: `From ${c.name}: ${c.subject}`,
                createdAt: c.createdAt,
                href: `/executive/contact?id=${c._id}&highlight=true`
            })),
            ...wizardLeads.map((wl: any) => {
                let type: string = "valuation"
                let title: string = "New Stepper Lead"
                let description: string = `${wl.brand || ""} ${wl.model || ""} (${wl.year || "N/A"})`
                let href: string = `/executive/valuations/quote/${wl._id}?highlight=true`

                if (wl.category === "scrap_and_buy") {
                    type = "valuation"
                    title = "New Scrap & Buy Request"
                    href = `/executive/valuations/scrap-buy/${wl._id}?highlight=true`
                } else if (wl.serviceType === "buy") {
                    type = "buy"
                    title = "New Buy Inquiry"
                    description = `${wl.desiredCompany || ""} ${wl.desiredModel || ""}`
                    href = `/executive/valuations/buy/${wl._id}?highlight=true`
                } else if (wl.serviceType === "scrap" && wl.category === "scrap_only") {
                    type = "valuation"
                    title = "New Quote Request"
                    href = `/executive/valuations/quote/${wl._id}?highlight=true`
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
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20);

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error("Notifications fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}
