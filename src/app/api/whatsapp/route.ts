import { NextResponse, NextRequest } from "next/server";
import { getOrdersByPhone, incrementUserQueryCount, OrderData } from "@/lib/firestore-server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

// ── Helper: Send a WhatsApp text message via Meta Cloud API ─

async function sendWhatsAppMessage(to: string, body: string): Promise<boolean> {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
        console.error("WhatsApp credentials not configured (WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID)");
        return false;
    }

    try {
        const res = await fetch(
            `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to,
                    type: "text",
                    text: { body },
                }),
            }
        );

        if (!res.ok) {
            const err = await res.text();
            console.error("WhatsApp send failed:", res.status, err);
            return false;
        }
        return true;
    } catch (error) {
        console.error("WhatsApp send error:", error);
        return false;
    }
}

// ── Helper: Build the bilingual order-status reply ──────────

function buildOrderReply(phone: string, orders: OrderData[], isNewUser: boolean): string {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://skumarantailors.vercel.app";
    const trackingLink = `${siteUrl}/tracking?phone=${encodeURIComponent(phone)}`;

    if (orders.length === 0) {
        if (isNewUser) {
            return (
                `🧵 *எஸ் குமரன் டெய்லர்ஸ் | S Kumaran Tailors*\n\n` +
                `வணக்கம்! 🙏\nஉங்கள் புதிய ஆர்டர் விவரங்கள் இன்னும் பதிவாகவில்லை. நீங்கள் சமீபத்தில் ஆர்டர் கொடுத்திருந்தால், தயவுசெய்து ஒரு நாள் பொறுத்திருங்கள். கடை உங்கள் ஆர்டரை பதிவு செய்த பிறகு மீண்டும் சரிபார்க்கலாம்.\n\n` +
                `Hello! Your order details are not yet recorded. If you recently placed an order, please give us a day to update our system. You can check your status again tomorrow.\n\n` +
                `📞 தொடர்புக்கு / Contact: +91 94428 98544\n` +
                `🌐 வலைதளம் / Website: ${siteUrl}`
            );
        }
        return (
            `🧵 *எஸ் குமரன் டெய்லர்ஸ் | S Kumaran Tailors*\n\n` +
            `வணக்கம்! 🙏\n` +
            `Hello from S Kumaran Tailors!\n\n` +
            `${phone} என்ற எண்ணில் ஆர்டர்கள் எதுவும் இல்லை.\n` +
            `We couldn't find any orders under the number ${phone}.\n\n` +
            `சமீபத்தில் ஆர்டர் செய்திருந்தால், கடையை நேரடியாக தொடர்பு கொள்ளுங்கள்.\n` +
            `If you recently placed an order, please contact us directly.\n\n` +
            `📞 தொடர்புக்கு / Contact: +91 94428 98544\n` +
            `🌐 வலைதளம் / Website: ${siteUrl}`
        );
    }

    let text =
        `🧵 *எஸ் குமரன் டெய்லர்ஸ் | S Kumaran Tailors* ✂️\n\n` +
        `வணக்கம்! உங்கள் ஆர்டர் நிலை:\n` +
        `Hello! Here is the status of your orders:\n\n`;

    orders.forEach((order, index) => {
        const emoji =
            order.status === "Ready" ? "✅" :
            order.status === "Delivered" ? "🛍️" : "⏳";

        text += `*ஆர்டர் / Order #${order.orderId}* — ${order.garmentType}\n`;
        text += `நிலை / Status: ${emoji} ${order.status}\n`;
        text += `டெலிவரி தேதி / Due Date: 📅 ${order.targetDeliveryDate}\n`;

        if (index < orders.length - 1) {
            text += `\n---\n\n`;
        }
    });

    text += `\n\n📱 ஆர்டர் நிலையை இங்கே பாருங்கள் / Track your order online:\n${trackingLink}\n`;
    text += `📞 தொடர்புக்கு / Contact: +91 94428 98544\n\n`;
    text += `எஸ் குமரன் டெய்லர்ஸை தேர்ந்தெடுத்ததற்கு நன்றி!\nThank you for choosing S Kumaran Tailors! 🙏`;

    return text;
}

// ────────────────────────────────────────────────────────────
// GET — Webhook Verification (Meta sends this during setup)
// ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === "subscribe" && token === verifyToken) {
        console.log("✅ WhatsApp webhook verified");
        return new NextResponse(challenge, { status: 200 });
    }

    console.warn("❌ WhatsApp webhook verification failed");
    return new NextResponse("Forbidden", { status: 403 });
}

// ────────────────────────────────────────────────────────────
// POST — Incoming WhatsApp Messages (webhook callback)
// ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Meta always wraps the payload in { object, entry[] }
        if (body.object !== "whatsapp_business_account") {
            return NextResponse.json({ status: "ignored" }, { status: 200 });
        }

        // Process each entry/change
        for (const entry of body.entry || []) {
            for (const change of entry.changes || []) {
                const value = change.value;
                if (!value?.messages) continue;

                for (const message of value.messages) {
                    // We respond to any incoming message (text, image, etc.)
                    const senderPhone = message.from; // e.g. "919442898544"

                    // Normalize the phone number for Firestore lookup
                    // WhatsApp sends without "+", Firestore stores with "+91"
                    const normalizedPhone = senderPhone.startsWith("+")
                        ? senderPhone
                        : `+${senderPhone}`;

                    console.log(`📩 WhatsApp message from ${normalizedPhone}`);

                    // 1. Increment monitoring query count and check if new user
                    const isNewUser = await incrementUserQueryCount(normalizedPhone);

                    // 2. Lookup orders
                    const orders = await getOrdersByPhone(normalizedPhone);

                    // 3. Build and send reply
                    const replyText = buildOrderReply(normalizedPhone, orders, isNewUser);
                    await sendWhatsAppMessage(senderPhone, replyText);

                    console.log(`✅ Replied to ${normalizedPhone} with ${orders.length} order(s)`);
                }
            }
        }

        // Always return 200 to acknowledge the webhook
        return NextResponse.json({ status: "ok" }, { status: 200 });

    } catch (error) {
        console.error("WhatsApp Webhook Error:", error);
        // Still return 200 to prevent Meta from retrying
        return NextResponse.json({ status: "error" }, { status: 200 });
    }
}
