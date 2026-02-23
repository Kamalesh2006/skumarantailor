import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Define the absolute path to the log file in the project root
const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");

// Helper to ensure the logs directory exists
function ensureLogDir() {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { level = "INFO", message = "", details = null } = body;

        ensureLogDir();

        const timestamp = new Date().toISOString();
        let detailsStr = "";

        if (details) {
            try {
                detailsStr = ` | Details: ${typeof details === "string" ? details : JSON.stringify(details)}`;
            } catch {
                detailsStr = ` | Details: [Unserializable Object]`;
            }
        }

        const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}${detailsStr}\n`;

        // Append to the local file
        fs.appendFileSync(LOG_FILE, logLine);

        return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } });
    } catch (error) {
        console.error("Failed to write to app.log:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } });
    }
}

export async function GET() {
    try {
        if (!fs.existsSync(LOG_FILE)) {
            return new NextResponse("No logs found. The application has not recorded any events yet.", {
                status: 200,
                headers: { "Content-Type": "text/plain", "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" }
            });
        }

        const logs = fs.readFileSync(LOG_FILE, "utf-8");

        return new NextResponse(logs, {
            status: 200,
            headers: { "Content-Type": "text/plain", "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" }
        });
    } catch (error) {
        console.error("Failed to read app.log:", error);
        return new NextResponse("Error reading log file.", { status: 500, headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } });
    }
}
