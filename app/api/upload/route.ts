import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || typeof file === "string") {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Validate file type is image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "Only image attachments are allowed" }, { status: 400 });
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
