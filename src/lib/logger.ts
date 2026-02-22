type LogLevel = "info" | "error" | "warn" | "debug";

/**
 * A shared logger utility.
 * In a browser environment, it sends the logs to the /api/logs endpoint asynchronously.
 * It also logs to the browser console for immediate developer feedback.
 */
class Logger {
    private async sendLog(level: LogLevel, message: string, details?: unknown) {
        // Always log to the local console
        if (level === "error") {
            console.error(`[${level.toUpperCase()}] ${message}`, details || "");
        } else if (level === "warn") {
            console.warn(`[${level.toUpperCase()}] ${message}`, details || "");
        } else {
            console.log(`[${level.toUpperCase()}] ${message}`, details || "");
        }

        // Emit to the backend if we are in the browser
        if (typeof window !== "undefined") {
            try {
                await fetch("/api/logs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ level, message, details }),
                });
            } catch (err) {
                // Silently fail if the logging endpoint itself drops
                console.error("Logger failed to reach /api/logs", err);
            }
        }
    }

    info(message: string, details?: unknown) {
        this.sendLog("info", message, details);
    }

    error(message: string, details?: unknown) {
        this.sendLog("error", message, details);
    }

    warn(message: string, details?: unknown) {
        this.sendLog("warn", message, details);
    }

    debug(message: string, details?: unknown) {
        this.sendLog("debug", message, details);
    }
}

export const logger = new Logger();
