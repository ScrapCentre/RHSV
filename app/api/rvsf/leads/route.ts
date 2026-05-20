import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"
import RVSFUser from "@/models/RVSFUser"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "rvsf") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()

        // Fetch current RVSF user's purchased states
        const rvsfUser = await RVSFUser.findOne({ email: session.user.email?.toLowerCase() }).lean()
        if (!rvsfUser) {
            return NextResponse.json({ message: "RVSF User profile not found" }, { status: 404 })
        }

        const purchasedStates = (rvsfUser.purchasedStates || []).map((s: string) => s.trim().toLowerCase())

        const excludeFilter = { status: "approved_to_rvsf" }
        const quoteExcludeFilter = { status: "approved_to_rvsf" }

        const [
            latestQuotes,
            latestSells,
            latestExchanges,
            latestBuys,
            latestWizards
        ] = await Promise.all([
            Valuation.find(quoteExcludeFilter).sort({ createdAt: -1 }).lean(),
            SellVehicle.find(excludeFilter).sort({ createdAt: -1 }).lean(),
            ExchangeVehicle.find(excludeFilter).sort({ createdAt: -1 }).lean(),
            BuyVehicle.find(excludeFilter).sort({ createdAt: -1 }).lean(),
            WizardLead.find(excludeFilter).sort({ createdAt: -1 }).lean(),
        ])

        const formatLocation = (item: any) => {
            let city = item.city || "";
            let state = item.state || "";
            let pincode = item.pincode || "";
            let addressVal = "";

            if (item.address) {
                if (typeof item.address === "object") {
                    if (item.address.city) city = item.address.city;
                    if (item.address.state) state = item.address.state;
                    if (item.address.pincode) pincode = item.address.pincode;
                    if (item.address.fullAddress) addressVal = item.address.fullAddress;
                } else if (typeof item.address === "string") {
                    addressVal = item.address;
                }
            }

            const cleanStr = (val: any) => {
                if (!val) return "";
                const s = String(val).trim();
                if (s.toLowerCase() === "n/a" || s.toLowerCase() === "undefined" || s.toLowerCase() === "null") return "";
                return s;
            };

            let c = cleanStr(city);
            let s = cleanStr(state);
            let p = cleanStr(pincode);
            let a = cleanStr(addressVal);

            // Pincode lookup for Indian pincodes if city or state are missing
            if (p && (!c || !s)) {
                const p3 = p.slice(0, 3);
                const p4 = p.slice(0, 4);
                const p2 = p.slice(0, 2);

                const pinPrefixMap: Record<string, { city: string; state: string }> = {
                    "110": { city: "Delhi", state: "Delhi" },
                    "201": { city: "Noida/Ghaziabad", state: "Uttar Pradesh" },
                    "2010": { city: "Ghaziabad", state: "Uttar Pradesh" },
                    "206": { city: "Auraiya", state: "Uttar Pradesh" },
                    "208": { city: "Kanpur", state: "Uttar Pradesh" },
                    "226": { city: "Lucknow", state: "Uttar Pradesh" },
                    "221": { city: "Varanasi", state: "Uttar Pradesh" },
                    "282": { city: "Agra", state: "Uttar Pradesh" },
                    "211": { city: "Prayagraj", state: "Uttar Pradesh" },
                    "250": { city: "Meerut", state: "Uttar Pradesh" },
                    "243": { city: "Bareilly", state: "Uttar Pradesh" },
                    "273": { city: "Gorakhpur", state: "Uttar Pradesh" },
                    "202": { city: "Aligarh", state: "Uttar Pradesh" },
                    "284": { city: "Jhansi", state: "Uttar Pradesh" },
                    "244": { city: "Moradabad", state: "Uttar Pradesh" },
                    "143": { city: "Amritsar", state: "Punjab" },
                    "141": { city: "Ludhiana", state: "Punjab" },
                    "144": { city: "Jalandhar", state: "Punjab" },
                    "147": { city: "Patiala", state: "Punjab" },
                    "151": { city: "Bathinda", state: "Punjab" },
                    "160": { city: "Chandigarh", state: "Chandigarh" },
                    "302": { city: "Jaipur", state: "Rajasthan" },
                    "342": { city: "Jodhpur", state: "Rajasthan" },
                    "313": { city: "Udaipur", state: "Rajasthan" },
                    "305": { city: "Ajmer", state: "Rajasthan" },
                    "324": { city: "Kota", state: "Rajasthan" },
                    "334": { city: "Bikaner", state: "Rajasthan" },
                    "380": { city: "Ahmedabad", state: "Gujarat" },
                    "395": { city: "Surat", state: "Gujarat" },
                    "390": { city: "Vadodara", state: "Gujarat" },
                    "360": { city: "Rajkot", state: "Gujarat" },
                    "382": { city: "Gandhinagar", state: "Gujarat" },
                    "364": { city: "Bhavnagar", state: "Gujarat" },
                    "400": { city: "Mumbai", state: "Maharashtra" },
                    "401": { city: "Thane", state: "Maharashtra" },
                    "410": { city: "Navi Mumbai", state: "Maharashtra" },
                    "411": { city: "Pune", state: "Maharashtra" },
                    "440": { city: "Nagpur", state: "Maharashtra" },
                    "422": { city: "Nashik", state: "Maharashtra" },
                    "431": { city: "Aurangabad", state: "Maharashtra" },
                    "413": { city: "Solapur", state: "Maharashtra" },
                    "416": { city: "Kolhapur", state: "Maharashtra" },
                    "452": { city: "Indore", state: "Madhya Pradesh" },
                    "462": { city: "Bhopal", state: "Madhya Pradesh" },
                    "474": { city: "Gwalior", state: "Madhya Pradesh" },
                    "482": { city: "Jabalpur", state: "Madhya Pradesh" },
                    "456": { city: "Ujjain", state: "Madhya Pradesh" },
                    "500": { city: "Hyderabad", state: "Telangana" },
                    "506": { city: "Warangal", state: "Telangana" },
                    "560": { city: "Bengaluru", state: "Karnataka" },
                    "570": { city: "Mysore", state: "Karnataka" },
                    "580": { city: "Hubli-Dharwad", state: "Karnataka" },
                    "575": { city: "Mangalore", state: "Karnataka" },
                    "590": { city: "Belgaum", state: "Karnataka" },
                    "600": { city: "Chennai", state: "Tamil Nadu" },
                    "641": { city: "Coimbatore", state: "Tamil Nadu" },
                    "625": { city: "Madurai", state: "Tamil Nadu" },
                    "620": { city: "Trichy", state: "Tamil Nadu" },
                    "636": { city: "Salem", state: "Tamil Nadu" },
                    "700": { city: "Kolkata", state: "West Bengal" },
                    "711": { city: "Howrah", state: "West Bengal" },
                    "713": { city: "Durgapur", state: "West Bengal" },
                    "734": { city: "Siliguri", state: "West Bengal" },
                    "800": { city: "Patna", state: "Bihar" },
                    "823": { city: "Gaya", state: "Bihar" },
                    "812": { city: "Bhagalpur", state: "Bihar" },
                    "842": { city: "Muzaffarpur", state: "Bihar" },
                    "834": { city: "Ranchi", state: "Jharkhand" },
                    "831": { city: "Jamshedpur", state: "Jharkhand" },
                    "826": { city: "Dhanbad", state: "Jharkhand" },
                    "492": { city: "Raipur", state: "Chhattisgarh" },
                    "495": { city: "Bilaspur", state: "Chhattisgarh" },
                    "751": { city: "Bhubaneswar", state: "Odisha" },
                    "753": { city: "Cuttack", state: "Odisha" },
                    "781": { city: "Guwahati", state: "Assam" },
                    "248": { city: "Dehradun", state: "Uttarakhand" },
                    "180": { city: "Jammu", state: "Jammu & Kashmir" },
                    "190": { city: "Srinagar", state: "Jammu & Kashmir" },
                    "121": { city: "Faridabad", state: "Haryana" },
                    "122": { city: "Gurgaon", state: "Haryana" },
                    "133": { city: "Ambala", state: "Haryana" }
                };

                let matched = pinPrefixMap[p4] || pinPrefixMap[p3];
                if (matched) {
                    if (!c) c = matched.city;
                    if (!s) s = matched.state;
                } else {
                    const num2 = parseInt(p2, 10);
                    let fallbackState = "";
                    if (num2 === 11) fallbackState = "Delhi";
                    else if (num2 >= 12 && num2 <= 13) fallbackState = "Haryana";
                    else if (num2 >= 14 && num2 <= 15) fallbackState = "Punjab";
                    else if (num2 === 16) fallbackState = "Punjab";
                    else if (num2 === 17) fallbackState = "Himachal Pradesh";
                    else if (num2 >= 18 && num2 <= 19) fallbackState = "Jammu & Kashmir";
                    else if (num2 >= 20 && num2 <= 28) fallbackState = "Uttar Pradesh";
                    else if (num2 >= 30 && num2 <= 34) fallbackState = "Rajasthan";
                    else if (num2 >= 36 && num2 <= 39) fallbackState = "Gujarat";
                    else if (num2 >= 40 && num2 <= 44) fallbackState = "Maharashtra";
                    else if (num2 >= 45 && num2 <= 48) fallbackState = "Madhya Pradesh";
                    else if (num2 === 49) fallbackState = "Chhattisgarh";
                    else if (num2 >= 50 && num2 <= 53) fallbackState = "Andhra Pradesh/Telangana";
                    else if (num2 >= 56 && num2 <= 59) fallbackState = "Karnataka";
                    else if (num2 >= 60 && num2 <= 64) fallbackState = "Tamil Nadu";
                    else if (num2 >= 67 && num2 <= 69) fallbackState = "Kerala";
                    else if (num2 >= 70 && num2 <= 74) fallbackState = "West Bengal";
                    else if (num2 >= 75 && num2 <= 77) fallbackState = "Odisha";
                    else if (num2 === 78) fallbackState = "Assam";
                    else if (num2 === 79) fallbackState = "North Eastern State";
                    else if (num2 >= 80 && num2 <= 85) fallbackState = "Bihar/Jharkhand";

                    if (fallbackState && !s) {
                        s = fallbackState;
                    }
                }
            }

            let formatted = "";
            if (c && s) {
                formatted = `${c}, ${s}`;
                if (p) formatted += `, ${p}`;
            } else if (c) {
                formatted = `${c}`;
                if (p) formatted += `, ${p}`;
            } else if (s) {
                formatted = `${s}`;
                if (p) formatted += `, ${p}`;
            } else if (p) {
                formatted = `${p}`;
            }
            if (a) {
                if (formatted) formatted += `, ${a}`;
                else formatted = a;
            }

            return formatted || "Location Hidden";
        };

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

        // Filter helper to keep only purchased leads
        const isPurchased = (item: any) => {
            const state = getLeadState(item).toLowerCase()
            return purchasedStates.includes(state)
        }

        const filteredQuotes = latestQuotes.filter(isPurchased)
        const filteredSells = latestSells.filter(isPurchased)
        const filteredExchanges = latestExchanges.filter(isPurchased)
        const filteredBuys = latestBuys.filter(isPurchased)
        const filteredWizards = latestWizards.filter(isPurchased)

        let feed = [
            ...filteredQuotes.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                return {
                    _id: plainItem._id,
                    createdAt: plainItem.createdAt,
                    type: 'quote',
                    customerName: item.contact?.name || "Customer",
                    customerPhone: item.contact?.phone || "N/A",
                    vehicleInfo: `${item.year || ''} ${item.brand || ''} ${item.model || ''} (${item.vehicleType || ''})`.trim(),
                    location: formatLocation(item)
                };
            }),
            ...filteredSells.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                return {
                    _id: plainItem._id,
                    createdAt: plainItem.createdAt,
                    type: 'sell',
                    customerName: item.name || "Customer",
                    customerPhone: item.phone || "N/A",
                    vehicleInfo: `${item.registrationYear || ''} ${item.customBrand || item.brand || ''} ${item.customModel || item.model || ''}`.trim(),
                    location: formatLocation(item)
                };
            }),
            ...filteredExchanges.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                return {
                    _id: plainItem._id,
                    createdAt: plainItem.createdAt,
                    type: 'exchange',
                    customerName: item.customerName || "Customer",
                    customerPhone: item.customerPhone || "N/A",
                    vehicleInfo: `Old: ${item.oldVehicleBrand || ''} ${item.oldVehicleModel || ''} -> New: ${item.newVehicleBrand || ''}`.trim(),
                    location: formatLocation(item)
                };
            }),
            ...filteredBuys.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                return {
                    _id: plainItem._id,
                    createdAt: plainItem.createdAt,
                    type: 'buy',
                    customerName: item.customerName || "Customer",
                    customerPhone: item.customerPhone || "N/A",
                    vehicleInfo: `Looking for: ${item.customBrand || item.vehicleBrand || ''} ${item.customModel || item.vehicleModel || ''}`.trim(),
                    location: formatLocation(item)
                };
            }),
            ...filteredWizards.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                const serviceType = plainItem.serviceType || plainItem.type || "wizard";
                let linkType = serviceType;
                if (serviceType === "scrap") { linkType = "quote"; }
                if (serviceType === "sell" || serviceType === "wizard-sell") { linkType = "sell"; }
                if (serviceType === "buy" || serviceType === "wizard-buy") { linkType = "buy"; }
                
                let vehicleInfoStr = serviceType === "buy" ? `Looking for: ${item.desiredCompany || ''} ${item.desiredModel || ''}` : 
                                   (serviceType === "scrap" && item.category === "scrap_and_buy") ? `Scrap: ${item.brand || ''} ${item.model || ''} | Buy: ${item.desiredCompany || ''} ${item.desiredModel || ''}` :
                                   `${item.year || ''} ${item.brand || ''} ${item.model || ''}`;

                return {
                    _id: plainItem._id,
                    createdAt: plainItem.createdAt,
                    type: linkType,
                    customerName: item.name || "Customer",
                    customerPhone: item.phone || "N/A",
                    vehicleInfo: vehicleInfoStr.trim(),
                    location: formatLocation(item)
                };
            })
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(feed, { status: 200 })
    } catch (error: any) {
        console.error("Fetch RVSF Leads Error:", error)
        return NextResponse.json(
            { message: "Failed to fetch leads" },
            { status: 500 }
        )
    }
}
