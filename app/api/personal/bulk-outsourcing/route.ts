import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import BulkOutsourcing from "@/models/BulkOutsourcing";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "partner") {
            return NextResponse.json(
                { message: "Unauthorized: Only partners can submit bulk data" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { entries } = body;

        if (!entries || !Array.isArray(entries) || entries.length === 0) {
            return NextResponse.json(
                { message: "Invalid payload: 'entries' must be a non-empty array" },
                { status: 400 }
            );
        }

        // Validate individual entries (basic validation)
        for (const entry of entries) {
            if (!entry.vehicleType || !entry.weight || !entry.registrationNumber) {
                return NextResponse.json(
                    { message: "Invalid payload: Each entry must contain 'vehicleType', 'weight', and 'registrationNumber'" },
                    { status: 400 }
                );
            }
        }

        await connectToDatabase();

        const newSubmission = new BulkOutsourcing({
            partnerId: (session.user as any).id,
            partnerName: session.user?.name || "Unknown Partner",
            partnerEmail: session.user?.email || "Unknown Email",
            entries: entries,
            status: "pending"
        });

        await newSubmission.save();

        return NextResponse.json(
            { message: "Bulk outsourcing entries submitted successfully!", id: newSubmission._id },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Bulk Outsourcing Submission Error:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "partner") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        await connectToDatabase();

        const partnerId = (session.user as any).id;

        // Fetch all submissions for this specific partner
        const submissions = await BulkOutsourcing.find({ partnerId })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, data: submissions });

    } catch (error: any) {
        console.error("Failed to fetch partner submissions:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch submissions" },
            { status: 500 }
        );
    }
}
