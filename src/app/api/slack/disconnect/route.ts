import { NextResponse } from "next/server";
import { deleteInstallation } from "@/lib/db/redis";
import { getSessionId, clearSession } from "@/lib/session";
import { config } from "@/lib/config";

export async function GET(): Promise<NextResponse> {
    const sessionId = await getSessionId();
    await deleteInstallation(sessionId);
    await clearSession();

    return NextResponse.redirect(new URL("/", config.app.url));
}
