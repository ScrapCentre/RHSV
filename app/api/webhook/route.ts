import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import WhatsAppMessage from "@/models/WhatsAppMessage";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// GET → webhook verification
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const mode = searchParams.get("hub.mode");
        const token = searchParams.get("hub.verify_token");
        const challenge = searchParams.get("hub.challenge");

        if (mode && token) {
            if (mode === "subscribe" && token === VERIFY_TOKEN) {
                console.log("Webhook verified successfully!");
                return new Response(challenge, { status: 200 });
            } else {
                console.warn("Webhook verification failed: Invalid token");
                return new Response("Verification failed", { status: 403 });
            }
        }

        return new Response("Bad Request", { status: 400 });
    } catch (error) {
        console.error("Error in webhook verification:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

// POST → receive WhatsApp messages
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Verify this is a WhatsApp status or message update
        if (body.object !== "whatsapp_business_account") {
            return NextResponse.json({ error: "Invalid object type" }, { status: 400 });
        }

        console.log("Incoming WhatsApp Webhook:", JSON.stringify(body, null, 2));

        await connectToDatabase();

        // Parse messages
        const entries = body.entry;
        if (entries && entries.length > 0) {
            for (const entry of entries) {
                const changes = entry.changes;
                if (changes && changes.length > 0) {
                    for (const change of changes) {
                        const value = change.value;
                        if (value.messages && value.messages.length > 0) {
                            for (const msg of value.messages) {
                                // Extract message data
                                const from = msg.from;
                                const messageId = msg.id;
                                const type = msg.type;
                                let content: any = {};

                                if (type === "text") {
                                    content = { text: msg.text.body };
                                } else if (type === "image") {
                                    content = { id: msg.image.id, caption: msg.image.caption };
                                } else {
                                    content = { [type]: msg[type] };
                                }

                                // Save to MongoDB
                                try {
                                    await WhatsAppMessage.create({
                                        from,
                                        messageId,
                                        type,
                                        content,
                                        rawBody: body,
                                        timestamp: new Date(msg.timestamp * 1000),
                                    });
                                    console.log(`Message ${messageId} saved to database.`);
                                } catch (dbError: any) {
                                    // Handle duplicate message IDs (retries from Meta)
                                    if (dbError.code === 11000) {
                                        console.log(`Message ${messageId} already exists in database.`);
                                    } else {
                                        console.error("Database save error:", dbError);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Error processing WhatsApp webhook:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error instanceof Error ? error.message : "No message available" },
            { status: 500 }
        );
    }
}

