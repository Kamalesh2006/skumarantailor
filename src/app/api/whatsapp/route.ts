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

        if (orders.length === 0) {
            return new NextResponse(
                `Hello from S Kumaran Tailors! 🧵 We couldn't find any orders under the number ${phoneNumber}. If you recently placed an order, please contact the shop directly at +91 94428 98544.`,
                { status: 200, headers: { "Content-Type": "text/plain", "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
            );
        }

        // Format orders for WhatsApp text
        let responseText = `*Hello from S Kumaran Tailors!* ✂️\nHere is the status of your current orders:\n\n`;

        orders.forEach((order, index) => {
            const statusEmoji = order.status === "Ready" ? "✅" : (order.status === "Delivered" ? "🛍️" : "⏳");
            responseText += `*Order #${order.orderId}* - ${order.garmentType}\n`;
            responseText += `Status: ${statusEmoji} ${order.status}\n`;
            responseText += `Due Date: 📅 ${order.targetDeliveryDate}\n`;

            if (index < orders.length - 1) {
                responseText += `\n---\n\n`;
            }
        });

        responseText += `\nTo view full details, visit our website!\nThank you for choosing S Kumaran Tailors. 🙏`;

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
