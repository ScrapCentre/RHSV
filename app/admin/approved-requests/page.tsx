
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"
import { CheckCircle, FileText, ShoppingCart, RefreshCcw, Calendar, Eye } from "lucide-react"
import Link from "next/link"
import AdminApprovedTable from "@/components/AdminApprovedTable"

export const dynamic = "force-dynamic"

export default async function ApprovedRequestsPage() {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
        redirect("/")
    }

    await connectToDatabase()

    // Fetch all approved requests from all collections
    const statusFilter = { status: { $in: ["approved", "pickup_scheduled", "reached_collection_centre", "car_scrapped"] } };
    const [exchangeRequests, buyRequests, wizardRequests] = await Promise.all([
        ExchangeVehicle.find(statusFilter).sort({ createdAt: -1 }).lean(),
        BuyVehicle.find(statusFilter).sort({ createdAt: -1 }).lean(),
        WizardLead.find(statusFilter).sort({ createdAt: -1 }).lean()
    ])

    const formatWizardLead = (req: any) => {
        const plainReq = JSON.parse(JSON.stringify(req));
        let typeName = "Vehicle Request";
        let color = "blue";
        const serviceType = plainReq.serviceType || plainReq.type || "wizard";
        
        let linkType = serviceType;
        if (serviceType === "scrap") { typeName = "Scrap Vehicle"; color = "blue"; linkType = "quote"; }
        if (serviceType === "scrap-buy") { typeName = "Scrap & Buy New"; color = "purple"; }
        if (serviceType === "sell" || serviceType === "wizard-sell") { typeName = "Sell Old Vehicle"; color = "green"; linkType = "sell"; }
        if (serviceType === "buy" || serviceType === "wizard-buy") { typeName = "Buy New Vehicle"; color = "orange"; linkType = "buy"; }
        
        return { ...plainReq, type: linkType, originalType: serviceType, typeName, color };
    }

    // Combine all requests with type information
    const allRequests = [
        ...exchangeRequests.map((req: any) => ({ ...JSON.parse(JSON.stringify(req)), type: "exchange", typeName: "Exchange Vehicle", color: "purple" })),
        ...buyRequests.map((req: any) => ({ ...JSON.parse(JSON.stringify(req)), type: "buy", typeName: "Buy New Vehicle", color: "orange" })),
        ...wizardRequests.map(formatWizardLead)
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    function getCustomerInfo(req: any) {
        if (req.type === "quote") {
            return {
                name: req.contact?.name || req.name || req.customerName || "N/A",
                phone: req.contact?.phone || req.phone || req.customerPhone || "N/A"
            }
        }
        return {
            name: req.name || req.customerName || "N/A",
            phone: req.phone || req.customerPhone || "N/A"
        }
    }

    function getVehicleInfo(req: any) {
        if (req.type === "quote") {
            return `${req.brand || 'Unknown'} ${req.model || ''} (${req.year || 'N/A'})`

        } else if (req.type === "exchange") {
            return `${req.oldVehicleBrand || 'Unknown'} ${req.oldVehicleModel || ''} → ${req.newVehicleBrand || ''}`
        } else if (req.type === "buy") {
            return `${req.vehicleBrand || req.desiredCompany || 'Unknown'} ${req.vehicleModel || req.desiredModel || ''}`
        } else if (req.type === "scrap" || req.type === "scrap-buy" || req.originalType === "scrap-buy") {
            return `${req.brand || req.desiredCompany || 'Unknown'} ${req.model || req.desiredModel || ''} (${req.year || 'N/A'})`
        }
        return "N/A"
    }

    function getTypeBadge(type: string, typeName: string, color: string) {
        const colorClasses: any = {
            blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
            green: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-900/50",
            purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
            orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-900/50"
        }
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colorClasses[color]}`}>
                {typeName}
            </span>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                        Approved Requests
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">All approved requests from all categories.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{allRequests.length}</span>
                    <span>Total Approved</span>
                </div>
            </div>

            <AdminApprovedTable data={allRequests} />
        </div>
    )
}

