import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import Contact from "@/models/Contact"
import ContactList from "@/components/admin/ContactList"

export const dynamic = "force-dynamic"

async function getContacts() {
    await connectToDatabase()
    // lean() returns plain JS objects, easier to serialize
    const contacts = await Contact.find({}).sort({ createdAt: -1 }).lean()
    // Convert _id and dates to strings/numbers to avoid serialization issues
    return contacts.map((contact: any) => ({
        ...contact,
        _id: contact._id.toString(),
        createdAt: contact.createdAt.toISOString(),
    }))
}

export default async function AdminContactPage() {
    const session = await getServerSession(authOptions)

    // Role Check
    if (!session || (session.user as any).role !== "admin") {
        redirect("/login")
    }

    const contacts = await getContacts()

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Contact Requests</h1>
                <p className="text-gray-500 dark:text-slate-400 mt-2">Manage inquiries and update their status.</p>
            </div>

            <ContactList initialContacts={contacts as any} />
        </div>
    )
}

