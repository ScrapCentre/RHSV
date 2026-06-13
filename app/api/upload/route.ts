import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { validateImageFile } from "@/lib/validation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { rateLimiters } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 30 uploads per IP per hour
    const limited = await rateLimiters.upload(req)
    if (limited) return limited

    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || typeof file === "string") {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Strict file validation: MIME type + size (max 5 MB)
    const fileCheck = validateImageFile(file, "Vehicle image");
    if (!fileCheck.valid) {
      return NextResponse.json({ message: fileCheck.message }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9.\-_]/g, "");
    const publicId = `veh_img_${Date.now()}_${cleanName}`;

    console.log(`[Vehicle Upload] Uploading image to Cloudinary: ${cleanName}`);
    const secureUrl = await uploadToCloudinary(
      buffer,
      "autoscrap/vehicles",
      publicId,
      "image"
    );
    console.log(`[Vehicle Upload] Upload completed. URL: ${secureUrl}`);

    return NextResponse.json({
      success: true,
      url: secureUrl,
    });

  } catch (error: any) {
    console.error("[Vehicle Upload API] Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
