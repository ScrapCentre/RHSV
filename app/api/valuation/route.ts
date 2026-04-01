import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import mongoose from "mongoose"
import Valuation from "@/models/Valuation"
import Setting from "@/models/Setting"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const body = await req.json()

        // Basic validation
        if (!body.vehicleType || !body.vehicleNumber || !body.contact?.phone) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            )
        }

        await connectToDatabase()

        // Fetch dynamic scrap rate per kg and pickup charge per km
        const [scrapSetting, pickupSetting] = await Promise.all([
            Setting.findOne({ key: "scrapPricePerKg" }),
            Setting.findOne({ key: "pickupChargePerKm" })
        ])
        const scrapPricePerKg = scrapSetting ? scrapSetting.value : 25 // Fallback to 25/kg
        const pickupChargePerKm = pickupSetting ? pickupSetting.value : 5 // Fallback to 5/km

        // Calculate estimated value (Weight is in tons. 1 Ton = 1000 Kg)
        const weightInTons = parseFloat(body.vehicleWeight) || 0;
        const estimatedValue = weightInTons * 1000 * scrapPricePerKg;

        // -------------- GOOGLE MATRIX DISTANCE CALCULATION --------------
        let distanceInKm = 0;
        let pickupCost = 0;

        try {
            // Get all B2B Partners to act as collection centers (destinations)
            const B2BPartner = require("@/models/B2BPartner").default || mongoose.model("B2BPartner");
            const partners = await B2BPartner.find({ city: { $exists: true }, state: { $exists: true } });

            if (partners.length > 0 && body.address?.city && body.address?.state) {
                const origin = encodeURIComponent(`${body.address.city}, ${body.address.state}, ${body.address.pincode || ""}, India`);
                const destinations = partners.map((p: any) => encodeURIComponent(`${p.city}, ${p.state}, ${p.pincode || ""}, India`)).join("|");

                const apiKey = process.env.GOOGLE_MAPS_API_KEY;
                if (apiKey) {
                    const matrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destinations}&key=${apiKey}`;

                    const gRes = await fetch(matrixUrl);
                    const gData = await gRes.json();

                    if (gData.status === "OK" && gData.rows?.[0]?.elements) {
                        const elements = gData.rows[0].elements;
                        // Filter valid routes and get the minimum distance in meters
                        const validDistances = elements
                            .filter((el: any) => el.status === "OK")
                            .map((el: any) => el.distance.value);

                        if (validDistances.length > 0) {
                            const minDistanceMeters = Math.min(...validDistances);
                            distanceInKm = Math.round(minDistanceMeters / 1000); // Convert to KM

                            // Cost logic
                            if (distanceInKm <= 100) {
                                pickupCost = 0; // Free under 100 km
                            } else {
                                const extraDistance = distanceInKm - 100;
                                pickupCost = extraDistance * pickupChargePerKm;
                            }
                        }
                    }
                }
            }
        } catch (matrixError) {
            console.error("Error calculating distance matrix:", matrixError);
            // Defaulting gracefully silently if Google API fails
        }
        // -------------------------------------------------------------

        const valuationData = {
            ...body,
            estimatedValue, // Store the calculated real value
            pickupCost,
            distance: distanceInKm,
            userId: (session?.user as any)?.id || null, // Link to user if logged in
        }

        const valuation = await Valuation.create(valuationData)

        return NextResponse.json(
            {
                message: "Valuation request submitted successfully",
                id: valuation._id,
                estimatedValue,
                pickupCost,
                distance: distanceInKm,
                appliedPickupRate: pickupChargePerKm
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Valuation submission error:", error)
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}

