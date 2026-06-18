import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import WizardLead from "@/models/WizardLead";
import ExchangeVehicle from "@/models/ExchangeVehicle";
import BuyVehicle from "@/models/BuyVehicle";
import User from "@/models/User";
import ChatThread from "@/models/ChatThread";
import PersonalChatThread from "@/models/PersonalChatThread";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    await connectToDatabase();

    const userId = (session.user as any).id;

    // Fetch user details for phone fallback matching (handles leads submitted before log in)
    const userDoc = await User.findById(userId).lean();
    const userPhone = (userDoc as any)?.phone;
    const rawPhone = userPhone?.replace(/^\+91/, '');

    // Standard query logic matching the profile page
    const query = {
      $or: [
        { userId: userId },
        { userId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null }
      ].filter(q => q.userId !== null)
    };

    const [exchangeRequests, buyRequests, wizardLeads] = await Promise.all([
      ExchangeVehicle.find(query).sort({ createdAt: -1 }).lean(),
      BuyVehicle.find(query).sort({ createdAt: -1 }).lean(),
      WizardLead.find({
        $or: [
          { userId: userId },
          ...(userPhone ? [{ phone: userPhone }] : []),
          ...(rawPhone ? [{ phone: rawPhone }] : [])
        ]
      }).sort({ createdAt: -1 }).lean(),
    ]);

    // Format all requests into a unified structure
    const allRequests: any[] = [
      ...exchangeRequests.map((e: any) => ({
        ...e,
        id: e._id.toString(),
        type: 'exchange',
        brand: e.oldVehicleBrand || "",
        model: e.oldVehicleModel || "",
        regNo: e.oldVehicleRegistration || "",
      })),
      ...buyRequests.map((b: any) => ({
        ...b,
        id: b._id.toString(),
        type: 'buy',
        brand: b.vehicleBrand || "",
        model: b.vehicleModel || "",
        regNo: "",
      })),
      ...wizardLeads.map((w: any) => {
        let type = 'scrap';
        if (w.category === 'scrap_and_buy') type = 'scrap-buy';
        else if (w.serviceType === 'sell') type = 'wizard-sell';
        else if (w.serviceType === 'buy') type = 'wizard-buy';

        return {
          ...w,
          id: w._id.toString(),
          type,
          brand: w.brand || w.desiredCompany || "",
          model: w.model || w.desiredModel || "",
          regNo: w.regNo || "",
        };
      }),
    ];

    if (allRequests.length === 0) {
      return NextResponse.json({ authenticated: true, lead: null }, { status: 200 });
    }

    // Sort by createdAt descending to get the latest one
    allRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latestLead = allRequests[0];

    // Check if a chat thread is available (either RVSF ChatThread or PersonalChatThread)
    const [chatThread, personalChatThread] = await Promise.all([
      ChatThread.findOne({ leadId: latestLead.id }).lean(),
      PersonalChatThread.findOne({ leadId: latestLead.id }).lean()
    ]);

    const activeChat = chatThread || personalChatThread;
    const chatThreadId = activeChat ? (activeChat as any)._id.toString() : null;

    let latestChatMessage = null;
    if (activeChat && activeChat.messages && activeChat.messages.length > 0) {
      // Get the last message in chronological order
      const sortedMessages = [...activeChat.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const lastMsg = sortedMessages[sortedMessages.length - 1];
      latestChatMessage = {
        message: lastMsg.message,
        sender: lastMsg.sender,
        createdAt: lastMsg.createdAt
      };
    }

    return NextResponse.json({
      authenticated: true,
      lead: {
        id: latestLead.id,
        type: latestLead.type,
        status: latestLead.status,
        brand: latestLead.brand,
        model: latestLead.model,
        regNo: latestLead.regNo,
        createdAt: latestLead.createdAt,
        chatThreadId,
        latestChatMessage,
        ekycStatus: latestLead.ekycStatus || 'pending'
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching latest lead:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
