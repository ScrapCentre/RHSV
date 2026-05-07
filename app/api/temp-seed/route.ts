import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectToDatabase();
    
    const email = "scrapcentreadmin@gmail.com";
    const password = "scrapcentre@789";
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { 
        email, 
        password: hashedPassword, 
        role: "admin", 
        name: "Admin",
        provider: "credentials"
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: "Admin created/updated successfully",
      user: { email: updatedUser.email, role: updatedUser.role }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
