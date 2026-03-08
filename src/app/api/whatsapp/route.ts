import { NextResponse } from "next/server";
import { getOrdersByPhone, incrementUserQueryCount } from "@/lib/firestore";

export const revalidate = 0;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const phoneNumber = body.phoneNumber;

        if (!phoneNumber) {
            return NextResponse.json(
                { error: "phoneNumber is required in the JSON body." },
                { status: 400, headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
            );
        }

        // Atomically increment the query count for monitoring
        await incrementUserQueryCount(phoneNumber);

        // Fetch their orders
        const orders = await getOrdersByPhone(phoneNumber);

        // Build site URL from NEXT_PUBLIC env var or request headers
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://skumarantailors.vercel.app";
        const trackingLink = `${siteUrl}/tracking?phone=${encodeURIComponent(phoneNumber)}`;

        if (orders.length === 0) {
            return new NextResponse(
                `🧵 *எஸ் குமரன் டெய்லர்ஸ் | S Kumaran Tailors*\n\n` +
                `வணக்கம்! 🙏\n` +
                `Hello from S Kumaran Tailors!\n\n` +
                `${phoneNumber} என்ற எண்ணில் ஆர்டர்கள் எதுவும் இல்லை.\n` +
                `We couldn't find any orders under the number ${phoneNumber}.\n\n` +
                `சமீபத்தில் ஆர்டர் செய்திருந்தால், கடையை நேரடியாக தொடர்பு கொள்ளுங்கள்.\n` +
                `If you recently placed an order, please contact us directly.\n\n` +
                `📞 தொடர்புக்கு / Contact: +91 94428 98544\n` +
                `🌐 வலைதளம் / Website: ${siteUrl}`,
                { status: 200, headers: { "Content-Type": "text/plain", "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
            );
        }

        // Format orders for WhatsApp text (bilingual)
        let responseText =
            `🧵 *எஸ் குமரன் டெய்லர்ஸ் | S Kumaran Tailors* ✂️\n\n` +
            `வணக்கம்! உங்கள் ஆர்டர் நிலை:\n` +
            `Hello! Here is the status of your orders:\n\n`;

        orders.forEach((order, index) => {
            const statusEmoji = order.status === "Ready" ? "✅" : (order.status === "Delivered" ? "🛍️" : "⏳");
            responseText += `*ஆர்டர் / Order #${order.orderId}* - ${order.garmentType}\n`;
            responseText += `நிலை / Status: ${statusEmoji} ${order.status}\n`;
            responseText += `டெலிவரி தேதி / Due Date: 📅 ${order.targetDeliveryDate}\n`;

            if (index < orders.length - 1) {
                responseText += `\n---\n\n`;
            }
        });

        responseText += `\n\n📱 ஆர்டர் நிலையை இங்கே பாருங்கள் / Track your order online:\n${trackingLink}\n`;
        responseText += `📞 தொடர்புக்கு / Contact: +91 94428 98544\n\n`;
        responseText += `எஸ் குமரன் டெய்லர்ஸை தேர்ந்தெடுத்ததற்கு நன்றி!\nThank you for choosing S Kumaran Tailors! 🙏`;

        return new NextResponse(responseText, {
            status: 200,
            headers: { "Content-Type": "text/plain", "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" }
        });

    } catch (error) {
        console.error("WhatsApp API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error while resolving WhatsApp query." },
            { status: 500, headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
        );
    }
}
