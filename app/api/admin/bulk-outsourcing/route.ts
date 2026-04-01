import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import BulkOutsourcing from "@/models/BulkOutsourcing";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json(
                { message: "Unauthorized: Only admins can view bulk submissions" },
                { status: 403 }
            );
        }

        await connectToDatabase();

        const submissions = await BulkOutsourcing.find({ status: { $ne: "approved" } }).sort({ createdAt: -1 });

        return NextResponse.json(
            { success: true, count: submissions.length, data: submissions },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Bulk Outsourcing Fetch Error:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}
