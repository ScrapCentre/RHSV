import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"
import Setting from "@/models/Setting"

export const dynamic = "force-dynamic"

const getLeadState = (item: any) => {
    let state = item.state || "";
    let pincode = item.pincode || "";

    if (item.address && typeof item.address === "object") {
        if (item.address.state) state = item.address.state;
        if (item.address.pincode) pincode = item.address.pincode;
    }

    const cleanStr = (val: any) => {
        if (!val) return "";
        const s = String(val).trim();
        if (s.toLowerCase() === "n/a" || s.toLowerCase() === "undefined" || s.toLowerCase() === "null") return "";
        return s;
    };

    let s = cleanStr(state);
    let p = cleanStr(pincode);

    if (p && !s) {
        const p3 = p.slice(0, 3);
        const p4 = p.slice(0, 4);
        const p2 = p.slice(0, 2);

        const pinPrefixMap: Record<string, string> = {
            "110": "Delhi", "201": "Uttar Pradesh", "2010": "Uttar Pradesh", "206": "Uttar Pradesh",
            "208": "Uttar Pradesh", "226": "Uttar Pradesh", "221": "Uttar Pradesh", "282": "Uttar Pradesh",
            "211": "Uttar Pradesh", "250": "Uttar Pradesh", "243": "Uttar Pradesh", "273": "Uttar Pradesh",
            "202": "Uttar Pradesh", "284": "Uttar Pradesh", "244": "Uttar Pradesh", "143": "Punjab",
            "141": "Punjab", "144": "Punjab", "147": "Punjab", "151": "Punjab", "160": "Chandigarh",
            "302": "Rajasthan", "342": "Rajasthan", "313": "Rajasthan", "305": "Rajasthan",
            "324": "Rajasthan", "334": "Rajasthan", "380": "Gujarat", "395": "Gujarat",
            "390": "Gujarat", "360": "Gujarat", "382": "Gujarat", "364": "Gujarat",
            "400": "Maharashtra", "401": "Maharashtra", "410": "Maharashtra", "411": "Maharashtra",
            "440": "Maharashtra", "422": "Maharashtra", "431": "Maharashtra", "413": "Maharashtra",
            "416": "Maharashtra", "452": "Madhya Pradesh", "462": "Madhya Pradesh", "474": "Madhya Pradesh",
            "482": "Madhya Pradesh", "456": "Madhya Pradesh", "500": "Telangana", "506": "Telangana",
            "560": "Karnataka", "570": "Karnataka", "580": "Karnataka", "575": "Karnataka",
            "590": "Karnataka", "600": "Tamil Nadu", "641": "Tamil Nadu", "625": "Tamil Nadu",
            "620": "Tamil Nadu", "636": "Tamil Nadu", "700": "West Bengal", "711": "West Bengal",
            "713": "West Bengal", "734": "West Bengal", "800": "Bihar", "823": "Bihar",
            "812": "Bihar", "842": "Bihar", "834": "Jharkhand", "831": "Jharkhand",
            "826": "Jharkhand", "492": "Chhattisgarh", "495": "Chhattisgarh", "751": "Odisha",
            "753": "Odisha", "781": "Assam", "248": "Uttarakhand", "180": "Jammu & Kashmir",
            "190": "Jammu & Kashmir", "121": "Haryana", "122": "Haryana", "133": "Haryana"
        };

        let matched = pinPrefixMap[p4] || pinPrefixMap[p3];
        if (matched) {
            s = matched;
        } else {
            const num2 = parseInt(p2, 10);
            if (num2 === 11) s = "Delhi";
            else if (num2 >= 12 && num2 <= 13) s = "Haryana";
            else if (num2 >= 14 && num2 <= 15) s = "Punjab";
            else if (num2 === 16) s = "Punjab";
            else if (num2 === 17) s = "Himachal Pradesh";
            else if (num2 >= 18 && num2 <= 19) s = "Jammu & Kashmir";
            else if (num2 >= 20 && num2 <= 28) s = "Uttar Pradesh";
            else if (num2 >= 30 && num2 <= 34) s = "Rajasthan";
            else if (num2 >= 36 && num2 <= 39) s = "Gujarat";
            else if (num2 >= 40 && num2 <= 44) s = "Maharashtra";
            else if (num2 >= 45 && num2 <= 48) s = "Madhya Pradesh";
            else if (num2 === 49) s = "Chhattisgarh";
            else if (num2 >= 50 && num2 <= 53) s = "Andhra Pradesh/Telangana";
            else if (num2 >= 56 && num2 <= 59) s = "Karnataka";
            else if (num2 >= 60 && num2 <= 64) s = "Tamil Nadu";
            else if (num2 >= 67 && num2 <= 69) s = "Kerala";
            else if (num2 >= 70 && num2 <= 74) s = "West Bengal";
            else if (num2 >= 75 && num2 <= 77) s = "Odisha";
            else if (num2 === 78) s = "Assam";
            else if (num2 === 79) s = "North Eastern State";
            else if (num2 >= 80 && num2 <= 85) s = "Bihar/Jharkhand";
        }
    }
    return (s || "Unknown").trim();
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const filterState = searchParams.get("state")?.trim()

        await connectToDatabase()

        const excludeFilter = { status: "approved_to_rvsf" }

        const [
            latestExchanges,
            latestBuys,
            latestWizards
        ] = await Promise.all([
            ExchangeVehicle.find(excludeFilter).sort({ createdAt: -1 }).lean(),
            BuyVehicle.find(excludeFilter).sort({ createdAt: -1 }).lean(),
            WizardLead.find(excludeFilter).sort({ createdAt: -1 }).lean(),
        ])

        // Group into a single structure
        const allLeads = [
            ...latestExchanges.map((item: any) => ({ ...item, type: 'exchange' })),
            ...latestBuys.map((item: any) => ({ ...item, type: 'buy' })),
            ...latestWizards.map((item: any) => ({ ...item, type: item.serviceType || 'wizard' }))
        ]

        // Resolve states and calculate count per state
        const stateCounts: Record<string, number> = {}
        const leadsByState: Record<string, any[]> = {}

        allLeads.forEach((lead) => {
            const rawState = getLeadState(lead)
            if (!rawState || rawState === "Unknown") return

            const normalizedState = rawState.charAt(0).toUpperCase() + rawState.slice(1).toLowerCase()
            
            stateCounts[normalizedState] = (stateCounts[normalizedState] || 0) + 1
            if (!leadsByState[normalizedState]) {
                leadsByState[normalizedState] = []
            }
            leadsByState[normalizedState].push(lead)
        })

        const rvsfLeadSetting = await Setting.findOne({ key: "rvsfLeadPrice" })
        const rvsfLeadPrice = rvsfLeadSetting ? rvsfLeadSetting.value : 499

        if (!filterState) {
            // Return only the counts of leads grouped by state
            return NextResponse.json({ stateCounts, rvsfLeadPrice }, { status: 200 })
        }

        const normalizedFilter = filterState.charAt(0).toUpperCase() + filterState.slice(1).toLowerCase()
        const selectedLeads = leadsByState[normalizedFilter] || []

        // Format leads with maximum security (fully masked data, no inspect element leaks!)
        const formattedLeads = selectedLeads.map((item: any, index: number) => {
            let vehicleInfo = "Vehicle Details Hidden"
            if (item.type === 'quote') {
                vehicleInfo = `${item.year || '20XX'} ${item.brand || 'Vehicle'} ${item.model || ''} (${item.vehicleType || ''})`.trim()
            } else if (item.type === 'exchange') {
                vehicleInfo = `Exchange: ${item.oldVehicleBrand || 'Old'} -> ${item.newVehicleBrand || 'New'}`.trim()
            } else if (item.type === 'buy') {
                vehicleInfo = `Looking for: ${item.customBrand || item.vehicleBrand || 'Vehicle'}`.trim()
            } else {
                vehicleInfo = `${item.year || '20XX'} ${item.brand || 'Vehicle'} ${item.model || ''}`.trim()
            }

            return {
                _id: `lead_${index}_${Math.random().toString(36).substr(2, 9)}`, // Obscure actual DB ID to prevent scraping
                createdAt: item.createdAt,
                type: item.type === 'quote' ? 'scrap' : item.type,
                // Hard masked fields ensuring secure data delivery
                customerName: "Customer (LOCKED)",
                customerPhone: "+91 ••••• •••••",
                vehicleInfo,
                location: `${normalizedFilter}, India`
            }
        })

        return NextResponse.json({
            state: normalizedFilter,
            totalCount: selectedLeads.length,
            leads: formattedLeads,
            rvsfLeadPrice
        }, { status: 200 })

    } catch (error: any) {
        console.error("Public RVSF Leads Fetch Error:", error)
        return NextResponse.json(
            { message: "Failed to fetch public leads summary" },
            { status: 500 }
        )
    }
}
