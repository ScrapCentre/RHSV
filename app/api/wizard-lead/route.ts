import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import WizardLead from "@/models/WizardLead";
import User from "@/models/User";
import { wizardLeadSchema, formatZodError } from "@/lib/validation";
import { rateLimiters } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 30 leads per IP per hour
    const limited = await rateLimiters.wizardLead(req)
    if (limited) return limited

    await connectToDatabase();

    const session = await getServerSession(authOptions);
    let userId = session ? (session.user as any).id : undefined;

    const body = await req.json();

    // Validate input fields
    const parsed = wizardLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Fallback: look up user by phone if session not yet propagated
    if (!userId && data.phone) {
      const formattedPhone = data.phone.startsWith("+") ? data.phone : `+91${data.phone}`;
      const existingUser = await User.findOne({ phone: formattedPhone });
      if (existingUser) {
        userId = existingUser._id.toString();
      }
    }

    // Determine category
    let category = data.serviceType + "_only";
    if (data.serviceType === "scrap" && body.buyNew === "yes") {
      category = "scrap_and_buy";
    }

    const newLead = new WizardLead({
      serviceType: data.serviceType,
      category,
      userId,
      regNo: data.regNo,
      brand: data.brand,
      model: data.model,
      year: data.year,
      weight: data.weight,
      kms: data.kms,
      fuel: Array.isArray(data.fuel) ? data.fuel : [data.fuel].filter(Boolean),
      name: data.name,
      phone: data.phone,
      address: data.address,
      pincode: data.pincode,
      city: data.city,
      state: data.state,
      desiredCompany: data.desiredCompany,
      desiredModel: data.desiredModel,
      carPhoto: data.carPhoto,
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
