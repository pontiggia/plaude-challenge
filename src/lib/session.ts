import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { config } from "@/lib/config";

const SESSION_COOKIE_NAME = "plaude_session";

export async function getSessionId(): Promise<string> {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
        sessionId = uuidv4();
    }

    return sessionId;
}

export async function setSessionCookie(sessionId: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: config.app.node_env === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
    });
}

export async function clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}
