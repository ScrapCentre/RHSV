import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import WizardLead from "@/models/WizardLead";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get session to link lead to user account (optional — guest leads still saved)
    const session = await getServerSession(authOptions);
    let userId = session ? (session.user as any).id : undefined;

    const body = await req.json();

    // Fallback: If session hasn't propagated yet (due to race condition immediately after OTP verification),
    // lookup the user by their phone number.
    if (!userId && body.phone) {
      const formattedPhone = body.phone.startsWith("+") ? body.phone : `+91${body.phone}`;
      const existingUser = await User.findOne({ phone: formattedPhone });
      if (existingUser) {
        userId = existingUser._id.toString();
      }
    }

    // Determine category based on serviceType and buyNew
    let category = body.serviceType + "_only";
    if (body.serviceType === "scrap" && body.buyNew === "yes") {
      category = "scrap_and_buy";
    }

    const newLead = new WizardLead({
      serviceType: body.serviceType,
      category,
      userId,
      regNo: body.regNo,
      brand: body.brand,
      model: body.model,
      year: body.year,
      weight: body.weight,
      kms: body.kms,
      fuel: Array.isArray(body.fuel) ? body.fuel : [body.fuel].filter(Boolean),
      name: body.name,
      phone: body.phone,
      address: body.address,
      pincode: body.pincode,
      desiredCompany: body.desiredCompany,
      desiredModel: body.desiredModel,
    });

    const savedLead = await newLead.save();

    return NextResponse.json(
      { message: "Lead saved successfully", lead: savedLead },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving wizard lead:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
