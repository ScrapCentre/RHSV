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

    // Sanitize body fields to match their expected types in Zod schema
    const sanitizedBody = { ...body };

    // 1. Remove empty strings for fields that shouldn't be empty strings (or should be optional/undefined)
    if (sanitizedBody.pincode === "") {
      delete sanitizedBody.pincode;
    }
    if (sanitizedBody.regNo === "") {
      delete sanitizedBody.regNo;
    }

    // 2. Format year (should be integer number or undefined/deleted)
    if (typeof sanitizedBody.year === "string") {
      const yrVal = parseInt(sanitizedBody.year, 10);
      if (!isNaN(yrVal) && yrVal >= 1900) {
        sanitizedBody.year = yrVal;
      } else {
        // If year is "Older" or not a valid number, delete it so it falls back to optional/undefined
        delete sanitizedBody.year;
      }
    } else if (sanitizedBody.year === null || sanitizedBody.year === "") {
      delete sanitizedBody.year;
    }

    // 3. Format kms (should be number or undefined/deleted)
    if (typeof sanitizedBody.kms === "string") {
      if (sanitizedBody.kms === "") {
        delete sanitizedBody.kms;
      } else {
        const kmsVal = parseFloat(sanitizedBody.kms);
        if (!isNaN(kmsVal)) {
          sanitizedBody.kms = kmsVal;
        } else {
          delete sanitizedBody.kms;
        }
      }
    } else if (sanitizedBody.kms === null) {
      delete sanitizedBody.kms;
    }

    // 4. Format weight (z.union([z.string(), z.number()]).optional())
    if (sanitizedBody.weight === "") {
      delete sanitizedBody.weight;
    }

    // 5. Clean up other optional string fields if they are empty strings
    const optionalStringFields = [
      "brand",
      "model",
      "address",
      "city",
      "state",
      "buyNew",
      "desiredCompany",
      "desiredModel",
      "carPhoto",
      "ownerName",
    ];
    for (const field of optionalStringFields) {
      if (sanitizedBody[field] === "") {
        delete sanitizedBody[field];
      }
    }

    // Validate input fields
    const parsed = wizardLeadSchema.safeParse(sanitizedBody);
    if (!parsed.success) {
      console.error("Wizard lead validation failed. Original body:", body, "Sanitized body:", sanitizedBody, "Error details:", parsed.error.format());
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
      ownerName: data.ownerName,
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
