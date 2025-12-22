import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { SESSION_COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/constants";

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
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, COOKIE_OPTIONS);
}

export async function clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}
