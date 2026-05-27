import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import RefundRequest from "@/models/RefundRequest"
import RVSFUser from "@/models/RVSFUser"
import { RefreshCcw } from "lucide-react"
import RefundReviewClient from "@/components/admin/RefundReviewClient"

export const dynamic = "force-dynamic"

export default async function RefundReviewPage() {
    // 1. Authorize Admin
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "admin") {
        redirect("/")
    }

    await connectToDatabase()

    // 2. Fetch all refund requests where status is "pending_admin_review"
    const pendingRequests = await RefundRequest.find({ status: "pending_admin_review" })
        .sort({ createdAt: -1 })
        .lean()

    // 3. Resolve RVSF Names in a bulk query (efficient join, avoids N+1 database queries)
    const rvsfIds = Array.from(new Set(pendingRequests.map((r: any) => r.rvsfId)))
    const rvsfUsers = await RVSFUser.find({ rvsfId: { $in: rvsfIds } }).lean()

    const rvsfMap: Record<string, string> = {}
    rvsfUsers.forEach((u: any) => {
        rvsfMap[u.rvsfId] = u.name
    })

    // 4. Format requests with stringified ObjectIDs and ISO Dates for Next.js Client Component compatibility
    const formattedRequests = pendingRequests.map((r: any) => ({
        _id: r._id.toString(),
        leadId: r.leadId,
        rvsfId: r.rvsfId,
        amount: r.amount,
        rejectionReason: r.rejectionReason,
        unlockPaymentId: r.unlockPaymentId,
        razorpayOrderId: r.razorpayOrderId || "",
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        rvsfName: rvsfMap[r.rvsfId] || r.rvsfId || "Unknown RVSF Partner",
    }))

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#0E192D] p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 tracking-tight">
                        <RefreshCcw className="w-6 h-6 text-emerald-500 animate-spin-slow" />
                        Refund Review Desk
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        Review and process refund requests submitted by RVSFs for rejected leads.
                    </p>
                </div>
            </div>

            {/* Interactive Desk Table & Dialog Controller */}
            <RefundReviewClient initialRequests={formattedRequests} />
        </div>
    )
}
