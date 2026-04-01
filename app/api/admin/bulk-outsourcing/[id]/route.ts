import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import BulkOutsourcing from "@/models/BulkOutsourcing";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json(
                { message: "Unauthorized: Only admins can view bulk submissions" },
                { status: 403 }
            );
        }

        await connectToDatabase();

        const submission = await BulkOutsourcing.findById(params.id);

        if (!submission) {
            return NextResponse.json(
                { message: "Submission not found" },
                { status: 404 }
            );
        }

        if (submission.status === "pending") {
            submission.status = "reviewed";
            await submission.save();
        }

        return NextResponse.json(
            { success: true, count: submission.entries?.length || 0, data: submission },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Bulk Outsourcing Fetch Single Error:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json(
                { message: "Unauthorized: Only admins can perform this action" },
                { status: 403 }
            );
        }

        await connectToDatabase();

        const body = await req.json();
        const { status } = body;

        if (!["pending", "reviewed", "approved", "rejected"].includes(status)) {
            return NextResponse.json(
                { message: "Invalid status" },
                { status: 400 }
            );
        }

        const submission = await BulkOutsourcing.findByIdAndUpdate(
            params.id,
            { status, updatedAt: new Date() },
            { new: true }
        );

        if (!submission) {
            return NextResponse.json(
                { message: "Submission not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: submission },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Bulk Outsourcing Update Error:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json(
                { message: "Unauthorized: Only admins can perform this action" },
                { status: 403 }
            );
        }

        await connectToDatabase();

        const submission = await BulkOutsourcing.findByIdAndDelete(params.id);

        if (!submission) {
            return NextResponse.json(
                { message: "Submission not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Submission deleted successfully" },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Bulk Outsourcing Delete Error:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}
