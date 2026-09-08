import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import WizardLead from "@/models/WizardLead"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import * as XLSX from "xlsx"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDateStr = searchParams.get("startDate")
    const endDateStr = searchParams.get("endDate")

    if (!startDateStr || !endDateStr) {
        return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 })
    }

    const startDate = new Date(startDateStr)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(endDateStr)
    endDate.setHours(23, 59, 59, 999)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
    }

    try {
        await connectToDatabase()

        const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } }

        const [wizardLeads, exchangeVehicles, buyVehicles] = await Promise.all([
            WizardLead.find(dateFilter).lean(),
            ExchangeVehicle.find(dateFilter).lean(),
            BuyVehicle.find(dateFilter).lean(),
        ])

        // ── Wizard Leads Sheet ──────────────────────────────────────────────
        const wizardRows = wizardLeads.map((lead: any) => ({
            "Lead ID": lead._id?.toString() || "",
            "Type": lead.serviceType === "scrap" && lead.category === "scrap_and_buy"
                ? "Scrap & Buy"
                : lead.serviceType === "scrap"
                ? "Scrap"
                : lead.serviceType === "buy"
                ? "Buy New"
                : lead.serviceType || "",
            "Customer Name": lead.name || "",
            "Phone": lead.phone || "",
            "Address": lead.address || "",
            "City": lead.city || "",
            "State": lead.state || "",
            "Pincode": lead.pincode || "",
            "Reg No": lead.regNo || "",
            "Brand": lead.brand || "",
            "Model": lead.model || "",
            "Year": lead.year || "",
            "KMs": lead.kms || "",
            "Fuel": Array.isArray(lead.fuel) ? lead.fuel.join(", ") : lead.fuel || "",
            "Weight": lead.weight || "",
            "Desired Company": lead.desiredCompany || "",
            "Desired Model": lead.desiredModel || "",
            "Status": lead.status || "pending",
            "eKYC Status": lead.ekycStatus || "pending",
            "Is Manual": lead.isManual ? "Yes" : "No",
            "Created At": lead.createdAt ? new Date(lead.createdAt).toLocaleString("en-IN") : "",
        }))

        // ── Exchange Vehicle Leads Sheet ────────────────────────────────────
        const exchangeRows = exchangeVehicles.map((item: any) => ({
            "Lead ID": item._id?.toString() || "",
            "Type": "Exchange",
            "Customer Name": item.customerName || "",
            "Phone": item.customerPhone || "",
            "City": item.city || item.customCity || "",
            "State": item.state || "",
            "Pincode": item.pincode || "",
            "Full Address": item.fullAddress || "",
            "Old Vehicle Reg": item.oldVehicleRegistration || "",
            "Old Brand": item.oldVehicleBrand || "",
            "Old Model": item.oldVehicleModel || "",
            "Old Year": item.oldVehicleYear || "",
            "Old Fuel Type": item.oldVehicleFuelType || "",
            "New Brand": item.newVehicleBrand || "",
            "New Model": item.newVehicleModel || "",
            "Status": item.status || "pending",
            "eKYC Status": item.ekycStatus || "pending",
            "Created At": item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "",
        }))

        // ── Buy Vehicle Leads Sheet ─────────────────────────────────────────
        const buyRows = buyVehicles.map((item: any) => ({
            "Lead ID": item._id?.toString() || "",
            "Type": "Buy New",
            "Customer Name": item.customerName || "",
            "Phone": item.customerPhone || "",
            "Email": item.customerEmail || "",
            "City": item.city || item.customCity || "",
            "State": item.state || "",
            "Pincode": item.pincode || "",
            "Vehicle Brand": item.customBrand || item.vehicleBrand || "",
            "Vehicle Model": item.customModel || item.vehicleModel || "",
            "Budget Range": item.budgetRange || "",
            "Fuel Type": item.fuelType || "",
            "Status": item.status || "pending",
            "Created At": item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "",
        }))

        // ── Build Workbook ──────────────────────────────────────────────────
        const wb = XLSX.utils.book_new()

        const wsWizard = XLSX.utils.json_to_sheet(wizardRows.length > 0 ? wizardRows : [{ "Note": "No records found" }])
        const wsExchange = XLSX.utils.json_to_sheet(exchangeRows.length > 0 ? exchangeRows : [{ "Note": "No records found" }])
        const wsBuy = XLSX.utils.json_to_sheet(buyRows.length > 0 ? buyRows : [{ "Note": "No records found" }])

        // Auto-width columns helper
        const autoWidth = (ws: XLSX.WorkSheet, data: any[]) => {
            if (data.length === 0) return
            const cols = Object.keys(data[0]).map(key => ({
                wch: Math.max(key.length, ...data.map(row => String(row[key] ?? "").length))
            }))
            ws["!cols"] = cols
        }
        autoWidth(wsWizard, wizardRows.length > 0 ? wizardRows : [])
        autoWidth(wsExchange, exchangeRows.length > 0 ? exchangeRows : [])
        autoWidth(wsBuy, buyRows.length > 0 ? buyRows : [])

        XLSX.utils.book_append_sheet(wb, wsWizard, "Scrap & Buy Leads")
        XLSX.utils.book_append_sheet(wb, wsExchange, "Exchange Leads")
        XLSX.utils.book_append_sheet(wb, wsBuy, "Buy Vehicle Leads")

        const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

        const fromLabel = startDate.toISOString().split("T")[0]
        const toLabel = endDate.toISOString().split("T")[0]

        return new NextResponse(buf, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="leads_${fromLabel}_to_${toLabel}.xlsx"`,
            },
        })
    } catch (err) {
        console.error("Export leads error:", err)
        return NextResponse.json({ error: "Failed to export leads" }, { status: 500 })
    }
}
