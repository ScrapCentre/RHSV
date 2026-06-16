import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RateLimit from "@/models/RateLimit";

// One-time endpoint to clear admin lockout from the database.
// DELETE after use for security.
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    
    // Simple secret check to prevent unauthorized access
    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        
        // Clear all admin lockout and attempt records
        const result = await RateLimit.deleteMany({
            key: { $regex: /^admin-(lockout|attempts):/ }
        });

        return NextResponse.json({ 
            success: true, 
            message: `Cleared ${result.deletedCount} lockout/attempt records.`,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
