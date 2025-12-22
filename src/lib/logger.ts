type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
    [key: string]: unknown;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === "development";
    private logFailureCount = 0;
    private readonly MAX_FAILURES = 10;

    private log(level: LogLevel, message: string, context?: LogContext): void {
        try {
            const timestamp = new Date().toISOString();
            const logEntry = {
                timestamp,
                level,
                message,
                ...context,
            };

            // In development, use pretty console output
            if (this.isDevelopment) {
                const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
                const consoleMethod = level === "debug" ? "log" : level;
                console[consoleMethod](prefix, message, context || "");
                return;
            }

            console.log(JSON.stringify(logEntry));

            this.logFailureCount = 0;
        } catch (error) {
            this.logFailureCount++;

            try {
                console.error("Logger failed:", error);
            } catch {}
            if (this.logFailureCount >= this.MAX_FAILURES) {
            }
        }
    }

    debug(message: string, context?: LogContext): void {
        if (this.isDevelopment) {
            this.log("debug", message, context);
        }
    }

    info(message: string, context?: LogContext): void {
        this.log("info", message, context);
    }

    warn(message: string, context?: LogContext): void {
        this.log("warn", message, context);
    }
    error(message: string, context?: LogContext): void {
        this.log("error", message, context);
    }
}

export const logger = new Logger();
