import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { config } from "@/lib/config";

const SESSION_COOKIE_NAME = "plaude_session";

export async function getSessionId(): Promise<string> {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    console.log("[getSessionId] Cookie store all cookies:", cookieStore.getAll());
    console.log(`[getSessionId] Looking for cookie: ${SESSION_COOKIE_NAME}`);
    console.log(`[getSessionId] Found session ID: ${sessionId || "NONE - generating new"}`);

    if (!sessionId) {
        sessionId = uuidv4();
        console.log(`[getSessionId] Generated new session ID: ${sessionId}`);
    }

    return sessionId;
}

export async function setSessionCookie(sessionId: string): Promise<void> {
    const cookieStore = await cookies();

    const cookieOptions = {
        httpOnly: true,
        secure: config.app.node_env === "production",
        sameSite: "lax" as const,
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
    };

    console.log(`[setSessionCookie] Setting cookie: ${SESSION_COOKIE_NAME}`);
    console.log(`[setSessionCookie] Session ID: ${sessionId}`);
    console.log(`[setSessionCookie] Options:`, cookieOptions);

    cookieStore.set(SESSION_COOKIE_NAME, sessionId, cookieOptions);

    console.log(`[setSessionCookie] Cookie set successfully`);
}

export async function clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}
